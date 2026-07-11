import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content/spec";

/**
 * robots.txt — everything is indexable (this is a public specification) and we
 * advertise the sitemap plus the LLM-oriented plaintext exports so AI crawlers
 * can ingest the full document without scraping HTML.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
