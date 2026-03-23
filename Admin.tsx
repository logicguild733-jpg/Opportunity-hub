import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Star, RefreshCw, ChevronDown, ChevronUp, Link, CheckCircle, XCircle, AlertTriangle, Plus, Trash2, CreditCard, UserPlus, GitBranch, Mail, Copy, Clock } from "lucide-react";
import { useAuthMe } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminSubscriptions, useAdminSbResellers, useAdminReferrals, useAdminSbPlans } from "@/hooks/use-catalog";
import { toast } from "sonner";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("opportunity_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

function safeCopy(text: string) {
  try {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied!")).catch(() => {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      toast.success("Copied!");
    });
  } catch { toast.error("Could not copy."); }
}

function useAdminUsers() {
  return useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { headers: { ...getAuthHeaders() } });
      if (!res.ok) { console.error("[Admin] users fetch error:", res.status); throw new Error("Failed"); }
      return res.json();
    },
  });
}

function useAdminResellers() {
  return useQuery<any[]>({
    queryKey: ["/api/admin/resellers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/resellers", { headers: { ...getAuthHeaders() } });
      if (!res.ok) { console.error("[Admin] resellers fetch error:", res.status); throw new Error("Failed"); }
      return res.json();
    },
  });
}

function useAdminLeads() {
  return useQuery<any[]>({
    queryKey: ["/api/admin/leads"],
    queryFn: async () => {
      const res = await fetch("/api/admin/leads", { headers: { ...getAuthHeaders() } });
      if (!res.ok) { console.error("[Admin] leads fetch error:", res.status); throw new Error("Failed"); }
      return res.json();
    },
  });
}

function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH", headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast.success("Role updated"); },
    onError: (e: any) => { console.error("[Admin] updateRole error:", e); toast.error("Failed to update role"); },
  });
}

function useUpdateSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, plan, expires_at }: { id: number; status?: string; plan?: string; expires_at?: string | null }) => {
      const res = await fetch(`/api/admin/users/${id}/subscription`, {
        method: "PATCH", headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status, plan, expires_at }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast.success("Subscription updated"); },
    onError: (e: any) => { console.error("[Admin] updateSub error:", e); toast.error("Failed to update subscription"); },
  });
}

function useUpdateSbSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const res = await fetch(`/api/admin/sb/subscriptions/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/sb/subscriptions"] }); toast.success("Subscription updated"); },
    onError: (e: any) => { console.error("[Admin] updateSbSub error:", e); toast.error(e.message || "Failed"); },
  });
}

function useCreateSbPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: any) => {
      const res = await fetch("/api/admin/sb/plans", {
        method: "POST", headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(plan),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/sb/plans"] }); toast.success("Plan created"); },
    onError: (e: any) => { console.error("[Admin] createPlan error:", e); toast.error(e.message || "Failed"); },
  });
}

function useDeleteSbPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/sb/plans/${id}`, { method: "DELETE", headers: { ...getAuthHeaders() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/sb/plans"] }); toast.success("Plan deleted"); },
    onError: (e: any) => { console.error("[Admin] deletePlan error:", e); toast.error(e.message || "Failed"); },
  });
}

function useAddSbReseller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/sb/resellers", {
        method: "POST", headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/sb/resellers"] }); toast.success("Reseller added"); },
    onError: (e: any) => { console.error("[Admin] addReseller error:", e); toast.error(e.message || "Failed"); },
  });
}

function useDeleteSbReseller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/sb/resellers/${id}`, { method: "DELETE", headers: { ...getAuthHeaders() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/sb/resellers"] }); toast.success("Reseller removed"); },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });
}

function useAdminInvites() {
  return useQuery<any[]>({
    queryKey: ["/api/admin/invites"],
    queryFn: async () => {
      const res = await fetch("/api/admin/invites", { headers: { ...getAuthHeaders() } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

function useCreateInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; phone?: string; name?: string; plan?: string; trial_days?: number }) => {
      const res = await fetch("/api/admin/invite", {
        method: "POST", headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/invites"] }); },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });
}

function useDeleteInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/invites/${id}`, { method: "DELETE", headers: { ...getAuthHeaders() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/invites"] }); toast.success("Invite deleted"); },
    onError: (e: any) => toast.error(e.message || "Failed"),
  });
}

function useVerifyLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, verified_status }: { id: number; verified_status: string }) => {
      const res = await fetch(`/api/admin/leads/${id}/verify`, {
        method: "PATCH", headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ verified_status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/leads"] }); toast.success("Lead status updated"); },
    onError: () => toast.error("Failed to update lead status"),
  });
}

