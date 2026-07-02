import React from "react";

/**
 * Discreet "back to top" affordance for the very long single-page manifesto.
 * Appears only after the reader has scrolled roughly two viewports deep and
 * hides again near the top. Renders nothing until then, so the SSG-prerendered
 * HTML never includes it (purely additive, post-hydration — like AssistantPanel).
 *
 * `window.scrollTo({ top: 0 })` deliberately omits `behavior`: the browser then
 * consults the CSS `scroll-behavior` on <html>, which is smooth only under
 * `prefers-reduced-motion: no-preference` (see index.css) — so reduced-motion
 * readers get an instant jump for free.
 */
export function BackToTop() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      setVisible(window.scrollY > window.innerHeight * 2);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0 })}
      className="no-print fixed bottom-16 right-3 z-40 border border-border bg-background px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-primary sm:bottom-20 sm:right-5 sm:px-5 sm:py-3 sm:text-[11px]"
    >
      [ ↑ Top ]
    </button>
  );
}
