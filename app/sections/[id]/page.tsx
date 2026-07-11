import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { sectionPages, getSectionPage, getAdjacentPages } from "@/lib/content/sectionPages";
import { SectionBody } from "@/components/whitepaper/WhitepaperBody";
import { ShareLinks } from "@/components/ShareLinks";
import { BackToTop } from "@/components/BackToTop";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return sectionPages.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const page = getSectionPage(id);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.description,
    alternates: { canonical: page.url },
    openGraph: {
      title: page.metaTitle,
      description: page.description,
      url: page.url,
      type: "article",
    },
  };
}

export default async function SectionPage({ params }: Props) {
  const { id } = await params;
  const page = getSectionPage(id);
  if (!page) notFound();

  const { prev, next } = getAdjacentPages(id);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-border px-7 py-5 flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em]">
        <Link
          href="/"
          className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          &larr; AI-Native Office
        </Link>
        <div className="hidden sm:block text-border/70">
          {page.isAppendix ? `Appendix ${page.appendixLetter}` : "Section"}
        </div>
        <ShareLinks />
      </header>

      <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto px-7 py-20 md:px-12 lg:px-16">
        {/* Eyebrow */}
        <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {page.isAppendix ? (
            <>Appendix {page.appendixLetter}</>
          ) : (
            <>The AI-Native Office — Specification</>
          )}
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-serif font-medium leading-tight tracking-[-0.02em] mb-14 text-foreground text-balance">
          {page.title}
        </h1>

        {/* Body */}
        <SectionBody
          section={page.section}
          subheading="h2"
          appendixHref={(aId) => `/sections/${aId}/`}
        />

        {/* Prev / Next navigation */}
        <nav
          aria-label="Section navigation"
          className="mt-28 pt-10 border-t border-border grid grid-cols-2 gap-8 font-mono text-xs uppercase tracking-[0.18em]"
        >
          <div>
            {prev && (
              <Link
                href={prev.path}
                className="group flex flex-col gap-3 text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="text-border/70 group-hover:text-primary/60">&larr; Prev</span>
                <span className="normal-case tracking-normal font-serif text-base text-foreground/80 group-hover:text-primary leading-snug">
                  {prev.navLabel}
                </span>
              </Link>
            )}
          </div>
          <div className="flex flex-col items-end text-right">
            {next && (
              <Link
                href={next.path}
                className="group flex flex-col gap-3 text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="text-border/70 group-hover:text-primary/60">Next &rarr;</span>
                <span className="normal-case tracking-normal font-serif text-base text-foreground/80 group-hover:text-primary leading-snug">
                  {next.navLabel}
                </span>
              </Link>
            )}
          </div>
        </nav>

        {/* Back to full paper */}
        <div className="mt-12 flex justify-center">
          <Link
            href={`/#${page.anchor}`}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground border border-border px-6 py-4 transition-colors hover:text-primary hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            [ View in Full Paper ]
          </Link>
        </div>
      </main>

      <BackToTop />
    </div>
  );
}
