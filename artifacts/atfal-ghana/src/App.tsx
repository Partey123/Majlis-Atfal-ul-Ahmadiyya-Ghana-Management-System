import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "next-themes";
import { AppProvider } from "@/context/AppContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import Dashboard from "@/pages/Dashboard";
import MemberList from "@/pages/members/MemberList";
import MemberWizard from "@/pages/members/MemberWizard";
import MemberProfile from "@/pages/members/MemberProfile";
import Graduations from "@/pages/Graduations";
import Analytics from "@/pages/Analytics";
import Locations from "@/pages/Locations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/members" component={MemberList} />
        <Route path="/members/new" component={MemberWizard} />
        <Route path="/members/:id" component={MemberProfile} />
        <Route path="/graduations" component={Graduations} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/locations" component={Locations} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" attribute="class">
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <ErrorBoundary>
                  <Router />
                </ErrorBoundary>
              </WouterRouter>
              <Toaster richColors position="top-right" />
            </TooltipProvider>
          </AppProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
