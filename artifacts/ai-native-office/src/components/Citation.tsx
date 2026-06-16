import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getSource } from "@/lib/citations";

const markerClass =
  "align-super text-[0.62em] font-mono font-medium leading-none ml-px px-[0.15em] " +
  "text-primary/70 underline decoration-dotted decoration-muted-foreground/60 underline-offset-[3px] " +
  "transition-colors hover:text-primary hover:decoration-primary hover:decoration-solid " +
  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary focus-visible:text-primary " +
  "cursor-pointer";

export function Citation({ number }: { number: number }) {
  const source = getSource(number);
  if (!source) return <sup className="font-mono text-[0.62em]">{number}</sup>;

  const { label, url, domain } = source;

  const marker = url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener external"
      aria-label={`Source ${number}: ${label}. Opens in a new tab.`}
      className={markerClass}
    >
      {number}
    </a>
  ) : (
    <button
      type="button"
      aria-label={`Source ${number}: ${label}.`}
      className={markerClass}
    >
      {number}
    </button>
  );

  return (
    <HoverCard openDelay={80} closeDelay={120}>
      <HoverCardTrigger asChild>{marker}</HoverCardTrigger>
      <HoverCardContent
        align="start"
        sideOffset={6}
        className="w-80 max-w-[calc(100vw-2rem)] rounded-none border-border bg-card p-0 text-card-foreground shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Source {number}</span>
          {domain && <span className="truncate">{domain}</span>}
        </div>
        <div className="px-4 py-3">
          <p className="text-sm font-light leading-snug text-foreground/90">{label}</p>
        </div>
        <a
          href={`#source-${number}`}
          className="flex items-center justify-between border-t border-border px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <span>Jump to source</span>
          <span aria-hidden="true">↓</span>
        </a>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener external"
            className="flex items-center justify-between border-t border-border px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <span>Open in new tab</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
