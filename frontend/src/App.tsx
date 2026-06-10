import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "next-themes";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import Login from "@/pages/Login";

const Dashboard     = lazy(() => import("@/pages/Dashboard"));
const MemberList    = lazy(() => import("@/pages/members/MemberList"));
const MemberWizard  = lazy(() => import("@/pages/members/MemberWizard"));
const MemberProfile = lazy(() => import("@/pages/members/MemberProfile"));
const Graduations   = lazy(() => import("@/pages/Graduations"));
const Analytics     = lazy(() => import("@/pages/Analytics"));
const Locations     = lazy(() => import("@/pages/Locations"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function Router() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </AppLayout>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <div className="h-10 w-10 rounded-full bg-primary/20 animate-pulse mx-auto" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" attribute="class">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppProvider>
              <TooltipProvider>
                <AppContent />
                <Toaster richColors position="top-right" />
              </TooltipProvider>
            </AppProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
