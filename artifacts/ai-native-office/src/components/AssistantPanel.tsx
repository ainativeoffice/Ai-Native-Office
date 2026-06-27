import { useEffect, useRef, useState } from "react";
import { useAskWhitepaper } from "@workspace/api-client-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SAFETY_ORANGE = "#FF5F1F";

const INTRO =
  "Reference assistant online. Ask anything grounded in this specification — the architecture, the egress economics, the compliance moat, the acoustic/STC mandates, or the technical appendices. Questions outside the document will be declined.";

const SUGGESTIONS = [
  "What is the tripartite ownership model?",
  "Why does STC 55 matter?",
  "How does zero egress lower cost?",
];

export function AssistantPanel() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Gate all rendering until after hydration so the SSG-prerendered HTML never
  // contains the assistant — it is purely additive and activates client-side.
  useEffect(() => setMounted(true), []);

  const { mutate, isPending } = useAskWhitepaper({
    mutation: {
      onSuccess: (data) => {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      },
      onError: (err) => {
        const message =
          err.data && typeof err.data.message === "string"
            ? err.data.message
            : "ERR: Assistant unavailable. Try again.";
        setError(message);
      },
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending, error, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!mounted) return null;

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    mutate({ data: { messages: next.slice(-30) } });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="no-print">
      {/* Launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open the whitepaper assistant"
          className="fixed bottom-5 right-5 z-50 border border-primary bg-background px-5 py-3 font-mono text-[11px] uppercase tracking-widest text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
        >
          <span aria-hidden="true" style={{ color: SAFETY_ORANGE }}>
            &gt;_
          </span>{" "}
          [ Ask the Spec ]
        </button>
      )}

      {/* Panel */}
      {open && (
        <section
          role="dialog"
          aria-label="Whitepaper assistant"
          className="fixed z-50 flex flex-col border border-border bg-background shadow-2xl
            inset-x-3 bottom-3 top-3 sm:inset-auto sm:bottom-5 sm:right-5 sm:top-auto sm:h-[min(80vh,640px)] sm:w-[420px]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <div className="font-mono text-[11px] uppercase tracking-widest">
              <span aria-hidden="true" style={{ color: SAFETY_ORANGE }}>
                ●
              </span>{" "}
              Spec Assistant
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close the assistant"
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
            >
              [ Close ✕ ]
            </button>
          </div>

          {/* Message log */}
          <div
            ref={scrollRef}
            aria-live="polite"
            className="flex-1 space-y-4 overflow-y-auto px-4 py-4 font-mono text-[13px] leading-relaxed"
          >
            <p className="text-muted-foreground">{INTRO}</p>

            {messages.length === 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                  Try
                </div>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="block w-full border border-border px-3 py-2 text-left text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary"
                  >
                    <span aria-hidden="true" className="opacity-50">
                      &gt;{" "}
                    </span>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i}>
                <div
                  className="mb-1 text-[10px] uppercase tracking-widest"
                  style={{ color: m.role === "user" ? undefined : SAFETY_ORANGE }}
                >
                  {m.role === "user" ? "You" : "Assistant"}
                </div>
                <p
                  className={
                    m.role === "user"
                      ? "whitespace-pre-wrap text-foreground"
                      : "whitespace-pre-wrap text-foreground/90"
                  }
                >
                  {m.content}
                </p>
              </div>
            ))}

            {isPending && (
              <div>
                <div
                  className="mb-1 text-[10px] uppercase tracking-widest"
                  style={{ color: SAFETY_ORANGE }}
                >
                  Assistant
                </div>
                <p className="text-muted-foreground">
                  <span className="animate-pulse">▮ querying specification…</span>
                </p>
              </div>
            )}

            {error && (
              <p
                role="status"
                className="text-[12px]"
                style={{ color: "hsl(var(--destructive))" }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={onSubmit}
            className="shrink-0 border-t border-border p-3"
          >
            <label htmlFor="assistant-input" className="sr-only">
              Ask a question about the whitepaper
            </label>
            <div className="flex items-center border border-border bg-transparent font-mono text-[13px] focus-within:border-primary transition-colors">
              <span aria-hidden="true" className="select-none pl-3 pr-1 opacity-50">
                &gt;
              </span>
              <input
                id="assistant-input"
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the specification…"
                disabled={isPending}
                maxLength={4000}
                spellCheck={false}
                className="flex-1 bg-transparent py-3 pr-2 outline-none placeholder:opacity-40 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isPending || input.trim().length === 0}
                className="m-1 border border-primary bg-primary px-3 py-2 text-[11px] uppercase tracking-widest text-primary-foreground transition-colors hover:bg-transparent hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? "…" : "Send"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
