/**
 * Depth estimation module.
 *
 * Uses the Hugging Face Inference API with the DPT-Large model for monocular
 * depth estimation. If no API token is configured, falls back to a
 * client-side Sobel-edge-based pseudo-depth generator so the app still works
 * out of the box for demos.
 */

import sharp from "sharp";

const HF_API_URL =
  "https://api-inference.huggingface.co/models/Intel/dpt-large";

/**
 * Estimate depth from a raw image buffer.
 * Returns a grayscale depth map as a base64 data-URL PNG.
 */
export async function estimateDepth(
  imageBuffer: Buffer
): Promise<string> {
  const hfToken = process.env.HF_API_TOKEN;

  if (hfToken) {
    return estimateDepthHF(imageBuffer, hfToken);
  }

  // Fallback: generate a gradient-based pseudo-depth from image luminance
  return generatePseudoDepth(imageBuffer);
}

/**
 * Call Hugging Face depth estimation API.
 */
async function estimateDepthHF(
  imageBuffer: Buffer,
  token: string
): Promise<string> {
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
    },
    body: new Uint8Array(imageBuffer),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Depth estimation failed: ${text}`);
  }

  const depthBuffer = Buffer.from(await response.arrayBuffer());

  // Convert to grayscale PNG and resize to match processing needs
  const processed = await sharp(depthBuffer)
    .grayscale()
    .resize(256, 256, { fit: "fill" })
    .png()
    .toBuffer();

  return `data:image/png;base64,${processed.toString("base64")}`;
}

/**
 * Generate a pseudo-depth map from image luminance using edge detection
 * and gradient analysis. This is a simplified approach that works without
 * any external API -- useful for demos and local development.
 */
async function generatePseudoDepth(imageBuffer: Buffer): Promise<string> {
  const width = 256;
  const height = 256;

  // Convert to grayscale raw pixels
  const grayscaleRaw = await sharp(imageBuffer)
    .grayscale()
    .resize(width, height, { fit: "fill" })
    .raw()
    .toBuffer();

  // Create depth map using luminance + position-based heuristics
  const depthData = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const luminance = grayscaleRaw[idx];

      // Heuristic: objects higher in the image tend to be farther away
      // Combine luminance with vertical position for pseudo-depth
      const verticalDepth = (y / height) * 80; // bottom = closer
      const luminanceDepth = (luminance / 255) * 175;

      // Apply edge detection for depth discontinuities
      let edgeFactor = 0;
      if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        const left = grayscaleRaw[idx - 1];
        const right = grayscaleRaw[idx + 1];
        const top = grayscaleRaw[idx - width];
        const bottom = grayscaleRaw[idx + width];
        const gx = Math.abs(right - left);
        const gy = Math.abs(bottom - top);
        edgeFactor = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      }

      // Combine factors
      const rawDepth = luminanceDepth + verticalDepth - edgeFactor * 0.3;
      depthData[idx] = Math.max(0, Math.min(255, Math.round(rawDepth)));
    }
  }

  // Apply Gaussian blur for smoother depth map
  const blurred = await sharp(Buffer.from(depthData), {
    raw: { width, height, channels: 1 },
  })
    .blur(3)
    .png()
    .toBuffer();

  return `data:image/png;base64,${blurred.toString("base64")}`;
}
