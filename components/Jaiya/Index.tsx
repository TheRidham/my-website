'use client'

import React, { useRef, useState, useEffect} from 'react'
import { AIChat, AIChatHandle } from '../Chat/AIChat'
import { ChevronLeft, Wallet, History, Plus, User, Gift } from 'lucide-react'
import Image from 'next/image'
import jaiyaAvatar from "@/assets/jaiya.jpg";
import { ADVISOR_CATEGORIES } from '@/constant/advisors'
import { LucideIcon } from '../ui/LucideIcon'
import { HumanAdvisorModal } from '../Chat/HumanAdvisorModal'
import { Button } from '../ui/button'
import { usePayment } from '@/providers/PaymentProvider'
import AIChatHistorySheet from '../Chat/AIChatHistorySheet'
import AppDownloadBadges from '../AppDownloadBadges'
import { claimFreeOfferIfEligible } from '@/utils/promoCashClaim'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'

interface JaiyaProps {
  isSidebarOpen?: boolean;
  categoryKey?: string;
  subcategoryTitle?: string;
  advisorName?: string;
  advisorAvatar?: any;
  onBack?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
  //states for chat history
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false)
  const [msgHistory, setMsgHistory] = useState<Message[] | null>(null);
  const [isClaimingOffer, setIsClaimingOffer] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string>("");
  const [isEligible, setIsEligible] = useState(false);

  const {user, loading} = useAuth();

  useEffect(() => {
    if(loading) return;
    // Check if user is authenticated and not a guest
    const checkEligibility = async () => {
      
      if (!user) {
        setIsEligible(false);
        return;
      }
      
      // Check if user is a guest
      const db = getFirestore();
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const isGuest = (userData?.isGuest || userData?.isAnonymous) ?? false;
        const hasClaimed = userData?.hasClaimedFreeCash ?? false;
        if (isGuest || hasClaimed) setIsEligible(false);
        else setIsEligible(true);
      } else {
        // New user, not a guest
        setIsEligible(true);
      }
    };
    checkEligibility();
  }, [user, loading]);

  const isAdvisorChat = !!categoryKey;
  
  console.log(categoryKey, subcategoryTitle, isSidebarOpen)
  
  const category = categoryKey ? ADVISOR_CATEGORIES[categoryKey] : null;
  const subcategory = category && subcategoryTitle 
    ? category.categories.find(c => c.title === subcategoryTitle)
    : null;

  const handleNewChat = () => {
    chatRef.current?.clearMessages();
    setCurrentChatId(null);
    setMsgHistory(null);
  };

  const handleClaimFreeOffer = async () => {
    setIsClaimingOffer(true);
    try {
      const result = await claimFreeOfferIfEligible();
      setClaimMessage(result.message);
      
      if (result.success) {
        setIsEligible(false);
        setTimeout(() => setClaimMessage(""), 3000);
      }
    } finally {
      setIsClaimingOffer(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-secondary">
      {/* Promo Banner */}
      {!isAdvisorChat && isEligible && (
        <div className="bg-primary/15 px-6 py-1.5">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs font-semibold text-primary">
              🎉 $10 free credit on signup — Start your wellness journey today!
            </span>
            <button 
              onClick={handleClaimFreeOffer}
              disabled={isClaimingOffer}
              className="bg-primary hover:bg-primary/50 text-primary-foreground font-bold rounded-lg px-3 py-1 text-xs whitespace-nowrap disabled:opacity-50"
              title="Claim $10 free credit"
            >
              <Gift size={14} className="mr-0.5 inline" />
              Claim
            </button>
            {claimMessage && (
              <span className={`text-xs font-semibold ml-2 ${claimMessage.includes("success") ? "text-green-600" : "text-amber-600"}`}>
                {claimMessage}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`bg-transparent transition-all duration-300 ${!isSidebarOpen && "pl-12"}`}>
        <div className="w-full flex items-center justify-between px-6 py-1.5">
          <div className="flex items-center">
            {/* {(isAdvisorChat) && (
              <button 
                onClick={onBack}
                className="mr-4 text-gray-600 hover:text-primary transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )} */}
            <div className="flex items-center gap-4">
              {isAdvisorChat && (
                <div className="relative w-11 h-11 rounded-xl overflow-hidden border-2 border-white shadow-md bg-emerald-50 flex items-center justify-center">
                  <div 
                    className="w-full h-full flex items-center justify-center bg-muted text-primary"
                    // style={{ backgroundColor: category?.bgColor, color: category?.color }}
                  >
                    <LucideIcon name={subcategory?.icon || category?.icon || "Sparkles"} size={24} />
                  </div>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-black text-gray-900 text-[15px] tracking-tight">
                  {isAdvisorChat && subcategoryTitle}
                </span>
                <div className="flex items-center gap-1.5">
                  {isAdvisorChat ? (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      {category?.name} Expert
                    </span>
                  ) : (
                    <>
                      {/* <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Online</span> */}
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
                className="hidden md:flex items-center gap-2 bg-primary hover:bg-primtext-primary text-white font-bold rounded-xl px-4 py-2 text-xs"
              >
                <User size={16} />
                Connect with Human
              </Button>
            )}
            <button 
              onClick={handleNewChat}
              className="hidden md:inline-block p-2.5 text-gray-500 hover:text-primary hover:bg-emerald-50 rounded-xl transition-all" 
              title="New Chat"
            >
              <Plus size={20} />
            </button>
            <button onClick={() => setIsOpen(true)} className="hidden md:inline-block p-2.5 text-gray-500 hover:text-primary hover:bg-emerald-50 rounded-xl transition-all" title="Chat History">
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
          history={msgHistory}
        />
      </div>

      <HumanAdvisorModal 
        isOpen={isHumanModalOpen}
        onClose={() => setIsHumanModalOpen(false)}
        categoryKey={categoryKey}
        subcategoryTitle={subcategoryTitle}
      />
      <AIChatHistorySheet open={isOpen} setOpen={setIsOpen} setChatId={setCurrentChatId} setHistory={setMsgHistory} />
    </div>
  )
}

export default Jaiya
