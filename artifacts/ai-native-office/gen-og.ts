import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { specVersion, specStatusShort } from "./src/lib/spec";

/**
 * Regenerates the OpenGraph card from the single source of truth.
 *
 * 1. Substitutes the spec version/status label in `og-source.svg` from
 *    `content.hero.spec` (via `src/lib/spec`), so the SVG never drifts.
 * 2. Rasterizes the SVG to `public/opengraph.jpg` (1200×630) with ImageMagick.
 *
 * Run after bumping the version in `content.ts`:
 *   pnpm --filter @workspace/ai-native-office run og:gen
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svgPath = path.join(__dirname, "og-source.svg");
const outPath = path.join(__dirname, "public/opengraph.jpg");

const label = `DRAFT SPEC v${specVersion()} &#183; ${specStatusShort().toUpperCase()}`;

let svg = readFileSync(svgPath, "utf-8");

// Match the bottom-right version label text element (the only <text> anchored at x="1120").
const labelRe = /(<text x="1120" y="548"[^>]*>)[\s\S]*?(<\/text>)/;
if (!labelRe.test(svg)) {
  throw new Error("gen-og: could not find the version label <text> element in og-source.svg");
}
svg = svg.replace(labelRe, `$1${label}$2`);
writeFileSync(svgPath, svg);

execFileSync(
  "magick",
  [
    "-density",
    "192",
    "-background",
    "#0A0A0A",
    svgPath,
    "-resize",
    "1200x630",
    "-quality",
    "90",
    outPath,
  ],
  { stdio: "inherit" },
);

console.log(`OG image regenerated → ${outPath} (label: "${label.replace("&#183;", "·")}")`);
