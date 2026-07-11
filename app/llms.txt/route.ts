import { content } from "@/lib/content/content";
import { SITE_URL, specMetaLabel } from "@/lib/content/spec";
import { sectionPages } from "@/lib/content/sectionPages";
import { blogPages, BLOG_URL, BLOG_TITLE, BLOG_DESCRIPTION } from "@/lib/content/blogPages";
import {
  SIGNALS_URL,
  SIGNALS_TITLE,
  SIGNALS_DESCRIPTION,
} from "@/lib/content/signalsPage";
import {
  IMPLEMENTATIONS_URL,
  IMPLEMENTATIONS_TITLE,
  IMPLEMENTATIONS_DESCRIPTION,
} from "@/lib/content/implementations";

export const dynamic = "force-static";

/**
 * /llms.txt — the curated index per the llms.txt convention. Points crawlers
 * and agents at the full plaintext export and the primary sections/logs, all
 * derived from the content registries so links stay valid.
 */
function buildLlmsIndex(): string {
  const lines: string[] = [];

  lines.push(`# ${content.hero.title}`);
  lines.push("");
  lines.push(`> ${content.hero.subtitle} — ${specMetaLabel()}.`);
  lines.push("");
  lines.push(content.abstract);
  lines.push("");

  lines.push("## Full document");
  lines.push("");
  lines.push(`- [Complete specification (plaintext)](${SITE_URL}/llms-full.txt): The entire whitepaper, abstract through appendices, in a single file.`);
  lines.push(`- [Specification (HTML)](${SITE_URL}/): The canonical rendered document.`);
  lines.push("");

  lines.push("## Sections");
  lines.push("");
  for (const p of sectionPages) {
    lines.push(`- [${p.title}](${p.url}): ${p.description}`);
  }
  lines.push("");

  lines.push("## Logs & registry");
  lines.push("");
  lines.push(`- [${BLOG_TITLE}](${BLOG_URL}): ${BLOG_DESCRIPTION}`);
  lines.push(`- [${SIGNALS_TITLE}](${SIGNALS_URL}): ${SIGNALS_DESCRIPTION}`);
  lines.push(`- [${IMPLEMENTATIONS_TITLE}](${IMPLEMENTATIONS_URL}): ${IMPLEMENTATIONS_DESCRIPTION}`);
  lines.push("");

  if (blogPages.length > 0) {
    lines.push("## Recent RFC log entries");
    lines.push("");
    for (const p of blogPages.slice(0, 10)) {
      lines.push(`- [${p.title}](${p.url}): ${p.description}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function GET() {
  return new Response(buildLlmsIndex(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
