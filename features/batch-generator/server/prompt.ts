import "server-only";

import type { StyleSpec } from "../types";

export function buildGenerationPrompt(styleSpec?: StyleSpec): string {
  const styleLines = styleSpec
    ? [
        `Match this reference style — "${styleSpec.title}":`,
        `- Mood: ${styleSpec.mood}`,
        `- Lighting: ${styleSpec.lighting}`,
        `- Setting: ${styleSpec.setting}`,
      ].join("\n")
    : "Match the setting, mood, lighting, and color palette of the reference image(s).";

  return [
    "You are compositing a product into a new scene for a social media post.",
    "The FIRST image is the product. The remaining image(s) are style/scene references.",
    "Place the product naturally into a scene that matches the references.",
    "Keep the product's shape, proportions, colors, branding, and details accurate and recognizable — do not redesign it.",
    styleLines,
    "Output a single polished, photorealistic, social-ready image. No added text, watermarks, or borders.",
  ].join("\n");
}
