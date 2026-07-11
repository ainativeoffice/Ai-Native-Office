import {
  signalLog,
  signalAnchor,
  signalDesignation,
  signalNumber,
  type SignalEntry,
} from "./signals";
import { SITE_NAME, SITE_URL } from "./spec";
import { getSectionPage } from "./sectionPages";

/**
 * Registry for the Signal Log page (`/signals/`), mirroring `blogPages.ts`.
 * React-free so the client page and the SSG pipeline (entry-server →
 * prerender.mjs → sitemap + llms-full.txt) derive the same URL, meta, and
 * entry list from one source.
 */

export const SIGNALS_PATH = "/signals/";
export const SIGNALS_URL = `${SITE_URL}${SIGNALS_PATH}`;
export const SIGNALS_TITLE = "Signal Log";
export const SIGNALS_META_TITLE = `${SIGNALS_TITLE} — ${SITE_NAME}`;
export const SIGNALS_DESCRIPTION =
  "The evidence ledger for the AI-Native Office specification: a dated, numbered log of real-world events — announcements, market data, policy commitments — that validate the sovereign on-premises compute thesis.";

/** Newest-first entries (source array order). */
export const signalEntries: SignalEntry[] = signalLog;

/** Absolute shareable URL for one entry, e.g. `https://…/signals/#log-001`. */
export function signalEntryUrl(entry: SignalEntry): string {
  return `${SIGNALS_URL}#${signalAnchor(entry)}`;
}

/**
 * Build-time guard: every `validatesSectionIds` ref must point at a real
 * section/appendix page, entry numbers must be unique, and the array must be
 * newest-first. Called by the prerender so a bad ref fails the build.
 */
export function assertSignalsValid(): void {
  const seen = new Set<number>();
  let prevNumber = Infinity;
  for (const entry of signalEntries) {
    if (seen.has(entry.number)) {
      throw new Error(`Signal Log: duplicate entry number ${signalNumber(entry.number)}`);
    }
    seen.add(entry.number);
    // Ledger numbers are assigned in logging order and are the permanent
    // ordering invariant. Event dates are NOT required to be monotonic:
    // an event can be logged after a more recent event was (e.g. // 006,
    // dated 2026-06-25, was logged after // 005, dated 2026-06-30).
    if (entry.number > prevNumber) {
      throw new Error(
        `Signal Log: entries must be newest-first — ${signalDesignation(entry)} appears after ${signalNumber(prevNumber)}`,
      );
    }
    prevNumber = entry.number;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
      throw new Error(`Signal Log: ${signalDesignation(entry)} has a non-ISO date "${entry.date}"`);
    }
    if (entry.sources.length === 0) {
      throw new Error(`Signal Log: ${signalDesignation(entry)} has no sources`);
    }
    for (const id of entry.validatesSectionIds) {
      if (!getSectionPage(id)) {
        throw new Error(
          `Signal Log: ${signalDesignation(entry)} validates unknown section id "${id}"`,
        );
      }
    }
  }
}

export { signalAnchor, signalDesignation, signalNumber };
