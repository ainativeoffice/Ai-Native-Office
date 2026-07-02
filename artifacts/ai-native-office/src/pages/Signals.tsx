import { useEffect } from "react";
import { Link } from "wouter";
import { content } from "@/content";
import { SocialLinks } from "@/components/SocialLinks";
import { AssistantPanel } from "@/components/AssistantPanel";
import { getSectionPage } from "@/lib/sectionPages";
import {
  signalEntries,
  signalAnchor,
  signalDesignation,
  SIGNALS_TITLE,
  SIGNALS_META_TITLE,
  SIGNALS_DESCRIPTION,
} from "@/lib/signalsPage";

export default function Signals() {
  useEffect(() => {
    document.title = SIGNALS_META_TITLE;
    // Respect a shared #log-NNN anchor; otherwise start at the top.
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <main className="mx-auto w-full max-w-4xl px-6 py-12 md:px-10 md:py-16 lg:py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="no-print mb-16 border-b border-border pb-6">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <li>
              <Link
                href="/"
                className="underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
              >
                The AI-Native Office
              </Link>
            </li>
            <li aria-hidden="true" className="text-border">/</li>
            <li className="text-foreground/80">{SIGNALS_TITLE}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-16 border-b border-border pb-12">
          <div className="mb-6 inline-block border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-[#FF5F1F]">●</span> {SIGNALS_TITLE} · Draft Specification v{content.hero.spec.version} — {content.hero.spec.status}
          </div>
          <h1 className="mb-6 font-serif text-4xl font-bold leading-tight tracking-tight text-primary md:text-5xl">
            {SIGNALS_TITLE}
          </h1>
          <p className="max-w-3xl font-serif text-lg italic leading-relaxed text-muted-foreground">
            {SIGNALS_DESCRIPTION}
          </p>
        </header>

        {/* Ledger */}
        <section aria-label="Evidence ledger" className="flex flex-col gap-10">
          {signalEntries.map((entry) => {
            const anchor = signalAnchor(entry);
            return (
              <article
                key={entry.number}
                id={anchor}
                className="scroll-mt-8 border border-border bg-card/30"
              >
                {/* Entry header strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3 md:px-7">
                  <a
                    href={`#${anchor}`}
                    className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#FF5F1F] transition-opacity hover:opacity-80"
                    title="Permanent link to this entry"
                  >
                    {signalDesignation(entry)}
                  </a>
                  <time
                    dateTime={entry.date}
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    {entry.date}
                  </time>
                </div>

                <div className="px-5 py-6 md:px-7 md:py-8">
                  <h2 className="mb-4 font-serif text-xl font-bold leading-snug text-foreground/90 md:text-2xl">
                    {entry.headline}
                  </h2>
                  <p className="mb-6 max-w-3xl font-light leading-relaxed text-foreground/70">
                    {entry.body}
                  </p>

                  {/* Sources */}
                  <div className="mb-6">
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Source{entry.sources.length > 1 ? "s" : ""}
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {entry.sources.map((source) => (
                        <li key={source.url}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs leading-relaxed text-primary/80 underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                          >
                            {source.label} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* VALIDATES links */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Validates
                    </span>
                    {entry.validatesSectionIds.map((id) => {
                      const page = getSectionPage(id);
                      if (!page) return null;
                      return (
                        <Link
                          key={id}
                          href={page.path}
                          className="border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          {page.isAppendix ? `Appendix ${page.appendixLetter}: ${page.navLabel}` : page.navLabel}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Footer */}
        <footer className="mt-20 flex flex-col gap-6 border-t border-border pt-8 font-mono text-xs md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-5 leading-relaxed opacity-70">
            <div>
              <div>{content.footer.publishedBy}</div>
              <div>{content.footer.location}</div>
            </div>
            <SocialLinks />
          </div>
          <Link
            href="/"
            className="whitespace-nowrap opacity-70 transition-opacity hover:text-primary hover:opacity-100"
          >
            [ Full Specification — v{content.hero.spec.version} ]
          </Link>
        </footer>
      </main>

      <AssistantPanel />
    </div>
  );
}
