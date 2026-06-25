import { IconCode } from "./icons";

const REPO_URL = "https://github.com/joeharwood96/batch-post-generator";

export function CodeLink() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-2">
      <header className="space-y-2">
        <h1 className="font-display text-3xl leading-tight">
          The <span className="italic">code</span>
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          Everything that powers this page, in one public repo.
        </p>
      </header>

      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 rounded-card border border-edge bg-surface p-5 shadow-soft transition hover:scale-[1.01]"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-ink text-canvas">
          <IconCode className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <span className="block font-medium">batch-post-generator</span>
          <span className="block truncate font-mono text-xs text-muted">
            {REPO_URL}
          </span>
        </span>
      </a>

      <ul className="space-y-1.5 text-[15px] leading-relaxed text-ink/85">
        <li>Next.js 16 · App Router · TypeScript · Tailwind v4</li>
        <li>Multi-provider image generation with retries + failover</li>
        <li>Client fan-out so each post renders the moment it lands</li>
      </ul>
    </div>
  );
}
