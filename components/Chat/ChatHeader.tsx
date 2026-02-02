'use client'

import React from 'react'
import { Wallet, History, Plus, User } from 'lucide-react'
import { ADVISOR_CATEGORIES } from '@/constant/advisors'
import { LucideIcon } from '../ui/LucideIcon'
import { Button } from '../ui/button'

interface ChatHeaderProps {
  isSidebarOpen?: boolean;
  categoryKey?: string;
  subcategoryTitle?: string;
  privacyMode: 'forYou' | 'anonymized';
  walletBalance: number;
  onNewChat: () => void;
  onOpenHistory: () => void;
  onConnectHuman: () => void;
}

export function ChatHeader({
  isSidebarOpen = true,
  categoryKey,
  subcategoryTitle,
  privacyMode,
  walletBalance,
  onNewChat,
  onOpenHistory,
  onConnectHuman,
}: ChatHeaderProps) {
  const isAdvisorChat = !!categoryKey;
  
  const category = categoryKey ? ADVISOR_CATEGORIES[categoryKey] : null;
  const subcategory = category && subcategoryTitle 
    ? category.categories.find(c => c.title === subcategoryTitle)
    : null;

  return (
    <>
      {/* Header */}
      <div className={`sticky top-0 z-30 backdrop-blur-sm transition-all duration-300 ${!isSidebarOpen && "pl-12"}`}>
        <div className="w-full flex items-center justify-between px-6 py-1.5">
          <div className="flex items-center">
            <div className="flex items-center gap-4">
              {isAdvisorChat && (
                <div className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-white shadow-md flex items-center justify-center">
                  <div 
                    className="w-full h-full flex items-center justify-center bg-muted text-primary"
                  >
                    <LucideIcon name={subcategory?.icon || category?.icon || "Sparkles"} size={24} />
                  </div>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-black text-gray-900 text-[15px] tracking-tight flex items-center gap-2">
                  {isAdvisorChat && subcategoryTitle}
                  {privacyMode === 'anonymized' && (
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-normal">
                      Anonymous Chat
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-1.5">
                  {isAdvisorChat ? (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      {category?.name} Expert
                    </span>
                  ) : (
                    <>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdvisorChat && (
              <Button
                onClick={onConnectHuman}
                className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-4 py-2 text-xs"
              >
                <User size={16} />
                Connect with Human
              </Button>
            )}
            <button 
              onClick={onNewChat}
              className="hidden md:inline-block p-2.5 text-gray-500 hover:text-primary hover:bg-emerald-50 rounded-xl transition-all" 
              title="New Chat"
            >
              <Plus size={20} />
            </button>
            <button onClick={onOpenHistory} className="hidden md:inline-block p-2.5 text-gray-500 hover:text-primary hover:bg-emerald-50 rounded-xl transition-all" title="Chat History">
              <History size={20} />
            </button>
            <button 
              onClick={() => window.location.href = '/wallet'}
              className="flex items-center gap-2 p-2 md:px-3 text-gray-500 hover:text-primary hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100" 
              title="Wallet"
            >
              <Wallet size={20} />
              <span className="hidden sm:inline text-xs font-bold">${(walletBalance / 100).toFixed(2)}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
