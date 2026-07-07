import React from "react";
import katex from "katex";
import { content, type ListItem, type Principle, type Table, type ContactBlock, type Section } from "@/content";
import { EgressCalculator } from "@/components/EgressCalculator";
import { Citation, CitationBrackets } from "@/components/Citation";
import { SideNote, type MarginNote } from "@/components/SideNote";
import { ArchitectureBlueprint } from "@/components/ArchitectureBlueprint";
import { getSource, tokenizeCitationGroups } from "@/lib/citations";

/**
 * Shared whitepaper section renderer, extracted from Home.tsx so the full
 * manifesto page and the per-section pages (`/sections/<id>/`) render every
 * section/appendix body through the exact same code path — prose, math, lists,
 * tables, principle callouts, code blocks, contact blocks, and inline citation
 * hover-cards behave identically on both surfaces.
 */

/** Inline emphasis spans: `**bold**` or `*italic*` (no nesting, no line breaks). */
const EMPHASIS = /(\*\*[^*\n]+\*\*|\*[^*\s][^*\n]*\*)/g;

/**
 * Minimal inline-markdown emphasis for verbatim copy: `**…**` → <strong>,
 * `*…*` → <em>. Applied only to plain-text segments (after citation
 * tokenization), so markers can never span a citation boundary. Content
 * strings contain no other literal asterisks, so unmatched text passes
 * through untouched.
 */
