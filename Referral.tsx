import { motion } from "framer-motion";
import { Gift, Star, Crown, Mail, Copy, Share2, MessageCircle, CheckCircle } from "lucide-react";
import { useAuthMe } from "@/hooks/use-auth";
import { useState } from "react";
import { toast } from "sonner";

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://opportunity-hub.replit.app";

export default function Referral() {
  const { data: user } = useAuthMe();
  const [copied, setCopied] = useState(false);

  const referralCode = (user as any)?.referral_code || "";
  const referralLink = referralCode ? `${BASE_URL}/register?ref=${referralCode}` : "";

  const copyLink = () => {
    if (!referralLink) return;
    try {
      navigator.clipboard.writeText(referralLink).then(() => {
        setCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopied(false), 3000);
      }).catch(() => {
        const el = document.createElement("textarea");
        el.value = referralLink;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopied(false), 3000);
      });
    } catch {
      toast.error("Unable to copy — please copy the link manually.");
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Join Opportunity Hub and discover leads for your business! Use my referral link: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent("Join Opportunity Hub — Lead Discovery Platform");
    const body = encodeURIComponent(`Hi!\n\nI'm using Opportunity Hub to find clients for my business and thought you'd love it too.\n\nSign up using my referral link: ${referralLink}\n\nEarn First, Pay After. 🚀`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareX = () => {
    const text = encodeURIComponent(`Discover clients and leads for your business with Opportunity Hub! Join using my link: ${referralLink} #OpportunityHub #Freelance`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Gift size={20} />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Referral Program</h1>
        </div>
        <p className="text-muted-foreground text-lg">Refer friends and get rewarded with discounts and free subscriptions.</p>
      </motion.div>

      {referralLink && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border-2 border-primary/20 rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Share2 size={18} className="text-primary" />
            Your Referral Link
          </h2>
          <div className="flex gap-3 items-center">
            <div className="flex-1 bg-secondary rounded-xl px-4 py-3 font-mono text-sm text-foreground truncate border">
              {referralLink}
            </div>
            <button
              onClick={copyLink}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all shrink-0 ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <MessageCircle size={16} />
              WhatsApp
            </button>
            <button
              onClick={shareEmail}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Mail size={16} />
              Email
            </button>
            <button
              onClick={shareX}
              className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-black/80 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <span className="font-bold text-xs">𝕏</span>
              Share on X
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-2xl p-6 flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Gift size={24} />
          </div>
          <div className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full mb-3 w-fit">BASIC PLAN</div>
          <h2 className="text-lg font-bold text-foreground mb-2">80% Discount</h2>
          <p className="text-muted-foreground text-sm flex-1">
            Refer <strong>5 active paid subscriptions</strong> and receive an 80% discount on your subscription while referrals remain active.
          </p>
        </div>

        <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 mb-4">
            <Star size={24} />
          </div>
          <div className="inline-block bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-full mb-3 w-fit">PREMIUM PLAN</div>
          <h2 className="text-lg font-bold text-foreground mb-2">100% Free</h2>
          <p className="text-muted-foreground text-sm flex-1">
            Refer <strong>5 paid subscriptions</strong> and receive a 100% free subscription while referrals remain active.
          </p>
        </div>

        <div className="bg-card border rounded-2xl p-6 flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center text-yellow-600 mb-4">
            <Crown size={24} />
          </div>
          <div className="inline-block bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-2 py-1 rounded-full mb-3 w-fit">GOLD PLAN</div>
          <h2 className="text-lg font-bold text-foreground mb-2">Lifetime Free</h2>
          <p className="text-muted-foreground text-sm flex-1">
            Refer just <strong>1 Gold subscription</strong> and receive a lifetime free subscription. Forever.
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-foreground">How Referrals Work</h2>
        <div className="space-y-3">
          {[
            { step: 1, title: "Copy your referral link", desc: "Use the link above to share your unique referral URL." },
            { step: 2, title: "Share it with your network", desc: "Send via WhatsApp, email, X (Twitter), or any platform." },
            { step: 3, title: "They sign up and subscribe", desc: "Your referrals register and activate a paid subscription." },
            { step: 4, title: "You get rewarded", desc: "Once you hit the threshold, your discount or free subscription activates." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">{step}</div>
              <div>
                <p className="font-semibold text-foreground">{title}</p>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
        <p className="text-muted-foreground mb-2">Questions about your referrals? Contact us:</p>
        <a
          href="mailto:logicguild733@gmail.com?subject=Referral Program"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Mail size={18} />
          Contact Us
        </a>
      </div>
    </div>
  );
}
