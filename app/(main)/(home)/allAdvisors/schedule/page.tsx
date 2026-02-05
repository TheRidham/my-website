'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getFirestore, collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { ChevronUp, ChevronDown, Clock, Video, MessageSquare, Minus, Plus, ChevronLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { notifyAdvisorScheduledSession } from '@/utils/email'
import { getFreeRangesForDate } from '@/utils/freeSlots'

// ─── Data ─────────────────────────────────────────────────────────────────────

// const AVAILABLE_TIMES = [
//   '9:00 AM',
//   '10:30 AM',
//   '12:00 PM',
//   '2:00 PM',
//   '3:30 PM',
//   '5:00 PM',
//   '6:30 PM',
// ]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const MIN_DURATION = 5
const MAX_DURATION = 360

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDays(count: number) {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    return {
      label: DAY_LABELS[d.getDay()],
      date: d.getDate(),
      dateString: d.toISOString().split('T')[0],
    }
  })
}

function formatDuration(min: number) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function formatTimeRange(from: Date, to: Date) {
  const fromStr = from.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  const toStr = to.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${fromStr} - ${toStr}`
}

// ─── Schedule Screen ──────────────────────────────────────────────────────────

export default function ScheduleScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const advisorId = searchParams.get('advisorId')
  const advisorName = searchParams.get('advisorName')

  const days = useMemo(() => getDays(7), [])
  const [dayIdx, setDayIdx] = useState(0)
  const [hour, setHour] = useState(9)
  const [minute, setMinute] = useState(0)
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM')
  const [sessionType, setSessionType] = useState<'call' | 'chat'>('call')
  const [duration, setDuration] = useState(30)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [freeSlots, setFreeSlots] = useState<Array<{ from: Date; to: Date }>>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch free slots when date changes
  useEffect(() => {
    if (!advisorId) return

    const targetDate = new Date(days[dayIdx].dateString)

    async function fetchSlots() {
      setSlotsLoading(true)
      try {
        const slots = await getFreeRangesForDate(advisorId as string, targetDate)
        setFreeSlots(slots)
      } catch (err) {
        console.error('Error fetching free slots:', err)
        setFreeSlots([])
      } finally {
        setSlotsLoading(false)
      }
    }

    fetchSlots()
  }, [dayIdx, advisorId, days])

  async function handleSchedule() {
    setError(null)
    const auth = getAuth()
    const user = auth.currentUser

    if (!user) {
      setError('Please sign in to schedule a session.')
      return
    }

    if (!advisorId) {
      setError('Advisor information is missing.')
      return
    }

    setLoading(true)

    try {
      // ── Build time window ──
      let h = hour
      if (period === 'PM' && h < 12) h += 12
      if (period === 'AM' && h === 12) h = 0

      const dateStr = days[dayIdx].dateString
      const from = new Date(
        `${dateStr}T${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
      )
      const to = new Date(from.getTime() + duration * 60 * 1000)

      // ── Check for past time ──
      const now = new Date()
      if (from < now) {
        setError('Cannot schedule a session for a past time. Please select a future date and time.')
        setLoading(false)
        return
      }

      const db = getFirestore()
      const fromTs = Timestamp.fromDate(from)
      const toTs = Timestamp.fromDate(to)

      // ── Conflict check ──
      const q = query(
        collection(db, 'scheduleSessions'),
        where('advisorId', '==', advisorId),
        where('status', 'in', ['scheduled', 'confirmed']),
        where('preferredWindow.from', '<', toTs)
      )

      const conflictSnap = await getDocs(q)

      const hasConflict = conflictSnap.docs.some((doc) => {
        const { from, to } = doc.data().preferredWindow
        return to.toMillis() > fromTs.toMillis()
      })

      if (hasConflict) {
        setError('This time slot is not available. Please choose a different time.')
        setLoading(false)
        return
      }

      // ── Create session ──
      await addDoc(collection(db, 'scheduleSessions'), {
        userId: user.uid,
        advisorId: advisorId,
        advisorName: advisorName || 'Advisor',
        type: sessionType,
        preferredWindow: {
          from: fromTs,
          to: toTs,
        },
        durationMinutes: duration,
        status: 'scheduled',
        notifiedBeforeStart: false,
        createdAt: Timestamp.now(),
      })

      // ── Notify advisor ──
      await notifyAdvisorScheduledSession(
        advisorName || 'Advisor',
        from.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        sessionType === 'call' ? 'Video Call' : 'Chat',
        from.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        to.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        })
      )

      // ── Success ──
      toast.success('Session scheduled successfully! 🎉', {
        duration: 4000,
      })
      router.push('/allAdvisors?scheduled=true')
    } catch (err) {
      console.error('Schedule error:', err)
      setError('Failed to schedule session. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4 text-sm font-medium text-primary"
          >
            <ChevronLeft size={18} />
            Back
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Schedule Session
          </h1>
          {advisorName && (
            <p className="mt-1 text-sm text-muted-foreground">
              with {advisorName}
            </p>
          )}
        </div>

        {/* Available Time Slots */}
        {/* <div className="mb-8">
          <label className="block text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
            Quick Time Slots
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {AVAILABLE_TIMES.map((time) => {
              const selected = selectedTimeSlot === time
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTimeSlot(time)}
                  className={`px-4 py-2 rounded-lg border-2 font-semibold whitespace-nowrap transition-all text-sm ${
                    selected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border'
                  }`}
                >
                  {time}
                </button>
              )
            })}
          </div>
        </div> */}

        {/* Session Type */}
        <div className="mb-8">
          <label className="block text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
            Session Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSessionType('call')}
              className={`p-4 rounded-lg border-2 font-semibold transition-all flex items-center justify-center gap-2 ${
                sessionType === 'call'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border'
              }`}
            >
              <Video size={18} />
              Video Call
            </button>
            <button
              onClick={() => setSessionType('chat')}
              className={`p-4 rounded-lg border-2 font-semibold transition-all flex items-center justify-center gap-2 ${
                sessionType === 'chat'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border'
              }`}
            >
              <MessageSquare size={18} />
              Chat
            </button>
          </div>
        </div>

        {/* Date Selection */}
        <div className="mb-8">
          <label className="block text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
            Select Date
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((day, idx) => {
              const sel = idx === dayIdx
              return (
                <button
                  key={day.dateString}
                  onClick={() => setDayIdx(idx)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 min-w-17.5 transition-all ${
                    sel
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border'
                  }`}
                >
                  <span className="text-xs font-semibold opacity-70 uppercase">
                    {day.label}
                  </span>
                  <span className="text-lg font-bold">{day.date}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Free Slots Display */}
        <div className="mb-8">
          <label className="block text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
            Available Slots
          </label>
          {slotsLoading ? (
            <div className="flex items-center justify-center h-16 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              Loading available slots...
            </div>
          ) : freeSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {freeSlots.map((slot, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    // Set time from the slot
                    const slotHour = slot.from.getHours()
                    const slotMinute = slot.from.getMinutes()
                    setHour(slotHour === 0 ? 12 : slotHour > 12 ? slotHour - 12 : slotHour)
                    setMinute(slotMinute)
                    setPeriod(slotHour >= 12 ? 'PM' : 'AM')
                    setSelectedTimeSlot(formatTimeRange(slot.from, slot.to))
                  }}
                  className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                    selectedTimeSlot === formatTimeRange(slot.from, slot.to)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary'
                  }`}
                >
                  {formatTimeRange(slot.from, slot.to)}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
              No available slots for this date. Please select another date.
            </div>
          )}
        </div>

        {/* Time Picker */}
        <div className="bg-card border-2 border-border rounded-lg p-6 mb-8">
          <label className="block text-xs font-semibold mb-4 uppercase tracking-wide text-muted-foreground">
            Select Time
          </label>
          <div className="flex items-center justify-center gap-4">
            {/* Hour */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setHour((h) => (h === 12 ? 1 : h + 1))}
                className="py-2 text-primary"
              >
                <ChevronUp size={20} />
              </button>
              <input
                type="number"
                value={String(hour).padStart(2, '0')}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1
                  setHour(Math.max(1, Math.min(12, val)))
                }}
                className="w-16 text-center text-2xl font-bold py-2 border-0 text-foreground"
                min="1"
                max="12"
              />
              <button
                onClick={() => setHour((h) => (h === 1 ? 12 : h - 1))}
                className="p-2 text-primary"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Separator */}
            <div className="text-3xl font-bold text-primary">:</div>

            {/* Minute */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setMinute((m) => (m === 55 ? 0 : m + 5))}
                className="p-2 text-primary"
              >
                <ChevronUp size={20} />
              </button>
              <input
                type="number"
                value={String(minute).padStart(2, '0')}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0
                  setMinute(Math.max(0, Math.min(59, val)))
                }}
                className="w-16 text-center text-2xl font-bold py-2 border-0 text-foreground"
                min="0"
                max="59"
              />
              <button
                onClick={() => setMinute((m) => (m === 0 ? 55 : m - 5))}
                className="p-2 text-primary"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            {/* Period */}
            <div className="flex flex-col items-center gap-2">
              {['AM', 'PM'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p as 'AM' | 'PM')}
                  className={`px-3 py-1 rounded border-2 font-semibold text-sm transition-all ${
                    period === p
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-transparent text-muted-foreground border-border'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="mb-8">
          <label className="block text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
            Session Duration
          </label>
          <div className="border-2 border-border rounded-lg flex items-center">
            <button
              onClick={() => setDuration((d) => Math.max(MIN_DURATION, d - 5))}
              className="w-12 h-12 flex items-center justify-center border-r-2 border-border font-bold text-xl text-primary bg-card"
            >
              <Minus size={18} />
            </button>

            <input
              type="number"
              value={duration}
              onChange={(e) => {
                const val = parseInt(e.target.value) || MIN_DURATION
                setDuration(Math.max(MIN_DURATION, Math.min(MAX_DURATION, val)))
              }}
              className="flex-1 px-4 py-3 text-center text-2xl font-bold text-foreground bg-transparent border-0"
              min={MIN_DURATION}
              max={MAX_DURATION}
            />

            <div className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
              {formatDuration(duration)}
            </div>

            <button
              onClick={() => setDuration((d) => Math.min(MAX_DURATION, d + 5))}
              className="w-12 h-12 flex items-center justify-center border-l-2 border-border font-bold text-xl text-primary bg-card"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="border-l-4 border-destructive bg-red-50 p-4 mb-6 rounded">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-lg border-2 border-border font-semibold transition-all hover:opacity-80 text-foreground bg-card"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            disabled={loading}
            className={`flex-[1.5] py-3 rounded-lg text-primary-foreground font-bold transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              loading ? 'bg-primary/60' : 'bg-primary'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Clock size={18} />
                Confirm — {formatDuration(duration)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
