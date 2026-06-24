import React from "react";
import { motion } from "framer-motion";
import { content, type ListItem, type Principle, type Table, type ContactBlock } from "@/content";
import { useActiveSection } from "@/hooks/use-active-section";
import { EgressCalculator } from "@/components/EgressCalculator";
import { Citation } from "@/components/Citation";
import { SideNote, type MarginNote } from "@/components/SideNote";
import { ArchitectureBlueprint } from "@/components/ArchitectureBlueprint";
import { SpecificationUpdateFeed } from "@/components/SpecificationUpdateFeed";
import { getSource, parseCitation, tokenizeCitations } from "@/lib/citations";

const renderText = (text: string) =>
  tokenizeCitations(text).map((t, i) =>
    t.type === "text" ? (
      <React.Fragment key={i}>{t.value}</React.Fragment>
    ) : (
      <Citation key={i} number={t.number} />
    ),
  );

/**
 * Renders a bulleted list. Items are either plain strings or structured
 * `{ label, body }` objects, where `label` is a bold lead-in term (modeled as
 * real structure, not markdown asterisks in the content string).
 */
const renderList = (items: ListItem[]) => (
  <ul className="my-8 flex flex-col gap-4 font-mono text-sm border-l border-border pl-6">
    {items.map((item, i) => (
      <li
        key={i}
        className="text-muted-foreground relative before:content-['>'] before:absolute before:-left-5 before:text-border"
      >
        {typeof item === "string" ? (
          renderText(item)
        ) : (
          <>
            <strong className="font-semibold text-foreground">{renderText(item.label)}</strong>{" "}
            {renderText(item.body)}
          </>
        )}
      </li>
    ))}
  </ul>
);

/**
 * Tufte-style marginalia, matched verbatim against paragraph text at render time
 * (never annotated in content.ts). Each `match` is a unique substring of the
 * paragraph it should sit beside; the note grounds itself in an existing source.
 */
const MARGIN_NOTES: MarginNote[] = [];

const findMarginNote = (paragraph: string): MarginNote | undefined =>
  MARGIN_NOTES.find((n) => paragraph.includes(n.match));

/**
 * Data-driven cross-links from a simplified main section to the appendices that
 * carry its full technical depth. Keyed by section id → appendix ids; the
 * appendix letter (A, B, …) is derived from the appendix's position so it never
 * drifts from the rendered list. Rendered as plain anchors to existing
 * `#appendix-<id>` targets, so they degrade gracefully in the prerendered HTML.
 */
const SECTION_APPENDIX_LINKS: Record<string, string[]> = {
  economics: ["egress"],
  architecture: ["sensory", "enclave"],
  compliance: ["flywheel"],
};

const appendixIndexById = new Map(content.appendices.map((a, i) => [a.id, i]));

interface AppendixLink {
  id: string;
  letter: string;
  label: string;
}

const resolveAppendixLinks = (sectionId: string): AppendixLink[] =>
  (SECTION_APPENDIX_LINKS[sectionId] ?? []).flatMap((id) => {
    const idx = appendixIndexById.get(id);
    if (idx === undefined) return [];
    return [
      {
        id,
        letter: String.fromCharCode(65 + idx),
        label: content.appendices[idx].title.split(":")[0],
      },
    ];
  });

/**
 * Small, in-aesthetic "See Appendix X" links connecting a main section to its
 * supporting appendices. Plain anchors → no JS required.
 */
const renderAppendixLinks = (links: AppendixLink[]) =>
  links.length === 0 ? null : (
    <div className="no-print mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6 font-mono text-[11px] uppercase tracking-widest">
      <span className="text-border">{"// full technical detail"}</span>
      {links.map((a) => (
        <a
          key={a.id}
          href={`#appendix-${a.id}`}
          className="border border-border px-3 py-2 text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
        >
          See Appendix {a.letter} — {a.label} ↗
        </a>
      ))}
    </div>
  );

/**
 * Renders a set of principle callouts. Each entry is `{ label?, body }`, where
 * `label` is an optional bold lead-in term (modeled as structure, not markdown).
 * Given a distinct left-border / mono treatment to read as a tenet block.
 */
