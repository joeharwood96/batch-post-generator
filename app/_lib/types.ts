export type ProviderId = "gemini" | "openai";

export type CardState = "pending" | "generating" | "done" | "error";

export interface StyleSpec {
  title: string;
  accentWord: string;
  mood: string;
  lighting: string;
  setting: string;
  palette: string[];
  summary: string;
}

export interface ProductImage {
  id: string;
  name: string;
  dataUrl: string;
}

export interface GenInput {
  productImage: string;
  referenceImages: string[];
  styleSpec?: StyleSpec;
}

export interface GenResult {
  id: string;
  productId: string;
  productName: string;
  productDataUrl: string;
  state: CardState;
  image?: string;
  caption?: string;
  hashtags?: string[];
  providerUsed?: ProviderId;
  attempts?: number;
  error?: string;
}
