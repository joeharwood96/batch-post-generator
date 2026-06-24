import { type NextRequest, NextResponse } from "next/server";
import {
  describeReference,
  styleSpecRequestSchema,
} from "@/features/batch-generator/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const parsed = styleSpecRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const spec = await describeReference(parsed.data.referenceImages);
    return NextResponse.json({ spec });
  } catch (err) {
    console.error("[/api/style-spec] analysis failed:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 502 });
  }
}
