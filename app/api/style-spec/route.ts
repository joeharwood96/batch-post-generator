import { type NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  describeReference,
  styleSpecRequestSchema,
} from "@/features/batch-generator/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const DEADLINE_MS = 25_000;

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const body = await req.json().catch(() => null);

  const parsed = styleSpecRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const timeout = AbortSignal.timeout(DEADLINE_MS);
  const signal = AbortSignal.any([req.signal, timeout]);

  try {
    const spec = await describeReference(parsed.data.referenceImages, signal);
    return NextResponse.json({ spec });
  } catch (err) {
    if (timeout.aborted) {
      return NextResponse.json({ error: "Analysis timed out" }, { status: 504 });
    }
    console.error("[/api/style-spec] analysis failed:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 502 });
  }
}
