import React from "react";
import { HeartHandshake } from "lucide-react";
import SectionCard from "./SectionCard";
import InsightsInput from "./InsightsInput";

export default function HealthInsightsSection() {
  return (
    <SectionCard
      icon={<HeartHandshake size={20} className="text-primary" />}
      title="Health Insights"
      subtitle="Add personal health insights & observations"
    >
      <InsightsInput
        placeholder="e.g., 'Regular headaches after coffee', 'Improved sleep with evening walks'"
      />
    </SectionCard>
  );
}
