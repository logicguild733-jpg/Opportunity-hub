import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Building2, Calendar, DollarSign, Mail, Phone, Copy, MapPin, ExternalLink, CheckCircle, MessageSquare, Trophy, XCircle, Zap } from "lucide-react";
import type { Lead } from "@workspace/api-client-react";
import { formatCurrency, formatDate, timeAgo, cn } from "@/lib/utils";
import { toast } from "sonner";

const CONTACT_STATUSES = [
  { value: "contacted", label: "Contacted", icon: MessageSquare, color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
  { value: "replied", label: "Replied", icon: CheckCircle, color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
  { value: "won", label: "Client Won", icon: Trophy, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
  { value: "not_interested", label: "Not Interested", icon: XCircle, color: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" },
];

function safeCopy(text: string, label: string) {
  try {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied!`);
    }).catch(() => {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      toast.success(`${label} copied!`);
    });
  } catch {
    toast.error("Could not copy — please copy manually.");
  }
}

export function LeadCard({ lead, index, onContactStatusChange }: {
  lead: Lead & { match_score?: number; contact_status?: string; source_url?: string; verified_status?: string };
  index: number;
  onContactStatusChange?: (leadId: number, status: string) => void;
}) {
  const [showTracker, setShowTracker] = useState(false);
  const currentStatus = lead.contact_status;

  const qualityConfig = {
    HOT: { bg: "bg-rose-100 dark:bg-rose-500/20", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-500/30" },
    GOOD: { bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-500/30" },
    MEDIUM: { bg: "bg-yellow-100 dark:bg-yellow-500/20", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-200 dark:border-yellow-500/30" },
  };

  const badge = qualityConfig[lead.lead_quality as keyof typeof qualityConfig] || qualityConfig.MEDIUM;

  const extLead = lead as any;
  const contactEmail = extLead.contact_email;
  const contactPhone = extLead.contact_phone;
  const city = extLead.city;
  const country = extLead.country;
  const sourceUrl = extLead.source_url;
  const verifiedStatus = extLead.verified_status;
  const matchScore = extLead.match_score;
  const leadScore = extLead.lead_score;

  const copyContactInfo = () => {
    const parts = [contactEmail, contactPhone].filter(Boolean).join(" | ");
    if (!parts) { toast.error("No contact info available"); return; }
    safeCopy(parts, "Contact info");
  };

  const activeStatus = CONTACT_STATUSES.find(s => s.value === currentStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      className="group"
    >
      <div className="bg-card rounded-2xl p-5 border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex justify-between items-start mb-3 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Building2 size={18} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-foreground font-display leading-tight truncate">{lead.client_name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                {(() => {
                  const age = timeAgo(extLead.fetched_at || lead.created_at);
                  return (
                    <>
                      {age.isRecent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                      <Calendar size={11} />
                      <span className={age.isRecent ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>{age.text}</span>
                    </>
                  );
                })()}
                {verifiedStatus === "verified" && (
                  <span className="ml-1 text-emerald-600 font-semibold flex items-center gap-0.5">
                    <CheckCircle size={11} /> Verified
                  </span>
                )}
                {verifiedStatus === "spam" && (
                  <span className="ml-1 text-rose-500 font-semibold flex items-center gap-0.5">
                    <XCircle size={11} /> Spam
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
            <span className={cn("px-2.5 py-0.5 text-xs font-bold rounded-full border tracking-wide", badge.bg, badge.text, badge.border)}>
              {lead.lead_quality}
              {leadScore ? ` ${leadScore}` : ""}
            </span>
            {matchScore !== null && matchScore !== undefined && (
              <span className={cn(
                "px-2 py-0.5 text-xs font-semibold rounded-full flex items-center gap-1",
                matchScore >= 70 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                matchScore >= 40 ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                "bg-secondary text-muted-foreground"
              )}>
                <Zap size={10} />
                {matchScore}% Match
              </span>
            )}
          </div>
        </div>

        <div className="mb-3 relative z-10">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1.5">
            <Briefcase size={14} className="text-primary shrink-0" />
            <span className="truncate">{lead.service_needed}</span>
          </div>
          {(city || country) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
              <MapPin size={11} />
              <span>{[city, country].filter(Boolean).join(", ")}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {lead.description || "No description provided."}
          </p>
        </div>

        {sourceUrl && /^https?:\/\//i.test(sourceUrl) && (
          <div className="mb-3 relative z-10">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
            >
              <ExternalLink size={11} />
              Check Original Post
            </a>
          </div>
        )}

        {activeStatus && (
          <div className={cn("mb-3 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 w-fit", activeStatus.color)}>
            <activeStatus.icon size={11} />
            {activeStatus.label}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-border/50 relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <DollarSign size={14} className="text-muted-foreground" />
              <span className="text-xs">{formatCurrency(lead.budget)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary hover:text-white transition-all"
                title={contactEmail}
              >
                <Mail size={12} />
                Email
              </a>
            )}
            {contactPhone && (
              <a
                href={`tel:${contactPhone}`}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-all"
                title={contactPhone}
              >
                <Phone size={12} />
                Call
              </a>
            )}
            <button
              onClick={copyContactInfo}
              className="flex items-center justify-center gap-1 px-2 py-2 bg-secondary text-muted-foreground rounded-lg text-xs font-semibold hover:bg-secondary/80 hover:text-foreground transition-all"
              title="Copy contact info"
            >
              <Copy size={12} />
              Copy
            </button>
            <button
              onClick={() => setShowTracker(!showTracker)}
              className="flex items-center justify-center px-2 py-2 bg-secondary text-muted-foreground rounded-lg text-xs hover:bg-secondary/80 hover:text-foreground transition-all"
              title="Track this lead"
            >
              <MessageSquare size={12} />
            </button>
          </div>

          {showTracker && onContactStatusChange && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="pt-2 flex flex-wrap gap-1.5"
            >
              {CONTACT_STATUSES.map(s => (
                <button
                  key={s.value}
                  onClick={() => {
                    onContactStatusChange(lead.id, currentStatus === s.value ? "none" : s.value);
                    setShowTracker(false);
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border",
                    currentStatus === s.value
                      ? cn(s.color, "border-transparent")
                      : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                  )}
                >
                  <s.icon size={10} />
                  {s.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
