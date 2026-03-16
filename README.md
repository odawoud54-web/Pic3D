# Pic3D - Transform 2D Images into 3D Models

Pic3D is an AI-powered web application that converts 2D images into 3D models ready for import into Blender and other 3D software.

## How It Works

1. **Upload** any 2D image (PNG, JPG, WEBP)
2. **AI Depth Estimation** analyzes the image to generate a depth map
3. **Mesh Generation** creates a 3D displaced mesh from the depth data
4. **Download** as `.OBJ` or `.GLB` format for Blender

## Features

- Drag-and-drop image upload with preview
- AI-powered monocular depth estimation (via Hugging Face API or built-in fallback)
- Real-time 3D preview with Three.js (orbit, zoom, pan)
- Export to OBJ format (native Blender import)
- Export to GLB format (universal 3D format)
- Dark theme UI built with Tailwind CSS
- Fully server-side mesh generation

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **3D Rendering**: Three.js, React Three Fiber, React Three Drei
- **AI/ML**: Hugging Face Inference API (Intel DPT-Large) with local fallback
- **Image Processing**: Sharp
- **3D Export**: Custom OBJ and GLB generators

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables (Optional)

For best quality depth estimation, set a Hugging Face API token:

```bash
cp .env.example .env.local
# Edit .env.local and add your Hugging Face token
```

Without an API token, the app uses a built-in pseudo-depth generator based on image luminance and edge detection. It works well for demos but produces less accurate depth maps.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Importing into Blender

### OBJ Import
1. Open Blender
2. Go to **File > Import > Wavefront (.obj)**
3. Select the downloaded `.obj` file
4. The model will appear in the viewport with UV coordinates ready for texturing

### GLB Import
1. Open Blender
2. Go to **File > Import > glTF 2.0 (.glb/.gltf)**
3. Select the downloaded `.glb` file

### Tips for Best Results
- Use images with clear depth separation (foreground/background)
- Landscape and architectural photos work particularly well
- Portrait photos with blurred backgrounds produce nice depth relief
- Adjust the mesh scale in Blender after import as needed

## Architecture

```
src/
  app/
    page.tsx          # Main page with upload/preview/download UI
    layout.tsx        # Root layout with metadata
    globals.css       # Global styles and animations
    api/
      depth/route.ts  # Depth estimation API endpoint
      mesh/route.ts   # Mesh generation API endpoint
  components/
    Header.tsx        # App header/navigation
    ImageUploader.tsx # Drag-and-drop upload component
    ModelViewer.tsx   # Three.js 3D model viewer
    ProcessingStatus.tsx # Processing progress indicator
  lib/
    depth.ts          # Depth estimation (HF API + fallback)
    mesh.ts           # OBJ and GLB mesh generation
```

## License

MIT
