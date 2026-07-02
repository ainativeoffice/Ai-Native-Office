# The AI-Native Office

A single-page technical manifesto / whitepaper for "ainativeoffice.org" defining a new commercial real estate asset class — the AI-Native Office — in an institutional-brutalist aesthetic.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/ai-native-office run test` — citation detection/guard unit tests (Node's `node:test` via `tsx`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/ai-native-office run og:gen` — regenerate the OG card (`og-source.svg` version label + `public/opengraph.jpg`) from `content.hero.spec`
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `GA_MEASUREMENT_ID` — GA4 Measurement ID (`G-XXXXXXXXXX`); when set at build time, the prerender injects gtag.js. Unset = no analytics.
- Email capture (api-server): `RESEND_API_KEY` (secret, required to send) — add it in the Replit **Secrets** pane. Optional `RFC_FROM_EMAIL` (default `AI-Native Office <onboarding@resend.dev>`) and `RFC_NOTIFY_EMAIL` (destination inbox for captured subscriptions, default `delivered@resend.dev`).
- Assistant (api-server): `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY` — provisioned via the Replit AI Integrations (OpenAI) setup; the `POST /api/assistant/ask` route refuses to run without them. The key never reaches the client.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/whitepaper/src/` — shared, React-free source of truth for ALL page copy: `content.ts` + `content-archive.ts` (verbatim user content; do not reword) plus `assemble.ts` (`assembleWhitepaperText()`, a plain-text rendering of the whole document used to ground the assistant). Barrel `index.ts` re-exports content + `assembleWhitepaperText`.
- `artifacts/ai-native-office/src/content.ts` — thin re-export of `@workspace/whitepaper`; all 6 artifact importers keep using `@/content`. Edit copy in `lib/whitepaper/src/`, not here.
- `artifacts/ai-native-office/src/components/AssistantPanel.tsx` — brutalist terminal chat widget (fixed `[ Ask the Spec ]` launcher + dialog panel). `no-print`, gated on a `mounted` flag so it is absent from the SSG-prerendered HTML and only activates after hydration. Multi-turn within a session (in-memory `messages` state), posts via the generated `useAskWhitepaper` hook.
- `artifacts/api-server/src/routes/assistant.ts` — Express route `POST /assistant/ask`: validates with generated `AskWhitepaperBody` Zod, builds a system prompt = `assembleWhitepaperText()` + strict "answer only from the document, else decline in-character" rules, calls `openai` (model `gpt-5.4`, `max_completion_tokens`), returns `{ reply }`. Registered in `src/routes/index.ts`.
- `artifacts/ai-native-office/src/pages/Home.tsx` — the single manifesto page; renders everything from `content.ts`. Prose/list/table text runs through `renderText` → `tokenizeCitations` so inline source numbers become `<Citation>` markers.
- `artifacts/ai-native-office/src/lib/citations.ts` — shared, React-free source helpers: `parseCitation` (splits a Works Cited entry into label + URL, used by Home, entry-server JSON-LD), `getSource` (1-based number → `{number,label,url,domain}`), and `tokenizeCitations` (render-time detection of inline citation markers; the period stays as visible text, only the trailing number becomes interactive).
- `artifacts/ai-native-office/src/components/Citation.tsx` — superscript citation marker: a hover-card (radix) whose trigger is an `<a>` to the source URL (new tab); card shows source number + label + domain + "Open in new tab ↗".
- `artifacts/ai-native-office/src/index.css` — carbon-black brutalist theme tokens (bg `hsl(0 0% 4%)`, near-white primary, zero radius) + fonts (Playfair Display serif, JetBrains Mono).
- `artifacts/ai-native-office/index.html` — `<head>` SEO/OpenGraph/Twitter/canonical meta (static).
- `artifacts/ai-native-office/src/entry-server.tsx` — SSR/SSG entry: `render()` (HTML + JSON-LD) and `getLlmsFull()` (markdown generator), both derived from `content.ts`.
- `artifacts/ai-native-office/prerender.mjs` — post-build step: injects SSR HTML + schema.org JSON-LD into `dist/public/index.html` and writes `llms-full.txt`.
- `artifacts/ai-native-office/public/` — static launch assets: `robots.txt`, `sitemap.xml`, `llms.txt`, `favicon.svg`, `opengraph.jpg` (generated from `og-source.svg`).
- `artifacts/ai-native-office/src/components/CopyForLlm.tsx` — "Machine-Readable Transfer" control beneath the hero: SSR-rendered anchor to `${BASE_URL}llms-full.txt` that progressively enhances into a one-click clipboard copy of the full markdown (ClipboardItem-promise first for Safari, `writeText` fallback), with safety-orange `[ COPIED ]` success and a visible raw-file fallback link on clipboard failure. Copy lives in `content.llmExport`. `no-print`.
- `artifacts/ai-native-office/src/components/SpecificationUpdateFeed.tsx` — bottom email-capture form (terminal email input + 4 brutalist Layer toggles + `[ INITIALIZE HANDSHAKE ]`); posts via the generated `useSubscribeToUpdates` hook and shows terminal success (safety-orange `#FF5F1F`) / error (`--destructive` red) states. Copy/Layer labels + footer text live in `content.ts` (`subscribe`, `footer`).
- `lib/api-spec/openapi.yaml` — API contract; `POST /subscribe` (`SubscribeRequest`: email + layers[]) drives generated Zod (`SubscribeToUpdatesBody`) + the React Query hook.
- `artifacts/api-server/src/routes/subscribe.ts` — Express route: validates with the generated Zod schema, then sends the capture (subscriber email + checked Layer labels) via Resend. Registered in `src/routes/index.ts`.

