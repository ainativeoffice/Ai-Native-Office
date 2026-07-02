import { content, type Section } from "@/content";
import { SITE_NAME, SITE_URL, specMetaLabel } from "./spec";

/**
 * Registry of per-section/appendix pages. Every top-level section and appendix
 * gets its own URL at `/sections/<id>/` (using the existing content ids as
 * slugs). This module is React-free so both the client router pages and the
 * SSG pipeline (entry-server → prerender.mjs → sitemap) derive the exact same
 * page list, titles, and meta descriptions from one source.
 */

export interface SectionPageInfo {
  /** Content id, doubles as the URL slug. */
  id: string;
  /** App-relative path with trailing slash, e.g. `/sections/economics/`. */
  path: string;
  /** Absolute canonical URL on the production domain. */
  url: string;
  /** Rendered page heading (verbatim section title). */
  title: string;
  /** Short sidebar/TOC label. */
  navLabel: string;
  /** Full <title> / og:title value for this page. */
  metaTitle: string;
  /** Meta description derived from the section's first paragraph. */
  description: string;
  isAppendix: boolean;
  /** "A", "B", … for appendices. */
  appendixLetter?: string;
  /** In-page anchor on the full paper (`/#<anchor>`) for this section. */
  anchor: string;
  section: Section;
}

const MAX_DESCRIPTION = 160;

/** First non-empty paragraph of a section, truncated at a word boundary. */
function summarize(section: Section): string {
  const first =
    [
      ...section.prose,
      ...(section.subsections ?? []).flatMap((s) => s.prose),
    ].find((p) => p.trim().length > 0) ?? "";
  if (first.length <= MAX_DESCRIPTION) return first;
  const cut = first.slice(0, MAX_DESCRIPTION - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.]+$/, "");
  return `${trimmed}…`;
}

function toPage(section: Section, isAppendix: boolean, appendixIdx: number): SectionPageInfo {
  const letter = isAppendix ? String.fromCharCode(65 + appendixIdx) : undefined;
  const displayTitle = isAppendix ? `Appendix ${letter}: ${section.title}` : section.title;
  return {
    id: section.id,
    path: `/sections/${section.id}/`,
    url: `${SITE_URL}/sections/${section.id}/`,
    title: section.title,
    navLabel: section.navLabel ?? section.title.split(":")[0],
    metaTitle: `${displayTitle} — ${SITE_NAME} · ${specMetaLabel()}`,
    description: summarize(section),
    isAppendix,
    appendixLetter: letter,
    anchor: isAppendix ? `appendix-${section.id}` : section.id,
    section,
  };
}

/** All section pages in reading order: main sections first, then appendices. */
export const sectionPages: SectionPageInfo[] = [
  ...content.sections.map((s) => toPage(s, false, 0)),
  ...content.appendices.map((s, i) => toPage(s, true, i)),
];

const pageById = new Map(sectionPages.map((p) => [p.id, p]));

export function getSectionPage(id: string): SectionPageInfo | undefined {
  return pageById.get(id);
}

/** Prev/next pages in reading order (undefined at the edges). */
export function getAdjacentPages(id: string): {
  prev?: SectionPageInfo;
  next?: SectionPageInfo;
} {
  const idx = sectionPages.findIndex((p) => p.id === id);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? sectionPages[idx - 1] : undefined,
    next: idx < sectionPages.length - 1 ? sectionPages[idx + 1] : undefined,
  };
}
