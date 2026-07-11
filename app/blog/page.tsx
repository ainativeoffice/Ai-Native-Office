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
      <header className="border-b border-border px-6 py-4 flex items-center justify-between font-mono text-xs uppercase tracking-widest">
        <Link
          href="/"
          className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
        >
          &larr; AI-Native Office
        </Link>
        <span className="hidden sm:block text-border">RFC Log</span>
        <ShareLinks />
      </header>

      <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto px-6 py-16 md:px-12 lg:px-16">
        {/* Eyebrow */}
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          The AI-Native Office
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight tracking-tight mb-4 text-primary">
          RFC Log
        </h1>
        <p className="mb-16 max-w-2xl font-serif italic text-lg leading-relaxed text-foreground/70">
          {BLOG_DESCRIPTION}
        </p>

        {/* Posts */}
        {blogPages.length === 0 ? (
          <p className="font-mono text-sm text-muted-foreground">
            No posts yet. Check back soon.
          </p>
        ) : (
          <ol className="flex flex-col divide-y divide-border">
            {blogPages.map((page) => (
              <li key={page.slug}>
                <Link
                  href={page.path}
                  className="group flex flex-col md:flex-row md:items-start gap-4 md:gap-10 py-8 transition-colors hover:text-primary"
                >
                  <time
                    dateTime={page.date}
                    className="shrink-0 font-mono text-xs uppercase tracking-widest text-muted-foreground group-hover:text-primary/60 md:pt-1 md:w-28"
                  >
                    {new Date(page.date + "T00:00:00").toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <div className="flex flex-col gap-2">
                    <h2 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {page.title}
                    </h2>
                    <p className="font-serif text-sm leading-relaxed text-muted-foreground">
                      {page.description}
                    </p>
                    <span className="mt-1 font-mono text-[11px] uppercase tracking-widest text-border group-hover:text-primary/50 transition-colors">
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
