'use client'

import React, { useEffect, useState } from 'react'
import { Wallet, History } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function Layout({ children }: {children: React.ReactNode}) {
  const pathname = usePathname()
  const [greetings, setGreetings] = useState('Good Morning!!!');
  useEffect(() => {
    const updateGreetings = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
        setGreetings("Good Morning!");
      } else if (currentHour < 17) {
        setGreetings("Good Afternoon!");
      } else
        setGreetings("Good Evening!");
    };

    updateGreetings()
  }, [])

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="px-5 py-5 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-200 overflow-hidden shadow-sm">
            <Image src="/user-avatar.png" alt="User" width={44} height={44} className="object-cover" />
          </div>
          <div className="flex flex-col">
            <p className="text-[11px] text-blue-600 font-bold uppercase tracking-wider">{greetings}</p>
            <p className="text-lg font-extrabold text-gray-900 leading-tight">Monu</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 flex gap-8 border-b border-gray-200 bg-white">
        <Link 
          href="/home" 
          className={`pb-3 text-[14px] font-bold transition-all relative ${
            pathname === '/home' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Home
          {pathname === '/home' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
          )}
        </Link>
        <Link 
          href="/home/allAdvisors" 
          className={`pb-3 text-[14px] font-bold transition-all relative ${
            pathname === '/home/allAdvisors' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Advisors
          {pathname === '/home/allAdvisors' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
          )}
        </Link>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

export default Layout
