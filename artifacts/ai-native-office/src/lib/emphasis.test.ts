import { test } from "node:test";
import assert from "node:assert/strict";
import { splitEmphasis, type EmphasisToken } from "./emphasis";
import { tokenizeCitations } from "./citations";

/** Convenience: reassemble tokens back into markdown-ish source text. */
const reassemble = (tokens: EmphasisToken[]): string =>
  tokens
    .map((t) =>
      t.type === "strong" ? `**${t.value}**` : t.type === "em" ? `*${t.value}*` : t.value,
    )
    .join("");

// --- bold --------------------------------------------------------------------

test("**bold** becomes a strong token with markers stripped", () => {
  assert.deepEqual(splitEmphasis("a **bold** word"), [
    { type: "text", value: "a " },
    { type: "strong", value: "bold" },
    { type: "text", value: " word" },
  ]);
});

test("bold at the start and end of a string", () => {
  assert.deepEqual(splitEmphasis("**Start** middle **end**"), [
    { type: "strong", value: "Start" },
    { type: "text", value: " middle " },
    { type: "strong", value: "end" },
  ]);
});

test("bold spanning multiple words", () => {
  assert.deepEqual(splitEmphasis("the **cloud-native illusion** ends"), [
    { type: "text", value: "the " },
    { type: "strong", value: "cloud-native illusion" },
    { type: "text", value: " ends" },
  ]);
});

// --- italic ------------------------------------------------------------------

test("*italic* becomes an em token with markers stripped", () => {
  assert.deepEqual(splitEmphasis("an *italic* word"), [
    { type: "text", value: "an " },
    { type: "em", value: "italic" },
    { type: "text", value: " word" },
  ]);
});

test("italic phrase mid-sentence", () => {
  assert.deepEqual(splitEmphasis("this is *not* a drill"), [
    { type: "text", value: "this is " },
    { type: "em", value: "not" },
    { type: "text", value: " a drill" },
  ]);
});

test("mixed bold and italic in one string", () => {
  assert.deepEqual(splitEmphasis("**bold** and *italic* together"), [
    { type: "strong", value: "bold" },
    { type: "text", value: " and " },
    { type: "em", value: "italic" },
    { type: "text", value: " together" },
  ]);
});

// --- pass-through: stray / unmatched asterisks --------------------------------

test("unmatched single asterisk passes through untouched", () => {
  assert.deepEqual(splitEmphasis("a footnote* marker"), [
    { type: "text", value: "a footnote* marker" },
  ]);
});

test("multiplication with spaced asterisk passes through untouched", () => {
  assert.deepEqual(splitEmphasis("cost = a * b per month"), [
    { type: "text", value: "cost = a * b per month" },
  ]);
});

test("asterisk followed by whitespace never opens emphasis", () => {
  assert.deepEqual(splitEmphasis("weird * spacing * here"), [
    { type: "text", value: "weird * spacing * here" },
  ]);
});

test("empty double-star pair passes through untouched", () => {
  assert.deepEqual(splitEmphasis("empty **** stars"), [
    { type: "text", value: "empty **** stars" },
  ]);
});

test("emphasis never spans a line break", () => {
  assert.deepEqual(splitEmphasis("*broken\nacross* lines"), [
    { type: "text", value: "*broken\nacross* lines" },
  ]);
});

// --- pass-through: no asterisks at all ----------------------------------------

test("a no-asterisk paragraph is returned unchanged as one text token", () => {
  const text =
    "The building is the computer. Latency is a property of distance, and distance is a property of real estate.";
  assert.deepEqual(splitEmphasis(text), [{ type: "text", value: text }]);
});

test("empty string yields a single empty text token", () => {
  assert.deepEqual(splitEmphasis(""), [{ type: "text", value: "" }]);
});

// --- lossless reassembly -------------------------------------------------------

test("reassembling tokens reproduces the input exactly", () => {
  const samples = [
    "plain text with no markers",
    "a **bold** and *italic* mix",
    "stray * asterisk and a*b glue",
    "**leading** and trailing **markers**",
    "unmatched *open only",
  ];
  for (const s of samples) {
    assert.equal(reassemble(splitEmphasis(s)), s);
  }
});

// --- interaction with citation tokenization ------------------------------------

test("emphasis adjacent to a citation marker does not break tokenization", () => {
  // Citation tokenization runs first; emphasis is applied to the plain-text
  // segments it emits. A **bold** phrase right before a glued marker must
  // leave the citation intact and the emphasis parseable.
  const tokens = tokenizeCitations("the **GraphRAG flywheel** compounds.42 fully");
  assert.deepEqual(tokens, [
    { type: "text", value: "the **GraphRAG flywheel** compounds." },
    { type: "cite", number: 42 },
    { type: "text", value: " fully" },
  ]);
  const first = tokens[0];
  assert.equal(first.type, "text");
  assert.deepEqual(splitEmphasis(first.value), [
    { type: "text", value: "the " },
    { type: "strong", value: "GraphRAG flywheel" },
    { type: "text", value: " compounds." },
  ]);
});

test("italic phrase before a word-glued citation keeps both intact", () => {
  const tokens = tokenizeCitations("this is *sovereign compute* in practice.7 today");
  assert.deepEqual(tokens, [
    { type: "text", value: "this is *sovereign compute* in practice." },
    { type: "cite", number: 7 },
    { type: "text", value: " today" },
  ]);
  const first = tokens[0];
  assert.equal(first.type, "text");
  assert.deepEqual(splitEmphasis(first.value), [
    { type: "text", value: "this is " },
    { type: "em", value: "sovereign compute" },
    { type: "text", value: " in practice." },
  ]);
});

test("a marker glued directly to a closing asterisk is NOT a citation", () => {
  // The citation scanner requires a word-end character before the period, so
  // `*.7` never tokenizes — copy must glue citations to words, not emphasis
  // markers. Documenting this keeps the interaction contract explicit.
  assert.deepEqual(tokenizeCitations("this is *sovereign compute*.7 in practice"), [
    { type: "text", value: "this is *sovereign compute*.7 in practice" },
  ]);
});
