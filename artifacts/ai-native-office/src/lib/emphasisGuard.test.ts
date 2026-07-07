import { test } from "node:test";
import assert from "node:assert/strict";
import {
  findSuspiciousEmphasis,
  scanSectionEmphasis,
  assertEmphasisValid,
} from "./emphasisGuard";
import type { Section } from "@/content";

// --- shipped content passes ----------------------------------------------------

test("the shipped content tree has no suspicious emphasis", () => {
  assert.deepEqual(findSuspiciousEmphasis(), []);
});

test("assertEmphasisValid does not throw for shipped content", () => {
  assert.doesNotThrow(() => assertEmphasisValid());
});

// --- clean text passes -----------------------------------------------------------

test("asterisk-free prose is never flagged", () => {
  assert.deepEqual(
    findSuspiciousEmphasis("The building is the computer. Latency is a property of distance."),
    [],
  );
});

test("allowlisted emphasis passes the round-trip check", () => {
  assert.deepEqual(
    findSuspiciousEmphasis("This framework enforces the **Tripartite Ownership Model** here."),
    [],
  );
  assert.deepEqual(
    findSuspiciousEmphasis("what a vendor will do with data *after* it has left"),
    [],
  );
});

// --- deliberately-broken fixtures fail -------------------------------------------

test("an unbalanced asterisk is flagged as stray", () => {
  const found = findSuspiciousEmphasis("a footnote* marker with no close");
  assert.equal(found.length, 1);
  assert.equal(found[0]!.reason, "stray");
});

test("spaced multiplication is flagged as stray", () => {
  const found = findSuspiciousEmphasis("cost = a * b per month");
  assert.equal(found.length, 1);
  assert.equal(found[0]!.reason, "stray");
});

test("glued multiplication that half-matches as italics is flagged as unapproved", () => {
  // `3*2 and 5*4` — splitEmphasis silently turns `*2 and 5*` into an em span.
  const found = findSuspiciousEmphasis("a batch of 3*2 and 5*4 racks");
  assert.equal(found.length, 1);
  assert.equal(found[0]!.reason, "unapproved");
  assert.equal(found[0]!.offending, "*2 and 5*");
});

test("emphasis not in the allowlist is flagged as unapproved", () => {
  const found = findSuspiciousEmphasis("some **new bold phrase** nobody approved");
  assert.deepEqual(
    found.map((f) => ({ reason: f.reason, offending: f.offending })),
    [{ reason: "unapproved", offending: "**new bold phrase**" }],
  );
});

test("an approved span next to an unapproved one flags only the unapproved", () => {
  const found = findSuspiciousEmphasis("**Date:** 2026-07-07 · **Venue:** somewhere");
  assert.deepEqual(
    found.map((f) => ({ reason: f.reason, offending: f.offending })),
    [{ reason: "unapproved", offending: "**Venue:**" }],
  );
});

test("empty double-star pair is flagged as stray", () => {
  const found = findSuspiciousEmphasis("empty **** stars");
  assert.equal(found.length, 1);
  assert.equal(found[0]!.reason, "stray");
});

test("one string can produce multiple findings", () => {
  const found = findSuspiciousEmphasis("*unapproved em* plus a stray * asterisk");
  assert.deepEqual(
    found.map((f) => f.reason),
    ["unapproved", "stray"],
  );
});

// --- section-tree walking (principles, blocks, tables) ----------------------------

const sectionFixture = (subsectionOverrides: object): Section => ({
  id: "fixture",
  title: "Fixture",
  prose: [],
  subsections: [{ title: "Sub", prose: [], ...subsectionOverrides }],
});

test("principle labels and bodies ARE scanned (approved emphasis passes)", () => {
  const clean = sectionFixture({
    principles: [
      { label: "Plain label", body: "what a vendor does *after* the data leaves" },
    ],
  });
  assert.deepEqual(scanSectionEmphasis(clean, "fixture"), []);
});

test("a stray asterisk in a principle body fails", () => {
  const bad = sectionFixture({
    principles: [{ label: "Density", body: "footnote* marker left behind" }],
  });
  const found = scanSectionEmphasis(bad, "fixture");
  assert.equal(found.length, 1);
  assert.equal(found[0]!.reason, "stray");
  assert.match(found[0]!.location, /principles\[0\]\.body/);
});

test("unapproved emphasis in a principle label fails", () => {
  const bad = sectionFixture({
    principles: [{ label: "the **Sovereign Perimeter**", body: "clean body" }],
  });
  const found = scanSectionEmphasis(bad, "fixture");
  assert.deepEqual(
    found.map((f) => ({ reason: f.reason, offending: f.offending })),
    [{ reason: "unapproved", offending: "**Sovereign Perimeter**" }],
  );
  assert.match(found[0]!.location, /principles\[0\]\.label/);
});

test("stray asterisks in contact-block lines and table cells are caught", () => {
  const bad = sectionFixture({
    blocks: [{ label: "Contact", lines: ["email * protected"] }],
    tableData: { headers: ["Metric"], rows: [["3*2 racks"]] },
  });
  const found = scanSectionEmphasis(bad, "fixture");
  assert.deepEqual(
    found.map((f) => f.reason).sort(),
    ["stray", "stray"],
  );
});
