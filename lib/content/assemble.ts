import { content, type ListItem, type Table, type Section } from "./content";

/**
 * Assembles the full whitepaper — hero, abstract, every section, works cited,
 * and the technical appendices — into a single plain-markdown string.
 *
 * This is the canonical, framework-free serialization of the manifesto, derived
 * entirely from `content.ts` (which itself includes `content-archive.ts` as the
 * appendices). It is consumed server-side to ground the Q&A assistant so the
 * model only ever sees the document's own words and can never drift from the
 * rendered copy.
 */

function tableToMarkdown(table: Table): string {
  const header = `| ${table.headers.join(" | ")} |`;
  const divider = `| ${table.headers.map(() => "---").join(" | ")} |`;
  const body = table.rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return `${header}\n${divider}\n${body}`;
}

function listItemMd(item: ListItem): string {
  return typeof item === "string" ? `- ${item}` : `- **${item.label}** ${item.body}`;
}

function emitSectionBody(lines: string[], section: Section): void {
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
}

export function assembleWhitepaperText(): string {
  const lines: string[] = [];

  lines.push(`# ${content.hero.title}`);
  if (content.hero.subtitle) {
    lines.push("");
    lines.push(content.hero.subtitle);
  }
  lines.push("");
  lines.push(
    `Specification: Draft v${content.hero.spec.version} — ${content.hero.spec.status}`,
  );
  lines.push("");
  lines.push("## Abstract");
  lines.push("");
  lines.push(content.abstract);
  lines.push("");

  for (const section of content.sections) {
    lines.push(`## ${section.title}`);
    lines.push("");
    emitSectionBody(lines, section);
  }

  lines.push("## Works Cited");
  lines.push("");
  content.worksCited.forEach((c, i) => lines.push(`${i + 1}. ${c}`));
  lines.push("");

  lines.push("# Appendices");
  lines.push("");
  content.appendices.forEach((appendix, idx) => {
    lines.push(`## Appendix ${String.fromCharCode(65 + idx)}: ${appendix.title}`);
    lines.push("");
    emitSectionBody(lines, appendix);
  });

  return lines.join("\n").trim();
}
