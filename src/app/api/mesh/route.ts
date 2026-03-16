import { NextRequest, NextResponse } from "next/server";
import { generateMesh } from "@/lib/mesh";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { depthMap, originalImage } = await request.json();

    if (!depthMap || !originalImage) {
      return NextResponse.json(
        { error: "Missing depthMap or originalImage" },
        { status: 400 }
      );
    }

    // Generate mesh from depth map
    const { obj, glb } = await generateMesh(depthMap, originalImage);

    // Convert OBJ to data URL
    const objBase64 = Buffer.from(obj, "utf-8").toString("base64");
    const objUrl = `data:text/plain;base64,${objBase64}`;

    // Convert GLB to data URL
    const glbBase64 = glb.toString("base64");
    const glbUrl = `data:model/gltf-binary;base64,${glbBase64}`;

    return NextResponse.json({ objUrl, glbUrl });
  } catch (error) {
    console.error("Mesh generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Mesh generation failed",
      },
      { status: 500 }
    );
  }
}
