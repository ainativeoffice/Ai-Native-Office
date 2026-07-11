"use client";

import React from "react";
import Link from "next/link";
import { useActiveSection } from "@/hooks/use-active-section";
import type { SectionPageInfo } from "@/lib/content/sectionPages";

interface SidebarNavProps {
  version: string;
  status: string;
  sections: Pick<SectionPageInfo, "id" | "navLabel">[];
  appendixNav: { id: string; letter: string; label: string }[];
}

export function SidebarNav({ version, status, sections, appendixNav }: SidebarNavProps) {
  const sectionIds = [
    ...sections.map((s) => s.id),
    "works-cited",
    "appendices",
    ...appendixNav.map((a) => a.id),
    "implementations",
  ];
  const activeId = useActiveSection(sectionIds);
  const isAppendixActive = activeId === "appendices" || activeId.startsWith("appendix-");
  const [appendixOpen, setAppendixOpen] = React.useState(false);
  const appendixExpanded = isAppendixActive || appendixOpen;

  return (
    <nav
      aria-label="Document navigation"
      className="no-print hidden md:flex md:flex-col w-72 shrink-0 border-r border-border p-6 sticky top-0 h-[100dvh] overflow-y-auto"
    >
      <div className="mb-6">
        <div className="text-xl font-serif font-bold tracking-tight text-primary">
          ai-native-office
        </div>
        <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-2 border-t border-border pt-2">
          Draft Spec v{version} · {status}
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
        >
          [ Download / PDF ]
        </button>
      </div>

      <ul className="flex flex-col gap-3 font-mono text-xs uppercase tracking-wider">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={`flex items-center gap-3 transition-colors ${
                activeId === section.id
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              <div
                className={`w-2 h-2 shrink-0 ${
                  activeId === section.id
                    ? "bg-primary"
                    : "bg-transparent border border-muted"
                }`}
              />
              <span className="truncate">{section.navLabel}</span>
            </a>
          </li>
        ))}

        {/* Works Cited */}
        <li className="mt-5 border-t border-border pt-5">
          <a
            href="#works-cited"
            className={`flex items-center gap-3 transition-colors ${
              activeId === "works-cited"
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            <div
              className={`w-2 h-2 shrink-0 ${
                activeId === "works-cited"
                  ? "bg-primary"
                  : "bg-transparent border border-muted"
              }`}
            />
            <span>Works Cited</span>
          </a>
        </li>

        {/* Appendices with expand/collapse */}
        <li>
          <div className="flex items-center gap-3">
            <a
              href="#appendices"
              onClick={() => setAppendixOpen(true)}
              className={`flex flex-1 items-center gap-3 transition-colors ${
                isAppendixActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              <div
                className={`w-2 h-2 shrink-0 ${
                  isAppendixActive ? "bg-primary" : "bg-transparent border border-muted"
                }`}
              />
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
            <ul
              id="appendix-sublist"
              className="mt-2 ml-[3px] flex flex-col gap-2 border-l border-border pl-4"
            >
              {appendixNav.map((appendix) => (
                <li key={appendix.id}>
                  <a
                    href={`#${appendix.id}`}
                    className={`flex items-center gap-2 transition-colors ${
                      activeId === appendix.id
                        ? "text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground/80"
                    }`}
                  >
                    <span
                      className={`shrink-0 ${
                        activeId === appendix.id ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {appendix.letter}
                    </span>
                    <span className="truncate normal-case tracking-normal">{appendix.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>

        {/* Physical Implementations (non-normative) */}
        <li className="mt-5 border-t border-border pt-5">
          <a
            href="#implementations"
            className={`flex items-center gap-3 transition-colors ${
              activeId === "implementations"
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            <div
              className={`w-2 h-2 shrink-0 ${
                activeId === "implementations"
                  ? "bg-primary"
                  : "bg-transparent border border-muted"
              }`}
            />
            <span>Implementations</span>
          </a>
        </li>

        {/* RFC Log & Signal Log links */}
        <li className="mt-5 border-t border-border pt-5">
          <Link
            href="/blog/"
            className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground/80"
          >
            <div className="w-2 h-2 bg-transparent border border-muted shrink-0" />
            <span>RFC Log</span>
          </Link>
        </li>
        <li className="mt-3">
          <Link
            href="/signals/"
            className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground/80"
          >
            <div className="w-2 h-2 bg-transparent border border-muted shrink-0" />
            <span>Signal Log</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
