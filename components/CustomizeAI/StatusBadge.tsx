import React from "react";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  status: "analyzed" | "processing" | "uploading" | "uploaded";
  date: string;
}

export default function StatusBadge({ status }: { status: UploadedFile["status"] }) {
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
