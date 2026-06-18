import { content, type ListItem, type Section, type Subsection, type ContactBlock } from "@/content";

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

/** A citation-shaped marker found in prose, with its slice boundaries. */
interface Marker {
  number: number;
  /**
   * How the marker was recognized:
   * - `"word"`: glued to a letter/closing-punctuation (`streams.1`, `(SCIF).26`) —
   *   unambiguously a citation regardless of its value.
   * - `"digit"`: glued after a digit (`STC 35.25`); only disambiguated from a
   *   decimal by whether the number resolves to a real source.
   */
  kind: "word" | "digit";
  /** index of the period that introduces the marker (kept as visible text) */
  dotIdx: number;
  /** index just past the trailing digits */
  end: number;
}

/**
 * Scan prose for citation-shaped markers: a 1–2 digit number glued to the end
 * of a word via a period (e.g. `streams.1`, `(SCIF).26`, `STC 35.25`). Decimals,
 * resolutions, codecs, versions and unit values (`1.25 Mbps`, `H.264`,
 * `Llama 3.1`, `96.58%`) are excluded. The source-number range is intentionally
 * NOT consulted here so callers can distinguish valid markers from ones that
 * point past the end of the Works Cited list (a broken citation).
 */
function scanMarkers(text: string): Marker[] {
  const markers: Marker[] = [];
  const re = /\.(\d{1,2})\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const num = parseInt(m[1], 10);
    const dotIdx = m.index;
    const before = text[dotIdx - 1] ?? "";
    const after = text.slice(re.lastIndex);
    if (/^\d/.test(after)) continue; // part of a longer number (e.g. 0.090, H.264)

    let kind: Marker["kind"] | null = null;
    if (WORD_END.test(before)) {
      kind = "word";
    } else if (/\d/.test(before)) {
      // Digit before the period: only a 2-digit number not followed by a unit
      // (catches `STC 35.25`, `batch size of 1.34`; rejects `1.25 Mbps`, `5.1`).
      if (m[1].length === 2 && !UNIT.test(after)) kind = "digit";
    }
    if (!kind) continue;

    markers.push({ number: num, kind, dotIdx, end: re.lastIndex });
  }
  return markers;
}

/**
 * Detect citation-shaped numbers in a string, reporting each marker's number,
 * recognition `kind`, and whether it falls within the Works Cited range.
 * Exposed for tests and the build-time guard. Note: a `"digit"` marker that is
 * out of range is a decimal (e.g. `43.79 tokens`), not a broken citation — the
 * build guard only treats out-of-range `"word"` markers as broken.
 */
export function detectCitationNumbers(
  text: string,
): { number: number; kind: "word" | "digit"; inRange: boolean }[] {
  return scanMarkers(text).map((marker) => ({
    number: marker.number,
    kind: marker.kind,
    inRange: marker.number >= 1 && marker.number <= SOURCE_COUNT,
  }));
}

/**
 * Tokenize prose into plain-text and citation tokens. Only markers whose number
 * is a valid source (1..SOURCE_COUNT) become citations; the period itself is
 * preserved as visible text.
 */
export function tokenizeCitations(text: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const marker of scanMarkers(text)) {
    if (marker.number < 1 || marker.number > SOURCE_COUNT) continue;
    if (marker.dotIdx + 1 > last) {
      tokens.push({ type: "text", value: text.slice(last, marker.dotIdx + 1) });
    }
    tokens.push({ type: "cite", number: marker.number });
    last = marker.end;
  }
  if (last < text.length) tokens.push({ type: "text", value: text.slice(last) });
  return tokens;
}

/** A citation that references a source number outside the Works Cited list. */
export interface BrokenCitation {
  number: number;
  location: string;
  context: string;
}

const SNIPPET = 60;

