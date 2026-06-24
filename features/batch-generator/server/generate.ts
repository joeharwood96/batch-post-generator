import "server-only";

import { parseDataUrl, toDataUrl } from "../lib/image";
import type { GenerateRequest, GenerateResponse } from "../schema";
import { generateWithFailover } from "./failover";
import { buildGenerationPrompt } from "./prompt";
import { writeCaption } from "./text";
import { geminiProvider } from "./providers/gemini";
import { openaiProvider } from "./providers/openai";
import type { ImageProvider } from "./providers/types";

const PROVIDER_CHAIN: ImageProvider[] = [geminiProvider, openaiProvider];

export async function generateStyledImage(
  input: GenerateRequest,
  signal?: AbortSignal,
): Promise<GenerateResponse> {
  const product = parseDataUrl(input.productImage);
  const references = input.referenceImages.map(parseDataUrl);
  const prompt = buildGenerationPrompt(input.styleSpec, references.length);

  const providers = PROVIDER_CHAIN.filter((p) => p.isConfigured());
  if (providers.length === 0) {
    throw new Error("No image providers are configured");
  }

  const [result, caption] = await Promise.all([
    generateWithFailover({ prompt, product, references }, providers, signal),
    writeCaption(product, input.styleSpec),
  ]);

  return {
    image: toDataUrl(result.base64, result.mimeType),
    providerUsed: result.providerUsed,
    attempts: result.attempts,
    caption: caption?.caption,
    hashtags: caption?.hashtags,
  };
}
