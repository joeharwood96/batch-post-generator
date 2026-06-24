export function WriteUp() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-2">
      <header className="space-y-2">
        <h1 className="font-display text-3xl leading-tight">
          How it was <span className="italic">built</span>
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          The honest version: what the AI did, what I did, what broke.
        </p>
      </header>

      <Section title="How I used AI">
        <p className="text-muted italic">[Coming in the write-up pass.]</p>
      </Section>
      <Section title="Toolset">
        <p className="text-muted italic">[Coming in the write-up pass.]</p>
      </Section>
      <Section title="Time breakdown">
        <p className="text-muted italic">[Coming in the write-up pass.]</p>
      </Section>
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
