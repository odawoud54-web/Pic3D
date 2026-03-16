"use client";

interface SkeletonToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  hasSkeleton: boolean;
}

export default function SkeletonToggle({
  enabled,
  onToggle,
  hasSkeleton,
}: SkeletonToggleProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        hasSkeleton
          ? "bg-gray-800/60 border border-gray-700/50"
          : "bg-gray-800/30 border border-gray-800/50 opacity-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <svg
          className={`w-5 h-5 transition-colors ${
            enabled && hasSkeleton ? "text-cyan-400" : "text-gray-500"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v1m0 14v1m-4-8H7m10 0h1m-9.364-4.364l-.707-.707m8.142 8.142l-.707-.707M6.343 17.657l-.707.707m8.142-8.142l-.707.707M12 9a3 3 0 100 6 3 3 0 000-6z"
          />
        </svg>
        <span className="text-sm font-medium text-gray-300">Skeleton</span>
      </div>

      <button
        onClick={() => hasSkeleton && onToggle(!enabled)}
        disabled={!hasSkeleton}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
          enabled && hasSkeleton
            ? "bg-gradient-to-r from-cyan-500 to-purple-500"
            : "bg-gray-600"
        } ${!hasSkeleton ? "cursor-not-allowed" : "cursor-pointer"}`}
        aria-label="Toggle skeleton visibility"
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
            enabled && hasSkeleton ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>

      {!hasSkeleton && (
        <span className="text-xs text-gray-600 ml-1">No skeleton detected</span>
      )}
    </div>
  );
}
