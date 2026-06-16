---
name: AI-Native Office inline citation detection
description: How citation source numbers are detected in verbatim manifesto prose and why the rule is shaped the way it is.
---

# Inline citation detection (ai-native-office)

The manifesto's `content.ts` is verbatim user copy and must never be reworded or
annotated. Inline source numbers are glued to words via a period (`streams.1`,
`(SCIF).26`). They are turned into interactive markers at **render time** by
`tokenizeCitations` in `src/lib/citations.ts` — the period stays visible, only the
trailing number is wrapped.

**The hard part is digit-before-period.** Some real citations follow a *digit*, not a
letter: `STC 35.25` and `38 to 40.25` are "rating + citation 25"; `batch size of 1.34`
is "1" + citation 34. These look identical to decimals/versions (`1.25 Mbps`,
`Llama 3.1`, `96.58%`, `0.090`, `H.264`).

**Rule that disambiguates them (verified against the whole document):**
- number must be in `1..worksCited.length`, and not immediately followed by another digit;
- accept if preceded by a letter OR word-ending punctuation (`)`, `"`, `'`, `]`, `}`);
- if preceded by a digit, accept **only** when it is a 2-digit number AND not followed by a unit.

**Why:** a 1-digit fraction after a digit is always a decimal/version here (5.1, 3.1,
10.1, 77.5); the only genuine digit-before citations are 2-digit (`.25`, `.34`). The
unit check rejects `1.25 Mbps`. Symbol unit `%` must be matched literally in the UNIT
regex — a trailing `\b` after `%` never matches, so don't rely on `\b` for it.

**How to apply / regenerate:** when content changes, re-run a one-off detector over all
prose strings and eyeball every match + every excluded `\d\.\d{1,2}` near-miss before
trusting it. Expectation at time of writing: 49 inline prose markers + 10 table
"Source Notes" cells = 59 anchors in the prerendered HTML. Markers are anchors to the
source URL so they live in the SSG output and degrade without JS; the hover card is
radix (client-only).
