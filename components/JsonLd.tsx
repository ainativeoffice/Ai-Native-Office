/**
 * Renders a JSON-LD structured-data block. Server-only by nature (no
 * interactivity) — the serialized graph is emitted inline so crawlers and LLM
 * ingesters read it without executing JavaScript.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
