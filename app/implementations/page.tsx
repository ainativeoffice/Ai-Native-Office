import Link from "next/link";
import type { Metadata } from "next";
import {
  implementationEntries,
  IMPLEMENTATIONS_META_TITLE,
  IMPLEMENTATIONS_TITLE,
  IMPLEMENTATIONS_DESCRIPTION,
  IMPLEMENTATIONS_URL,
} from "@/lib/content/implementations";
import { getSectionPage } from "@/lib/content/sectionPages";
import { ShareLinks } from "@/components/ShareLinks";
import { SocialLinks } from "@/components/SocialLinks";
import { BackToTop } from "@/components/BackToTop";
import { JsonLd } from "@/components/JsonLd";
import { collectionPageLd, breadcrumbLd, jsonLdGraph, ogImageFor } from "@/lib/seo";
import { SITE_NAME } from "@/lib/content/spec";

const ogImage = ogImageFor({
  title: IMPLEMENTATIONS_TITLE,
  subtitle: IMPLEMENTATIONS_DESCRIPTION,
  eyebrow: `${SITE_NAME} · Registry`,
});

export const metadata: Metadata = {
  title: IMPLEMENTATIONS_META_TITLE,
  description: IMPLEMENTATIONS_DESCRIPTION,
  alternates: { canonical: IMPLEMENTATIONS_URL },
  openGraph: {
    title: IMPLEMENTATIONS_META_TITLE,
    description: IMPLEMENTATIONS_DESCRIPTION,
    url: IMPLEMENTATIONS_URL,
    type: "website",
    images: [{ url: ogImage.url, width: ogImage.width, height: ogImage.height, alt: ogImage.alt }],
  },
  twitter: { card: "summary_large_image", title: IMPLEMENTATIONS_META_TITLE, description: IMPLEMENTATIONS_DESCRIPTION, images: [ogImage.url] },
};

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ImplementationsPage() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <JsonLd
        data={jsonLdGraph([
          collectionPageLd({
            url: IMPLEMENTATIONS_URL,
            name: IMPLEMENTATIONS_META_TITLE,
            description: IMPLEMENTATIONS_DESCRIPTION,
            numberOfItems: implementationEntries.length,
          }),
          breadcrumbLd([{ name: IMPLEMENTATIONS_TITLE, url: IMPLEMENTATIONS_URL }]),
        ])}
      />
      {/* Top bar */}
      <header className="border-b border-border px-7 py-5 flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em]">
        <Link
          href="/"
          className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          &larr; AI-Native Office
        </Link>
        <span className="hidden sm:block text-border/80">Implementation Registry</span>
        <ShareLinks />
      </header>

      <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto px-7 py-20 md:px-12 md:py-24 lg:px-16">
        {/* Header */}
        <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          The AI-Native Office
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[0.98] tracking-[-0.04em] mb-6 text-foreground">
          Implementation Registry
        </h1>
        <p className="mb-10 max-w-2xl font-serif italic text-lg leading-[1.7] text-foreground/70">
          {IMPLEMENTATIONS_DESCRIPTION}
        </p>

        {/* Non-normative notice */}
        <div className="mb-16 border border-border bg-card/50 p-6 md:p-7">
          <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-primary">
            Informative / Non-Normative
          </div>
          <p className="max-w-3xl font-serif text-base leading-[1.7] text-foreground/80">
            The AI-Native Office specification is vendor-, property-, and operator-agnostic. The
            entries below document independent environments where principles related to this
            specification are being explored or deployed. Inclusion does not indicate certification,
            conformance, or endorsement. The registry is open to unaffiliated third-party
            implementations — see the submission note at the end of this page.
          </p>
        </div>

        {/* Entries */}
        <ol className="flex flex-col divide-y divide-border border-b border-border">
          {implementationEntries.map((entry) => {
            const related = entry.relatedSectionIds
              .map((id) => getSectionPage(id))
              .filter(Boolean);

            return (
              <li key={entry.id} id={entry.id} className="scroll-mt-8 py-12 px-1">
                {/* Status + last verified */}
                <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {entry.status}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    {entry.review}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-border">
                    Verified {formatDate(entry.lastVerified)}
                  </span>
                </div>

                {/* Name */}
                <h2 className="mb-2 font-serif text-2xl font-medium tracking-[-0.015em] text-foreground leading-snug">
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener external"
                    className="transition-colors hover:text-primary"
                  >
                    {entry.name}
                  </a>
                </h2>

                {/* Meta line */}
                <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span>{entry.kind}</span>
                  <span aria-hidden className="text-border">·</span>
                  <span>{entry.location}</span>
                  <span aria-hidden className="text-border">·</span>
                  <span>Operator: {entry.operator}</span>
                  {entry.founder && (
                    <>
                      <span aria-hidden className="text-border">·</span>
                      <span>Founder: {entry.founder}</span>
                    </>
                  )}
                </div>

                {/* Summary */}
                <p className="mb-5 max-w-3xl font-serif text-base leading-[1.7] text-foreground/80">
                  {entry.summary}
                </p>

                {/* External identity links */}
                <div className="mb-7 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-widest">
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener external"
                    aria-label={`${entry.name} website`}
                    className="text-muted-foreground underline decoration-border decoration-dotted underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
                  >
                    Website
                  </a>
                  {entry.linkedinUrl && (
                    <a
                      href={entry.linkedinUrl}
                      target="_blank"
                      rel="noopener external"
                      aria-label={`${entry.name} on LinkedIn`}
                      className="text-muted-foreground underline decoration-border decoration-dotted underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>

                {/* Related sections */}
                {related.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-border">
                      Relates to:
                    </span>
                    {related.map((sp) => (
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

        {/* Submission note */}
        <section className="mt-16 border border-border bg-card/50 p-6 md:p-7">
          <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
            Submit an Implementation
          </div>
          <p className="max-w-3xl font-serif text-base leading-[1.7] text-foreground/80">
            This registry is not restricted to affiliated organizations. Any operator deploying an
            environment that engages the principles in this specification may request inclusion.
            Entries record self-declared maturity until an independent conformance model is published.
            To propose an entry, contact the specification authors listed on the{" "}
            <Link href="/" className="text-primary underline decoration-border/60 underline-offset-4 hover:decoration-primary">
              full specification
            </Link>
            .
          </p>
        </section>

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