function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE", headers: { ...getAuthHeaders() } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/leads"] }); toast.success("Lead deleted"); },
    onError: () => toast.error("Failed to delete lead"),
  });
}

function useAddLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/admin/leads", {
        method: "POST", headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      return json;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/leads"] }); toast.success("Lead added successfully"); },
    onError: (err: any) => toast.error(err.message || "Failed to add lead"),
  });
}

const STATUS_COLORS: Record<string, string> = {
  trial: "bg-primary/10 text-primary",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  inactive: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
};

const ROLE_COLORS: Record<string, string> = {
  user: "bg-secondary text-muted-foreground",
  reseller: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  admin: "bg-primary/10 text-primary",
};

const VERIFY_COLORS: Record<string, string> = {
  verified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  unverified: "bg-secondary text-muted-foreground",
  spam: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
};

const INDUSTRIES = ["Freelance", "Teaching & Coaching", "Food Business", "HomeChef"];
const BLANK_LEAD = { client_name: "", service_needed: "", lead_quality: "MEDIUM", industry: "Freelance", country: "", city: "", description: "", budget: "", contact_email: "", contact_phone: "", source_url: "", verified_status: "unverified" };
const BLANK_PLAN = { name: "", price: "", currency: "PKR", description: "", skill_limit: "", lead_limit: "", features: "", duration_days: "30" };
const BLANK_RESELLER = { name: "", email: "", phone: "", referral_code: "", commission_rate: "30" };
const BLANK_INVITE = { email: "", phone: "", name: "", plan: "basic", trial_days: "14" };

const inputCls = "w-full px-3 py-2 rounded-lg border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

type Tab = "users" | "invites" | "resellers" | "leads" | "subscriptions" | "plans" | "sb-resellers" | "referrals";