function snippet(text: string, around: number): string {
  const start = Math.max(0, around - SNIPPET);
  const end = Math.min(text.length, around + SNIPPET);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

/**
 * Walk every renderable string in the manifest and collect citation references
 * that point outside the Works Cited range (1..SOURCE_COUNT). Covers inline
 * prose/list markers (via {@link scanMarkers}) and the pure-number "Source
 * Notes" table cells (which Home renders directly as citations). Returns an
 * empty array when all citations resolve — the build guard fails if not.
 *
 * Pass `onlyText` to check a single arbitrary string instead of the manifest
 * (used by tests); omit it to validate all shipped content.
 */
export function findBrokenCitations(onlyText?: string): BrokenCitation[] {
  const broken: BrokenCitation[] = [];
  const inRange = (n: number) => n >= 1 && n <= SOURCE_COUNT;

  const checkProse = (text: string, location: string) => {
    for (const marker of scanMarkers(text)) {
      // Only `"word"` markers are unambiguous citations; an out-of-range
      // `"digit"` marker is a decimal (e.g. `43.79 tokens`), not a citation.
      if (marker.kind === "word" && !inRange(marker.number)) {
        broken.push({ number: marker.number, location, context: snippet(text, marker.dotIdx) });
      }
    }
  };

  const checkListItem = (item: ListItem, location: string) => {
    if (typeof item === "string") {
      checkProse(item, location);
    } else {
      if (item.label) checkProse(item.label, `${location}.label`);
      if (item.body) checkProse(item.body, `${location}.body`);
    }
  };

  const checkCell = (cell: string, location: string) => {
    // Source-note cells are a bare 1–2 digit source number rendered as a citation.
    if (/^\d{1,2}$/.test(cell)) {
      const num = parseInt(cell, 10);
      if (!inRange(num)) broken.push({ number: num, location, context: cell });
    } else {
      checkProse(cell, location);
    }
  };

  if (onlyText !== undefined) {
    checkProse(onlyText, "(input)");
    return broken;
  }

  checkProse(content.hero.title, "hero.title");

  const checkSection = (section: Section, collection: string, si: number) => {
    const at = (suffix: string) => `${collection}[${si}] "${section.title}" › ${suffix}`;
    (section.prose ?? []).forEach((p, i) => checkProse(p, at(`prose[${i}]`)));
    (section.list ?? []).forEach((it, i) => checkListItem(it, at(`list[${i}]`)));
    (section.postListProse ?? []).forEach((p, i) => checkProse(p, at(`postListProse[${i}]`)));
    (section.subsections ?? []).forEach((sub: Subsection, sj) => {
      const subAt = (suffix: string) => at(`subsections[${sj}] "${sub.title}" › ${suffix}`);
      (sub.prose ?? []).forEach((p, i) => checkProse(p, subAt(`prose[${i}]`)));
      (sub.list ?? []).forEach((it, i) => checkListItem(it, subAt(`list[${i}]`)));
      if (sub.closing) checkProse(sub.closing, subAt("closing"));
      (sub.postTableProse ?? []).forEach((p, i) => checkProse(p, subAt(`postTableProse[${i}]`)));
      (sub.postListProse ?? []).forEach((p, i) => checkProse(p, subAt(`postListProse[${i}]`)));
      (sub.blocks ?? []).forEach((block: ContactBlock, bi) => {
        const blockAt = (suffix: string) =>
          subAt(`blocks[${bi}]${block.label ? ` "${block.label}"` : ""} › ${suffix}`);
        if (block.label) checkProse(block.label, blockAt("label"));
        (block.prose ?? []).forEach((p, i) => checkProse(p, blockAt(`prose[${i}]`)));
        (block.list ?? []).forEach((it, i) => checkListItem(it, blockAt(`list[${i}]`)));
        (block.lines ?? []).forEach((l, i) => checkProse(l, blockAt(`lines[${i}]`)));
      });
      if (sub.tableData) {
        (sub.tableData.headers ?? []).forEach((h, i) =>
          checkProse(h, subAt(`tableData.headers[${i}]`)),
        );
        (sub.tableData.rows ?? []).forEach((row, ri) =>
          row.forEach((cell, ci) => checkCell(cell, subAt(`tableData.rows[${ri}][${ci}]`))),
        );
      }
    });
  };

  content.sections.forEach((section, si) => checkSection(section, "sections", si));
  content.appendices.forEach((appendix, si) => checkSection(appendix, "appendices", si));

  return broken;
}
