import {
  content,
  blogPosts,
  type ListItem,
  type Section,
  type Subsection,
  type ContactBlock,
  type Principle,
} from "@/content";
import { splitEmphasis } from "./emphasis";

/**
 * Build-time guard for inline-markdown emphasis in verbatim copy.
 *
 * `**bold**` / `*italic*` is live render syntax in every prose string that
 * flows through the shared section renderer (manifesto sections, appendices,
 * blog posts). That means a future verbatim paragraph containing a footnote
 * star, `a*b` multiplication, or an unbalanced marker would be transformed or
 * half-matched silently on the rendered page. This guard walks the whole
 * content tree and flags every asterisk that is not an explicitly-approved
 * emphasis span, so a bad paragraph fails the build instead of shipping
 * mangled text (previously the only safeguard was a manual grep note).
 *
 * Two kinds of finding:
 * - `"stray"`: an asterisk that `splitEmphasis` leaves in a plain-text token —
 *   unbalanced (`*open only`), spaced (`a * b`), or empty (`****`). It renders
 *   literally today, but it is one edit away from pairing up with a future
 *   asterisk and silently italicizing half a paragraph.
 * - `"unapproved"`: a span that `splitEmphasis` WOULD transform into
 *   strong/em but whose exact source text is not in {@link INTENTIONAL_EMPHASIS}.
 *   This is the dangerous case: `3*2 and 5*4` half-matches as an em span and
 *   the multiplication signs vanish from the rendered page.
 *
 * To ship new intentional emphasis: add the exact marker-wrapped source text
 * (e.g. `"**Tripartite Ownership Model**"`) to the allowlist below. That is
 * the deliberate approval step — the same edit that adds emphasis to copy must
 * also declare it here, so nothing is ever emphasized by accident.
 */

/**
 * Every approved emphasis span, verbatim including its `**`/`*` markers.
 * Currently: the RFC 001 blog post's structural bold + one mid-sentence em.
 */
const INTENTIONAL_EMPHASIS: ReadonlySet<string> = new Set([
  "**Date:**",
  "**Category:**",
  "**Tripartite Ownership Model**",
  "*after*",
]);

/** A suspicious asterisk found in prose. */
export interface SuspiciousEmphasis {
  /** `"stray"` = leftover asterisk in plain text; `"unapproved"` = would-be emphasis not in the allowlist. */
  reason: "stray" | "unapproved";
  /** The offending source text: the raw text token, or the marker-wrapped span. */
  offending: string;
  location: string;
  context: string;
}

const SNIPPET = 60;

