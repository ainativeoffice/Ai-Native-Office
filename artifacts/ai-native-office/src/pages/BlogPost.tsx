import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { content } from "@/content";
import { SectionBody } from "@/components/WhitepaperBody";
import { AssistantPanel } from "@/components/AssistantPanel";
import { SocialLinks } from "@/components/SocialLinks";
import NotFound from "@/pages/not-found";
import { getSectionPage } from "@/lib/sectionPages";
import {
  getBlogPage,
  getAdjacentBlogPages,
  BLOG_PATH,
  BLOG_TITLE,
  type BlogPageInfo,
} from "@/lib/blogPages";

function NavCard({ page, direction }: { page: BlogPageInfo; direction: "newer" | "older" }) {
  return (
    <Link
      href={page.path}
      className={`group flex flex-1 flex-col gap-2 border border-border p-5 transition-colors hover:border-primary hover:bg-card/40 ${
        direction === "older" ? "items-end text-right" : "items-start"
      }`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {direction === "newer" ? "← Newer" : "Older →"}
      </span>
      <span className="font-serif text-lg font-semibold text-foreground/90 transition-colors group-hover:text-primary">
        {page.title}
      </span>
    </Link>
  );
}

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const page = getBlogPage(params.slug ?? "");

  useEffect(() => {
    if (page) {
      document.title = page.metaTitle;
      // ScrollToHash (App) handles hash targets after client-side navigation.
      if (!window.location.hash) window.scrollTo(0, 0);
    }
  }, [page]);

  if (!page) return <NotFound />;

  const { newer, older } = getAdjacentBlogPages(page.slug);
  const related = (page.post.relatedSectionIds ?? [])
    .map((id) => getSectionPage(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-4xl px-6 py-12 md:px-10 md:py-16 lg:py-20 pb-28 md:pb-28 lg:pb-28">
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
            <li>
              <Link
                href={BLOG_PATH}
                className="underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
              >
                {BLOG_TITLE}
              </Link>
            </li>
            <li aria-hidden="true" className="text-border">/</li>
            <li className="text-foreground/80">{page.title}</li>
          </ol>
        </nav>

        {/* Post header */}
        <header className="mb-16 border-b border-border pb-12">
          <div className="mb-6 inline-block border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-[#FF5F1F]">●</span> {BLOG_TITLE} · {page.date}
          </div>
          <h1 className="mb-6 font-serif text-4xl font-bold leading-tight tracking-tight text-primary md:text-5xl">
            {page.title}
          </h1>
          <p className="max-w-3xl font-serif text-lg italic leading-relaxed text-muted-foreground">
            {page.description}
          </p>
        </header>

        {/* Post body — same renderer as the whitepaper */}
        <article>
          <SectionBody section={page.post.body} subheading="h2" />
        </article>

        {/* Related manifesto sections */}
        {related.length > 0 && (
          <div className="no-print mt-16 flex flex-wrap items-center gap-3 border-t border-border pt-6 font-mono text-[11px] uppercase tracking-widest">
            <span className="text-border">{"// read the specification"}</span>
            {related.map((s) => (
              <Link
                key={s.id}
                href={s.path}
                className="border border-border px-3 py-2 text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
              >
                {s.isAppendix ? `Appendix ${s.appendixLetter}: ${s.navLabel}` : s.navLabel} ↗
              </Link>
            ))}
          </div>
        )}

        {/* Newer / older navigation */}
        {(newer || older) && (
          <nav aria-label="Post navigation" className="no-print mt-16 flex flex-col gap-4 border-t border-border pt-10 sm:flex-row">
            {newer && <NavCard page={newer} direction="newer" />}
            {older && <NavCard page={older} direction="older" />}
          </nav>
        )}

        {/* Footer */}
        <footer className="mt-20 flex flex-col gap-6 border-t border-border pt-8 font-mono text-xs md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-5 leading-relaxed text-muted-foreground">
            <div>
              <div>{content.footer.publishedBy}</div>
              <div>{content.footer.location}</div>
            </div>
            <SocialLinks />
          </div>
          <div className="flex shrink-0 flex-col gap-2 md:items-end">
            <Link
              href={BLOG_PATH}
              className="whitespace-nowrap text-muted-foreground transition-colors hover:text-primary"
            >
              [ All {BLOG_TITLE} Entries ]
            </Link>
            <Link
              href="/"
              className="whitespace-nowrap text-muted-foreground transition-colors hover:text-primary"
            >
              [ Full Specification — v{content.hero.spec.version} ]
            </Link>
          </div>
        </footer>
      </main>

      <AssistantPanel />
    </div>
  );
}
