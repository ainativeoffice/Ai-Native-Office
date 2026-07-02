import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { content } from "@/content";
import { SectionBody } from "@/components/WhitepaperBody";
import { AssistantPanel } from "@/components/AssistantPanel";
import { SocialLinks } from "@/components/SocialLinks";
import NotFound from "@/pages/not-found";
import { getSectionPage, getAdjacentPages, type SectionPageInfo } from "@/lib/sectionPages";

const base = import.meta.env.BASE_URL;

function kicker(page: SectionPageInfo): string {
  return page.isAppendix ? `Appendix ${page.appendixLetter}` : "Section";
}

function NavCard({ page, direction }: { page: SectionPageInfo; direction: "prev" | "next" }) {
  return (
    <Link
      href={page.path}
      className={`group flex flex-1 flex-col gap-2 border border-border p-5 transition-colors hover:border-primary hover:bg-card/40 ${
        direction === "next" ? "items-end text-right" : "items-start"
      }`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {direction === "prev" ? "← Previous" : "Next →"}
      </span>
      <span className="font-serif text-lg font-semibold text-foreground/90 transition-colors group-hover:text-primary">
        {page.isAppendix ? `Appendix ${page.appendixLetter}: ${page.navLabel}` : page.navLabel}
      </span>
    </Link>
  );
}

export default function SectionPage() {
  const params = useParams<{ id: string }>();
  const page = getSectionPage(params.id ?? "");

  useEffect(() => {
    if (page) {
      document.title = page.metaTitle;
      // ScrollToHash (App) handles hash targets after client-side navigation.
      if (!window.location.hash) window.scrollTo(0, 0);
    }
  }, [page]);

  if (!page) return <NotFound />;

  const { prev, next } = getAdjacentPages(page.id);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl px-6 py-12 md:px-10 md:py-16 lg:py-20 pb-28 md:pb-28 lg:pb-28">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="no-print mb-16 border-b border-border pb-6">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <li>
              <Link href="/" className="underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary">
                The AI-Native Office
              </Link>
            </li>
            <li aria-hidden="true" className="text-border">/</li>
            <li className="text-foreground/80">{page.navLabel}</li>
          </ol>
        </nav>

        {/* Section header */}
        <header className="mb-16 border-b border-border pb-12">
          <div className="mb-6 inline-block border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-[#FF5F1F]">●</span> {kicker(page)} · Draft Specification v{content.hero.spec.version} — {content.hero.spec.status}
          </div>
          <h1 className="mb-6 font-serif text-4xl font-bold leading-tight tracking-tight text-primary md:text-5xl">
            {page.title}
          </h1>
          <Link
            href={`/#${page.anchor}`}
            className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
          >
            Read in the full specification ↗
          </Link>
        </header>

        {/* Section body — same renderer as the full paper */}
        <article>
          <SectionBody
            section={page.section}
            subheading="h2"
            appendixHref={(id) => `${base}sections/${id}/`}
          />
        </article>

        {/* Prev / next navigation */}
        <nav aria-label="Section navigation" className="no-print mt-20 flex flex-col gap-4 border-t border-border pt-10 sm:flex-row">
          {prev && <NavCard page={prev} direction="prev" />}
          {next && <NavCard page={next} direction="next" />}
        </nav>

        {/* Footer */}
        <footer className="mt-20 flex flex-col gap-6 border-t border-border pt-8 font-mono text-xs md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-5 leading-relaxed text-muted-foreground">
            <div>
              <div>{content.footer.publishedBy}</div>
              <div>{content.footer.location}</div>
            </div>
            <SocialLinks />
          </div>
          <Link
            href="/"
            className="whitespace-nowrap text-muted-foreground transition-colors hover:text-primary"
          >
            [ Full Specification — v{content.hero.spec.version} ]
          </Link>
        </footer>
      </main>

      <AssistantPanel />
    </div>
  );
}
