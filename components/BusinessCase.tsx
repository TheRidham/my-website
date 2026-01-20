import { TrendingUp, CheckCircle2 } from "lucide-react";

const StatCard = ({
  value,
  title,
  description,
  delay,
}: {
  value: string;
  title: string;
  description: string;
  delay: string;
}) => (
  <div
    className="p-8 rounded-3xl bg-muted/50 border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all duration-300 animate-fade-in flex flex-col items-center text-center"
    style={{ animationDelay: delay }}
  >
    <div className="text-4xl md:text-5xl font-bold text-primary mb-4 font-heading">
      {value}
    </div>
    <h3 className="text-[16px] font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
      {description}
    </p>
  </div>
);

const FeaturePill = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-border/60 shadow-sm">
    <CheckCircle2 className="w-4 h-4 text-primary" />
    <span className="text-sm font-medium text-foreground">{label}</span>
  </div>
);

export default function BusinessCaseSection() {
  return (
    <section className="mt-24 bg-background rounded-2xl p-10">
      {/* Section Header */}
      <div className="text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border mb-6">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            The Business Case
          </span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight font-heading">
          Invest Less, <span className="text-primary">Gain More</span>
        </h2>

        <p className="text-[16px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Implementing Quik costs ~3% of your annual group
          insurance/health expenses
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard
          value="20%"
          title="Claims Reduction"
          description="Reduce insurance claims and eventually premium costs through preventive care"
          delay="0ms"
        />
        <StatCard
          value="35%"
          title="Productivity Improvement"
          description="Better presenteeism and positiveness with improved energy and mental health"
          delay="100ms"
        />
        <StatCard
          value="$5"
          title="ROI for Every $1 Spent"
          description="Typical return on investment within 1-2 years of implementation"
          delay="200ms"
        />
      </div>

      {/* Bottom Feature Card - Presenteeism */}
      <div
        className="p-6 max-w-3xl mx-auto md:p-12 rounded-2xl bg-muted/50 border border-border/60 text-center animate-fade-in"
        style={{ animationDelay: "300ms" }}
      >
        <h3 className="text-[16px] font-bold text-foreground mb-3 font-heading">
          The Hidden Killer: Presenteeism
        </h3>
        <p className="text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed text-sm">
            People at work but not productive, this is often more costly than absenteeism.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <FeaturePill label="Better Sleep" />
          <FeaturePill label="Illness" />
          <FeaturePill label="Stress" />
          <FeaturePill label="Energy Levels" />
        </div>
      </div>
    </section>
  );
}
