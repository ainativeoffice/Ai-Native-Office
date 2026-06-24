import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SOURCE_COUNT,
  detectCitationNumbers,
  tokenizeCitations,
  tokenizeCitationGroups,
  findBrokenCitations,
} from "./citations";

/** Convenience: only the citation numbers tokenizeCitations emits, in order. */
const cites = (text: string): number[] =>
  tokenizeCitations(text)
    .filter((t): t is { type: "cite"; number: number } => t.type === "cite")
    .map((t) => t.number);

/** Convenience: the bracket groups tokenizeCitationGroups emits, in order. */
const groups = (text: string): number[][] =>
  tokenizeCitationGroups(text)
    .filter((t): t is { type: "cites"; numbers: number[] } => t.type === "cites")
    .map((t) => t.numbers);

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

// --- bracketed grouping (tokenizeCitationGroups) -----------------------------

test("groups consecutive glued markers into one bracket group", () => {
  assert.deepEqual(groups("568 fourth-generation Tensor Cores.31.34"), [[31, 34]]);
});

test("groups three consecutive glued markers", () => {
  assert.deepEqual(groups("RAG workloads.34.38.41"), [[34, 38, 41]]);
});

test("a lone glued marker is a single-number group", () => {
  assert.deepEqual(groups("ambient data feed.61"), [[61]]);
});

test("non-adjacent markers stay in separate groups", () => {
  assert.deepEqual(groups("evidence.3 supports the thesis.4 fully"), [[3], [4]]);
});

test("keeps the leading period and drops intervening periods when grouping", () => {
  assert.deepEqual(tokenizeCitationGroups("Cores.31.34 now"), [
    { type: "text", value: "Cores." },
    { type: "cites", numbers: [31, 34] },
    { type: "text", value: " now" },
  ]);
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
  // A citation marker can only encode a 1–2 digit number. At the 99-source
  // ceiling there is no representable out-of-range marker (tooBig is 3 digits),
  // so the detector finds nothing; below the ceiling it flags the marker.
  if (tooBig <= 99) {
    assert.deepEqual(detectCitationNumbers(`see footnote.${tooBig}`), [
      { number: tooBig, kind: "word", inRange: false },
    ]);
  } else {
    assert.deepEqual(detectCitationNumbers(`see footnote.${tooBig}`), []);
  }
});

test("marks an in-range glued marker as valid", () => {
  assert.deepEqual(detectCitationNumbers("streams.1"), [
    { number: 1, kind: "word", inRange: true },
  ]);
});

test("range-agnostic detection still excludes decimals and units", () => {
  assert.deepEqual(detected("1.25 Mbps and Llama 3.1"), []);
});

test("a digit-before-period decimal followed by a unit is not a citation", () => {
  // "43.79 tokens per second" is a throughput decimal: the trailing unit
  // ("tokens") excludes it regardless of the Works Cited range.
  assert.deepEqual(detectCitationNumbers("43.79 tokens per second"), []);
});

test("findBrokenCitations ignores out-of-range digit-before-period decimals", () => {
  assert.deepEqual(findBrokenCitations("The L40S hits 43.79 tokens per second."), []);
});

test("findBrokenCitations flags an out-of-range word-glued citation", () => {
  const tooBig = SOURCE_COUNT + 1;
  const result = findBrokenCitations(`Backed by hard evidence.${tooBig} indeed.`);
  // At the 99-source ceiling a 3-digit "citation" is unrepresentable, so the
  // guard cannot (and need not) flag it; below the ceiling it is flagged.
  if (tooBig <= 99) {
    assert.equal(result.length, 1);
    assert.equal(result[0]!.number, tooBig);
  } else {
    assert.deepEqual(result, []);
  }
});

// --- build guard over real content ------------------------------------------

test("findBrokenCitations reports no broken citations for the shipped manifest", () => {
  assert.deepEqual(findBrokenCitations(), []);
});
