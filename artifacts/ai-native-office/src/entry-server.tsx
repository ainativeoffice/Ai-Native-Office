import { renderToString } from "react-dom/server";
import App from "./App";
import {
  content,
  PAPER_DATE_PUBLISHED,
  LAUNCH_POST_SLUG,
  SPEC_REVISION_DATE,
  latestIsoDate,
  type ListItem,
  type Table,
  type Section,
} from "./content";
import { findBrokenCitations, parseCitation } from "./lib/citations";
import { assertEmphasisValid } from "./lib/emphasisGuard";
import { metaTitle, SITE_NAME, SITE_URL } from "./lib/spec";
import { sectionPages, getSectionPage } from "./lib/sectionPages";
import {
  blogPages,
  getBlogPage,
  BLOG_PATH,
  BLOG_URL,
  BLOG_TITLE,
  BLOG_META_TITLE,
  BLOG_DESCRIPTION,
} from "./lib/blogPages";
import {
  signalEntries,
  signalDesignation,
  signalEntryUrl,
  assertSignalsValid,
  SIGNALS_PATH,
  SIGNALS_URL,
  SIGNALS_TITLE,
  SIGNALS_META_TITLE,
  SIGNALS_DESCRIPTION,
} from "./lib/signalsPage";

/**
 * Document dates for JSON-LD and the generated sitemap. The publish date is
 * shared with the RFC Log launch post via `PAPER_DATE_PUBLISHED` in the
 * whitepaper lib — never hardcode it here (the two copies drifted once).
 * The modified date is DERIVED, never hand-set here: it is the max of the
 * spec-copy revision date (`SPEC_REVISION_DATE` in `lib/whitepaper/src/dates.ts`)
 * and every RFC Log post / Signal Log entry date, so shipping new content can
 * never leave `dateModified` / sitemap `lastmod` stale.
 */
const DATE_PUBLISHED = PAPER_DATE_PUBLISHED;
const DATE_MODIFIED = latestIsoDate([
  SPEC_REVISION_DATE,
  ...blogPages.map((p) => p.date),
  ...signalEntries.map((e) => e.date),
]);

/**
 * Build-time meta values consumed by `prerender.mjs` to inject the
 * spec-version-aware <title>/og:title/twitter:title and the Twitter handle
 * (twitter:site/creator) into the static HTML. The handle is sourced from
 * `content.footer.social` so it stays single-source.
 */
export const meta = {
  title: metaTitle(),
  twitterHandle: content.footer.social.find((s) => s.platform === "x")?.handle ?? "",
};

/**
 * Build-time guard: throws if any inline citation references a source number
 * outside the Works Cited range. Called by `prerender.mjs` so a broken or
 * missing citation fails the production build instead of shipping silently.
 */
export function assertCitationsValid(): void {
  const broken = findBrokenCitations();
  if (broken.length === 0) return;
  const details = broken
    .map((b) => `  • source #${b.number} (only 1..${content.worksCited.length} exist) at ${b.location}\n    "${b.context}"`)
    .join("\n");
  throw new Error(
    `Citation check failed: ${broken.length} inline citation(s) point outside the Works Cited range:\n${details}`,
  );
}

/**
 * Build-time guard: throws if any prose string contains a stray asterisk or
 * an emphasis span not in the intentional-emphasis allowlist (see
 * `src/lib/emphasisGuard.ts`). Called by `prerender.mjs` so a paragraph that
 * would be silently reformatted by the inline-markdown pass fails the build.
 */
export { assertEmphasisValid };

/**
 * Build-time guard: throws if the RFC Log launch post's date ever diverges
 * from the paper's publish date. Both derive from `PAPER_DATE_PUBLISHED` by
 * construction, so this only fires if someone reintroduces a hardcoded date —
 * exactly the drift that shipped once before. Called by `prerender.mjs`.
 */
