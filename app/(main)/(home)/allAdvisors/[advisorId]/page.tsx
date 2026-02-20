'use client'

import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Image from 'next/image'
import { Star, MessageCircle, Phone, Calendar, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { HumanAdvisorModal } from '@/components/Chat/HumanAdvisorModal'
import { useRouter } from 'next/navigation'
import { useAuthGate } from '@/providers/AuthGateProvider'

interface Advisor {
  uid: string
  name: string
  profilePhoto: string
  specialization: string[]
  busy: boolean
  totalUsersAttended: number
  isActive: boolean
  rating?: number
  experience?: string
  about?: string
  location?: string
  memberSince?: string
  reviewCount?: number
  phone?: string
  degree?: string | string[]
  certification?: string | string[]
}

export default function AdvisorProfilePage({ params }: { params: Promise<{ advisorId: string }> }) {
  const { advisorId } = React.use(params)
  const router = useRouter()
  const [advisor, setAdvisor] = useState<Advisor | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sessionType, setSessionType] = useState<'chat' | 'video'>('chat')
  const { requireLogin } = useAuthGate()

  useEffect(() => {
    const fetchAdvisor = async () => {
      try {
        const docRef = doc(db, 'advisors', advisorId)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          setAdvisor({
            ...(docSnap.data() as Advisor),
            uid: docSnap.id,
          })
        } else {
          console.error('Advisor not found')
          router.push('/allAdvisors')
        }
      } catch (error) {
        console.error('Error fetching advisor:', error)
        router.push('/allAdvisors')
      } finally {
        setLoading(false)
      }
    }

    fetchAdvisor()
  }, [advisorId, router])

  const handleSessionClick = async (type: 'chat' | 'video') => {
    if (advisor) {
      const loggedIn = await requireLogin({
        title: 'Login Required',
        description: 'Sign in with Google to connect with an expert advisor. Guest accounts cannot access this feature.',
      })
      if (!loggedIn) return

      setSessionType(type)
      setIsModalOpen(true)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-gray-400">Loading advisor profile...</p>
      </div>
    )
  }

  if (!advisor) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <p className="text-sm font-bold text-gray-400">Advisor not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full pb-32 bg-background">
      {/* Header with back button */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 border-b bg-background">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-secondary transition-colors"
        >
          <ChevronLeft className="text-foreground" size={24} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Advisor Profile</h1>
        <div className="w-10" />
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center px-5 pt-6 pb-6 bg-secondary/50">
        {/* Profile Photo */}
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-6">
          <Image
            src={advisor.profilePhoto || '/placeholder-advisor.png'}
            alt={advisor.name}
            fill
            className="object-cover"
          />
          {advisor.busy && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-xs font-bold text-white">Busy</span>
            </div>
          )}
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">{advisor.name}</h1>

        {/* Specializations */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {advisor.specialization?.slice(0, 3).map((spec, idx) => (
            <span
              key={idx}
              className="text-xs font-semibold px-3 py-1 bg-primary/10 text-primary rounded-full"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="text-yellow-500 fill-yellow-500" size={18} />
            <span className="font-bold text-foreground">{advisor.rating || '4.8'}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            • {advisor.reviewCount || '4'} Reviews
          </span>
        </div>

        {/* Member Since */}
        {advisor.memberSince && (
          <p className="text-sm text-muted-foreground mb-3">
            Member since: {advisor.memberSince}
          </p>
        )}

        {/* Experience and Consults Row */}
        <div className="flex items-center justify-center gap-8 mb-3">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Experience
            </span>
            <span className="text-sm font-bold text-foreground">{advisor.experience || '5+ Years'}</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Consultations
            </span>
            <span className="text-sm font-bold text-foreground">{advisor.totalUsersAttended || '1.2k'}+</span>
          </div>
        </div>

        {/* Location */}
        {advisor.location && (
          <p className="text-sm text-muted-foreground">📍 {advisor.location}</p>
        )}
      </div>

      {/* Education Section */}
      {(advisor.degree || advisor.certification) && (
        <div className="px-5 py-3">
          {advisor.degree && (
            <div className="mb-4">
              <h3 className="text-md font-bold text-foreground mb-2">Education</h3>
              <div className="flex flex-wrap gap-2">
                {typeof advisor.degree === 'string' ? (
                  advisor.degree.split(",").map((deg, idx) => (
                    <span key={idx} className="text-sm px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                      {deg}
                    </span>
                  ))
                ) : (
                  advisor.degree.map((deg, idx) => (
                    <span key={idx} className="text-sm px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
                      {deg}
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
          {advisor.certification && (
            <div>
              <h3 className="text-md font-bold text-foreground mb-2">Certifications</h3>
              <div className="flex flex-wrap gap-2">
                {typeof advisor.certification === 'string' ? (
                  advisor.certification.split(",").map((cert, idx) => (
                    <span key={idx} className="text-sm px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                      {cert}
                    </span>
                  ))
                ) : (
                  advisor.certification.map((cert, idx) => (
                    <span key={idx} className="text-sm px-3 py-2 bg-green-50 text-green-700 rounded-lg">
                      {cert}
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* About Section */}
      {advisor.about && (
        <div className="px-5 py-3">
          <h2 className="text-lg font-bold text-foreground mb-3">About {advisor.name.split(' ')[0]}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{advisor.about}</p>
        </div>
      )}

      {/* Specializations List */}
      {advisor.specialization && advisor.specialization.length > 0 && (
        <div className="px-5 py-3">
          <h2 className="text-lg font-bold text-foreground mb-3">Specializations</h2>
          <div className="flex flex-wrap gap-2">
            {advisor.specialization.map((spec, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold px-3 py-2 bg-secondary text-foreground rounded-lg"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 bg-background border-t flex gap-3">
        {/* Chat Button */}
        <button
          onClick={() => handleSessionClick('chat')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 text-primary rounded-2xl font-semibold hover:bg-primary/20 transition-colors"
        >
          <MessageCircle size={20} />
          Chat
        </button>

        {/* Call Button */}
        <button
          onClick={() => handleSessionClick('video')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 text-primary rounded-2xl font-semibold hover:bg-primary/20 transition-colors"
        >
          <Phone size={20} />
          Call
        </button>

        {/* Schedule Button */}
        <button
          onClick={async () => {
            const loggedIn = await requireLogin({
              title: 'Login Required',
              description: 'Sign in with Google to schedule a session. Guest accounts cannot access this feature.',
            })
            if (!loggedIn) return
            router.push(`/allAdvisors/schedule?advisorName=${advisor.name}&advisorId=${advisor.uid}`)
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-2xl font-semibold hover:bg-primary/90 transition-colors"
        >
          <Calendar size={20} />
          Schedule
        </button>
      </div>

      {/* Modal for Chat/Video */}
      <HumanAdvisorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedAdvisor={{
          id: advisor.uid,
          name: advisor.name,
          specialty: advisor.specialization,
          image: advisor.profilePhoto,
          rating: advisor.rating || 4.8,
          experience: advisor.experience || '5+ Years'
        }}
        sessionType={sessionType}
      />
    </div>
  )
}
