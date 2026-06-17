/**
 * Wireframe blueprint of the Sovereign Enclave — a top-down floor plan rendered
 * as thin-stroke line art in safety orange. Strokes/fills use `currentColor`
 * (set to #FF5F1F by the wrapper) so the print stylesheet's global black-on-white
 * rule auto-inverts it to a clean black blueprint when the paper is exported.
 * Inlined as JSX so it appears in the prerendered/SSR HTML.
 */
export function ArchitectureBlueprint() {
  return (
    <figure className="my-12 border border-border bg-card p-4 md:p-8">
      <svg
        viewBox="0 0 800 520"
        role="img"
        aria-label="Top-down architectural blueprint of the Sovereign Enclave: a hardened room showing the ceiling sensor grid, STC 55 acoustic perimeter shield, dedicated E-Line fiber conduit, and PCIe edge node hardware vault."
        className="blueprint-svg w-full h-auto text-[#FF5F1F]"
        fill="none"
        stroke="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          fontFamily="'JetBrains Mono', monospace"
          fill="currentColor"
          stroke="none"
        >
          <text x="40" y="36" fontSize="13" letterSpacing="3">
            FIG. 1 — SOVEREIGN ENCLAVE / HARDENED SHELL (PLAN VIEW)
          </text>
        </g>

        {/* Acoustic perimeter shield: double-line wall = STC 55 decoupled assembly */}
        <rect x="60" y="70" width="680" height="380" strokeWidth="1.5" />
        <rect
          x="74"
          y="84"
          width="652"
          height="352"
          strokeWidth="1"
          strokeDasharray="2 5"
          opacity="0.7"
        />

        {/* Ceiling sensor grid: regular array of crosshair sensor nodes */}
        <g strokeWidth="1" opacity="0.85">
          {[170, 290, 410, 530].map((cy) =>
            [200, 330, 460, 590].map((cx) => (
              <g key={`${cx}-${cy}`}>
                <line x1={cx - 9} y1={cy} x2={cx + 9} y2={cy} />
                <line x1={cx} y1={cy - 9} x2={cx} y2={cy + 9} />
                <circle cx={cx} cy={cy} r="4" />
              </g>
            )),
          )}
        </g>

        {/* Hardware vault: PCIe edge node enclosure, lower-right */}
        <rect x="560" y="330" width="150" height="90" strokeWidth="1.5" />
        <line x1="560" y1="352" x2="710" y2="352" strokeWidth="1" />
        <rect x="574" y="364" width="40" height="42" strokeWidth="1" opacity="0.8" />
        <rect x="624" y="364" width="40" height="42" strokeWidth="1" opacity="0.8" />
        <rect x="674" y="364" width="22" height="42" strokeWidth="1" opacity="0.8" />

        {/* Dedicated E-Line fiber conduit entering the shell */}
        <path
          d="M0 250 L60 250 L60 250 L200 250"
          strokeWidth="1.5"
          strokeDasharray="10 6"
        />
        <circle cx="200" cy="250" r="6" strokeWidth="1.5" />

        {/* Labels with leader lines */}
        <g
          fontFamily="'JetBrains Mono', monospace"
          fontSize="11"
          letterSpacing="1.5"
          fill="currentColor"
          stroke="none"
        >
          {/* Ceiling Sensor Grid */}
          <text x="190" y="150">CEILING SENSOR GRID</text>
          <text x="190" y="166" opacity="0.7">[SHURE / CASAMBI]</text>

          {/* STC 55 perimeter shield */}
          <text x="74" y="478">STC 55 ACOUSTIC PERIMETER SHIELD</text>

          {/* E-Line conduit */}
          <text x="10" y="238">DEDICATED E-LINE</text>
          <text x="10" y="278" opacity="0.7">FIBER CONDUIT</text>

          {/* PCIe Edge Node vault */}
          <text x="560" y="320">PCIe EDGE NODE</text>
          <text x="560" y="442" opacity="0.7">[HARDWARE VAULT]</text>
        </g>
      </svg>
      <figcaption className="mt-4 border-t border-border pt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Plan view — not to scale. Acoustic, network, and compute layers of the hardened shell.
      </figcaption>
    </figure>
  );
}