## Architecture decisions

- **SSG via two Vite builds.** Production is a static serve (`dist/public`), so `build` runs: client build → `--ssr entry-server` build → `node prerender.mjs`. Prerender injects fully-rendered HTML so crawlers/LLMs see the entire manifesto with zero JS. Client `main.tsx` `hydrateRoot`s when `#root` already has children, else `createRoot` (dev).
- **wouter SSR** needs `ssrPath`; `App` accepts an optional `ssrPath` prop passed only by `entry-server` (client leaves it undefined to use browser location).
- **JSON-LD + llms-full.txt are generated, not hand-written** — both come from `content.ts` at build time, so they never drift from the rendered copy. JSON-LD is a schema.org `TechArticle` with the full `citation` list.
- **OG image is vector-first**: `og-source.svg` is rasterized to `public/opengraph.jpg` (1200×630) with ImageMagick `magick` for crisp brutalist text; regenerate via `og:gen` after editing the SVG.
- **Version/status label has one source of truth: `content.hero.spec`.** `src/lib/spec.ts` derives every label form from it — `specStatusShort()` pulls the parenthetical abbreviation (`Request for Comment (RFC)` → `RFC`), `specMetaLabel()`/`metaTitle()` build the page title. The prerender injects `metaTitle()` into `<title>`/`og:title`/`twitter:title` (hardcoded strings in `index.html` are dev-only fallbacks), JSON-LD reads `content.hero.spec` directly, and `gen-og.ts` substitutes the OG SVG label + rerasters. Bump `content.ts` then rebuild + run `og:gen` to update every surface; no hand-edited version copies remain.
- **Canonical domain is `https://ainativeoffice.org`** — hardcoded in meta, sitemap, robots, and JSON-LD.
- **Inline citations are detected at render time, never annotated in `content.ts`.** `tokenizeCitations` finds a 1–2 digit source number (1..worksCited.length) glued to a word via a period (`streams.1`, `(SCIF).26`). The period is kept as visible text; only the trailing number becomes a `<Citation>`. Digit-before-period cases are accepted only when 2-digit and not followed by a unit, so genuine `rating + cite` markers (`STC 35.25`, `batch size of 1.34`) are caught while decimals/versions/units (`1.25 Mbps`, `Llama 3.1`, `96.58%`, `H.264`, `0.090`) are excluded. Markers are anchors to the source URL, so they appear in the prerendered HTML and degrade to plain source links without JS (the hover card is radix, client-only). Table "Source Notes" cells (pure 1–2 digit numbers) are also rendered as `<Citation>`.
- **Email capture is contract-first + server-side.** `POST /api/subscribe` is defined in `openapi.yaml`; codegen produces the Zod validator (`SubscribeToUpdatesBody`) and the `useSubscribeToUpdates` React Query hook. The api-server route holds `RESEND_API_KEY` (never client-exposed) and emails the subscriber address + checked Layer labels via Resend, returning terminal `{ ok, message }`. The form is SSR-rendered (degrades to static markup without JS) and only calls the API after hydration. The footer "Changelog v…" label derives from `content.hero.spec.version` (single source of truth).
- **Social graph has one source of truth: `content.footer.social`.** Each entry holds `platform`/`label`/`url` (X also has `handle`). `SocialLinks.tsx` renders the footer connect chips from it; `entry-server.tsx` derives the JSON-LD `sameAs` (author + publisher) and `meta.twitterHandle` from it; `prerender.mjs` injects `twitter:site`/`twitter:creator` from `meta.twitterHandle` (hardcoded handle in `index.html` is a dev-only fallback). Add/change a profile in `content.ts`, rebuild, and every surface updates.
- **Reader assistant is full-context grounding, not RAG.** The whole document is rendered to plain text once (`assembleWhitepaperText()` in `lib/whitepaper`, derived from the same `content.ts` as `getLlmsFull`) and embedded in the system prompt — no embeddings, vector DB, or retrieval. The prompt instructs the model to answer only from the document and otherwise decline in-character (off-topic questions are refused). Contract-first + server-side like email capture: `POST /api/assistant/ask` is defined in `openapi.yaml` (`AssistantConversation` → `AssistantReply`), codegen produces the `AskWhitepaperBody` Zod validator + `useAskWhitepaper` hook, and the OpenAI key lives only in the api-server. Multi-turn is achieved by the client posting the full `messages` array each turn (stateless server, in-memory session on the client). The widget is `mounted`-gated so the SSG HTML never includes it (purely additive, post-hydration).
- **Whitepaper copy lives in a shared lib.** `content.ts` + `content-archive.ts` moved to `lib/whitepaper/src/` so both the artifact (React) and the api-server (assistant grounding) consume one verbatim source. The artifact's `src/content.ts` is now a re-export; edit copy in the lib.
- **Analytics is build-time, not runtime.** `prerender.mjs` injects the gtag.js snippet into `<head>` only when `GA_MEASUREMENT_ID` is set (validated against `G-XXXXXXXXXX`). Dev (`vite dev`) skips prerender, so it never loads analytics — keeps dev/preview clean and avoids tracking non-prod traffic.

