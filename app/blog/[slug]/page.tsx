import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  blogPages,
  getBlogPage,
  getAdjacentBlogPages,
  BLOG_PATH,
} from "@/lib/content/blogPages";
import { getSectionPage } from "@/lib/content/sectionPages";
import { SectionBody } from "@/components/whitepaper/WhitepaperBody";
import { ShareLinks } from "@/components/ShareLinks";
import { SocialLinks } from "@/components/SocialLinks";
import { BackToTop } from "@/components/BackToTop";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getBlogPage(slug);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.description,
    alternates: { canonical: page.url },
    openGraph: {
      title: page.metaTitle,
      description: page.description,
      url: page.url,
      type: "article",
      publishedTime: page.date,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const page = getBlogPage(slug);
  if (!page) notFound();

  const { newer, older } = getAdjacentBlogPages(slug);

  const relatedSections = (page.post.relatedSectionIds ?? [])
    .map((id) => getSectionPage(id))
    .filter(Boolean);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-border px-7 py-5 flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em]">
        <Link
          href={BLOG_PATH}
          className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
        >
          &larr; RFC Log
        </Link>
        <span className="hidden sm:block text-border">AI-Native Office</span>
        <ShareLinks />
      </header>

      <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto px-7 py-20 md:px-12 md:py-24 lg:px-16">
        {/* Meta */}
        <div className="mb-5 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <time dateTime={page.date}>
            {new Date(page.date + "T00:00:00").toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-serif font-medium leading-[1.04] tracking-[-0.035em] mb-8 text-foreground text-balance">
          {page.title}
        </h1>

        <p className="mb-14 max-w-2xl font-serif italic text-lg leading-[1.7] text-foreground/70 border-l-[3px] border-primary pl-7">
          {page.description}
        </p>

        {/* Body — reuses the whitepaper section renderer */}
        <SectionBody section={page.post.body} subheading="h2" />

        {/* Related sections */}
        {relatedSections.length > 0 && (
        <aside className="mt-20 border border-border bg-card/50 p-7">
          <div className="mb-5 font-mono text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
              Read the Specification
            </div>
            <ul className="flex flex-col gap-3">
              {relatedSections.map((sp) => (
                <li key={sp!.id}>
                  <Link
                    href={sp!.path}
                    className="group flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
                  >
                    <div className="w-2 h-2 bg-transparent border border-muted group-hover:border-primary group-hover:bg-primary shrink-0 transition-colors" />
                    <span>{sp!.navLabel}</span>
                    <span className="ml-auto text-border group-hover:text-primary/50">&rarr;</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* Prev / Next */}
        <nav
          aria-label="Post navigation"
          className="mt-16 pt-8 border-t border-border grid grid-cols-2 gap-6 font-mono text-xs uppercase tracking-widest"
        >
          <div>
            {newer && (
              <Link
                href={newer.path}
                className="group flex flex-col gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="text-border group-hover:text-primary/50">&larr; Newer</span>
                <span className="normal-case tracking-normal font-serif text-sm text-foreground/80 group-hover:text-primary">
                  {newer.title}
                </span>
              </Link>
            )}
          </div>
          <div className="flex flex-col items-end text-right">
            {older && (
              <Link
                href={older.path}
                className="group flex flex-col gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <span className="text-border group-hover:text-primary/50">Older &rarr;</span>
                <span className="normal-case tracking-normal font-serif text-sm text-foreground/80 group-hover:text-primary">
                  {older.title}
                </span>
              </Link>
            )}
          </div>
        </nav>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row md:items-center md:justify-between gap-6 font-mono text-xs text-muted-foreground">
          <SocialLinks />
          <Link
            href={BLOG_PATH}
            className="transition-colors hover:text-primary"
          >
            [ All Posts ]
          </Link>
        </footer>
      </main>

      <BackToTop />
    </div>
  );
}