export function assertLaunchPostDateValid(): void {
  const launchPost = blogPages.find((p) => p.slug === LAUNCH_POST_SLUG);
  if (!launchPost) {
    throw new Error(
      `Launch post date check failed: no blog post with slug "${LAUNCH_POST_SLUG}" — if the launch post was renamed, update LAUNCH_POST_SLUG in lib/whitepaper/src/dates.ts.`,
    );
  }
  if (launchPost.date !== PAPER_DATE_PUBLISHED) {
    throw new Error(
      `Launch post date check failed: launch post "${LAUNCH_POST_SLUG}" is dated ${launchPost.date} but the paper's publish date is ${PAPER_DATE_PUBLISHED}. Both must derive from PAPER_DATE_PUBLISHED in lib/whitepaper/src/dates.ts — never hardcode either date.`,
    );
  }
}

const SITE = SITE_URL;

function tableToMarkdown(table: Table): string {
  const header = `| ${table.headers.join(" | ")} |`;
  const divider = `| ${table.headers.map(() => "---").join(" | ")} |`;
  const body = table.rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return `${header}\n${divider}\n${body}`;
}

// List items are plain strings or `{ label, body }` objects (bold lead-ins
// modeled as structure, not markdown). Emphasis is re-applied here in the
// generated markdown export only.
function listItemMd(item: ListItem): string {
  return typeof item === "string" ? `- ${item}` : `- **${item.label}** ${item.body}`;
}

export function getLlmsFull(): string {
  const lines: string[] = [];
  lines.push("# The AI-Native Office");
  lines.push("");
  lines.push(`> ${content.hero.title}`);
  lines.push("");
  lines.push(
    "The foundational technical specification for ainativeoffice.org, defining a new commercial real estate asset class: the AI-Native Office — a localized, sovereign compute edge node built within Class-A commercial real estate.",
  );
  lines.push("");

  // Emit a section/appendix body (prose, lists, subsections, tables, blocks)
  // into `lines`. Heading for the section title itself is pushed by the caller
  // so main sections and appendices can use different heading levels/labels.
  const emitSectionBody = (section: Section) => {
    for (const p of section.prose ?? []) {
      lines.push(p);
      lines.push("");
    }
    if (section.list) {
      for (const item of section.list) lines.push(listItemMd(item));
      lines.push("");
    }
    for (const p of section.postListProse ?? []) {
      lines.push(p);
      lines.push("");
    }
    for (const sub of section.subsections ?? []) {
      lines.push(`### ${sub.title}`);
      lines.push("");
      for (const p of sub.prose ?? []) {
        lines.push(p);
        lines.push("");
      }
      for (const p of sub.mathProse ?? []) {
        lines.push(p);
        lines.push("");
      }
      if (sub.code) {
        if (sub.code.caption) {
          lines.push(`*${sub.code.caption}*`);
          lines.push("");
        }
        lines.push("```");
        lines.push(sub.code.code);
        lines.push("```");
        lines.push("");
      }
      for (const pr of sub.principles ?? []) {
        lines.push(pr.label ? `> **${pr.label}** ${pr.body}` : `> ${pr.body}`);
        lines.push("");
      }
      if (sub.tableData) {
        lines.push(tableToMarkdown(sub.tableData));
        lines.push("");
      }
      for (const p of sub.postTableProse ?? []) {
        lines.push(p);
        lines.push("");
      }
      if (sub.list) {
        for (const item of sub.list) lines.push(listItemMd(item));
        lines.push("");
      }
      for (const block of sub.blocks ?? []) {
        if (block.label) {
          lines.push(`#### ${block.label}`);
          lines.push("");
        }
        for (const p of block.prose ?? []) {
          lines.push(p);
          lines.push("");
        }
        if (block.list) {
          for (const item of block.list) lines.push(listItemMd(item));
          lines.push("");
        }
        for (const l of block.lines ?? []) {
          lines.push(l);
        }
        if (block.lines) lines.push("");
      }
      for (const p of sub.postListProse ?? []) {
        lines.push(p);
        lines.push("");
      }
      if (sub.closing) {
        lines.push(`*${sub.closing}*`);
        lines.push("");
      }
    }
  };

  for (const section of content.sections) {
    lines.push(`## ${section.title}`);
    lines.push("");
    emitSectionBody(section);
  }

  lines.push("## Works Cited");
  lines.push("");
  content.worksCited.forEach((c, i) => lines.push(`${i + 1}. ${c}`));
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("# Appendices");
  lines.push("");
  lines.push(
    "Deep technical detail supporting the specification above — egress economics, sensor and acoustic engineering, the hardened sovereign enclave, reference compute classes, and the localized GraphRAG pipeline.",
  );
  lines.push("");
  content.appendices.forEach((appendix, idx) => {
    lines.push(`## Appendix ${String.fromCharCode(65 + idx)}: ${appendix.title}`);
    lines.push("");
    emitSectionBody(appendix);
  });

  lines.push("---");
  lines.push("");
  lines.push(`# ${SIGNALS_TITLE}`);
  lines.push("");
  lines.push(SIGNALS_DESCRIPTION);
  lines.push("");
  lines.push(`Canonical ledger: ${SIGNALS_URL} (each entry has a permanent anchor).`);
  lines.push("");
  for (const entry of signalEntries) {
    lines.push(`## ${signalDesignation(entry)} — ${entry.date} — ${entry.headline}`);
    lines.push("");
    lines.push(`Permalink: ${signalEntryUrl(entry)}`);
    lines.push("");
    lines.push(entry.body);
    lines.push("");
    lines.push("Sources:");
    for (const source of entry.sources) {
      lines.push(`- ${source.label}: ${source.url}`);
    }
    lines.push("");
    const validates = entry.validatesSectionIds
      .map((id) => `${SITE_URL}/sections/${id}/`)
      .join(", ");
    lines.push(`Validates: ${validates}`);
    lines.push("");
  }

  return lines.join("\n");
}

