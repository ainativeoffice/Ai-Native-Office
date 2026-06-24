import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "katex/dist/katex.min.css";
import "./index.css";

const rootEl = document.getElementById("root")!;

if (rootEl.hasChildNodes()) {
  hydrateRoot(rootEl, <App />);
} else {
  createRoot(rootEl).render(<App />);
}