const renderPrinciples = (principles: Principle[]) => (
  <div className="my-10 flex flex-col gap-6">
    {principles.map((p, i) => (
      <blockquote
        key={i}
        className="border-l-2 border-primary bg-card/40 py-3 pl-6 pr-4 font-mono text-sm leading-relaxed text-muted-foreground"
      >
        {p.label ? (
          <>
            <strong className="font-semibold uppercase tracking-wider text-foreground">
              {renderText(p.label)}
            </strong>{" "}
            {renderText(p.body)}
          </>
        ) : (
          renderText(p.body)
        )}
      </blockquote>
    ))}
  </div>
);

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

  const renderTable = (tableData: Table) => {
    return (
      <div className="w-full overflow-x-auto my-10 font-mono text-xs md:text-sm">
        <table className="w-full border-collapse border border-border text-left">
          <thead>
            <tr className="bg-secondary/30">
              {tableData.headers.map((h: string, i: number) => (
                <th key={i} className="border border-border p-3 font-semibold uppercase tracking-wider text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row: string[], i: number) => (
              <tr key={i} className="hover:bg-card/50 transition-colors">
                {row.map((cell: string, j: number) => {
                  const num = /^\d{1,2}$/.test(cell) ? parseInt(cell, 10) : NaN;
                  const isSourceNote = !Number.isNaN(num) && getSource(num) !== null;
                  return (
                    <td key={j} className="border border-border p-3">
                      {isSourceNote ? <Citation number={num} /> : cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderProse = (paragraphs: string[]) => {
    return paragraphs.map((p, i) => {
      const note = findMarginNote(p);
      return (
        <p key={i} className="mb-6 leading-relaxed text-foreground/90 font-light text-lg">
          {renderText(p)}
          {note && (
            <SideNote id={note.id} label={note.label} note={note.note} source={note.source} />
          )}
        </p>
      );
    });
  };

  const renderCode = (block: { caption?: string; code: string }) => (
    <figure className="my-8">
      <pre className="overflow-x-auto rounded-none border border-border bg-[hsl(0_0%_2%)] p-5 font-mono text-xs leading-relaxed text-foreground/85">
        <code>{block.code}</code>
      </pre>
      {block.caption && (
        <figcaption className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );

  const renderBlocks = (blocks: ContactBlock[]) =>
    blocks.map((b, bi) => (
      <div key={bi} className="mt-8">
        {b.label && (
          <h4 className="mb-3 font-serif text-xl font-semibold text-foreground/90">
            {renderText(b.label)}
          </h4>
        )}
        {b.prose && renderProse(b.prose)}
        {b.list && renderList(b.list)}
        {b.lines && (
          <div className="font-mono text-sm leading-relaxed text-muted-foreground space-y-1">
            {b.lines.map((line: string, i: number) => (
              <div key={i}>{renderText(line)}</div>
            ))}
          </div>
        )}
      </div>
    ));

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col md:flex-row selection:bg-primary selection:text-primary-foreground">
      
      {/* Sidebar Navigation */}
      <nav className="no-print hidden md:block w-72 shrink-0 border-r border-border p-8 sticky top-0 h-[100dvh] overflow-y-auto">
        <button
          type="button"
          onClick={() => window.print()}
          className="mb-10 w-full border border-border px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
        >
          [ Download as Whitepaper / PDF ]
        </button>
        <div className="mb-12">
          <div className="text-xl font-serif font-bold tracking-tight text-primary">ai-native-office</div>
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-2 border-t border-border pt-2">Draft Spec v{content.hero.spec.version} · {content.hero.spec.status}</div>
        </div>
        <ul className="flex flex-col gap-4 font-mono text-xs uppercase tracking-wider">
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
          <li className="mt-8 border-t border-border pt-8">
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
            <a
              href="#appendices"
              className={`flex items-center gap-3 transition-colors ${
                isAppendixActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              <div className={`w-2 h-2 ${isAppendixActive ? "bg-primary" : "bg-transparent border border-muted"}`} />
              <span>Appendices</span>
            </a>
            <ul className="mt-3 ml-[3px] flex flex-col gap-3 border-l border-border pl-4">
              {appendixNav.map((appendix) => (
                <li key={appendix.id}>
                  <a
                    href={`#${appendix.id}`}
                    className={`flex items-center gap-2 transition-colors ${
                      activeId === appendix.id ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground/80"
                    }`}
                  >
                    <span className={`shrink-0 ${activeId === appendix.id ? "text-primary" : "text-muted-foreground/60"}`}>
                      {appendix.letter}
                    </span>
                    <span className="truncate normal-case tracking-normal">{appendix.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:p-16 lg:py-24 lg:pl-24 lg:pr-[19rem] relative">
        
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

        {/* Abstract */}
        <section className="mb-24 pl-6 md:pl-8 border-l-4 border-[#FF5F1F]">
          <h2 className="mb-4 font-mono text-sm font-bold uppercase tracking-[0.3em] text-foreground">
            Abstract
          </h2>
          <p className="font-serif italic text-base leading-relaxed text-foreground/80">
            {content.abstract}
          </p>
        </section>

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
              
              <div className="prose-container">
                {renderProse(section.prose)}

                {section.id === "for" && <EgressCalculator />}

                {section.list && renderList(section.list)}

                {section.postListProse && renderProse(section.postListProse)}

                {section.id === "architecture" && <ArchitectureBlueprint />}

                {section.subsections?.map((sub, sIdx) => (
                  <div key={sIdx} className="mt-16">
                    <h3 className="text-2xl font-serif font-semibold mb-6 text-foreground/90">
                      {sub.title}
                    </h3>
                    {renderProse(sub.prose)}

                    {sub.code && renderCode(sub.code)}

                    {sub.principles && renderPrinciples(sub.principles)}

                    {sub.tableData && renderTable(sub.tableData)}
                    
                    {sub.postTableProse && renderProse(sub.postTableProse)}
                    
                    {sub.list && renderList(sub.list)}

                    {sub.blocks && renderBlocks(sub.blocks)}

                    {sub.postListProse && renderProse(sub.postListProse)}

                    {sub.closing && (
                      <p className="mt-6 font-serif italic text-foreground/80">{renderText(sub.closing)}</p>
                    )}
                  </div>
                ))}

                {renderAppendixLinks(resolveAppendixLinks(section.id))}
              </div>
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
              {content.appendices.map((appendix: any, idx: number) => (
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
                  <div className="prose-container">
                    {renderProse(appendix.prose)}

                    {appendix.list && renderList(appendix.list)}

                    {appendix.postListProse && renderProse(appendix.postListProse)}

                    {appendix.subsections?.map((sub: any, sIdx: number) => (
                      <div key={sIdx} className="mt-16">
                        <h4 className="text-xl font-serif font-semibold mb-6 text-foreground/90">
                          {sub.title}
                        </h4>
                        {renderProse(sub.prose)}

                        {sub.code && renderCode(sub.code)}

                        {sub.principles && renderPrinciples(sub.principles)}

                        {sub.tableData && renderTable(sub.tableData)}

                        {sub.postTableProse && renderProse(sub.postTableProse)}

                        {sub.list && renderList(sub.list)}

                        {sub.blocks && renderBlocks(sub.blocks)}

                        {sub.postListProse && renderProse(sub.postListProse)}

                        {sub.closing && (
                          <p className="mt-6 font-serif italic text-foreground/80">{renderText(sub.closing)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>

        {/* Specification update feed (email capture) */}
        <SpecificationUpdateFeed />

        {/* Institutional footer */}
        <footer className="mt-24 pt-8 border-t border-border flex flex-col md:flex-row md:items-start md:justify-between gap-8 font-mono text-xs">
          <div className="opacity-70 leading-relaxed">
            <div>{content.footer.publishedBy}</div>
            <div>{content.footer.location}</div>
          </div>
          <div className="flex shrink-0 flex-col md:items-end gap-2">
            <span className="whitespace-nowrap opacity-70">[ Changelog v{content.hero.spec.version} ]</span>
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
                  className="whitespace-nowrap opacity-70 hover:opacity-100 hover:text-primary transition-opacity"
                >
                  [ {link.label} ]
                </a>
              ),
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
