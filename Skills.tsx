import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Briefcase, Trophy, Code2, PenTool, Lock, Search, ChevronDown } from "lucide-react";
import { useSkills, useAddSkill, useDeleteSkill } from "@/hooks/use-skills";
import { useSkillsCatalog } from "@/hooks/use-catalog";
import { useAuthMe } from "@/hooks/use-auth";
import { Input, Button, Card } from "@/components/ui";
import { toast } from "sonner";

const PLAN_LIMITS: Record<string, number> = {
  basic: 2,
  premium: 5,
  gold: Infinity,
};

const PLAN_LABELS: Record<string, string> = {
  basic: "Basic",
  premium: "Premium",
  gold: "Gold",
};

const FALLBACK_SKILLS = [
  "Visual Designer", "Graphic Designer", "UI/UX Designer", "Web Developer", "App Developer",
  "Video Editor", "Copywriter", "SEO Specialist", "Social Media Manager", "Digital Marketer",
  "Quran Teacher", "Arabic Teacher", "English Teacher", "Math Tutor", "Life Coach",
  "Career Coach", "Business Coach", "Fitness Coach", "Mindset Coach",
  "HomeChef", "Catering", "Event Cooking", "Meal Prep",
  "SaaS Sales", "SaaS Prospect",
];

export default function Skills() {
  const { data: skills, isLoading } = useSkills();
  const { data: user } = useAuthMe();
  const { data: catalog, isLoading: catalogLoading, error: catalogError } = useSkillsCatalog();
  const addSkill = useAddSkill();
  const deleteSkill = useDeleteSkill();

  const [newSkill, setNewSkill] = useState("");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false);

  const plan = (user as any)?.subscription_plan || "basic";
  const limit = PLAN_LIMITS[plan] ?? 2;
  const atLimit = skills ? skills.length >= limit : false;

  const catalogSkillNames: string[] = useMemo(() => {
    if (catalogError) {
      console.error("[Skills] Catalog error — using fallback list");
    }
    if (catalog && catalog.length > 0) {
      return catalog.map((s: any) => s.name || s.skill_name || s.title || String(s.id)).filter(Boolean);
    }
    return FALLBACK_SKILLS;
  }, [catalog, catalogError]);

  const filteredCatalog = useMemo(() => {
    const search = catalogSearch.toLowerCase();
    return catalogSkillNames.filter(s =>
      s.toLowerCase().includes(search) &&
      !skills?.some(existing => existing.skill_name.toLowerCase() === s.toLowerCase())
    );
  }, [catalogSkillNames, catalogSearch, skills]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (atLimit) {
      toast.error(`Your ${PLAN_LABELS[plan]} plan allows a maximum of ${limit} skill${limit !== 1 ? "s" : ""}. Upgrade to add more.`);
      return;
    }
    if (skills?.some(s => s.skill_name.toLowerCase() === newSkill.trim().toLowerCase())) {
      toast.error("You already have this skill");
      return;
    }
    try {
      await addSkill.mutateAsync({ skill_name: newSkill.trim() });
      setNewSkill("");
      toast.success(`Added ${newSkill.trim()} to your skills`);
    } catch (err: any) {
      console.error("[Skills] addSkill error:", err);
      toast.error(err.message || "Failed to add skill");
    }
  };

  const handlePickFromCatalog = async (skillName: string) => {
    if (atLimit) {
      toast.error(`Your ${PLAN_LABELS[plan]} plan allows a maximum of ${limit} skills.`);
      return;
    }
    if (skills?.some(s => s.skill_name.toLowerCase() === skillName.toLowerCase())) {
      toast.error("You already have this skill");
      return;
    }
    try {
      await addSkill.mutateAsync({ skill_name: skillName });
      toast.success(`Added "${skillName}" to your skills`);
      setCatalogSearch("");
      setShowCatalogDropdown(false);
    } catch (err: any) {
      console.error("[Skills] catalog pick error:", err);
      toast.error(err.message || "Failed to add skill");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      await deleteSkill.mutateAsync(id);
      toast.success(`Removed ${name}`);
    } catch (err: any) {
      console.error("[Skills] deleteSkill error:", err);
      toast.error(err.message || "Failed to remove skill");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-display font-bold text-foreground flex items-center gap-3"
        >
          <Trophy className="text-primary" />
          My Skills
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mt-2 text-lg"
        >
          Add your expertise. We use these skills to match you with the best, most relevant opportunities.
        </motion.p>
      </div>

      {limit !== Infinity && (
        <div className="bg-card border rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {PLAN_LABELS[plan]} Plan — {skills?.length || 0} / {limit} skills used
            </p>
            <div className="mt-2 h-2 bg-secondary rounded-full w-48 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all ${atLimit ? "bg-rose-500" : "bg-primary"}`}
                style={{ width: `${Math.min(((skills?.length || 0) / limit) * 100, 100)}%` }}
              />
            </div>
          </div>
          {atLimit && (
            <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold bg-rose-50 dark:bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-500/20">
              <Lock size={14} />
              Limit reached — upgrade your plan
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-base text-foreground mb-3 flex items-center gap-2">
                <Search size={16} className="text-primary" />
                Pick from Skills Catalog
                {catalogLoading && <span className="text-xs text-muted-foreground animate-pulse ml-1">Loading…</span>}
                {catalog && <span className="ml-auto text-xs text-muted-foreground font-normal">{catalogSkillNames.length} skills available</span>}
              </h3>
              <div className="relative">
                <div
                  className="flex items-center gap-2 px-4 py-2.5 border rounded-xl bg-background cursor-pointer hover:border-primary transition-colors"
                  onClick={() => !atLimit && setShowCatalogDropdown(v => !v)}
                >
                  <Search size={15} className="text-muted-foreground shrink-0" />
                  <input
                    className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder-muted-foreground"
                    placeholder={atLimit ? "Skill limit reached — upgrade to add more" : "Search skills catalog…"}
                    value={catalogSearch}
                    disabled={atLimit}
                    onChange={e => { setCatalogSearch(e.target.value); setShowCatalogDropdown(true); }}
                    onFocus={() => !atLimit && setShowCatalogDropdown(true)}
                  />
                  <ChevronDown size={15} className={`text-muted-foreground transition-transform shrink-0 ${showCatalogDropdown ? "rotate-180" : ""}`} />
                </div>

                <AnimatePresence>
                  {showCatalogDropdown && filteredCatalog.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-20 left-0 right-0 mt-1 bg-card border rounded-xl shadow-xl max-h-56 overflow-y-auto"
                      onMouseLeave={() => !catalogSearch && setShowCatalogDropdown(false)}
                    >
                      {filteredCatalog.slice(0, 50).map((skill, i) => (
                        <button
                          key={i}
                          onClick={() => handlePickFromCatalog(skill)}
                          disabled={addSkill.isPending}
                          className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <Plus size={13} className="text-primary shrink-0" />
                          {skill}
                        </button>
                      ))}
                      {filteredCatalog.length === 0 && (
                        <p className="px-4 py-3 text-sm text-muted-foreground">No matching skills</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex-1 h-px bg-border" />
              <span>or type a custom skill</span>
              <span className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleAdd} className="flex gap-3">
              <Input
                placeholder="E.g., Frontend Development, Copywriting…"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1"
                disabled={addSkill.isPending || atLimit}
              />
              <Button type="submit" disabled={!newSkill.trim() || addSkill.isPending || atLimit} className="shrink-0 gap-2">
                {addSkill.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
                Add
              </Button>
            </form>
            {atLimit && (
              <p className="text-xs text-rose-600 font-medium">
                ⚠️ You've reached your skill limit. Upgrade your plan to add more skills.
              </p>
            )}
          </Card>

          <Card className="p-6 min-h-[300px]">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Briefcase size={18} className="text-muted-foreground" />
              Your Active Skills
            </h3>

            {isLoading ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 w-24 bg-secondary rounded-full animate-pulse" />
                ))}
              </div>
            ) : skills && skills.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                  {skills.map((skill) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                      className="group flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full font-medium text-sm shadow-sm"
                    >
                      {skill.skill_name}
                      <button
                        onClick={() => handleDelete(skill.id, skill.skill_name)}
                        disabled={deleteSkill.isPending}
                        className="p-1 rounded-full hover:bg-primary/20 hover:text-destructive transition-colors ml-1"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-muted-foreground mb-4">
                  <Code2 size={24} />
                </div>
                <p className="text-muted-foreground font-medium">No skills added yet.</p>
                <p className="text-sm text-muted-foreground/70 mt-1 max-w-[250px]">Search the catalog above or type a custom skill to start getting matched leads.</p>
              </div>
            )}
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          <Card className="p-6 bg-gradient-to-br from-card to-accent/20 border-accent/30">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <PenTool size={18} className="text-primary" />
              Quick Add
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Popular skills clients are looking for. Click to add.
            </p>
            <div className="flex flex-wrap gap-2">
              {(catalogSkillNames.length > 0 ? catalogSkillNames : FALLBACK_SKILLS)
                .filter(s => !skills?.some(existing => existing.skill_name.toLowerCase() === s.toLowerCase()))
                .slice(0, 18)
                .map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handlePickFromCatalog(s)}
                    disabled={atLimit || addSkill.isPending}
                    className="px-3 py-1.5 bg-background border rounded-lg text-sm text-foreground hover:border-primary hover:text-primary transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                    {s}
                  </button>
                ))}
            </div>
          </Card>

          <Card className="p-5 border-primary/20 bg-primary/5">
            <h4 className="font-semibold text-sm text-foreground mb-3">Plan Limits</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Basic Plan</span><span className="font-medium text-foreground">2 skills, 15 leads/day</span></div>
              <div className="flex justify-between"><span>Premium Plan</span><span className="font-medium text-foreground">5 skills, 50 leads/day</span></div>
              <div className="flex justify-between"><span>Gold Plan</span><span className="font-medium text-foreground">Unlimited skills & leads</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
