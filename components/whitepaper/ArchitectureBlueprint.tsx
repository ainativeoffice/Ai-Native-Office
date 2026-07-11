/**
 * Architecture Blueprint — a schematic diagram rendered as structured HTML/CSS.
 * Shows the three-party sovereign compute topology: Landlord → Tenant → Software Integrator.
 */
export function ArchitectureBlueprint() {
  return (
    <figure className="my-12 border border-border bg-card/20">
      <div className="border-b border-border px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        ▚ Tripartite Architecture — Sovereign Compute Topology
      </div>

      <div className="p-6 md:p-8">
        {/* Three layers */}
        <div className="flex flex-col gap-px border border-border bg-border">

          {/* Layer 1: Landlord */}
          <div className="bg-background p-5">
            <div className="flex items-start gap-4">
              <div className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5F1F] w-24">
                Layer I
              </div>
              <div>
                <div className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground mb-1">
                  The Landlord
                </div>
                <div className="font-mono text-xs text-muted-foreground leading-relaxed">
                  STC 55 hardened shell · E-Line Private Network · Power / cooling envelope
                </div>
                <div className="mt-2 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                  Access: Physical shell only. Zero access to compute or data streams.
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="bg-border flex items-center justify-center py-px">
            <div className="bg-background w-full py-1 flex justify-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                ↓ isolated ↓
              </span>
            </div>
          </div>

          {/* Layer 2: Tenant */}
          <div className="bg-background p-5">
            <div className="flex items-start gap-4">
              <div className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5F1F] w-24">
                Layer II
              </div>
              <div>
                <div className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground mb-1">
                  The Tenant
                </div>
                <div className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Sovereign silicon (e.g. NVIDIA L40S cluster) · Cryptographic enclave · Physical custody
                </div>
                <div className="mt-2 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                  Access: Exclusive legal title. No shared compute pool.
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="bg-border flex items-center justify-center py-px">
            <div className="bg-background w-full py-1 flex justify-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                ↓ isolated ↓
              </span>
            </div>
          </div>

          {/* Layer 3: Software Integrator */}
          <div className="bg-background p-5">
            <div className="flex items-start gap-4">
              <div className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5F1F] w-24">
                Layer III
              </div>
              <div>
                <div className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground mb-1">
                  The Software Integrator
                </div>
                <div className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Localized orchestration layer · Ambient telemetry pipeline · Inference runtime
                </div>
                <div className="mt-2 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                  Access: Connective tissue only. No external transmission of unencrypted inference data.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invariant */}
        <div className="mt-4 border border-border px-5 py-4 font-mono text-xs text-muted-foreground leading-relaxed bg-card/40">
          <strong className="text-foreground font-semibold uppercase tracking-wider">Governance invariant:</strong>{" "}
          Each party holds exactly what it owns. Departure from compliance requires a physical act, not a software policy change.
        </div>
      </div>

      <figcaption className="border-t border-border px-6 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60">
        Figure: Three-party separation of duties. No single party has access to what belongs to another.
      </figcaption>
    </figure>
  );
}
