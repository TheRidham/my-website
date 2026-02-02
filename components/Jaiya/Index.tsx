'use client'

import React, { useRef, useState, useEffect} from 'react'
import { AIChat, AIChatHandle } from '../Chat/AIChat'
import { ChevronLeft, Gift } from 'lucide-react'
import Image from 'next/image'
import jaiyaAvatar from "@/assets/jaiya.jpg";
import { ADVISOR_CATEGORIES } from '@/constant/advisors'
import { HumanAdvisorModal } from '../Chat/HumanAdvisorModal'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { usePayment } from '@/providers/PaymentProvider'
import AIChatHistorySheet from '../Chat/AIChatHistorySheet'
import AppDownloadBadges from '../AppDownloadBadges'
import { claimFreeOfferIfEligible } from '@/utils/promoCashClaim'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useChat } from '@/providers/ChatProvider'

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
  onBack,
}: JaiyaProps) {
  const chatRef = useRef<AIChatHandle>(null);
  const [isHumanModalOpen, setIsHumanModalOpen] = useState(false);
  const [showAnonWarning, setShowAnonWarning] = useState(false);
  const [privacyMode, setPrivacyMode] = useState<'forYou' | 'anonymized'>('forYou');
  const { walletBalance } = usePayment();
  //states for chat history
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false)
  const [msgHistory, setMsgHistory] = useState<Message[] | null>(null);
  const [isClaimingOffer, setIsClaimingOffer] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string>("");
  const [isEligible, setIsEligible] = useState(false);

  const {user, loading} = useAuth();
  const { activeChat } = useChat();

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

  const handleNewChat = () => {
    chatRef.current?.clearMessages();
    setCurrentChatId(null);
    setMsgHistory(null);
    setPrivacyMode('forYou');
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
          onPrivacyModeChange={setPrivacyMode}
          initialSpeedMode={activeChat.speedMode}
          initialPrivacyMode={activeChat.privacyMode}
          isSidebarOpen={isSidebarOpen}
          walletBalance={walletBalance}
          privacyMode={privacyMode}
          onNewChat={handleNewChat}
          onOpenHistory={() => setIsOpen(true)}
          onConnectHuman={() => setIsHumanModalOpen(true)}
        />
      </div>

      <HumanAdvisorModal
        isOpen={isHumanModalOpen}
        onClose={() => setIsHumanModalOpen(false)}
        categoryKey={categoryKey}
        subcategoryTitle={subcategoryTitle}
      />
      <AIChatHistorySheet open={isOpen} setOpen={setIsOpen} setChatId={setCurrentChatId} setHistory={setMsgHistory} />

      {/* Anonymous Mode Warning Dialog - COMMENTED OUT */}
      {/* <Dialog open={showAnonWarning} onOpenChange={setShowAnonWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Privacy Warning</DialogTitle>
            <DialogDescription>
              You're in Anonymous mode. Your AI chat will be shared with the human expert
              to provide context. The chat will be saved and switched to "For You" mode.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowAnonWarning(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowAnonWarning(false);
                setIsHumanModalOpen(true);
              }}
            >
              Continue to Expert
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}
    </div>
  )
}

export default Jaiya
