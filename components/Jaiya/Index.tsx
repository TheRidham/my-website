import React from 'react'
import AIChat from '../Chat/AIChat'
import { ChevronLeft, Wallet, History } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import jaiyaAvatar from "@/assets/jaiya.jpg";

interface JaiyaProps {
  isSidebarOpen?: boolean;
  customSystemPrompt?: string;
  welcomeMessage?: string;
  advisorName?: string;
  advisorAvatar?: any;
}

function Jaiya({ 
  isSidebarOpen, 
  customSystemPrompt, 
  welcomeMessage,
  advisorName = "Jaiya",
  advisorAvatar = jaiyaAvatar
}: JaiyaProps) {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className={`border-b border-gray-200 bg-white backdrop-blur-sm transition-all duration-300 ${!isSidebarOpen && "md:pl-12"}`}>
        <div className="w-full flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <Link href="/home" className="md:hidden mr-4 text-gray-600 hover:text-blue-600 transition-colors">
              <ChevronLeft size={24} />
            </Link>
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                <Image
                  src={advisorAvatar || jaiyaAvatar}
                  alt={advisorName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-gray-900 text-[16px] tracking-tight">{advisorName}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[11px] font-bold text-green-600 uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Chat History">
              <History size={22} />
            </button>
            <button className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Wallet">
              <Wallet size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Component */}
      <div className="flex-1 overflow-hidden">
        <AIChat 
          customSystemPrompt={customSystemPrompt} 
          welcomeMessage={welcomeMessage} 
        />
      </div>
    </div>
  )
}

export default Jaiya
