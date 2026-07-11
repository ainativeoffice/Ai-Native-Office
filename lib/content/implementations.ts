import { SITE_NAME, SITE_URL } from "./spec";
import { getSectionPage } from "./sectionPages";

/**
 * Registry for the Implementations page (`/implementations/`), mirroring
 * `signalsPage.ts`. React-free so the client page and the SSG pipeline derive
 * the same URL, meta, and entry list from one source.
 *
 * IMPORTANT — editorial policy: the AI-Native Office specification is vendor-,
 * property-, and operator-agnostic. This registry is INFORMATIVE / NON-NORMATIVE.
 * Listing an implementation records that an independent party is exploring or
 * deploying an environment related to this specification. It does NOT imply
 * certification, conformance, or endorsement, and the registry is explicitly
 * open to unaffiliated third-party submissions.
 */

export const IMPLEMENTATIONS_PATH = "/implementations/";
export const IMPLEMENTATIONS_URL = `${SITE_URL}${IMPLEMENTATIONS_PATH}`;
export const IMPLEMENTATIONS_TITLE = "Implementation Registry";
export const IMPLEMENTATIONS_META_TITLE = `${IMPLEMENTATIONS_TITLE} — ${SITE_NAME}`;
export const IMPLEMENTATIONS_DESCRIPTION =
  "An informative, non-normative registry of physical and software environments exploring the AI-Native Office specification. Inclusion does not indicate certification, conformance, or endorsement.";

/**
 * Self-declared maturity of an implementation. Deliberately conservative — no
 * value here asserts conformance, which would require a published verification
 * model that does not yet exist.
 */
export type ImplementationStatus =
  | "Experimental deployment"
  | "Implementation profile"
  | "Principles being evaluated"
  | "Referenced context";

/** Whether the maturity claim is self-declared or independently reviewed. */
export type ReviewState = "Self-declared" | "Independently reviewed";

export interface ImplementationEntry {
  /** Stable slug used for the in-page anchor. */
  id: string;
  /** Implementation / organization name. */
  name: string;
  /** Short descriptor of the deployment type. */
  kind: string;
  /** Geographic location, or "—" when not disclosed. */
  location: string;
  /** Operating party. */
  operator: string;
  /** External canonical URL for the implementation. */
  url: string;
  /** Self-declared maturity. */
  status: ImplementationStatus;
  /** Self-declared vs independently reviewed. */
  review: ReviewState;
  /** ISO date the entry was last confirmed. */
  lastVerified: string;
  /**
   * Neutral, technical description of which specification concepts the
   * environment relates to — not marketing copy.
   */
  summary: string;
  /** Section/appendix ids this implementation relates to. Must resolve. */
  relatedSectionIds: string[];
}

/**
 * The initial registry. New entries — including unaffiliated third parties —
 * are appended here. Order is not significant beyond reading convenience.
 */
export const implementationEntries: ImplementationEntry[] = [
  {
    id: "355-main",
    name: "355 Main",
    kind: "Physical workplace + on-premises infrastructure",
    location: "Armonk, New York",
    operator: "North Castle Ventures",
    url: "https://355main.com",
    status: "Experimental deployment",
    review: "Self-declared",
    lastVerified: "2026-07-01",
    summary:
      "A physical property exploring sovereign edge infrastructure and AI-ready workspace design, including on-premises compute siting and the acoustic and spatial engineering discussed in the sensory and enclave appendices.",
    relatedSectionIds: ["enclave", "economics", "sensory", "identity"],
  },
  {
    id: "armonk-professional-center",
    name: "Armonk Professional Center",
    kind: "Multi-tenant professional-office implementation",
    location: "Armonk, New York",
    operator: "North Castle Ventures",
    url: "https://armonkprofessionalcenter.com",
    status: "Principles being evaluated",
    review: "Self-declared",
    lastVerified: "2026-07-01",
    summary:
      "A multi-tenant professional-office environment evaluating the tripartite ownership model, tenant-scoped data isolation, and the compliance posture required when several regulated occupants share a building.",
    relatedSectionIds: ["architecture", "isolation", "compliance"],
  },
  {
    id: "north-castle-ventures",
    name: "North Castle Ventures",
    kind: "Development and operating context",
    location: "Armonk, New York",
    operator: "North Castle Ventures",
    url: "https://northcastleventures.com",
    status: "Referenced context",
    review: "Self-declared",
    lastVerified: "2026-07-01",
    summary:
      "The development and operating context for properties exploring the specification, including the commercial-real-estate framing of on-premises compute as an asset class and the operating economics of localized infrastructure.",
    relatedSectionIds: ["economics", "engage"],
  },
  {
    id: "native-agentic",
    name: "Native Agentic",
    kind: "Agentic software + orchestration implementation",
    location: "—",
    operator: "Native Agentic",
    url: "https://nativeagentic.com",
    status: "Implementation profile",
    review: "Self-declared",
    lastVerified: "2026-07-01",
    summary:
      "An agentic software implementation exploring the localized orchestration layer, stateless ambient ingestion, and the autonomous action pipeline described in the orchestration and ingestion appendices.",
    relatedSectionIds: ["orchestration", "ingestion", "sensory"],
  },
];

/** Absolute shareable URL for one entry, e.g. `https://…/implementations/#355-main`. */
export function implementationEntryUrl(entry: ImplementationEntry): string {
  return `${IMPLEMENTATIONS_URL}#${entry.id}`;
}

/**
 * Build-time guard: every `relatedSectionIds` ref must point at a real
 * section/appendix page, ids must be unique, and dates must be ISO. Called by
 * the prerender so a bad ref fails the build.
 */
export function assertImplementationsValid(): void {
  const seen = new Set<string>();
  for (const entry of implementationEntries) {
    if (seen.has(entry.id)) {
      throw new Error(`Implementation Registry: duplicate entry id "${entry.id}"`);
    }
    seen.add(entry.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.lastVerified)) {
      throw new Error(
        `Implementation Registry: "${entry.name}" has a non-ISO lastVerified "${entry.lastVerified}"`,
      );
    }
    for (const id of entry.relatedSectionIds) {
      if (!getSectionPage(id)) {
        throw new Error(
          `Implementation Registry: "${entry.name}" relates to unknown section id "${id}"`,
        );
      }
    }
  }
}