/** Stable `@id` anchors for the site-level entities, used by page-level references. */
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Canonical Organization node — a full entity with a stable `@id` so every
 * page-level JSON-LD object can reference it by id rather than re-embed it.
 */
const ORG = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: SITE_NAME,
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/opengraph.jpg` },
  sameAs: content.footer.social.map((s) => s.url),
};

/**
 * Person entities derived from `content.hero.authors` — the single source of
 * truth for the human authors credited on the homepage. Used in JSON-LD
 * `author` arrays on the homepage, section pages, and blog posts so crawlers
 * and AI systems see named individuals, not just the organization.
 */
const PERSONS = content.hero.authors.map((a) => ({
  "@type": "Person",
  name: a.name,
  email: a.email,
  worksFor: { "@id": ORG_ID },
}));

/**
 * Shared site-level graph: a standalone Organization entity + a WebSite entity,
 * each with a stable `@id`. Emitted on every public page so search engines
 * and AI systems can connect all pages to one canonical brand entity.
 */
function buildSiteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      ORG,
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

function buildJsonLd() {
  const citations = content.worksCited.map((c) => {
    const { label, url } = parseCitation(c);
    const name = label.trim();
    return url
      ? { "@type": "CreativeWork", name, url }
      : { "@type": "CreativeWork", name };
  });

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: content.hero.title,
    name: "The AI-Native Office",
    description:
      "A technical specification for the AI-Native Office — a sovereign compute edge node that collapses the distance between human collaboration and machine inference to exactly zero.",
    inLanguage: "en",
    version: content.hero.spec.version,
    creativeWorkStatus: `Draft Specification — ${content.hero.spec.status}`,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: `${SITE}/opengraph.jpg`,
    author: PERSONS,
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/` },
    isPartOf: { "@id": WEBSITE_ID },
    articleSection: [...content.sections, ...content.appendices].map((s) => s.title),
    citation: citations,
  };
}

export function render() {
  const html = renderToString(<App ssrPath="/" />);
  const head = toJsonLdScripts([buildJsonLd(), buildSiteGraph()]);
  return { html, head };
}

/**
 * Per-section JSON-LD: a BreadcrumbList (full paper → section) plus a
 * TechArticle scoped to the section via `isPartOf` the main document. The
 * full-document JSON-LD (citation list etc.) is deliberately NOT duplicated
 * onto section pages — `/` remains the canonical full document.
 */
function buildSectionJsonLd(pageId: string) {
  const page = getSectionPage(pageId);
  if (!page) throw new Error(`buildSectionJsonLd: unknown section id "${pageId}"`);
  const displayName = page.isAppendix
    ? `Appendix ${page.appendixLetter}: ${page.title}`
    : page.title;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: displayName,
        item: page.url,
      },
    ],
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: displayName,
    name: displayName,
    description: page.description,
    url: page.url,
    inLanguage: "en",
    version: content.hero.spec.version,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: `${SITE_URL}/opengraph.jpg`,
    author: PERSONS,
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": page.url },
    isPartOf: {
      "@type": "TechArticle",
      headline: content.hero.title,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
  };

  return [breadcrumb, article];
}

