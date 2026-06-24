import { archivedSections } from "./content-archive";

/**
 * A bulleted list item: either a plain string or a `{ label, body }` pair whose
 * `label` is a bold lead-in term (modeled as structure, not markdown asterisks).
 */
export type ListItem = string | { label: string; body: string };

/** A data table rendered in a subsection (header row + body rows). */
export interface Table {
  headers: string[];
  rows: string[][];
}

/** A principle/tenet callout. `label` is an optional bold lead-in; `body` is required. */
export interface Principle {
  label?: string;
  body: string;
}

/** A contact/info block inside a subsection (e.g. the "Initialize a Conversation" card). */
export interface ContactBlock {
  label?: string;
  prose?: string[];
  list?: ListItem[];
  lines?: string[];
}

/** A subsection within a top-level section. All structured fields beyond title/prose are optional. */
export interface Subsection {
  title: string;
  prose: string[];
  /** Optional preformatted code/config block, rendered verbatim in monospace
   *  immediately after `prose`. Never run through the citation tokenizer. */
  code?: CodeBlock;
  principles?: Principle[];
  tableData?: Table;
  postTableProse?: string[];
  list?: ListItem[];
  blocks?: ContactBlock[];
  postListProse?: string[];
  closing?: string;
}

/** A verbatim code/config block: an optional caption plus the literal source. */
export interface CodeBlock {
  caption?: string;
  code: string;
}

/** A top-level manifesto section. `navLabel` overrides the sidebar label; structured fields are optional. */
export interface Section {
  id: string;
  navLabel?: string;
  title: string;
  prose: string[];
  list?: ListItem[];
  postListProse?: string[];
  subsections?: Subsection[];
}

interface Author {
  name: string;
  email: string;
}

interface Spec {
  version: string;
  status: string;
}

interface Hero {
  title: string;
  subtitle?: string;
  spec: Spec;
  authors: Author[];
}

interface Subscribe {
  heading: string;
  placeholder: string;
  submitLabel: string;
  layers: string[];
  successMessage: string;
  errorMessage: string;
}

interface FooterLink {
  label: string;
  href: string;
  disabled: boolean;
}

interface Footer {
  publishedBy: string;
  location: string;
  links: FooterLink[];
}

/** The full page content tree — the single source of truth for all copy. */
export interface Content {
  hero: Hero;
  abstract: string;
  sections: Section[];
  appendices: Section[];
  worksCited: string[];
  subscribe: Subscribe;
  footer: Footer;
}

