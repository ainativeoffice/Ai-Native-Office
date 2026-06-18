import { renderToString } from "react-dom/server";
import App from "./App";
import { content, type ListItem, type Table } from "./content";
import { findBrokenCitations, parseCitation } from "./lib/citations";
import { metaTitle } from "./lib/spec";

/**
 * Build-time meta values consumed by `prerender.mjs` to inject the
 * spec-version-aware <title>/og:title/twitter:title into the static HTML.
 */
export const meta = {
  title: metaTitle(),
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

const SITE = "https://ainativeoffice.org";

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

  for (const section of content.sections) {
    lines.push(`## ${section.title}`);
    lines.push("");
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
  }

  lines.push("## Works Cited");
  lines.push("");
  content.worksCited.forEach((c, i) => lines.push(`${i + 1}. ${c}`));
  lines.push("");

  return lines.join("\n");
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
    datePublished: "2026-06-16",
    dateModified: "2026-06-16",
    image: `${SITE}/opengraph.jpg`,
    author: { "@type": "Organization", name: "The AI-Native Office", url: SITE },
    publisher: {
      "@type": "Organization",
      name: "The AI-Native Office",
      url: SITE,
      logo: { "@type": "ImageObject", url: `${SITE}/opengraph.jpg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/` },
    articleSection: content.sections.map((s) => s.title),
    citation: citations,
  };
}

export function render() {
  const html = renderToString(<App ssrPath="/" />);
  const jsonLd = JSON.stringify(buildJsonLd()).replace(/</g, "\\u003c");
  const head = `<script type="application/ld+json">${jsonLd}</script>`;
  return { html, head };
}
