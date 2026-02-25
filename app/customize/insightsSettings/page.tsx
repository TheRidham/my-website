"use client";
import MedicalReportsSection from "@/components/CustomizeAI/MedicalReportsSection";
import GeneticReportsSection from "@/components/CustomizeAI/GeneticReportsSection";
import HealthTrackerSection from "@/components/CustomizeAI/HealthTrackerSection";
import HealthInsightsSection from "@/components/CustomizeAI/HealthInsightsSection";

export default function InsightSetting() {
  return (
    <div>
      <div className="flex flex-col h-full pb-24 overflow-y-auto max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="px-5 py-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            Upload your health data to get highly personalized AI insights
          </p>
        </div>

        <div className="px-5 space-y-5">
          {/* ─── 1. Medical Reports ─────────────────────────────────────── */}
          <MedicalReportsSection />

          {/* ─── 2. Genetic Test Reports ────────────────────────────────── */}
          <GeneticReportsSection />

          {/* ─── 3. Sync Health Tracker ─────────────────────────────────── */}
          <HealthTrackerSection />

          {/* ─── 4. Health Insights ─────────────────────────────────────── */}
          <HealthInsightsSection />
        </div>
      </div>
    </div>
  );
}
