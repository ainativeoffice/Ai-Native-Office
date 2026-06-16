import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { render, getLlmsFull } = await import(
  path.join(__dirname, "dist/server/entry-server.js")
);

const indexPath = path.join(__dirname, "dist/public/index.html");
let template = readFileSync(indexPath, "utf-8");

const { html, head } = render();

if (!template.includes('<div id="root"></div>')) {
  throw new Error('Prerender failed: could not find <div id="root"></div> in built index.html');
}
if (!template.includes("</head>")) {
  throw new Error("Prerender failed: could not find </head> in built index.html");
}

template = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
template = template.replace("</head>", `    ${head}\n  </head>`);

writeFileSync(indexPath, template);

const llmsFull = getLlmsFull();
writeFileSync(path.join(__dirname, "dist/public/llms-full.txt"), llmsFull);
writeFileSync(path.join(__dirname, "public/llms-full.txt"), llmsFull);

console.log("Prerender complete: static HTML, JSON-LD, and llms-full.txt written.");
