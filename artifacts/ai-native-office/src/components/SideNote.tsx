import { getSource } from "@/lib/citations";

export interface MarginNote {
  /** stable id used for the checkbox toggle (SSR-deterministic) */
  id: string;
  /** short uppercase heading shown above the note */
  label: string;
  /** the marginal annotation text */
  note: string;
  /** verbatim substring of the paragraph this note annotates */
  match: string;
  /** 1-based Works Cited source this note points to */
  source: number;
}

/**
 * Tufte-style marginalia. Renders an inline footnote marker plus a note that
 * floats into the right-hand margin on desktop and collapses to a toggleable
 * inline footnote on mobile. Pure markup + a CSS checkbox toggle, so it appears
 * in the prerendered HTML and degrades gracefully without JS.
 */
export function SideNote({ id, label, note, source }: Omit<MarginNote, "match">) {
  const src = getSource(source);
  return (
    <span className="sidenote-wrapper">
      <label
        htmlFor={`sn-${id}`}
        className="sidenote-marker"
        aria-label={`Margin note: ${label}`}
      >
        †
      </label>
      <input type="checkbox" id={`sn-${id}`} className="sidenote-toggle" />
      <small className="sidenote" role="note">
        <span className="sidenote-label">{label}</span>
        {note}
        {src?.url && (
          <a
            href={src.url}
            target="_blank"
            rel="noopener external"
            className="sidenote-link"
          >
            {src.domain ?? "source"} ↗
          </a>
        )}
      </small>
    </span>
  );
}
