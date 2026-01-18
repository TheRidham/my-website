'use client'

import React from 'react'
import { Home, Users, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import jaiyaAvatar from "@/assets/jaiya.jpg";
import { useChat } from '@/providers/ChatProvider'

const BottomNav = () => {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Advisors', icon: Users, path: '//allAdvisors' },
    { name: 'Ask Super AI', icon: null, path: '/jaiya', isJaiya: true },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto bg-white border-t md:border-t-0 border-gray-200 flex md:flex-col justify-around md:justify-start items-center py-3 md:py-6 px-6 md:px-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:shadow-none">
      {navItems.map((item) => {
        const isActive = pathname === item.path
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`flex flex-col md:flex-row items-center gap-1.5 md:gap-3 md:w-full md:px-4 md:py-3 rounded-xl transition-all duration-300 ${
              isActive ? 'text-primary scale-110 md:scale-100 md:bg-emerald-50' : 'text-gray-400 hover:text-gray-600 md:hover:bg-gray-50'
            }`}
          >
            {item.isJaiya ? (
              <div className={`w-9 h-9 md:w-8 md:h-8 rounded-full overflow-hidden border-2 transition-all ${isActive ? 'border-primary shadow-md shadow-emerald-100' : 'border-transparent'}`}>
                <Image src={jaiyaAvatar} alt="Super AI" width={36} height={36} className="object-cover" />
              </div>
            ) : (
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-emerald-50 md:bg-transparent' : ''}`}>
                {item.icon && <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />}
              </div>
            )}
            <span className={`text-[10px] md:text-sm font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.name}</span>
          </Link>
        )
      })}
    </div>
  )
}

export default BottomNav
