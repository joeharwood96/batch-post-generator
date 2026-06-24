"use client";

import { useEffect, useRef, useState } from "react";
import { downscaleToDataUrl } from "../lib/downscale";
import type { GenResult, ProductImage, StyleSpec } from "../types";
import { IconImage, IconSparkle, IconUpload } from "./icons";
import { ResultCard } from "./ResultCard";

const MAX_REFERENCES = 2;
const MAX_CONCURRENCY = 3;

export function BatchGenerator() {
  const [products, setProducts] = useState<ProductImage[]>([]);
  const [references, setReferences] = useState<string[]>([]);
  const [styleSpec, setStyleSpec] = useState<StyleSpec | null>(null);
  const [results, setResults] = useState<GenResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragging, setDragging] = useState(false);

  const canGenerate =
    products.length > 0 && references.length > 0 && !isGenerating;

  useEffect(() => {
    if (references.length === 0) return;
    let active = true;
    fetch("/api/style-spec", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ referenceImages: references }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (active && body?.spec) setStyleSpec(body.spec as StyleSpec);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [references]);

  async function addProducts(files: FileList | File[]) {
    const items = await Promise.all(
      Array.from(files).map(async (file) => ({
        id: crypto.randomUUID(),
        name: prettyName(file.name),
        dataUrl: await downscaleToDataUrl(file),
      })),
    );
    setProducts((prev) => [...prev, ...items]);
  }

  async function addReferences(files: FileList | File[]) {
    const urls = await Promise.all(
      Array.from(files).map((file) => downscaleToDataUrl(file)),
    );
    setReferences((prev) => [...prev, ...urls].slice(0, MAX_REFERENCES));
    setStyleSpec(null);
  }

  const updateResult = (id: string, patch: Partial<GenResult>) =>
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );

  async function processOne(result: GenResult, referenceImages: string[]) {
    updateResult(result.id, { state: "generating", error: undefined });
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productImage: result.productDataUrl,
          referenceImages,
          styleSpec: styleSpec ?? undefined,
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }
      updateResult(result.id, {
        state: "done",
        image: body.image,
        providerUsed: body.providerUsed,
        attempts: body.attempts,
        caption: body.caption,
        hashtags: body.hashtags,
      });
    } catch (err) {
      updateResult(result.id, {
        state: "error",
        error: err instanceof Error ? err.message : "Generation failed",
      });
    }
  }

  async function handleGenerate() {
    const referenceImages = references;
    const initial: GenResult[] = products.map((p) => ({
      id: crypto.randomUUID(),
      productId: p.id,
      productName: p.name,
      productDataUrl: p.dataUrl,
      state: "pending",
    }));
    setResults(initial);
    setIsGenerating(true);
    await runWithConcurrency(
      initial.map((r) => () => processOne(r, referenceImages)),
      MAX_CONCURRENCY,
    );
    setIsGenerating(false);
  }

  async function handleRetry(id: string) {
    const result = results.find((r) => r.id === id);
    if (result) await processOne(result, references);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const imgs = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/"),
          );
          if (imgs.length) addProducts(imgs);
        }}
        className={`min-h-0 flex-1 overflow-y-auto rounded-card p-4 transition-colors sm:p-5 ${
          dragging ? "bg-surface" : "bg-surface/40"
        }`}
      >
        {results.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((r) => (
              <ResultCard key={r.id} result={r} onRetry={handleRetry} />
            ))}
          </div>
        ) : (
          <EmptyResults />
        )}
      </div>

      <div className="shrink-0 rounded-card border border-edge bg-surface p-3 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <UploadButton
              label="Products"
              Icon={IconUpload}
              multiple
              onFiles={addProducts}
            />
            <div className="flex min-w-0 gap-2 overflow-x-auto">
              {products.map((p) => (
                <Thumb
                  key={p.id}
                  src={p.dataUrl}
                  alt={p.name}
                  onRemove={() =>
                    setProducts((prev) => prev.filter((x) => x.id !== p.id))
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:border-l lg:border-edge lg:pl-3">
            {references.length < MAX_REFERENCES && (
              <UploadButton
                label="Reference"
                Icon={IconImage}
                multiple={false}
                onFiles={addReferences}
              />
            )}
            <div className="flex gap-2">
              {references.map((url, i) => (
                <Thumb
                  key={i}
                  src={url}
                  alt={`Reference ${i + 1}`}
                  onRemove={() => {
                    setReferences((prev) => prev.filter((u) => u !== url));
                    setStyleSpec(null);
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!canGenerate}
            onClick={handleGenerate}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-canvas transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 lg:ml-auto"
          >
            <IconSparkle className="h-4 w-4" />
            {isGenerating
              ? "Generating…"
              : `Generate${products.length ? ` ${products.length}` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="grid h-full min-h-[240px] place-items-center text-center">
      <div className="max-w-xs space-y-2">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-canvas text-muted">
          <IconSparkle className="h-5 w-5" />
        </span>
        <p className="font-display text-lg">Your posts appear here</p>
        <p className="text-sm text-muted">
          Add products and a reference below, then generate — each post lands the
          moment it&rsquo;s ready.
        </p>
      </div>
    </div>
  );
}

function UploadButton({
  label,
  Icon,
  multiple,
  onFiles,
}: {
  label: string;
  Icon: typeof IconUpload;
  multiple: boolean;
  onFiles: (files: FileList | File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-edge bg-canvas px-3.5 py-2.5 text-xs font-medium text-ink transition-colors hover:border-ink/40"
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );
}

function Thumb({
  src,
  alt,
  onRemove,
}: {
  src: string;
  alt: string;
  onRemove: () => void;
}) {
  return (
    <div className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-edge bg-canvas">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${alt}`}
        className="absolute inset-0 grid cursor-pointer place-items-center bg-ink/60 text-canvas opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <span aria-hidden className="text-base leading-none">
          ×
        </span>
      </button>
    </div>
  );
}

function prettyName(filename: string): string {
  return filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

async function runWithConcurrency(
  tasks: Array<() => Promise<void>>,
  limit: number,
) {
  let cursor = 0;
  const worker = async () => {
    while (cursor < tasks.length) {
      const index = cursor++;
      await tasks[index]();
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker),
  );
}
