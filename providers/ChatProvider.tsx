'use client'

import { usePathname } from 'next/navigation'
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface Advisor {
  name: string
  image?: any
  categoryKey?: string
  subcategoryTitle?: string
  specialty?: string
  initialMessage?: string // Optional: message to auto-send after switch
  speedMode?: 'quick' | 'thoughtful' // Persist speed mode on redirect
  privacyMode?: 'forYou' | 'anonymized' // Persist privacy mode on redirect
}

interface ChatContextType {
  activeChat: {
    advisorName: string
    advisorAvatar: any
    categoryKey?: string
    subcategoryTitle?: string
    initialMessage?: string // Store pending message
    speedMode?: 'quick' | 'thoughtful'
    privacyMode?: 'forYou' | 'anonymized'
  }
  switchChat: (advisor: Advisor) => void
  resetChat: () => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname();
  const [activeChat, setActiveChat] = useState({
    advisorName: "Super AI",
    advisorAvatar: null,
    categoryKey: undefined as string | undefined,
    subcategoryTitle: undefined as string | undefined,
    initialMessage: undefined as string | undefined,
    speedMode: undefined as 'quick' | 'thoughtful' | undefined,
    privacyMode: undefined as 'forYou' | 'anonymized' | undefined,
  })

  useEffect(() => {
    if(pathname!=='/' && (typeof window !== 'undefined' && window.innerWidth >= 768)) setIsSidebarOpen(true); 
  }, [pathname])

  const switchChat = useCallback((advisor: Advisor) => {
    console.log('ChatProvider: switchChat called with:', advisor);
    setActiveChat({
      advisorName: advisor.name,
      advisorAvatar: advisor.image,
      categoryKey: advisor.categoryKey,
      subcategoryTitle: advisor.subcategoryTitle,
      initialMessage: advisor.initialMessage,
      speedMode: advisor.speedMode,
      privacyMode: advisor.privacyMode,
    })
    // On mobile, we might want to close the sidebar when a chat is selected
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }, [])

  const resetChat = useCallback(() => {
    setActiveChat({
      advisorName: "Super AI",
      advisorAvatar: null,
      categoryKey: undefined,
      subcategoryTitle: undefined,
      initialMessage: undefined,
      speedMode: undefined,
      privacyMode: undefined,
    })
  }, [])

  return (
    <ChatContext.Provider value={{ 
      activeChat, 
      switchChat, 
      resetChat,
      isSidebarOpen,
      setIsSidebarOpen
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
