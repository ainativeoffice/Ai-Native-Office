import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SectionPage from "@/pages/SectionPage";
import BlogIndex from "@/pages/BlogIndex";
import BlogPost from "@/pages/BlogPost";
import Signals from "@/pages/Signals";

const queryClient = new QueryClient();

/**
 * After a client-side navigation lands on a route with a `#hash`, scroll to
 * the target element once the new page has rendered. Direct hash loads are
 * handled natively by the browser (the HTML is prerendered); this covers
 * wouter navigations, which would otherwise land at the top of the page.
 */
function ScrollToHash() {
  const [location] = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    let attempts = 0;
    let raf = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        el.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      } else if (attempts++ < 30) {
        raf = requestAnimationFrame(tryScroll);
      }
    };
    raf = requestAnimationFrame(tryScroll);
    return () => cancelAnimationFrame(raf);
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sections/:id" component={SectionPage} />
      <Route path="/sections/:id/" component={SectionPage} />
      <Route path="/blog" component={BlogIndex} />
      <Route path="/blog/" component={BlogIndex} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/blog/:slug/" component={BlogPost} />
      <Route path="/signals" component={Signals} />
      <Route path="/signals/" component={Signals} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App({ ssrPath }: { ssrPath?: string }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter
          base={import.meta.env.BASE_URL.replace(/\/$/, "")}
          ssrPath={ssrPath}
        >
          <a href="#main-content" className="skip-link no-print">
            [ Skip to content ]
          </a>
          <ScrollToHash />
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
