/**
 * The paper's original publication date (ISO YYYY-MM-DD). Single source of
 * truth shared by:
 *   - the RFC Log launch post (`rfc-v0-5-open-for-comment` in `blog.ts`),
 *     which announces the publication and must carry the same date;
 *   - the artifact's `DATE_PUBLISHED` (JSON-LD `datePublished`, sitemap).
 * These used to be two hand-maintained copies and drifted once — never
 * hardcode this date anywhere else.
 */
export const PAPER_DATE_PUBLISHED = "2026-06-16";

/** Slug of the RFC Log launch post whose date must equal `PAPER_DATE_PUBLISHED`. */
export const LAUNCH_POST_SLUG = "rfc-v0-5-open-for-comment";

/**
 * The date of the last hand-made revision to the spec's own copy (ISO
 * YYYY-MM-DD). Bump this when the whitepaper content itself changes. The
 * document's effective `dateModified` (JSON-LD, sitemap `lastmod`) is derived
 * as the MAX of this date, the newest RFC Log post date, and the newest
 * Signal Log entry date — so publishing a post or signal entry can never
 * leave the document looking staler than its newest content, and forgetting
 * to bump this constant only matters for spec-copy-only edits.
 */
export const SPEC_REVISION_DATE = "2026-07-02";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Returns the latest of the given ISO `YYYY-MM-DD` dates. Throws on any
 * malformed date, because the comparison is lexicographic and only correct
 * for strict ISO dates. Used to derive the paper's `dateModified`.
 */
export function latestIsoDate(dates: readonly (string | undefined)[]): string {
  const valid: string[] = [];
  for (const d of dates) {
    if (d === undefined) continue;
    if (!ISO_DATE_RE.test(d)) {
      throw new Error(
        `latestIsoDate: "${d}" is not a strict ISO YYYY-MM-DD date — dateModified derivation relies on lexicographic comparison, so every blog/signal/spec date must be ISO-formatted.`,
      );
    }
    valid.push(d);
  }
  if (valid.length === 0) {
    throw new Error("latestIsoDate: no dates provided.");
  }
  return valid.reduce((a, b) => (b > a ? b : a));
}
