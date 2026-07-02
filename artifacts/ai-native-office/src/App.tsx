import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SectionPage from "@/pages/SectionPage";
import BlogIndex from "@/pages/BlogIndex";
import BlogPost from "@/pages/BlogPost";

const queryClient = new QueryClient();

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
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
