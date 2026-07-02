import { useEffect } from "react";
import { Link } from "wouter";
import { content } from "@/content";
import { SocialLinks } from "@/components/SocialLinks";
import { AssistantPanel } from "@/components/AssistantPanel";
import {
  blogPages,
  BLOG_TITLE,
  BLOG_META_TITLE,
  BLOG_DESCRIPTION,
} from "@/lib/blogPages";

export default function BlogIndex() {
  useEffect(() => {
    document.title = BLOG_META_TITLE;
    window.scrollTo(0, 0);
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
            <li className="text-foreground/80">{BLOG_TITLE}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-16 border-b border-border pb-12">
          <div className="mb-6 inline-block border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-[#FF5F1F]">●</span> {BLOG_TITLE} · Draft Specification v{content.hero.spec.version} — {content.hero.spec.status}
          </div>
          <h1 className="mb-6 font-serif text-4xl font-bold leading-tight tracking-tight text-primary md:text-5xl">
            {BLOG_TITLE}
          </h1>
          <p className="max-w-3xl font-serif text-lg italic leading-relaxed text-muted-foreground">
            {BLOG_DESCRIPTION}
          </p>
        </header>

        {/* Post list */}
        <section aria-label="Posts" className="flex flex-col">
          {blogPages.map((page) => (
            <article key={page.slug} className="border-b border-border py-10 first:pt-0">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {page.date}
              </div>
              <h2 className="mb-4 font-serif text-2xl font-bold leading-snug text-foreground/90 md:text-3xl">
                <Link
                  href={page.path}
                  className="transition-colors hover:text-primary"
                >
                  {page.title}
                </Link>
              </h2>
              <p className="mb-6 max-w-3xl leading-relaxed text-foreground/70 font-light">
                {page.description}
              </p>
              <Link
                href={page.path}
                className="inline-block border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                [ Read Entry ]
              </Link>
            </article>
          ))}
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
