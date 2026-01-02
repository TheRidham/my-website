"use client"
import { 
  Brain, 
  Users, 
  Scale, 
  Heart, 
  Wallet, 
  Briefcase, 
  GraduationCap, 
  MessageCircle,
  Camera,
  Pill,
  FileText,
  TrendingUp,
  Shield,
  Globe,
  Mic,
  FileUp,
  Coins,
  Check,
  Star,
  ChevronRight,
  Menu,
  X,
  Play,
  Sparkles,
  ArrowRight,
  Zap,
  Clock,
  BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect, useRef } from "react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import jaiyaAvatar from "@/assets/jaiya.jpg";
import Image from "next/image";
import Navbar from "@/components/Navbar";



// export default Navbar;

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center gradient-hero overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-[10%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-[10%] w-[400px] h-[400px] bg-secondary/8 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <AnimatedSection animation="fade-up">
              <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-muted-foreground font-medium">Trusted by 200+ users world wide</span>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="fade-up" delay={100}>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] mb-6">
                Your Personal AI Expert Network
                <span className="text-gradient block mt-2">Available 24/7</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={200}>
              <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Get instant advice from specialized AI advisors or connect with verified human experts across Health, Finance, Legal, Career & more
              </p>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Button variant="hero" size="lg" className="shadow-xl shadow-secondary/25 group">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Start Free Chat
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="heroOutline" size="lg" className="group">
                  <Users className="w-5 h-5" />
                  Talk to Human Expert
                </Button>
              </div>
            </AnimatedSection>

            {/* Trust Badges */}
            <AnimatedSection animation="fade-up" delay={400}>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-sm font-semibold">₹100 Free Credit</span>
                </div>
                <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">10+ Experts</span>
                </div>
                <div className="flex items-center gap-2 glass-card rounded-xl px-4 py-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-sm font-semibold">20+ Categories</span>
                </div>
              </div>
            </AnimatedSection>
          </div>

          {/* Hero Visual */}
          <AnimatedSection animation="fade-left" delay={200} className="relative hidden lg:block">
            <div className="relative">
              {/* Main Phone Mockup */}
              <div className="bg-card rounded-3xl shadow-2xl shadow-zinc-500 p-4 mx-auto max-w-sm border border-border/50">
                <div className="bg-linear-to-br from-primary-lighter to-accent rounded-2xl p-6">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                      <Image src={jaiyaAvatar} alt="Jaiya AI Avatar" className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-card" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-foreground">Jaiya</p>
                      <p className="text-xs text-muted-foreground">Active now</p>
                    </div>
                  </div>
                  
                  {/* Chat Messages */}
                  <div className="space-y-3 mb-4">
                    <div className="bg-card rounded-2xl rounded-tl-md p-4 shadow-sm max-w-[85%] border border-gray-400">
                      <p className="text-sm text-foreground">I've been feeling tired lately. What could be the reason?</p>
                    </div>
                    <div className="bg-primary/10 rounded-2xl rounded-tr-md p-4 ml-auto max-w-[85%] border border-gray-400">
                      <p className="text-sm text-foreground">There could be several reasons for fatigue. Let me ask you a few questions to help identify the cause...</p>
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

              <div className="absolute -right-8 top-1/3 glass-card rounded-xl p-3 shadow-lg shadow-green-300 animate-bounce [animation-duration:4s]" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold">Finance</span>
                </div>
              </div>

              <div className="absolute -left-4 bottom-1/4 glass-card rounded-xl p-3 shadow-lg shadow-blue-300 animate-bounce [animation-duration:4s]" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Scale className="w-4 h-4 text-blue-600" />
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

// Problem Section
const ProblemSection = () => {
  const problems = [
    {
      icon: Wallet,
      title: "Expensive consultations",
      description: "Traditional experts charge ₹500-2000 even for basic queries",
      color: "bg-red-50 text-red-500"
    },
    {
      icon: Clock,
      title: "Long waiting times",
      description: "Days or weeks to get a slot with the right expert",
      color: "bg-amber-50 text-amber-500"
    },
    {
      icon: Users,
      title: "Finding experts is hard",
      description: "No easy way to know who's trustworthy and qualified",
      color: "bg-orange-50 text-orange-500"
    }
  ];

  return (
    <section className="section-padding bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-secondary uppercase tracking-wider mb-4">The Problem</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Getting Expert Advice Shouldn't Be This Hard
          </h2>
          <p className="text-lg text-muted-foreground">
            Traditional consulting is broken. We're here to fix it.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
              <Card variant="feature" className="p-8 text-center card-hover h-full border-0 bg-background">
                <div className={`w-16 h-16 rounded-2xl ${problem.color} flex items-center justify-center mx-auto mb-6`}>
                  <problem.icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">{problem.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

// Solution Section - How JAI Works
const SolutionSection = () => {
  const solutions = [
    {
      icon: Brain,
      title: "Chat with Super AI",
      description: "Instant responses from specialized AI models trained in 50+ domains",
      features: ["Free to start", "Understands Hinglish", "Context-aware"],
      gradient: "from-primary to-blue-400",
      iconBg: "bg-primary/10 text-primary"
    },
    {
      icon: Users,
      title: "Connect with Human Experts",
      description: "Get professional advice from verified advisors",
      features: ["₹49 per session", "Real experts", "Chat or Voice"],
      gradient: "from-secondary to-secondary-light",
      iconBg: "bg-secondary/10 text-secondary"
    },
    {
      icon: Zap,
      title: "AI Judge & Analysis Tools",
      description: "Smart micro-apps for food analysis, medicine checker, lab reports & more",
      features: ["Image-based AI", "Instant results", "Save reports"],
      gradient: "from-emerald-500 to-teal-400",
      iconBg: "bg-emerald-50 text-emerald-600"
    }
  ];

  return (
    <section id="features" className="section-padding gradient-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-secondary uppercase tracking-wider mb-4">The Solution</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Three Ways to Get Answers
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the right solution for your needs
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {solutions.map((solution, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
              <Card variant="elevated" className="overflow-hidden group h-full card-hover">
                <div className={`h-1.5 bg-linear-to-r ${solution.gradient}`} />
                <CardHeader className="pt-8 pb-4">
                  <div className={`w-14 h-14 rounded-2xl ${solution.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                    <solution.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{solution.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{solution.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {solution.features.map((feature, fIndex) => (
                      <span 
                        key={fIndex}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent rounded-lg text-sm font-medium text-accent-foreground"
                      >
                        <Check className="w-3.5 h-3.5 text-primary" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Grid Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "50+ AI Advisor Categories",
      description: "From nutrition to tax advice, we've got you covered",
      items: ["Health", "Finance", "Legal", "Career", "Relationships", "Education"]
    },
    {
      icon: Camera,
      title: "Smart Analysis Tools",
      description: "Upload images for instant AI-powered analysis",
      items: ["Food Scanner", "Medicine Reader", "Lab Reports", "Investment Finder"]
    },
    {
      icon: Globe,
      title: "Bilingual Support",
      description: "Chat in English, Hindi, or Hinglish - we understand you"
    },
    {
      icon: Mic,
      title: "Voice Messages",
      description: "Too busy to type? Send voice messages and get transcriptions"
    },
    {
      icon: FileUp,
      title: "Document Sharing",
      description: "Share prescriptions, reports, contracts - get expert opinions"
    },
    {
      icon: Coins,
      title: "Wallet System",
      description: "Add money once, use across all services. Get ₹100 free on signup"
    }
  ];

  return (
    <section className="section-padding bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Features</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need, All in One App
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to make expert advice accessible to everyone
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 80}>
              <Card variant="feature" className="p-6 h-full card-hover border border-border/50 bg-background">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{feature.description}</p>
                {feature.items && (
                  <div className="flex flex-wrap gap-2">
                    {feature.items.map((item, iIndex) => (
                      <span 
                        key={iIndex}
                        className="text-xs px-2.5 py-1 bg-accent rounded-md font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

// Categories Section
const CategoriesSection = () => {
  const categories = [
    { icon: Heart, title: "Health & Wellness", items: ["Mental Health", "Nutrition", "Fitness", "General Medicine"], color: "bg-red-50 text-red-500", ring: "ring-red-100" },
    { icon: Wallet, title: "Finance", items: ["Investments", "Tax", "CA Services", "Debt Management"], color: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-100" },
    { icon: Scale, title: "Legal", items: ["Document Help", "Consumer Rights", "Property"], color: "bg-blue-50 text-blue-600", ring: "ring-blue-100" },
    { icon: Briefcase, title: "Career", items: ["Job Search", "Skill Development", "Interview Prep"], color: "bg-purple-50 text-purple-600", ring: "ring-purple-100" },
    { icon: Users, title: "Relationships", items: ["Family", "Dating", "Marriage Counseling"], color: "bg-pink-50 text-pink-500", ring: "ring-pink-100" },
    { icon: GraduationCap, title: "Education", items: ["Study Abroad", "Career Guidance", "Skill Building"], color: "bg-amber-50 text-amber-600", ring: "ring-amber-100" },
  ];

  return (
    <section id="categories" className="section-padding gradient-bg overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Categories</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Explore Our Expert Categories
          </h2>
          <p className="text-lg text-muted-foreground">
            Find the right advisor for any question you have
          </p>
        </AnimatedSection>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
          {categories.map((category, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 80}>
              <Card 
                variant="elevated" 
                className={`min-w-[300px] sm:min-w-[340px] p-6 snap-start cursor-pointer group card-hover`}
              >
                <div className={`w-14 h-14 rounded-2xl ${category.color} ring-4 ${category.ring} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                  <category.icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-4">{category.title}</h3>
                <div className="space-y-2.5 mb-5">
                  {category.items.map((item, iIndex) => (
                    <div key={iIndex} className="flex items-center gap-2.5 text-muted-foreground text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="p-0 h-auto text-primary font-semibold group/btn">
                  Explore 
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

// AI Tools Section
const AIToolsSection = () => {
  const tools = [
    {
      icon: Camera,
      title: "Nutrition Scanner",
      description: "Snap food photos, get instant calorie & nutrition info",
      color: "from-orange-500 to-amber-400"
    },
    {
      icon: Pill,
      title: "Medicine Checker",
      description: "Verify medicines, check interactions, understand prescriptions",
      color: "from-rose-500 to-pink-400"
    },
    {
      icon: FileText,
      title: "Lab Report Analyzer",
      description: "Upload blood reports, get AI interpretation",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: Scale,
      title: "AI Judge",
      description: "Settle debates with multi-perspective AI judging",
      color: "from-violet-500 to-purple-400"
    }
  ];

  return (
    <section className="section-padding bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-secondary uppercase tracking-wider mb-4">AI Tools</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Powerful AI Analysis at Your Fingertips
          </h2>
          <p className="text-lg text-muted-foreground">
            Upload images and documents for instant AI-powered insights
          </p>
        </AnimatedSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <AnimatedSection key={index} animation="scale" delay={index * 100}>
              <Card variant="feature" className="p-6 text-center group card-hover border-0 bg-background">
                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${tool.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500`}>
                  <tool.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{tool.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{tool.description}</p>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  return (
    <section id="pricing" className="section-padding gradient-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Pricing</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Transparent, Affordable Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Expert advice that doesn't break the bank
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <AnimatedSection animation="fade-up" delay={0}>
            <Card variant="pricing" className="p-8 h-full">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent rounded-full text-sm font-medium mb-4">
                  <Brain className="w-4 h-4 text-primary" />
                  AI Advisors
                </div>
                <div className="font-heading text-5xl font-bold mb-2">Free</div>
                <p className="text-muted-foreground">to start</p>
              </div>
              <ul className="space-y-4 mb-8">
                {["Unlimited AI conversations", "50+ specialized domains", "File sharing included", "Hinglish support", "Voice messages"].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="lg" className="w-full font-semibold">
                Start Free
              </Button>
            </Card>
          </AnimatedSection>

          {/* Premium Tier */}
          <AnimatedSection animation="fade-up" delay={100}>
            <Card variant="pricingFeatured" className="p-8 relative h-full glow-effect">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  POPULAR
                </span>
              </div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 rounded-full text-sm font-medium mb-4">
                  <Users className="w-4 h-4 text-secondary" />
                  Human Experts
                </div>
                <div className="font-heading text-5xl font-bold mb-2">₹49<span className="text-lg font-normal text-muted-foreground">/session</span></div>
                <p className="text-muted-foreground">per expert consultation</p>
              </div>
              <ul className="space-y-4 mb-8">
                {["Verified professionals", "Voice & text chat", "Document review", "Follow-up sessions", "₹100 free credit for new users"].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-secondary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="hero" size="lg" className="w-full font-semibold shadow-lg shadow-secondary/25">
                Claim Free Credit
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

// Trust Section
const TrustSection = () => {
  const trustItems = [
    {
      icon: Shield,
      title: "End-to-end Encryption",
      description: "All your chats and data are fully encrypted"
    },
    {
      icon: FileText,
      title: "GDPR, CCPA & DPDP Compliant",
      description: "We follow the strictest data protection standards"
    },
    {
      icon: BadgeCheck,
      title: "Verified Experts Only",
      description: "Every human expert is thoroughly vetted"
    }
  ];

  return (
    <section id="about" className="section-padding bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Trust & Security</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Your Privacy Matters
          </h2>
          <p className="text-lg text-muted-foreground">
            We take security and trust seriously
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {trustItems.map((item, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 100} className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.description}</p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

// Comparison Table Section
const ComparisonSection = () => {
  const comparisons = [
    { feature: "Response Time", traditional: "Hours to days", jai: "Instant" },
    { feature: "Cost", traditional: "₹500-2000", jai: "Free - ₹49" },
    { feature: "Availability", traditional: "Business hours", jai: "24/7" },
    { feature: "Language", traditional: "English only", jai: "Hindi + English" },
    { feature: "Analysis Tools", traditional: "None", jai: "Built-in AI tools" },
  ];

  return (
    <section className="section-padding gradient-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Comparison</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How It's Different
          </h2>
          <p className="text-lg text-muted-foreground">
            See why thousands are switching to JAI App
          </p>
        </AnimatedSection>

        <AnimatedSection animation="scale" className="max-w-3xl mx-auto">
          <Card variant="elevated" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-accent/30">
                    <th className="text-left p-5 font-heading font-semibold">Feature</th>
                    <th className="text-center p-5 font-heading font-semibold text-muted-foreground">Traditional</th>
                    <th className="text-center p-5 font-heading font-semibold text-primary">JAI App</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, index) => (
                    <tr key={index} className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors">
                      <td className="p-5 font-medium">{row.feature}</td>
                      <td className="p-5 text-center text-muted-foreground">{row.traditional}</td>
                      <td className="p-5 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          {row.jai}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </AnimatedSection>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Nutrition AI helped me lose 5kg in 2 months. The personalized advice was exactly what I needed!",
      name: "Priya",
      location: "Mumbai",
      avatar: "P",
      color: "from-pink-500 to-rose-400"
    },
    {
      quote: "Got my tax doubts cleared in minutes for free. Saved me a trip to the CA office!",
      name: "Rahul",
      location: "Delhi",
      avatar: "R",
      color: "from-blue-500 to-cyan-400"
    },
    {
      quote: "Human expert saved me from signing a bad contract. Worth every rupee!",
      name: "Sneha",
      location: "Bangalore",
      avatar: "S",
      color: "from-violet-500 to-purple-400"
    }
  ];

  return (
    <section className="section-padding bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Testimonials</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Real People, Real Results
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our users are saying
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
              <Card variant="feature" className="p-6 h-full card-hover border border-border/50 bg-background">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-primary-foreground font-semibold shadow-lg`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="section-padding gradient-cta relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Join 10,000+ Users Getting Smarter Advice
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Start with ₹100 free credit. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button variant="cta" size="xl" className="shadow-xl shadow-secondary/30 group">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Download JAI App
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
              alt="Get it on Google Play" 
              className="h-12 cursor-pointer hover:opacity-90 transition-opacity hover:scale-105 duration-300"
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
              alt="Download on App Store" 
              className="h-12 cursor-pointer hover:opacity-90 transition-opacity hover:scale-105 duration-300"
            />
          </div>

          <a href="#" className="text-primary hover:text-secondary transition-colors inline-flex items-center gap-1 font-medium">
            Or continue on web <ChevronRight className="w-4 h-4" />
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-primary-lighter py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl">JAI App</span>
            </div>
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed">
              AI + Human expertise in one app. Making expert advice accessible to everyone.
            </p>
            <p className="text-sm font-medium">Made in India 🇮🇳</p>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-5">Categories</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Health & Wellness</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Finance & Tax</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Legal Advice</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Career Guidance</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-5">Resources</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-5">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="mailto:support@jaiapp.in" className="hover:text-foreground transition-colors">support@jaiapp.in</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Instagram</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 JAI App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main Index Page
const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <CategoriesSection />
      <AIToolsSection />
      <PricingSection />
      <TrustSection />
      <ComparisonSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
