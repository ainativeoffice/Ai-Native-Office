import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { content } from "@/lib/content/content";

const ICONS = {
  linkedin: FaLinkedinIn,
  x: FaXTwitter,
} as const;

/**
 * Institutional social connect strip. Each profile is a bordered mono chip
 * that lifts to the safety-orange primary accent on hover/focus.
 */
export function SocialLinks() {
  return (
    <nav aria-label="Connect on social media" className="flex items-center gap-2">
      {content.footer.social.map((s) => {
        const Icon = ICONS[s.platform as keyof typeof ICONS];
        if (!Icon) return null;
        return (
          <a
            key={s.platform}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Connect with the AI-Native Office on ${s.label} (opens in a new tab)`}
            className="group inline-flex items-center gap-2 border border-border px-3 py-2 text-muted-foreground transition-all hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary focus-visible:text-primary"
          >
            <Icon aria-hidden className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">{s.label}</span>
            <span aria-hidden className="opacity-40 transition-opacity group-hover:opacity-100">
              ↗
            </span>
          </a>
        );
      })}
    </nav>
  );
}
