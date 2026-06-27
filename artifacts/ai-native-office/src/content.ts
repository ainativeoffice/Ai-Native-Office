/**
 * The page content tree is the single source of truth for all copy. It now
 * lives in the shared `@workspace/whitepaper` lib so that both this artifact
 * (rendering + SSG) and the api-server (grounding the Q&A assistant) read from
 * the exact same source and can never drift. This module re-exports it so all
 * existing `@/content` / `./content` imports keep working unchanged.
 */
export * from "@workspace/whitepaper";
