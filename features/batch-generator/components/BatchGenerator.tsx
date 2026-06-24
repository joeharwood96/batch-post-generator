"use client";

import { useEffect, useRef, useState } from "react";
import { downscaleToDataUrl } from "../lib/downscale";
import type { GenResult, ProductImage, StyleSpec } from "../types";
import { IconImage, IconPlus, IconSparkle, IconUpload } from "./icons";
import { RecipeCard } from "./RecipeCard";
import { ResultCard } from "./ResultCard";

const MAX_REFERENCES = 2;
const MAX_CONCURRENCY = 3;

export function BatchGenerator() {
  const [products, setProducts] = useState<ProductImage[]>([]);
  const [references, setReferences] = useState<string[]>([]);
  const [styleSpec, setStyleSpec] = useState<StyleSpec | null>(null);
  const [results, setResults] = useState<GenResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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
    <div className="space-y-8">
      <header className="max-w-xl space-y-2">
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">
          Drop products. Borrow a <span className="italic">mood</span>.
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          Upload your product shots and one reference scene. You get a styled
          social post for each product — rendered as they land.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(300px,380px)]">
        <section className="space-y-3">
          <SectionLabel n="01" title="Product images" hint="one post each" />
          <UploadZone
            label="Add product images"
            hint="PNG or JPG · multiple"
            multiple
            onFiles={addProducts}
            Icon={IconUpload}
          />
          {products.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
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
          )}
        </section>

        <section className="space-y-3">
          <SectionLabel
            n="02"
            title="Reference mood"
            hint={`${references.length}/${MAX_REFERENCES}`}
          />
          {references.length < MAX_REFERENCES && (
            <UploadZone
              label="Add reference"
              hint="the style to match"
              multiple={false}
              onFiles={addReferences}
              Icon={IconImage}
            />
          )}
          {references.length > 0 && (
            <>
              <div className="flex gap-2.5">
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
              <RecipeCard spec={styleSpec} referenceUrl={references[0]} />
            </>
          )}
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canGenerate}
          onClick={handleGenerate}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-canvas transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          <IconSparkle className="h-4 w-4" />
          {isGenerating
            ? "Generating…"
            : `Generate ${products.length || ""} post${products.length === 1 ? "" : "s"}`.trim()}
        </button>
        {!canGenerate && !isGenerating && (
          <span className="text-sm text-muted">
            Add at least one product and one reference.
          </span>
        )}
      </div>

      {results.length > 0 && (
        <section className="space-y-3">
          <SectionLabel n="03" title="Generated posts" hint="renders as it lands" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((r) => (
              <ResultCard key={r.id} result={r} onRetry={handleRetry} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionLabel({ n, title, hint }: { n: string; title: string; hint: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="font-mono text-xs text-muted">{n}</span>
      <h2 className="text-sm font-semibold">{title}</h2>
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
        {hint}
      </span>
    </div>
  );
}

function UploadZone({
  label,
  hint,
  multiple,
  onFiles,
  Icon,
}: {
  label: string;
  hint: string;
  multiple: boolean;
  onFiles: (files: FileList | File[]) => void;
  Icon: typeof IconUpload;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const images = Array.from(e.dataTransfer.files).filter((f) =>
          f.type.startsWith("image/"),
        );
        if (images.length) onFiles(images);
      }}
      className={`group flex cursor-pointer items-center gap-3 rounded-card border border-dashed px-4 py-4 transition-colors ${
        dragging
          ? "border-ink bg-surface"
          : "border-edge bg-surface/60 hover:border-ink/40 hover:bg-surface"
      }`}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-canvas text-ink">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <IconPlus className="h-3.5 w-3.5" />
          {label}
        </span>
        <span className="text-xs text-muted">{hint}</span>
      </span>
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
    </div>
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
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-edge bg-canvas">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${alt}`}
        className="absolute right-1.5 top-1.5 grid h-6 w-6 cursor-pointer place-items-center rounded-full bg-ink/70 text-canvas opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <span aria-hidden className="text-sm leading-none">
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
