import { IconCode, IconDoc, IconProduct, IconSparkle } from "./icons";

export type Section = "product" | "writeup" | "code";

const NAV: { id: Section; label: string; Icon: typeof IconProduct }[] = [
  { id: "product", label: "The product", Icon: IconProduct },
  { id: "writeup", label: "How it was built", Icon: IconDoc },
  { id: "code", label: "The code", Icon: IconCode },
];

export function Sidebar({
  active,
  onSelect,
}: {
  active: Section;
  onSelect: (s: Section) => void;
}) {
  return (
    <aside className="flex shrink-0 flex-col border-r border-edge bg-surface p-3 md:w-[236px]">
      <div className="flex items-center gap-2.5 px-2 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink text-canvas">
          <IconSparkle className="h-5 w-5" />
        </span>
        <span className="hidden font-display text-xl leading-none tracking-tight md:inline">
          Batch <span className="italic">Studio</span>
        </span>
      </div>

      <nav className="mt-2 flex flex-col gap-1">
        {NAV.map(({ id, label, Icon }) => {
          const isActive = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-current={isActive ? "page" : undefined}
              title={label}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-canvas text-ink"
                  : "text-muted hover:bg-canvas/60 hover:text-ink"
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="hidden md:inline">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
