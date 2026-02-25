import React, { useState, useRef, useCallback } from "react";
import { FileText } from "lucide-react";
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

const MEDICAL_CATEGORIES = ["Lab Report", "MRI", "CT SCAN", "X-Ray"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function MedicalReportsSection({
  initialFiles = [],
}: {
  initialFiles?: UploadedFile[];
}) {
  const [medicalFiles, setMedicalFiles] = useState<UploadedFile[]>(initialFiles);
  const [activeMedicalCategory, setActiveMedicalCategory] = useState("Lab Report");
  const medicalInputRef = useRef<HTMLInputElement>(null);

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

  const removeMedicalFile = (id: string) => {
    setMedicalFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
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
  );
}
