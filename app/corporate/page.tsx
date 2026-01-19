import DemoForm from "@/components/DemoForm";
import Image from "next/image";
import Logo from "@/assets/logo.png"
import Link from "next/link";

export default function WellspringPage() {
  return (
    <div className="min-h-screen font-sans bg-corporate text-foreground">
      {/* Navbar */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link className="flex items-center gap-2" href="/">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Image src={Logo} alt="quik advice" className="w-9 h-9" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Quik Advice
            </span>
          </Link>
          {/* <a href="/">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent h-9 rounded-md px-3 text-muted-foreground hover:text-foreground">
              ← Back to Chat
            </button>
          </a> */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-building2 w-4 h-4 text-primary"
            >
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
              <path d="M10 6h4"></path>
              <path d="M10 10h4"></path>
              <path d="M10 14h4"></path>
              <path d="M10 18h4"></path>
            </svg>
            <span className="text-sm font-medium text-primary">
              Trusted by 18 Enterprises
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Empower Your Team with
            <br />
            <span className="text-primary">Preventive Health Care</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Give your employees 24/7 access to Specialist AI and certified human
            experts for nutrition, lifestyle, supplements, and OTC advisory.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column: Features */}
          <div className="space-y-10">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Feature 1 */}
              <div
                className="p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: '0ms' }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-heart w-5 h-5 text-primary"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  Preventive Care
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Proactive health guidance to reduce healthcare costs
                </p>
              </div>

              {/* Feature 2 */}
              <div
                className="p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: '100ms' }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-leaf w-5 h-5 text-primary"
                  >
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  Nutrition &amp; Lifestyle
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Personalized diet and wellness recommendations
                </p>
              </div>

              {/* Feature 3 */}
              <div
                className="p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: '200ms' }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-shield w-5 h-5 text-primary"
                  >
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  OTC &amp; Supplement Advisory
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Expert guidance on safe self-care options
                </p>
              </div>

              {/* Feature 4 */}
              <div
                className="p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: '300ms' }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-users w-5 h-5 text-primary"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  Specialist AI + Human Experts
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  24/7 AI support backed by certified professionals
                </p>
              </div>
            </div>

            {/* Trusted By Stats */}
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <h3 className="font-semibold text-foreground mb-4">
                Trusted by leading organizations
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3">
                  <div className="text-2xl font-bold text-primary mb-1">
                    40%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Reduction in unnecessary doctor visits
                  </div>
                </div>
                <div className="text-center p-3">
                  <div className="text-2xl font-bold text-primary mb-1">
                    2M+
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Consultations completed
                  </div>
                </div>
                <div className="text-center p-3">
                  <div className="text-2xl font-bold text-primary mb-1">
                    98%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    User satisfaction rate
                  </div>
                </div>
                <div className="text-center p-3">
                  <div className="text-2xl font-bold text-primary mb-1">
                    24/7
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Always available support
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              {[
                'HIPAA Compliant',
                'SOC 2 Certified',
                'Enterprise Ready',
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border/60"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-circle-check w-4 h-4 text-primary"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                  <span className="text-sm text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Demo Form */}
          <div className="lg:sticky lg:top-24">
            <DemoForm />
          </div>
        </div>

        {/* Personal Health Team Section */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-heart w-4 h-4 text-primary"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              </svg>
              <span className="text-sm font-medium text-primary">
                Complete Health Support
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Give Every Employee Their Own
              <br />
              <span className="text-primary">Personal Health Team</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Imagine if every employee had access to a personal trainer, a
              personal nutritionist, and a personal physician—all available 24/7.
              That's exactly what Wellspring delivers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Personal Trainer */}
            <div
              className="relative p-8 rounded-3xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-xl transition-all duration-300 animate-fade-in group"
              style={{ animationDelay: '0ms' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="px-2 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  On-demand fitness expertise
                </div>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/15 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-dumbbell w-10 h-10 text-primary"
                >
                  <path d="M14.4 14.4 9.6 9.6"></path>
                  <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"></path>
                  <path d="m21.5 21.5-1.4-1.4"></path>
                  <path d="M3.9 3.9 2.5 2.5"></path>
                  <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center">
                Personal Trainer
              </h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                Customized fitness plans, exercise guidance, and workout tracking
                tailored to your goals and fitness level
              </p>
            </div>

            {/* Personal Nutritionist */}
            <div
              className="relative p-8 rounded-3xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-xl transition-all duration-300 animate-fade-in group"
              style={{ animationDelay: '100ms' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Tailored nutrition guidance
                </div>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/15 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-apple w-10 h-10 text-primary"
                >
                  <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path>
                  <path d="M10 2c1 .5 2 2 2 5"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center">
                Personal Nutritionist
              </h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                Personalized meal plans, dietary recommendations, and nutrition
                coaching based on your health profile
              </p>
            </div>

            {/* Personal Physician */}
            <div
              className="relative p-8 rounded-3xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-xl transition-all duration-300 animate-fade-in group"
              style={{ animationDelay: '200ms' }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  24/7 medical guidance
                </div>
              </div>
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/15 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-stethoscope w-10 h-10 text-primary"
                >
                  <path d="M11 2v2"></path>
                  <path d="M5 2v2"></path>
                  <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"></path>
                  <path d="M8 15a6 6 0 0 0 12 0v-3"></path>
                  <circle cx="20" cy="10" r="2"></circle>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3 text-center">
                Personal Physician
              </h3>
              <p className="text-muted-foreground leading-relaxed text-center">
                Expert guidance on OTC medications, symptom assessment, and
                general health advice for everyday wellness
              </p>
            </div>
          </div>

          <div className="mt-12 p-8 rounded-3xl">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Why settle for generic health advice?
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Traditional employee wellness programs offer one-size-fits-all
                solutions. With Wellspring, every employee gets personalized
                guidance from AI specialists backed by certified human experts—
                whether they need help with their workout routine, optimizing
                their diet, or understanding which over-the-counter medication
                is right for their symptoms.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                {[
                  'Personalized to each employee',
                  'Available anytime, anywhere',
                  'AI + Human expert hybrid',
                ].map((text, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border/60"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-circle-check w-4 h-4 text-primary"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                    <span className="text-foreground">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Powerful Micro AI Apps */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Powerful Micro AI Apps
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your employees get access to our suite of specialized micro AI
              applications
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              className="text-center p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: '0ms' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-camera w-8 h-8 text-white"
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                  <circle cx="12" cy="13" r="3"></circle>
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Nutrition Scanner
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Snap food photos, get instant calorie &amp; nutrition info
              </p>
            </div>
            <div
              className="text-center p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-pink-500 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-pill w-8 h-8 text-white"
                >
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
                  <path d="m8.5 8.5 7 7"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Medicine Checker
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Verify medicines, check interactions, understand prescriptions
              </p>
            </div>
            <div
              className="text-center p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: '200ms' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-file-text w-8 h-8 text-white"
                >
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                  <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                  <path d="M10 9H8"></path>
                  <path d="M16 13H8"></path>
                  <path d="M16 17H8"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Lab Report Analyzer
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload blood reports, get AI interpretation
              </p>
            </div>
            <div
              className="text-center p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: '300ms' }}
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-scan w-8 h-8 text-white"
                >
                  <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                  <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Derma AI</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Scan skin conditions, get instant dermatology insights
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What Our Clients Say
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              See how Wellspring has helped organizations improve employee
              wellness
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div
              className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: '0ms' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-quote w-8 h-8 text-primary/20 mb-4"
              >
                <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
                <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
              </svg>
              <p className="text-foreground leading-relaxed mb-6">
                "Wellspring has transformed how our employees approach their
                health. The 24/7 access to experts means fewer sick days and
                happier team members."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
                  alt="Sarah Mitchell"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold text-foreground">
                    Sarah Mitchell
                  </div>
                  <div className="text-sm text-muted-foreground">
                    HR Director, TechFlow Inc.
                  </div>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-star w-4 h-4 fill-primary text-primary"
                  >
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div
              className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-quote w-8 h-8 text-primary/20 mb-4"
              >
                <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
                <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
              </svg>
              <p className="text-foreground leading-relaxed mb-6">
                "The nutrition and supplement advisory helped me optimize my
                health routine. I've never felt better, and the app makes it so
                easy to get expert advice."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                  alt="James Anderson"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold text-foreground">
                    James Anderson
                  </div>
                  <div className="text-sm text-muted-foreground">
                    CEO, Greenleaf Wellness
                  </div>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-star w-4 h-4 fill-primary text-primary"
                  >
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                  </svg>
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div
              className="p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/30 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: '200ms' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-quote w-8 h-8 text-primary/20 mb-4"
              >
                <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
                <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"></path>
              </svg>
              <p className="text-foreground leading-relaxed mb-6">
                "Our employees love the AI-powered tools. The Lab Report
                Analyzer alone has saved countless hours of confusion and
                unnecessary worry."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
                  alt="Emily Thompson"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold text-foreground">
                    Emily Thompson
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Benefits Manager, Horizon Healthcare
                  </div>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-star w-4 h-4 fill-primary text-primary"
                  >
                    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="mt-24 py-16 px-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Join 18+ Enterprises Getting Smarter Health Advice
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Available on all platforms. No credit card required to get started.
          </p>
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium mb-8">
            <span className="flex items-center gap-2">
              Download Wellspring App
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-arrow-right w-5 h-5"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </span>
          </button>
          <div className="flex items-center justify-center gap-4 mb-6">
            <Link
              href="https://play.google.com/store/apps/details?id=com.anonymous.jaiai"
              target="_blank"
              className="inline-block transition-transform hover:scale-105"
              aria-label="Download on Google Play"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-foreground text-background rounded-lg">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"></path>
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-80">GET IT ON</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </div>
            </Link>
            <Link
              href="https://apps.apple.com/in/app/jai-quick-personal-advisory/id6755586022"
              target="_blank"
              className="inline-block transition-transform hover:scale-105"
              aria-label="Download on App Store"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-foreground text-background rounded-lg">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"></path>
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-80">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </div>
            </Link>
          </div>
          <Link
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            href="/"
          >
            Or continue on web
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-right w-4 h-4"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>
        </section>
      </main>

      <footer className="border-t border-border/40 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Quik Advice. Empowering preventive health through Micro AI and
            human expertise.
          </p>
        </div>
      </footer>
    </div>
  );
}