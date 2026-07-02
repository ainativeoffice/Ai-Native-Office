import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { specVersion, specStatusShort } from "./src/lib/spec";
import { blogPages } from "./src/lib/blogPages";

/**
 * Regenerates the OpenGraph cards from the single source of truth.
 *
 * 1. Substitutes the spec version/status label in `og-source.svg` from
 *    `content.hero.spec` (via `src/lib/spec`), so the SVG never drifts.
 * 2. Rasterizes the SVG to `public/opengraph.jpg` (1200×630) with ImageMagick.
 * 3. Builds a per-post card for every RFC Log entry (post title + date on the
 *    same brutalist template) into `public/og/blog/<slug>.jpg`. Unchanged
 *    posts are skipped via a content-hash manifest (`.manifest.json`), since
 *    each ImageMagick rasterization is slow (~75s) in this environment.
 *
 * Run after bumping the version in `content.ts` or adding a blog post:
 *   pnpm --filter @workspace/ai-native-office run og:gen
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(__dirname, "og-source.svg");
const outPath = path.join(__dirname, "public/opengraph.jpg");
const blogOgDir = path.join(__dirname, "public/og/blog");
const manifestPath = path.join(blogOgDir, ".manifest.json");

const label = `DRAFT SPEC v${specVersion()} &#183; ${specStatusShort().toUpperCase()}`;

function rasterize(sourceSvgPath: string, targetJpgPath: string) {
  execFileSync(
    "magick",
    [
      "-density",
      "192",
      "-background",
      "#0A0A0A",
      sourceSvgPath,
      "-resize",
      "1200x630",
      "-quality",
      "90",
      targetJpgPath,
    ],
    { stdio: "inherit" },
  );
}

// ---------------------------------------------------------------------------
// 1) Site-wide card: sync the version label in og-source.svg, then rasterize.
// ---------------------------------------------------------------------------

let svg = readFileSync(svgPath, "utf-8");

// Match the bottom-right version label text element (the only <text> anchored at x="1120").
const labelRe = /(<text x="1120" y="548"[^>]*>)[\s\S]*?(<\/text>)/;
if (!labelRe.test(svg)) {
  throw new Error("gen-og: could not find the version label <text> element in og-source.svg");
}
svg = svg.replace(labelRe, `$1${label}$2`);
writeFileSync(svgPath, svg);

rasterize(svgPath, outPath);
console.log(`OG image regenerated → ${outPath} (label: "${label.replace("&#183;", "·")}")`);

// ---------------------------------------------------------------------------
// 2) Per-post blog cards on the same template: kicker = RFC LOG · <date>,
//    headline = post title (wrapped), same frame/rules/footer as the site card.
// ---------------------------------------------------------------------------

const escapeXml = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/** Greedy word-wrap using an approximate serif-bold character width. */
function wrapTitle(title: string, fontSize: number): string[] {
  // 0.56em average glyph width for Georgia bold — conservative so long lines
  // stay inside the 1040px frame (80..1120).
  const maxChars = Math.floor(1040 / (0.56 * fontSize));
  const lines: string[] = [];
  let line = "";
  for (const word of title.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxChars || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Pick the largest font size whose wrapped line count fits its budget. */
function layoutTitle(title: string): { fontSize: number; lines: string[] } {
  const candidates = [
    { fontSize: 84, maxLines: 2 },
    { fontSize: 72, maxLines: 3 },
    { fontSize: 60, maxLines: 3 },
    { fontSize: 50, maxLines: 4 },
  ];
  for (const c of candidates) {
    const lines = wrapTitle(title, c.fontSize);
    if (lines.length <= c.maxLines) return { fontSize: c.fontSize, lines };
  }
  const last = candidates[candidates.length - 1];
  const lines = wrapTitle(title, last.fontSize).slice(0, last.maxLines);
  lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,:;]?$/, "")}…`;
  return { fontSize: last.fontSize, lines };
}

function buildBlogCardSvg(post: { title: string; date: string }): string {
  const { fontSize, lines } = layoutTitle(post.title);
  const lineHeight = Math.round(1.12 * fontSize);
  // Center the headline block in the band between the two rules (y=150..500).
  const firstBaseline = Math.round(325 - ((lines.length - 1) * lineHeight) / 2 + 0.35 * fontSize);
  const markerY = Math.round(firstBaseline - 0.55 * fontSize);
  const markerSize = Math.max(10, Math.round(0.155 * fontSize));
  const kicker = `RFC LOG &#183; ${escapeXml(post.date)}`;

  const titleLines = lines
    .map(
      (line, i) =>
        `  <text x="80" y="${firstBaseline + i * lineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="700" fill="#F2F2F2">${escapeXml(line)}</text>`,
    )
    .join("\n");

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0A0A0A"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#333333" stroke-width="1"/>

  <text x="80" y="118" font-family="monospace" font-size="21" letter-spacing="5" fill="#8A8A8A">${kicker}</text>
  <line x1="80" y1="150" x2="1120" y2="150" stroke="#333333" stroke-width="1"/>

${titleLines}

  <line x1="80" y1="500" x2="1120" y2="500" stroke="#333333" stroke-width="1"/>
  <text x="80" y="548" font-family="monospace" font-size="22" letter-spacing="3" fill="#9A9A9A">AINATIVEOFFICE.ORG</text>
  <text x="1120" y="548" text-anchor="end" font-family="monospace" font-size="22" letter-spacing="3" fill="#9A9A9A">${label}</text>

  <rect x="80" y="${markerY}" width="${markerSize}" height="${markerSize}" fill="#F2F2F2"/>
</svg>
`;
}

mkdirSync(blogOgDir, { recursive: true });

let manifest: Record<string, string> = {};
if (existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  } catch {
    manifest = {};
  }
}

const validSlugs = new Set(blogPages.map((p) => p.slug));

// Drop stale cards + manifest entries for posts that no longer exist.
for (const file of readdirSync(blogOgDir)) {
  if (!file.endsWith(".jpg")) continue;
  const slug = file.slice(0, -".jpg".length);
  if (!validSlugs.has(slug)) {
    rmSync(path.join(blogOgDir, file));
    delete manifest[slug];
    console.log(`Blog OG: removed stale card for deleted post "${slug}".`);
  }
}
for (const slug of Object.keys(manifest)) {
  if (!validSlugs.has(slug)) delete manifest[slug];
}

let generated = 0;
let skipped = 0;
for (const page of blogPages) {
  const cardSvg = buildBlogCardSvg({ title: page.title, date: page.date });
  const hash = createHash("sha256").update(cardSvg).digest("hex");
  const jpgPath = path.join(blogOgDir, `${page.slug}.jpg`);
  if (manifest[page.slug] === hash && existsSync(jpgPath)) {
    skipped++;
    continue;
  }
  const tmpSvg = path.join(tmpdir(), `og-blog-${page.slug}.svg`);
  writeFileSync(tmpSvg, cardSvg);
  rasterize(tmpSvg, jpgPath);
  rmSync(tmpSvg);
  manifest[page.slug] = hash;
  generated++;
  console.log(`Blog OG: generated ${path.relative(__dirname, jpgPath)} ("${page.title}")`);
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Blog OG cards: ${generated} generated, ${skipped} up to date.`);
