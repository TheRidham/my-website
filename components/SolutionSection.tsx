import { Brain, Users, Zap, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

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

export default SolutionSection;
