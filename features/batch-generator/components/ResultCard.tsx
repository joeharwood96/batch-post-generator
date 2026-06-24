import type { GenResult } from "../types";
import { IconAlert, IconCheck, IconRetry } from "./icons";

const STATUS: Record<
  GenResult["state"],
  { dot: string; label: string }
> = {
  pending: { dot: "bg-muted", label: "Queued" },
  generating: { dot: "bg-generating animate-pulse", label: "Developing" },
  done: { dot: "bg-done", label: "Done" },
  error: { dot: "bg-error", label: "Failed" },
};

export function ResultCard({
  result,
  onRetry,
}: {
  result: GenResult;
  onRetry: (id: string) => void;
}) {
  const { state } = result;
  const status = STATUS[state];

  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-edge bg-surface shadow-soft">
      <div className="flex items-center justify-between gap-2 border-b border-edge px-3.5 py-2.5">
        <span className="truncate text-sm font-medium" title={result.productName}>
          {result.productName}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted">
          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div className="relative aspect-square bg-canvas">
        <img
          src={result.image ?? result.productDataUrl}
          alt={result.productName}
          className={`h-full w-full object-cover transition-[filter,opacity] duration-500 ${
            state === "done"
              ? "animate-reveal [filter:saturate(1.15)_contrast(1.05)_sepia(0.18)]"
              : ""
          } ${state === "pending" || state === "generating" ? "opacity-60" : ""} ${
            state === "error" ? "opacity-30 grayscale" : ""
          }`}
        />

        {state === "generating" && (
          <div className="shimmer pointer-events-none absolute inset-0" />
        )}

        {state === "error" && (
          <div className="absolute inset-0 grid place-items-center bg-error/10 p-4 text-center">
            <div className="space-y-2">
              <IconAlert className="mx-auto h-6 w-6 text-error" />
              <p className="text-sm text-ink/80">
                {result.error ?? "Generation failed."}
              </p>
              <button
                type="button"
                onClick={() => onRetry(result.id)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-canvas transition-transform hover:scale-[1.03]"
              >
                <IconRetry className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        {state === "done" ? (
          result.caption ? (
            <>
              <p className="font-display text-lg leading-snug">
                {result.caption}
              </p>
              {result.hashtags && result.hashtags.length > 0 && (
                <p className="text-xs text-muted">
                  {result.hashtags.join("  ")}
                </p>
              )}
            </>
          ) : null
        ) : (
          <div className="space-y-1.5" aria-hidden>
            <div className="h-3.5 w-4/5 rounded-full bg-canvas" />
            <div className="h-3.5 w-1/2 rounded-full bg-canvas" />
          </div>
        )}

        <div className="mt-auto flex items-center gap-1.5 pt-1 font-mono text-[11px] text-muted">
          {state === "done" && <IconCheck className="h-3.5 w-3.5 text-done" />}
          <span>
            {result.providerUsed
              ? `via ${result.providerUsed} · attempt ${result.attempts ?? 1}`
              : state === "generating"
                ? "trying gemini…"
                : "—"}
          </span>
        </div>
      </div>
    </article>
  );
}
