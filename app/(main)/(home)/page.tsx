"use client";

import React, { useEffect, useState } from 'react'
import { 
  Search, Star,
  ChevronDown, ChevronUp,
  Shield, X,
  ChevronLeft,
  Loader,
  Loader2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db, functions } from '@/lib/firebase'
import jaiyaAvatar from "@/assets/jaiya.jpg";
import { ADVISOR_CATEGORIES } from '@/constant/advisors';
import { LucideIcon } from '@/components/ui/LucideIcon';
import { useChat } from '@/providers/ChatProvider';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { HumanAdvisorModal } from '@/components/Chat/HumanAdvisorModal'
import { usePrompts } from '@/providers/PromptsProvider';
import { httpsCallable } from 'firebase/functions';

const RECOMMENDED_QUESTIONS = [
  "What should I eat to lose weight?",
  "How can I improve my sleep?",
  "What exercises should I do daily?",
  "How do I manage stress?",
  "What are the best vitamins for me?",
  "How can I build muscle?",
  "What's a healthy diet plan?",
  "How do I stay motivated with fitness?",
];

type Advisor = {
  uid: string
  name: string
  profilePhoto: string
  specialization: string[]
  busy: boolean
  totalUsersAttended: number
  isActive: boolean
  rating?: number
  experience?: string
}

function getCategoryKey(spec: string) {
  const map: Record<string, string> = {
    'Nutrition & Diet': 'nutrition',
    Fitness: 'fitness',
    'General Medicine': 'medical',
    'Mental Health': 'mental',
    Legal: 'lawyer',
    Career: 'career',
  }
  return map[spec] || 'general'
}

