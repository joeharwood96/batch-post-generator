import "server-only";

import OpenAI, { toFile } from "openai";
import type { ImageInput } from "../../lib/image";
import type {
  GenerateImageArgs,
  ImageProvider,
  ProviderImageResult,
} from "./types";
import { ProviderError } from "./types";

const MODEL = "gpt-image-1";
const SIZE = "1024x1024" as const;
const QUALITY = "medium" as const;

let client: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ProviderError("openai", "OPENAI_API_KEY is not set", {
      retryable: false,
    });
  }
  client ??= new OpenAI({ apiKey });
  return client;
}

export const openaiProvider: ImageProvider = {
  id: "openai",
  isConfigured: () => Boolean(process.env.OPENAI_API_KEY),

  async generate(args: GenerateImageArgs): Promise<ProviderImageResult> {
    const openai = getClient();

    const images = await Promise.all(
      [args.product, ...args.references].map(inputToFile),
    );

    let response;
    try {
      response = await openai.images.edit({
        model: MODEL,
        image: images,
        prompt: args.prompt,
        size: SIZE,
        quality: QUALITY,
      });
    } catch (err) {
      throw toProviderError(err);
    }

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      throw new ProviderError("openai", "OpenAI returned no image", {
        retryable: true,
      });
    }
    return { base64: b64, mimeType: "image/png" };
  },
};

function inputToFile(img: ImageInput, index: number) {
  const buffer = Buffer.from(img.base64, "base64");
  const ext = img.mimeType.split("/")[1] ?? "png";
  return toFile(buffer, `image-${index}.${ext}`, { type: img.mimeType });
}

function toProviderError(err: unknown): ProviderError {
  const status =
    err && typeof err === "object" && typeof (err as { status?: unknown }).status === "number"
      ? (err as { status: number }).status
      : undefined;
  const message = err instanceof Error ? err.message : "OpenAI request failed";
  return new ProviderError("openai", message, { status, cause: err });
}
