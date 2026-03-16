import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface DepthAnalysis {
  description: string;
  depthMap: number[][];
  objectRegions: {
    name: string;
    bounds: { x: number; y: number; width: number; height: number };
    avgDepth: number;
  }[];
  suggestedSkeleton: {
    joints: { name: string; x: number; y: number; z: number }[];
    bones: { from: string; to: string }[];
  } | null;
}

export async function analyzeImageForDepth(
  imageBase64: string,
  mimeType: string
): Promise<DepthAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Analyze this 2D image and provide depth estimation data for converting it to a 3D model.

Return a JSON object with this exact structure:
{
  "description": "Brief description of the image content",
  "depthMap": [[0.0-1.0 values]], // 16x16 grid of depth values (0=near, 1=far)
  "objectRegions": [
    {
      "name": "object name",
      "bounds": {"x": 0-1, "y": 0-1, "width": 0-1, "height": 0-1},
      "avgDepth": 0.0-1.0
    }
  ],
  "suggestedSkeleton": {
    "joints": [
      {"name": "joint_name", "x": -1 to 1, "y": -1 to 1, "z": -1 to 1}
    ],
    "bones": [
      {"from": "joint_name", "to": "joint_name"}
    ]
  }
}

For the depthMap, provide a 16x16 grid representing relative depth values.
For objectRegions, identify major objects/areas and their approximate positions and depths.
For suggestedSkeleton, if the image contains a character or articulable object, suggest joints and bones for animation. If not applicable, set to null.

IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks.`;

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
    { text: prompt },
  ]);

  const response = result.response;
  const text = response.text();

  // Parse the JSON response, stripping any markdown code blocks
  const cleanedText = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(cleanedText) as DepthAnalysis;
  } catch {
    // If parsing fails, return a default structure
    return {
      description: "Unable to parse depth analysis",
      depthMap: Array(16)
        .fill(null)
        .map(() => Array(16).fill(0.5)),
      objectRegions: [],
      suggestedSkeleton: null,
    };
  }
}
