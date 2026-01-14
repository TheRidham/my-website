import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const ComparisonSection = () => {
  const comparisons = [
    { feature: "Response Time", traditional: "Hours to days", jai: "Instant" },
    { feature: "Cost", traditional: "$50-200", jai: "Free - $5" },
    { feature: "Availability", traditional: "Business hours", jai: "24/7" },
    { feature: "Language", traditional: "English only", jai: "Hindi + English" },
    { feature: "Analysis Tools", traditional: "None", jai: "Built-in AI tools" },
  ];

  return (
    <section className="section-padding gradient-bg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Comparison</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How It's Different
          </h2>
          <p className="text-lg text-muted-foreground">
            See why thousands are switching to JAI App
          </p>
        </AnimatedSection>

        <AnimatedSection animation="scale" className="max-w-3xl mx-auto">
          <Card variant="elevated" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-accent/30">
                    <th className="text-left p-5 font-heading font-semibold">Feature</th>
                    <th className="text-center p-5 font-heading font-semibold text-muted-foreground">Traditional</th>
                    <th className="text-center p-5 font-heading font-semibold text-primary">JAI App</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, index) => (
                    <tr key={index} className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors">
                      <td className="p-5 font-medium">{row.feature}</td>
                      <td className="p-5 text-center text-muted-foreground">{row.traditional}</td>
                      <td className="p-5 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          {row.jai}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ComparisonSection;
