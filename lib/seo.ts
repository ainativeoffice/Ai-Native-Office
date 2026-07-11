import { content } from "@/lib/content/content";
import {
  SITE_NAME,
  SITE_URL,
  metaTitle,
  specMetaLabel,
  specVersion,
} from "@/lib/content/spec";
import {
  PAPER_DATE_PUBLISHED,
  SPEC_REVISION_DATE,
  latestIsoDate,
} from "@/lib/content/dates";
import { blogPages } from "@/lib/content/blogPages";
import { signalEntries } from "@/lib/content/signalsPage";
import type { BlogPageInfo } from "@/lib/content/blogPages";
import type { SectionPageInfo } from "@/lib/content/sectionPages";

/**
 * Central SEO / structured-data layer. Every value here is derived from the
 * existing content tree (`content.ts`, `spec.ts`, `dates.ts`, the page
 * registries) so meta tags, JSON-LD, the sitemap, the manifest, and the
 * harmonized OpenGraph card all stay in lockstep with the copy — nothing is
 * hand-duplicated. No visible page copy is defined or altered here.
 */

/** The exact meta description already used on the home document (kept in one place). */
export const SITE_DESCRIPTION =
  "A technical specification for the AI-Native Office — a sovereign compute edge node that collapses the distance between human collaboration and machine inference to exactly zero.";

/** Short PWA name for the web app manifest. */
export const SHORT_NAME = "AI-Native Office";

/**
 * Topic keywords, drawn verbatim from terms already present in the
 * specification — used for the `keywords` meta tag and JSON-LD `keywords`.
 */
export const KEYWORDS = [
  "AI-Native Office",
  "sovereign compute",
  "on-premises AI",
  "data sovereignty",
  "zero egress",
  "edge inference",
  "regulated enterprise AI",
  "commercial real estate asset class",
  "Tripartite Ownership Model",
  "ambient intelligence",
  "STC 55",
  "GraphRAG",
];

/** Stable JSON-LD node identifiers so nodes can cross-reference by `@id`. */
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SPECIFICATION_ID = `${SITE_URL}/#specification`;
const TRUCAST_ID = "https://trucast.ai/#organization";
const NATIVE_AGENTIC_ID = "https://nativeagentic.com/#organization";
const NCV_ID = "https://northcastleventures.com/#organization";
const ARMONK_PC_ID = "https://armonkprofessionalcenter.com/#organization";

/**
 * The single harmonized social card, rendered on demand by `/og-image` and
 * built from the same favicon mark + spec metadata. Referenced by every page's
 * OpenGraph/Twitter metadata and by JSON-LD `image`.
 */
// Trailing slash matches the site's `trailingSlash: true` config so social
// crawlers fetch the card directly instead of through a 308 redirect.
const OG_IMAGE_PATH = `${SITE_URL}/og-image/`;

export const OG_IMAGE = {
  url: OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: `${content.hero.title} — ${SITE_NAME}`,
} as const;

/** Resolve an app-relative path to an absolute canonical URL. */
export function absoluteUrl(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Build an OpenGraph image descriptor for a specific page. The card frame,
 * monogram, and palette are inherited from `/og-image`; only the eyebrow,
 * title, subtitle, and status label change, so every card stays on-identity.
 */
export function ogImageFor(opts: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  label?: string;
  alt?: string;
}) {
  const params = new URLSearchParams();
  params.set("title", opts.title);
  if (opts.subtitle) params.set("subtitle", opts.subtitle);
  if (opts.eyebrow) params.set("eyebrow", opts.eyebrow);
  if (opts.label) params.set("label", opts.label);
  return {
    url: `${OG_IMAGE_PATH}?${params.toString()}`,
    width: OG_IMAGE.width,
    height: OG_IMAGE.height,
    alt: opts.alt ?? `${opts.title} — ${SITE_NAME}`,
  } as const;
}

/**
 * The document's effective `dateModified`: the newest of the spec's own
 * revision date, the latest RFC Log post, and the latest Signal Log entry —
 * matching the derivation described in `dates.ts`.
 */
export function specDateModified(): string {
  return latestIsoDate([
    SPEC_REVISION_DATE,
    ...blogPages.map((p) => p.date),
    ...signalEntries.map((s) => s.date),
  ]);
}

type Node = Record<string, unknown>;

