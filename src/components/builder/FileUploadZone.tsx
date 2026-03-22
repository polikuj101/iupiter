"use client";

import { useState, useCallback, type DragEvent } from "react";

export function FileUploadZone({
  onFileUploaded,
}: {
  onFileUploaded: (filename: string, content: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadFile = useCallback(
    async (file: File) => {
      setError("");
      setIsUploading(true);

      try {
        if (file.size > 4.5 * 1024 * 1024) {
          throw new Error("File too large. Maximum 4.5MB.");
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        onFileUploaded(data.filename, data.text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [onFileUploaded]
  );

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-black bg-gray-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.xlsx,.xls,.csv,.docx,.txt"
          className="hidden"
          onChange={handleChange}
        />

        {isUploading ? (
          <p className="text-sm text-gray-500">Parsing document...</p>
        ) : (
          <>
            <p className="text-2xl mb-2">📄</p>
            <p className="text-sm font-medium text-gray-700">
              Drop a file here or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, Excel, Word, CSV, TXT — up to 4.5MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
