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
