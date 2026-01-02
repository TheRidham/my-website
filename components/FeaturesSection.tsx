import { Brain, Camera, Globe, Mic, FileUp, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

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

export default FeaturesSection;
