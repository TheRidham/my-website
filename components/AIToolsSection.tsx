import { Camera, Pill, FileText, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

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

export default AIToolsSection;
