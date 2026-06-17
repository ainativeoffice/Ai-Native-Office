import React from "react";
import { motion } from "framer-motion";
import { content } from "@/content";
import { useActiveSection } from "@/hooks/use-active-section";
import { EgressCalculator } from "@/components/EgressCalculator";
import { Citation } from "@/components/Citation";
import { SideNote, type MarginNote } from "@/components/SideNote";
import { ArchitectureBlueprint } from "@/components/ArchitectureBlueprint";
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
 * Tufte-style marginalia, matched verbatim against paragraph text at render time
 * (never annotated in content.ts). Each `match` is a unique substring of the
 * paragraph it should sit beside; the note grounds itself in an existing source.
 */
const MARGIN_NOTES: MarginNote[] = [
  {
    id: "aws-egress",
    label: "AWS Egress Pricing",
    match: "$13,000 in pure transit taxes on AWS",
    source: 6,
    note: "AWS EC2 internet egress is metered at $0.090/GB for the first 10 TB and $0.085/GB beyond — the recurring transit tax a sovereign node eliminates.",
  },
  {
    id: "mxa920",
    label: "Shure MXA920 Array",
    match: "The Shure MXA920 ceiling array exemplifies",
    source: 11,
    note: "Networked beamforming ceiling array: PoE-powered, eight transmit channels, Dante/AES67 transport — the reference sensor for spatial acoustic telemetry.",
  },
  {
    id: "stc55",
    label: "STC 55 Mandate",
    match: "The baseline structural requirement for any ingestion space is STC 55",
    source: 25,
    note: "Sound Transmission Class 55 mirrors ICD 705 Sound Group 4 for SCIF conference spaces, rendering normal and loud speech inaudible at the perimeter.",
  },
];

const findMarginNote = (paragraph: string): MarginNote | undefined =>
  MARGIN_NOTES.find((n) => paragraph.includes(n.match));

export default function Home() {
  const sectionIds = content.sections.map((s) => s.id);
  const activeId = useActiveSection(sectionIds);

  const renderTable = (tableData: any) => {
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
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-2 border-t border-border pt-2">Technical Standard v1.0</div>
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
                <span className="truncate">{section.title.split(":")[0]}</span>
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
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:p-16 lg:py-24 lg:pl-24 lg:pr-[19rem] relative">
        
        {/* Hero */}
        <header className="mb-24 pb-12 border-b border-border">
          <div className="mb-8 inline-block border border-border px-4 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-primary/80">●</span> Draft Specification v0.5 — Request for Comment (RFC)
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif font-bold leading-tight tracking-tight mb-8"
          >
            {content.hero.title}
          </motion.h1>
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

        {/* Sections */}
        <div className="flex flex-col gap-24">
          {content.sections.map((section, idx) => (
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
                
                {section.list && (
                  <ul className="my-8 flex flex-col gap-4 font-mono text-sm border-l border-border pl-6">
                    {section.list.map((item, i) => (
                      <li key={i} className="text-muted-foreground relative before:content-['>'] before:absolute before:-left-5 before:text-border">
                        {renderText(item)}
                      </li>
                    ))}
                  </ul>
                )}

                {section.postListProse && renderProse(section.postListProse)}

                {section.id === "enclave" && <ArchitectureBlueprint />}

                {section.subsections?.map((sub: any, sIdx: number) => (
                  <div key={sIdx} className="mt-16">
                    <h3 className="text-2xl font-serif font-semibold mb-6 text-foreground/90">
                      {sub.title}
                    </h3>
                    {renderProse(sub.prose)}
                    
                    {sub.tableType === "egress_table" && <EgressCalculator />}

                    {sub.tableData && renderTable(sub.tableData)}
                    
                    {sub.postTableProse && renderProse(sub.postTableProse)}
                    
                    {sub.list && (
                      <ul className="my-8 flex flex-col gap-4 font-mono text-sm border-l border-border pl-6">
                        {sub.list.map((item: string, i: number) => (
                          <li key={i} className="text-muted-foreground relative before:content-['>'] before:absolute before:-left-5 before:text-border">
                            {renderText(item)}
                          </li>
                        ))}
                      </ul>
                    )}

                    {sub.postListProse && renderProse(sub.postListProse)}
                  </div>
                ))}
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
        </div>

        {/* Footer CTAs */}
        <footer className="mt-32 pt-16 border-t border-border flex flex-col md:flex-row gap-6">
          <a 
            href="https://ainativeoffice.com" 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 block group border border-border p-6 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <div className="font-mono text-xs uppercase tracking-widest mb-4 opacity-70">Infrastructure</div>
            <div className="font-serif text-2xl font-bold group-hover:translate-x-2 transition-transform">Lease the Sovereign Shell</div>
          </a>
          <a 
            href="https://nativeagentic.com" 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 block group border border-border p-6 hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <div className="font-mono text-xs uppercase tracking-widest mb-4 opacity-70">Software</div>
            <div className="font-serif text-2xl font-bold group-hover:translate-x-2 transition-transform">Deploy the Agentic Software</div>
          </a>
        </footer>
      </main>
    </div>
  );
}
