import { z } from "zod";

import type { ProviderId } from "./types";

const MAX_DATA_URL_LEN = 8_000_000;

const imageDataUrl = z
  .string()
  .max(MAX_DATA_URL_LEN, "Image is too large")
  .regex(
    /^data:image\/(png|jpe?g|webp);base64,/,
    "Must be a base64 image data URL",
  );

const styleSpecSchema = z.object({
  title: z.string(),
  accentWord: z.string(),
  mood: z.string(),
  lighting: z.string(),
  setting: z.string(),
  palette: z.array(z.string()),
  summary: z.string(),
});

export const generateRequestSchema = z.object({
  productImage: imageDataUrl,
  referenceImages: z.array(imageDataUrl).min(1).max(2),
  styleSpec: styleSpecSchema.optional(),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const styleSpecRequestSchema = z.object({
  referenceImages: z.array(imageDataUrl).min(1).max(2),
});

export type StyleSpecRequest = z.infer<typeof styleSpecRequestSchema>;

export interface GenerateResponse {
  image: string;
  providerUsed: ProviderId;
  attempts: number;
  caption?: string;
  hashtags?: string[];
}