export const content: Content = {
  hero: {
    title: "The Room as the Machine",
    subtitle: "A Technical Specification for the AI-Native Office",
    spec: {
      version: "0.5",
      status: "Request for Comment (RFC)",
    },
    authors: [
      { name: "Timothy Walsh", email: "tw@trucast.ai" },
      { name: "Parham Alizadeh", email: "parham@northcastleventures.com" },
    ],
  },
  abstract:
    "The institutions best positioned to leverage frontier AI — regulated banks, law firms, healthcare systems, and the firms that serve them — are precisely the institutions least able to use it as delivered. Data residency obligations, model governance requirements, and the fundamental exposure of routing sensitive inference through shared hyperscaler infrastructure have created a structural ceiling on enterprise AI adoption. The AI-Native Office removes that ceiling by defining a new commercial real estate asset class: a sovereign, on-premises compute node built within a Class-A office environment, acoustically hardened to STC 55 and powered by tenant-owned inference silicon. Ambient multimodal data is ingested and processed locally — never crossing a public network boundary — delivering absolute data sovereignty, zero egress cost, and deterministic AI inference at the point where collaboration actually happens.",
  sections: [
    {
      id: "ceiling",
      title: "The Structural Ceiling",
      prose: [
        "The institutions best positioned to leverage frontier AI — regulated banks, law firms, healthcare systems, and the firms that serve them — are precisely the institutions least able to use it as delivered. The models are capable. The governance infrastructure required to deploy them on real, sensitive, unredacted data inside a regulated institution does not exist in the standard cloud delivery model. The ceiling is not a technology problem. It is an architecture problem.",
        "The AI-Native Office removes that ceiling. It is a sovereign compute environment built into the physical workplace — an architecture that gives regulated institutions full AI capability without requiring them to route sensitive data through shared infrastructure they do not own, cannot audit end-to-end, and cannot fully control. The solution is not a compliance workaround. It is a different infrastructure category.",
        "Human beings have always built tools that extend capability beyond the body's natural limits. Writing extended memory across time. The printing press extended it across distance. The telephone extended voice across geography. The internet extended access beyond every prior constraint of proximity. Cloud computing extended storage and computational power beyond the limits of any single organization's physical plant. Each of these extensions followed the same logic: a capability previously constrained by physical limits becomes ambient, available on demand, and ultimately invisible. The AI-Native Office follows the same logic for a different set of capabilities. Where the cloud extended storage and computation across distance, the AI-Native Office extends perception, reasoning, and memory into the room itself. The intelligence is not accessed through a device or a browser. It is native to the physical environment where work actually happens — present, sovereign, and compounding with every use.",
        "Frontier AI capability crossed a meaningful threshold in the last twelve to eighteen months. Models can now synthesize clinical conversations with diagnostic precision, extract deal risk from unstructured negotiation in real time, and generate second-order strategic insight from raw operational data without human intermediation. The demand is measurable: 42% of enterprises are running agentic AI in production as of the Mayfield Fund 2026 CXO Survey, and the pilot-to-production conversion rate climbed from 11% in Q3 2025 to 31% in Q2 2026. The question has moved from \"should we adopt?\" to \"how do we scale?\" — and for regulated institutions, the answer keeps hitting the same wall. The models work. The governance doesn't.",
        "The regulatory environment has resolved from ambiguity to obligation. EU AI Act high-risk AI provisions became generally applicable August 2, 2026. The FCA's principles-based AI governance framework means every agentic workflow touching a regulated decision has a named Senior Manager personally accountable for it — which requires knowing, with certainty, where data went and what model touched it. The SEC and FINRA treat AI prompt-and-output logs as books-and-records under existing rules. These are not forecasts. They are the current operating environment. Routing sensitive inference through a shared hyperscaler is no longer an architectural preference question. It is a governance liability question, and the liability is currently unresolved for most of the institutions it touches.",
        "The infrastructure industry confirmed the direction of travel in June 2026. At Computex, the leading AI platform and the leading silicon company jointly demonstrated the first production hybrid inference system that autonomously classifies sensitive data and keeps it local, routing only non-sensitive workloads to the cloud. The proof-of-concept document type was confidential M&A deal materials — the single most legally sensitive category a law firm handles. When the two companies that define the frontier of AI deployment jointly validate sovereign inference as the production architecture for regulated data, and use a law firm's most sensitive document type as the test case, the question is no longer theoretical. The category has been ratified at the highest level of the industry. The organizations that move now are setting the standard. The organizations that wait are inheriting it."
      ]
    },
    {
      id: "for",
      title: "Who This Is For",
      prose: [
        "If your Chief Risk Officer must approve every new AI vendor before a single query touches sensitive data, this architecture resolves that process at the infrastructure level — there is no vendor in the inference chain. If your General Counsel has concerns about what a hyperscaler's terms of service does to attorney-client privilege, this architecture resolves that concern at the infrastructure level — the data never leaves the physical facility under your control. If your CTO has been told to find an AI solution that delivers full model capability on unredacted patient records without a Business Associate Agreement with a cloud provider that may change its terms, this architecture resolves that constraint at the infrastructure level. These are not policy workarounds. They are structural resolutions built into the physical environment.",
        "The organizations this architecture is built for operate in one of three conditions. The first is regulated financial services — banks, asset managers, broker-dealers, and the legal, consulting, and advisory firms that serve them — where AI inference on deal data, client data, and proprietary trading strategy cannot touch shared infrastructure without generating regulatory exposure that the compliance function cannot sign off on. The second is healthcare and clinical operations, where the requirement that protected health information remain within a covered entity's control means that genuine AI capability on raw clinical data has been functionally unavailable through any standard cloud path. The third is organizations — including family offices, private investment firms, and AI-native companies requiring absolute model isolation — where the competitive sensitivity of the inference inputs is itself the asset, and where the prospect of proprietary reasoning appearing in a vendor's training corpus is not an acceptable risk at any price.",
        "The infrastructure that Fortune 100 institutions have built internally — dedicated inference compute, air-gapped environments, sovereign data pipelines owned and operated entirely in-house — has not been available to the firms that serve them, or to the next tier of institutions that face identical governance constraints at smaller operational scale. A mid-sized law firm handling M&A transactions has the same attorney-client privilege exposure as a global firm. A regional health system has the same obligations as an academic medical center. A family office managing concentrated positions has the same competitive sensitivity as a multi-strategy fund. The AI-Native Office changes the availability equation. Sovereign compute infrastructure, previously accessible only to organizations with the capital and operational capacity to build and staff it entirely in-house, is now available as a purpose-built, professionally operated environment to any qualified tenant.",
        "The threshold for qualification is not a revenue band. It is a maturity condition: organizations that have moved past cloud AI experimentation and are now confronting its governance ceiling. If the pilots worked and the production deployment stalled on compliance review, this is the architecture that resolves the stall."
      ]
    },
    {
      id: "architecture",
      navLabel: "How It Works",
      title: "How the Architecture Works",
      prose: [],
      subsections: [
        {
          title: "The Tripartite Ownership Model",
          prose: [
            "The governance architecture of the AI-Native Office rests on a clear separation of ownership and responsibility across three parties, each with a distinct role and none with access to what belongs to the other two.",
            "The Landlord provisions the physical environment. The hardened shell, the acoustic and physical isolation engineering, the dedicated network infrastructure, the power envelopes designed for continuous high-density compute. The Landlord builds and maintains the room. The Landlord does not touch the tenant's compute or data.",
            "The Tenant owns the compute hardware outright. Physical custody. Legal title. The silicon that runs the tenant's inference workloads is property of the tenant, installed in the tenant's dedicated space, accessible only to the tenant. There is no shared compute pool. There are no other tenants on the same hardware. There is no mechanism — contractual or technical — by which a third party accesses the tenant's inference runs. No subprocessor agreements govern what happens inside the tenant's hardware envelope, because no subprocessor is present.",
            "The Software Integrator deploys and operates the intelligence stack — the software layer that binds the tenant's compute to the physical environment, maintains the ambient intelligence systems, and keeps the full stack current as models and capabilities evolve. The Software Integrator operates at the software layer only. It does not hold, transmit, or have access to the tenant's inference data or outputs.",
            "The result of this structure: no shared infrastructure anywhere in the stack. No vendor lock-in on the data layer, because the data layer is owned by the tenant. No third-party access to sensitive inference. The data sovereignty is not a policy position — it is the logical consequence of who owns what."
          ]
        },
        {
          title: "Physical Sovereignty",
          prose: [
            "The room is engineered to the same acoustic isolation standard used for classified government facilities. This is not an analogy — it is a construction standard, applied to a commercial environment, because the use case demands it. Conversations that happen inside the room — negotiations, clinical consultations, legal strategy sessions, investment committee meetings — generate data of the highest sensitivity. The physical environment is designed so that data generated inside stays inside. Not by policy, not by contractual restriction on a vendor, but by the physics of the room. Sound does not leave. Signals do not leave. Data does not leave."
          ]
        },
        {
          title: "Ambient Intelligence",
          prose: [
            "Every enterprise AI deployment built on structured inputs — forms, logs, typed notes, post-meeting summaries — operates on a degraded version of reality. The gap between what actually happened in a meeting and what got recorded afterward is the single most expensive information loss in enterprise operations. It is where deal context disappears, where clinical reasoning goes undocumented, where the actual terms of a negotiation diverge from the written summary. Organizations have managed this loss for decades not because it is acceptable but because there was no alternative.",
            "The AI-Native Office eliminates that gap. The environment captures the full fidelity of collaboration as it happens — audio, spatial context, screen content — and the intelligence layer operates on that complete input, not on a retroactive summary of it. This is not surveillance. Surveillance is covert observation by an external party for its own purposes. This is the tenant's own intelligence system, operating on the tenant's own data, in the tenant's own sovereign environment, for the tenant's own operational benefit. The distinction is architectural, not procedural. The AI operates on reality. Every inference it performs is more accurate, more complete, and more useful than any inference performed on a filtered or summarized input."
          ]
        },
        {
          title: "Intelligence Compounding",
          prose: [
            "Every meeting, negotiation, diagnostic session, and strategic discussion conducted inside the sovereign enclave becomes structured, queryable knowledge. The system builds a complete, high-resolution picture of the organization's intellectual activity — deals in progress, clinical reasoning, legal strategy, risk assessments — and that picture compounds in value with every session added to it. The knowledge graph is a sovereign asset. It belongs entirely to the tenant, lives on tenant-owned hardware, and is never externalized. It cannot be accessed by a vendor. It cannot appear in a training corpus. It cannot be lost in a breach of someone else's infrastructure. It is the accumulated institutional intelligence of the organization, owned and controlled by the organization."
          ]
        },
        {
          title: "The Four Principles",
          prose: [],
          principles: [
            { label: "Zero Egress.", body: "Data never crosses a public network boundary. The inference runs on tenant-owned hardware inside the physical facility. The output stays there." },
            { label: "The Room as the Interface.", body: "The physical environment is the primary data source. Collaboration is captured at full fidelity, not reconstructed from notes." },
            { label: "The Hardened Shell.", body: "Acoustic and physical isolation engineered to the standard of classified government facilities. Sovereignty is enforced by physics, not policy." },
            { label: "Sovereign Compute.", body: "Tenant-owned inference hardware. No per-token billing. No third-party access. No subprocessor in the inference chain." }
          ]
        }
      ]
    },
    {
      id: "economics",
      navLabel: "The Economics",
      title: "The Economics of Sovereignty",
      prose: [
        "Cloud providers charge for data moving out of their infrastructure. For most enterprise software — documents, APIs, database queries — this egress cost is incidental. For continuous AI workloads that operate on ambient data, it compounds into a material operating expense that generates zero computational value for the organization paying it. The data was produced inside the organization. The intelligence derived from it belongs to the organization. The egress charge is a transit tax on the organization's own information, paid indefinitely, growing with every increase in AI utilization, accruing to the cloud provider rather than to the organization's own capability.",
        "Sovereign compute replaces that perpetual operating expense with a depreciating capital asset. The hardware is owned, not rented. Depreciation schedules apply. The inference runs at zero marginal cost per query — the hardware is already provisioned, already powered, already present. Once the capital investment is made, the cost per unit of intelligence approaches zero as utilization increases. The cloud model inverts this: cost per unit of intelligence is fixed or rising, with no depreciation benefit and no path to marginal-cost inference. For organizations running high-volume, continuous AI workloads, the arithmetic favors the on-premises model decisively and permanently.",
        "For any workload that does route externally — non-sensitive data, public-source research, external API calls — dedicated private fiber connectivity provides bandwidth at a fraction of the per-gigabyte cost of standard cloud egress. Ethernet Private Line architecture connects the physical facility directly to upstream infrastructure without traversing public routing tables, placing external connectivity in a cost class that shared cloud infrastructure cannot match regardless of contract volume. This is not a discount available through negotiation — it is a structural advantage of owning dedicated physical infrastructure.",
        "The cost of inaction has a component that does not appear on any invoice. Organizations that choose to operate AI workloads through public cloud infrastructure on sensitive data must pre-process that data — redacting, tokenizing, anonymizing — before it can be safely submitted for inference. This compliance preprocessing degrades the input quality the model actually receives. The AI operates on a sanitized version of reality, and the output reflects that limitation. Organizations spending significant operational effort on compliance preprocessing are paying twice: once in the direct cost of the redaction workflow, and once in the inference quality penalty. The AI-Native Office eliminates both costs simultaneously. The data enters inference at full fidelity because it never leaves the sovereign environment. The compliance preprocessing step does not exist."
      ]
    },
    {
      id: "compliance",
      title: "The Compliance Moat",
      prose: [],
      subsections: [
        {
          title: "Architecture as Compliance",
          prose: [
            "Compliance in the cloud is procedural. It rests on data use agreements, vendor access controls, audit logs maintained by a third party whose interests are not identical to yours, and contractual representations about what the vendor will and will not do with data that has already left your physical control. These procedures are enforceable. They are also insufficient as the sole governance mechanism for AI inference on the most sensitive categories of regulated data — because the exposure is created at the moment the data crosses the boundary, and no agreement undoes that.",
            "Compliance in a sovereign enclave is architectural. The data physically cannot leave. The compute is owned. The audit trail lives on hardware under the tenant's custody. The compliance posture is not dependent on a vendor's contractual performance — it is the structural consequence of where the hardware sits and who owns it. The governed state is the default state. Departure from compliance would require a physical act, not a vendor policy change."
          ]
        },
        {
          title: "The Regulatory Landscape",
          prose: [
            "The EU AI Act's high-risk AI provisions became generally applicable August 2, 2026. High-risk AI systems must be documented, auditable, and subject to human oversight throughout their operational lifecycle. Running consequential AI inference through a shared API — where the model version, infrastructure configuration, and data handling practices are controlled by the provider and subject to change — creates a documentation and auditability dependency on that provider. The AI-Native Office resolves this dependency. The model runs on tenant-owned hardware. The configuration is tenant-controlled. The audit documentation lives on tenant infrastructure.",
            "The FCA's Senior Managers and Certification Regime requires that every AI workflow touching a regulated decision have a named Senior Manager who is personally accountable for it. That accountability is meaningful only if the Senior Manager can answer, with certainty and with evidence, where sensitive data went, what model touched it, and what governance controls were in place at the time of the inference. A sovereign compute environment provides that answer by construction. A shared cloud API provides it only to the extent the cloud provider's logs are complete, accessible, and admissible — conditions that the Senior Manager does not control.",
            "Under existing SEC and FINRA guidance, AI-generated outputs that touch investment decisions are books-and-records. The record is the prompt, the model version, the inference output, and the context in which it was generated. The AI-Native Office produces that record on tenant-owned hardware, under tenant custody, accessible only to the tenant and to regulators with appropriate authority. The record cannot be altered by a vendor. It cannot be withheld in a vendor dispute. It cannot be lost in a vendor's data management decisions.",
            "Under HIPAA, raw clinical data must remain within the covered entity's control. The AI-Native Office satisfies this requirement not through a Business Associate Agreement with an inference provider but through the architecture itself. The data never leaves the physical facility. There is no inference provider in the chain. The BAA question does not arise because the subprocessor does not exist."
          ]
        },
        {
          title: "The Flywheel",
          prose: [
            "Every conversation inside the sovereign enclave becomes structured knowledge that compounds in value over time. The AI builds a complete, queryable picture of the organization's intellectual activity — deals in progress, clinical reasoning, legal strategy, risk assessments as they evolve — and that picture grows more precise and more useful with every session. The knowledge is owned entirely by the tenant. It cannot be subpoenaed from a vendor because it does not live with a vendor. It cannot be accessed by a competitor through a shared infrastructure vulnerability. It cannot be lost in a breach of someone else's environment. It is the organization's own accumulated intelligence, growing in a sovereign enclave, accessible only on the organization's terms."
          ],
          principles: [
            { body: "No third-party model access to sensitive inference. No subprocessor agreements governing what happens to your data. No risk of proprietary reasoning appearing in a vendor's training corpus. The audit trail lives on your hardware, under your control, accessible only to you — and to the regulators you choose to grant access to it." }
          ]
        }
      ]
    },
    {
      id: "engage",
      title: "Engage",
      prose: [
        "The organizations engaging with this standard now are setting the terms for how regulated enterprise AI infrastructure gets built. The ones waiting are not holding a position — they are ceding one."
      ],
      subsections: [
        {
          title: "Reference Implementation Visit",
          prose: [
            "For technology officers, real estate principals, and infrastructure architects evaluating the AI-Native Office standard for their own environment.",
            "Tour a reference implementation of the AI-Native Office standard. The full stack — acoustic isolation, sovereign compute, ambient sensor infrastructure, and the intelligence layer — is deployed and operational. A reference implementation visit is the appropriate first step for organizations evaluating the standard for their own environment: a working system that can be observed, interrogated, and stress-tested against real organizational requirements. This is not a demonstration environment. It is the production standard."
          ]
        },
        {
          title: "Tenant Inquiry",
          prose: [
            "For organizations requiring dedicated sovereign AI infrastructure under the tripartite model.",
            "Inquire about tenancy within a qualified AI-Native Office node. Tenant deployments provide physically isolated, purpose-built sovereign compute environments operated under the tripartite ownership model described in this specification. The Node provides the hardened shell, base building systems, and software integration. The tenant owns and operates the silicon. Tenancy is appropriate for organizations that require dedicated, auditable, physically sovereign inference infrastructure without the capital and operational commitment of building and staffing an independent facility."
          ]
        },
        {
          title: "Developer / RFC Contributor",
          prose: [
            "For engineers, architects, and researchers engaged with the technical standard.",
            "This specification is an open technical standard under active development. Contribute technical feedback, propose amendments, or engage with the RFC process. The standard is designed to improve through deployment experience and rigorous peer review. Organizations that operate at the frontier of regulated AI deployment generate exactly the kind of operational evidence that makes a technical standard precise and durable. If your deployment has encountered constraints or edge cases not addressed in the current specification, that input belongs in the record."
          ]
        },
        {
          title: "Initialize a Conversation",
          prose: [
            "To request a technical briefing or begin a tenant inquiry, contact:"
          ],
          blocks: [
            {
              label: "Tim Walsh",
              lines: [
                "Armonk, NY",
                "[contact — Tim to supply]"
              ]
            }
          ],
          closing: "The AI-Native Office is a category being built. The organizations that engage now help define what it becomes."
        }
      ]
    }
  ],
  worksCited: [
    "Benchmarking | LiveKit Documentation, accessed June 16, 2026, https://docs.livekit.io/transport/self-hosting/benchmark/",
    "How to Reduce Latency in LiveKit Applications - Clover Dynamics, accessed June 16, 2026, https://www.cloverdynamics.com/blogs/reducing-latency-in-live-kit-applications-a-complete-guide",
    "A tale of two protocols: comparing WebRTC against HLS for live streaming | LiveKit, accessed June 16, 2026, https://livekit.com/blog/webrtc-vs-hls-livestreaming",
    "An Introduction to WebRTC Simulcast | by David Zhao | LiveKit | Medium, accessed June 16, 2026, https://medium.com/livekit/an-introduction-to-webrtc-simulcast-6c5f1f6402eb",
    "WebRTC Video Bitrate Guide | LiveKit, accessed June 16, 2026, https://livekit.com/webrtc/bitrate-guide",
    "Understanding Egress Fees On Cloud GPUs (2026) | Thunder Compute, accessed June 16, 2026, https://www.thundercompute.com/blog/egress-fees-cloud-gpus",
    "Cloud Egress 2026: $0 on R2 vs $1,137 on GCP for 10 TB, accessed June 16, 2026, https://egresscost.com/",
    "Cloud Egress Costs - Infracost, accessed June 16, 2026, https://www.infracost.io/resources/glossary/cloud-egress-costs",
    "Bandwidth pricing - Microsoft Azure, accessed June 16, 2026, https://azure.microsoft.com/en-us/pricing/details/bandwidth/",
    "GPU Cloud Egress Costs: The Hidden AI Bandwidth Bill (2026) | Spheron Blog, accessed June 16, 2026, https://www.spheron.network/blog/gpu-cloud-egress-data-transfer-costs-ai-workloads-2026/",
    "MXA920 - Ceiling Array Microphone - Product documentation - Shure, accessed June 16, 2026, https://pubs.shure.com/view/guide/MXA920/en-US.pdf",
    "mxa-brochure.pdf - Shure, accessed June 16, 2026, https://content-files.shure.com/publications/brochure/en/mxa-brochure.pdf",
    "MXA920 - Specifications, accessed June 16, 2026, https://enepl.com.sg/wp-content/uploads/2022/05/MXA920_Spec_Sheet_EN.pdf",
    "5 Beamforming Ceiling Array Microphones for Quality Conference Audio - Ford AV, accessed June 16, 2026, https://www.fordav.com/blogs/beamforming-ceiling-array-mics/",
    "MXA920 User Guide - Shure, accessed June 16, 2026, https://www.shure.com/en-US/docs/guide/MXA920",
    "How Can Asterisk Play the Real-Time Audio Stream?, accessed June 16, 2026, https://community.asterisk.org/t/how-can-asterisk-play-the-real-time-audio-stream/105166",
    "Turning Whisper into Real-Time Transcription System - arXiv, accessed June 16, 2026, https://arxiv.org/html/2307.14743v2",
    "Casambi System Overview, accessed June 16, 2026, https://casambi.us/wp-content/uploads/sites/2/2024/04/Casambi-System-Overview_EN_V5.0.pdf",
    "Casambi System Overview_EN : Services, accessed June 16, 2026, https://support.casambi.com/support/solutions/articles/12000104045-casambi-system-overview-en",
    "Casambi System Overview, accessed June 16, 2026, https://casambi.com/wp-content/uploads/2023/10/Casambi-System-Overview_EN_v3.1.pdf",
    "Casambi Whitepaper Setting Casambi modules to act as iBeacon senders, accessed June 16, 2026, https://casambi.com/wp-content/uploads/sites/2/2024/02/WP_iBeacon_V3.pdf",
    "Novel Indoor Positioning System Based on Bluetooth Direction Finding and Machine Learning - MDPI, accessed June 16, 2026, https://www.mdpi.com/2673-4591/120/1/67",
    "Bluetooth Indoor Positioning | u-blox, accessed June 16, 2026, https://www.u-blox.com/en/technologies/bluetooth-indoor-positioning",
    "Using Bluetooth® Direction Finding for high-accuracy indoor positioning, accessed June 16, 2026, https://www.bluetooth.com/blog/using-bluetooth-direction-finding-for-high-accuracy-indoor-positioning/",
    "STC Rating Chart: Walls, Doors, & Windows - Commercial Acoustics, accessed June 16, 2026, https://commercial-acoustics.com/sound-advice/stc-rating-chart/",
    "705 Door and Lock Package SG4 RF 40 dB – S&G - Krieger Specialty Products, accessed June 16, 2026, https://www.kriegerproducts.com/705-door-package/cut-sheets/KriegerSCIF-HM-705-SG4-RF40-S&G.pdf",
    "Doorquote - Lockmasters, accessed June 16, 2026, https://www.lockmasters.com/doorquote",
    "UFC 4-010-05 SCIF/SAPF Planning, Design, and Construction, accessed June 16, 2026, https://www.wbdg.org/FFC/DOD/UFC/ufc_4_010_05_2023.pdf",
    "NAVFAC EURAFCENT PMEB: Sensitive Compartmented Information Facilities (SCIF) and Special Access Program Facilities (SAPF) - Whole Building Design Guide, accessed June 16, 2026, https://www.wbdg.org/FFC/NAVFAC/ATESS/navfac_eurafcent_scif_sapf_0322.pdf",
    "Acoustical Assemblies STC Rating Reference Guide - Johns Manville, accessed June 16, 2026, https://www.jm.com/content/dam/jm/global/en/insulation-systems/products/assets/marketing-bulletin/acoustical-assemblies-stc-rating-reference-guide.pdf",
    "ASUS L40S Server Systems for Generative AI, accessed June 16, 2026, https://servers.asus.com/solution/45",
    "L40S, Nvidia L40 Series GPU, AI/Data Center - Router-Switch.com, accessed June 16, 2026, https://www.router-switch.com/nvidia-l40s.html",
    "Supermicro NVIDIA L40S Optimized Systems, accessed June 16, 2026, https://www.supermicro.com/en/accelerators/nvidia/l40s",
    "NVIDIA L40S: Pricing, Specs, Best Uses & Where to Run (2026) - Fluence network, accessed June 16, 2026, https://www.fluence.network/blog/nvidia-l40s/",
    "NVIDIA L40S - Accelerators - ServerMonkey, accessed June 16, 2026, https://www.servermonkey.com/accelerators/nvidia-l40s.html",
    "MLPerf™ Inference v4.0 Performance on Dell PowerEdge R760 with NVIDIA L40S GPUs, accessed June 16, 2026, https://infohub.delltechnologies.com/p/mlperf-tm-inference-v4-0-performance-on-dell-poweredge-r760-with-nvidia-l40s-gpus/",
    "L40S GPU for AI and Graphics Performance - NVIDIA, accessed June 16, 2026, https://www.nvidia.com/en-us/data-center/l40s/",
    "Spotlight: Accelerating into AI with VDI | NVIDIA Technical Blog, accessed June 16, 2026, https://developer.nvidia.com/blog/spotlight-accelerating-into-ai-with-vdi/",
    "RAG tutorial: How to build a RAG system on a knowledge graph - Neo4j, accessed June 16, 2026, https://neo4j.com/blog/developer/rag-tutorial/",
    "How to Implement Graph RAG Using Knowledge Graphs and Vector Databases - Medium, accessed June 16, 2026, https://medium.com/data-science/how-to-implement-graph-rag-using-knowledge-graphs-and-vector-databases-60bb69a22759",
    "Intro to GraphRAG, accessed June 16, 2026, https://graphrag.com/concepts/intro-to-graphrag/",
    "How Microsoft GraphRAG Works Step-By-Step (Part 1/2) - Bertelsmann Tech Blog, accessed June 16, 2026, https://tech.bertelsmann.com/en/blog/articles/how-microsoft-graphrag-works-step-by-step-part-12",
    "GraphRAG & Knowledge Graphs: Making Your Data AI-Ready for 2026 | Fluree, accessed June 16, 2026, https://flur.ee/blog/graphrag-knowledge-graphs-making-your-data-ai-ready-for-2026",
    "GraphRAG on Consumer Hardware: Benchmarking Local LLMs for Healthcare EHR Schema Retrieval - arXiv, accessed June 16, 2026, https://arxiv.org/html/2605.20815v1",
    "Methods - GraphRAG - Microsoft Open Source, accessed June 16, 2026, https://microsoft.github.io/graphrag/index/methods/",
    "How Would Microsoft GraphRAG Work Alongside a Graph Database? - Memgraph, accessed June 16, 2026, https://memgraph.com/blog/how-microsoft-graphrag-works-with-graph-databases",
    "Why Regulated Industries (Pharma, Aerospace) Are Mandating Sovereign AI Stacks, accessed June 24, 2026, https://oxmaint.com/sap-integration/sovereign-ai-regulated-industries",
    "ArcAI Systems — Sovereign AI Operating System for Human-Machine Continuity, accessed June 24, 2026, https://arcai.systems/",
    "Ethernet: E-Line, E-LAN - Fusion Networks, accessed June 24, 2026, https://www.fusionnetworks.net/e-line/",
    "Metro Ethernet - DQE Communications, accessed June 24, 2026, https://dqe.com/metro-ethernet/",
    "NVIDIA L40S: Pricing, Specs, Best Uses & Where to Run (2026) - Fluence network, accessed June 24, 2026, https://www.fluence.network/blog/nvidia-l40s/",
    "Underground-Ops/underground-nexus - GitHub, accessed June 24, 2026, https://github.com/Underground-Ops/underground-nexus",
    "Metro Ethernet - Segra, accessed June 24, 2026, https://www.segra.com/wp-content/uploads/2024/11/SalesSheet_MetroEthernet_E-Line_2024.pdf",
    "Ethernet Services - Lumen Technologies, accessed June 24, 2026, https://www.lumen.com/en-us/services/ethernet.html",
    "13. General-Purpose Graphics Processing Unit (GPU) Library - Documentation, accessed June 24, 2026, https://doc.dpdk.org/guides/prog_guide/gpudev.html",
    "GPUNetIO Programming Guide - NVIDIA Docs, accessed June 24, 2026, https://docs.nvidia.com/doca/archive/doca-v2.2.0/gpunetio-programming-guide/index.html",
    "PCIe Traffic in DPDK Apps - Intel, accessed June 24, 2026, https://www.intel.com/content/www/us/en/docs/vtune-profiler/cookbook/2024-1/pcie-traffic-in-dpdk-apps.html",
    "L40S GPU for AI and Graphics Performance - NVIDIA, accessed June 24, 2026, https://www.nvidia.com/en-us/data-center/l40s/",
    "Boosting Inline Packet Processing Using DPDK and GPUdev with GPUs - NVIDIA Developer, accessed June 24, 2026, https://developer.nvidia.com/blog/optimizing-inline-packet-processing-using-dpdk-and-gpudev-with-gpus/",
    "How to Build Private AI Infrastructure for Healthcare (2026 Guide) - OneSource Cloud, accessed June 24, 2026, https://www.onesourcecloud.net/blog/private-ai-infrastructure-healthcare",
    "LiveKit for AI Agents — Real-Time Voice & Video AI Infrastructure | by Fora Soft - Medium, accessed June 24, 2026, https://forasoft.medium.com/livekit-for-ai-agents-real-time-voice-video-ai-infrastructure-17b83418f719",
    "Why WebRTC beats WebSockets for realtime voice AI - LiveKit, accessed June 24, 2026, https://livekit.com/blog/why-webrtc-beats-websockets-for-voice-ai-agents",
    "GitHub - livekit/portal: A Simple Transport Layer For Teleoperation And Inference, accessed June 24, 2026, https://github.com/livekit/portal",
    "Real-Time AI Voice Agents with Asterisk AudioSocket, accessed June 24, 2026, https://medium.com/@shubhanshutiwari74156/real-time-ai-voice-agents-with-asterisk-audiosocket-build-conversational-telephony-systems-in-4768a7a80a76",
    "How to build an AI voice agent with OpenAI Realtime API + Asterisk, accessed June 24, 2026, https://towardsai.net/p/machine-learning/how-to-build-an-ai-voice-agent-with-openai-realtime-api-asterisk-sip-2025-using-python-with-github-repo",
    "Channels - Asterisk Documentation, accessed June 24, 2026, https://docs.asterisk.org/Latest_API/API_Documentation/Asterisk_REST_Interface/Channels_REST_API/",
    "How Can Asterisk Play the Real-Time Audio Stream?, accessed June 24, 2026, https://community.asterisk.org/t/how-can-asterisk-play-the-real-time-audio-stream/105166",
    "Asterisk Community: stream both parties audio, accessed June 24, 2026, https://community.asterisk.org/t/hello-i-want-to-stream-both-the-parties-audio-separately-to-a-web-socket-for-real-time-transcription-and-diarization-speaker-labelling-i-am-able-to-record-the-audio-separately-using-monitor-for-both-agent-and-costumer-but-i-want-to-steam-the-audio/103197",
    "ARI ExternalMedia and slin format with 8 kHz 16 bit, accessed June 24, 2026, https://community.asterisk.org/t/ari-externalmedia-and-slin-format-with-8-khz-16-bit/97605",
    "Search Results: \"rmh\" - Planet Debian, accessed June 24, 2026, https://planet-search.debian.org/cgi-bin/search.cgi?terms=%22rmh%22",
    "Search Results: \"noodles\" - Planet Debian, accessed June 24, 2026, https://planet-search.debian.org/cgi-bin/search.cgi?terms=%22noodles%22",
    "sniffer/config/voipmonitor.conf at master - GitHub, accessed June 24, 2026, https://github.com/voipmonitor/sniffer/blob/master/config/voipmonitor.conf",
    "Guillaume MULLER's tips and tricks, accessed June 24, 2026, http://guillaumemuller1.free.fr/",
    "Casambi | Developer Site, accessed June 24, 2026, https://developer.casambi.com/",
    "How AoA & AoD changed the direction of Bluetooth® Location Services, accessed June 24, 2026, https://www.bluetooth.com/blog/new-aoa-aod-bluetooth-capabilities/",
    "UG103.18: Bluetooth Direction Finding Fundamentals - Silicon Labs, accessed June 24, 2026, https://www.silabs.com/documents/public/user-guides/ug103-18-bluetooth-direction-finding-fundamentals.pdf",
    "STM32WB0 Bluetooth® LE Direction Finding - stm32mcu - ST wiki, accessed June 24, 2026, https://wiki.st.com/stm32mcu/wiki/Connectivity:STM32WB0_Bluetooth_LE_Direction_Finding",
    "Bluetooth Direction Finding, accessed June 24, 2026, https://www.bluetooth.com/wp-content/uploads/Files/developer/RDF_Technical_Overview.pdf",
    "Bluetooth Location and Direction Finding - MATLAB & Simulink, accessed June 24, 2026, https://www.mathworks.com/help/bluetooth/ug/bluetooth-direction-finding.html",
    "GraphRAG with Qdrant and Neo4j, accessed June 24, 2026, https://qdrant.tech/documentation/examples/graphrag-qdrant-neo4j/",
    "Video Anomaly Detection Part 1: Architecture, Twelve Labs, and NVIDIA VSS - Qdrant, accessed June 24, 2026, https://qdrant.tech/documentation/tutorials-build-essentials/video-anomaly-edge-part-1/",
    "The GraphRAG Implementation Guide: From Zero to Production | by Aftab - Medium, accessed June 24, 2026, https://medium.com/@aftab001x/the-graphrag-implementation-guide-from-zero-to-production-c1f007590dc9",
    "How do NVIDIA's L40 and L40S GPUs compare to other NVIDIA GPUs in terms of security features?, accessed June 24, 2026, https://massedcompute.com/faq-answers/?question=How%20do%20NVIDIA%27s%20L40%20and%20L40S%20GPUs%20compare%20to%20other%20NVIDIA%20GPUs%20in%20terms%20of%20security%20features?",
    "What is Confidential Computing? | Secure Data Processing | OVHcloud, accessed June 24, 2026, https://www.ovhcloud.com/en/learn/what-is-confidential-computing/",
    "Compliance Training AI Agent for Healthcare | ibl.ai, accessed June 24, 2026, https://ibl.ai/solutions/medical-healthcare/agent/compliance-training-agent",
    "HIPAA Security Rule To Strengthen the Cybersecurity of Electronic Protected Health Information, accessed June 24, 2026, https://www.federalregister.gov/documents/2025/01/06/2024-30983/hipaa-security-rule-to-strengthen-the-cybersecurity-of-electronic-protected-health-information",
    "Protecting Radiology Data and Devices Against Cybersecurity Threats, accessed June 24, 2026, https://pmc.ncbi.nlm.nih.gov/articles/PMC13103043/",
    "Audit Trail Requirements: 21 CFR Part 11 Guide | Assyro AI, accessed June 24, 2026, https://www.assyro.com/blog/audit-trail-requirements-guide",
    "A Complete Checklist for 21 CFR Part 11 Compliance - eMaint, accessed June 24, 2026, https://www.emaint.com/blog/21-cfr-part-11-compliance-checklist/",
    "Guidance for Industry - Part 11, Electronic Records; Electronic Signatures — Scope and Application, accessed June 24, 2026, https://www.fda.gov/media/75414/download",
    "SEC Rule 17a-4: Electronic Recordkeeping Requirements Explained - Smarsh, accessed June 24, 2026, https://www.smarsh.com/regulations/sec-rule-17a-4-records-preservation/",
    "Books and Records | FINRA.org, accessed June 24, 2026, https://www.finra.org/rules-guidance/key-topics/books-records",
    "Communications Compliance | Call Monitoring & Analytics - Regulativ AI, accessed June 24, 2026, https://www.regulativ.ai/communications-compliance",
    "SEC 17a-4 Media Storage Requirements - Theta Lake, accessed June 24, 2026, https://thetalake.com/resources/regulations/sec-17a4/",
    "Can I load the vfio-pci module using a kernel parameter? : r/archlinux - Reddit, accessed June 24, 2026, https://www.reddit.com/r/archlinux/comments/acwv4n/can_i_load_the_vfiopci_module_using_a_kernel/",
    "The kernel's command-line parameters — The Linux Kernel documentation, accessed June 24, 2026, https://www.kernel.org/doc/html/v4.17/admin-guide/kernel-parameters.html",
    "Chapter 5. Important changes to external kernel parameters | 9.2 Release Notes | Red Hat Enterprise Linux, accessed June 24, 2026, https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/9.2_release_notes/kernel_parameters_changes",
    "PCI passthrough via OVMF - ArchWiki, accessed June 24, 2026, https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF",
    "Kernel 6.0 and VFIO - Heiko's Blog, accessed June 24, 2026, https://www.heiko-sieger.info/vfio-grub-vfio-pci-ids-doesnt-work-with-kernel-6-try-driver-verride-feature/"
  ],
  appendices: archivedSections,
  subscribe: {
    heading: "Subscribe to Specification Updates (RFC Logs)",
    placeholder: "sysadmin@enterprise.com",
    submitLabel: "[ INITIALIZE HANDSHAKE ]",
    layers: [
      "Layer 1: Core & Shell (Acoustics, Fiber, Power)",
      "Layer 2: Sovereign Edge Compute (PCIe, Hardware)",
      "Layer 3: Spatial Intelligence (Audio, BLE Mesh)",
      "Layer 4: Enterprise GraphRAG & Compliance",
    ],
    successMessage: "200 OK: Email registered.",
    errorMessage: "ERR: Handshake failed.",
  },
  footer: {
    publishedBy:
      "AI-Native Office Working Group | Armonk, New York",
    location: "Armonk, New York | 41.1265° N, 73.7140° W",
    links: [
      { label: "Security / PGP Key", href: "#", disabled: false },
      { label: "Architecture CAD Repo", href: "#", disabled: true },
    ],
  },
};
