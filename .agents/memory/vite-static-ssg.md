---
name: Static Vite artifact SSG / prerender
description: Pattern for pre-rendering a client-only React+Vite SPA to static HTML so crawlers/LLMs see full content, when production serves dist/public statically.
---

# Pre-rendering a static-served Vite SPA

**When this applies:** an `artifacts/*` web artifact whose `artifact.toml` has
`services.production.serve = "static"` + `publicDir = dist/public`. There is no
runtime server in prod, so SEO/LLM-readable HTML must be baked at build time.

## The working pattern (two Vite builds + a node prerender)
1. `build` script = client build `&&` `vite build --ssr src/entry-server.tsx --outDir dist/server` `&&` `node prerender.mjs`.
2. `entry-server.tsx` exports `render()` (returns `{ html, head }` via `renderToString(<App ssrPath="/" />)`) and any generated text (e.g. `getLlmsFull()` markdown) — derive everything from the single content source so generated artifacts never drift.
3. `prerender.mjs` reads built `dist/public/index.html`, replaces `<div id="root"></div>` with `<div id="root">${html}</div>`, injects JSON-LD before `</head>`, writes back. It dynamically `import()`s the compiled `dist/server/entry-server.js`.
4. Client `main.tsx`: `hydrateRoot` when `#root.hasChildNodes()` (prod, prerendered), else `createRoot` (dev `vite dev` has empty root).

**Why two builds:** the SSR bundle is plain JS that node can import; you cannot `import` a `.ts` content module directly in a node script without a loader.

## Gotchas (cost real time)
- `vite build` for these artifacts **throws without `PORT` and `BASE_PATH` env**. The prod workflow injects them; from bash run `PORT=<port> BASE_PATH=/ pnpm --filter @workspace/<slug> run build`.
- **wouter** needs an explicit `ssrPath` prop during SSR or it touches the missing `location` global. Make `App` accept optional `ssrPath`, pass it only from the server entry.
- Escape `<` to `\u003c` when embedding JSON-LD in a `<script>` tag.
- esbuild/vite build does NOT typecheck — run the package `typecheck` separately; pre-existing union-narrowing errors in content-driven pages may surface.

## OG image without a headless browser
ImageMagick (`magick`, not the deprecated `convert`) is available in the Replit
runtime. Author the card as an SVG and rasterize:
`magick -density 192 -background '#0A0A0A' og-source.svg -resize 1200x630 -quality 90 public/opengraph.jpg`.
Custom web fonts (Playfair, JetBrains) are NOT installed for the rasterizer — use
generic `serif`/`monospace` families and size headings to fit the frame, or text clips.
