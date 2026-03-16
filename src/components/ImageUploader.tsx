"use client";

import { useState, useCallback, useRef } from "react";

interface ImageUploaderProps {
  onUpload: (file: File) => void;
}

export function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file (PNG, JPG, WEBP)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be under 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
      onUpload(file);
    },
    [onUpload]
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

  const handleClick = () => fileInputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-3 gradient-text">
          Transform 2D into 3D
        </h2>
        <p className="text-gray-400 text-lg">
          Upload any image and get a 3D model ready for Blender
        </p>
      </div>

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-12
          transition-all duration-300 text-center
          ${
            isDragging
              ? "border-[var(--accent-light)] bg-[var(--accent)]/10 dropzone-active"
              : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-light)]"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 mx-auto rounded-lg mb-4"
          />
        ) : (
          <div className="mb-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-500"
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
        )}

        <p className="text-lg font-medium text-gray-300">
          {isDragging ? "Drop your image here" : "Click or drag an image here"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supports PNG, JPG, WEBP up to 10MB
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        {[
          {
            step: "1",
            title: "Upload",
            desc: "Drop any 2D image",
          },
          {
            step: "2",
            title: "AI Process",
            desc: "Depth estimation & mesh generation",
          },
          {
            step: "3",
            title: "Download",
            desc: "Get .OBJ or .GLB for Blender",
          },
        ].map((item) => (
          <div
            key={item.step}
            className="text-center p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center mx-auto mb-2 text-sm font-bold">
              {item.step}
            </div>
            <h4 className="font-medium text-sm">{item.title}</h4>
            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
