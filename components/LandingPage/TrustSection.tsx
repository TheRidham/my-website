import { Shield, FileText, BadgeCheck } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

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

export default TrustSection;
