'use client'

import React from 'react'
import { Search, Star, MessageCircle, Phone, Video } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useChat } from '@/providers/ChatProvider'

const advisors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialty: 'Nutrition & Diet',
    categoryKey: 'nutrition',
    subcategoryTitle: 'Healthy Eating',
    rating: 4.9,
    reviews: 124,
    price: '₹500/session',
    status: 'Online',
    image: '/advisors/sarah.png',
  },
  {
    id: 2,
    name: 'Coach Mike Ross',
    specialty: 'Fitness & Bodybuilding',
    categoryKey: 'fitness',
    subcategoryTitle: 'Exercise & Training',
    rating: 4.8,
    reviews: 89,
    price: '₹800/session',
    status: 'Busy',
    image: '/advisors/mike.png',
  },
  {
    id: 3,
    name: 'Dr. Emily Chen',
    specialty: 'Mental Health',
    categoryKey: 'mental',
    subcategoryTitle: 'Stress',
    rating: 5.0,
    reviews: 210,
    price: '₹1200/session',
    status: 'Online',
    image: '/advisors/emily.png',
  },
  {
    id: 4,
    name: 'Adv. Rajesh Kumar',
    specialty: 'Legal Expert',
    categoryKey: 'lawyer',
    subcategoryTitle: 'Income Tax',
    rating: 4.7,
    reviews: 56,
    price: '₹1500/session',
    status: 'Offline',
    image: '/advisors/rajesh.png',
  },
  {
    id: 5,
    name: 'Priya Sharma',
    specialty: 'Career Coach',
    categoryKey: 'career',
    subcategoryTitle: 'Budgeting & Saving',
    rating: 4.9,
    reviews: 145,
    price: '₹600/session',
    status: 'Online',
    image: '/advisors/priya.png',
  },
]

function AllAdvisorsPage() {
  const { switchChat } = useChat()

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-24">
      {/* Search Section */}
      <div className="px-5 py-4 sticky top-0 bg-white backdrop-blur-md z-20 border-b border-gray-200/50">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by name or specialty"
            className="w-full bg-slate-50/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none border border-gray-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Filters/Categories Horizontal Scroll */}
      <div className="px-5 py-2 flex gap-2.5 overflow-x-auto no-scrollbar bg-white border-b border-gray-200">
        {['All', 'Nutrition', 'Fitness', 'Mental Health', 'Legal', 'Career'].map((filter) => (
          <button
            key={filter}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all ${
              filter === 'All' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Advisors List */}
      <div className="p-5 space-y-5">
        {advisors.map((advisor) => (
          <Link 
            key={advisor.id} 
            href={`/home/${advisor.categoryKey}/${encodeURIComponent(advisor.subcategoryTitle)}`}
            onClick={() => switchChat({
              name: advisor.name,
              categoryKey: advisor.categoryKey,
              subcategoryTitle: advisor.subcategoryTitle,
              specialty: advisor.specialty,
              image: advisor.image
            })}
            className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-300 group cursor-pointer block"
          >
            <div className="flex gap-5">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 shadow-inner">
                <Image
                  src={advisor.image}
                  alt={advisor.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                  advisor.status === 'Online' ? 'bg-green-500' : 
                  advisor.status === 'Busy' ? 'bg-amber-500' : 'bg-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-[16px] group-hover:text-blue-600 transition-colors">{advisor.name}</h3>
                    <p className="text-[12px] text-blue-600 font-bold uppercase tracking-wide mt-0.5">{advisor.specialty}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-extrabold text-amber-700">{advisor.rating}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Starting from</span>
                    <p className="text-[15px] font-black text-gray-900">{advisor.price}</p>
                  </div>
                  <div className="flex gap-2.5">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-xs">
                      <MessageCircle size={20} />
                    </div>
                    <div className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-xs">
                      <Phone size={20} />
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-xs">
                      <Video size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default AllAdvisorsPage
