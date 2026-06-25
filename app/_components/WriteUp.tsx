export function WriteUp() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-2">
      <header className="space-y-2">
        <h1 className="font-display text-3xl leading-tight">
          How it was <span className="italic">built</span>
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          What the AI did, what I did, what broke.
        </p>
      </header>

      <Section title="How I used AI">
        <p>
          I built this with Claude Code, treating it as a fast pair: I make the
          calls and review every diff, it writes. The architecture was mine. The
          feature-based structure (<code>features/batch-generator</code> with its
          own <code>server/</code>, <code>lib/</code>, and <code>components/</code>
          ), the failover chain from Gemini to OpenAI, per-IP rate limiting on
          the public endpoints, the retry and error-handling strategy, and the
          reference-derived “style spec” that keeps the look consistent across
          every post were all my decisions. So was the product call to{" "}
          <span className="italic">fuse</span> several references into one
          invented scene instead of collaging them. What I handed off was the
          implementation: the scaffold, design tokens, provider adapters,
          plumbing, and components, each landing under review.
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Its Next.js knowledge was stale. This repo runs a modified Next 16,
            and <code>AGENTS.md</code> says as much, so its first instincts came
            from an older version. I pointed it at{" "}
            <code>node_modules/next/dist/docs</code> before it touched any
            routes.
          </li>
          <li>
            It got the <code>@google/genai</code> API shape wrong, wiring the
            abort signal as <code>config.httpOptions.abortSignal</code> when the
            real field is <code>config.abortSignal</code>. The type-check caught
            it on build and I fixed it.
          </li>
          <li>
            Next 16’s <code>set-state-in-effect</code> lint rejected its first
            style-spec pattern, a <code>setState</code> inside a{" "}
            <code>useEffect</code>. Instead of silencing the rule I had it move
            the trigger into the upload and remove handlers, which read better
            anyway.
          </li>
          <li>
            I added a product-count cap myself, since each product is another
            paid generation call and an unbounded batch is a real footgun. The
            AI wanted a request body-size limit on top of that, but I dropped it:
            the per-image validation and the client-side downscaling already
            keep payloads tiny, so it was redundant.
          </li>
        </ul>
      </Section>
      <Section title="Toolset">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <span className="font-medium text-ink">
              Claude Code (Opus 4.8, 1M context)
            </span>
            , the only assistant, run from the terminal for scaffolding,
            implementation, and reviews. Inside it I leaned on{" "}
            <span className="font-medium text-ink">Explore subagents</span> for
            parallel codebase recon and{" "}
            <span className="font-medium text-ink">plan mode</span> to design
            each change before any edits landed.
          </li>
          <li>
            <span className="font-medium text-ink">Gemini 2.5 Flash Image</span>{" "}
            (<code>gemini-2.5-flash-image</code>) for the primary image
            generation. <code>gemini-2.5-flash</code> handled reference style
            analysis and the caption and hashtag writing.
          </li>
          <li>
            <span className="font-medium text-ink">
              OpenAI <code>gpt-image-1</code>
            </span>{" "}
            as the automatic failover when Gemini errors or hits a hard quota.
          </li>
          <li>
            <span className="font-medium text-ink">Git</span> for version
            control, plus <code>eslint</code> and <code>tsc</code> (via{" "}
            <code>next build</code>) as the type and lint gate that caught the
            API-shape bug.
          </li>
        </ul>
      </Section>
      <Section title="Time breakdown">
        <dl className="grid grid-cols-3 gap-3">
          <Stat value="~5h" label="Total" />
          <Stat value="~3h" label="Hands-on" />
          <Stat value="~2h" label="AI generating" />
        </dl>
      </Section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-card border border-edge bg-surface px-4 py-3.5">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-display text-2xl leading-tight">{value}</dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="space-y-2.5 text-[15px] leading-relaxed text-ink/85">
        {children}
      </div>
    </section>
  );
}
