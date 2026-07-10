import { content, type Section } from "@/content";
import { SITE_URL } from "./spec";

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

/**
 * Curated meta descriptions for every section and appendix page.
 * Each is a complete sentence (or set of sentences) under 160 characters —
 * no mid-sentence truncation. Edit here when section prose changes materially.
 */
const CURATED_DESCRIPTIONS: Record<string, string> = {
  ceiling:
    "Regulated banks, law firms, and healthcare systems are best positioned to leverage frontier AI — and precisely the ones least able to use it as delivered.",
  for: "If your Chief Risk Officer must approve every AI vendor before a query touches sensitive data, this architecture resolves that at the infrastructure level.",
  architecture:
    "The AI-Native Office separates ownership and responsibility across three distinct parties, none with access to what belongs to another.",
  identity:
    "A sovereign compute environment is only as secure as its physical access logs.",
  economics:
    "Cloud providers charge for data moving out of their infrastructure. For AI workloads, egress is not incidental — it is the dominant operating expense.",
  compliance:
    "Compliance in the cloud is procedural — resting on vendor access controls and audit logs maintained by a third party whose interests are not identical to yours.",
  engage:
    "The organizations engaging with this standard now are setting the terms for how regulated enterprise AI infrastructure gets built.",
  egress:
    "Hyperscaler infrastructure is priced on an asymmetric model: inbound data transfer is subsidized or free, while outbound egress is metered and billed.",
  sensory:
    "The modern enterprise is built on a legacy ingestion bottleneck: the keyboard. The AI-Native Office treats the physical workspace as a continuous sensory organ.",
  enclave:
    "Processing terabytes of uncompressed acoustic and spatial data requires a physical environment engineered to the standards of a military installation.",
  flywheel:
    "The convergence of acoustic isolation, localized PCIe hardware, and ambient telemetry creates the ultimate enterprise moat: Absolute Sovereignty.",
  proxies:
    "Enterprise AI's standard architecture extracts local telemetry and transmits it to hyperscaler infrastructure, resting on a fundamentally compromised topology.",
  topography:
    "The localized orchestration layer functions as a hypervisor for physical space — abstracting sensory hardware resources for intelligent software workloads.",
  ingestion:
    "Processing ambient reality requires an ingestion architecture that is exceptionally performant yet fundamentally stateless.",
  orchestration:
    "Once ambient reality has been routed, transcribed, and structured into lightweight JSON, it requires a central logic unit to trigger autonomous action.",
  isolation:
    "In highly regulated domains, data governance is not a matter of corporate preference; it is a matter of federal statute and civil liability.",
  deployment:
    "Deploying the Software Integrator is less an installation than a fusing of silicon and telemetry.",
};

/**
 * Returns a curated description when available, otherwise derives one from the
 * section's first non-empty paragraph, cutting at a sentence boundary to avoid
 * mid-sentence truncation in search and social previews.
 */
function summarize(section: Section): string {
  if (CURATED_DESCRIPTIONS[section.id]) {
    return CURATED_DESCRIPTIONS[section.id];
  }
  const first =
    [
      ...section.prose,
      ...(section.subsections ?? []).flatMap((s) => s.prose),
    ].find((p) => p.trim().length > 0) ?? "";
  if (first.length <= MAX_DESCRIPTION) return first;
  // Prefer a clean sentence boundary within the limit.
  const candidate = first.slice(0, MAX_DESCRIPTION);
  const sentenceEnd = Math.max(
    candidate.lastIndexOf(". "),
    candidate.lastIndexOf("! "),
    candidate.lastIndexOf("? "),
  );
  if (sentenceEnd > 60) return first.slice(0, sentenceEnd + 1);
  // Fall back to word boundary.
  const lastSpace = candidate.lastIndexOf(" ");
  const trimmed = (lastSpace > 80 ? candidate.slice(0, lastSpace) : candidate).replace(
    /[\s,;:.]+$/,
    "",
  );
  return `${trimmed}…`;
}

function toPage(section: Section, isAppendix: boolean, appendixIdx: number): SectionPageInfo {
  const letter = isAppendix ? String.fromCharCode(65 + appendixIdx) : undefined;
  // Short label: strip a subtitle after the first colon so long appendix titles
  // don't bloat the <title> tag. Explicit navLabel overrides the auto-split.
  const navLabel = section.navLabel ?? section.title.split(":")[0];
  const shortTitle = isAppendix ? `Appendix ${letter}: ${navLabel}` : navLabel;
  return {
    id: section.id,
    path: `/sections/${section.id}/`,
    url: `${SITE_URL}/sections/${section.id}/`,
    title: section.title,
    navLabel,
    metaTitle: `${shortTitle} | AI-Native Office`,
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
