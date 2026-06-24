import "server-only";

export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  signal?: AbortSignal;
  isRetryable?: (err: unknown) => boolean;
}

export interface RetryOutcome<T> {
  value: T;
  attempts: number;
}

export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  opts: RetryOptions = {},
): Promise<RetryOutcome<T>> {
  const retries = opts.retries ?? 2;
  const base = opts.baseDelayMs ?? 400;
  const isRetryable = opts.isRetryable ?? defaultIsRetryable;

  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    if (opts.signal?.aborted) throw new Error("Aborted");
    try {
      return { value: await fn(attempt), attempts: attempt };
    } catch (err) {
      lastErr = err;
      if (attempt > retries || !isRetryable(err)) break;
      const backoff = base * 2 ** (attempt - 1);
      const jitter = backoff * 0.25 * Math.random();
      await sleep(backoff + jitter, opts.signal);
    }
  }
  throw lastErr;
}

function defaultIsRetryable(err: unknown): boolean {
  if (err && typeof err === "object" && "retryable" in err) {
    return Boolean((err as { retryable?: boolean }).retryable);
  }
  return true;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new Error("Aborted"));
      },
      { once: true },
    );
  });
}
