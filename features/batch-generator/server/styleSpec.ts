import "server-only";

import { parseDataUrl } from "../lib/image";
import type { StyleSpec } from "../types";
import { analyzeReference } from "./text";

export async function describeReference(
  referenceImages: string[],
): Promise<StyleSpec | null> {
  return analyzeReference(referenceImages.map(parseDataUrl));
}
