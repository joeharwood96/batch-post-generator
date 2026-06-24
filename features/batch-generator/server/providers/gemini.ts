import "server-only";

import { GoogleGenAI } from "@google/genai";
import type {
  GenerateImageArgs,
  ImageProvider,
  ProviderImageResult,
} from "./types";
import { ProviderError } from "./types";

const MODEL = "gemini-2.5-flash-image";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ProviderError("gemini", "GEMINI_API_KEY is not set", {
      retryable: false,
    });
  }
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

export const geminiProvider: ImageProvider = {
  id: "gemini",
  isConfigured: () => Boolean(process.env.GEMINI_API_KEY),

  async generate(args: GenerateImageArgs): Promise<ProviderImageResult> {
    const ai = getClient();

    const contents = [
      { text: args.prompt },
      {
        inlineData: {
          mimeType: args.product.mimeType,
          data: args.product.base64,
        },
      },
      ...args.references.map((ref) => ({
        inlineData: { mimeType: ref.mimeType, data: ref.base64 },
      })),
    ];

    let response;
    try {
      response = await ai.models.generateContent({ model: MODEL, contents });
    } catch (err) {
      throw toProviderError(err);
    }

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const image = parts.find((part) => part.inlineData?.data);
    if (!image?.inlineData?.data) {
      throw new ProviderError("gemini", "Gemini returned no image", {
        retryable: true,
      });
    }

    return {
      base64: image.inlineData.data,
      mimeType: image.inlineData.mimeType ?? "image/png",
    };
  },
};

function toProviderError(err: unknown): ProviderError {
  const status = extractStatus(err);
  const message = err instanceof Error ? err.message : "Gemini request failed";
  const hardQuota =
    status === 429 && /limit:\s*0|free_tier|prepayment|credits/i.test(message);
  return new ProviderError("gemini", message, {
    status,
    retryable: hardQuota ? false : undefined,
    cause: err,
  });
}

function extractStatus(err: unknown): number | undefined {
  if (err && typeof err === "object") {
    const e = err as { status?: unknown; code?: unknown };
    if (typeof e.status === "number") return e.status;
    if (typeof e.code === "number") return e.code;
  }
  return undefined;
}
