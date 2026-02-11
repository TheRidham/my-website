/* ------------------ TYPES ------------------ */

import { getFirestore, collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore'

type TimeRange = {
  from: Date
  to: Date
}

type WorkingHours = {
  start: string // "09:00"
  end: string // "18:00"
}

/* ------------------ HELPERS ------------------ */

// "09:30" → Date (for given date)
function timeStringToDate(time: string, date: Date = new Date()) {
  const [h, m] = time.split(':').map(Number)
  const d = new Date(date)
  d.setHours(h, m, 0, 0)
  return d
}

// Sort ranges by start
function sortRanges(ranges: TimeRange[]) {
  return ranges.sort((a, b) => a.from.getTime() - b.from.getTime())
}

/* ------------------ CORE LOGIC ------------------ */

function getFreeRanges(
  workStart: Date,
  workEnd: Date,
  busyRanges: TimeRange[],
): TimeRange[] {
  const free: TimeRange[] = []
  let cursor = new Date(workStart)

  for (const busy of busyRanges) {
    if (cursor < busy.from) {
      free.push({
        from: new Date(cursor),
        to: new Date(busy.from),
      })
    }

    if (busy.to > cursor) {
      cursor = new Date(busy.to)
    }
  }

  if (cursor < workEnd) {
    free.push({
      from: new Date(cursor),
      to: new Date(workEnd),
    })
  }

  return free
}

/* ------------------ MAIN FUNCTIONS ------------------ */

export async function getFreeRangesForDate(
  advisorId: string,
  targetDate: Date,
) {
  try {
    const db = getFirestore()

    // 1️⃣ Fetch advisor working hours
    const advisorRef = doc(db, 'advisors', advisorId)
    const advisorSnap = await getDoc(advisorRef)

    const workingHours: WorkingHours = advisorSnap.exists()
      ? advisorSnap.data()?.workingHours || { start: '00:00', end: '23:59' }
      : { start: '00:00', end: '23:59' }

    const workStart = timeStringToDate(workingHours.start, targetDate)
    const workEnd = timeStringToDate(workingHours.end, targetDate)

    // 2️⃣ Target date range
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // 3️⃣ Fetch sessions for the target date
    const q = query(
      collection(db, 'scheduleSessions'),
      where('advisorId', '==', advisorId),
      where('status', 'in', ['scheduled', 'confirmed', 'waiting', 'active']),
      where('preferredWindow.from', '>=', Timestamp.fromDate(startOfDay)),
      where('preferredWindow.from', '<=', Timestamp.fromDate(endOfDay)),
    )

    const snapshot = await getDocs(q)

    const busyRanges: TimeRange[] = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        from: data.preferredWindow.from.toDate(),
        to: data.preferredWindow.to.toDate(),
      }
    })

    // 4️⃣ Sort busy ranges
    const sortedBusy = sortRanges(busyRanges)

    // 5️⃣ Compute free ranges
    let freeRanges = getFreeRanges(workStart, workEnd, sortedBusy)

    // 6️⃣ Remove past time (only for today)
    const now = new Date()
    const isToday = startOfDay.toDateString() === new Date().toDateString()

    if (isToday) {
      // If advisor is currently busy (via manual status or active session), 
      // available slots should start at least 30 mins from now.
      const isBusy = advisorSnap.data()?.busy === true || 
                     sortedBusy.some(b => now >= b.from && now <= b.to)
      
      const effectiveNow = isBusy 
        ? new Date(now.getTime() + 30 * 60 * 1000) 
        : now

      freeRanges = freeRanges
        .map((r) => ({
          from: r.from < effectiveNow ? effectiveNow : r.from,
          to: r.to,
        }))
        .filter((r) => r.from < r.to)
    }

    return freeRanges
  } catch (error) {
    console.error('Error fetching free ranges:', error)
    throw error
  }
}

// Backward compatibility
export async function getTodayFreeRanges(advisorId: string) {
  return getFreeRangesForDate(advisorId, new Date())
}
