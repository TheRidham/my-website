'use client'

import React, { useEffect, useState } from 'react'
import { Search, Star, MessageCircle, Phone, Video } from 'lucide-react'
import Image from 'next/image'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useChat } from '@/providers/ChatProvider'
import { HumanAdvisorModal } from '@/components/Chat/HumanAdvisorModal'
import Link from 'next/link'

type Advisor = {
  uid: string
  name: string
  profilePhoto: string
  specialization: string[]
  busy: boolean
  totalUsersAttended: number
  isActive: boolean
  rating?: number
  experience?: string
}

function getCategoryKey(spec: string) {
  const map: Record<string, string> = {
    'Nutrition & Diet': 'nutrition',
    Fitness: 'fitness',
    'General Medicine': 'medical',
    'Mental Health': 'mental',
    Legal: 'lawyer',
    Career: 'career',
  }
  return map[spec] || 'general'
}

function AllAdvisorsPage() {
  const { switchChat } = useChat()
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAdvisor, setSelectedAdvisor] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sessionType, setSessionType] = useState<'chat' | 'video'>('chat')

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const q = query(
          collection(db, 'advisors'),
          where('isActive', '==', true)
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map((doc) => ({
          ...(doc.data() as Advisor),
          uid: doc.id,
        }))
        setAdvisors(data)
      } catch (error) {
        console.error('Error fetching advisors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdvisors()
  }, [])

  const handleAdvisorClick = (advisor: Advisor, type: 'chat' | 'video' = 'chat') => {
    setSelectedAdvisor({
      id: advisor.uid,
      name: advisor.name,
      specialty: advisor.specialization,
      image: advisor.profilePhoto,
      rating: advisor.rating || 4.8,
      experience: advisor.experience || '6+ years'
    })
    setSessionType(type)
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full pb-24">
      {/* Search */}
      <div className="px-5 py-4 sticky top-0 bg-background z-20 border-b">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            placeholder="Search by name or specialty"
            className="w-full bg-secondary rounded-2xl py-3.5 pl-12 pr-4 text-sm border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Advisors */}
      <div className="p-5 space-y-4">
        {loading && (
          <div className="flex flex-col items-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-gray-400">Loading expert advisors...</p>
          </div>
        )}

        {!loading &&
          advisors.map((advisor) => {
            return (
              <div
                key={advisor.uid}
                // onClick={() => handleAdvisorClick(advisor)}
                className="bg-secondary rounded-4xl p-5 py-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group"
              >
                <div className="flex gap-5">
                  <div className="relative w-20 h-20 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner shrink-0">
                    <Image
                      src={advisor.profilePhoto || '/placeholder-advisor.png'}
                      alt={advisor.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {advisor.busy && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-[10px] font-black text-white uppercase tracking-tighter">Busy</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-black text-gray-900 text-lg truncate group-hover:text-primary transition-colors">
                        {advisor.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star className="text-yellow-500 fill-yellow-500" size={12} />
                        <span className="text-[11px] font-black text-yellow-700">{advisor.rating || '4.8'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {advisor.specialization?.map((spec, idx) => (
                        <span 
                          key={idx}
                          className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full uppercase tracking-wider"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Experience</span>
                          <span className="text-xs font-black text-gray-700">{advisor.experience || '5+ Years'}</span>
                        </div>
                        <div className="w-px h-6 bg-gray-100" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Consults</span>
                          <span className="text-xs font-black text-gray-700">{advisor.totalUsersAttended || '1.2k'}+</span>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                </div>
                <div className="flex items-center mt-3 gap-3">
                  <div 
                    onClick={() => handleAdvisorClick(advisor, 'chat')}
                    className="flex-1 w-10 h-10 bg-primary/30 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors"
                  >
                    <MessageCircle className="text-primary group-hover:text-white transition-colors" size={20} />
                  </div>
                  <div 
                    onClick={() => handleAdvisorClick(advisor, 'video')}
                    className="flex-1 w-10 h-10 bg-primary/30 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors cursor-pointer"
                  >
                    <Video className="text-primary group-hover:text-white transition-colors" size={20} />
                  </div>
                  <Link
                    href={`/allAdvisors/schedule?advisorName=${advisor.name}&advisorId=${advisor.uid}`}
                    className="flex-1 w-10 h-10 bg-primary/30 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors cursor-pointer text-primary text-sm group-hover:text-white"
                  >
                    Schedule
                  </Link>
                </div>
              </div>
            )
          })}
      </div>

      <HumanAdvisorModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedAdvisor={selectedAdvisor}
        sessionType={sessionType}
      />
    </div>
  )
}
 

export default AllAdvisorsPage
