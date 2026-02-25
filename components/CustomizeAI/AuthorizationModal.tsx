import React from "react";
import { Heart, Activity, Lock, Shield } from "lucide-react";

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

export default function AuthorizationModal({
  tracker,
  onAuthorize,
  onCancel,
}: {
  tracker: HealthTracker | null;
  onAuthorize: () => void;
  onCancel: () => void;
}) {
  if (!tracker) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-white px-6 pt-6 pb-5">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center shrink-0">
              {tracker.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Connect {tracker.name}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Authorize access to sync your health data
              </p>
            </div>
          </div>
        </div>

        {/* Permissions List */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            This app will be able to:
          </p>
          {[
            { icon: <Heart size={16} />, text: "Read health & fitness data" },
            { icon: <Activity size={16} />, text: "Access activity history" },
            { icon: <Lock size={16} />, text: "Securely store your data" },
          ].map((perm, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {perm.icon}
              </div>
              <p className="text-sm text-gray-700 font-medium">{perm.text}</p>
            </div>
          ))}
        </div>

        {/* Privacy Notice */}
        <div className="mx-6 mb-5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <div className="flex items-start gap-2">
            <Shield size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Your data is encrypted and stored securely. You can disconnect
              anytime.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onAuthorize}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all"
          >
            Authorize Access
          </button>
        </div>
      </div>
    </div>
  );
}
