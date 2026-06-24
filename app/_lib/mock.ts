import type { GenResult, ProviderId, StyleSpec } from "./types";

export const MOCK_STYLE_SPEC: StyleSpec = {
  title: "Martian Dusk",
  accentWord: "Dusk",
  mood: "cinematic, otherworldly, still",
  lighting: "low pink dusk light, long soft shadows",
  setting: "rusty red dunes under a dusty sky",
  palette: ["#C4623B", "#E8A33D", "#7A3B2E", "#F0D9C0", "#3A2A2E"],
  summary: "Rusty red dunes, pink dusk haze, and long cinematic shadows.",
};

const MOCK_CAPTIONS = [
  "Engineered for the edge of everywhere.",
  "Where it lands, the rules change.",
  "Built to belong somewhere new.",
  "A familiar object, a foreign world.",
  "Designed for light that doesn't exist yet.",
];

const MOCK_HASHTAGS = [
  ["#design", "#martiandusk", "#productshot"],
  ["#concept", "#moodboard", "#cinematic"],
  ["#studio", "#styled", "#creative"],
];

export function simulateGeneration(
  index: number,
): Promise<Pick<GenResult, "image" | "caption" | "hashtags" | "providerUsed" | "attempts">> {
  const delay = 900 + index * 650;
  const fails = index === 2;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fails) {
        reject(new Error("All providers exhausted (mock)."));
        return;
      }
      const provider: ProviderId = index === 1 ? "openai" : "gemini";
      const attempts = index === 1 ? 2 : 1;
      resolve({
        caption: MOCK_CAPTIONS[index % MOCK_CAPTIONS.length],
        hashtags: MOCK_HASHTAGS[index % MOCK_HASHTAGS.length],
        providerUsed: provider,
        attempts,
        image: undefined,
      });
    }, delay);
  });
}
