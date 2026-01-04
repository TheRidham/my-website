'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Paperclip, Mic, Send, Loader2 } from 'lucide-react'
import { useAIChat } from '@/hooks/useAIChat'

interface AIChatProps {
  customSystemPrompt?: string;
  welcomeMessage?: string;
}

function AIChat({ customSystemPrompt, welcomeMessage }: AIChatProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const { messages, isLoading, sendMessage } = useAIChat({
    customSystemPrompt
  })

  const suggestions = [
    "Find me a career advisor",
    "I need help with my relationship",
    "How to improve my mental health?",
    "Best AI for coding help"
  ]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const msg = input
    setInput('')
    await sendMessage(msg)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Chat Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        <div className="max-w-4xl mx-auto w-full p-6 space-y-6">
          {/* Welcome Message */}
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-sm">
              <p className="text-gray-700 text-[14px] leading-relaxed font-medium">
                {welcomeMessage || "Hello! I'm Jaiya, your AI companion. I can help you find the perfect AI advisor for any situation."}
              </p>
            </div>
          </div>

          {messages.length === 0 && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-sm">
                <p className="text-gray-700 text-[14px] leading-relaxed font-medium">
                  Ask me anything and I will connect you to that AI advisor.
                </p>
              </div>
            </div>
          )}

          {/* Chat History */}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 max-w-[85%] shadow-sm rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'
              }`}>
                <p className="text-[14px] leading-relaxed font-medium">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-[12px] text-gray-400 font-medium">Jaiya is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {messages.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {suggestions.map((suggestion, index) => (
                <button 
                  key={index}
                  onClick={() => sendMessage(suggestion)}
                  className="text-left p-4 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all group shadow-sm"
                >
                  <p className="text-[13px] font-bold text-gray-800 group-hover:text-blue-700">{suggestion}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Click to ask Jaiya</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 bg-slate-50">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-md">
            <button className="text-gray-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded-lg">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-none focus:outline-none text-[14px] py-1.5 text-gray-800 placeholder:text-gray-400 font-medium"
            />
            <div className="flex items-center gap-1">
              <button className="text-gray-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded-lg">
                <Mic size={20} />
              </button>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIChat
