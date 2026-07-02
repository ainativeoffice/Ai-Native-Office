import { test } from "node:test";
import assert from "node:assert/strict";
import { latestIsoDate, SPEC_REVISION_DATE, PAPER_DATE_PUBLISHED } from "@workspace/whitepaper";
import { blogPages } from "./blogPages";
import { signalEntries } from "./signalsPage";

test("latestIsoDate returns the max of ISO dates", () => {
  assert.equal(latestIsoDate(["2026-06-16", "2026-07-02", "2026-06-30"]), "2026-07-02");
  assert.equal(latestIsoDate(["2026-01-01"]), "2026-01-01");
});

test("latestIsoDate skips undefined entries", () => {
  assert.equal(latestIsoDate([undefined, "2026-06-30", undefined]), "2026-06-30");
});

test("latestIsoDate throws on malformed dates (lexicographic compare is ISO-only)", () => {
  assert.throws(() => latestIsoDate(["07/02/2026"]), /not a strict ISO/);
  assert.throws(() => latestIsoDate(["2026-7-2"]), /not a strict ISO/);
  assert.throws(() => latestIsoDate([]), /no dates provided/);
});

test("derived dateModified can never be older than the newest post or signal entry", () => {
  const derived = latestIsoDate([
    SPEC_REVISION_DATE,
    ...blogPages.map((p) => p.date),
    ...signalEntries.map((e) => e.date),
  ]);
  for (const p of blogPages) assert.ok(derived >= p.date, `stale vs blog post ${p.slug}`);
  for (const e of signalEntries) assert.ok(derived >= e.date, `stale vs signal entry ${e.id}`);
  assert.ok(derived >= SPEC_REVISION_DATE);
  assert.ok(derived >= PAPER_DATE_PUBLISHED, "modified date precedes publish date");
});

test("all content dates are strict ISO so the derivation cannot silently misorder", () => {
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  assert.match(SPEC_REVISION_DATE, iso);
  for (const p of blogPages) assert.match(p.date, iso, `blog post ${p.slug}`);
  for (const e of signalEntries) assert.match(e.date, iso, `signal entry ${e.id}`);
});