function HomePage() {
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [advisors, setAdvisors] = useState<Advisor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAdvisor, setSelectedAdvisor] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSearchScreen, setShowSearchScreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const { resetChat, switchChat } = useChat()
  const { jaiyaPrompt } = usePrompts();

  const categoriesList = Object.entries(ADVISOR_CATEGORIES).map(([key, value]) => ({
    key,
    name: value.name,
    icon: value.icon,
    bgColor: value.bgColor,
    color: value.color,
    className: `flex flex-col items-center gap-2 group cursor-pointer`
  }));

  const displayedCategories = showAllCategories ? categoriesList : categoriesList.slice(0, 8);
  const user = getAuth().currentUser;
  const router = useRouter();

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const q = query(
          collection(db, 'advisors'),
          where('isActive', '==', true),
          limit(10)
        )
        const snapshot = await getDocs(q)
        const data = snapshot.docs.map((doc) => ({
          ...(doc.data() as Advisor),
          uid: doc.id,
        }))
        setAdvisors(data)
      } catch (error) {
        console.error('Error fetching advisors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdvisors()
  }, [])

  const handleAdvisorClick = (advisor: Advisor) => {
    setSelectedAdvisor({
      id: advisor.uid,
      name: advisor.name,
      specialty: advisor.specialization?.[0] || 'Expert Advisor',
      image: advisor.profilePhoto || jaiyaAvatar,
      rating: advisor.rating || 4.8,
      experience: advisor.experience || '5+ years'
    })
    setIsModalOpen(true)
  }

  const handleAdvisorSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim() || isSearching) return

    setIsSearching(true)

    try {

      if (!jaiyaPrompt) {
        console.error('System prompt (jaiyaPrompt) is not available')
        resetChat()
        setShowSearchScreen(false)
        setSearchQuery('')
        setIsSearching(false)
        return
      }

      const callOpenAI = httpsCallable<any, { text: string }>(functions, 'callOpenAI');
    
      const { data: response } = await callOpenAI({
        systemPrompt: jaiyaPrompt.prompt,
        formattedMessages: [{ role: 'user', text: query }]
      });

      if (response && response.text) {
        try {
          const jsonMatch = response.text.match(/\{[\s\S]*\}/)
          const jsonStr = jsonMatch ? jsonMatch[0] : response.text

          const data = JSON.parse(jsonStr)
          console.log(data)

          if (data.isfind && data.categoryTag) {
            const categoryTag = data.categoryTag?.toLowerCase()
            
            let category = ADVISOR_CATEGORIES[categoryTag]
            if (!category) {
              const foundCategory = Object.values(ADVISOR_CATEGORIES).find(
                (cat) => cat.name.toLowerCase() === data.categoryName?.toLowerCase(),
              )
              if (foundCategory) {
                category = foundCategory
              }
            }

            if (category) {
              const targetTag = Object.keys(ADVISOR_CATEGORIES).find(
                (key) => ADVISOR_CATEGORIES[key] === category,
              )

              const subcategory = category.categories.find(
                (c) =>
                  c.title.toLowerCase() ===
                  data.subCategoryName?.toLowerCase(),
              )

              if (subcategory) {
                switchChat({
                  name: subcategory.title,
                  categoryKey: targetTag,
                  subcategoryTitle: subcategory.title,
                  initialMessage: query,
                })
                setShowSearchScreen(false)
                setSearchQuery('')
              } else {
                // No subcategory found, navigate to category
                router.push(`/${targetTag}`)
                setShowSearchScreen(false)
                setSearchQuery('')
              }
            } else {
              // Category not found, fallback to Super AI
            }
          } else {
            switchChat({
              name: "Super AI",
              initialMessage: query,
            })
            setShowSearchScreen(false)
            setSearchQuery('')
          }
        } catch (e) {
          console.error("JSON parse error:", e)
          // Fallback on error
          resetChat()
          setShowSearchScreen(false)
          setSearchQuery('')
        }
      } else {
        // No response or message, fallback to Super AI
        resetChat()
        setShowSearchScreen(false)
        setSearchQuery('')
      }
    } catch (error) {
      console.error("API call error:", error)
      // Fallback on error
      resetChat()
      setShowSearchScreen(false)
      setSearchQuery('')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="flex flex-col h-full pb-24">
      {/* Search Screen Overlay */}
      {showSearchScreen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Search Bar at Top */}
          <div className="px-3 py-3 border-b border-gray-200">
            <div className="relative flex items-center gap-1 w-full">
              <button
                onClick={() => {
                  setShowSearchScreen(false)
                  setSearchQuery('')
                }}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <div className="relative flex-1 group">
                <input
                  type="search"
                  autoFocus
                  placeholder="Ask me anything and I will connect you to that AI Advisor"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => 
                    e.key === 'Enter' && handleAdvisorSearch(searchQuery)
                  }
                  className="w-full bg-secondary rounded-2xl py-2.5 px-4 text-sm focus:outline-none border border-gray-200 focus:border-primary/70 focus:ring-1 focus:ring-ring transition-all shadow-sm"
                />
              </div>
              <button
                onClick={() => {
                  handleAdvisorSearch(searchQuery)
                }}
                disabled={isSearching}
                className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <div className="animate-spin">
                    <Loader2
                      className="text-primary"
                      size={18}
                    />
                  </div>
                ) : (
                  <Search
                    className="text-gray-400"
                    size={18}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Recommended Questions */}
          <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="animate-spin">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full" />
                </div>
                <p className="text-sm text-gray-500">Searching for AI Advisor...</p>
              </div>
            ) : (
              <>
                <h3 className="text-[15px] font-bold text-gray-900 mb-4">
                  Recommended Questions
                </h3>
                <div className="flex flex-col gap-3">
                  {RECOMMENDED_QUESTIONS.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAdvisorSearch(question)}
                      className="text-left p-4 rounded-2xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <p className="text-sm text-gray-700 group-hover:text-primary font-medium">
                        {question}
                      </p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="px-5 pt-4 pb-2 sticky top-0 z-20 backdrop-blur-2xl">
        <div className="relative flex items-center gap-3 w-full">
          {/* Search input wrapper */}
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
              size={18}
            />

            <input
              type="text"
              placeholder="Ask me anything and I will connect you to that AI Advisor"
              onClick={() => setShowSearchScreen(true)}
              className="w-full bg-secondary rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none border border-gray-200 focus:border-primary/70 focus:ring-1 focus:ring-ring transition-all shadow-sm cursor-pointer"
            />
          </div>

          {/* Avatar + label */}
          <button 
            onClick={() => {
              resetChat();
              switchChat({ name: "Super AI" })
            }}
            className="flex flex-col items-center hover:opacity-80 transition-opacity cursor-pointer bg-none border-none p-0"
            title="Switch to Super AI"
          >
            <div className="relative w-9 h-9 rounded-lg overflow-hidden">
              <Image
                src={jaiyaAvatar}
                alt="Super AI logo"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-xs font-medium whitespace-nowrap">Super AI</p>
          </button>
        </div>
      </div>
      <div className='px-5 pb-4'>
        {/* Stats Section */}
        <div className="flex justify-between gap-4 mt-2 px-2 py-3 border rounded-lg">
          <div className="flex-1 text-center">
            <div className="text-sm font-bold text-gray-900">2.1M+</div>
            <div className="text-xs text-muted-foreground">Chats</div>
          </div>
          <div className="flex-1 text-center border-l border-r border-gray-200">
            <div className="text-sm font-bold text-gray-900">$5</div>
            <div className="text-xs text-muted-foreground">Per Expert</div>
          </div>
          <div className="flex-1 text-center">
            <Shield size={18} className='text-primary mx-auto mb-1'/>
            <div className="text-xs text-muted-foreground">HIPAA</div>
          </div>
        </div>
      </div>

      {/* Advisor Categories */}
      <div className="mt-2 px-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
            Explore Advisor Categories
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-x-3 gap-y-6">
          {displayedCategories.map((cat) => (
            <Link 
              key={cat.key} 
              href={`/${cat.key}`}
              className={cat.className}
            >
              <div 
                className="w-15 h-15 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-xs group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300 bg-muted text-primary"
                // style={{ backgroundColor: cat.bgColor, color: cat.color }}
              >
                <LucideIcon name={cat.icon} size={26} />
              </div>
              <span className="text-[11px] text-center font-semibold text-gray-600 leading-tight group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
        <button
          onClick={() => setShowAllCategories(!showAllCategories)}
          className="w-full mt-6 py-3 text-primary text-sm font-bold flex items-center justify-center gap-2 rounded-xl hover:bg-primary/5 transition-colors"
        >
          {showAllCategories ? (
            <>
              View Less <ChevronUp size={16} />
            </>
          ) : (
            <>
              View More <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      {/* AI Apps Section */}
      {/* <div className="mt-10 px-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
              AI Apps
            </h2>
            <span className="bg-linear-to-r from-primary to-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
              New
            </span>
          </div>
          <button className="text-primary text-xs font-bold hover:underline">
            See All
          </button>
        </div>
        <div className="grid grid-cols-4 gap-x-4 gap-y-6">
          {aiApps.map((app) => (
            <div
              key={app.name}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div
                className={`w-15 h-15 rounded-full ${app.color} flex items-center justify-center text-white shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}
              >
                <app.icon size={26} />
              </div>
              <span className="text-[11px] text-center font-semibold text-gray-600 leading-tight group-hover:text-primary transition-colors">
                {app.name}
              </span>
            </div>
          ))}
        </div>
      </div> */}

      {/* Featured Advisors */}
      <div className="mt-10 px-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
            Featured Advisors
          </h2>
          <Link
            href="/allAdvisors"
            className="text-primary text-xs font-bold hover:underline"
          >
            See All
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="min-w-40 bg-white rounded-3xl p-4 border border-gray-200 animate-pulse">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-3" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto" />
              </div>
            ))
          ) : (
            advisors.map((advisor) => (
              <div 
                key={advisor.uid}
                onClick={() => handleAdvisorClick(advisor)}
                className="min-w-40 bg-white rounded-3xl p-4 border border-gray-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <Image
                    src={advisor.profilePhoto || jaiyaAvatar}
                    alt={advisor.name}
                    fill
                    className="rounded-2xl object-cover group-hover:scale-105 transition-transform"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      !advisor.busy
                        ? "bg-green-500"
                        : "bg-amber-500"
                    }`}
                  />
                </div>
                <h3 className="text-[13px] font-bold text-gray-900 text-center line-clamp-1">
                  {advisor.name}
                </h3>
                <p className="text-[10px] text-primary font-bold text-center uppercase tracking-wider mt-0.5">
                  {advisor.specialization?.[0] || 'Expert'}
                </p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-bold text-gray-600">
                    {advisor.rating || 4.8}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedAdvisor && (
        <HumanAdvisorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedAdvisor={selectedAdvisor}
        />
      )}
    </div>
  );
}

export default HomePage;
