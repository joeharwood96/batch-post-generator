import type { StyleSpec } from "../types";

export function RecipeCard({
  spec,
  referenceUrl,
}: {
  spec: StyleSpec | null;
  referenceUrl: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-soft">
      <div className="relative aspect-[16/9] bg-canvas">
        {referenceUrl ? (
          <img
            src={referenceUrl}
            alt="Reference mood"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm text-muted">
            Reference preview
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-canvas backdrop-blur-sm">
          Recipe
        </span>
      </div>

      {spec ? (
        <div className="space-y-3 p-4">
          <h3 className="font-display text-2xl leading-tight">
            {renderTitle(spec.title, spec.accentWord)}
          </h3>

          <div className="flex items-center gap-1.5">
            {spec.palette.map((hex, i) => (
              <span
                key={i}
                title={hex}
                className="h-4 w-4 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>

          <p className="text-sm leading-relaxed text-muted">{spec.summary}</p>

          <dl className="flex flex-wrap gap-1.5 pt-1">
            {[
              ["mood", spec.mood],
              ["light", spec.lighting],
              ["setting", spec.setting],
            ].map(([k, v]) => (
              <div
                key={k}
                className="rounded-full border border-edge bg-canvas px-2.5 py-1 text-xs text-ink/80"
              >
                <dt className="inline font-mono text-[10px] uppercase tracking-wider text-muted">
                  {k}
                </dt>{" "}
                <dd className="inline">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <div className="space-y-3 p-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            Reading the mood…
          </p>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="h-4 w-4 animate-pulse rounded-full bg-canvas"
              />
            ))}
          </div>
          <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-canvas" />
        </div>
      )}
    </div>
  );
}

function renderTitle(title: string, accent: string) {
  const idx = title.toLowerCase().indexOf(accent.toLowerCase());
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <span className="italic">{title.slice(idx, idx + accent.length)}</span>
      {title.slice(idx + accent.length)}
    </>
  );
}
