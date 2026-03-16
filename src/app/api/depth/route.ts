import { NextRequest, NextResponse } from "next/server";
import { estimateDepth } from "@/lib/depth";
import sharp from "sharp";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Resize original to a reasonable size for processing and preview
    const resizedOriginal = await sharp(imageBuffer)
      .resize(512, 512, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();

    const originalImage = `data:image/png;base64,${resizedOriginal.toString("base64")}`;

    // Estimate depth
    const depthMap = await estimateDepth(imageBuffer);

    return NextResponse.json({ depthMap, originalImage });
  } catch (error) {
    console.error("Depth estimation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Depth estimation failed",
      },
      { status: 500 }
    );
  }
}
