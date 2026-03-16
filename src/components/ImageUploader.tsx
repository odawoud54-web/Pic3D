"use client";

import { useCallback, useState } from "react";

interface ImageUploaderProps {
  onImageSelected: (file: File, preview: string) => void;
  isProcessing: boolean;
}

export default function ImageUploader({
  onImageSelected,
  isProcessing,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPreview(dataUrl);
        onImageSelected(file, dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragging
            ? "border-purple-400 bg-purple-500/10 scale-[1.02]"
            : "border-gray-600 hover:border-purple-500/50 hover:bg-white/5"
        } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Upload preview"
              className="max-h-48 mx-auto rounded-lg shadow-lg"
            />
            <p className="text-gray-400 text-sm">
              Click or drag to replace image
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-8">
            <div className="flex justify-center">
              <svg
                className="w-16 h-16 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-300">
                Drop your 2D image here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse -- PNG, JPG, WebP supported
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
