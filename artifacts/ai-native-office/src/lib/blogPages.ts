import { blogPosts, type BlogPost } from "@/content";
import { SITE_NAME, SITE_URL } from "./spec";

/**
 * Registry of blog pages, mirroring `sectionPages.ts`. React-free so the
 * client router pages and the SSG pipeline (entry-server → prerender.mjs →
 * sitemap + RSS) derive the exact same URL list, titles, and meta from one
 * source. Posts live at `/blog/<slug>/`; the index at `/blog/`.
 */

export const BLOG_PATH = "/blog/";
export const BLOG_URL = `${SITE_URL}${BLOG_PATH}`;
export const BLOG_TITLE = "RFC Log";
export const BLOG_META_TITLE = `${BLOG_TITLE} — ${SITE_NAME}`;
export const BLOG_DESCRIPTION =
  "The RFC Log for the AI-Native Office specification: launch notes, revision records, and commentary on sovereign on-premises compute as a commercial real estate asset class.";

export interface BlogPageInfo {
  slug: string;
  /** App-relative path with trailing slash, e.g. `/blog/rfc-v0-5-open-for-comment/`. */
  path: string;
  /** Absolute canonical URL on the production domain. */
  url: string;
  title: string;
  /** Full <title> / og:title value for this page. */
  metaTitle: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  post: BlogPost;
}

function toPage(post: BlogPost): BlogPageInfo {
  return {
    slug: post.slug,
    path: `${BLOG_PATH}${post.slug}/`,
    url: `${BLOG_URL}${post.slug}/`,
    title: post.title,
    metaTitle: `${post.title} — ${SITE_NAME} ${BLOG_TITLE}`,
    description: post.description,
    date: post.date,
    post,
  };
}

/** All blog pages, newest first (source array order). */
export const blogPages: BlogPageInfo[] = blogPosts.map(toPage);

const pageBySlug = new Map(blogPages.map((p) => [p.slug, p]));

export function getBlogPage(slug: string): BlogPageInfo | undefined {
  return pageBySlug.get(slug);
}

/** Prev = newer post, next = older post (array is newest-first). */
export function getAdjacentBlogPages(slug: string): {
  newer?: BlogPageInfo;
  older?: BlogPageInfo;
} {
  const idx = blogPages.findIndex((p) => p.slug === slug);
  if (idx === -1) return {};
  return {
    newer: idx > 0 ? blogPages[idx - 1] : undefined,
    older: idx < blogPages.length - 1 ? blogPages[idx + 1] : undefined,
  };
}