/**
 * Build-time list of section pages for the multi-route prerender. Each entry
 * carries the output path, canonical URL, and per-page meta values.
 */
export function getSectionPages() {
  return sectionPages.map((p) => ({
    id: p.id,
    path: p.path,
    url: p.url,
    metaTitle: p.metaTitle,
    description: p.description,
  }));
}

/** Prerender one section/appendix route to HTML + its scoped JSON-LD head. */
export function renderSection(id: string) {
  const page = getSectionPage(id);
  if (!page) throw new Error(`renderSection: unknown section id "${id}"`);
  const html = renderToString(<App ssrPath={page.path} />);
  const head = toJsonLdScripts([...buildSectionJsonLd(id), buildSiteGraph()]);
  return { html, head };
}

/**
 * Generated sitemap: `/`, every section/appendix URL, the blog index, and
 * every blog post, derived from the content tree at build time.
 */
export function getSitemapXml(): string {
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: DATE_MODIFIED, priority: "1.0" },
    ...sectionPages.map((p) => ({ loc: p.url, lastmod: DATE_MODIFIED, priority: "0.7" })),
    { loc: BLOG_URL, lastmod: blogPages[0]?.date ?? DATE_MODIFIED, priority: "0.8" },
    ...blogPages.map((p) => ({ loc: p.url, lastmod: p.date, priority: "0.7" })),
    // Max entry date, not the first entry's: entry numbers are the ledger
    // order and event dates may be non-monotonic, so [0] isn't always newest.
    {
      loc: SIGNALS_URL,
      lastmod: signalEntries.length
        ? latestIsoDate(signalEntries.map((e) => e.date))
        : DATE_MODIFIED,
      priority: "0.8",
    },
  ];
  const entries = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

/* ------------------------------ Blog (RFC Log) ----------------------------- */

