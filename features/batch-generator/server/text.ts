import "server-only";

import { GoogleGenAI } from "@google/genai";
import type { ImageInput } from "../lib/image";
import type { StyleSpec } from "../types";

const TEXT_MODEL = "gemini-2.5-flash";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export async function analyzeReference(
  references: ImageInput[],
): Promise<StyleSpec | null> {
  const ai = getClient();
  if (!ai || references.length === 0) return null;

  const multi = references.length > 1;
  const prompt = [
    multi
      ? `You are given ${references.length} different reference images. INVENT ONE new, coherent, photoreal environment that fuses distinctive elements from ALL ${references.length} of them into a single believable scene for a product photo (e.g. the architecture of one inside the landscape/sky/palette of another).`
      : "Analyze the reference image as a visual mood for product photography.",
    "Respond with strict JSON of this exact shape:",
    '{"title": string, "accentWord": string, "mood": string, "lighting": string, "setting": string, "palette": string[], "summary": string}',
    'title: a 2-3 word evocative name (e.g. "Martian Dusk").',
    "accentWord: one word taken from the title.",
    multi
      ? "setting: a concrete one-line description of the invented fused environment that explicitly names a signature element from EACH reference. mood, lighting: short phrases that combine cues from every reference."
      : "mood, lighting, setting: short phrases of a few words each.",
    multi
      ? "palette: exactly 5 hex colors sampled across ALL the references."
      : "palette: exactly 5 dominant colors as hex strings.",
    multi
      ? "summary: one vivid sentence describing the fused scene, drawing on every reference."
      : "summary: one sentence describing the look.",
  ].join("\n");

  try {
    const res = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        { text: prompt },
        ...references.map((ref) => ({
          inlineData: { mimeType: ref.mimeType, data: ref.base64 },
        })),
      ],
      config: { responseMimeType: "application/json" },
    });
    const text = res.text;
    if (!text) return null;
    const spec = JSON.parse(text) as StyleSpec;
    return spec.title ? spec : null;
  } catch {
    return null;
  }
}

export async function writeCaption(
  product: ImageInput,
  spec?: StyleSpec,
): Promise<{ caption: string; hashtags: string[] } | null> {
  const ai = getClient();
  if (!ai) return null;

  const sceneHint = spec
    ? `The scene styling is "${spec.title}": ${spec.summary}`
    : "The product sits in a styled scene matching a reference mood.";
  const prompt = [
    "Write one short, punchy social media caption for this product post, plus 3-5 lowercase hashtags.",
    sceneHint,
    'Respond with strict JSON: {"caption": string, "hashtags": string[]}.',
    "Caption: max 90 characters, no emojis.",
  ].join("\n");

  try {
    const res = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        { text: prompt },
        { inlineData: { mimeType: product.mimeType, data: product.base64 } },
      ],
      config: { responseMimeType: "application/json" },
    });
    const text = res.text;
    if (!text) return null;
    const parsed = JSON.parse(text) as {
      caption?: string;
      hashtags?: string[];
    };
    if (!parsed.caption) return null;
    return { caption: parsed.caption, hashtags: parsed.hashtags ?? [] };
  } catch {
    return null;
  }
}
