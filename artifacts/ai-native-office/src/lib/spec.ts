import { content } from "../content";

/**
 * Single source of truth for the spec version/status label that appears across
 * every surface (UI badges, JSON-LD, page <title>/OpenGraph meta, OG image).
 * All values derive from `content.hero.spec` so a version bump in `content.ts`
 * propagates everywhere after a rebuild + OG regeneration.
 */

export const SITE_NAME = "The AI-Native Office";

export function specVersion(): string {
  return content.hero.spec.version;
}

/**
 * The short status token used in compact surfaces (title, OG card). Extracts a
 * parenthetical abbreviation when present (e.g. "Request for Comment (RFC)" →
 * "RFC"); falls back to the full status string otherwise.
 */
export function specStatusShort(): string {
  const status = content.hero.spec.status;
  const match = status.match(/\(([^)]+)\)/);
  return match ? match[1] : status;
}

/** e.g. "Draft Specification v0.5 (RFC)" — used in the page title + social titles. */
export function specMetaLabel(): string {
  return `Draft Specification v${specVersion()} (${specStatusShort()})`;
}

/** Full page/social title, e.g. "The AI-Native Office — ... · Draft Specification v0.5 (RFC)". */
export function metaTitle(): string {
  return `${SITE_NAME} — ${content.hero.title} · ${specMetaLabel()}`;
}
