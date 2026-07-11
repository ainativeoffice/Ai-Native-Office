"use client";

import { useState } from "react";

export interface MarginNote {
  id: string;
  match: string;
  label: string;
  note: string;
  source?: { label: string; url: string };
}

/**
 * Tufte-style side note rendered as a CSS-checkbox toggle on mobile and a
 * float-right marginalia on desktop (≥1024 px). The inline marker is a
 * superscript glyph; clicking toggles an inline note on narrow screens.
 */
export function SideNote({
  id,
  label,
  note,
  source,
}: {
  id: string;
  label: string;
  note: string;
  source?: { label: string; url: string };
}) {
  const [open, setOpen] = useState(false);
  const inputId = `sidenote-toggle-${id}`;

  return (
    <span className="sidenote-wrapper">
      <label
        htmlFor={inputId}
        className="sidenote-marker"
        aria-label={`Sidenote: ${label}`}
      >
        *
      </label>
      <input
        id={inputId}
        type="checkbox"
        className="sidenote-toggle"
        checked={open}
        onChange={(e) => setOpen(e.target.checked)}
        aria-hidden="true"
      />
      <span className="sidenote" role="note" aria-label={label}>
        <span className="sidenote-label">{label}</span>
        {note}
        {source && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="sidenote-link"
          >
            {source.label}
          </a>
        )}
      </span>
    </span>
  );
}
