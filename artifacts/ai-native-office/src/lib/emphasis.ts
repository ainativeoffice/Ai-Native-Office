/**
 * React-free inline-markdown emphasis splitter, extracted from the shared
 * section renderer (`WhitepaperBody.tsx`) so it can be unit-tested with
 * `node:test` without rendering React.
 *
 * Minimal inline emphasis for verbatim copy: `**…**` → strong, `*…*` → em.
 * No nesting, no line breaks. Applied only to plain-text segments (after
 * citation tokenization), so markers can never span a citation boundary.
 * Unmatched or stray asterisks pass through untouched as plain text.
 */

/** Inline emphasis spans: `**bold**` or `*italic*` (no nesting, no line breaks). */
const EMPHASIS = /(\*\*[^*\n]+\*\*|\*[^*\s][^*\n]*\*)/g;

export type EmphasisToken =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string };

/**
 * Split a plain-text segment into emphasis tokens. The returned `value` of
 * `strong`/`em` tokens is the inner text with the asterisk markers stripped;
 * `text` tokens are verbatim. Concatenating strong values wrapped in `**…**`,
 * em values in `*…*`, and text values as-is reproduces the input exactly.
 * Empty text parts produced by the split are dropped.
 */
export const splitEmphasis = (text: string): EmphasisToken[] => {
  const parts = text.split(EMPHASIS);
  if (parts.length === 1) return [{ type: "text", value: text }];
  const tokens: EmphasisToken[] = [];
  for (const part of parts) {
    if (part === "") continue;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      tokens.push({ type: "strong", value: part.slice(2, -2) });
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      tokens.push({ type: "em", value: part.slice(1, -1) });
    } else {
      tokens.push({ type: "text", value: part });
    }
  }
  return tokens;
};