export default function Admin() {
  const { data: me } = useAuthMe();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useAdminUsers();
  const { data: resellers, isLoading: resellersLoading, refetch: refetchResellers } = useAdminResellers();
  const { data: leads, isLoading: leadsLoading, refetch: refetchLeads } = useAdminLeads();
  const { data: subscriptions, isLoading: subLoading, refetch: refetchSubs } = useAdminSubscriptions();
  const { data: sbPlans, isLoading: plansLoading, refetch: refetchPlans } = useAdminSbPlans();
  const { data: sbResellers, isLoading: sbResellersLoading, refetch: refetchSbResellers } = useAdminSbResellers();
  const { data: referrals, isLoading: referralsLoading, refetch: refetchReferrals } = useAdminReferrals();

  const { data: invites, isLoading: invitesLoading, refetch: refetchInvites } = useAdminInvites();

  const updateRole = useUpdateRole();
  const updateSub = useUpdateSubscription();
  const updateSbSub = useUpdateSbSubscription();
  const createPlan = useCreateSbPlan();
  const deletePlan = useDeleteSbPlan();
  const addSbReseller = useAddSbReseller();
  const deleteSbReseller = useDeleteSbReseller();
  const verifyLead = useVerifyLead();
  const deleteLead = useDeleteLead();
  const addLead = useAddLead();
  const createInvite = useCreateInvite();
  const deleteInvite = useDeleteInvite();

  const [tab, setTab] = useState<Tab>("users");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [subExpires, setSubExpires] = useState<Record<number, string>>({});
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({ ...BLANK_LEAD });
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ ...BLANK_PLAN });
  const [showAddReseller, setShowAddReseller] = useState(false);
  const [newReseller, setNewReseller] = useState({ ...BLANK_RESELLER });
  const [editSubId, setEditSubId] = useState<string | null>(null);
  const [editSubPlan, setEditSubPlan] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newInvite, setNewInvite] = useState({ ...BLANK_INVITE });
  const [lastInviteLink, setLastInviteLink] = useState("");

  if ((me as any)?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Shield size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Admin Access Only</h2>
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
      </div>
    );
  }

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u: any) => u.subscription_status === "active").length || 0;
  const trialUsers = users?.filter((u: any) => u.subscription_status === "trial").length || 0;
  const totalResellers = resellers?.length || 0;

  const generateSubLink = async (userId: number) => {
    const res = await fetch(`/api/admin/subscription-link/${userId}`, { headers: { ...getAuthHeaders() } });
    const data = await res.json();
    if (data.link) { safeCopy(data.link); toast.success("Subscription link copied!"); }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    await addLead.mutateAsync(newLead);
    setNewLead({ ...BLANK_LEAD });
    setShowAddLead(false);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPlan.mutateAsync({
      name: newPlan.name,
      price: parseFloat(newPlan.price) || 0,
      currency: newPlan.currency,
      campaign_limit: newPlan.skill_limit ? parseInt(newPlan.skill_limit) : null,
      lead_limit: newPlan.lead_limit ? parseInt(newPlan.lead_limit) : null,
    });
    setNewPlan({ ...BLANK_PLAN });
    setShowAddPlan(false);
  };

  const handleAddReseller = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSbReseller.mutateAsync({
      name: newReseller.name,
      email: newReseller.email,
      phone: newReseller.phone || null,
      referral_code: newReseller.referral_code || null,
      commission_rate: parseFloat(newReseller.commission_rate) || 30,
    });
    setNewReseller({ ...BLANK_RESELLER });
    setShowAddReseller(false);
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvite.email.trim()) { toast.error("Email is required"); return; }
    try {
      const result = await createInvite.mutateAsync({
        email: newInvite.email.trim(),
        phone: newInvite.phone.trim() || undefined,
        name: newInvite.name.trim() || undefined,
        plan: newInvite.plan,
        trial_days: parseInt(newInvite.trial_days) || 14,
      });
      setLastInviteLink(result.link);
      safeCopy(result.link);
      toast.success("Invite link created and copied!");
      setNewInvite({ ...BLANK_INVITE });
    } catch {}
  };

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "users", label: "Users", icon: Users, badge: totalUsers },
    { id: "invites", label: "Invite Links", icon: Mail, badge: invites?.length },
    { id: "resellers", label: "Resellers", icon: Star, badge: totalResellers },
    { id: "leads", label: "Leads", icon: CheckCircle, badge: leads?.length },
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard, badge: subscriptions?.length },
    { id: "plans", label: "Plans", icon: GitBranch, badge: sbPlans?.length },
    { id: "sb-resellers", label: "SB Resellers", icon: UserPlus, badge: sbResellers?.length },
    { id: "referrals", label: "Referrals", icon: GitBranch, badge: referrals?.length },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Shield size={20} />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground">Manage users, subscriptions, resellers, and leads.</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: totalUsers, color: "text-foreground" },
          { label: "Active Subscriptions", value: activeUsers, color: "text-emerald-600" },
          { label: "On Trial", value: trialUsers, color: "text-primary" },
          { label: "Resellers", value: totalResellers, color: "text-amber-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border rounded-2xl p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-bold font-display ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={async () => {
            toast.loading("Running lead collector...", { id: "collector" });
            try {
              const res = await fetch("/api/admin/collector/run", { method: "POST", headers: { ...getAuthHeaders() } });
              const data = await res.json();
              if (res.ok) {
                toast.success(`Collector done: ${data.inserted} new leads added`, { id: "collector" });
                refetchLeads();
              } else {
                toast.error(data.error || "Collector failed", { id: "collector" });
              }
            } catch { toast.error("Collector request failed", { id: "collector" }); }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
        >
          <RefreshCw size={15} />
          Run Lead Collector Now
        </button>
        <p className="text-xs text-muted-foreground">Collectors run automatically every 3 hours</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${tab === id ? "bg-primary text-white border-primary shadow" : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
          >
            <Icon size={15} />
            {label}
            {badge != null && badge > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === id ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"}`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-bold text-lg text-foreground">Users ({totalUsers})</h2>
            <button onClick={() => refetchUsers()} className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-colors"><RefreshCw size={18} /></button>
          </div>
          {usersLoading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-secondary rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="divide-y divide-border">
              {users?.map((u: any) => (
                <div key={u.id} className="px-6 py-5 space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground truncate">{u.name}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>{u.role}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[u.subscription_status] || STATUS_COLORS.inactive}`}>{u.subscription_status}</span>
                        {u.subscription_plan && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">{u.subscription_plan}</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                        <span>Joined: {new Date(u.created_at).toLocaleDateString()}</span>
                        {u.subscription_expires_at && <span>Expires: <strong className="text-foreground">{new Date(u.subscription_expires_at).toLocaleDateString()}</strong></span>}
                        {u.referral_code && <span>Ref: <span className="font-mono">{u.referral_code}</span></span>}
                      </div>
                    </div>
                    <button onClick={() => generateSubLink(u.id)}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-semibold shrink-0">
                      <Link size={12} /> Copy Sub Link
                    </button>
                  </div>

                  <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">Manage Subscription</p>

                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-muted-foreground font-medium w-16">Role:</span>
                      {(["user", "reseller", "admin"] as const).map(role => (
                        <button key={role} onClick={() => updateRole.mutate({ id: u.id, role })} disabled={u.role === role || updateRole.isPending}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border ${u.role === role ? "bg-primary text-white border-primary" : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"}`}>
                          {role}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-muted-foreground font-medium w-16">Status:</span>
                      {(["trial", "active", "inactive"] as const).map(status => (
                        <button key={status} onClick={() => updateSub.mutate({ id: u.id, status })} disabled={u.subscription_status === status || updateSub.isPending}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border ${u.subscription_status === status ? "bg-primary text-white border-primary" : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"}`}>
                          {status}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-muted-foreground font-medium w-16">Plan:</span>
                      {(["basic", "premium", "gold"] as const).map(plan => (
                        <button key={plan} onClick={() => updateSub.mutate({ id: u.id, plan })} disabled={u.subscription_plan === plan || updateSub.isPending}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border ${u.subscription_plan === plan ? "bg-primary text-white border-primary" : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"}`}>
                          {plan}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-muted-foreground font-medium w-16">Extend:</span>
                      {[30, 60, 90, 365].map(days => (
                        <button key={days} onClick={() => { updateSub.mutate({ id: u.id, status: "active", duration_days: String(days) } as any); }}
                          className="text-xs px-3 py-1.5 rounded-lg font-semibold border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-all">
                          +{days} days
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-muted-foreground font-medium w-16">Expiry:</span>
                      <input type="date"
                        value={subExpires[u.id] || (u.subscription_expires_at ? u.subscription_expires_at.slice(0, 10) : "")}
                        onChange={e => setSubExpires(prev => ({ ...prev, [u.id]: e.target.value }))}
                        className="text-xs px-3 py-1.5 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                      <button onClick={() => updateSub.mutate({ id: u.id, expires_at: subExpires[u.id] || null })}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-primary text-white hover:bg-primary/90 transition-colors">
                        Set Expiry
                      </button>
                      <button onClick={() => updateSub.mutate({ id: u.id, status: "inactive", expires_at: null })}
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold border border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-all">
                        Cancel Sub
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "invites" && (
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-bold text-lg text-foreground">Invite Links — Generate Personal Links for New Clients</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => { setShowInviteForm(v => !v); setLastInviteLink(""); }}
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-semibold">
                <UserPlus size={14} /> New Invite
              </button>
              <button onClick={() => refetchInvites()} className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-colors"><RefreshCw size={18} /></button>
            </div>
          </div>

          {showInviteForm && (
            <div className="px-6 py-5 border-b bg-secondary/20">
              <form onSubmit={handleCreateInvite} className="space-y-4">
                <p className="text-sm text-muted-foreground">Create a personal invite link for a new client. They can only register with this specific email — nobody else can use the link.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-foreground">Client Email *</label>
                    <input type="email" required className={inputCls} placeholder="client@example.com" value={newInvite.email} onChange={e => setNewInvite(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Client Name</label>
                    <input className={inputCls} placeholder="Name (optional)" value={newInvite.name} onChange={e => setNewInvite(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Phone</label>
                    <input className={inputCls} placeholder="+92 300 0000000 (optional)" value={newInvite.phone} onChange={e => setNewInvite(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Plan</label>
                    <select className={inputCls} value={newInvite.plan} onChange={e => setNewInvite(p => ({ ...p, plan: e.target.value }))}>
                      <option value="basic">Basic (15 leads/day)</option>
                      <option value="premium">Premium (50 leads/day)</option>
                      <option value="gold">Gold (Unlimited)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-foreground">Free Trial Days</label>
                    <select className={inputCls} value={newInvite.trial_days} onChange={e => setNewInvite(p => ({ ...p, trial_days: e.target.value }))}>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={createInvite.isPending}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                    <Mail size={14} />
                    {createInvite.isPending ? "Creating..." : "Generate Invite Link"}
                  </button>
                  <button type="button" onClick={() => { setShowInviteForm(false); setLastInviteLink(""); }}
                    className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                </div>
                {lastInviteLink && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-1">Invite link generated and copied!</p>
                    <div className="flex items-center gap-2">
                      <input type="text" readOnly value={lastInviteLink} className="flex-1 text-xs px-2 py-1.5 rounded bg-background border text-foreground font-mono" />
                      <button type="button" onClick={() => safeCopy(lastInviteLink)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Send this link to your client. Only they can register with it.</p>
                  </div>
                )}
              </form>
            </div>
          )}

          {invitesLoading ? (
            <div className="p-6 space-y-3">{[1,2].map(i => <div key={i} className="h-12 bg-secondary rounded-xl animate-pulse" />)}</div>
          ) : invites && invites.length > 0 ? (
            <div className="divide-y divide-border">
              {invites.map((inv: any) => (
                <div key={inv.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{inv.email}</span>
                      {inv.name && <span className="text-xs text-muted-foreground">({inv.name})</span>}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${inv.used ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"}`}>
                        {inv.used ? "Used" : "Pending"}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 capitalize">{inv.plan}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={10} />{inv.trial_days}d trial</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                      <span>Created: {new Date(inv.created_at).toLocaleDateString()}</span>
                      {inv.used_at && <span>Registered: {new Date(inv.used_at).toLocaleDateString()}</span>}
                      {inv.phone && <span>Phone: {inv.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!inv.used && (
                      <button onClick={() => { const link = `${window.location.origin}/invite/${inv.token}`; safeCopy(link); }}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-semibold">
                        <Copy size={12} /> Copy Link
                      </button>
                    )}
                    <button onClick={() => deleteInvite.mutate(inv.id)}
                      className="p-2 text-muted-foreground hover:text-rose-500 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Mail size={32} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No invite links yet</p>
              <p className="text-sm mt-1">Click "New Invite" to generate a personal link for a client.</p>
            </div>
          )}
        </div>
      )}

      {tab === "resellers" && (
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-bold text-lg text-foreground">Resellers ({totalResellers})</h2>
            <button onClick={() => refetchResellers()} className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-colors"><RefreshCw size={18} /></button>
          </div>
          {resellersLoading ? (
            <div className="p-6 space-y-3">{[1,2].map(i => <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />)}</div>
          ) : resellers && resellers.length > 0 ? (
            <div className="divide-y divide-border">
              {resellers.map((r: any) => (
                <div key={r.id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-semibold text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">Code: <span className="font-mono">{r.referral_code}</span></p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Total Referrals", value: r.total_referrals },
                        { label: "Active Members", value: r.active_members },
                        { label: "Sales (30%)", value: r.commission_30_count },
                        { label: "Bonus (100%)", value: r.bonus_100_percent_count, highlight: true },
                      ].map(({ label, value, highlight }) => (
                        <div key={label} className="bg-secondary rounded-xl p-3 text-center">
                          <p className={`text-xl font-bold ${highlight ? "text-amber-600" : "text-foreground"}`}>{value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {r.gold_sales >= 2 && (
                    <div className="mt-3 text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg px-3 py-1.5 font-semibold">
                      ⭐ Gold Bonus Active — {r.gold_sales} Gold sales
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center"><p className="text-muted-foreground">No resellers yet.</p></div>
          )}
        </div>
      )}

      {tab === "leads" && (
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-bold text-lg text-foreground">All Leads ({leads?.length || 0})</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddLead(!showAddLead)}
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all ${showAddLead ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary hover:text-white"}`}>
                <Plus size={16} /> Add Lead
              </button>
              <button onClick={async () => {
                try {
                  const res = await fetch("/api/admin/seed-leads", { method: "POST", headers: { ...getAuthHeaders() } });
                  const data = await res.json();
                  if (res.ok) { toast.success(data.message || "Leads seeded!"); refetchLeads(); }
                  else toast.error(data.error || "Seed failed");
                } catch { toast.error("Seed request failed"); }
              }} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">
                <Star size={16} /> Seed Leads
              </button>
              <button onClick={() => refetchLeads()} className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-colors"><RefreshCw size={18} /></button>
            </div>
          </div>
          {showAddLead && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-6 py-5 border-b bg-secondary/30">
              <h3 className="font-semibold text-foreground mb-4">Add New Lead</h3>
              <form onSubmit={handleAddLead} className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Client Name *</label><input className={inputCls} required value={newLead.client_name} onChange={e => setNewLead(p => ({ ...p, client_name: e.target.value }))} placeholder="e.g. AlNoor Digital" /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Service Needed *</label><input className={inputCls} required value={newLead.service_needed} onChange={e => setNewLead(p => ({ ...p, service_needed: e.target.value }))} placeholder="e.g. React Developer" /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Industry</label><select className={inputCls} value={newLead.industry} onChange={e => setNewLead(p => ({ ...p, industry: e.target.value }))}>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Quality</label><select className={inputCls} value={newLead.lead_quality} onChange={e => setNewLead(p => ({ ...p, lead_quality: e.target.value }))}><option value="HOT">HOT</option><option value="GOOD">GOOD</option><option value="MEDIUM">MEDIUM</option></select></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Country</label><input className={inputCls} value={newLead.country} onChange={e => setNewLead(p => ({ ...p, country: e.target.value }))} placeholder="e.g. UAE" /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">City</label><input className={inputCls} value={newLead.city} onChange={e => setNewLead(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Dubai" /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Budget</label><input className={inputCls} value={newLead.budget} onChange={e => setNewLead(p => ({ ...p, budget: e.target.value }))} placeholder="e.g. $2,000/month" /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Contact Email</label><input type="email" className={inputCls} value={newLead.contact_email} onChange={e => setNewLead(p => ({ ...p, contact_email: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Contact Phone</label><input className={inputCls} value={newLead.contact_phone} onChange={e => setNewLead(p => ({ ...p, contact_phone: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Source URL</label><input type="url" className={inputCls} value={newLead.source_url} onChange={e => setNewLead(p => ({ ...p, source_url: e.target.value }))} /></div>
                <div className="sm:col-span-2"><label className="text-xs text-muted-foreground font-medium mb-1 block">Description</label><textarea className={`${inputCls} resize-none`} rows={3} value={newLead.description} onChange={e => setNewLead(p => ({ ...p, description: e.target.value }))} /></div>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={addLead.isPending} className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">{addLead.isPending ? "Adding…" : "Add Lead"}</button>
                  <button type="button" onClick={() => { setShowAddLead(false); setNewLead({ ...BLANK_LEAD }); }} className="px-5 py-2.5 bg-secondary text-muted-foreground rounded-lg font-semibold text-sm hover:text-foreground transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
          {leadsLoading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />)}</div>
          ) : leads && leads.length > 0 ? (
            <div className="divide-y divide-border">
              {leads.map((lead: any) => (
                <div key={lead.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{lead.client_name}</span>
                        <span className="text-xs text-muted-foreground">— {lead.service_needed}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${VERIFY_COLORS[lead.verified_status || "unverified"]}`}>{lead.verified_status || "unverified"}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${lead.lead_quality === "HOT" ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" : lead.lead_quality === "GOOD" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"}`}>{lead.lead_quality}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{lead.industry} · {[lead.city, lead.country].filter(Boolean).join(", ")}</p>
                      {lead.source_url && <a href={lead.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Source →</a>}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(["verified", "unverified", "spam"] as const).map(vs => (
                        <button key={vs} onClick={() => verifyLead.mutate({ id: lead.id, verified_status: vs })} disabled={lead.verified_status === vs || verifyLead.isPending}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-semibold border transition-all ${lead.verified_status === vs ? VERIFY_COLORS[vs] + " border-current/20" : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"}`}>
                          {vs === "verified" ? <CheckCircle size={11} /> : vs === "spam" ? <XCircle size={11} /> : <AlertTriangle size={11} />}
                          {vs}
                        </button>
                      ))}
                      <button onClick={() => { if (confirm("Delete this lead?")) deleteLead.mutate(lead.id); }} disabled={deleteLead.isPending}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-semibold border border-rose-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center"><p className="text-muted-foreground">No leads found. Use "Add Lead" to create one.</p></div>
          )}
        </div>
      )}

      {tab === "subscriptions" && (
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-bold text-lg text-foreground">Subscriptions — Supabase ({subscriptions?.length || 0})</h2>
            <button onClick={() => refetchSubs()} className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-colors"><RefreshCw size={18} /></button>
          </div>
          {subLoading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />)}</div>
          ) : subscriptions && subscriptions.length > 0 ? (
            <div className="divide-y divide-border">
              {subscriptions.map((sub: any) => (
                <div key={sub.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{sub.user_id || sub.email || sub.id}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[sub.status] || "bg-secondary text-muted-foreground"}`}>{sub.status}</span>
                      <span className="text-xs text-muted-foreground">{sub.plan}</span>
                    </div>
                    {sub.expires_at && <p className="text-xs text-muted-foreground mt-0.5">Expires: {new Date(sub.expires_at).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {editSubId === sub.id ? (
                      <>
                        <select value={editSubPlan} onChange={e => setEditSubPlan(e.target.value)}
                          className="text-xs px-2 py-1.5 rounded-lg border bg-background text-foreground focus:outline-none">
                          <option value="">Keep plan</option>
                          {["basic", "premium", "gold"].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <button onClick={() => { updateSbSub.mutate({ id: sub.id, updates: { ...(editSubPlan ? { plan: editSubPlan } : {}) } }); setEditSubId(null); }}
                          className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg font-semibold">Save</button>
                        <button onClick={() => setEditSubId(null)} className="text-xs px-3 py-1.5 bg-secondary text-muted-foreground rounded-lg">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditSubId(sub.id); setEditSubPlan(sub.plan || ""); }}
                          className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-all border border-primary/20">
                          Change Package
                        </button>
                        <button onClick={() => updateSbSub.mutate({ id: sub.id, updates: { status: "active" } })} disabled={sub.status === "active" || updateSbSub.isPending}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all ${sub.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-background text-muted-foreground border-border hover:border-emerald-500 hover:text-emerald-600"}`}>
                          Upgrade
                        </button>
                        <button onClick={() => updateSbSub.mutate({ id: sub.id, updates: { status: "inactive" } })} disabled={sub.status === "inactive" || updateSbSub.isPending}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all ${sub.status === "inactive" ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-background text-muted-foreground border-border hover:border-rose-500 hover:text-rose-500"}`}>
                          Disconnect
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No subscriptions in Supabase yet. Make sure your Supabase <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">subscriptions</code> table has data.</p>
            </div>
          )}
        </div>
      )}

      {tab === "plans" && (
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-bold text-lg text-foreground">Subscription Plans ({sbPlans?.length || 0})</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddPlan(!showAddPlan)}
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all ${showAddPlan ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary hover:text-white"}`}>
                <Plus size={16} /> Create Plan
              </button>
              <button onClick={() => refetchPlans()} className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-colors"><RefreshCw size={18} /></button>
            </div>
          </div>
          {showAddPlan && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-6 py-5 border-b bg-secondary/30">
              <h3 className="font-semibold text-foreground mb-4">Create New Plan</h3>
              <form onSubmit={handleCreatePlan} className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Plan Name *</label><input className={inputCls} required value={newPlan.name} onChange={e => setNewPlan(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Premium" /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Price *</label><input type="number" className={inputCls} required value={newPlan.price} onChange={e => setNewPlan(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 2500" /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Currency</label><select className={inputCls} value={newPlan.currency} onChange={e => setNewPlan(p => ({ ...p, currency: e.target.value }))}><option>PKR</option><option>USD</option><option>GBP</option><option>CAD</option><option>AUD</option><option>SAR</option><option>AED</option></select></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Skill Limit (blank = unlimited)</label><input type="number" className={inputCls} value={newPlan.skill_limit} onChange={e => setNewPlan(p => ({ ...p, skill_limit: e.target.value }))} placeholder="e.g. 5" /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Daily Leads Limit (blank = unlimited)</label><input type="number" className={inputCls} value={newPlan.lead_limit} onChange={e => setNewPlan(p => ({ ...p, lead_limit: e.target.value }))} placeholder="e.g. 50" /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Plan Duration (days)</label><input type="number" className={inputCls} value={newPlan.duration_days} onChange={e => setNewPlan(p => ({ ...p, duration_days: e.target.value }))} placeholder="e.g. 30" /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Features</label><input className={inputCls} value={newPlan.features} onChange={e => setNewPlan(p => ({ ...p, features: e.target.value }))} placeholder="e.g. 5 skills, 50 leads/day" /></div>
                <div className="sm:col-span-2"><label className="text-xs text-muted-foreground font-medium mb-1 block">Description</label><textarea className={`${inputCls} resize-none`} rows={2} value={newPlan.description} onChange={e => setNewPlan(p => ({ ...p, description: e.target.value }))} /></div>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={createPlan.isPending} className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">{createPlan.isPending ? "Creating…" : "Create Plan"}</button>
                  <button type="button" onClick={() => { setShowAddPlan(false); setNewPlan({ ...BLANK_PLAN }); }} className="px-5 py-2.5 bg-secondary text-muted-foreground rounded-lg font-semibold text-sm hover:text-foreground transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
          {plansLoading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />)}</div>
          ) : sbPlans && sbPlans.length > 0 ? (
            <div className="divide-y divide-border">
              {sbPlans.map((plan: any) => (
                <div key={plan.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-foreground">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">{plan.currency} {plan.price} · {plan.features || plan.description || ""}</p>
                    {(plan.campaign_limit || plan.lead_limit) && (
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.campaign_limit ? `${plan.campaign_limit} skills/campaigns` : "Unlimited"} · {plan.lead_limit ? `${plan.lead_limit} leads/day` : "Unlimited leads"}</p>
                    )}
                  </div>
                  <button onClick={() => { if (confirm("Delete this plan?")) deletePlan.mutate(plan.id); }} disabled={deletePlan.isPending}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold border border-rose-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center"><p className="text-muted-foreground">No plans yet. Create your first plan above.</p></div>
          )}
        </div>
      )}

      {tab === "sb-resellers" && (
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-bold text-lg text-foreground">Resellers — Supabase ({sbResellers?.length || 0})</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddReseller(!showAddReseller)}
                className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all ${showAddReseller ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary hover:text-white"}`}>
                <Plus size={16} /> Add Reseller
              </button>
              <button onClick={() => refetchSbResellers()} className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-colors"><RefreshCw size={18} /></button>
            </div>
          </div>
          {showAddReseller && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-6 py-5 border-b bg-secondary/30">
              <h3 className="font-semibold text-foreground mb-4">Add Reseller</h3>
              <form onSubmit={handleAddReseller} className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Name *</label><input className={inputCls} required value={newReseller.name} onChange={e => setNewReseller(p => ({ ...p, name: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Email *</label><input type="email" className={inputCls} required value={newReseller.email} onChange={e => setNewReseller(p => ({ ...p, email: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Phone</label><input className={inputCls} value={newReseller.phone} onChange={e => setNewReseller(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Referral Code</label><input className={inputCls} value={newReseller.referral_code} onChange={e => setNewReseller(p => ({ ...p, referral_code: e.target.value }))} placeholder="e.g. OH-RESELLER-001" /></div>
                <div><label className="text-xs text-muted-foreground font-medium mb-1 block">Commission Rate (%)</label><input type="number" className={inputCls} value={newReseller.commission_rate} onChange={e => setNewReseller(p => ({ ...p, commission_rate: e.target.value }))} /></div>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" disabled={addSbReseller.isPending} className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors">{addSbReseller.isPending ? "Adding…" : "Add Reseller"}</button>
                  <button type="button" onClick={() => { setShowAddReseller(false); setNewReseller({ ...BLANK_RESELLER }); }} className="px-5 py-2.5 bg-secondary text-muted-foreground rounded-lg font-semibold text-sm hover:text-foreground transition-colors">Cancel</button>
                </div>
              </form>
            </motion.div>
          )}
          {sbResellersLoading ? (
            <div className="p-6 space-y-3">{[1,2].map(i => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />)}</div>
          ) : sbResellers && sbResellers.length > 0 ? (
            <div className="divide-y divide-border">
              {sbResellers.map((r: any) => (
                <div key={r.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.email}{r.phone ? ` · ${r.phone}` : ""}</p>
                    {r.referral_code && <p className="text-xs text-muted-foreground font-mono mt-0.5">{r.referral_code}</p>}
                    {r.commission_rate && <p className="text-xs text-amber-600 font-semibold mt-0.5">{r.commission_rate}% commission</p>}
                  </div>
                  <button onClick={() => { if (confirm("Remove this reseller?")) deleteSbReseller.mutate(r.id); }} disabled={deleteSbReseller.isPending}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold border border-rose-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center"><p className="text-muted-foreground">No resellers in Supabase yet. Add one above.</p></div>
          )}
        </div>
      )}

      {tab === "referrals" && (
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-bold text-lg text-foreground">Referrals — Supabase ({referrals?.length || 0})</h2>
            <button onClick={() => refetchReferrals()} className="p-2 text-muted-foreground hover:text-primary rounded-lg transition-colors"><RefreshCw size={18} /></button>
          </div>
          {referralsLoading ? (
            <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />)}</div>
          ) : referrals && referrals.length > 0 ? (
            <div className="divide-y divide-border">
              {referrals.map((ref: any) => (
                <div key={ref.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{ref.referrer_id || ref.referrer || "—"}</span>
                      <span className="text-muted-foreground text-xs">→</span>
                      <span className="text-sm text-foreground">{ref.referred_user_id || ref.referred || "—"}</span>
                      {ref.status && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ref.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" : "bg-secondary text-muted-foreground"}`}>{ref.status}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{ref.created_at ? new Date(ref.created_at).toLocaleDateString() : ""} {ref.plan ? `· ${ref.plan}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">No referrals in Supabase yet. Make sure your <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">referrals</code> table has data.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
