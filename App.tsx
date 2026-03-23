import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuthMe } from "@/hooks/use-auth";

import AppLayout from "@/components/AppLayout";
import PublicLayout from "@/pages/PublicLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Skills from "@/pages/Skills";
import Reseller from "@/pages/Reseller";
import Referral from "@/pages/Referral";
import Admin from "@/pages/Admin";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import SubscriptionPolicy from "@/pages/SubscriptionPolicy";
import Contact from "@/pages/Contact";
import InviteRegister from "@/pages/InviteRegister";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useAuthMe();

  useEffect(() => {
    if (!isLoading && !user && location !== "/login" && location !== "/register") {
      setLocation("/login");
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useAuthMe();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return <Component />;
}

function PolicyRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading } = useAuthMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (user) {
    return (
      <AppLayout>
        <Component />
      </AppLayout>
    );
  }

  return (
    <PublicLayout>
      <Component />
    </PublicLayout>
  );
}

function Router() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (location === "/") {
      setLocation("/dashboard");
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/login">
        <PublicRoute component={Login} />
      </Route>
      <Route path="/register">
        <PublicRoute component={Register} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/skills">
        <ProtectedRoute component={Skills} />
      </Route>
      <Route path="/reseller">
        <ProtectedRoute component={Reseller} />
      </Route>
      <Route path="/referral">
        <ProtectedRoute component={Referral} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={Admin} />
      </Route>
      <Route path="/privacy">
        <PolicyRoute component={PrivacyPolicy} />
      </Route>
      <Route path="/terms">
        <PolicyRoute component={TermsOfService} />
      </Route>
      <Route path="/subscription-policy">
        <PolicyRoute component={SubscriptionPolicy} />
      </Route>
      <Route path="/contact">
        <PolicyRoute component={Contact} />
      </Route>
      <Route path="/invite/:token">
        <InviteRegister />
      </Route>
      <Route path="/">
        <div />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "font-sans border rounded-xl shadow-lg",
          style: { background: "hsl(var(--card))", color: "hsl(var(--foreground))" }
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
