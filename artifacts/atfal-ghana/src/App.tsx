import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