const renderEmphasis = (text: string): React.ReactNode => {
  const parts = text.split(EMPHASIS);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

export const renderText = (text: string) =>
  tokenizeCitationGroups(text).map((t, i) =>
    t.type === "text" ? (
      <React.Fragment key={i}>{renderEmphasis(t.value)}</React.Fragment>
    ) : (
      <CitationBrackets key={i} numbers={t.numbers} leadingSpace />
    ),
  );

/** KaTeX renders identically on server and client (pure string → HTML), so
 *  `dangerouslySetInnerHTML` is hydration-safe and needs no client-only guard. */
const MathInline = ({ tex }: { tex: string }) => (
  <span
    dangerouslySetInnerHTML={{
      __html: katex.renderToString(tex, { throwOnError: false, displayMode: false }),
    }}
  />
);

const MathDisplay = ({ tex }: { tex: string }) => (
  <div
    className="my-6 overflow-x-auto text-foreground/90"
    dangerouslySetInnerHTML={{
      __html: katex.renderToString(tex, { throwOnError: false, displayMode: true }),
    }}
  />
);

/**
 * Render math-bearing prose. A string wrapped in `$$…$$` is a display formula;
 * any other string is a paragraph whose inline `$…$` spans become inline math
 * and whose literal `[n, m]` brackets become interactive citation groups.
 */
const renderMathProse = (paragraphs: string[]) =>
  paragraphs.map((p, i) => {
    const display = p.match(/^\$\$([\s\S]+)\$\$$/);
    if (display) return <MathDisplay key={i} tex={display[1]} />;

    const nodes: React.ReactNode[] = [];
    const re = /\$([^$]+)\$|\[(\d{1,2}(?:\s*,\s*\d{1,2})*)\]/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let k = 0;
    while ((m = re.exec(p)) !== null) {
      if (m.index > last) nodes.push(p.slice(last, m.index));
      if (m[1] !== undefined) {
        nodes.push(<MathInline key={`m${k++}`} tex={m[1]} />);
      } else {
        const numbers = m[2].split(",").map((n) => parseInt(n.trim(), 10));
        nodes.push(<CitationBrackets key={`c${k++}`} numbers={numbers} />);
      }
      last = re.lastIndex;
    }
    if (last < p.length) nodes.push(p.slice(last));

    return (
      <p key={i} className="mb-6 leading-relaxed text-foreground/90 font-light text-lg">
        {nodes}
      </p>
    );
  });

/**
 * Renders a bulleted list. Items are either plain strings or structured
 * `{ label, body }` objects, where `label` is a bold lead-in term (modeled as
 * real structure, not markdown asterisks in the content string).
 */
const renderList = (items: ListItem[]) => (
  <ul className="my-8 flex flex-col gap-4 font-mono text-sm border-l border-border pl-6">
    {items.map((item, i) => (
      <li
        key={i}
        className="text-muted-foreground relative before:content-['>'] before:absolute before:-left-5 before:text-border"
      >
        {typeof item === "string" ? (
          renderText(item)
        ) : (
          <>
            <strong className="font-semibold text-foreground">{renderText(item.label)}</strong>{" "}
            {renderText(item.body)}
          </>
        )}
      </li>
    ))}
  </ul>
);

/**
 * Tufte-style marginalia, matched verbatim against paragraph text at render time
 * (never annotated in content.ts). Each `match` is a unique substring of the
 * paragraph it should sit beside; the note grounds itself in an existing source.
 */
const MARGIN_NOTES: MarginNote[] = [];

const findMarginNote = (paragraph: string): MarginNote | undefined =>
  MARGIN_NOTES.find((n) => paragraph.includes(n.match));

/**
 * Data-driven cross-links from a simplified main section to the appendices that
 * carry its full technical depth. Keyed by section id → appendix ids; the
 * appendix letter (A, B, …) is derived from the appendix's position so it never
 * drifts from the rendered list. Rendered as plain anchors so they degrade
 * gracefully in the prerendered HTML; the href target is caller-supplied
 * (in-page `#appendix-<id>` on the full paper, `/sections/<id>/` on section pages).
 */
const SECTION_APPENDIX_LINKS: Record<string, string[]> = {
  economics: ["egress"],
  architecture: ["sensory", "enclave"],
  compliance: ["flywheel"],
};

const appendixIndexById = new Map(content.appendices.map((a, i) => [a.id, i]));

interface AppendixLink {
  id: string;
  letter: string;
  label: string;
}

const resolveAppendixLinks = (sectionId: string): AppendixLink[] =>
  (SECTION_APPENDIX_LINKS[sectionId] ?? []).flatMap((id) => {
    const idx = appendixIndexById.get(id);
    if (idx === undefined) return [];
    return [
      {
        id,
        letter: String.fromCharCode(65 + idx),
        label: content.appendices[idx].title.split(":")[0],
      },
    ];
  });

/**
 * Small, in-aesthetic "See Appendix X" links connecting a main section to its
 * supporting appendices. Plain anchors → no JS required.
 */
const renderAppendixLinks = (links: AppendixLink[], href: (id: string) => string) =>
  links.length === 0 ? null : (
    <div className="no-print mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6 font-mono text-[11px] uppercase tracking-widest">
      <span className="text-border">{"// full technical detail"}</span>
      {links.map((a) => (
        <a
          key={a.id}
          href={href(a.id)}
          className="border border-border px-3 py-2 text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
        >
          See Appendix {a.letter} — {a.label} ↗
        </a>
      ))}
    </div>
  );

/**
 * Renders a set of principle callouts. Each entry is `{ label?, body }`, where
 * `label` is an optional bold lead-in term (modeled as structure, not markdown).
 * Given a distinct left-border / mono treatment to read as a tenet block.
 */
const renderPrinciples = (principles: Principle[]) => (
  <div className="my-10 flex flex-col gap-6">
    {principles.map((p, i) => (
      <blockquote
        key={i}
        className="border-l-2 border-primary bg-card/40 py-3 pl-6 pr-4 font-mono text-sm leading-relaxed text-muted-foreground"
      >
        {p.label ? (
          <>
            <strong className="font-semibold uppercase tracking-wider text-foreground">
              {renderText(p.label)}
            </strong>{" "}
            {renderText(p.body)}
          </>
        ) : (
          renderText(p.body)
        )}
      </blockquote>
    ))}
  </div>
);

const renderTable = (tableData: Table) => (
  <div className="table-scroll w-full overflow-x-auto my-10 font-mono text-xs md:text-sm">
    <table className="w-full border-collapse border border-border text-left">
      <thead>
        <tr className="bg-secondary/30">
          {tableData.headers.map((h: string, i: number) => (
            <th key={i} className="border border-border p-3 font-semibold uppercase tracking-wider text-muted-foreground">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tableData.rows.map((row: string[], i: number) => (
          <tr key={i} className="hover:bg-card/50 transition-colors">
            {row.map((cell: string, j: number) => {
              const num = /^\d{1,2}$/.test(cell) ? parseInt(cell, 10) : NaN;
              const isSourceNote = !Number.isNaN(num) && getSource(num) !== null;
              return (
                <td key={j} className="border border-border p-3">
                  {isSourceNote ? <Citation number={num} /> : cell}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const renderProse = (paragraphs: string[]) =>
  paragraphs.map((p, i) => {
    const note = findMarginNote(p);
    return (
      <p key={i} className="mb-6 leading-relaxed text-foreground/90 font-light text-lg">
        {renderText(p)}
        {note && (
          <SideNote id={note.id} label={note.label} note={note.note} source={note.source} />
        )}
      </p>
    );
  });

const renderCode = (block: { caption?: string; code: string }) => (
  <figure className="my-8">
    <pre className="overflow-x-auto rounded-none border border-border bg-[hsl(0_0%_2%)] p-5 font-mono text-xs leading-relaxed text-foreground/85">
      <code>{block.code}</code>
    </pre>
    {block.caption && (
      <figcaption className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
        {block.caption}
      </figcaption>
    )}
  </figure>
);

const renderBlocks = (blocks: ContactBlock[]) =>
  blocks.map((b, bi) => (
    <div key={bi} className="mt-8">
      {b.label && (
        <h4 className="mb-3 font-serif text-xl font-semibold text-foreground/90">
          {renderText(b.label)}
        </h4>
      )}
      {b.prose && renderProse(b.prose)}
      {b.list && renderList(b.list)}
      {b.lines && (
        <div className="font-mono text-sm leading-relaxed text-muted-foreground space-y-1">
          {b.lines.map((line: string, i: number) => (
            <div key={i}>{renderText(line)}</div>
          ))}
        </div>
      )}
    </div>
  ));

const SUBHEADING_CLASSES = {
  h2: "text-2xl md:text-3xl font-serif font-semibold mb-6 text-foreground/90",
  h3: "text-2xl font-serif font-semibold mb-6 text-foreground/90",
  h4: "text-xl font-serif font-semibold mb-6 text-foreground/90",
} as const;

export interface SectionBodyProps {
  section: Section;
  /** Heading tag used for subsection titles (h3 on the full paper's main
   *  sections, h4 for its appendices, h2 on standalone section pages). */
  subheading?: keyof typeof SUBHEADING_CLASSES;
  /** When provided, "See Appendix X" cross-links are rendered for main
   *  sections, pointing at the caller-supplied href for each appendix id. */
  appendixHref?: (id: string) => string;
}

/**
 * Renders one full section/appendix body: prose, inline widgets (egress
 * calculator, architecture blueprint), lists, and all subsections with their
 * structured fields, in the same order as the original Home.tsx renderer.
 */
export function SectionBody({ section, subheading = "h3", appendixHref }: SectionBodyProps) {
  const Sub = subheading;
  const subClass = SUBHEADING_CLASSES[subheading];
  return (
    <div className="prose-container">
      {renderProse(section.prose)}

      {section.id === "for" && <EgressCalculator />}

      {section.list && renderList(section.list)}

      {section.postListProse && renderProse(section.postListProse)}

      {section.id === "architecture" && <ArchitectureBlueprint />}

      {section.subsections?.map((sub, sIdx) => (
        <div key={sIdx} className="mt-16">
          <Sub className={subClass}>{sub.title}</Sub>
          {renderProse(sub.prose)}

          {sub.mathProse && renderMathProse(sub.mathProse)}

          {sub.code && renderCode(sub.code)}

          {sub.principles && renderPrinciples(sub.principles)}

          {sub.tableData && renderTable(sub.tableData)}

          {sub.postTableProse && renderProse(sub.postTableProse)}

          {sub.list && renderList(sub.list)}

          {sub.blocks && renderBlocks(sub.blocks)}

          {sub.postListProse && renderProse(sub.postListProse)}

          {sub.closing && (
            <p className="mt-6 font-serif italic text-foreground/80">{renderText(sub.closing)}</p>
          )}
        </div>
      ))}

      {appendixHref && renderAppendixLinks(resolveAppendixLinks(section.id), appendixHref)}
    </div>
  );
}
