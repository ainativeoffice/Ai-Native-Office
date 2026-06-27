import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { render, getLlmsFull, assertCitationsValid, meta } = await import(
  path.join(__dirname, "dist/server/entry-server.js")
);

// Fail the build if any inline citation points outside the Works Cited range.
assertCitationsValid();

const indexPath = path.join(__dirname, "dist/public/index.html");
let template = readFileSync(indexPath, "utf-8");

const { html, head } = render();

if (!template.includes('<div id="root"></div>')) {
  throw new Error('Prerender failed: could not find <div id="root"></div> in built index.html');
}
if (!template.includes("</head>")) {
  throw new Error("Prerender failed: could not find </head> in built index.html");
}

// Sync the spec-version-aware title across <title>, og:title, twitter:title from
// the single source of truth (content.hero.spec via entry-server `meta`). The
// hardcoded strings in index.html are only a dev fallback; prod always rewrites.
const titleInjections = [
  { name: "<title>", re: /<title>[\s\S]*?<\/title>/, replacement: `<title>${meta.title}</title>` },
  {
    name: "og:title",
    re: /(<meta property="og:title" content=")[^"]*(")/,
    replacement: `$1${meta.title}$2`,
  },
  {
    name: "twitter:title",
    re: /(<meta name="twitter:title" content=")[^"]*(")/,
    replacement: `$1${meta.title}$2`,
  },
];
for (const { name, re, replacement } of titleInjections) {
  if (!re.test(template)) {
    throw new Error(`Prerender failed: could not find ${name} to inject the spec version label.`);
  }
  template = template.replace(re, replacement);
}
console.log(`Prerender: synced title/og:title/twitter:title → "${meta.title}".`);

// Sync the Twitter handle (twitter:site/creator) from content.footer.social via
// entry-server `meta`. The hardcoded handle in index.html is only a dev fallback.
if (!meta.twitterHandle) {
  throw new Error("Prerender failed: meta.twitterHandle is empty (expected an X handle in content.footer.social).");
}
const handleInjections = [
  { name: "twitter:site", re: /(<meta name="twitter:site" content=")[^"]*(")/ },
  { name: "twitter:creator", re: /(<meta name="twitter:creator" content=")[^"]*(")/ },
];
for (const { name, re } of handleInjections) {
  if (!re.test(template)) {
    throw new Error(`Prerender failed: could not find ${name} to inject the Twitter handle.`);
  }
  template = template.replace(re, `$1${meta.twitterHandle}$2`);
}
console.log(`Prerender: synced twitter:site/twitter:creator → "${meta.twitterHandle}".`);

const gaId = (process.env.GA_MEASUREMENT_ID || "").trim();
let gaSnippet = "";
if (gaId) {
  if (!/^G-[A-Z0-9]+$/i.test(gaId)) {
    throw new Error(
      `Prerender failed: GA_MEASUREMENT_ID "${gaId}" is not a valid GA4 Measurement ID (expected format G-XXXXXXXXXX).`,
    );
  }
  gaSnippet = `<script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    </script>
    `;
  console.log(`Prerender: injecting Google Analytics (${gaId}).`);
} else {
  console.log("Prerender: GA_MEASUREMENT_ID not set — skipping analytics injection.");
}

template = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
template = template.replace("</head>", `    ${gaSnippet}${head}\n  </head>`);

writeFileSync(indexPath, template);

const llmsFull = getLlmsFull();
writeFileSync(path.join(__dirname, "dist/public/llms-full.txt"), llmsFull);
writeFileSync(path.join(__dirname, "public/llms-full.txt"), llmsFull);

console.log("Prerender complete: static HTML, JSON-LD, and llms-full.txt written.");