/** BreadcrumbList item helper for blog pages. */
function blogBreadcrumb(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

/** Blog index JSON-LD: BreadcrumbList + a Blog entity listing all posts. */
function buildBlogIndexJsonLd() {
  const blog = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} — ${BLOG_TITLE}`,
    description: BLOG_DESCRIPTION,
    url: BLOG_URL,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
    blogPost: blogPages.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: p.url,
      datePublished: p.date,
      description: p.description,
    })),
  };
  return [
    blogBreadcrumb([
      { name: SITE_NAME, item: `${SITE_URL}/` },
      { name: BLOG_TITLE, item: BLOG_URL },
    ]),
    blog,
  ];
}

/** Per-post JSON-LD: BreadcrumbList + a BlogPosting that isPartOf the blog. */
function buildBlogPostJsonLd(slug: string, ogImageUrl?: string) {
  const page = getBlogPage(slug);
  if (!page) throw new Error(`buildBlogPostJsonLd: unknown blog slug "${slug}"`);
  const posting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: page.title,
    name: page.title,
    description: page.description,
    url: page.url,
    inLanguage: "en",
    datePublished: page.date,
    dateModified: page.date,
    image: ogImageUrl ?? `${SITE_URL}/opengraph.jpg`,
    author: PERSONS,
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": page.url },
    isPartOf: {
      "@type": "Blog",
      name: `${SITE_NAME} — ${BLOG_TITLE}`,
      url: BLOG_URL,
    },
  };
  return [
    blogBreadcrumb([
      { name: SITE_NAME, item: `${SITE_URL}/` },
      { name: BLOG_TITLE, item: BLOG_URL },
      { name: page.title, item: page.url },
    ]),
    posting,
  ];
}

const toJsonLdScripts = (objs: object[]) =>
  objs
    .map(
      (obj) =>
        `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`,
    )
    .join("");

/** Build-time list of blog pages for the multi-route prerender + RSS. */
export function getBlogPages() {
  return blogPages.map((p) => ({
    slug: p.slug,
    path: p.path,
    url: p.url,
    title: p.title,
    metaTitle: p.metaTitle,
    description: p.description,
    date: p.date,
    ogImagePath: p.ogImagePath,
    ogImageUrl: p.ogImageUrl,
  }));
}

/** Build-time meta for the blog index page. */
export const blogIndexMeta = {
  path: BLOG_PATH,
  url: BLOG_URL,
  metaTitle: BLOG_META_TITLE,
  description: BLOG_DESCRIPTION,
};

/** Prerender the blog index route to HTML + its JSON-LD head. */
export function renderBlogIndex() {
  const html = renderToString(<App ssrPath={BLOG_PATH} />);
  return { html, head: toJsonLdScripts([...buildBlogIndexJsonLd(), buildSiteGraph()]) };
}

/**
 * Prerender one blog post route to HTML + its JSON-LD head. `ogImageUrl` is
 * the per-post OG card URL when the card exists in the build output; when
 * omitted, the JSON-LD image falls back to the site-wide card.
 */
export function renderBlogPost(slug: string, ogImageUrl?: string) {
  const page = getBlogPage(slug);
  if (!page) throw new Error(`renderBlogPost: unknown blog slug "${slug}"`);
  const html = renderToString(<App ssrPath={page.path} />);
  return { html, head: toJsonLdScripts([...buildBlogPostJsonLd(slug, ogImageUrl), buildSiteGraph()]) };
}

/* ------------------------------ Signal Log -------------------------------- */

/** Build-time meta for the Signal Log page, consumed by `prerender.mjs`. */
export const signalsMeta = {
  path: SIGNALS_PATH,
  url: SIGNALS_URL,
  metaTitle: SIGNALS_META_TITLE,
  description: SIGNALS_DESCRIPTION,
};

/**
 * Signal Log JSON-LD: BreadcrumbList + an ItemList of the ledger entries,
 * each item pointing at its permanent `#log-NNN` anchor URL.
 */
function buildSignalsJsonLd() {
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SITE_NAME} — ${SIGNALS_TITLE}`,
    description: SIGNALS_DESCRIPTION,
    url: SIGNALS_URL,
    inLanguage: "en",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: signalEntries.length,
    itemListElement: signalEntries.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: signalEntryUrl(entry),
      item: {
        "@type": "CreativeWork",
        name: `${signalDesignation(entry)} — ${entry.headline}`,
        datePublished: entry.date,
        url: signalEntryUrl(entry),
        citation: entry.sources.map((s) => ({
          "@type": "CreativeWork",
          name: s.label,
          url: s.url,
        })),
      },
    })),
  };
  return [
    blogBreadcrumb([
      { name: SITE_NAME, item: `${SITE_URL}/` },
      { name: SIGNALS_TITLE, item: SIGNALS_URL },
    ]),
    list,
  ];
}

/**
 * Prerender the Signal Log route to HTML + its JSON-LD head. Also validates
 * the ledger (section refs, unique numbers, newest-first order) so a bad
 * entry fails the build instead of shipping.
 */
export function renderSignals() {
  assertSignalsValid();
  const html = renderToString(<App ssrPath={SIGNALS_PATH} />);
  return { html, head: toJsonLdScripts([...buildSignalsJsonLd(), buildSiteGraph()]) };
}

const escapeXml = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

/**
 * RSS 2.0 feed for the blog, generated at build time from the same post
 * registry as the pages, sitemap, and JSON-LD. Served at `/rss.xml` and
 * referenced from every page head via `<link rel="alternate">`.
 */
export function getRssXml(): string {
  const items = blogPages
    .map((p) => {
      const pubDate = new Date(`${p.date}T00:00:00Z`).toUTCString();
      return `    <item>\n      <title>${escapeXml(p.title)}</title>\n      <link>${p.url}</link>\n      <guid isPermaLink="true">${p.url}</guid>\n      <pubDate>${pubDate}</pubDate>\n      <description>${escapeXml(p.description)}</description>\n    </item>`;
    })
    .join("\n");
  const lastBuild = new Date(`${blogPages[0]?.date ?? DATE_MODIFIED}T00:00:00Z`).toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${SITE_NAME} — ${BLOG_TITLE}`)}</title>
    <link>${BLOG_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(BLOG_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}
