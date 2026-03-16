"use client";

interface ExportPanelProps {
  objContent: string;
  blenderScript: string;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportPanel({
  objContent,
  blenderScript,
}: ExportPanelProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() =>
          downloadFile(objContent, "pic3d_model.obj", "text/plain")
        }
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Download OBJ
      </button>

      <button
        onClick={() =>
          downloadFile(
            blenderScript,
            "pic3d_import.py",
            "text/x-python"
          )
        }
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-orange-900/30 hover:shadow-orange-900/50"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
        Blender Script
      </button>
    </div>
  );
}
