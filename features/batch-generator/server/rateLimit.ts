import "server-only";

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec: number;
}

export function checkRateLimit(
  req: Request,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const key = `${clientIp(req)}:${limit}:${windowMs}`;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
