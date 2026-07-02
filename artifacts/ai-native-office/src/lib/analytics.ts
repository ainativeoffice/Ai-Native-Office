/**
 * Thin GA4 event helper. gtag.js is injected at build time by prerender.mjs
 * only when GA_MEASUREMENT_ID is set, so `window.gtag` may not exist (dev,
 * preview, or analytics unset). This wrapper no-ops silently in that case —
 * never throw, never block the user action.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params?: Record<string, string>): void {
  if (typeof window === "undefined") return;
  try {
    window.gtag?.("event", name, params);
  } catch {
    // Analytics must never break the page.
  }
}
