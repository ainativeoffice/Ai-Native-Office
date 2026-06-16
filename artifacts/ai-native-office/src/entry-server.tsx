import { renderToString } from "react-dom/server";
import App from "./App";
import { content } from "./content";

const SITE = "https://ainativeoffice.org";

type Table = { headers: string[]; rows: string[][] };

function tableToMarkdown(table: Table): string {
  const header = `| ${table.headers.join(" | ")} |`;
  const divider = `| ${table.headers.map(() => "---").join(" | ")} |`;
  const body = table.rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return `${header}\n${divider}\n${body}`;
}

export function getLlmsFull(): string {
  const lines: string[] = [];
  lines.push("# The AI-Native Office");
  lines.push("");
  lines.push(`> ${content.hero.title}`);
  lines.push("");
  lines.push(
    "The foundational manifesto and technical standard for ainativeoffice.org, defining a new commercial real estate asset class: the AI-Native Office — a localized, sovereign compute edge node disguised as Class-A commercial real estate.",
  );
  lines.push("");

  for (const section of content.sections as any[]) {
    lines.push(`## ${section.title}`);
    lines.push("");
    for (const p of section.prose ?? []) {
      lines.push(p);
      lines.push("");
    }
    if (section.list) {
      for (const item of section.list) lines.push(`- ${item}`);
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
      if (sub.tableData) {
        lines.push(tableToMarkdown(sub.tableData));
        lines.push("");
      }
      for (const p of sub.postTableProse ?? []) {
        lines.push(p);
        lines.push("");
      }
      if (sub.list) {
        for (const item of sub.list) lines.push(`- ${item}`);
        lines.push("");
      }
      for (const p of sub.postListProse ?? []) {
        lines.push(p);
        lines.push("");
      }
    }
  }

  lines.push("## Works Cited");
  lines.push("");
  (content.worksCited as string[]).forEach((c, i) => lines.push(`${i + 1}. ${c}`));
  lines.push("");

  return lines.join("\n");
}

function buildJsonLd() {
  const citations = (content.worksCited as string[]).map((c) => {
    const m = c.match(/(https?:\/\/\S+)/);
    const url = m ? m[1] : undefined;
    const name = (url ? c.slice(0, m!.index) : c).replace(/,\s*$/, "").trim();
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
      "The technical standard and manifesto for a new commercial real estate asset class: the AI-Native Office — a sovereign compute edge node disguised as Class-A real estate.",
    inLanguage: "en",
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
    articleSection: (content.sections as any[]).map((s) => s.title),
    citation: citations,
  };
}

export function render() {
  const html = renderToString(<App ssrPath="/" />);
  const jsonLd = JSON.stringify(buildJsonLd()).replace(/</g, "\\u003c");
  const head = `<script type="application/ld+json">${jsonLd}</script>`;
  return { html, head };
}
