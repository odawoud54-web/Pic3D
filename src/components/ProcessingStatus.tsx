"use client";

interface ProcessingStatusProps {
  progress: number;
  message: string;
}

export function ProcessingStatus({ progress, message }: ProcessingStatusProps) {
  return (
    <div className="text-center space-y-6 max-w-md">
      {/* Spinning 3D cube icon */}
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 animate-spin-slow opacity-20" />
        <div className="absolute inset-2 rounded-xl bg-[var(--surface)] flex items-center justify-center">
          <svg
            className="w-10 h-10 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">{message}</h3>
        <p className="text-sm text-gray-500">
          This may take a moment depending on image complexity
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[var(--surface)] rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{progress}% complete</p>
    </div>
  );
}
