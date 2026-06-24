import { type NextRequest, NextResponse } from "next/server";
import {
  generateRequestSchema,
  generateStyledImage,
} from "@/features/batch-generator/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  try {
    const result = await generateStyledImage(parsed.data, req.signal);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/generate] generation failed:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 502 });
  }
}
