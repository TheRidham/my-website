import React, { useState } from "react";
import { Upload } from "lucide-react";

export default function UploadZone({
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
