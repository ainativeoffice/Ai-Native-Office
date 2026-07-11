import { assembleWhitepaperText } from "@/lib/content/assemble";

export const dynamic = "force-static";

/**
 * Full plaintext export of the specification for LLM ingestion. This is the
 * canonical target of the site's "Copy for LLM" action and the advertised
 * llms-full.txt convention. Assembled from the same content tree that renders
 * the HTML, so the two never diverge.
 */
export function GET() {
  return new Response(assembleWhitepaperText(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
