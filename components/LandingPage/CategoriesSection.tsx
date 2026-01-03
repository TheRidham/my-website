import { Heart, Wallet, Scale, Briefcase, Users, GraduationCap, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

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

export default CategoriesSection;
