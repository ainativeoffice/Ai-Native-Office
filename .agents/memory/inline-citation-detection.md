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

**How to apply / regenerate:** detection is now guarded by automated checks, not a
throwaway script. `src/lib/citations.test.ts` (run via `pnpm --filter
@workspace/ai-native-office test`, Node's built-in runner through `tsx`) pins the
detection rules, and `findBrokenCitations()` walks all content; `assertCitationsValid()`
(in `entry-server.tsx`, called from `prerender.mjs`) fails the build on broken refs.
Markers are anchors to the source URL so they live in the SSG output and degrade
without JS; the hover card is radix (client-only).

**Build-guard subtlety — out-of-range means different things for the two marker kinds.**
The range check (`num <= worksCited.length`) is the *disambiguator* for digit-before-period
markers, not just a validity filter. A word-glued out-of-range marker (`streams.79`) is a
genuinely broken citation → the guard fails the build. But a digit-before-period
out-of-range marker (`43.79 tokens per second`) is just a decimal → the guard must
**ignore** it. So `findBrokenCitations` only flags `kind:"word"` markers (plus pure-number
"Source Notes" table cells); flagging `kind:"digit"` out-of-range produces false positives.
**Why:** a broken `35.99`-style citation is indistinguishable from a decimal, and the
renderer already treats out-of-range digit markers as plain text, so the guard stays
consistent with what actually renders.

**The 2-digit ceiling is now a hard product constraint (worksCited.length === 99).**
Markers can only encode a 1–2 digit number, so source #100 is unrepresentable — you cannot
add a 100th cited source without redesigning the tokenizer. More urgently, the range check
that *disambiguates* digit-before-period decimals stops protecting you near the ceiling: a
decimal like `43.79 tokens` was safe only because 79 used to be out of range. At 99 sources
every 2-digit value is in-range, so any `X.47..X.99` decimal not followed by a listed unit
will render as a FALSE citation. **Why:** the range was doing double duty as a decimal filter,
and that filter collapses when the list fills up.
**How to apply:** when adding sources, grep live content for `[0-9]\.[0-9]{2}` and confirm
each is either an intended digit-before cite, a 3+digit number (safe — trailing digit
aborts the match), or followed by a `UNIT` token. The `UNIT` allowlist in `citations.ts`
(now includes `tokens`) is the ONLY remaining guard for digit-before-period decimals; the
`findBrokenCitations` build guard does NOT catch these (it ignores `kind:"digit"`). Add new
metric words to `UNIT` rather than rewording verbatim copy.

**No vitest in this repo** — the npm registry is frequently unreachable here, so a vitest
install times out. Use Node's `node:test` + `node:assert` run through the already-vendored
`tsx` (resolves the `@/*` tsconfig path alias); no network install needed.
