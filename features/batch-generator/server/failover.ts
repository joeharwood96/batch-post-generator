import "server-only";

import type { ProviderId } from "../types";
import type { GenerateImageArgs, ImageProvider } from "./providers/types";
import { defaultIsRetryable, withRetry } from "./retry";

export interface FailoverResult {
  base64: string;
  mimeType: string;
  providerUsed: ProviderId;
  attempts: number;
}

export class AllProvidersFailedError extends Error {
  constructor(readonly lastError: unknown) {
    super("All image providers failed");
    this.name = "AllProvidersFailedError";
  }
}

export async function generateWithFailover(
  args: GenerateImageArgs,
  providers: ImageProvider[],
  signal?: AbortSignal,
): Promise<FailoverResult> {
  let lastError: unknown;

  for (const provider of providers) {
    try {
      const { value, attempts } = await withRetry(
        () => provider.generate(args, signal),
        { signal, isRetryable: defaultIsRetryable },
      );
      return { ...value, providerUsed: provider.id, attempts };
    } catch (err) {
      lastError = err;
      const reason = err instanceof Error ? err.message : String(err);
      console.warn(`[failover] ${provider.id} failed, trying next: ${reason}`);
    }
  }

  throw new AllProvidersFailedError(lastError);
}
