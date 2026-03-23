import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Briefcase, LogOut, LayoutDashboard, Settings, Users, Gift, Shield, Bell, X } from "lucide-react";
import { useAuthMe, useLogout } from "@/hooks/use-auth";
import InactiveSubscription from "@/pages/InactiveSubscription";
import { cn } from "@/lib/utils";

function SubscriptionBanner({ status, expiresAt }: { status: string; expiresAt: string | null }) {
  const [dismissed, setDismissed] = useState(false);

  const now = new Date();
  const expires = expiresAt ? new Date(expiresAt) : null;
  const msLeft = expires ? expires.getTime() - now.getTime() : null;
  const hoursLeft = msLeft !== null ? msLeft / (1000 * 60 * 60) : null;
  const daysLeft = hoursLeft !== null ? hoursLeft / 24 : null;

  if (dismissed) return null;

  if (expires && msLeft !== null && msLeft <= 0) {
    return (
      <div className="bg-rose-600 text-white text-center text-sm py-2.5 px-4 font-medium flex items-center justify-center gap-2">
        <Bell size={14} />
        Subscription expired. <a href="mailto:logicguild733@gmail.com?subject=Subscription Renewal" className="underline font-bold ml-1">Renew now →</a>
        <button onClick={() => setDismissed(true)} className="ml-3 opacity-70 hover:opacity-100"><X size={14} /></button>
      </div>
    );
  }

  if (hoursLeft !== null && hoursLeft <= 24) {
    return (
      <div className="bg-rose-500 text-white text-center text-sm py-2.5 px-4 font-medium flex items-center justify-center gap-2">
        <Bell size={14} />
        ⚠️ Your subscription expires in {Math.ceil(hoursLeft)} hour{Math.ceil(hoursLeft) !== 1 ? "s" : ""}. Service will stop without renewal.{" "}
        <a href="mailto:logicguild733@gmail.com?subject=Subscription Renewal" className="underline font-bold ml-1">Renew →</a>
        <button onClick={() => setDismissed(true)} className="ml-3 opacity-70 hover:opacity-100"><X size={14} /></button>
      </div>
    );
  }

  if (daysLeft !== null && daysLeft <= 7) {
    return (
      <div className="bg-amber-500 text-white text-center text-sm py-2.5 px-4 font-medium flex items-center justify-center gap-2">
        <Bell size={14} />
        Subscription expires in {Math.ceil(daysLeft)} day{Math.ceil(daysLeft) !== 1 ? "s" : ""}. Renew to avoid interruption.{" "}
        <a href="mailto:logicguild733@gmail.com?subject=Subscription Renewal" className="underline font-bold ml-1">Contact us →</a>
        <button onClick={() => setDismissed(true)} className="ml-3 opacity-70 hover:opacity-100"><X size={14} /></button>
      </div>
    );
  }

  if (status === "trial") {
    return (
      <div className="bg-primary/10 border-b border-primary/20 text-primary text-center text-sm py-2 px-4 font-medium flex items-center justify-center gap-2">
        🎉 Free Trial Active — Explore all features. <a href="mailto:logicguild733@gmail.com?subject=Subscription Inquiry" className="underline font-semibold ml-1">Upgrade anytime →</a>
        <button onClick={() => setDismissed(true)} className="ml-2 opacity-60 hover:opacity-100"><X size={12} /></button>
      </div>
    );
  }

  return null;
}

function NewLeadsBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("opportunity_token");
    if (!token) return;
    fetch("/api/leads/today-count", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.count > 0) setCount(data.count); })
      .catch(() => {});
  }, []);

  if (!count) return null;

  return (
    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: user, isLoading } = useAuthMe();
  const logout = useLogout();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (user.subscription_status === "inactive") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="h-16 border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50 flex items-center px-6 justify-between">
          <div className="flex items-center gap-2 text-primary font-display font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Briefcase size={18} />
            </div>
            Opportunity Hub
          </div>
          <button
            onClick={() => logout.mutate()}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </header>
        <InactiveSubscription />
      </div>
    );
  }

  const isAdmin = (user as any).role === "admin";
  const plan = (user as any).subscription_plan || "basic";
  const planLabel = ({ basic: "Basic", premium: "Premium", gold: "Gold ⭐" } as Record<string, string>)[plan] || "Basic";

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: <NewLeadsBadge /> },
    { path: "/skills", label: "My Skills", icon: Settings },
    { path: "/reseller", label: "Reseller", icon: Users },
    { path: "/referral", label: "Referral", icon: Gift },
    ...(isAdmin ? [{ path: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary font-display font-bold text-xl group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Briefcase size={18} />
            </div>
            Opportunity Hub
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  location === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon size={16} />
                {item.label}
                {"badge" in item && item.badge}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-right">
              <div className="font-semibold text-foreground">{user.name}</div>
              <div className="text-xs text-muted-foreground">{planLabel}</div>
            </div>
            <button
              onClick={() => logout.mutate()}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <SubscriptionBanner
        status={user.subscription_status}
        expiresAt={(user as any).subscription_expires_at || null}
      />

      <div className="md:hidden border-b bg-card px-4 py-2 flex items-center overflow-x-auto hide-scrollbar gap-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2",
              location === item.path
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon size={16} />
            {item.label}
            {"badge" in item && item.badge}
          </Link>
        ))}
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="border-t bg-card/30 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground font-medium italic">"Earn First, Pay After."</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link href="/subscription-policy" className="hover:text-foreground transition-colors">Subscription Policy</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
