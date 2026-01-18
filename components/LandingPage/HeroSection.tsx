import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { Button } from "../ui/button";
import Image from "next/image";
import jaiyaAvatar from "@/assets/jaiya.jpg";
import Link from "next/link";

import {
  Users,
  Scale,
  Heart,
  Wallet,
  Coins,
  Star,
  Play,
  ArrowRight,
} from "lucide-react";

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center gradient-hero overflow-hidden pt-40">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-[10%] w-125 h-125 bg-primary/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-[10%] w-100 h-100 bg-secondary/8 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            {/* <AnimatedSection animation="fade-up">
              <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-muted-foreground font-medium">
                  Trusted by 200+ users world wide
                </span>
              </div>
            </AnimatedSection> */}
            <AnimatedSection animation="fade-up" delay={100}>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] mb-6">
                Your Personal AI Advisor
                <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-teal-500 block mt-2">
                  Available 24/7
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={200}>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0">
                Get instant advice from specialized AI advisors or connect with
                verified human experts across Health, Finance, Legal, Career &
                more
              </p>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Link href={"/auth/signup"}>
                <Button className="shadow-lg group relative overflow-hidden bg-primary text-white">
                  Start Free Chat
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"></div>
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/20"></div>
                </Button>
                </Link>
                <Link href={"/auth/signup"}>
                <Button className="shadow-lg group relative overflow-hidden border border-primary bg-white text-primary hover:bg-white">
                  <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Talk to Human Expert
                  <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-primary/70 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full"></div>
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/20"></div>
                </Button>
                </Link>
              </div>
            </AnimatedSection>

            {/* Trust Badges */}
            <AnimatedSection animation="fade-up" delay={400}>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-semibold">
                    $10 Free Credit
                  </span>
                </div>
                <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold">10+ Experts</span>
                </div>
                <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-semibold">20+ Categories</span>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Hero Visual */}
          <AnimatedSection
            animation="fade-left"
            delay={200}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <AnimatedSection animation="fade-up" className="flex">
                <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8 mx-auto">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    Trusted by 200+ users world wide
                  </span>
                </div>
              </AnimatedSection>
              {/* Main Phone Mockup */}
              <div className="bg-card rounded-3xl shadow-2xl shadow-zinc-500 p-4 mx-auto max-w-sm border border-border/50">
                <div className="bg-linear-to-br from-primary-lighter to-accent rounded-2xl p-6">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                      <Image
                        src={jaiyaAvatar}
                        alt="Super AI Avatar"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-card" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-foreground">
                        Super
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Active now
                      </p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-3 mb-4">
                    <div className="bg-card rounded-2xl rounded-tl-md p-4 shadow-sm max-w-[85%] border border-gray-400">
                      <p className="text-sm text-foreground">
                        I've been feeling tired lately. What could be the
                        reason?
                      </p>
                    </div>
                    <div className="bg-primary/10 rounded-2xl rounded-tr-md p-4 ml-auto max-w-[85%] border border-gray-400">
                      <p className="text-sm text-foreground">
                        There could be several reasons for fatigue. Let me ask
                        you a few questions to help identify the cause...
                      </p>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="bg-card rounded-xl p-3 flex items-center gap-3 shadow-sm border border-border/50">
                    <input
                      type="text"
                      placeholder="Ask anything..."
                      className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                    />
                    <button className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                      <ArrowRight className="w-4 h-4 text-primary-foreground" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -left-12 top-1/4 glass-card rounded-xl p-3 shadow-lg shadow-red-300 animate-bounce [animation-duration:4s]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm font-semibold">Health</span>
                </div>
              </div>

              <div
                className="absolute -right-8 top-1/3 glass-card rounded-xl p-3 shadow-lg shadow-green-300 animate-bounce [animation-duration:4s]"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold">Finance</span>
                </div>
              </div>

              <div
                className="absolute -left-4 bottom-1/4 glass-card rounded-xl p-3 shadow-lg shadow-primary/70 animate-bounce [animation-duration:4s]"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Scale className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">Legal</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
