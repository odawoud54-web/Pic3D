import { NextRequest, NextResponse } from "next/server";
import { analyzeImageForDepth } from "@/lib/gemini";
import {
  generateMeshFromDepth,
  meshToOBJ,
  generateBlenderScript,
} from "@/lib/meshGenerator";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/png";

    // Analyze image with Gemini
    const analysis = await analyzeImageForDepth(base64, mimeType);

    // Generate 3D mesh from depth data
    const mesh = generateMeshFromDepth(analysis);

    // Generate OBJ file content
    const objContent = meshToOBJ(mesh);

    // Generate Blender Python script
    const blenderScript = generateBlenderScript(mesh, "pic3d_model.obj");

    return NextResponse.json({
      success: true,
      analysis: {
        description: analysis.description,
        objectRegions: analysis.objectRegions,
      },
      mesh: {
        vertexCount: mesh.vertices.length,
        faceCount: mesh.faces.length,
        vertices: mesh.vertices,
        faces: mesh.faces,
        normals: mesh.normals,
        skeleton: mesh.skeleton,
      },
      exports: {
        obj: objContent,
        blenderScript,
      },
    });
  } catch (error) {
    console.error("3D generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate 3D model",
      },
      { status: 500 }
    );
  }
}