## Product

A single-page technical manifesto / whitepaper ("The End of the Cloud-Native Illusion") defining the AI-Native Office commercial real estate asset class. Fully pre-rendered for SEO and LLM ingestion: server-readable HTML, sitemap, robots (AI bots welcomed), schema.org JSON-LD, `llms.txt` + `llms-full.txt`, all ~45 sources linked out, brutalist favicon, and a 1200×630 OpenGraph card.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `pnpm build` requires `PORT` and `BASE_PATH` env (vite.config throws without them); the production workflow injects these. From bash use `PORT=20280 BASE_PATH=/ pnpm --filter @workspace/ai-native-office run build`.
- After editing `og-source.svg` or bumping the spec version, regenerate the OG image with `pnpm --filter @workspace/ai-native-office run og:gen` (it re-syncs the version label from `content.hero.spec` then rasterizes). It shells out to `magick`, which is slow in this env (~75s) — be patient. Raw command equivalent: `magick -density 192 -background '#0A0A0A' og-source.svg -resize 1200x630 -quality 90 public/opengraph.jpg`.
- `llms-full.txt` and the prerendered `index.html` are build outputs — never hand-edit them; change `content.ts` / `entry-server.tsx` and rebuild.
- The OG image uses generic `serif`/`monospace` font families on purpose (Playfair/JetBrains aren't installed for the rasterizer); keep headline ≤ ~84px so it stays inside the frame.
- **Citation source count is at the hard 2-digit ceiling (99 sources).** A 100th cited source is unrepresentable (the tokenizer only matches 1–2 digit markers) without redesigning `citations.ts`. Also, the source-range check no longer disambiguates digit-before-period decimals: at 99 sources every 2-digit value (`X.47..X.99`) is in range, so a decimal like `43.79 tokens` would render as a false citation unless the trailing word is in the `UNIT` allowlist. When adding sources or new prose, grep for `[0-9]\.[0-9]{2}` and add any new metric word (e.g. `tokens`) to `UNIT` in `src/lib/citations.ts` — do not reword verbatim copy. The `findBrokenCitations` build guard does NOT catch these (it only flags out-of-range word-glued markers).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
