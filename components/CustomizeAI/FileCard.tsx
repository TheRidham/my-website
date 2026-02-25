import React from "react";
import { FileText, Loader2, X } from "lucide-react";
import StatusBadge from "./StatusBadge";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  status: "analyzed" | "processing" | "uploading" | "uploaded";
  date: string;
}

export default function FileCard({
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