function authorNodes(): Node[] {
  return content.hero.authors.map((author) => ({
    "@type": "Person",
    "@id": `${SITE_URL}/#author-${author.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: author.name,
    email: author.email,
    sameAs: [author.linkedinUrl],
    affiliation: [{ "@id": ORGANIZATION_ID }],
    ...(author.organization
      ? {
          jobTitle: "Founder",
          worksFor: { "@id": TRUCAST_ID },
          affiliation: [{ "@id": ORGANIZATION_ID }, { "@id": TRUCAST_ID }],
        }
      : {}),
  }));
}

/** Ecosystem organizations referenced by the registry; none is the paper publisher. */
export function ecosystemOrganizationNodes(): Node[] {
  return [
    {
      "@type": "Organization",
      "@id": TRUCAST_ID,
      name: "TruCast AI",
      url: "https://trucast.ai/",
      sameAs: ["https://www.linkedin.com/company/trucast-ai/"],
      founder: { "@id": `${SITE_URL}/#author-timothy-walsh` },
      description:
        "Sovereign protocol orchestration and enterprise workflow intelligence for regulated institutions.",
    },
    {
      "@type": "Organization",
      "@id": NCV_ID,
      name: "North Castle Ventures",
      url: "https://northcastleventures.com/",
      sameAs: ["https://www.linkedin.com/company/northcastleventures/"],
    },
    {
      "@type": "Organization",
      "@id": NATIVE_AGENTIC_ID,
      name: "Native Agentic",
      url: "https://nativeagentic.com/",
      sameAs: ["https://www.linkedin.com/company/nativeagentic/"],
      member: [{ "@id": TRUCAST_ID }, { "@id": NCV_ID }],
      description: "A partnership of TruCast and North Castle Ventures.",
    },
    {
      "@type": "Organization",
      "@id": ARMONK_PC_ID,
      name: "Armonk Professional Center",
      url: "https://armonkprofessionalcenter.com/",
      sameAs: ["https://www.linkedin.com/company/armonk-professional-center/"],
    },
  ];
}

/** Publisher/organization node. Emitted once, from the root layout. */
export function organizationLd(): Node {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/ainativeoffice-icon.svg` },
    image: OG_IMAGE.url,
    description: content.abstract,
    sameAs: content.footer.social.map((s) => s.url),
  };
}

/** WebSite node. Emitted once, from the root layout. */
export function websiteLd(): Node {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: "en-US",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** The specification itself, as a TechArticle (home page). */
export function specificationLd(): Node {
  return {
    "@type": "TechArticle",
    "@id": SPECIFICATION_ID,
    headline: content.hero.title,
    name: metaTitle(),
    alternativeHeadline: content.hero.subtitle,
    description: content.abstract,
    inLanguage: "en-US",
    author: authorNodes(),
    editor: authorNodes(),
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
    datePublished: PAPER_DATE_PUBLISHED,
    dateModified: specDateModified(),
    version: specVersion(),
    creativeWorkStatus: specMetaLabel(),
    keywords: KEYWORDS,
    image: OG_IMAGE.url,
    url: `${SITE_URL}/`,
    mainEntityOfPage: `${SITE_URL}/`,
    articleSection: content.sections.map((s) => s.navLabel ?? s.title.split(":")[0]),
  };
}

/** A per-section / per-appendix TechArticle that is part of the specification. */
export function sectionArticleLd(page: SectionPageInfo): Node {
  return {
    "@type": "TechArticle",
    "@id": `${page.url}#article`,
    headline: page.title,
    name: page.metaTitle,
    description: page.description,
    url: page.url,
    inLanguage: "en-US",
    author: authorNodes(),
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": SPECIFICATION_ID },
    datePublished: PAPER_DATE_PUBLISHED,
    dateModified: specDateModified(),
    image: OG_IMAGE.url,
    mainEntityOfPage: page.url,
  };
}

/** A single RFC Log post. */
export function blogPostingLd(page: BlogPageInfo): Node {
  return {
    "@type": "BlogPosting",
    "@id": `${page.url}#post`,
    headline: page.title,
    name: page.title,
    description: page.description,
    url: page.url,
    inLanguage: "en-US",
    author: authorNodes(),
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
    datePublished: page.date,
    dateModified: page.date,
    image: OG_IMAGE.url,
    mainEntityOfPage: page.url,
  };
}

/** The RFC Log index, as a Blog with its posts as an ItemList. */
export function blogListingLd(url: string, name: string, description: string): Node {
  return {
    "@type": "Blog",
    "@id": `${url}#blog`,
    name,
    description,
    url,
    inLanguage: "en-US",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    blogPost: blogPages.map((p) => ({
      "@type": "BlogPosting",
      "@id": `${p.url}#post`,
      headline: p.title,
      url: p.url,
      datePublished: p.date,
    })),
  };
}

/** A generic collection page (Signal Log, Implementation Registry). */
export function collectionPageLd(args: {
  url: string;
  name: string;
  description: string;
  numberOfItems?: number;
}): Node {
  return {
    "@type": "CollectionPage",
    "@id": `${args.url}#collection`,
    name: args.name,
    description: args.description,
    url: args.url,
    inLanguage: "en-US",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    ...(args.numberOfItems != null
      ? { mainEntity: { "@type": "ItemList", numberOfItems: args.numberOfItems } }
      : {}),
  };
}

/** A breadcrumb trail. Home is prepended automatically. */
export function breadcrumbLd(trail: { name: string; url: string }[]): Node {
  const items = [{ name: SITE_NAME, url: `${SITE_URL}/` }, ...trail];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** Wrap one or more nodes into a schema.org graph document. */
export function jsonLdGraph(nodes: Node[]): Node {
  return { "@context": "https://schema.org", "@graph": nodes };
}
