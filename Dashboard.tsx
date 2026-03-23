import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, X, ChevronDown, Bell, TrendingUp, Zap } from "lucide-react";
import { useLeads, useAllLeads, useLeadUsage } from "@/hooks/use-leads";
import { useSkills } from "@/hooks/use-skills";
import { useAuthMe } from "@/hooks/use-auth";
import { LeadCard } from "@/components/LeadCard";
import { Input } from "@/components/ui";
import { toast } from "sonner";

const QUALITY_OPTIONS = ["HOT", "GOOD", "MEDIUM"];

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("opportunity_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Dashboard() {
  const { data: user } = useAuthMe();
  const { data: skills } = useSkills();
  const { data: matchedResponse, isLoading: leadsLoading, refetch: refetchMatched } = useLeads();
  const { data: allResponse, isLoading: allLoading, refetch: refetchAll } = useAllLeads();
  const { data: usageData } = useLeadUsage();

  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterQuality, setFilterQuality] = useState<string[]>([]);

  const plan = (user as any)?.subscription_plan || "basic";
  const usage = usageData || (showAll ? allResponse?.usage : matchedResponse?.usage);
  const dailyLimit = usage?.daily_limit ?? 15;
  const viewedToday = usage?.viewed_today ?? 0;
  const limitReached = usage?.limit_reached ?? false;

  const activeLeads = showAll ? (allResponse?.leads || []) : (matchedResponse?.leads || []);
  const isLoading = showAll ? allLoading : leadsLoading;

  const dynamicIndustries = useMemo(() => {
    if (!activeLeads || activeLeads.length === 0) return ["All Industries"];
    const set = new Set<string>();
    for (const l of activeLeads as any[]) if (l.industry) set.add(l.industry);
    return ["All Industries", ...Array.from(set).sort()];
  }, [activeLeads]);

  const dynamicCountries = useMemo(() => {
    if (!activeLeads || activeLeads.length === 0) return ["All Countries"];
    const set = new Set<string>();
    for (const l of activeLeads as any[]) if (l.country) set.add(l.country);
    return ["All Countries", ...Array.from(set).sort()];
  }, [activeLeads]);

  const filteredLeads = useMemo(() => {
    if (!activeLeads || activeLeads.length === 0) return [];
    let result = activeLeads.filter((lead: any) => {
      const searchWords = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const allFields = [lead.client_name, lead.service_needed, lead.description || "", lead.industry || "", lead.lead_text || "", lead.country || "", lead.city || ""].join(" ").toLowerCase();
      const matchesSearch = searchWords.length === 0 || searchWords.some(w => allFields.includes(w));
      const matchesIndustry = !filterIndustry || filterIndustry === "All Industries" ||
        (lead.industry && lead.industry.toLowerCase() === filterIndustry.toLowerCase());
      const matchesCountry = !filterCountry || filterCountry === "All Countries" ||
        (lead.country && lead.country.toLowerCase() === filterCountry.toLowerCase());
      const matchesCity = !filterCity ||
        (lead.city && lead.city.toLowerCase().includes(filterCity.toLowerCase()));
      const matchesQuality = filterQuality.length === 0 || filterQuality.includes(lead.lead_quality);
      return matchesSearch && matchesIndustry && matchesCountry && matchesCity && matchesQuality;
    });
    return result;
  }, [activeLeads, search, filterIndustry, filterCountry, filterCity, filterQuality]);

  const newTodayCount = useMemo(() => {
    if (!activeLeads) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (activeLeads as any[]).filter(l => new Date(l.created_at) >= today).length;
  }, [activeLeads]);

  const hasActiveFilters = filterIndustry || filterCountry || filterCity || filterQuality.length > 0;

  const noFilteredResults = !isLoading && filteredLeads.length === 0 && (search || hasActiveFilters);
  const fallbackLeads = useMemo(() => {
    if (!noFilteredResults || !activeLeads || activeLeads.length === 0) return [];
    return activeLeads.slice(0, 20);
  }, [noFilteredResults, activeLeads]);

  const clearFilters = () => {
    setFilterIndustry("");
    setFilterCountry("");
    setFilterCity("");
    setFilterQuality([]);
  };

  const toggleQuality = (q: string) => {
    setFilterQuality(prev => prev.includes(q) ? prev.filter(x => x !== q) : [...prev, q]);
  };

  const handleContactStatusChange = useCallback(async (leadId: number, status: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(status === "none" ? "Status cleared" : "Lead status updated");
        refetchMatched();
        refetchAll();
      }
    } catch {
      toast.error("Failed to update lead status");
    }
  }, [refetchMatched, refetchAll]);

  const isInactive = user?.subscription_status === "inactive";

  if (isInactive) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-500 mb-4">
          <X size={32} />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Subscription Inactive</h2>
        <p className="text-muted-foreground max-w-md">Your subscription is inactive. Please upgrade to continue accessing leads.</p>
        <a
          href="mailto:logicguild733@gmail.com?subject=Subscription Renewal"
          className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          Contact us to renew
        </a>
      </div>
    );
  }

  if (limitReached) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
            <Zap size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Daily Lead Limit Reached</h2>
          <p className="text-muted-foreground max-w-md mb-2">
            You've viewed <span className="font-bold text-foreground">{viewedToday}</span> of your{" "}
            <span className="font-bold text-foreground">{dailyLimit}</span> daily leads on the{" "}
            <span className="font-bold capitalize text-primary">{plan}</span> plan.
          </p>
          <p className="text-muted-foreground max-w-md">
            Upgrade your plan for more leads. Limits reset at midnight.
          </p>
          <a
            href="mailto:logicguild733@gmail.com?subject=Plan Upgrade"
            className="mt-6 inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <TrendingUp size={18} />
            Upgrade Plan
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl font-display font-bold text-foreground"
          >
            Welcome back, {user?.name?.split(" ")[0]}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mt-1 text-base"
          >
            Here are your top matched opportunities today.
          </motion.p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {newTodayCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-xl px-4 py-2 text-sm font-semibold"
            >
              <Bell size={15} />
              {newTodayCount} New Lead{newTodayCount !== 1 ? "s" : ""} Today
            </motion.div>
          )}
          <div className="text-xs text-muted-foreground bg-secondary border rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="capitalize font-semibold text-foreground">{plan}</span>
            <span>·</span>
            {dailyLimit ? (
              <span>
                <span className="font-bold text-foreground">{viewedToday}</span>/{dailyLimit} leads used
              </span>
            ) : (
              <span>Unlimited leads</span>
            )}
          </div>
        </div>
      </div>

      {dailyLimit && dailyLimit > 0 && (
        <div className="bg-card border rounded-xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Daily Usage</span>
            <span className="text-xs font-bold text-foreground">{viewedToday}/{dailyLimit}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                viewedToday / dailyLimit > 0.8 ? "bg-rose-500" :
                viewedToday / dailyLimit > 0.5 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, (viewedToday / dailyLimit) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-secondary p-1.5 rounded-xl border">
          <button
            onClick={() => setShowAll(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${!showAll ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Sparkles size={15} />
            For You
          </button>
          <button
            onClick={() => setShowAll(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${showAll ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            All Leads
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by client, service, keyword..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
            showFilters || hasActiveFilters
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
              : "bg-card text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasActiveFilters && (
            <span className="bg-white/30 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
              {[filterIndustry && filterIndustry !== "All Industries", filterCountry && filterCountry !== "All Countries", filterCity, ...filterQuality].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border rounded-2xl p-5 space-y-4"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Industry</label>
              <div className="relative">
                <select
                  value={filterIndustry}
                  onChange={e => setFilterIndustry(e.target.value)}
                  className="w-full h-9 px-3 pr-8 rounded-lg border bg-background text-foreground text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {dynamicIndustries.map(i => <option key={i} value={i === "All Industries" ? "" : i}>{i}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Country</label>
              <div className="relative">
                <select
                  value={filterCountry}
                  onChange={e => setFilterCountry(e.target.value)}
                  className="w-full h-9 px-3 pr-8 rounded-lg border bg-background text-foreground text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {dynamicCountries.map(c => <option key={c} value={c === "All Countries" ? "" : c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">City</label>
              <Input
                placeholder="e.g. Dubai, Lahore..."
                value={filterCity}
                onChange={e => setFilterCity(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Lead Quality</label>
            <div className="flex gap-2 flex-wrap">
              {QUALITY_OPTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => toggleQuality(q)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    filterQuality.includes(q)
                      ? q === "HOT" ? "bg-rose-500 text-white border-rose-500"
                        : q === "GOOD" ? "bg-orange-500 text-white border-orange-500"
                        : "bg-amber-500 text-white border-amber-500"
                      : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {q}
                </button>
              ))}
              {hasActiveFilters && (
                <button onClick={clearFilters} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  <X size={12} /> Clear all
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-card border rounded-2xl p-5 h-56 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-9 h-9 bg-secondary rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary rounded w-2/3" />
                  <div className="h-3 bg-secondary rounded w-1/3" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-secondary rounded" />
                <div className="h-3 bg-secondary rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              No exact match for your search
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              We couldn't find leads matching "{search || filterIndustry || "your filters"}". Here are other available leads you can explore:
            </p>
            <button onClick={clearFilters} className="mt-3 text-primary text-sm font-semibold hover:underline">
              Clear filters & show all leads
            </button>
          </div>

          {fallbackLeads.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Other available leads</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {fallbackLeads.map((lead: any) => (
                  <LeadCard key={`${lead.source}-${lead.id}`} lead={lead} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredLeads.length}</span> lead{filteredLeads.length !== 1 ? "s" : ""}
              {dailyLimit && viewedToday > 0 && (
                <span className="ml-2 text-xs">
                  (<span className="font-semibold">{viewedToday}</span>/{dailyLimit} daily limit used)
                </span>
              )}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLeads.map((lead: any, index: number) => (
              <LeadCard
                key={`${lead.source}-${lead.id}`}
                lead={lead}
                index={index}
                onContactStatusChange={handleContactStatusChange}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
