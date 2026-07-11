import { ImageResponse } from "next/og";
import { content } from "@/lib/content/content";
import { SITE_NAME, SITE_URL, specMetaLabel } from "@/lib/content/spec";
import { OG_IMAGE } from "@/lib/seo";

export const runtime = "nodejs";
// Dynamic so per-page query params (title/subtitle/eyebrow/label) are honored;
// crawlers fetch this on demand and CDNs cache by full URL.
export const dynamic = "force-dynamic";

// Brand palette — mirrors the design tokens in app/globals.css so the social
// card, the favicon, and the live site all read as one identity.
const PAPER = "#f3efe5";
const CARD = "#faf7ef";
const INK = "#211f1a";
const RUST = "#b64b2a";
const MUTED = "#6d685e";
const BORDER = "#c8bead";

const DOMAIN = SITE_URL.replace(/^https?:\/\//, "");

/**
 * The single harmonized OpenGraph/Twitter card. The Room Network emblem is the
 * exact geometry from public/ainativeoffice-icon.svg, adapted to the card's
 * dark field so the favicon and share card visibly share one identity. Query
 * params let sub-pages
 * supply their own eyebrow/title/label while inheriting the same frame.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eyebrow = (searchParams.get("eyebrow") || SITE_NAME).slice(0, 48);
  const title = (searchParams.get("title") || content.hero.title).slice(0, 120);
  const subtitle = (searchParams.get("subtitle") || content.hero.subtitle || "").slice(0, 160);
  const label = (searchParams.get("label") || specMetaLabel()).slice(0, 64);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          // Subtle engineering grid, echoing the site's background.
          backgroundImage: `linear-gradient(to right, ${BORDER}40 1px, transparent 1px), linear-gradient(to bottom, ${BORDER}2b 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Rust top rule — the accent used throughout the spec. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: RUST,
          }}
        />

        {/* Header: monogram + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              width: 108,
              height: 108,
              borderRadius: 22,
              background: INK,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
              <path
                d="M19 11H11v8M45 11h8v8M53 45v8h-8M19 53h-8v-8"
                stroke={PAPER}
                strokeWidth="5"
                strokeLinecap="square"
              />
              <path d="M32 19v8M45 32h-8M32 45v-8M19 32h8" stroke={PAPER} strokeWidth="3" />
              <circle cx="32" cy="16" r="3" fill={PAPER} />
              <circle cx="48" cy="32" r="3" fill={PAPER} />
              <circle cx="32" cy="48" r="3" fill={PAPER} />
              <circle cx="16" cy="32" r="3" fill={PAPER} />
              <rect x="26" y="26" width="12" height="12" rx="2" fill={RUST} />
              <rect x="29" y="29" width="6" height="6" rx="1" fill={PAPER} />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: RUST,
              }}
            >
              {eyebrow}
            </div>
            <div style={{ fontSize: 22, color: MUTED, marginTop: 4 }}>{DOMAIN}</div>
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1000 }}>
          <div
            style={{
              fontSize: title.length > 60 ? 68 : 84,
              fontWeight: 700,
              lineHeight: 1.05,
              color: INK,
              letterSpacing: -1.5,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 34, color: MUTED, marginTop: 28, lineHeight: 1.3 }}>
            {subtitle}
          </div>
        </div>

        {/* Footer: status pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "12px 22px",
              fontSize: 24,
              fontWeight: 600,
              color: INK,
            }}
          >
            {label}
          </div>
        </div>
      </div>
    ),
    {
      width: OG_IMAGE.width,
      height: OG_IMAGE.height,
    },
  );
}
