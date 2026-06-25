import { type NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  generateRequestSchema,
  generateStyledImage,
} from "@/features/batch-generator/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const DEADLINE_MS = 55_000;

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const body = await req.json().catch(() => null);

  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const timeout = AbortSignal.timeout(DEADLINE_MS);
  const signal = AbortSignal.any([req.signal, timeout]);

  try {
    const result = await generateStyledImage(parsed.data, signal);
    return NextResponse.json(result);
  } catch (err) {
    if (timeout.aborted) {
      return NextResponse.json({ error: "Generation timed out" }, { status: 504 });
    }
    console.error("[/api/generate] generation failed:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 502 });
  }
}
