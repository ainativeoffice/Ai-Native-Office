import Link from "next/link";
import { content } from "@/lib/content/content";
import { parseCitation } from "@/lib/content/citations";
import { sectionPages } from "@/lib/content/sectionPages";
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
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row selection:bg-primary selection:text-primary-foreground">
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
        className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:p-16 lg:py-24 lg:pl-24 lg:pr-[19rem] pb-28 md:pb-28 lg:pb-32 relative"
      >
        {/* Hero */}
        <header className="mb-24 pb-12 border-b border-border">
          <div className="mb-8 inline-block border border-border px-4 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-primary/80">●</span> Draft Specification v{content.hero.spec.version} — {content.hero.spec.status}
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight tracking-tight mb-8 text-balance">
            {content.hero.title}
          </h1>
          {content.hero.subtitle && (
            <p className="mb-8 max-w-3xl font-serif text-xl italic text-muted-foreground md:text-2xl">
              {content.hero.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center font-mono text-xs text-muted-foreground uppercase tracking-widest">
            {content.hero.authors.map((author, idx) => (
              <span key={author.email} className="flex items-center gap-4">
                {idx > 0 && <span className="w-1 h-1 bg-border rounded-full" aria-hidden />}
                <a
                  href={`mailto:${author.email}`}
                  className="text-muted-foreground underline decoration-dotted decoration-muted-foreground/50 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary focus-visible:text-primary"
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
        <section className="mb-24 pl-6 md:pl-8 border-l-4 border-[#FF5F1F]">
          <h2 className="mb-4 font-mono text-sm font-bold uppercase tracking-[0.3em] text-foreground">
            Abstract
          </h2>
          <p className="font-serif italic text-base leading-relaxed text-foreground/80">
            {content.abstract}
          </p>
        </section>

        {/* Table of contents */}
        <nav aria-label="Contents" className="no-print mb-24 border border-border">
          <div className="border-b border-border px-6 py-4 font-mono text-sm font-bold uppercase tracking-[0.3em] text-foreground">
            Contents
          </div>
          <div className="grid gap-x-12 gap-y-8 p-6 md:grid-cols-2">
            <ol className="flex flex-col gap-3 font-mono text-xs uppercase tracking-wider">
              {tocSections.map((page, i) => (
                <li key={page.id}>
                  <Link
                    href={page.path}
                    className="group flex items-baseline gap-3 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span className="shrink-0 text-border group-hover:text-primary/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="underline decoration-border underline-offset-4 group-hover:decoration-primary">
                      {page.navLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
            <ol className="flex flex-col gap-3 font-mono text-xs tracking-wider">
              {tocAppendices.map((page) => (
                <li key={page.id}>
                  <Link
                    href={page.path}
                    className="group flex items-baseline gap-3 text-muted-foreground transition-colors hover:text-primary"
                  >
                    <span className="shrink-0 text-border group-hover:text-primary/60">
                      {page.appendixLetter}
                    </span>
                    <span className="underline decoration-border underline-offset-4 group-hover:decoration-primary">
                      {page.navLabel}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* Sections */}
        <div className="flex flex-col gap-24">
          {content.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-primary">
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
          <section id="works-cited" className="pt-24 border-t border-border scroll-mt-24">
            <h2 className="text-2xl font-mono font-bold mb-8 uppercase tracking-widest text-muted-foreground">
              Works Cited
            </h2>
            <ol className="list-decimal list-outside ml-6 font-mono text-xs text-muted-foreground space-y-3">
              {content.worksCited.map((citation, i) => {
                const { label, url } = parseCitation(citation);
                return (
                  <li key={i} id={`source-${i + 1}`} className="pl-4 break-words scroll-mt-24">
                    <span>{label}</span>
                    {url && (
                      <>
                        {" "}
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener external"
                          className="text-foreground/70 underline decoration-border underline-offset-2 transition-colors hover:text-primary break-all"
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
          <section id="appendices" className="pt-24 border-t border-border scroll-mt-24">
            <h2 className="text-2xl font-mono font-bold mb-4 uppercase tracking-widest text-muted-foreground">
              Appendices
            </h2>
            <p className="mb-16 max-w-3xl font-serif italic text-base leading-relaxed text-foreground/70">
              The following appendices preserve the full technical depth behind the specification — the
              economics of cloud egress, acoustic and spatial sensor engineering, the hardened sovereign
              enclave, the reference compute classes, and the localized GraphRAG pipeline — for
              technically-minded readers and crawlers.
            </p>
            <div className="flex flex-col gap-24">
              {content.appendices.map((appendix, idx) => (
                <section
                  key={appendix.id}
                  id={`appendix-${appendix.id}`}
                  className="scroll-mt-24"
                >
                  <div className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#FF5F1F]">
                    Appendix {String.fromCharCode(65 + idx)}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold mb-8 text-primary">
                    {appendix.title}
                  </h3>
                  <SectionBody section={appendix} subheading="h4" />
                </section>
              ))}
            </div>
          </section>
        </div>

        {/* Specification update feed */}
        <SpecificationUpdateFeed />

        {/* Institutional footer */}
        <footer className="mt-24 pt-8 border-t border-border flex flex-col md:flex-row md:items-start md:justify-between gap-8 font-mono text-xs">
          <div className="flex flex-col gap-5 text-muted-foreground leading-relaxed">
            <div>
              <div>{content.footer.publishedBy}</div>
              <div>{content.footer.location}</div>
            </div>
            <SocialLinks />
            <ShareLinks />
          </div>
          <div className="flex shrink-0 flex-col md:items-end gap-2">
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
