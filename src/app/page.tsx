"use client";

import { useState, useCallback } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { ModelViewer } from "@/components/ModelViewer";
import { Header } from "@/components/Header";
import { ProcessingStatus } from "@/components/ProcessingStatus";

export type AppState =
  | { stage: "idle" }
  | { stage: "uploading" }
  | { stage: "processing"; progress: number; message: string }
  | {
      stage: "done";
      originalImage: string;
      depthMap: string;
      objUrl: string;
      glbUrl: string;
    }
  | { stage: "error"; message: string };

export default function Home() {
  const [state, setState] = useState<AppState>({ stage: "idle" });

  const handleUpload = useCallback(async (file: File) => {
    setState({ stage: "uploading" });

    try {
      // Step 1: Upload image and get depth map
      setState({
        stage: "processing",
        progress: 20,
        message: "Analyzing image depth...",
      });

      const formData = new FormData();
      formData.append("image", file);

      const depthRes = await fetch("/api/depth", {
        method: "POST",
        body: formData,
      });

      if (!depthRes.ok) {
        const err = await depthRes.json();
        throw new Error(err.error || "Failed to estimate depth");
      }

      const { depthMap, originalImage } = await depthRes.json();

      // Step 2: Generate 3D mesh from depth map
      setState({
        stage: "processing",
        progress: 60,
        message: "Generating 3D mesh...",
      });

      const meshRes = await fetch("/api/mesh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depthMap, originalImage }),
      });

      if (!meshRes.ok) {
        const err = await meshRes.json();
        throw new Error(err.error || "Failed to generate mesh");
      }

      const { objUrl, glbUrl } = await meshRes.json();

      setState({
        stage: "done",
        originalImage,
        depthMap,
        objUrl,
        glbUrl,
      });
    } catch (error) {
      setState({
        stage: "error",
        message:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  }, []);

  const handleReset = useCallback(() => {
    setState({ stage: "idle" });
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {(state.stage === "idle" || state.stage === "error") && (
          <div className="w-full max-w-2xl">
            {state.stage === "error" && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center">
                {state.message}
              </div>
            )}
            <ImageUploader onUpload={handleUpload} />
          </div>
        )}

        {(state.stage === "uploading" || state.stage === "processing") && (
          <ProcessingStatus
            progress={state.stage === "processing" ? state.progress : 5}
            message={
              state.stage === "processing"
                ? state.message
                : "Uploading image..."
            }
          />
        )}

        {state.stage === "done" && (
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Original + Depth side by side */}
              <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)]">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  Original Image
                </h3>
                <img
                  src={state.originalImage}
                  alt="Original"
                  className="w-full rounded-lg object-contain max-h-64"
                />
              </div>
              <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)]">
                <h3 className="text-sm font-medium text-gray-400 mb-3">
                  AI Depth Map
                </h3>
                <img
                  src={state.depthMap}
                  alt="Depth Map"
                  className="w-full rounded-lg object-contain max-h-64"
                />
              </div>
            </div>

            {/* 3D Preview */}
            <div className="bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)] mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-3">
                3D Preview
              </h3>
              <div className="h-[400px] rounded-lg overflow-hidden bg-black/30">
                <ModelViewer
                  objUrl={state.objUrl}
                  textureUrl={state.originalImage}
                />
              </div>
            </div>

            {/* Download buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={state.objUrl}
                download="model.obj"
                className="px-8 py-3 bg-[var(--accent)] hover:bg-[var(--accent-light)] rounded-xl font-medium transition-colors text-center"
              >
                Download .OBJ for Blender
              </a>
              <a
                href={state.glbUrl}
                download="model.glb"
                className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-medium transition-colors text-center"
              >
                Download .GLB (Universal 3D)
              </a>
              <button
                onClick={handleReset}
                className="px-8 py-3 border border-[var(--border)] hover:border-[var(--accent)] rounded-xl font-medium transition-colors"
              >
                Convert Another Image
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
