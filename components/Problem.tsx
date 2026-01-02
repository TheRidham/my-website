import { Users, Wallet, Clock } from "lucide-react";

import { AnimatedSection } from "@/hooks/useScrollAnimation";
import { Card } from "./ui/card";

const ProblemSection = () => {
  const problems = [
    {
      icon: Wallet,
      title: "Expensive consultations",
      description:
        "Traditional experts charge ₹500-2000 even for basic queries",
      color: "bg-red-50 text-red-500",
    },
    {
      icon: Clock,
      title: "Long waiting times",
      description: "Days or weeks to get a slot with the right expert",
      color: "bg-amber-50 text-amber-500",
    },
    {
      icon: Users,
      title: "Finding experts is hard",
      description: "No easy way to know who's trustworthy and qualified",
      color: "bg-orange-50 text-orange-500",
    },
  ];

  return (
    <section className="section-padding bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-secondary uppercase tracking-wider mb-4">
            The Problem
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Getting Expert Advice Shouldn't Be This Hard
          </h2>
          <p className="text-lg text-muted-foreground">
            Traditional consulting is broken. We're here to fix it.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <AnimatedSection
              key={index}
              animation="fade-up"
              delay={index * 100}
            >
              <Card
                variant="feature"
                className="p-8 text-center card-hover h-full border-0 bg-background"
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${problem.color} flex items-center justify-center mx-auto mb-6`}
                >
                  <problem.icon className="w-7 h-7" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
