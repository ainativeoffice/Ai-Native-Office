"use client";

import { useState, useRef } from "react";
import { getSource } from "@/lib/content/citations";

/**
 * Inline citation superscript with a hover/focus popover. Renders as a
 * `<sup>` so it degrades gracefully without JS. The popover shows the full
 * Works-Cited entry plus a link back to the anchor on the full paper.
 */
export function Citation({ number }: { number: number }) {
  const source = getSource(number);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);

  if (!source) {
    return (
      <sup className="font-mono text-[0.6em] text-destructive" aria-label={`Source ${number} not found`}>
        [{number}]
      </sup>
    );
  }

  return (
    <span className="sidenote-wrapper relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Citation ${number}: ${source.label}`}
        onClick={() => setOpen((v) => !v)}
        className="sidenote-marker"
      >
        [{number}]
      </button>
      {open && (
        <span
          ref={ref as React.RefObject<HTMLSpanElement>}
          role="tooltip"
          className="absolute z-50 left-0 top-6 w-72 max-w-[90vw] border border-border bg-card p-3 font-mono text-[0.68rem] leading-relaxed text-muted-foreground shadow-lg"
        >
          <span className="block mb-1 font-semibold text-foreground/80 uppercase tracking-[0.12em] text-[0.6rem]">
            Source {number}
          </span>
          {source.label}
          {source.url && (
            <>
              {" "}
              <a
                href={source.url}
                target="_blank"
                rel="noopener external"
                className="sidenote-link break-all"
              >
                {source.url}
              </a>
            </>
          )}
          <button
            type="button"
            aria-label="Close citation"
            onClick={() => setOpen(false)}
            className="mt-2 block text-[0.6rem] uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            [close]
          </button>
        </span>
      )}
    </span>
  );
}

/**
 * Renders a bracketed citation group, e.g. `[31, 34]`. The bracketed text is
 * non-interactive (server-renderable) but each number is a link to `#source-N`
 * on the full paper.
 */
export function CitationBrackets({
  numbers,
  leadingSpace,
}: {
  numbers: number[];
  leadingSpace?: boolean;
}) {
  return (
    <>
      {leadingSpace && " "}
      <span className="font-mono text-[0.72em] text-foreground/60 select-none">[</span>
      {numbers.map((n, i) => (
        <span key={n}>
          {i > 0 && (
            <span className="font-mono text-[0.72em] text-foreground/60 select-none">, </span>
          )}
          <a
            href={`#source-${n}`}
            className="font-mono text-[0.72em] text-foreground/60 transition-colors hover:text-primary"
            aria-label={`See source ${n}`}
          >
            {n}
          </a>
        </span>
      ))}
      <span className="font-mono text-[0.72em] text-foreground/60 select-none">]</span>
    </>
  );
}
