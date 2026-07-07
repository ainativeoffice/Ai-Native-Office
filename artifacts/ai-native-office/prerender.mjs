import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const {
  render,
  renderSection,
  getSectionPages,
  renderBlogIndex,
  renderBlogPost,
  getBlogPages,
  blogIndexMeta,
  renderSignals,
  signalsMeta,
  getRssXml,
  getSitemapXml,
  getLlmsFull,
  assertCitationsValid,
  assertEmphasisValid,
  assertLaunchPostDateValid,
  meta,
} = await import(path.join(__dirname, "dist/server/entry-server.js"));

// Fail the build if any inline citation points outside the Works Cited range.
assertCitationsValid();
// Fail the build if any prose contains a stray asterisk or unapproved emphasis
// span that the inline-markdown pass would silently transform or half-match.
assertEmphasisValid();
// Fail the build if the launch post's date drifts from the paper's publish date.
assertLaunchPostDateValid();

const indexPath = path.join(__dirname, "dist/public/index.html");
let template = readFileSync(indexPath, "utf-8");

if (!template.includes('<div id="root"></div>')) {
  throw new Error('Prerender failed: could not find <div id="root"></div> in built index.html');
}
if (!template.includes("</head>")) {
  throw new Error("Prerender failed: could not find </head> in built index.html");
}

const escapeAttr = (s) =>
  s.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

/** Replace a meta pattern in `html`, throwing if the pattern is missing. */
function inject(html, name, re, replacement) {
  if (!re.test(html)) {
    throw new Error(`Prerender failed: could not find ${name} to inject.`);
  }
  return html.replace(re, replacement);
}

/**
 * Rewrite the page-identity meta set (title, descriptions, canonical, og:url).
 * When `image`/`imageAlt` are provided, og:image/twitter:image/og:image:alt
 * are rewritten too; otherwise the site-wide card from index.html stays.
 */
