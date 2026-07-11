import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content/spec";
import { PAPER_DATE_PUBLISHED } from "@/lib/content/dates";
import { specDateModified } from "@/lib/seo";
import { sectionPages } from "@/lib/content/sectionPages";
import { blogPages, BLOG_URL } from "@/lib/content/blogPages";
import { SIGNALS_URL } from "@/lib/content/signalsPage";
import { IMPLEMENTATIONS_URL } from "@/lib/content/implementations";

/**
 * XML sitemap generated entirely from the content registries so it never
 * drifts from the routes that actually exist. `lastModified` uses the spec's
 * derived revision date for spec surfaces and each post's own date for the log.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const modified = specDateModified();

  const home: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}/`,
    lastModified: modified,
    changeFrequency: "monthly",
    priority: 1,
  };

  const sections: MetadataRoute.Sitemap = sectionPages.map((p) => ({
    url: p.url,
    lastModified: modified,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const collections: MetadataRoute.Sitemap = [
    { url: BLOG_URL, lastModified: modified, changeFrequency: "weekly", priority: 0.7 },
    { url: SIGNALS_URL, lastModified: modified, changeFrequency: "weekly", priority: 0.7 },
    { url: IMPLEMENTATIONS_URL, lastModified: modified, changeFrequency: "weekly", priority: 0.6 },
  ];

  const posts: MetadataRoute.Sitemap = blogPages.map((p) => ({
    url: p.url,
    lastModified: p.date || PAPER_DATE_PUBLISHED,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [home, ...sections, ...collections, ...posts];
}
