"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  FileText,
  Upload,
  Dna,
  Activity,
  Sparkles,
  CheckCircle2,
  Clock,
  X,
  Watch,
  Heart,
  Footprints,
  Moon,
  Flame,
  ChevronRight,
  Plus,
  MessageCircle,
  Loader2,
  Shield,
  Lock,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  status: "analyzed" | "processing" | "uploading" | "uploaded";
  date: string;
}

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

// ─── Dummy Data ──────────────────────────────────────────────────────────────

const DUMMY_MEDICAL_REPORTS: UploadedFile[] = [];

const DUMMY_GENETIC_REPORTS: UploadedFile[] = [];

const GENETIC_CATEGORIES = [
  "DNA Analysis",
  "Oncology",
  "Carrier Screening",
  "Pharmacogenomics",
];

const MEDICAL_CATEGORIES = ["Lab Report", "MRI", "CT SCAN", "X-Ray"];

const QUICK_QUESTIONS = [
  "What does my latest blood report indicate?",
  "Are my cholesterol levels normal?",
  "What lifestyle changes do my reports suggest?",
  "Do I have any genetic predispositions?",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function AuthorizationModal({
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

function StatusBadge({ status }: { status: UploadedFile["status"] }) {
  const config: Record<
    UploadedFile["status"],
    { style: string; icon: React.ReactNode; label: string }
  > = {
    analyzed: {
      style: "bg-primary/15 text-primary",
      icon: <CheckCircle2 size={12} />,
      label: "Analyzed",
    },
    processing: {
      style: "bg-amber-100 text-amber-700",
      icon: <Clock size={12} className="animate-spin" />,
      label: "Processing",
    },
    uploading: {
      style: "bg-blue-100 text-blue-700",
      icon: <Loader2 size={12} className="animate-spin" />,
      label: "Uploading",
    },
    uploaded: {
      style: "bg-emerald-100 text-emerald-700",
      icon: <CheckCircle2 size={12} />,
      label: "Uploaded",
    },
  };
  const { style, icon, label } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${style}`}
    >
      {icon}
      {label}
    </span>
  );
}

function FileCard({
  file,
  onRemove,
}: {
  file: UploadedFile;
  onRemove: (id: string) => void;
}) {
  const isUploading = file.status === "uploading";
  return (
    <div
      className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-3 group transition-all ${isUploading ? "border-blue-200 bg-blue-50/30" : "border-gray-200 hover:border-primary/30 hover:shadow-sm"}`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isUploading ? "bg-blue-100" : "bg-primary/10"}`}
      >
        {isUploading ? (
          <Loader2 size={18} className="text-blue-600 animate-spin" />
        ) : (
          <FileText size={18} className="text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {file.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-gray-400 font-medium">
            {file.type}
          </span>
          <span className="text-[10px] text-gray-300">•</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {file.size}
          </span>
          <span className="text-[10px] text-gray-300">•</span>
          <span className="text-[10px] text-gray-400 font-medium">
            {file.date}
          </span>
        </div>
        {/* Progress bar for uploading */}
        {isUploading && (
          <div className="mt-1.5 w-full bg-blue-100 rounded-full h-1 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full animate-pulse"
              style={{ width: "70%" }}
            />
          </div>
        )}
      </div>
      <StatusBadge status={file.status} />
      {!isUploading && (
        <button
          onClick={() => onRemove(file.id)}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg transition-all"
        >
          <X size={14} className="text-red-400" />
        </button>
      )}
    </div>
  );
}

function UploadZone({
  onUpload,
  acceptLabel,
  inputRef,
  accept,
}: {
  onUpload: () => void;
  acceptLabel: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        onUpload();
      }}
      className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
        ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-gray-200 hover:border-primary/40 hover:bg-primary/5"}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Upload size={24} className="text-primary" />
      </div>
      <p className="text-sm font-bold text-gray-700">
        Drop files here or <span className="text-primary">browse</span>
      </p>
      <p className="text-xs text-gray-400 mt-1">{acceptLabel}</p>
    </div>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  subtitle,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start gap-3 mb-1">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">
                {title}
              </h2>
              {badge && (
                <span className="bg-primary/15 text-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="px-6 pb-6">{children}</div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CustomizePage() {
  // Medical Reports state
  const [medicalFiles, setMedicalFiles] = useState<UploadedFile[]>(
    DUMMY_MEDICAL_REPORTS,
  );
  const [activeMedicalCategory, setActiveMedicalCategory] =
    useState("Lab Report");
  const medicalInputRef = useRef<HTMLInputElement>(null);

  // Genetic Reports state
  const [geneticFiles, setGeneticFiles] = useState<UploadedFile[]>(
    DUMMY_GENETIC_REPORTS,
  );
  const [activeGeneticCategory, setActiveGeneticCategory] =
    useState("DNA Analysis");
  const geneticInputRef = useRef<HTMLInputElement>(null);

  // Health Trackers state
  const [trackers, setTrackers] = useState<HealthTracker[]>([
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
  ]);

  // Health Highlights state
  const [highlightText, setHighlightText] = useState("");

  // Authorization Modal state
  const [authorizingTracker, setAuthorizingTracker] =
    useState<HealthTracker | null>(null);

  // ─── Simulated File Upload Handler ─────────────────────────────────────

  const simulateFileUpload = useCallback(
    (
      files: FileList | null,
      setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>,
      typeLabel: string,
    ) => {
      if (!files || files.length === 0) return;

      const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        name: file.name,
        type: typeLabel,
        size: formatFileSize(file.size),
        status: "uploading" as const,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }));

      // Add files in "uploading" state
      setFiles((prev) => [...newFiles, ...prev]);

      // Simulate upload: uploading → uploaded (1.5s) → processing (3s) → analyzed (5s)
      newFiles.forEach((newFile) => {
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id ? { ...f, status: "uploaded" as const } : f,
            ),
          );
        }, 2000);

        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id ? { ...f, status: "processing" as const } : f,
            ),
          );
        }, 4000);

        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id ? { ...f, status: "analyzed" as const } : f,
            ),
          );
        }, 5500);
      });
    },
    [],
  );

  const handleMedicalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    simulateFileUpload(e.target.files, setMedicalFiles, "Lab Report");
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  const handleGeneticFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    simulateFileUpload(e.target.files, setGeneticFiles, activeGeneticCategory);
    e.target.value = "";
  };

  // Fallback for drag-and-drop (creates a fake file entry)
  const handleMedicalDrop = () => {
    const fakeFile: UploadedFile = {
      id: Date.now().toString(),
      name: `Report_${Date.now()}.pdf`,
      type: "Lab Report",
      size: "1.2 MB",
      status: "uploading",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    setMedicalFiles((prev) => [fakeFile, ...prev]);
    setTimeout(
      () =>
        setMedicalFiles((prev) =>
          prev.map((f) =>
            f.id === fakeFile.id ? { ...f, status: "uploaded" } : f,
          ),
        ),
      1500,
    );
    setTimeout(
      () =>
        setMedicalFiles((prev) =>
          prev.map((f) =>
            f.id === fakeFile.id ? { ...f, status: "processing" } : f,
          ),
        ),
      3000,
    );
    setTimeout(
      () =>
        setMedicalFiles((prev) =>
          prev.map((f) =>
            f.id === fakeFile.id ? { ...f, status: "analyzed" } : f,
          ),
        ),
      5500,
    );
  };

  const handleGeneticDrop = () => {
    const fakeFile: UploadedFile = {
      id: Date.now().toString(),
      name: `Genetic_${activeGeneticCategory.replace(/\s/g, "_")}_${Date.now()}.vcf`,
      type: activeGeneticCategory,
      size: "5.6 MB",
      status: "uploading",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
    setGeneticFiles((prev) => [fakeFile, ...prev]);
    setTimeout(
      () =>
        setGeneticFiles((prev) =>
          prev.map((f) =>
            f.id === fakeFile.id ? { ...f, status: "uploaded" } : f,
          ),
        ),
      1500,
    );
    setTimeout(
      () =>
        setGeneticFiles((prev) =>
          prev.map((f) =>
            f.id === fakeFile.id ? { ...f, status: "processing" } : f,
          ),
        ),
      3000,
    );
    setTimeout(
      () =>
        setGeneticFiles((prev) =>
          prev.map((f) =>
            f.id === fakeFile.id ? { ...f, status: "analyzed" } : f,
          ),
        ),
      5500,
    );
  };

  // ─── Simulated Tracker Connect ─────────────────────────────────────────

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

  const removeMedicalFile = (id: string) => {
    setMedicalFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const removeGeneticFile = (id: string) => {
    setGeneticFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      {/* Authorization Modal */}
      <AuthorizationModal
        tracker={authorizingTracker}
        onAuthorize={handleAuthorize}
        onCancel={() => setAuthorizingTracker(null)}
      />

      <div className="flex flex-col h-full pb-24 overflow-y-auto max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={20} className="text-primary" />
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Customize Your AI
            </h1>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Upload your health data to get highly personalized AI insights
          </p>
        </div>

        <div className="px-5 space-y-5">
          {/* ─── 1. Medical Reports ─────────────────────────────────────── */}
          <SectionCard
            icon={<FileText size={20} className="text-primary" />}
            title="Medical Reports"
            subtitle="Lab reports, MRI, CT Scan, X-Ray & more"
            badge={`${medicalFiles.length} files`}
          >
            {/* Category Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
              {MEDICAL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveMedicalCategory(cat)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all
                  ${
                    activeMedicalCategory === cat
                      ? "bg-primary text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <UploadZone
              onUpload={handleMedicalDrop}
              acceptLabel="PDF, DICOM, JPG, PNG — up to 50 MB"
              inputRef={medicalInputRef}
              accept=".pdf,.dcm,.jpg,.png"
            />
            <input
              ref={medicalInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.dcm,.jpg,.png"
              multiple
              onChange={handleMedicalFileSelect}
            />

            {medicalFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {medicalFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onRemove={removeMedicalFile}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          {/* ─── 2. Genetic Test Reports ────────────────────────────────── */}
          <SectionCard
            icon={<Dna size={20} className="text-primary" />}
            title="Genetic Test Reports"
            subtitle="DNA analysis, Oncology & Genetic testing"
            badge={`${geneticFiles.length} files`}
          >
            {/* Category Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
              {GENETIC_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveGeneticCategory(cat)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all
                  ${
                    activeGeneticCategory === cat
                      ? "bg-primary text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <UploadZone
              onUpload={handleGeneticDrop}
              acceptLabel="VCF, PDF, CSV — Genetic test results"
              inputRef={geneticInputRef}
              accept=".vcf,.pdf,.csv"
            />
            <input
              ref={geneticInputRef}
              type="file"
              className="hidden"
              accept=".vcf,.pdf,.csv"
              multiple
              onChange={handleGeneticFileSelect}
            />

            {geneticFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {geneticFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onRemove={removeGeneticFile}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          {/* ─── 3. Sync Health Tracker ─────────────────────────────────── */}
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

          {/* ─── 4. Health Highlights (Placeholder) ─────────────────────── */}
          <SectionCard
            icon={<Sparkles size={20} className="text-primary" />}
            title="Health Highlights"
            subtitle="Add notes & ask quick questions"
            badge="Coming Soon"
          >
            {/* Add Highlight Input */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={highlightText}
                onChange={(e) => setHighlightText(e.target.value)}
                placeholder="Add a health note or highlight..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-gray-400"
              />
              <button className="bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5">
                <Plus size={14} />
                Add
              </button>
            </div>

            {/* Quick Questions */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                Quick Questions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    className="flex items-center gap-2 text-left px-3.5 py-2.5 rounded-xl border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  >
                    <MessageCircle
                      size={14}
                      className="text-gray-400 group-hover:text-primary shrink-0 transition-colors"
                    />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-primary transition-colors">
                      {q}
                    </span>
                    <ChevronRight
                      size={12}
                      className="ml-auto text-gray-300 group-hover:text-primary shrink-0 transition-colors"
                    />
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
