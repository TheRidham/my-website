'use client'

import React from 'react'
import { Home, Users, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import jaiyaAvatar from "@/assets/jaiya.jpg";

const BottomNav = () => {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', icon: Home, path: '/home' },
    { name: 'Advisors', icon: Users, path: '/home/allAdvisors' },
    { name: 'Ask Jaiya', icon: null, path: '/jaiya', isJaiya: true },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-3 px-6 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.path
        return (
          <Link
            key={item.name}
            href={item.path}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {item.isJaiya ? (
              <div className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${isActive ? 'border-blue-600 shadow-md shadow-blue-100' : 'border-transparent'}`}>
                <Image src={jaiyaAvatar} alt="Jaiya" width={36} height={36} className="object-cover" />
              </div>
            ) : (
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
            )}
            <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.name}</span>
          </Link>
        )
      })}
    </div>
  )
}

export default BottomNav
