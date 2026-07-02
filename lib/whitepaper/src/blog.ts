import type { Section } from "./content";

/**
 * Blog post model for the RFC Log (`/blog/`). Publishing is git-based: add a
 * post here and rebuild — the prerender emits static HTML, JSON-LD, RSS, and
 * sitemap entries from this single source of truth. The `body` reuses the
 * whitepaper `Section` shape so blog posts render through the exact same
 * prose/list/table/citation pipeline as the manifesto itself.
 */
export interface BlogPost {
  /** URL slug — the post lives at `/blog/<slug>/`. */
  slug: string;
  title: string;
  /** ISO date (YYYY-MM-DD). Used for display, JSON-LD, RSS pubDate, and sitemap lastmod. */
  date: string;
  /** One-line excerpt: index listing + meta description + RSS description. */
  description: string;
  /** Post body — same structured shape as a whitepaper section (`id` doubles as the slug). */
  body: Section;
  /** Ids of manifesto sections/appendices this post builds on; rendered as "read the spec" links. */
  relatedSectionIds?: string[];
}

/**
 * All posts, newest first. Keep dates ISO and unique enough to sort;
 * `blogPosts` is assumed sorted (index page + RSS render in array order).
 */
export const blogPosts: BlogPost[] = [
  {
    slug: "rfc-v0-5-open-for-comment",
    title: "RFC v0.5: The Specification Is Open for Comment",
    date: "2026-07-02",
    description:
      "The AI-Native Office specification is published as a Request for Comment. What v0.5 defines, who it is for, and how to file a comment against the draft.",
    relatedSectionIds: ["ceiling", "architecture", "compliance"],
    body: {
      id: "rfc-v0-5-open-for-comment",
      title: "RFC v0.5: The Specification Is Open for Comment",
      prose: [
        "The AI-Native Office specification is now published at ainativeoffice.org as a Request for Comment. Draft v0.5 is the first public revision: the full technical document — seven sections, ten appendices, and the complete works-cited register — is open for review by the practitioners it is written for. This log entry is the launch note; the RFC Log will carry every subsequent change to the draft.",
        "The document defines a new commercial real estate asset class: a sovereign, on-premises compute node built within a Class-A office environment. The core of the argument is architectural, not aspirational. Regulated institutions — banks, law firms, healthcare systems, and the firms that serve them — have hit a structural ceiling on AI adoption that no amount of vendor paperwork resolves, because the exposure is created by the delivery model itself. The specification's answer is to remove the shared infrastructure from the inference path entirely: tenant-owned silicon, an acoustically hardened shell, local ambient ingestion, and a tripartite ownership model in which no party can access what belongs to the other two.",
        "Version 0.5 ships with the full technical depth in the appendices: the egress economics that make local inference a balance-sheet argument, the acoustic and spatial sensor engineering behind the ambient layer, the hardened sovereign enclave design, the reference compute classes, and the localized GraphRAG pipeline that turns captured context into compounding institutional memory.",
      ],
      subsections: [
        {
          title: "What We Are Asking Reviewers to Do",
          prose: [
            "An RFC is a working instrument, not a press release. The draft improves in proportion to the quality of the objections filed against it. Three review lanes matter most at this revision:",
          ],
          list: [
            {
              label: "Governance reviewers.",
              body: "Chief Risk Officers, General Counsel, and compliance leads: does the tripartite ownership model actually resolve the sign-off blockers you encounter in production AI reviews? Where does the draft's chain of custody argument fail your audit standard?",
            },
            {
              label: "Infrastructure reviewers.",
              body: "Platform and hardware engineers: pressure-test the reference compute classes, the enclave hardening, and the egress math. If a number in the appendices does not survive contact with your deployment experience, we want the correction.",
            },
            {
              label: "Real estate reviewers.",
              body: "Landlords, developers, and tenant-rep brokers: the asset-class framing lives or dies on whether the Layer 1 core-and-shell requirements are buildable at Class-A economics. Tell us where the draft underestimates the retrofit.",
            },
          ],
          postListProse: [
            "Comments go directly to the authors — both are reachable by email from the specification masthead — and material revisions will be logged here and versioned in the draft. Subscribers to the specification update feed receive change notices by layer.",
          ],
        },
        {
          title: "What Changes Next",
          prose: [
            "The draft will remain at v0.5 until the first review cycle closes. The revision queue already includes expanded compliance mappings and additional reference deployments; comment volume will set the rest of the agenda. The specification is fully machine-readable — the complete document is available as plain markdown for LLM ingestion from the site — so reviewers are welcome to run their own models against the draft before filing.",
            "The room is the machine. The document is open. File your objections.",
          ],
        },
      ],
    },
  },
];

const postBySlug = new Map(blogPosts.map((p) => [p.slug, p]));

export function getBlogPost(slug: string): BlogPost | undefined {
  return postBySlug.get(slug);
}
