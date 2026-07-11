import Link from "next/link";
import type { Metadata } from "next";
import { blogPages, BLOG_META_TITLE, BLOG_DESCRIPTION, BLOG_URL } from "@/lib/content/blogPages";
import { ShareLinks } from "@/components/ShareLinks";
import { SocialLinks } from "@/components/SocialLinks";

export const metadata: Metadata = {
  title: BLOG_META_TITLE,
  description: BLOG_DESCRIPTION,
  alternates: { canonical: BLOG_URL },
  openGraph: {
    title: BLOG_META_TITLE,
    description: BLOG_DESCRIPTION,
    url: BLOG_URL,
    type: "website",
  },
};

export default function BlogIndex() {
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
        <span className="hidden sm:block text-border/80">RFC Log</span>
        <ShareLinks />
      </header>

      <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto px-7 py-20 md:px-12 md:py-24 lg:px-16">
        {/* Eyebrow */}
        <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
          The AI-Native Office
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[0.98] tracking-[-0.04em] mb-6 text-foreground">
          RFC Log
        </h1>
        <p className="mb-20 max-w-2xl font-serif italic text-lg leading-[1.7] text-foreground/70">
          {BLOG_DESCRIPTION}
        </p>

        {/* Posts */}
        {blogPages.length === 0 ? (
          <p className="font-mono text-sm text-muted-foreground">
            No posts yet. Check back soon.
          </p>
        ) : (
            <ol className="flex flex-col divide-y divide-border border-b border-border">
              {blogPages.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={page.path}
                    className="group flex flex-col md:flex-row md:items-start gap-5 md:gap-12 py-10 px-1 transition-colors hover:bg-secondary/35 hover:text-primary"
                  >
                    <time
                      dateTime={page.date}
                      className="shrink-0 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground group-hover:text-primary/70 md:pt-1 md:w-28"
                    >
                      {new Date(page.date + "T00:00:00").toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <div className="flex flex-col gap-3">
                      <h2 className="font-serif text-2xl font-medium leading-tight tracking-[-0.015em] text-foreground group-hover:text-primary transition-colors">
                        {page.title}
                      </h2>
                      <p className="font-serif text-base leading-[1.7] text-muted-foreground">
                        {page.description}
                      </p>
                      <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-border group-hover:text-primary/70 transition-colors">
                        Read &rarr;
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
        )}

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-6 font-mono text-xs text-muted-foreground">
          <SocialLinks />
          <Link
            href="/"
            className="transition-colors hover:text-primary"
          >
            [ View Full Specification ]
          </Link>
        </footer>
      </main>
    </div>
  );
}
