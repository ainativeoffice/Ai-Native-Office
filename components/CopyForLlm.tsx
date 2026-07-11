"use client";

import { useRef, useState } from "react";
import { content } from "@/lib/content/content";
import { SITE_URL } from "@/lib/content/spec";

const RAW_PATH = "/llms-full.txt";

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
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (status === "pending") return;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setStatus("pending");
    try {
      await copyDocument();
      setStatus("copied");
      resetTimer.current = setTimeout(() => setStatus("idle"), 4000);
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
