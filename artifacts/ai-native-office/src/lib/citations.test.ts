import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SOURCE_COUNT,
  detectCitationNumbers,
  tokenizeCitations,
  findBrokenCitations,
} from "./citations";

/** Convenience: only the citation numbers tokenizeCitations emits, in order. */
const cites = (text: string): number[] =>
  tokenizeCitations(text)
    .filter((t): t is { type: "cite"; number: number } => t.type === "cite")
    .map((t) => t.number);

/** Convenience: detected citation-shaped numbers (range-agnostic). */
const detected = (text: string): number[] =>
  detectCitationNumbers(text).map((d) => d.number);

// --- genuine glued markers ---------------------------------------------------

test("detects a number glued to a word via a period", () => {
  assert.deepEqual(cites("multimodal streams.1"), [1]);
});

test("detects a number glued to closing punctuation", () => {
  assert.deepEqual(cites("a sensitive facility (SCIF).26"), [26]);
});

test("detects two-digit glued markers", () => {
  assert.deepEqual(cites("the GraphRAG flywheel.42"), [42]);
});

test("preserves the period as visible text and drops only the number", () => {
  assert.deepEqual(tokenizeCitations("streams.1 next"), [
    { type: "text", value: "streams." },
    { type: "cite", number: 1 },
    { type: "text", value: " next" },
  ]);
});

test("detects multiple markers in one string", () => {
  assert.deepEqual(cites("evidence.3 supports the thesis.4 fully"), [3, 4]);
});

// --- digit-before-period citations ------------------------------------------

test("treats a 2-digit number after a rating decimal as a citation", () => {
  assert.deepEqual(cites("an STC 35.25 wall"), [25]);
});

test("detects a citation after a range value", () => {
  assert.deepEqual(cites("from 38 to 40.25 dBA"), [25]);
});

test("detects a citation glued after a decimal value", () => {
  assert.deepEqual(cites("a batch size of 1.34 nodes"), [34]);
});

// --- excluded near-misses ----------------------------------------------------

for (const [text, label] of [
  ["1.25 Mbps", "unit value"],
  ["10.25%", "percentage"],
  ["0.090", "leading-zero decimal"],
  ["Llama 3.1", "single-digit version"],
  ["H.264", "codec name"],
  ["$0.181 per GB", "currency decimal"],
  ["96.58% uptime", "decimal percentage"],
  ["a value of 5.1 dB", "single-digit decimal with unit"],
] as const) {
  test(`does not flag "${text}" (${label})`, () => {
    assert.deepEqual(cites(text), []);
  });
}

// --- range-agnostic detection for the guard ---------------------------------

test("flags a word-glued marker whose number exceeds SOURCE_COUNT", () => {
  const tooBig = SOURCE_COUNT + 1;
  assert.deepEqual(detectCitationNumbers(`see footnote.${tooBig}`), [
    { number: tooBig, kind: "word", inRange: false },
  ]);
});

test("marks an in-range glued marker as valid", () => {
  assert.deepEqual(detectCitationNumbers("streams.1"), [
    { number: 1, kind: "word", inRange: true },
  ]);
});

test("range-agnostic detection still excludes decimals and units", () => {
  assert.deepEqual(detected("1.25 Mbps and Llama 3.1"), []);
});

test("an out-of-range digit-before-period marker is a decimal, not a citation", () => {
  // e.g. "43.79 tokens per second" — 79 > SOURCE_COUNT, so it is a decimal.
  assert.deepEqual(detectCitationNumbers("43.79 tokens per second"), [
    { number: 79, kind: "digit", inRange: false },
  ]);
});

test("findBrokenCitations ignores out-of-range digit-before-period decimals", () => {
  assert.deepEqual(findBrokenCitations("The L40S hits 43.79 tokens per second."), []);
});

test("findBrokenCitations flags an out-of-range word-glued citation", () => {
  const tooBig = SOURCE_COUNT + 1;
  const result = findBrokenCitations(`Backed by hard evidence.${tooBig} indeed.`);
  assert.equal(result.length, 1);
  assert.equal(result[0]!.number, tooBig);
});

// --- build guard over real content ------------------------------------------

test("findBrokenCitations reports no broken citations for the shipped manifest", () => {
  assert.deepEqual(findBrokenCitations(), []);
});
