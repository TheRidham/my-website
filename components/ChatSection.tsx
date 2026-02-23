"use client";
import { useState, useEffect } from 'react';
import { Bot, Brain, Heart, Leaf, Salad, Users, Video } from 'lucide-react';
import Link from 'next/link';
import { usePrice } from '@/providers/PriceProvider';
import { useChat } from '@/providers/ChatProvider';
import { useRouter } from 'next/navigation';

export default function ChatSection() {
  // 1. Set the starting number
  const { price, videoFee } = usePrice()
  const [count, setCount] = useState(2456678);
  const { isSidebarOpen, setIsSidebarOpen } = useChat();

  const router = useRouter();

  // 2. Use useEffect to handle the "live" increasing logic
  useEffect(() => {
    // Optional: Check localStorage to see if we have a higher number from a previous visit
    // This makes the number "remember" it grew even after a refresh
    const savedCount = typeof window !== 'undefined' ? localStorage.getItem('count') : null;
    if (savedCount) {
      const parsed = parseInt(savedCount, 10);
      if (parsed > count) setCount(parsed);
    }

    // Create an interval to increase the number every 3 seconds
    const interval = setInterval(() => {
      setCount((prev) => {
        const newCount = prev + 1; // Increment by 1
        localStorage.setItem('count', newCount.toString()); // Save it
        return newCount;
      });
    }, 10000); // Change 3000 to how fast you want it to tick (in ms)

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  function handleExpertCallAndVideo() {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(true);
    }
    router.push("/allAdvisors");
  }

  return (
    <section className="py-8 flex items-center justify-center">
      <div className="max-w-2xl mx-auto w-full px-0 text-center space-y-8">
          {/* Top Graphic Section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150"></div>

              {/* Main Card */}
              <div className="relative flex items-center gap-6 bg-gradient-to-r from-secondary/80 via-secondary/60 to-secondary/80 px-6 py-4 rounded-3xl border border-border/30 shadow-lg backdrop-blur-sm">

                {/* AI Specialists Group */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center -space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-2 border-background shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                      <Salad className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center border-2 border-background shadow-lg transform rotate-6 hover:rotate-0 transition-transform duration-300">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">AI Specialists</span>
                </div>

                {/* Divider with Heart */}
                <div className="flex flex-col items-center gap-1 h-full justify-center">
                  <div className="w-px h-6 bg-gradient-to-b from-transparent via-border/50 to-transparent"></div>
                  <Heart className="w-4 h-4 text-primary/60 animate-pulse-soft" />
                  <div className="w-px h-6 bg-gradient-to-b from-transparent via-border/50 to-transparent"></div>
                </div>

                {/* Health Experts Group */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center -space-x-3">
                    <div className="relative flex shrink-0 overflow-hidden rounded-full w-12 h-12 border-2 border-background shadow-lg ring-2 ring-primary/10">
                      <img className="aspect-square h-full w-full object-cover" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" alt="Doctor 1" />
                    </div>
                    <div className="relative flex shrink-0 overflow-hidden rounded-full w-12 h-12 border-2 border-background shadow-lg ring-2 ring-primary/10">
                      <img className="aspect-square h-full w-full object-cover" src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face" alt="Doctor 2" />
                    </div>
                    <div className="relative flex shrink-0 overflow-hidden rounded-full w-12 h-12 border-2 border-background shadow-lg ring-2 ring-primary/10">
                      <img className="aspect-square h-full w-full object-cover" src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face" alt="Doctor 3" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Human Experts</span>
                </div>

              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-6 max-w-lg mx-auto">
            <h2 className="text-2xl md:text-4xl font-heading font-semibold text-foreground leading-tight">
              Your Personal Health Team
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
             Get presidential-level care from a private health team and a deeply personalized<span className="text-foreground font-medium"> AI built around your body, environment & preferences </span>  
            </p>

            {/* Pill Statistic */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full hover:bg-primary/15 transition-colors cursor-default">
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-bold">{count.toLocaleString()}</span>
              <span className="text-xs text-primary/80 font-medium">times people helped</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleExpertCallAndVideo}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-lg font-bold text-xs transition-all hover:shadow-md"
              >
                <Users className="w-4 h-4" />
                Expert Chat ${price}
              </button>
              <button
                onClick={handleExpertCallAndVideo}
                className="inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2.5 rounded-lg font-bold text-xs border border-border transition-all hover:shadow-md"
              >
                <Video className="w-4 h-4" />
                Video Call ${videoFee}
              </button>
            </div>
          </div>
      </div>
    </section>
  );
}
