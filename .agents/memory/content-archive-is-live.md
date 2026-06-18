---
name: content-archive.ts is live, not dormant
description: The misleadingly-named content-archive.ts feeds rendered output via content.ts
---

`artifacts/ai-native-office/src/content-archive.ts` is NOT archived/dead code despite its name. `content.ts` does `import { archivedSections } from "./content-archive"` and renders them (the manifesto appendices), so they appear in the page, the prerendered HTML, and the generated `llms-full.txt`.

**Why:** A brand/content scrub that only edited `content.ts` left one stale "Native Agentic" mention in `content-archive.ts` that still rendered. The name implies it's safe to skip; it isn't.

**How to apply:** Any global copy edit, brand scrub, or content find-replace must include `content-archive.ts`, not just `content.ts`. Grep both. The build-time `llms-full.txt`/prerendered HTML is the ground truth for "what actually renders" — grep the built output to catch missed source mentions.