function applyPageMeta(html, { title, description, url, image, imageAlt }) {
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  html = inject(html, "<title>", /<title>[\s\S]*?<\/title>/, `<title>${t}</title>`);
  html = inject(html, "og:title", /(<meta property="og:title" content=")[^"]*(")/, `$1${t}$2`);
  html = inject(html, "twitter:title", /(<meta name="twitter:title" content=")[^"]*(")/, `$1${t}$2`);
  html = inject(html, "description", /(<meta name="description" content=")[^"]*(")/, `$1${d}$2`);
  html = inject(html, "og:description", /(<meta property="og:description" content=")[^"]*(")/, `$1${d}$2`);
  html = inject(
    html,
    "twitter:description",
    /(<meta name="twitter:description" content=")[^"]*(")/,
    `$1${d}$2`,
  );
  html = inject(html, "canonical", /(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  html = inject(html, "og:url", /(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  if (image) {
    const img = escapeAttr(image);
    html = inject(html, "og:image", /(<meta property="og:image" content=")[^"]*(")/, `$1${img}$2`);
    html = inject(
      html,
      "twitter:image",
      /(<meta name="twitter:image" content=")[^"]*(")/,
      `$1${img}$2`,
    );
    if (imageAlt) {
      const alt = escapeAttr(imageAlt);
      html = inject(
        html,
        "og:image:alt",
        /(<meta property="og:image:alt" content=")[^"]*(")/,
        `$1${alt}$2`,
      );
    }
  }
  return html;
}

// Sync the Twitter handle (twitter:site/creator) from content.footer.social via
// entry-server `meta`. The hardcoded handle in index.html is only a dev fallback.
if (!meta.twitterHandle) {
  throw new Error("Prerender failed: meta.twitterHandle is empty (expected an X handle in content.footer.social).");
}
for (const name of ["twitter:site", "twitter:creator"]) {
  template = inject(
    template,
    name,
    new RegExp(`(<meta name="${name}" content=")[^"]*(")`),
    `$1${meta.twitterHandle}$2`,
  );
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

// `template` is now the shared base (handle + GA-ready) for every page.
const renderPage = (baseHtml, pageMeta, rendered) => {
  let html = applyPageMeta(baseHtml, pageMeta);
  html = html.replace('<div id="root"></div>', `<div id="root">${rendered.html}</div>`);
  html = html.replace("</head>", `    ${gaSnippet}${rendered.head}\n  </head>`);
  return html;
};

// 1) The full manifesto at `/` — unchanged single-page experience.
const canonicalDesc = template.match(/<meta name="description" content="([^"]*)"/)?.[1];
if (!canonicalDesc) {
  throw new Error("Prerender failed: could not read the meta description from index.html.");
}
writeFileSync(
  indexPath,
  renderPage(
    template,
    { title: meta.title, description: canonicalDesc, url: "https://ainativeoffice.org/" },
    render(),
  ),
);
console.log(`Prerender: wrote / → "${meta.title}".`);

// 2) Every section/appendix at `/sections/<id>/` with its own meta + JSON-LD.
const sectionPages = getSectionPages();
for (const page of sectionPages) {
  const outDir = path.join(__dirname, "dist/public/sections", page.id);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    path.join(outDir, "index.html"),
    renderPage(
      template,
      { title: page.metaTitle, description: page.description, url: page.url },
      renderSection(page.id),
    ),
  );
}
console.log(`Prerender: wrote ${sectionPages.length} section pages under /sections/.`);

// 3) The blog: index at /blog/ plus every post at /blog/<slug>/, each with its
//    own meta + BlogPosting JSON-LD.
const blogDir = path.join(__dirname, "dist/public/blog");
mkdirSync(blogDir, { recursive: true });
writeFileSync(
  path.join(blogDir, "index.html"),
  renderPage(
    template,
    { title: blogIndexMeta.metaTitle, description: blogIndexMeta.description, url: blogIndexMeta.url },
    renderBlogIndex(),
  ),
);
const blogPages = getBlogPages();
let customCards = 0;
for (const post of blogPages) {
  const outDir = path.join(blogDir, post.slug);
  mkdirSync(outDir, { recursive: true });
  // Per-post OG card (generated by `og:gen` into public/, copied into dist by
  // the client build). Fall back to the site-wide card if it was never generated.
  const hasCard = existsSync(path.join(__dirname, "dist/public", post.ogImagePath.slice(1)));
  if (hasCard) {
    customCards++;
  } else {
    console.warn(
      `Prerender: no OG card for blog post "${post.slug}" (run og:gen) — falling back to the site card.`,
    );
  }
  writeFileSync(
    path.join(outDir, "index.html"),
    renderPage(
      template,
      {
        title: post.metaTitle,
        description: post.description,
        url: post.url,
        image: hasCard ? post.ogImageUrl : undefined,
        imageAlt: hasCard ? `${post.title} — ${blogIndexMeta.metaTitle}` : undefined,
      },
      renderBlogPost(post.slug, hasCard ? post.ogImageUrl : undefined),
    ),
  );
}
console.log(
  `Prerender: wrote /blog/ index + ${blogPages.length} post page(s) (${customCards} with per-post OG cards).`,
);

// 3b) The Signal Log evidence ledger at /signals/ (validates the ledger too).
const signalsDir = path.join(__dirname, "dist/public/signals");
mkdirSync(signalsDir, { recursive: true });
writeFileSync(
  path.join(signalsDir, "index.html"),
  renderPage(
    template,
    { title: signalsMeta.metaTitle, description: signalsMeta.description, url: signalsMeta.url },
    renderSignals(),
  ),
);
console.log("Prerender: wrote /signals/ evidence ledger.");

// 4) RSS feed generated from the same post registry (dist output + dev copy).
const rss = getRssXml();
writeFileSync(path.join(__dirname, "dist/public/rss.xml"), rss);
writeFileSync(path.join(__dirname, "public/rss.xml"), rss);
console.log(`Prerender: rss.xml generated with ${blogPages.length} item(s).`);

// 5) Sitemap generated from the content tree (dist output + dev copy in public/).
const sitemap = getSitemapXml();
writeFileSync(path.join(__dirname, "dist/public/sitemap.xml"), sitemap);
writeFileSync(path.join(__dirname, "public/sitemap.xml"), sitemap);
console.log(`Prerender: sitemap.xml generated with ${sectionPages.length + blogPages.length + 3} URLs.`);

// 6) llms-full.txt from the same content tree.
const llmsFull = getLlmsFull();
writeFileSync(path.join(__dirname, "dist/public/llms-full.txt"), llmsFull);
writeFileSync(path.join(__dirname, "public/llms-full.txt"), llmsFull);

console.log("Prerender complete: static HTML, JSON-LD, sitemap.xml, and llms-full.txt written.");
