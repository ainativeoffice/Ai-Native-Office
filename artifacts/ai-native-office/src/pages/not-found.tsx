import { useEffect } from "react";
import { Link } from "wouter";

const links = [
  { href: "/", label: "The Specification", path: "/" },
  { href: "/blog/", label: "RFC Log", path: "/blog/" },
  { href: "/signals/", label: "Signal Log", path: "/signals/" },
];

export default function NotFound() {
  useEffect(() => {
    document.title = "404 — Document Not Found · The AI-Native Office";
  }, []);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-6 pb-28 pt-12 text-foreground selection:bg-primary selection:text-primary-foreground">
      <main id="main-content" tabIndex={-1} className="w-full max-w-2xl border border-border">
        {/* Terminal header strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>
            <span aria-hidden="true" className="text-[#FF5F1F]">
              ●
            </span>{" "}
            System Notice
          </span>
          <span>ERR // 404</span>
        </div>

        <div className="px-6 py-10 md:px-10 md:py-12">
          <h1 className="mb-8 font-serif text-4xl font-bold leading-tight tracking-tight text-primary md:text-5xl">
            Document Not Found
          </h1>

          <div className="mb-10 space-y-2 font-mono text-[13px] leading-relaxed text-muted-foreground">
            <p>
              <span aria-hidden="true" className="text-[#FF5F1F]">
                &gt;
              </span>{" "}
              The requested path does not resolve to any section, appendix, or log
              entry of this specification.
            </p>
            <p>
              <span aria-hidden="true" className="text-[#FF5F1F]">
                &gt;
              </span>{" "}
              Re-route via a known endpoint:
            </p>
          </div>

          <nav
            aria-label="Recovery links"
            className="flex flex-col items-start gap-3 font-mono text-xs uppercase tracking-widest"
          >
            {links.map((l) => (
              <Link
                key={l.path}
                href={l.href}
                className="border border-border px-4 py-3 text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
              >
                [ {l.label} — {l.path} ]
              </Link>
            ))}
          </nav>
        </div>
      </main>
    </div>
  );
}
