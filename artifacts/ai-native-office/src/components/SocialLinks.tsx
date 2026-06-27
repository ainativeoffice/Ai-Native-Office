import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { content } from "@/content";

const ICONS = {
  linkedin: FaLinkedinIn,
  x: FaXTwitter,
} as const;

/**
 * Elegant, on-brand social connect strip rendered in the institutional footer.
 * Each profile is a bordered mono "chip" that lifts to the safety-orange primary
 * accent on hover/focus, opening in a new tab. URLs are sourced from
 * `content.footer.social` (single source of truth, also feeds JSON-LD `sameAs`).
 */
export function SocialLinks() {
  return (
    <nav aria-label="Connect on social media" className="flex items-center gap-2">
      {content.footer.social.map((s) => {
        const Icon = ICONS[s.platform];
        return (
          <a
            key={s.platform}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Connect with the AI-Native Office on ${s.label} (opens in a new tab)`}
            className="group inline-flex items-center gap-2 border border-border px-3 py-2 opacity-70 transition-all hover:border-primary hover:text-primary hover:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary focus-visible:text-primary focus-visible:opacity-100"
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
