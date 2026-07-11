/**
 * Signal Log model — the dated, numbered evidence ledger at `/signals/`.
 *
 * Each entry records a real-world event (news, market data, announcement)
 * that validates the specification's thesis. Publishing is git-based:
 * to add an entry, prepend a new object to `signalLog` with the next
 * `number` (numbers are chronological and permanent — never renumber),
 * then rebuild. The prerender emits the static page, sitemap entry, and
 * llms-full.txt appendix from this single source of truth. No code
 * changes are needed per entry.
 *
 * Entries use explicit outbound `sources` links — they are NOT run through
 * the whitepaper's inline citation tokenizer.
 */

/** An outbound source link for a ledger entry. */
export interface SignalSource {
  /** Human-readable label, e.g. `Gartner press release, Feb 9 2026`. */
  label: string;
  url: string;
}

/** One numbered entry in the evidence ledger. */
export interface SignalEntry {
  /**
   * Permanent ledger number, assigned chronologically (001 = first event
   * logged). Never reused or renumbered — the anchor `#log-NNN` and the
   * `EVIDENCE LOG // NNN` designation derive from it.
   */
  number: number;
  /** ISO date (YYYY-MM-DD) of the event being logged. */
  date: string;
  /** Short headline for the event. */
  headline: string;
  /** Event description: what happened and why it validates the thesis. */
  body: string;
  /** One or more outbound source links (verified before publishing). */
  sources: SignalSource[];
  /**
   * Ids of the whitepaper sections/appendices this event validates —
   * rendered as VALIDATES links to `/sections/<id>/`. Checked against the
   * real section registry at build time.
   */
  validatesSectionIds: string[];
}

/** Zero-padded 3-digit ledger designation, e.g. `007` → `"007"`. */
export function signalNumber(n: number): string {
  return String(n).padStart(3, "0");
}

/** Stable per-entry anchor id, e.g. `log-001` (shareable as `/signals#log-001`). */
export function signalAnchor(entry: Pick<SignalEntry, "number">): string {
  return `log-${signalNumber(entry.number)}`;
}

/** The full ledger designation line, e.g. `EVIDENCE LOG // 001`. */
export function signalDesignation(entry: Pick<SignalEntry, "number">): string {
  return `EVIDENCE LOG // ${signalNumber(entry.number)}`;
}

/**
 * All entries, newest first (render order for the page, llms-full.txt, and
 * any feed). Numbers are assigned in logging order, so the array is descending
 * by number; event dates may be non-monotonic (an event can be logged after a
 * more recent event was — e.g. // 006 is dated before // 005).
 */
