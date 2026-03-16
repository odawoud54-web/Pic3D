import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pic3D - Transform 2D Images into 3D Models",
  description:
    "Upload any 2D image and convert it into a 3D model ready for Blender. Powered by AI depth estimation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
