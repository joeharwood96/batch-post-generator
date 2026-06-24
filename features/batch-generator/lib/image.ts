export interface ImageInput {
  mimeType: string;
  base64: string;
}

const DATA_URL_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

export function parseDataUrl(dataUrl: string): ImageInput {
  const match = DATA_URL_RE.exec(dataUrl);
  if (!match) throw new Error("Expected a base64 image data URL");
  return { mimeType: match[1], base64: match[2] };
}

export function toDataUrl(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}
