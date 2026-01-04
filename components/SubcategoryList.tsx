'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ADVISOR_CATEGORIES } from '@/constant/advisors'
import { LucideIcon } from '@/components/ui/LucideIcon'
import { useChat } from '@/providers/ChatProvider'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export function SubcategoryList({ categoryKey: propCategoryKey }: { categoryKey?: string }) {
  const params = useParams()
  const { switchChat } = useChat()
  
  const categoryKey = propCategoryKey || (params.category as string)

  if (!categoryKey || !ADVISOR_CATEGORIES[categoryKey]) return null

  const category = ADVISOR_CATEGORIES[categoryKey]

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-24">
      <div className="px-5 py-2 sticky top-0 bg-white backdrop-blur-md z-20 border-b border-gray-200/50 flex items-center gap-4">
        <Link 
          href="/home"
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={22} />
        </Link>
        <h2 className="text-base font-bold text-gray-900">{category.name}</h2>
      </div>

      <div className="p-3 grid grid-cols-1 gap-3">
        {category.categories.map((sub) => (
          <Link 
            key={sub.id}
            href={`/home/${categoryKey}/${encodeURIComponent(sub.title)}`}
            onClick={() => switchChat({
              name: sub.title,
              categoryKey: categoryKey,
              subcategoryTitle: sub.title,
              specialty: category.name,
              image: null
            })}
            className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group flex items-center gap-4"
          >
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform"
              style={{ backgroundColor: category.bgColor, color: category.color }}
            >
              <LucideIcon name={sub.icon} size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{sub.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{sub.tags.join(', ')}</p>
            </div>
            <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
