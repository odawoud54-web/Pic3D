# Pic3D - AI 2D to 3D Model Converter

Convert 2D images into 3D models for Blender using Google Gemini AI. Upload any picture and get an exportable 3D model with optional skeleton for animation.

## Features

- **AI-Powered Depth Analysis** -- Uses Google Gemini to analyze 2D images and estimate depth
- **3D Mesh Generation** -- Converts depth data into a displacement mesh with front and back faces
- **Interactive 3D Preview** -- Real-time Three.js viewer with orbit controls
- **Skeleton Detection** -- AI detects articulable objects and suggests joint/bone structure
- **Skeleton Toggle** -- Switch button to show/hide skeleton overlay in the 3D preview
- **Blender Export** -- Download OBJ files and auto-import Python scripts for Blender
- **Automatic Rigging** -- Blender script sets up armature and parents mesh to skeleton

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file and add your Gemini API key
cp .env.example .env.local
# Edit .env.local and set GEMINI_API_KEY=your_key_here

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using with Blender

1. Upload an image and generate the 3D model
2. Download both the **OBJ file** and the **Blender Script**
3. Place both files in the same directory
4. Open Blender and go to **Scripting** workspace
5. Open the `pic3d_import.py` script and run it
6. The model will be imported with skeleton rigging applied automatically

## Tech Stack

- **Next.js 15** -- React framework with App Router
- **TypeScript** -- Type-safe development
- **Tailwind CSS** -- Utility-first styling
- **Three.js / React Three Fiber** -- 3D rendering
- **Google Gemini API** -- AI image analysis and depth estimation

## Project Structure

```
src/
  app/
    api/generate-3d/route.ts   # API endpoint for Gemini + mesh generation
    layout.tsx                  # Root layout
    page.tsx                    # Main application page
    globals.css                 # Global styles
  components/
    ImageUploader.tsx           # Drag-and-drop image upload
    ThreeViewer.tsx             # 3D model preview with Three.js
    SkeletonToggle.tsx          # Toggle switch for skeleton visibility
    ExportPanel.tsx             # Download buttons for OBJ and Blender script
  lib/
    gemini.ts                   # Gemini API client for depth analysis
    meshGenerator.ts            # 3D mesh generation and OBJ/Blender export
```

## License

MIT
