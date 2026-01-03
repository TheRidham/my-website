import Navbar from "@/components/LandingPage/Navbar";
import HeroSection from "@/components/LandingPage/HeroSection";
import ProblemSection from "@/components/LandingPage/Problem";
import SolutionSection from "@/components/LandingPage/SolutionSection";
import FeaturesSection from "@/components/LandingPage/FeaturesSection";
import CategoriesSection from "@/components/LandingPage/CategoriesSection";
import AIToolsSection from "@/components/LandingPage/AIToolsSection";
import PricingSection from "@/components/LandingPage/PricingSection";
import TrustSection from "@/components/LandingPage/TrustSection";
import ComparisonSection from "@/components/LandingPage/ComparisonSection";
import TestimonialsSection from "@/components/LandingPage/TestimonialsSection";
import CTASection from "@/components/LandingPage/CTASection";
import Footer from "@/components/LandingPage/Footer";

export default function Home() {
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
}
