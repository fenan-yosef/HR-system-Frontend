"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Sparkles,
  CheckCircle,
  Loader2,
  Users,
  Calendar,
  Briefcase,
  Star,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchApplications } from "@/services/recruitmentService";
import { Application } from "@/types/recruitment";
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
  const [hired, setHired] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadHired = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchApplications({ status: "hired" });
      setHired(
        (res.results || []).sort(
          (a, b) =>
            new Date(b.updated_at || b.submitted_at).getTime() -
            new Date(a.updated_at || a.submitted_at).getTime()
        )
      );
    } catch {
      toast("Unable to load onboarded employees.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHired();
  }, [loadHired]);

  // Group: joined within last 30 days vs older
  const now = Date.now();
  const recentHires = hired.filter(
    (h) =>
      now - new Date(h.updated_at || h.submitted_at).getTime() <
      30 * 24 * 3600 * 1000
  );
  const previousHires = hired.filter(
    (h) =>
      now - new Date(h.updated_at || h.submitted_at).getTime() >=
      30 * 24 * 3600 * 1000
  );

  return (
    <section className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-emerald-500/10 border border-emerald-200 flex items-center justify-center">
            <UserCheck className="size-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Onboarding
            </h1>
            <p className="text-muted-foreground text-sm">
              Newly hired employees and their onboarding progress.
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "Total Hired",
            value: hired.length,
            color: "text-emerald-600",
            bg: "bg-emerald-500/10",
            icon: Users,
          },
          {
            label: "Joined This Month",
            value: recentHires.length,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            icon: Calendar,
          },
          {
            label: "Avg. Onboarding",
            value: "3 Days",
            color: "text-violet-600",
            bg: "bg-violet-500/10",
            icon: Star,
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
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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

      {/* ── Onboarding Cards ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : hired.length === 0 ? (
        <Card className="border-none shadow-sm">
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <UserCheck className="size-12 mb-3 opacity-20" />
            <p className="text-sm font-semibold">No employees onboarded yet.</p>
            <p className="text-xs mt-1 opacity-60">
              Approved hires will appear here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {recentHires.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600">
                  New This Month
                </h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence>
                  {recentHires.map((app, idx) => (
                    <EmployeeOnboardingCard key={app.application_id} app={app} idx={idx} isNew />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {previousHires.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Previous Hires
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence>
                  {previousHires.map((app, idx) => (
                    <EmployeeOnboardingCard key={app.application_id} app={app} idx={idx} isNew={false} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
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
