import { Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import Link from "next/link";

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
            Join 200+ Users Getting Smarter Advice
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Start with $10 free credit. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 text-white">
            <Button size="xl" className="bg-linear-to-r from-teal-400 to-blue-500 shadow-xl shadow-secondary/30 group">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Download JAI App
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <Link href={"https://play.google.com/store/apps/details?id=com.anonymous.jaiai"}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
              alt="Get it on Google Play" 
              className="h-12 cursor-pointer hover:opacity-90 transition-opacity hover:scale-105 duration-300"
              />
            </Link>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
              alt="Download on App Store" 
              className="h-12 cursor-pointer hover:opacity-90 transition-opacity hover:scale-105 duration-300"
            />
          </div>

          <p className="text-primary hover:text-secondary transition-colors inline-flex items-center gap-1 font-medium">
            Or continue on web <ArrowRight className="w-4 h-4" />
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default CTASection;
