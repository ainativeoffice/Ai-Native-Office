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
 * The single harmonized OpenGraph/Twitter card. The monogram is the exact mark
 * from public/icon.svg, re-colored into the brand palette, so the favicon and
 * the share card are visibly the same identity. Query params let sub-pages
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
            <svg width="72" height="72" viewBox="0 0 180 180" fill="none">
              <g style={{ transform: "scale(0.95)", transformOrigin: "center" }}>
                <path
                  fill={PAPER}
                  d="M101.141 53H136.632C151.023 53 162.689 64.6662 162.689 79.0573V112.904H148.112V79.0573C148.112 78.7105 148.098 78.3662 148.072 78.0251L112.581 112.898C112.701 112.902 112.821 112.904 112.941 112.904H148.112V126.672H112.941C98.5504 126.672 86.5638 114.891 86.5638 100.5V66.7434H101.141V100.5C101.141 101.15 101.191 101.792 101.289 102.422L137.56 66.7816C137.255 66.7563 136.945 66.7434 136.632 66.7434H101.141V53Z"
                />
                <path
                  fill={PAPER}
                  d="M65.2926 124.136L14 66.7372H34.6355L64.7495 100.436V66.7372H80.1365V118.47C80.1365 126.278 70.4953 129.958 65.2926 124.136Z"
                />
              </g>
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
