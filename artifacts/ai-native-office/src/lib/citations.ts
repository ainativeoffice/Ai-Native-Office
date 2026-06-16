import { content } from "@/content";

export interface SourceRef {
  number: number;
  label: string;
  url: string | null;
  domain: string | null;
}

export const SOURCE_COUNT = content.worksCited.length;

function domainOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Split a Works Cited entry into its label (citation text) and trailing URL. */
export function parseCitation(raw: string): { label: string; url: string | null } {
  const match = raw.match(/(https?:\/\/\S+)/);
  const url = match ? match[1] : null;
  const label = url ? raw.slice(0, match!.index).replace(/,\s*$/, "") : raw;
  return { label, url };
}

/** Resolve a 1-based source number to its full reference. */
export function getSource(number: number): SourceRef | null {
  const raw = content.worksCited[number - 1];
  if (!raw) return null;
  const { label, url } = parseCitation(raw);
  return { number, label, url, domain: url ? domainOf(url) : null };
}

export type Token =
  | { type: "text"; value: string }
  | { type: "cite"; number: number };

// Units/measurements that follow a decimal value (never a citation), e.g. "1.25 Mbps", "96.58%".
// Word units need a trailing word boundary; the symbol unit "%" is matched literally
// (a `\b` after "%" never matches, so it must be handled separately).
const UNIT = /^\s?(?:(?:Mbps|MBps|Gbps|Kbps|GB|TB|MB|KB|GHz|MHz|kHz|Hz|dB|ms|Watts?|kW|MW|kV|V|Amp|TFLOPS)\b|%)/i;
// A citation may be glued to a word-ending character: a letter or closing punctuation.
const WORD_END = /[A-Za-z)\]}"'\u201d\u2019]/;

/**
 * Tokenize prose into plain-text and citation tokens. A citation marker is a
 * 1–2 digit source number (1..SOURCE_COUNT) glued to the end of a word via a
 * period (e.g. `streams.1`, `(SCIF).26`, `STC 35.25`). Decimals, resolutions,
 * codecs, versions and unit values (`1.25 Mbps`, `H.264`, `Llama 3.1`, `96.58%`)
 * are excluded. The period itself is preserved as visible text.
 */
export function tokenizeCitations(text: string): Token[] {
  const tokens: Token[] = [];
  const re = /\.(\d{1,2})\b/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const num = parseInt(m[1], 10);
    if (num < 1 || num > SOURCE_COUNT) continue;
    const dotIdx = m.index;
    const before = text[dotIdx - 1] ?? "";
    const after = text.slice(re.lastIndex);
    if (/^\d/.test(after)) continue; // part of a longer number (e.g. 0.090, H.264)

    let isCitation = false;
    if (WORD_END.test(before)) {
      isCitation = true;
    } else if (/\d/.test(before)) {
      // Digit before the period: only a 2-digit number not followed by a unit
      // (catches `STC 35.25`, `batch size of 1.34`; rejects `1.25 Mbps`, `5.1`).
      if (m[1].length === 2 && !UNIT.test(after)) isCitation = true;
    }
    if (!isCitation) continue;

    if (dotIdx + 1 > last) tokens.push({ type: "text", value: text.slice(last, dotIdx + 1) });
    tokens.push({ type: "cite", number: num });
    last = re.lastIndex;
  }
  if (last < text.length) tokens.push({ type: "text", value: text.slice(last) });
  return tokens;
}