export const signalLog: SignalEntry[] = [
  {
    number: 8,
    date: "2026-07-06",
    headline: "Fujitsu: 50% of enterprise AI inference workloads to execute locally by 2026",
    body: "Market projections by Fujitsu indicate a massive shift toward on-premises infrastructure to avoid the \"Cloud Egress Trap.\" The report forecasts that by 2026, half of all enterprise AI inference workloads will execute entirely locally, and by 2028, 60% of multinational firms will distribute their AI stacks across sovereign zones. This validates the fundamental economic and compliance drivers for maintaining an immutable audit trail on local hardware rather than relying on standard hyperscaler topologies.",
    sources: [
      {
        label: "Fujitsu Impact Series — Sovereign AI in the enterprise: Compliance and control in multi-cloud",
        url: "https://mkt-europe.global.fujitsu.com/FujitsuImpactSeries/AI-Sovereignty",
      },
    ],
    validatesSectionIds: ["economics", "compliance"],
  },
  {
    number: 7,
    date: "2026-07-01",
    headline: "SenseNova releases localized Agent OS models for full-loop office productivity",
    body: "The open-source and local-compute communities established a new baseline for the AI-Native Office with the release of the SenseNova 6.7 Flash and U1 localized architectures. Bundled into client interfaces like Raccoon, these models plug directly into agent runtimes to execute multi-file data analysis, formal reporting, and autonomous infographic generation entirely locally. This establishes a new operational paradigm: cloud models are reserved for specific heavy reasoning, while the local Agent OS securely observes context and executes enterprise tasks natively.",
    sources: [
      {
        label: "GitHub — Modular SenseNova skills for building AI-powered office assistants",
        url: "https://github.com/OpenSenseNova/SenseNova-Skills",
      },
      {
        label: "GitHub — SenseNova 6.7 Flash-Lite",
        url: "https://github.com/OpenSenseNova/SenseNova6.7",
      },
    ],
    validatesSectionIds: ["architecture", "ceiling"],
  },
  {
    number: 6,
    date: "2026-06-25",
    headline: "Serial entrepreneur allocates $30M to Neo, an AI-native enterprise platform",
    body: "Validating the premise that legacy office suites must be structurally rebuilt rather than retrofitted, serial entrepreneur Bhavin Turakhia invested $30 million of personal capital into \"Neo.\" Operating as a model-agnostic, AI-first alternative designed to directly challenge legacy incumbents, Neo highlights the market shift from \"prompt engineering\" to \"Context Engineering.\" This capital allocation underscores the growing enterprise conviction that knowledge work requires platforms built natively for continuous, autonomous orchestration.",
    sources: [
      {
        label: "Apple Podcasts — Bhavin Turakhia's $30M Bet on Neo: AI-Native Office Suite",
        url: "https://podcasts.apple.com/us/podcast/bhavin-turakhias-%2430m-bet-on-neo-ai-native-office-suite/id1888321433?i=1000775222294&l=vi",
      },
      {
        label: "Windows Forum — Neo by Bhavin Turakhia: AI-Native Office Suite Built on Agent Architecture",
        url: "https://windowsforum.com/threads/neo-by-bhavin-turakhia-ai-native-office-suite-built-on-agent-architecture.433258/",
      },
    ],
    validatesSectionIds: ["economics", "ceiling"],
  },
  {
    number: 5,
    date: "2026-06-30",
    headline: "Palantir and NVIDIA put Nemotron open models inside sovereign environments",
    body: "Palantir and NVIDIA expanded their jointly published Sovereign AI Operating System reference architecture with a production engine for deploying NVIDIA Nemotron open models entirely inside sovereign, closed environments — open-weight frontier models running where the data lives, with no external inference path. The two companies that define the frontier of AI deployment are now shipping a named reference architecture for exactly the deployment model this specification describes: sovereign inference as production infrastructure, not compliance workaround.",
    sources: [
      {
        label: "NVIDIA blog — Open Models, Closed Environments (Jun 2026)",
        url: "https://blogs.nvidia.com/blog/palantir-secure-ai-us-agencies-nemotron-open-models/",
      },
      {
        label: "Business Wire — Palantir launches Nemotron sovereign deployment engine (Jun 29, 2026)",
        url: "https://www.businesswire.com/news/home/20260629390275/en/Palantir-Launches-Engine-for-Deploying-NVIDIA-Nemotron-Open-Models-in-Sovereign-Environments",
      },
      {
        label: "Palantir — Sovereign AI OS reference architecture",
        url: "https://www.palantir.com/sovereignaios/",
      },
    ],
    validatesSectionIds: ["ceiling", "architecture"],
  },
  {
    number: 4,
    date: "2026-06-09",
    headline: "Broadcom: 83% of enterprises weigh cloud repatriation; 50% have already moved workloads",
    body: "Broadcom's Private Cloud Outlook 2026 — a survey of 1,800 senior IT decision-makers — reports that 83% of enterprises are considering repatriating workloads from public to private cloud and 50% have already done so, with cost predictability now the second biggest repatriation driver. 97% of IT leaders believe some of their public cloud spend is wasted. The report's central finding: production AI inference is shifting decisively to private infrastructure. The repatriation wave the specification's economics section predicts is now the measured enterprise mainstream.",
    sources: [
      {
        label: "Broadcom — Private Cloud Outlook 2026 press release (Jun 9, 2026)",
        url: "https://news.broadcom.com/releases/broadcom-private-cloud-outlook-2026",
      },
    ],
    validatesSectionIds: ["economics", "ceiling"],
  },
  {
    number: 3,
    date: "2026-06-08",
    headline: "UK commits £1.1 billion to sovereign AI compute and chip capability",
    body: "At London Tech Week, the UK government announced a £1.1 billion plan to back domestic chip firms, expand national computing power, and build sovereign AI capability — state-level capital allocated to the premise that AI infrastructure under one's own physical and legal control is a strategic necessity, not a preference. When governments underwrite sovereign compute at the national scale, the same logic applies with equal force to the regulated institutions this specification addresses.",
    sources: [
      {
        label: "GOV.UK — £1.1 billion AI hardware and skills plan (Jun 8, 2026)",
        url: "https://www.gov.uk/government/news/a-decisive-shift-to-power-british-ai-new-11-billion-plan-to-back-chip-firms-boost-computing-power-and-skills-for-the-ai-revolution",
      },
    ],
    validatesSectionIds: ["ceiling", "compliance"],
  },
  {
    number: 2,
    date: "2026-02-09",
    headline: "Gartner: worldwide sovereign cloud IaaS spending to total $80 billion in 2026",
    body: "Gartner forecasts that worldwide spending on sovereign cloud infrastructure-as-a-service will total $80 billion in 2026, with European spending on sovereign cloud infrastructure set to triple between 2025 and 2027. Sovereignty is no longer a niche procurement criterion — it is an $80 billion annual market category, growing fastest exactly where regulatory obligation is strictest.",
    sources: [
      {
        label: "Gartner press release (Feb 9, 2026)",
        url: "https://www.gartner.com/en/newsroom/press-releases/2026-02-09-gartner-says-worldwide-sovereign-cloud-iaas-spending-will-total-us-dollars-80-billion-in-2026",
      },
    ],
    validatesSectionIds: ["ceiling", "compliance"],
  },
  {
    number: 1,
    date: "2026-02-04",
    headline: "Lenovo TCO study: on-prem GenAI breaks even in under four months at high utilization",
    body: "Lenovo Press published the 2026 edition of its on-premise-vs-cloud generative AI total-cost-of-ownership study. For sustained inference workloads, owned infrastructure reaches breakeven against hyperscale cloud in under four months — compressed from 12–18 month cycles in prior hardware generations — and the study's token-economics framework finds up to an 18x cost advantage per million tokens versus Model-as-a-Service APIs. A system used just ~4.3 hours per day beats renting. This is the depreciating-capital-asset arithmetic of the specification's economics section, independently quantified by a tier-one OEM.",
    sources: [
      {
        label: "Lenovo Press — GenAI TCO, 2026 Edition (Feb 4, 2026)",
        url: "https://lenovopress.lenovo.com/lp2368-on-premise-vs-cloud-generative-ai-total-cost-of-ownership-2026-edition",
      },
    ],
    validatesSectionIds: ["economics", "egress"],
  },
];
