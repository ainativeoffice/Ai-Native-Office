import { useRef, useState } from "react";
import { content } from "@/content";
import { SITE_URL } from "@/lib/spec";
import { trackEvent } from "@/lib/analytics";

/**
 * "Copy the full document for your LLM" control, surfaced beneath the hero.
 * Copies the complete machine-readable manifesto (the served `llms-full.txt`
 * static asset, generated at build time from `content.ts`) to the clipboard
 * in one click, so a reader can paste it straight into ChatGPT/Claude/etc.
 *
 * Progressive enhancement: the control is SSR-rendered as a real anchor to
 * the raw file, so without JS (or before hydration) it simply opens
 * `llms-full.txt`. After hydration the click is intercepted and turned into
 * a fetch + clipboard write. If the clipboard is blocked or the fetch fails,
 * a visible fallback link to the raw file is surfaced instead.
 *
 * All copy lives in `content.llmExport` (single source of truth).
 */

const RAW_PATH = `${import.meta.env.BASE_URL}llms-full.txt`;

const {
  heading,
  description,
  buttonLabel,
  pendingLabel,
  copiedLabel,
  successMessage,
  errorMessage,
  fallbackLabel,
  openPrompt,
  openChatGptLabel,
  openClaudeLabel,
  openPerplexityLabel,
} = content.llmExport;

/**
 * Deep links that open the reader's LLM with a prefilled prompt pointing at
 * the canonical public `llms-full.txt` (the LLM fetches it from the live
 * site, so this must be the production URL, not a relative path). Plain
 * SSR-rendered anchors — they work without JS.
 *
 * Only providers with a verified native prefill URL are listed. Gemini is
 * deliberately absent: gemini.google.com ignores `?q=`/`?prompt=` (prefill
 * only works via browser extensions), so a chip would open an empty chat.
 */
const LLM_PROMPT = encodeURIComponent(`${openPrompt} ${SITE_URL}/llms-full.txt`);

const LLM_DEEP_LINKS = [
  { provider: "chatgpt", label: openChatGptLabel, href: `https://chatgpt.com/?q=${LLM_PROMPT}` },
  { provider: "claude", label: openClaudeLabel, href: `https://claude.ai/new?q=${LLM_PROMPT}` },
  {
    provider: "perplexity",
    label: openPerplexityLabel,
    href: `https://www.perplexity.ai/search?q=${LLM_PROMPT}`,
  },
];

type Status = "idle" | "pending" | "copied" | "error";

async function fetchDocument(): Promise<string> {
  const res = await fetch(RAW_PATH);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.text();
}

/**
 * Safari revokes the transient user activation once an `await` yields, which
 * makes `writeText` after a fetch fail there. `ClipboardItem` accepts a
 * promise for exactly this case, so prefer it and fall back to plain
 * `writeText` where `ClipboardItem` (or promise support) is missing.
 */
async function copyDocument(): Promise<void> {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      const item = new ClipboardItem({
        "text/plain": fetchDocument().then(
          (text) => new Blob([text], { type: "text/plain" }),
        ),
      });
      await navigator.clipboard.write([item]);
      return;
    } catch {
      // Fall through to the writeText path below.
    }
  }
  const text = await fetchDocument();
  await navigator.clipboard.writeText(text);
}

export function CopyForLlm() {
  const [status, setStatus] = useState<Status>("idle");
  const resetTimer = useRef<number | undefined>(undefined);

  const onClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (status === "pending") return;
    trackEvent("llm_copy");
    window.clearTimeout(resetTimer.current);
    setStatus("pending");
    try {
      await copyDocument();
      setStatus("copied");
      resetTimer.current = window.setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
    }
  };

  const label =
    status === "pending" ? pendingLabel : status === "copied" ? copiedLabel : buttonLabel;

  return (
    <section aria-label={heading} className="no-print mb-24 border border-border p-6 sm:p-8">
      <div className="mb-3 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span aria-hidden="true" className="text-primary/80">
          ▚
        </span>{" "}
        {heading}
      </div>
      <p className="mb-6 max-w-2xl font-mono text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <a
          href={RAW_PATH}
          onClick={onClick}
          aria-live="polite"
          className="inline-block whitespace-nowrap border border-primary bg-primary px-6 py-4 font-mono text-xs sm:text-sm uppercase tracking-widest text-primary-foreground transition-colors hover:bg-transparent hover:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
          style={status === "copied" ? { background: "#FF5F1F", borderColor: "#FF5F1F", color: "#0A0A0A" } : undefined}
        >
          {label}
        </a>
        {LLM_DEEP_LINKS.map(({ provider, label: linkLabel, href }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("llm_open", { provider })}
            className="inline-block whitespace-nowrap border border-border px-4 py-3 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary focus-visible:text-primary"
          >
            {linkLabel}
          </a>
        ))}
        {status === "copied" && (
          <output role="status" aria-live="polite" className="font-mono text-xs sm:text-sm" style={{ color: "#FF5F1F" }}>
            {successMessage}
          </output>
        )}
        {status === "error" && (
          <output
            role="status"
            aria-live="polite"
            className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs sm:text-sm"
            style={{ color: "hsl(var(--destructive))" }}
          >
            <span>{errorMessage}</span>
            <a
              href={RAW_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline decoration-dotted underline-offset-4 transition-colors hover:decoration-solid"
            >
              [ {fallbackLabel} ]
            </a>
          </output>
        )}
      </div>
    </section>
  );
}
