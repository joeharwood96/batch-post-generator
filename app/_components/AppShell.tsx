"use client";

import { useState } from "react";
import { BatchGenerator } from "@/features/batch-generator";
import { CodeLink } from "./CodeLink";
import { Sidebar, type Section } from "./Sidebar";
import { WriteUp } from "./WriteUp";

const TITLES: Record<Section, string> = {
  product: "The product",
  writeup: "How it was built",
  code: "The code",
};

export function AppShell() {
  const [active, setActive] = useState<Section>("product");

  return (
    <div className="flex h-full overflow-hidden bg-panel">
      <Sidebar active={active} onSelect={setActive} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-grid">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-edge px-5 py-3">
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            {TITLES[active]}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface px-3 py-1.5 font-mono text-[11px] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-done" /> gemini
            <span className="h-1.5 w-1.5 rounded-full bg-done" /> openai
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden p-4 sm:p-5">
          <div className={active === "product" ? "h-full" : "hidden"}>
            <BatchGenerator />
          </div>
          <div
            className={
              active === "writeup" ? "h-full overflow-y-auto" : "hidden"
            }
          >
            <WriteUp />
          </div>
          <div
            className={active === "code" ? "h-full overflow-y-auto" : "hidden"}
          >
            <CodeLink />
          </div>
        </div>
      </div>
    </div>
  );
}
