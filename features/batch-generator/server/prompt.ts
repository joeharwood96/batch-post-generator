import "server-only";

import type { StyleSpec } from "../types";

export function buildGenerationPrompt(
  styleSpec?: StyleSpec,
  referenceCount = 1,
): string {
  const refCount = Math.max(referenceCount, 1);
  const multi = refCount > 1;

  const fusedScene =
    multi && styleSpec
      ? [
          `Build this single invented scene around the product: ${styleSpec.setting}`,
          styleSpec.summary,
          `Mood: ${styleSpec.mood}. Lighting: ${styleSpec.lighting}.`,
        ].join("\n")
      : styleSpec
        ? [
            `Match this reference style — "${styleSpec.title}":`,
            `- Mood: ${styleSpec.mood}`,
            `- Lighting: ${styleSpec.lighting}`,
            `- Setting: ${styleSpec.setting}`,
          ].join("\n")
        : "Match the setting, mood, lighting, and colour palette of the reference image(s).";

  const referenceLines = multi
    ? [
        `The FIRST image is the product. The other ${refCount} images are style references — palette, texture, lighting, and mood guides.`,
        `Combine ALL ${refCount} references into the one fused scene described below. Honour every reference equally; do not just reproduce one of them.`,
      ]
    : [
        "The FIRST image is the product. The second image is the style/scene reference.",
        "Place the product naturally into a scene that matches the reference.",
      ];

  return [
    "You are creating one polished social-media product photo by placing the product into a new scene.",
    ...referenceLines,
    fusedScene,
    "Keep the product's shape, proportions, colours, branding, and details accurate and recognizable — do not redesign it.",
    "Output a single polished, photorealistic, social-ready image. No added text, watermarks, or borders.",
  ].join("\n");
}
