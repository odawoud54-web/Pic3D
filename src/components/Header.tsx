"use client";

export function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-lg">
            3D
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Pic3D</h1>
            <p className="text-xs text-gray-500">2D to 3D with AI</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm text-gray-400">
          <a
            href="https://github.com/odawoud54-web/Pic3D"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
