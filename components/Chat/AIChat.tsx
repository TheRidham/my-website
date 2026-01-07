'use client'

import React, { useState, useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react'
import { Send, Loader2, Trash2, Paperclip, Mic } from 'lucide-react'
import { ADVISOR_CATEGORIES } from '@/constant/advisors'
import { Button } from '@/components/ui/button'
import { usePrompts } from '@/providers/PromptsProvider'
import { useChatAI } from '@/hooks/useAI'
import { useChat } from '@/providers/ChatProvider'
import { marked } from 'marked'
import { HumanAdvisorModal } from './HumanAdvisorModal'

interface AIChatProps {
  categoryKey?: string;
  subcategoryTitle?: string;
  isJaiya?: boolean;
}

export interface AIChatHandle {
  clearMessages: () => void;
}

const getMatcherPrompt = (categories: typeof ADVISOR_CATEGORIES) => {
  const tags = Object.entries(categories).reduce((acc, [key, cat]) => {
    acc[key] = {
      categoryName: cat.name,
      categoryTag: key,
      subCategories: cat.categories.map(sub => sub.title)
    };
    return acc;
  }, {} as any);

  return `
You are an intelligent advisor category matcher. Your task is to analyze user questions and match them to the most relevant category and subcategory from the dataset below.

ADVISOR_DATA:
${JSON.stringify(tags, null, 2)}

**Instructions:**
1. **Be flexible and understanding**: User questions may use different words, slang, or colloquial terms. Understand the intent and context, not just exact keyword matches.
2. **Use semantic understanding**: Match based on meaning and context.
3. **Match partial information**: If the query is related to a category but not specific about subcategory, choose the most logical subcategory.
4. **Respond in strict JSON format only**:
   - If you find a match: { "isfind": true, "categoryTag": "<tag>", "categoryName": "<name>", "subCategoryName": "<subcategory>" }
   - If no match: { "isfind": false, "response": "<helpful message explaining what services are available and suggesting user to rephrase or browse categories>" }

**Important:**
- The "categoryTag" MUST be one of the keys from ADVISOR_DATA (e.g., "nutrition", "fitness").
- The "subCategoryName" MUST be one of the subCategories listed under that tag.
- Always return valid JSON.
- No extra text, markdown, or explanation outside the JSON.
- Be helpful and user-friendly in responses`;
};

export const AIChat = forwardRef<AIChatHandle, AIChatProps>(({ categoryKey, subcategoryTitle, isJaiya = false }, ref) => {
  const [input, setInput] = useState('')
  const [isHumanModalOpen, setIsHumanModalOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { jaiyaPrompt, advisorsPrompt } = usePrompts()
  const { switchChat } = useChat()

  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true
  })

  // Resolve prompt and welcome message
  const { systemPrompt, welcomeMessage } = useMemo(() => {
    
    if (isJaiya) {
      const matcherPrompt = getMatcherPrompt(ADVISOR_CATEGORIES);
      return {
        systemPrompt: matcherPrompt,
        welcomeMessage: jaiyaPrompt?.welcomeMessage
      }
    }
    
    if (categoryKey && subcategoryTitle) {
      const categoryData = advisorsPrompt?.[categoryKey]
      const advisorData = categoryData?.[subcategoryTitle]
      
      // if (!advisorData && advisorsPrompt) {
      //   if (advisorsPrompt[categoryKey]) {
      //     console.log('AIChat: Available subcategories in', categoryKey, ':', Object.keys(advisorsPrompt[categoryKey]));
      //   }
      // }

      // Combine subcategory prompt with category general prompt
      const combinedSystemPrompt = advisorData?.prompt 
        ? `${advisorData.prompt} ${categoryData?.generalPrompt || ''}`.trim()
        : undefined;

      return {
        systemPrompt: combinedSystemPrompt,
        welcomeMessage: advisorData?.welcomeMessage
      }
    }

    return {
      systemPrompt: undefined,
      welcomeMessage: undefined
    }
  }, [isJaiya, categoryKey, subcategoryTitle, jaiyaPrompt, advisorsPrompt])

  const { messages, isLoading, sendMessage, clearMessages } = useChatAI({
    systemPrompt,
    appendGeneralPrompt: !isJaiya
  })

  useImperativeHandle(ref, () => ({
    clearMessages
  }));

  // Clear messages on unmount to stop any pending AI responses
  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  const suggestions = useMemo(() => {
    if (categoryKey && subcategoryTitle) {
      return ADVISOR_CATEGORIES[categoryKey]?.categories.find(s => s.title === subcategoryTitle)?.recommendedQuestions || []
    }
    return Object.values(ADVISOR_CATEGORIES).flatMap(cat => 
      cat.categories.flatMap(sub => sub.recommendedQuestions)
    ).slice(0, 4)
  }, [categoryKey, subcategoryTitle])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const processMessage = async (content: string) => {
    if (!content.trim() || isLoading) {
      return;
    }
    
    const response = await sendMessage(content);

    if (isJaiya && response) {
      try {
        // Try to extract JSON if AI wrapped it in markdown or text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : response;
        
        const data = JSON.parse(jsonStr);

        if (data.isfind) {
          const categoryTag = data.categoryTag?.toLowerCase();
          const categoryName = data.categoryName?.toLowerCase();
          
          // Try to find by tag first, then by name
          let category = ADVISOR_CATEGORIES[categoryTag];
          if (!category) {
            const foundCategory = Object.values(ADVISOR_CATEGORIES).find(
              cat => cat.name.toLowerCase() === categoryName
            );
            if (foundCategory) {
              category = foundCategory;
            }
          }
          
          if (category) {
            const targetTag = Object.keys(ADVISOR_CATEGORIES).find(
              key => ADVISOR_CATEGORIES[key] === category
            );

            const subcategory = category.categories.find(
              c => c.title.toLowerCase() === data.subCategoryName?.toLowerCase()
            );
            
            if (subcategory) {
              switchChat({
                name: subcategory.title,
                categoryKey: targetTag,
                subcategoryTitle: subcategory.title,
              });
            } else {
              console.warn('processMessage subcategory not found:', data.subCategoryName);
            }
          } else {
            console.warn('processMessage category not found for tag:', categoryTag, 'or name:', categoryName);
          }
        } else {
          console.log('processMessage AI did not find a match. Response:', data.response);
        }
      } catch (e) {
        console.error('processMessage JSON parse error:', e);
      }
    }
  };

  const handleSend = async () => {
    const msg = input;
    setInput('');
    await processMessage(msg);
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
        <div className="max-w-4xl mx-auto w-full p-6 space-y-3">

          {/* Welcome Message */}
          {(welcomeMessage || isJaiya) && messages.length === 0 && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-sm">
                <div 
                  className="text-gray-700 text-[14px] leading-relaxed font-medium prose prose-sm max-w-none prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: marked.parse(welcomeMessage || "Hello! I'm Super AI, your AI companion. I can help you find the perfect AI advisor for any situation.") as string
                  }}
                />
              </div>
            </div>
          )}

          {/* Chat History */}
          {messages.map((msg, index) => {
            // If it's Jaiya and the message looks like JSON, we might want to hide it or show the 'response' field
            let displayContent = msg.content;
            if (isJaiya && msg.role === 'assistant') {
              try {
                const jsonMatch = msg.content.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : msg.content;
                const data = JSON.parse(jsonStr);
                if (data.isfind) {
                  return null; // Hide redirecting messages
                }
                displayContent = data.response || msg.content;
              } catch (e) {
                // Not JSON, show as is
              }
            }

            return (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 max-w-[85%] shadow-sm rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'
                }`}>
                  <div 
                    className="text-[14px] leading-relaxed font-medium prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100"
                    dangerouslySetInnerHTML={{ __html: marked.parse(displayContent) as string }}
                  />
                </div>
              </div>
            );
          })}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span className="text-[12px] text-gray-400 font-medium">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {messages.length === 0 && suggestions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
              {suggestions.map((suggestion, index) => (
                <button 
                  key={index}
                  onClick={() => processMessage(suggestion)}
                  className="text-left p-4 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-all group shadow-sm"
                >
                  <p className="text-[13px] font-bold text-gray-800 group-hover:text-blue-700">{suggestion}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Click to ask</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <HumanAdvisorModal 
        isOpen={isHumanModalOpen} 
        onClose={() => setIsHumanModalOpen(false)}
        categoryKey={categoryKey}
        subcategoryTitle={subcategoryTitle}
      />
    </div>
  )
})
