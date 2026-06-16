# The AI-Native Office

A single-page technical manifesto / whitepaper for "ainativeoffice.org" defining a new commercial real estate asset class — the AI-Native Office — in an institutional-brutalist aesthetic.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ai-native-office/src/content.ts` — source of truth for ALL page copy (hero, sections, subsections, tables, works cited). Verbatim user content; do not reword.
- `artifacts/ai-native-office/src/pages/Home.tsx` — the single manifesto page; renders everything from `content.ts`.
- `artifacts/ai-native-office/src/index.css` — carbon-black brutalist theme tokens (bg `hsl(0 0% 4%)`, near-white primary, zero radius) + fonts (Playfair Display serif, JetBrains Mono).
- `artifacts/ai-native-office/index.html` — `<head>` SEO/OpenGraph/Twitter/canonical meta (static).
- `artifacts/ai-native-office/src/entry-server.tsx` — SSR/SSG entry: `render()` (HTML + JSON-LD) and `getLlmsFull()` (markdown generator), both derived from `content.ts`.
- `artifacts/ai-native-office/prerender.mjs` — post-build step: injects SSR HTML + schema.org JSON-LD into `dist/public/index.html` and writes `llms-full.txt`.
- `artifacts/ai-native-office/public/` — static launch assets: `robots.txt`, `sitemap.xml`, `llms.txt`, `favicon.svg`, `opengraph.jpg` (generated from `og-source.svg`).

## Architecture decisions

- **SSG via two Vite builds.** Production is a static serve (`dist/public`), so `build` runs: client build → `--ssr entry-server` build → `node prerender.mjs`. Prerender injects fully-rendered HTML so crawlers/LLMs see the entire manifesto with zero JS. Client `main.tsx` `hydrateRoot`s when `#root` already has children, else `createRoot` (dev).
- **wouter SSR** needs `ssrPath`; `App` accepts an optional `ssrPath` prop passed only by `entry-server` (client leaves it undefined to use browser location).
- **JSON-LD + llms-full.txt are generated, not hand-written** — both come from `content.ts` at build time, so they never drift from the rendered copy. JSON-LD is a schema.org `TechArticle` with the full `citation` list.
- **OG image is vector-first**: `og-source.svg` is rasterized to `public/opengraph.jpg` (1200×630) with ImageMagick `magick` for crisp brutalist text; regenerate after editing the SVG.
- **Canonical domain is `https://ainativeoffice.org`** — hardcoded in meta, sitemap, robots, and JSON-LD.

## Product

A single-page technical manifesto / whitepaper ("The End of the Cloud-Native Illusion") defining the AI-Native Office commercial real estate asset class. Fully pre-rendered for SEO and LLM ingestion: server-readable HTML, sitemap, robots (AI bots welcomed), schema.org JSON-LD, `llms.txt` + `llms-full.txt`, all ~45 sources linked out, brutalist favicon, and a 1200×630 OpenGraph card.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `pnpm build` requires `PORT` and `BASE_PATH` env (vite.config throws without them); the production workflow injects these. From bash use `PORT=20280 BASE_PATH=/ pnpm --filter @workspace/ai-native-office run build`.
- After editing `og-source.svg`, regenerate the OG image: `magick -density 192 -background '#0A0A0A' og-source.svg -resize 1200x630 -quality 90 public/opengraph.jpg`.
- `llms-full.txt` and the prerendered `index.html` are build outputs — never hand-edit them; change `content.ts` / `entry-server.tsx` and rebuild.
- The OG image uses generic `serif`/`monospace` font families on purpose (Playfair/JetBrains aren't installed for the rasterizer); keep headline ≤ ~84px so it stays inside the frame.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
