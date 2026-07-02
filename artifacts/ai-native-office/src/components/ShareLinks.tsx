import { useState } from "react";
import { FaLinkedinIn, FaXTwitter, FaRegCopy, FaCheck } from "react-icons/fa6";
import { content } from "@/content";
import { CANONICAL_URL } from "@/lib/spec";

/**
 * Reader-facing share strip rendered in the institutional footer beneath the
 * connect chips. Turns every reader into a distribution channel: bordered mono
 * "chips" (matching SocialLinks) open prefilled LinkedIn / X share intents for
 * the canonical URL, plus a copy-link control for non-social sharing.
 *
 * The share targets are SSR-rendered as real anchors (degrade to plain links
 * without JS); the copy control only acts after hydration.
 */
const chip =
  "group inline-flex items-center gap-2 border border-border px-3 py-2 text-muted-foreground transition-all hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary focus-visible:text-primary";

export function ShareLinks() {
  const { share } = content;
  const [copied, setCopied] = useState(false);

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    CANONICAL_URL,
  )}`;
  const xUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    CANONICAL_URL,
  )}&text=${encodeURIComponent(share.text)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CANONICAL_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[0.65rem] uppercase tracking-[0.2em] opacity-40">{share.heading}</span>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn (opens in a new tab)"
          className={chip}
        >
          <FaLinkedinIn aria-hidden className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">LinkedIn</span>
          <span aria-hidden className="opacity-40 transition-opacity group-hover:opacity-100">
            ↗
          </span>
        </a>
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X (opens in a new tab)"
          className={chip}
        >
          <FaXTwitter aria-hidden className="h-3.5 w-3.5" />
          <span className="whitespace-nowrap">X</span>
          <span aria-hidden className="opacity-40 transition-opacity group-hover:opacity-100">
            ↗
          </span>
        </a>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? share.copiedLabel : share.copyLabel}
          aria-live="polite"
          className={chip}
        >
          {copied ? (
            <FaCheck aria-hidden className="h-3.5 w-3.5 text-primary" />
          ) : (
            <FaRegCopy aria-hidden className="h-3.5 w-3.5" />
          )}
          <span className="whitespace-nowrap">{copied ? share.copiedLabel : share.copyLabel}</span>
        </button>
      </div>
    </div>
  );
}
