import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { content } from "@/content";
import { useActiveSection } from "@/hooks/use-active-section";
import { SectionBody } from "@/components/WhitepaperBody";
import { SpecificationUpdateFeed } from "@/components/SpecificationUpdateFeed";
import { CopyForLlm } from "@/components/CopyForLlm";
import { SocialLinks } from "@/components/SocialLinks";
import { ShareLinks } from "@/components/ShareLinks";
import { AssistantPanel } from "@/components/AssistantPanel";
import { parseCitation } from "@/lib/citations";
import { sectionPages } from "@/lib/sectionPages";

export default function Home() {
  const appendixNav = content.appendices.map((a, idx) => ({
    id: `appendix-${a.id}`,
    letter: String.fromCharCode(65 + idx),
    label: a.navLabel ?? a.title.split(":")[0],
  }));
  const sectionIds = [
    ...content.sections.map((s) => s.id),
    "works-cited",
    "appendices",
    ...appendixNav.map((a) => a.id),
  ];
  const activeId = useActiveSection(sectionIds);
  const isAppendixActive = activeId === "appendices" || activeId.startsWith("appendix-");
  const [appendixOpen, setAppendixOpen] = React.useState(false);
  const appendixExpanded = isAppendixActive || appendixOpen;

  const tocSections = sectionPages.filter((p) => !p.isAppendix);
  const tocAppendices = sectionPages.filter((p) => p.isAppendix);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row selection:bg-primary selection:text-primary-foreground">
      
      {/* Sidebar Navigation */}
      <nav className="no-print hidden md:flex md:flex-col w-72 shrink-0 border-r border-border p-6 sticky top-0 h-[100dvh] overflow-y-auto">
        <div className="mb-6">
          <div className="text-xl font-serif font-bold tracking-tight text-primary">ai-native-office</div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-2 border-t border-border pt-2">Draft Spec v{content.hero.spec.version} · {content.hero.spec.status}</div>
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
          >
            [ Download / PDF ]
          </button>
        </div>
        <ul className="flex flex-col gap-3 font-mono text-xs uppercase tracking-wider">
          {content.sections.map((section) => (
            <li key={section.id}>
              <a 
                href={`#${section.id}`} 
                className={`flex items-center gap-3 transition-colors ${
                  activeId === section.id ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                <div className={`w-2 h-2 ${activeId === section.id ? "bg-primary" : "bg-transparent border border-muted"}`} />
                <span className="truncate">{section.navLabel ?? section.title.split(":")[0]}</span>
              </a>
            </li>
          ))}
          <li className="mt-5 border-t border-border pt-5">
            <a 
              href="#works-cited" 
              className={`flex items-center gap-3 transition-colors ${
                activeId === "works-cited" ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              <div className={`w-2 h-2 ${activeId === "works-cited" ? "bg-primary" : "bg-transparent border border-muted"}`} />
              <span>Works Cited</span>
            </a>
          </li>
          <li>
            <div className="flex items-center gap-3">
              <a
                href="#appendices"
                onClick={() => setAppendixOpen(true)}
                className={`flex flex-1 items-center gap-3 transition-colors ${
                  isAppendixActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground/80"
                }`}
              >
                <div className={`w-2 h-2 ${isAppendixActive ? "bg-primary" : "bg-transparent border border-muted"}`} />
                <span>Appendices</span>
              </a>
              <button
                type="button"
                aria-expanded={appendixExpanded}
                aria-controls="appendix-sublist"
                aria-label={appendixExpanded ? "Collapse appendices" : "Expand appendices"}
                onClick={() => setAppendixOpen((v) => !v)}
                className="shrink-0 px-1 leading-none text-muted-foreground transition-colors hover:text-foreground/80 focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
              >
                {appendixExpanded ? "−" : "+"}
              </button>
            </div>
            {appendixExpanded && (
              <ul id="appendix-sublist" className="mt-2 ml-[3px] flex flex-col gap-2 border-l border-border pl-4">
                {appendixNav.map((appendix) => (
                  <li key={appendix.id}>
                    <a
                      href={`#${appendix.id}`}
                      className={`flex items-center gap-2 transition-colors ${
                        activeId === appendix.id ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground/80"
                      }`}
                    >
                      <span className={`shrink-0 ${activeId === appendix.id ? "text-primary" : "text-muted-foreground"}`}>
                        {appendix.letter}
                      </span>
                      <span className="truncate normal-case tracking-normal">{appendix.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li className="mt-5 border-t border-border pt-5">
            <Link
              href="/blog/"
              className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground/80"
            >
              <div className="w-2 h-2 bg-transparent border border-muted" />
              <span>RFC Log</span>
            </Link>
          </li>
          <li className="mt-3">
            <Link
              href="/signals/"
              className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground/80"
            >
              <div className="w-2 h-2 bg-transparent border border-muted" />
              <span>Signal Log</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:p-16 lg:py-24 lg:pl-24 lg:pr-[19rem] pb-28 md:pb-28 lg:pb-32 relative">
        
        {/* Hero */}
        <header className="mb-24 pb-12 border-b border-border">
          <div className="mb-8 inline-block border border-border px-4 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-primary/80">●</span> Draft Specification v{content.hero.spec.version} — {content.hero.spec.status}
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif font-bold leading-tight tracking-tight mb-8"
          >
            {content.hero.title}
          </motion.h1>
          {content.hero.subtitle && (
            <p className="mb-8 max-w-3xl font-serif text-xl italic text-muted-foreground md:text-2xl">
              {content.hero.subtitle}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center font-mono text-xs text-muted-foreground uppercase tracking-widest">
            {content.hero.authors.map((author, idx) => (
              <React.Fragment key={author.email}>
                {idx > 0 && <span className="w-1 h-1 bg-border rounded-full" />}
                <a
                  href={`mailto:${author.email}`}
                  className="text-muted-foreground underline decoration-dotted decoration-muted-foreground/50 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary focus-visible:text-primary"
                >
                  {author.name}
                </a>
              </React.Fragment>
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

        {/* Table of contents — crawlable links to the standalone section pages */}
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
                    <span className="truncate underline decoration-border underline-offset-4 group-hover:decoration-primary">
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
            <motion.section 
              key={section.id}
              id={section.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
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
            </motion.section>
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

          {/* Appendices — deep technical detail surfaced for reference */}
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

        {/* Specification update feed (email capture) */}
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
            <span className="whitespace-nowrap text-muted-foreground">[ Changelog v{content.hero.spec.version} ]</span>
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

      <AssistantPanel />
    </div>
  );
}
