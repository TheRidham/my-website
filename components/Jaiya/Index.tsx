'use client'

import React, { useRef, useState } from 'react'
import { AIChat, AIChatHandle } from '../Chat/AIChat'
import { ChevronLeft, Wallet, History, Plus, User } from 'lucide-react'
import Image from 'next/image'
import jaiyaAvatar from "@/assets/jaiya.jpg";
import { ADVISOR_CATEGORIES } from '@/constant/advisors'
import { LucideIcon } from '../ui/LucideIcon'
import { HumanAdvisorModal } from '../Chat/HumanAdvisorModal'
import { Button } from '../ui/button'
import { usePayment } from '@/providers/PaymentProvider'
import AIChatHistorySheet from '../Chat/AIChatHistorySheet'

interface JaiyaProps {
  isSidebarOpen?: boolean;
  categoryKey?: string;
  subcategoryTitle?: string;
  advisorName?: string;
  advisorAvatar?: any;
  onBack?: () => void;
}

function Jaiya({ 
  isSidebarOpen, 
  categoryKey,
  subcategoryTitle,
  advisorName = "Super AI",
  advisorAvatar = jaiyaAvatar,
  onBack
}: JaiyaProps) {
  const chatRef = useRef<AIChatHandle>(null);
  const [isHumanModalOpen, setIsHumanModalOpen] = useState(false);
  const { walletBalance } = usePayment();
  //for chat history
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false)

  const isAdvisorChat = !!categoryKey;
  
  console.log(categoryKey, subcategoryTitle, isSidebarOpen)
  
  const category = categoryKey ? ADVISOR_CATEGORIES[categoryKey] : null;
  const subcategory = category && subcategoryTitle 
    ? category.categories.find(c => c.title === subcategoryTitle)
    : null;

  const handleNewChat = () => {
    chatRef.current?.clearMessages();
    setCurrentChatId(null);
  };

  

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className={`border-b border-gray-200 bg-white backdrop-blur-sm transition-all duration-300 ${!isSidebarOpen && "md:pl-12"}`}>
        <div className="w-full flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            {(onBack || isAdvisorChat) && (
              <button 
                onClick={onBack}
                className="mr-4 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-blue-50 flex items-center justify-center">
                {isAdvisorChat ? (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: category?.bgColor, color: category?.color }}
                  >
                    <LucideIcon name={subcategory?.icon || category?.icon || "Sparkles"} size={24} />
                  </div>
                ) : (
                  <Image
                    src={advisorAvatar || jaiyaAvatar}
                    alt={advisorName}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-gray-900 text-[16px] tracking-tight">
                  {isAdvisorChat ? subcategoryTitle : advisorName}
                </span>
                <div className="flex items-center gap-1.5">
                  {isAdvisorChat ? (
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      {category?.name} Expert
                    </span>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[11px] font-bold text-green-600 uppercase tracking-wider">Online</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {isAdvisorChat && (
              <Button 
                onClick={() => setIsHumanModalOpen(true)}
                className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 py-2 text-xs"
              >
                <User size={16} />
                Connect with Human
              </Button>
            )}
            <button 
              onClick={handleNewChat}
              className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" 
              title="New Chat"
            >
              <Plus size={22} />
            </button>
            <button onClick={() => setIsOpen(true)} className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Chat History">
              <History size={22} />
            </button>
            <button 
              onClick={() => window.location.href = '/wallet'}
              className="flex items-center gap-2 p-2 md:px-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100" 
              title="Wallet"
            >
              <Wallet size={20} />
              <span className="hidden sm:inline text-xs font-bold">₹{(walletBalance / 100).toFixed(0)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Component */}
      <div className="flex-1 overflow-hidden">
        <AIChat 
          key={`${categoryKey}-${subcategoryTitle}`}
          ref={chatRef}
          categoryKey={categoryKey}
          subcategoryTitle={subcategoryTitle}
          isJaiya={!isAdvisorChat}
          chatId={currentChatId}
          setChatId={setCurrentChatId}
        />
      </div>

      <HumanAdvisorModal 
        isOpen={isHumanModalOpen}
        onClose={() => setIsHumanModalOpen(false)}
        categoryKey={categoryKey}
        subcategoryTitle={subcategoryTitle}
      />
      <AIChatHistorySheet open={isOpen} setOpen={setIsOpen} />
    </div>
  )
}

export default Jaiya
