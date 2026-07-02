import type { Section } from "./content";
import { PAPER_DATE_PUBLISHED, LAUNCH_POST_SLUG } from "./dates";

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
    slug: "the-tenth-principle-physical-envelope",
    title: "The 10th Principle: Why Software Sovereignty Dies Without Physical Concrete",
    date: "2026-07-02",
    description:
      "Palantir's nine-point manifesto on AI sovereignty is correct — and incomplete. Software custody ends at the wall. The tenth principle is the physical envelope.",
    relatedSectionIds: ["architecture", "compliance", "economics"],
    body: {
      id: "the-tenth-principle-physical-envelope",
      title: "The 10th Principle: Why Software Sovereignty Dies Without Physical Concrete",
      prose: [
        "On July 1, 2026, Palantir published a nine-point manifesto on AI sovereignty. It is correct on every point it makes. It is also incomplete, because every point it makes stops at the software layer.",
        "Weights run on silicon. Silicon sits in a building. The building has walls, power, and a shared network riser. Software cryptography cannot protect a perimeter it cannot see. This is the tenth principle, and it is the one the cloud cannot sell you.",
      ],
      subsections: [
        {
          title: "The Software Thesis Is Correct",
          prose: [
            "Palantir's argument is sound. Data retention is the treasure. Weight custody is fate. Renting intelligence from a frontier API is a recurring tax — tokenmaxxing — levied on your most sensitive workflows in perpetuity.",
            "For regulated institutions — defense, healthcare, quantitative finance — the frontier cloud labs are not a convenience. They are a structural liability. Every inference call ships privileged context across a boundary the tenant does not own, to a model the tenant cannot inspect, under terms the tenant cannot audit. No procurement addendum closes that gap. The delivery model itself creates the exposure.",
            "On this, the manifesto and this specification agree without reservation.",
          ],
        },
        {
          title: "The Vulnerability Palantir Does Not Name",
          prose: [
            "Then the manifesto stops one layer too high.",
            "You cannot control your weights if those weights reside on rented hyperscaler hardware. Custody of a model you do not physically possess is a licensing arrangement, not ownership. The kill switch is held by someone else.",
            "You cannot protect your data if the room leaks. STC-35 drywall passes intelligible speech into the public corridor. A shared telecom riser carries your traffic beside a stranger's. An open-plenum ceiling is an acoustic broadcast antenna. Encryption does not reach the air in the room or the copper in the wall.",
            "Physical leakage is not a software problem. It cannot be patched. It can only be built out.",
          ],
        },
        {
          title: "The 10th Principle: The Physical Envelope",
          prose: [
            "The tenth principle of AI sovereignty is the physical envelope. True enterprise sovereignty requires hardware custody — the silicon that runs the weights must sit inside a perimeter the tenant owns and controls. Three requirements make the envelope real:",
          ],
          list: [
            {
              label: "The room as the sensor.",
              body: "Ambient intelligence is ingested at the edge through zero-egress acoustic capture. Context never leaves the shell to be transcribed. The sensory interface is the architecture, not an API call.",
            },
            {
              label: "Silicon on-premises.",
              body: "Localized PCIe compute — an NVIDIA L40S-class node — plugged into dedicated 208V power loops. The model runs feet from the people it serves, on power the tenant provisioned.",
            },
            {
              label: "A sealed shell.",
              body: "Acoustic isolation hardened to STC-55, private risers, and no shared plenum. The perimeter is masonry and copper, not a policy document.",
            },
          ],
          postListProse: [
            "Cryptography secures the bits. The envelope secures the physics. Sovereignty requires both, or it is not sovereignty.",
          ],
        },
        {
          title: "Sovereignty Is a Real Estate Asset",
          prose: [
            "This reframes sovereignty from an abstract cloud posture into a line item on a balance sheet.",
            "The AI-Native Office standard, published as open RFC v0.5, specifies how a standard commercial lease becomes a private, value-add data center: the core-and-shell requirements, the acoustic envelope, the reference compute classes, and the tripartite ownership model that keeps operator, landlord, and tenant blind to one another's domain.",
            "Any enterprise that can sign a Class-A lease can build this. The barrier was never the physics. The barrier was the absence of a standard. The standard now exists, and it is open for comment.",
            "Stop renting your intelligence. Own the hardware. Secure the masonry.",
          ],
        },
      ],
    },
  },
  {
    slug: LAUNCH_POST_SLUG,
    title: "RFC v0.5: The Specification Is Open for Comment",
    // Launch note: dated to the paper's publish date by construction — see dates.ts.
    date: PAPER_DATE_PUBLISHED,
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
