import { lazy, Suspense, useEffect, useState } from "react";

// The panel implementation (and its API-client/mutation code) is split into
// its own chunk so the main bundle stays lean. Loading is still gated on a
// `mounted` flag so the SSG-prerendered HTML never contains the assistant —
// it is purely additive and activates client-side after hydration.
const AssistantPanelBody = lazy(() =>
  import("./AssistantPanelBody").then((m) => ({
    default: m.AssistantPanelBody,
  })),
);

export function AssistantPanel() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Suspense fallback={null}>
      <AssistantPanelBody />
    </Suspense>
  );
}
