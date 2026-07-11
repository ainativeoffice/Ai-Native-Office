import Link from "next/link";
import { content } from "@/lib/content/content";
import { parseCitation } from "@/lib/content/citations";
import { sectionPages } from "@/lib/content/sectionPages";
import { implementationEntries } from "@/lib/content/implementations";
import { SectionBody } from "@/components/whitepaper/WhitepaperBody";
import { SpecificationUpdateFeed } from "@/components/SpecificationUpdateFeed";
import { CopyForLlm } from "@/components/CopyForLlm";
import { SocialLinks } from "@/components/SocialLinks";
import { ShareLinks } from "@/components/ShareLinks";
import { BackToTop } from "@/components/BackToTop";
import { SidebarNav } from "@/components/SidebarNav";

export default function Home() {
  const appendixNav = content.appendices.map((a, idx) => ({
    id: `appendix-${a.id}`,
    letter: String.fromCharCode(65 + idx),
    label: a.navLabel ?? a.title.split(":")[0],
  }));

  const tocSections = sectionPages.filter((p) => !p.isAppendix);
  const tocAppendices = sectionPages.filter((p) => p.isAppendix);

  const sidebarSections = content.sections.map((s) => ({
    id: s.id,
    navLabel: s.navLabel ?? s.title.split(":")[0],
  }));

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row">
      <SidebarNav
        version={content.hero.spec.version}
        status={content.hero.spec.status}
        sections={sidebarSections}
        appendixNav={appendixNav}
      />

      {/* Main Content */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full max-w-5xl mx-auto px-6 py-16 md:p-20 lg:py-28 lg:pl-28 lg:pr-[20rem] pb-32 relative"
      >
        {/* Hero */}
        <header className="mb-28 pb-16 border-b border-border">
          <div className="mb-6 inline-flex items-center gap-3 border border-border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" aria-hidden />
            <span>Draft Specification v{content.hero.spec.version} — {content.hero.spec.status}</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium leading-[1.04] tracking-[-0.035em] mb-10 text-balance text-foreground">
            {content.hero.title}
          </h1>
          {content.hero.subtitle && (
            <p className="mb-10 max-w-3xl font-serif text-xl md:text-2xl italic leading-relaxed text-muted-foreground">
              {content.hero.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-center font-mono text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
            {content.hero.authors.map((author, idx) => (
              <span key={author.email} className="flex items-center gap-4">
                {idx > 0 && <span className="w-1 h-1 bg-border rounded-full" aria-hidden />}
                <a
                  href={`mailto:${author.email}`}
                  className="text-muted-foreground underline decoration-border decoration-dotted underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:text-primary"
                >
                  {author.name}
                </a>
              </span>
            ))}
          </div>
        </header>

        {/* Copy the full document for LLM ingestion */}
        <CopyForLlm />

        {/* Abstract */}
        <section className="mb-28 pl-7 border-l-[3px] border-primary">
          <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.28em] text-foreground">
            Abstract
          </h2>
          <p className="font-serif italic text-lg leading-[1.74] text-foreground/80 max-w-3xl">
            {content.abstract}
          </p>
        </section>

        {/* Table of contents */}
        <nav aria-label="Contents" className="no-print mb-28 border border-border bg-card/50">
          <div className="border-b border-border px-7 py-5 font-mono text-xs font-semibold uppercase tracking-[0.26em] text-foreground">
            Contents
          </div>
          <div className="grid gap-x-14 gap-y-10 p-7 md:grid-cols-2">
            <ol className="flex flex-col gap-4 font-mono text-xs uppercase tracking-[0.18em]">
              {tocSections.map((page, i) => (
                <li key={page.id}>
                  <Link
                    href={page.path}
                    className="group flex items-baseline gap-4 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span className="shrink-0 text-border/80 font-light group-hover:text-primary/70 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="underline decoration-border/60 underline-offset-4 group-hover:decoration-primary">
                      {page.navLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <ol className="flex flex-col gap-4 font-mono text-xs uppercase tracking-[0.18em]">
              {tocAppendices.map((page) => (
                <li key={page.id}>
                  <Link
                    href={page.path}
                    className="group flex items-baseline gap-4 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span className="shrink-0 text-border/80 font-light group-hover:text-primary/70">
                      {page.appendixLetter}
                    </span>
                    <span className="underline decoration-border/60 underline-offset-4 group-hover:decoration-primary">
                      {page.navLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* Sections */}
        <div className="flex flex-col gap-28">
          {content.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-medium leading-tight tracking-[-0.02em] mb-10 text-foreground">
                {section.title}
              </h2>
              <SectionBody
                section={section}
                subheading="h3"
                appendixHref={(id) => `#appendix-${id}`}
              />
            </section>
          ))}

          {/* Works Cited */}
          <section id="works-cited" className="pt-28 border-t border-border scroll-mt-28">
            <h2 className="text-2xl font-mono font-semibold mb-10 uppercase tracking-[0.22em] text-muted-foreground">
              Works Cited
            </h2>
            <ol className="list-decimal list-outside ml-7 font-mono text-xs text-muted-foreground space-y-4">
              {content.worksCited.map((citation, i) => {
                const { label, url } = parseCitation(citation);
                return (
                  <li key={i} id={`source-${i + 1}`} className="pl-5 break-words scroll-mt-28 leading-relaxed">
                    <span>{label}</span>
                    {url && (
                      <>
                        {" "}
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener external"
                          className="text-foreground/70 underline decoration-border/60 underline-offset-2 transition-colors hover:text-primary hover:decoration-primary break-all"
                        >
                          {url}
                        </a>
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Appendices */}
          <section id="appendices" className="pt-28 border-t border-border scroll-mt-28">
            <h2 className="text-2xl font-mono font-semibold mb-5 uppercase tracking-[0.22em] text-muted-foreground">
              Appendices
            </h2>
            <p className="mb-20 max-w-3xl font-serif italic text-lg leading-[1.7] text-foreground/70">
              The following appendices preserve the full technical depth behind the specification — the
              economics of cloud egress, acoustic and spatial sensor engineering, the hardened sovereign
              enclave, the reference compute classes, and the localized GraphRAG pipeline — for
              technically-minded readers and crawlers.
            </p>
            <div className="flex flex-col gap-28">
              {content.appendices.map((appendix, idx) => (
                <section
                  key={appendix.id}
                  id={`appendix-${appendix.id}`}
                  className="scroll-mt-28"
                >
                  <div className="mb-4 font-mono text-xs uppercase tracking-[0.22em] text-primary">
                    Appendix {String.fromCharCode(65 + idx)}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-medium leading-tight tracking-[-0.02em] mb-10 text-foreground">
                    {appendix.title}
                  </h3>
                  <SectionBody section={appendix} subheading="h4" />
                </section>
              ))}
            </div>
          </section>

          {/* Physical Implementations (non-normative) */}
          <section id="implementations" className="pt-28 border-t border-border scroll-mt-28">
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <h2 className="text-2xl font-mono font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Physical Implementations
              </h2>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] border border-border px-2 py-1 text-primary">
                Informative / Non-Normative
              </span>
            </div>
            <p className="mb-12 max-w-3xl font-serif italic text-lg leading-[1.7] text-foreground/70">
              This specification is vendor-, property-, and operator-agnostic. The following
              independent environments are exploring or deploying principles related to it. Inclusion
              does not indicate certification, conformance, or endorsement. The full{" "}
              <Link
                href="/implementations/"
                className="text-primary underline decoration-border/60 underline-offset-4 hover:decoration-primary"
              >
                Implementation Registry
              </Link>{" "}
              records status, operator, and related sections — and accepts unaffiliated third-party
              submissions.
            </p>
            <ul className="grid gap-px border border-border bg-border sm:grid-cols-2">
              {implementationEntries.map((entry) => (
                <li key={entry.id} className="bg-background p-6 md:p-7">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                    {entry.status}
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-medium tracking-[-0.015em] text-foreground">
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener external"
                      className="transition-colors hover:text-primary"
                    >
                      {entry.name}
                    </a>
                  </h3>
                  <p className="font-serif text-sm leading-[1.65] text-foreground/70">
                    {entry.kind}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link
                href="/implementations/"
                className="inline-block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground border border-border px-6 py-4 transition-colors hover:text-primary hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                [ Open Implementation Registry ]
              </Link>
            </div>
          </section>
        </div>

        {/* Specification update feed */}
        <SpecificationUpdateFeed />

        {/* Institutional footer */}
        <footer className="mt-28 pt-10 border-t border-border flex flex-col md:flex-row md:items-start md:justify-between gap-10 font-mono text-xs">
          <div className="flex flex-col gap-6 text-muted-foreground leading-relaxed">
            <div>
              <div>{content.footer.publishedBy}</div>
              <div>{content.footer.location}</div>
            </div>
            <SocialLinks />
            <ShareLinks />
          </div>
          <div className="flex shrink-0 flex-col md:items-end gap-3">
            <span className="whitespace-nowrap text-muted-foreground">
              [ Changelog v{content.hero.spec.version} ]
            </span>
            <Link
              href="/blog/"
              className="whitespace-nowrap text-muted-foreground hover:text-primary transition-colors"
            >
              [ RFC Log ]
            </Link>
            <Link
              href="/signals/"
              className="whitespace-nowrap text-muted-foreground hover:text-primary transition-colors"
            >
              [ Signal Log ]
            </Link>
            <Link
              href="/implementations/"
              className="whitespace-nowrap text-muted-foreground hover:text-primary transition-colors"
            >
              [ Implementations ]
            </Link>
            {content.footer.links.map((link) =>
              link.disabled ? (
                <span
                  key={link.label}
                  aria-disabled="true"
                  className="whitespace-nowrap opacity-30 cursor-not-allowed select-none"
                >
                  [ {link.label} ]
                </span>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="whitespace-nowrap text-muted-foreground hover:text-primary transition-colors"
                >
                  [ {link.label} ]
                </a>
              ),
            )}
          </div>
        </footer>
      </main>

      <BackToTop />
    </div>
  );
}
