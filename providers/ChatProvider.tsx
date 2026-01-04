'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface Advisor {
  name: string
  image?: any
  categoryKey?: string
  subcategoryTitle?: string
  specialty?: string
}

interface ChatContextType {
  activeChat: {
    advisorName: string
    advisorAvatar: any
    categoryKey?: string
    subcategoryTitle?: string
  }
  switchChat: (advisor: Advisor) => void
  resetChat: () => void
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeChat, setActiveChat] = useState({
    advisorName: "Jaiya",
    advisorAvatar: null,
    categoryKey: undefined as string | undefined,
    subcategoryTitle: undefined as string | undefined,
  })

  const switchChat = useCallback((advisor: Advisor) => {
    console.log('ChatProvider: switchChat called with:', advisor);
    setActiveChat({
      advisorName: advisor.name,
      advisorAvatar: advisor.image,
      categoryKey: advisor.categoryKey,
      subcategoryTitle: advisor.subcategoryTitle,
    })
    // On mobile, we might want to close the sidebar when a chat is selected
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }, [])

  const resetChat = useCallback(() => {
    setActiveChat({
      advisorName: "Jaiya",
      advisorAvatar: null,
      categoryKey: undefined,
      subcategoryTitle: undefined,
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
