"use client";

import { motion } from "framer-motion";
import { UserPlus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchApplications, hireApplicant } from "@/services/recruitmentService";
import { Application } from "@/types/recruitment";
import { HireModal } from "@/features/recruitment/components/CEOActionModals";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/toast";

interface OnboardingStep {
  id: string;
  label: string;
  done: boolean;
}

const DEFAULT_STEPS: OnboardingStep[] = [
  { id: "welcome", label: "Welcome email sent", done: true },
  { id: "docs", label: "Document collection", done: false },
  { id: "equipment", label: "Equipment provisioned", done: false },
  { id: "orientation", label: "Orientation scheduled", done: false },
  { id: "mentor", label: "Mentor assigned", done: false },
];

export default function OnboardingPage() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Onboarding</h1>
        <p className="text-muted-foreground">
          Welcome new talent with a structured journey.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "New Hires",
            value: "12",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Pending Docs",
            value: "8",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "Completed",
            value: "24",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Avg. Time",
            value: "3 Days",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-5 border-none shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  {stat.label}
                </p>
                <p className={`text-2xl font-black mt-1 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                <stat.icon className="size-5" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="size-8 animate-spin mb-4 opacity-20" />
          <p className="text-sm font-medium">Loading onboarding data...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* ── Hiring Queue (HR Staff only) ── */}
          {isStaff && hiringQueue.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
                  Ready for Hire
                </h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence>
                  {hiringQueue.map((app, idx) => (
                    <HiringQueueCard
                      key={app.application_id}
                      app={app}
                      idx={idx}
                      onInitiate={() => setHireTarget(app)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 border-none shadow-sm">
          <h3 className="text-lg font-bold mb-6">Active Workflows</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50"
              >
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  AB
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Abebe Bikila</h4>
                  <p className="text-xs text-muted-foreground">
                    Software Engineer • Joined 2 days ago
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-primary">
                    60% Complete
                  </span>
                  <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-none bg-primary text-primary-foreground shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <Sparkles className="size-8 mb-4 text-white/40" />
            <h3 className="text-xl font-bold mb-2">Assign Mentors</h3>
            <p className="text-sm text-primary-foreground/80 mb-6">
              Pair new hires with experienced team members to boost retention.
            </p>
            <button className="w-full bg-background text-foreground py-2.5 rounded-lg text-sm font-bold hover:bg-muted transition-colors">
              Start Pairing
            </button>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-x-10 -translate-y-10" />
        </Card>
      </div>
    </section>
  );
}

function HiringQueueCard({
  app,
  idx,
  onInitiate,
}: {
  app: Application;
  idx: number;
  onInitiate: () => void;
}) {
  const isRejected = app.status === "hire_rejected";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
    >
      <Card className="p-5 border-none shadow-sm hover:shadow-md transition-shadow group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center font-bold text-sm ${isRejected ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
              {app.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-sm">{app.full_name}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-semibold">
                {app.position?.title}
              </p>
            </div>
          </div>
          {isRejected && (
            <Badge className="bg-red-50 text-red-600 border-red-100 hover:bg-red-50 text-[9px] px-1.5 uppercase font-black">
              Rejected
            </Badge>
          )}
        </div>

        {isRejected && app.rejection_reason && (
          <div className="mb-4 p-3 rounded-lg bg-red-50/50 border border-red-100 text-[11px] text-red-700 italic">
            <span className="font-bold not-italic block mb-0.5 text-[9px] uppercase tracking-widest text-red-500">CEO Feedback:</span>
            "{app.rejection_reason}"
          </div>
        )}

        <button
          onClick={onInitiate}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-sm"
        >
          <Briefcase className="size-3.5" />
          {isRejected ? "Re-initiate Hire" : "Initiate Hire"}
        </button>
      </Card>
    </motion.div>
  );
}

function EmployeeOnboardingCard({
  app,
  idx,
  isNew,
}: {
  app: Application;
  idx: number;
  isNew: boolean;
}) {
  const [steps, setSteps] = useState<OnboardingStep[]>(DEFAULT_STEPS.map(s => ({ ...s })));

  const initials = app.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  const toggle = (id: string) =>
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
    >
      <Card className="p-5 border-none shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`size-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
              isNew
                ? "bg-emerald-500/10 text-emerald-700 border border-emerald-200"
                : "bg-primary/10 text-primary"
            }`}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm truncate">{app.full_name}</p>
              {isNew && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[9px] px-1.5">
                  New
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {app.position?.title}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Hired{" "}
              {new Date(app.updated_at || app.submitted_at).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              )}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] font-bold mb-1.5">
            <span className="text-muted-foreground">Onboarding Progress</span>
            <span
              className={pct === 100 ? "text-emerald-600" : "text-primary"}
            >
              {pct}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : "bg-primary"}`}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-1.5">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => toggle(step.id)}
              className="flex items-center gap-2.5 w-full text-left group"
            >
              <div
                className={`size-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                  step.done
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-muted-foreground/30 group-hover:border-primary"
                }`}
              >
                {step.done && <CheckCircle className="size-3 text-white" />}
              </div>
              <span
                className={`text-xs transition-colors ${
                  step.done
                    ? "line-through text-muted-foreground/50"
                    : "text-foreground group-hover:text-primary"
                }`}
              >
                {step.label}
              </span>
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
