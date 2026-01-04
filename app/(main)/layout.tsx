'use client'

import Jaiya from '@/components/Jaiya/Index'
import BottomNav from '@/components/BottomNav'
import React, { useState } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

function Layout({ children }: {children: React.ReactNode}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeChat, setActiveChat] = useState({
    advisorName: "Jaiya",
    advisorAvatar: null, // Will default to jaiyaAvatar in component
    customSystemPrompt: "You are Jaiya, a helpful AI assistant that connects users with specialized AI advisors.",
    welcomeMessage: "Hello! I'm Jaiya, your AI companion. I can help you find the perfect AI advisor for any situation."
  })

  const handleSwitchChat = (advisor: any) => {
    setActiveChat({
      advisorName: advisor.name,
      advisorAvatar: advisor.image,
      customSystemPrompt: `You are ${advisor.name}, a specialized AI advisor in ${advisor.specialty}. Provide expert advice in this field.`,
      welcomeMessage: `Hello! I'm ${advisor.name}, your ${advisor.specialty} expert. How can I help you today?`
    })
    // On mobile, we might want to close the sidebar when a chat is selected
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <section
      className='flex h-screen bg-slate-50 overflow-hidden'
    >
      {/* Sidebar (Left Section) */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-40 w-full md:relative md:z-auto h-full
          transition-all duration-300 ease-in-out flex flex-col bg-white border-r border-gray-200
          ${isSidebarOpen ? 'translate-x-0 md:w-105' : '-translate-x-full md:translate-x-0 md:w-0'}
        `}
      >
        <div className={`flex-1 overflow-y-auto no-scrollbar ${!isSidebarOpen && 'md:hidden'}`}>
          {/* Pass handleSwitchChat to children if needed, but better to use a context or event bus for deep nesting */}
          { React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, { onSelectAdvisor: handleSwitchChat })
            }
            return child
          }) }
        </div>
        <div className={`shrink-0 ${!isSidebarOpen && 'md:hidden'}`}>
          <BottomNav />
        </div>

        {/* Desktop Toggle Button (Inside Sidebar when open) */}
        {isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="hidden md:flex absolute right-4 top-5 p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all z-50"
            title="Close sidebar"
          >
            <PanelLeftClose size={22} />
          </button>
        )}
      </div>

      {/* Main Content (Right Section - Jaiya) */}
      <div className={`flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden transition-all duration-300 ${!isSidebarOpen ? 'md:pl-0' : ''}`}>
        {/* Desktop Toggle Button (When sidebar is closed) */}
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="hidden md:flex absolute left-4 top-5 p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all z-50 shadow-sm border border-gray-100 bg-white"
            title="Open sidebar"
          >
            <PanelLeftOpen size={22} />
          </button>
        )}

        <div className="flex-1 h-full">
          <Jaiya 
            isSidebarOpen={isSidebarOpen} 
            advisorName={activeChat.advisorName}
            advisorAvatar={activeChat.advisorAvatar}
            customSystemPrompt={activeChat.customSystemPrompt}
            welcomeMessage={activeChat.welcomeMessage}
          />
        </div>
      </div>

      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </section>
  )
}

export default Layout
