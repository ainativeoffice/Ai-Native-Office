"use client";

import { useState } from "react";
import { content } from "@/lib/content/content";

type Status =
  | { kind: "idle" }
  | { kind: "ok"; message: string }
  | { kind: "err"; message: string };

const { heading, placeholder, submitLabel, layers, successMessage, errorMessage } =
  content.subscribe;

export function SpecificationUpdateFeed() {
  const [email, setEmail] = useState("");
  const [selected, setSelected] = useState<boolean[]>(() => layers.map(() => false));
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, setIsPending] = useState(false);

  const toggle = (index: number) =>
    setSelected((prev) => prev.map((v, i) => (i === index ? !v : v)));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ kind: "idle" });
    setIsPending(true);
    const checkedLayers = layers.filter((_, i) => selected[i]);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, layers: checkedLayers }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus({ kind: "ok", message: data.message || successMessage });
        setEmail("");
        setSelected(layers.map(() => false));
      } else {
        setStatus({ kind: "err", message: data.message || errorMessage });
      }
    } catch {
      setStatus({ kind: "err", message: errorMessage });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <section className="no-print mt-32 pt-16 border-t border-border">
      <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-8">
        {heading}
      </div>

      <form onSubmit={onSubmit} className="max-w-2xl">
        <label htmlFor="rfc-email" className="sr-only">
          {placeholder}
        </label>
        <div className="flex items-center border border-border bg-transparent font-mono text-sm focus-within:border-primary transition-colors">
          <span aria-hidden="true" className="pl-4 pr-2 opacity-50 select-none">
            &gt;
          </span>
          <input
            id="rfc-email"
            type="email"
            required
            autoComplete="email"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={isPending}
            className="flex-1 bg-transparent py-4 pr-4 outline-none placeholder:opacity-40 disabled:opacity-60"
          />
        </div>

        <fieldset className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-px border border-border bg-border">
          <legend className="sr-only">Select your intelligence feed</legend>
          {layers.map((layer, i) => {
            const checked = selected[i];
            return (
              <button
                type="button"
                key={layer}
                role="checkbox"
                aria-checked={checked}
                aria-labelledby={`rfc-layer-${i}`}
                onClick={() => toggle(i)}
                disabled={isPending}
                className="flex items-start gap-3 bg-background p-4 text-left font-mono text-xs sm:text-sm leading-snug hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-60"
              >
                <span aria-hidden="true" className="select-none whitespace-pre">
                  {checked ? "[X]" : "[ ]"}
                </span>
                <span id={`rfc-layer-${i}`}>{layer}</span>
              </button>
            );
          })}
        </fieldset>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="font-mono text-sm uppercase tracking-widest bg-primary text-primary-foreground border border-primary px-6 py-4 hover:bg-transparent hover:text-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? "[ TRANSMITTING... ]" : submitLabel}
          </button>

          {status.kind !== "idle" && (
            <output
              role="status"
              aria-live="polite"
              className="font-mono text-xs sm:text-sm"
              style={{ color: status.kind === "ok" ? "#FF5F1F" : "hsl(var(--destructive))" }}
            >
              {status.message}
            </output>
          )}
        </div>
      </form>
    </section>
  );
}
