import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Nutrition AI helped me lose 5kg in 2 months. The personalized advice was exactly what I needed!",
      name: "Priya",
      location: "Mumbai",
      avatar: "P",
      color: "from-pink-500 to-rose-400"
    },
    {
      quote: "Got my tax doubts cleared in minutes for free. Saved me a trip to the CA office!",
      name: "Rahul",
      location: "Delhi",
      avatar: "R",
      color: "from-blue-500 to-cyan-400"
    },
    {
      quote: "Human expert saved me from signing a bad contract. Worth every penny!",
      name: "Sneha",
      location: "Bangalore",
      avatar: "S",
      color: "from-violet-500 to-purple-400"
    }
  ];

  return (
    <section className="section-padding bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Testimonials</span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Real People, Real Results
          </h2>
          <p className="text-lg text-muted-foreground">
            See what our users are saying
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
              <Card variant="feature" className="p-6 h-full card-hover border border-border/50 bg-background">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-primary-foreground font-semibold shadow-lg`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  </div>
                </div>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
