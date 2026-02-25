import React, { useState, useRef, useCallback } from "react";
import { Dna } from "lucide-react";
import SectionCard from "./SectionCard";
import UploadZone from "./UploadZone";
import FileCard from "./FileCard";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  status: "analyzed" | "processing" | "uploading" | "uploaded";
  date: string;
}

const GENETIC_CATEGORIES = [
  "DNA Analysis",
  "Oncology",
  "Carrier Screening",
  "Pharmacogenomics",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function GeneticReportsSection({
  initialFiles = [],
}: {
  initialFiles?: UploadedFile[];
}) {
  const [geneticFiles, setGeneticFiles] = useState<UploadedFile[]>(initialFiles);
  const [activeGeneticCategory, setActiveGeneticCategory] = useState("DNA Analysis");
  const geneticInputRef = useRef<HTMLInputElement>(null);

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

  const handleGeneticFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    simulateFileUpload(e.target.files, setGeneticFiles, activeGeneticCategory);
    e.target.value = "";
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

  const removeGeneticFile = (id: string) => {
    setGeneticFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
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
  );
}