function snippet(text: string, around: number): string {
  const start = Math.max(0, around - SNIPPET);
  const end = Math.min(text.length, around + SNIPPET);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

/**
 * Walk every renderable string in the manifest (hero title, sections,
 * appendices) AND every blog post body, collecting suspicious asterisk usage.
 * Returns an empty array when all asterisks are either absent or approved —
 * the build guard fails if not.
 *
 * Pass `onlyText` to check a single arbitrary string instead of the shipped
 * content (used by tests); omit it to validate everything that ships.
 */
export function findSuspiciousEmphasis(onlyText?: string): SuspiciousEmphasis[] {
  if (onlyText !== undefined) {
    const suspicious: SuspiciousEmphasis[] = [];
    checkProse(suspicious, onlyText, "(input)");
    return suspicious;
  }

  const suspicious: SuspiciousEmphasis[] = [];
  checkProse(suspicious, content.hero.title, "hero.title");
  content.sections.forEach((section, si) =>
    suspicious.push(...scanSectionEmphasis(section, `sections[${si}] "${section.title}"`)),
  );
  content.appendices.forEach((appendix, si) =>
    suspicious.push(...scanSectionEmphasis(appendix, `appendices[${si}] "${appendix.title}"`)),
  );
  blogPosts.forEach((post) =>
    suspicious.push(...scanSectionEmphasis(post.body, `blog "${post.slug}"`)),
  );
  return suspicious;
}

function checkProse(out: SuspiciousEmphasis[], text: string, location: string): void {
  if (!text.includes("*")) return;
  let offset = 0;
  for (const token of splitEmphasis(text)) {
    const source =
      token.type === "strong"
        ? `**${token.value}**`
        : token.type === "em"
          ? `*${token.value}*`
          : token.value;
    if (token.type === "text") {
      const starIdx = token.value.indexOf("*");
      if (starIdx !== -1) {
        out.push({
          reason: "stray",
          offending: token.value,
          location,
          context: snippet(text, offset + starIdx),
        });
      }
    } else if (!INTENTIONAL_EMPHASIS.has(source)) {
      out.push({
        reason: "unapproved",
        offending: source,
        location,
        context: snippet(text, offset),
      });
    }
    offset += source.length;
  }
}

function checkListItem(out: SuspiciousEmphasis[], item: ListItem, location: string): void {
  if (typeof item === "string") {
    checkProse(out, item, location);
  } else {
    if (item.label) checkProse(out, item.label, `${location}.label`);
    if (item.body) checkProse(out, item.body, `${location}.body`);
  }
}

/**
 * Scan one `Section`-shaped tree (a manifesto section, appendix, or blog post
 * body) for suspicious emphasis. Must visit every field the shared renderer
 * (`WhitepaperBody.tsx`) passes through `renderText` → `splitEmphasis`:
 * prose, lists (labels + bodies), principles (labels + bodies), closing,
 * post-table/post-list prose, contact blocks, and table cells. Deliberately
 * excluded: `mathProse` (own KaTeX renderer) and `code` blocks (rendered
 * verbatim). Exported so tests can prove each field is walked.
 *
 * Similar walk to `findBrokenCitations` in citations.ts (kept separate
 * because this guard also covers blog posts and principles). If a new
 * prose-bearing field is added to the Section shape, extend BOTH walkers.
 */
export function scanSectionEmphasis(section: Section, label: string): SuspiciousEmphasis[] {
  const out: SuspiciousEmphasis[] = [];
  const at = (suffix: string) => `${label} › ${suffix}`;
  (section.prose ?? []).forEach((p, i) => checkProse(out, p, at(`prose[${i}]`)));
  (section.list ?? []).forEach((it, i) => checkListItem(out, it, at(`list[${i}]`)));
  (section.postListProse ?? []).forEach((p, i) => checkProse(out, p, at(`postListProse[${i}]`)));
  (section.subsections ?? []).forEach((sub: Subsection, sj) => {
    const subAt = (suffix: string) => at(`subsections[${sj}] "${sub.title}" › ${suffix}`);
    (sub.prose ?? []).forEach((p, i) => checkProse(out, p, subAt(`prose[${i}]`)));
    (sub.principles ?? []).forEach((principle: Principle, pi) => {
      if (principle.label) checkProse(out, principle.label, subAt(`principles[${pi}].label`));
      checkProse(out, principle.body, subAt(`principles[${pi}].body`));
    });
    (sub.list ?? []).forEach((it, i) => checkListItem(out, it, subAt(`list[${i}]`)));
    if (sub.closing) checkProse(out, sub.closing, subAt("closing"));
    (sub.postTableProse ?? []).forEach((p, i) => checkProse(out, p, subAt(`postTableProse[${i}]`)));
    (sub.postListProse ?? []).forEach((p, i) => checkProse(out, p, subAt(`postListProse[${i}]`)));
    (sub.blocks ?? []).forEach((block: ContactBlock, bi) => {
      const blockAt = (suffix: string) =>
        subAt(`blocks[${bi}]${block.label ? ` "${block.label}"` : ""} › ${suffix}`);
      if (block.label) checkProse(out, block.label, blockAt("label"));
      (block.prose ?? []).forEach((p, i) => checkProse(out, p, blockAt(`prose[${i}]`)));
      (block.list ?? []).forEach((it, i) => checkListItem(out, it, blockAt(`list[${i}]`)));
      (block.lines ?? []).forEach((l, i) => checkProse(out, l, blockAt(`lines[${i}]`)));
    });
    if (sub.tableData) {
      (sub.tableData.headers ?? []).forEach((h, i) =>
        checkProse(out, h, subAt(`tableData.headers[${i}]`)),
      );
      (sub.tableData.rows ?? []).forEach((row, ri) =>
        row.forEach((cell, ci) => checkProse(out, cell, subAt(`tableData.rows[${ri}][${ci}]`))),
      );
    }
  });
  return out;
}

/**
 * Build-time guard: throws if any prose string contains a stray asterisk or
 * an emphasis span that is not in the {@link INTENTIONAL_EMPHASIS} allowlist.
 * Called by `prerender.mjs` (like `assertCitationsValid` / `assertSignalsValid`)
 * so suspicious copy fails the production build instead of shipping mangled.
 */
export function assertEmphasisValid(): void {
  const suspicious = findSuspiciousEmphasis();
  if (suspicious.length === 0) return;
  const details = suspicious
    .map(
      (s) =>
        `  • ${s.reason === "stray" ? "stray asterisk" : `unapproved emphasis ${JSON.stringify(s.offending)}`} at ${s.location}\n    "${s.context}"`,
    )
    .join("\n");
  throw new Error(
    `Emphasis check failed: ${suspicious.length} suspicious asterisk usage(s) in content ` +
      `(intentional emphasis must be added to INTENTIONAL_EMPHASIS in src/lib/emphasisGuard.ts):\n${details}`,
  );
}
