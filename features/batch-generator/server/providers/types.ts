import "server-only";

import type { ProviderId } from "../../types";
import type { ImageInput } from "../../lib/image";

export type { ProviderId };

export interface GenerateImageArgs {
  prompt: string;
  product: ImageInput;
  references: ImageInput[];
}

export interface ProviderImageResult {
  base64: string;
  mimeType: string;
}

export interface ImageProvider {
  id: ProviderId;
  isConfigured(): boolean;
  generate(
    args: GenerateImageArgs,
    signal?: AbortSignal,
  ): Promise<ProviderImageResult>;
}

export class ProviderError extends Error {
  readonly providerId: ProviderId;
  readonly status?: number;
  readonly retryable: boolean;

  constructor(
    providerId: ProviderId,
    message: string,
    opts: { status?: number; retryable?: boolean; cause?: unknown } = {},
  ) {
    super(message, opts.cause !== undefined ? { cause: opts.cause } : undefined);
    this.name = "ProviderError";
    this.providerId = providerId;
    this.status = opts.status;
    this.retryable = opts.retryable ?? isRetryableStatus(opts.status);
  }
}

function isRetryableStatus(status?: number): boolean {
  if (status === undefined) return true;
  if (status === 429) return true;
  return status >= 500 && status < 600;
}
