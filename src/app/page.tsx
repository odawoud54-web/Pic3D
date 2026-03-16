"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import ImageUploader from "@/components/ImageUploader";
import SkeletonToggle from "@/components/SkeletonToggle";
import ExportPanel from "@/components/ExportPanel";

const ThreeViewer = lazy(() => import("@/components/ThreeViewer"));

interface Vertex {
  x: number;
  y: number;
  z: number;
}

interface Face {
  a: number;
  b: number;
  c: number;
}

interface SkeletonData {
  joints: { name: string; x: number; y: number; z: number }[];
  bones: { from: string; to: string }[];
}

interface GenerationResult {
  analysis: {
    description: string;
    objectRegions: {
      name: string;
      bounds: { x: number; y: number; width: number; height: number };
      avgDepth: number;
    }[];
  };
  mesh: {
    vertexCount: number;
    faceCount: number;
    vertices: Vertex[];
    faces: Face[];
    normals: Vertex[];
    skeleton: SkeletonData | null;
  };
  exports: {
    obj: string;
    blenderScript: string;
  };
}

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageSelected = useCallback((file: File, preview: string) => {
    setSelectedFile(file);
    setImagePreview(preview);
    setResult(null);
    setError(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/generate-3d", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate 3D model");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-sm bg-gray-950/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-lg">
              3D
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Pic3D
              </h1>
              <p className="text-xs text-gray-500">
                AI-Powered 2D to 3D Converter
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 rounded-md bg-gray-800/50 border border-gray-700/50">
              Powered by Gemini
            </span>
            <span className="px-2 py-1 rounded-md bg-gray-800/50 border border-gray-700/50">
              Blender Ready
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Transform{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              2D Images
            </span>{" "}
            into{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-orange-400 bg-clip-text text-transparent">
              3D Models
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Upload any 2D picture and our AI will analyze depth, detect objects,
            and generate a 3D model ready for Blender -- complete with optional
            skeleton for animation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Controls */}
          <div className="space-y-6">
            <div className="bg-gray-900/40 rounded-2xl border border-gray-800/50 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-200">
                1. Upload Image
              </h3>
              <ImageUploader
                onImageSelected={handleImageSelected}
                isProcessing={isProcessing}
              />

              {selectedFile && (
                <button
                  onClick={handleGenerate}
                  disabled={isProcessing}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                    isProcessing
                      ? "bg-gray-700 text-gray-400 cursor-wait"
                      : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50"
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5 spin-slow"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray="32"
                          strokeLinecap="round"
                        />
                      </svg>
                      Analyzing with Gemini AI...
                    </span>
                  ) : (
                    "Generate 3D Model"
                  )}
                </button>
              )}

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Controls Panel */}
            {result && (
              <div className="bg-gray-900/40 rounded-2xl border border-gray-800/50 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">
                  2. Controls
                </h3>

                <SkeletonToggle
                  enabled={showSkeleton}
                  onToggle={setShowSkeleton}
                  hasSkeleton={!!result.mesh.skeleton}
                />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">
                    Model Info
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-800/50 rounded-lg p-2.5">
                      <span className="text-gray-500">Vertices</span>
                      <p className="text-gray-200 font-mono font-bold">
                        {result.mesh.vertexCount.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-2.5">
                      <span className="text-gray-500">Faces</span>
                      <p className="text-gray-200 font-mono font-bold">
                        {result.mesh.faceCount.toLocaleString()}
                      </p>
                    </div>
                    {result.mesh.skeleton && (
                      <>
                        <div className="bg-gray-800/50 rounded-lg p-2.5">
                          <span className="text-gray-500">Joints</span>
                          <p className="text-cyan-400 font-mono font-bold">
                            {result.mesh.skeleton.joints.length}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-2.5">
                          <span className="text-gray-500">Bones</span>
                          <p className="text-orange-400 font-mono font-bold">
                            {result.mesh.skeleton.bones.length}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-400">
                    AI Description
                  </h4>
                  <p className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3">
                    {result.analysis.description}
                  </p>
                </div>
              </div>
            )}

            {/* Export Panel */}
            {result && (
              <div className="bg-gray-900/40 rounded-2xl border border-gray-800/50 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">
                  3. Export for Blender
                </h3>
                <p className="text-sm text-gray-400">
                  Download the OBJ model file and Blender Python script. Run the
                  script in Blender to import the model with skeleton
                  automatically.
                </p>
                <ExportPanel
                  objContent={result.exports.obj}
                  blenderScript={result.exports.blenderScript}
                />
              </div>
            )}
          </div>

          {/* Right Column - 3D Viewer */}
          <div className="space-y-4">
            <div className="bg-gray-900/40 rounded-2xl border border-gray-800/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-200">
                  3D Preview
                </h3>
                {result && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Drag to rotate</span>
                    <span>|</span>
                    <span>Scroll to zoom</span>
                  </div>
                )}
              </div>

              {result ? (
                <Suspense
                  fallback={
                    <div className="w-full h-[500px] bg-gray-900/50 rounded-2xl flex items-center justify-center">
                      <p className="text-gray-500">Loading 3D viewer...</p>
                    </div>
                  }
                >
                  <ThreeViewer
                    vertices={result.mesh.vertices}
                    faces={result.mesh.faces}
                    normals={result.mesh.normals}
                    skeleton={result.mesh.skeleton}
                    showSkeleton={showSkeleton}
                  />
                </Suspense>
              ) : (
                <div className="w-full h-[500px] bg-gray-900/50 rounded-2xl flex flex-col items-center justify-center border border-gray-800/30">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/10 to-cyan-500/10 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-500/20 glow-pulse" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    Upload an image and generate to see the 3D model
                  </p>
                </div>
              )}
            </div>

            {/* How it works */}
            {!result && (
              <div className="bg-gray-900/40 rounded-2xl border border-gray-800/50 p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4">
                  How It Works
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      step: "1",
                      title: "Upload",
                      desc: "Upload any 2D image (photo, drawing, etc.)",
                      color: "from-purple-500 to-purple-600",
                    },
                    {
                      step: "2",
                      title: "AI Analysis",
                      desc: "Gemini AI analyzes depth, objects, and structure",
                      color: "from-cyan-500 to-cyan-600",
                    },
                    {
                      step: "3",
                      title: "3D Generation",
                      desc: "A 3D mesh with depth displacement is created",
                      color: "from-blue-500 to-blue-600",
                    },
                    {
                      step: "4",
                      title: "Export to Blender",
                      desc: "Download OBJ + Blender script with skeleton",
                      color: "from-orange-500 to-orange-600",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}
                      >
                        {item.step}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-gray-600">
          Pic3D -- AI-powered 2D to 3D conversion using Google Gemini.
          Export models to Blender with automatic skeleton rigging.
        </div>
      </footer>
    </div>
  );
}
