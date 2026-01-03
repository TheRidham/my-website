import { Brain, Users, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

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

export default PricingSection;
