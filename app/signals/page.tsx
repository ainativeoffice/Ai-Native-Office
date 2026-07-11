import Link from "next/link";
import type { Metadata } from "next";
import {
  signalEntries,
  signalAnchor,
  signalDesignation,
  SIGNALS_META_TITLE,
  SIGNALS_TITLE,
  SIGNALS_DESCRIPTION,
  SIGNALS_URL,
} from "@/lib/content/signalsPage";
import { getSectionPage } from "@/lib/content/sectionPages";
import { ShareLinks } from "@/components/ShareLinks";
import { SocialLinks } from "@/components/SocialLinks";
import { BackToTop } from "@/components/BackToTop";
import { JsonLd } from "@/components/JsonLd";
import { collectionPageLd, breadcrumbLd, jsonLdGraph, ogImageFor } from "@/lib/seo";
import { SITE_NAME } from "@/lib/content/spec";

const ogImage = ogImageFor({
  title: SIGNALS_TITLE,
  subtitle: SIGNALS_DESCRIPTION,
  eyebrow: `${SITE_NAME} · Log`,
});

export const metadata: Metadata = {
  title: SIGNALS_META_TITLE,
  description: SIGNALS_DESCRIPTION,
  alternates: { canonical: SIGNALS_URL },
  openGraph: {
    title: SIGNALS_META_TITLE,
    description: SIGNALS_DESCRIPTION,
    url: SIGNALS_URL,
    type: "website",
    images: [{ url: ogImage.url, width: ogImage.width, height: ogImage.height, alt: ogImage.alt }],
  },
  twitter: { card: "summary_large_image", title: SIGNALS_META_TITLE, description: SIGNALS_DESCRIPTION, images: [ogImage.url] },
};

export default function SignalsPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <JsonLd
        data={jsonLdGraph([
          collectionPageLd({
            url: SIGNALS_URL,
            name: SIGNALS_META_TITLE,
            description: SIGNALS_DESCRIPTION,
            numberOfItems: signalEntries.length,
          }),
          breadcrumbLd([{ name: SIGNALS_TITLE, url: SIGNALS_URL }]),
        ])}
      />
      {/* Top bar */}
      <header className="border-b border-border px-7 py-5 flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em]">
        <Link
          href="/"
          className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
        >
          &larr; AI-Native Office
        </Link>
        <span className="hidden sm:block text-border">Signal Log</span>
        <ShareLinks />
      </header>

      <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto px-7 py-20 md:px-12 md:py-24 lg:px-16">
        {/* Header */}
        <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          The AI-Native Office
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[0.98] tracking-[-0.04em] mb-6 text-foreground">
          Signal Log
        </h1>
        <p className="mb-20 max-w-2xl font-serif italic text-lg leading-[1.7] text-foreground/70">
          {SIGNALS_DESCRIPTION}
        </p>

        {/* Legend */}
        <div className="mb-12 border border-border bg-card/50 px-6 py-5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground flex flex-wrap gap-x-7 gap-y-2">
          <span>
            <span className="text-primary">Evidence Log // NNN</span> — numbered ledger entry
          </span>
          <span>Signal type — category</span>
        </div>

        {/* Entries */}
        <ol className="flex flex-col divide-y divide-border border-b border-border">
          {signalEntries.map((entry) => {
            const anchor = signalAnchor(entry);
            const designation = signalDesignation(entry);
            const validates = entry.validatesSectionIds
              .map((id) => getSectionPage(id))
              .filter(Boolean);

            return (
              <li
                key={entry.number}
                id={anchor}
                  className="scroll-mt-8 py-12 px-1"
              >
                {/* Designation + date */}
                <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                  <a
                    href={`#${anchor}`}
                    aria-label={`Permalink: ${designation}`}
                      className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary transition-opacity hover:opacity-70"
                  >
                    {designation}
                  </a>
                  <time
                    dateTime={entry.date}
                    className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
                  >
                    {new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>

                {/* Headline */}
                  <h2 className="mb-5 font-serif text-2xl font-medium tracking-[-0.015em] text-foreground leading-snug">
                    {entry.headline}
                  </h2>

                  {/* Summary */}
                  <p className="mb-7 font-serif text-base leading-[1.7] text-foreground/80">
                  {entry.body}
                </p>

                {/* Sources */}
                <div className="mb-5">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-border">
                    Sources
                  </div>
                  <ul className="flex flex-col gap-2">
                    {entry.sources.map((src, i) => (
                      <li key={i}>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener external"
                          className="font-mono text-xs text-muted-foreground underline decoration-border decoration-dotted underline-offset-3 transition-colors hover:text-primary hover:decoration-primary break-words"
                        >
                          {src.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Validates */}
                {validates.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-border">
                      Validates:
                    </span>
                    {validates.map((sp) => (
                      <Link
                        key={sp!.id}
                        href={sp!.path}
                        className="font-mono text-[10px] uppercase tracking-widest border border-border px-2 py-1 text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
                      >
                        {sp!.navLabel}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-6 font-mono text-xs text-muted-foreground">
          <SocialLinks />
          <Link href="/" className="transition-colors hover:text-primary">
            [ View Full Specification ]
          </Link>
        </footer>
      </main>

      <BackToTop />
    </div>
  );
}
