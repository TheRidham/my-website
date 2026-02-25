import React, { useState } from "react";
import { Watch, Heart, Activity, Footprints, Moon, Flame, Loader2 } from "lucide-react";
import SectionCard from "./SectionCard";
import AuthorizationModal from "./AuthorizationModal";

interface HealthTracker {
  id: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  connecting: boolean;
  connectionStep?: string;
  connectionProgress?: number;
  metrics?: { label: string; value: string; icon: React.ReactNode }[];
}

export default function HealthTrackerSection({
  initialTrackers,
}: {
  initialTrackers?: HealthTracker[];
}) {
  const [trackers, setTrackers] = useState<HealthTracker[]>(
    initialTrackers || [
      {
        id: "apple",
        name: "Apple Health",
        icon: <Heart size={22} className="text-red-500" />,
        connected: false,
        connecting: false,
        metrics: [
          {
            label: "Steps",
            value: "8,432",
            icon: <Footprints size={14} className="text-primary" />,
          },
          {
            label: "Heart Rate",
            value: "72 bpm",
            icon: <Heart size={14} className="text-red-500" />,
          },
          {
            label: "Sleep",
            value: "7h 22m",
            icon: <Moon size={14} className="text-indigo-500" />,
          },
        ],
      },
      {
        id: "samsung",
        name: "Samsung Health",
        icon: <Activity size={22} className="text-blue-600" />,
        connected: false,
        connecting: false,
        metrics: [
          {
            label: "Steps",
            value: "6,120",
            icon: <Footprints size={14} className="text-primary" />,
          },
          {
            label: "Calories",
            value: "1,840",
            icon: <Flame size={14} className="text-orange-500" />,
          },
          {
            label: "Sleep",
            value: "6h 45m",
            icon: <Moon size={14} className="text-indigo-500" />,
          },
        ],
      },
      {
        id: "google",
        name: "Google Fit",
        icon: <Activity size={22} className="text-green-600" />,
        connected: false,
        connecting: false,
        metrics: [
          {
            label: "Steps",
            value: "9,870",
            icon: <Footprints size={14} className="text-primary" />,
          },
          {
            label: "Heart Rate",
            value: "68 bpm",
            icon: <Heart size={14} className="text-red-500" />,
          },
          {
            label: "Calories",
            value: "2,100",
            icon: <Flame size={14} className="text-orange-500" />,
          },
        ],
      },
    ]
  );

  const [authorizingTracker, setAuthorizingTracker] = useState<HealthTracker | null>(null);

  const toggleTracker = (id: string) => {
    const tracker = trackers.find((t) => t.id === id);
    if (!tracker) return;

    if (tracker.connected) {
      // Instant disconnect
      setTrackers((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                connected: false,
                connecting: false,
                connectionStep: undefined,
                connectionProgress: undefined,
              }
            : t,
        ),
      );
      return;
    }

    // Show authorization modal first
    setAuthorizingTracker(tracker);
  };

  const handleAuthorize = () => {
    if (!authorizingTracker) return;
    const id = authorizingTracker.id;
    setAuthorizingTracker(null);

    // Start connecting with realistic multi-step simulation
    // Step 1: Authorizing (0-30%)
    setTrackers((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              connecting: true,
              connectionStep: "Authorizing device...",
              connectionProgress: 0,
            }
          : t,
      ),
    );

    // Progress to 30% during authorization
    setTimeout(() => {
      setTrackers((prev) =>
        prev.map((t) =>
          t.id === id && t.connecting ? { ...t, connectionProgress: 30 } : t,
        ),
      );
    }, 800);

    // Step 2: Connecting to device (30-50%)
    setTimeout(() => {
      setTrackers((prev) =>
        prev.map((t) =>
          t.id === id && t.connecting
            ? {
                ...t,
                connectionStep: "Connecting to device...",
                connectionProgress: 35,
              }
            : t,
        ),
      );
    }, 1200);

    setTimeout(() => {
      setTrackers((prev) =>
        prev.map((t) =>
          t.id === id && t.connecting ? { ...t, connectionProgress: 50 } : t,
        ),
      );
    }, 1800);

    // Step 3: Fetching health data (50-75%)
    setTimeout(() => {
      setTrackers((prev) =>
        prev.map((t) =>
          t.id === id && t.connecting
            ? {
                ...t,
                connectionStep: "Fetching health data...",
                connectionProgress: 55,
              }
            : t,
        ),
      );
    }, 2200);

    setTimeout(() => {
      setTrackers((prev) =>
        prev.map((t) =>
          t.id === id && t.connecting ? { ...t, connectionProgress: 75 } : t,
        ),
      );
    }, 2800);

    // Step 4: Syncing recent activity (75-90%)
    setTimeout(() => {
      setTrackers((prev) =>
        prev.map((t) =>
          t.id === id && t.connecting
            ? {
                ...t,
                connectionStep: "Syncing recent activity...",
                connectionProgress: 80,
              }
            : t,
        ),
      );
    }, 3200);

    setTimeout(() => {
      setTrackers((prev) =>
        prev.map((t) =>
          t.id === id && t.connecting ? { ...t, connectionProgress: 90 } : t,
        ),
      );
    }, 3600);

    // Step 5: Finalizing (90-100%)
    setTimeout(() => {
      setTrackers((prev) =>
        prev.map((t) =>
          t.id === id && t.connecting
            ? {
                ...t,
                connectionStep: "Finalizing connection...",
                connectionProgress: 95,
              }
            : t,
        ),
      );
    }, 4000);

    // Step 6: Connected!
    setTimeout(() => {
      setTrackers((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                connected: true,
                connecting: false,
                connectionStep: undefined,
                connectionProgress: undefined,
              }
            : t,
        ),
      );
    }, 4500);
  };

  return (
    <>
      <AuthorizationModal
        tracker={authorizingTracker}
        onAuthorize={handleAuthorize}
        onCancel={() => setAuthorizingTracker(null)}
      />

      <SectionCard
        icon={<Watch size={20} className="text-primary" />}
        title="Sync Health Tracker"
        subtitle="Connect your wearables & health apps"
      >
        <div className="space-y-3">
          {trackers.map((tracker) => (
            <div
              key={tracker.id}
              className={`border rounded-2xl overflow-hidden transition-all ${tracker.connecting ? "border-primary/40 bg-primary/5" : tracker.connected ? "border-primary/30" : "border-gray-200 hover:border-primary/30"}`}
            >
              {/* Tracker Header */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  {tracker.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">
                    {tracker.name}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">
                    {tracker.connecting
                      ? tracker.connectionStep || "Initializing..."
                      : tracker.connected
                        ? "Last synced: 2 min ago"
                        : "Not connected"}
                  </p>
                </div>
                <button
                  onClick={() => toggleTracker(tracker.id)}
                  disabled={tracker.connecting}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-70
                      ${
                        tracker.connecting
                          ? "bg-primary/20 text-primary"
                          : tracker.connected
                            ? "bg-primary/10 text-primary hover:bg-red-50 hover:text-red-500"
                            : "bg-primary text-white hover:bg-primary/90 shadow-sm"
                      }`}
                >
                  {tracker.connecting && (
                    <Loader2 size={12} className="animate-spin" />
                  )}
                  {tracker.connecting
                    ? "Syncing..."
                    : tracker.connected
                      ? "Disconnect"
                      : "Connect"}
                </button>
              </div>

              {/* Loading bar during connection */}
              {tracker.connecting && (
                <div className="px-4 pb-3">
                  <div className="w-full bg-primary/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${tracker.connectionProgress || 0}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[10px] text-primary/70 font-medium">
                      {tracker.connectionStep || "Initializing..."}
                    </p>
                    <p className="text-[10px] text-primary/60 font-bold">
                      {tracker.connectionProgress || 0}%
                    </p>
                  </div>
                </div>
              )}

              {/* Synced Metrics (shown when connected) */}
              {tracker.connected &&
                !tracker.connecting &&
                tracker.metrics && (
                  <div className="px-4 pb-3.5 pt-0">
                    <div className="grid grid-cols-3 gap-2">
                      {tracker.metrics.map((m) => (
                        <div
                          key={m.label}
                          className="bg-gray-50 rounded-xl px-3 py-2.5 text-center"
                        >
                          <div className="flex items-center justify-center mb-1">
                            {m.icon}
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            {m.value}
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                            {m.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      </SectionCard>
    </>
  );
}
