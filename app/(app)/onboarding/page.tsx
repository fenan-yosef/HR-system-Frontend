"use client";
import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Sparkles, Loader2, Users, Briefcase, CheckCircle } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [hiringQueue, setHiringQueue] = useState<Application[]>([]);
  const [hireTarget, setHireTarget] = useState<Application | null>(null);
  const { user } = useAuth();
  const isStaff = !!user; // Placeholder logic

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
            icon: Users,
          },
          {
            label: "Pending Docs",
            value: "8",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            icon: Briefcase,
          },
          {
            label: "Completed",
            value: "24",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            icon: CheckCircle,
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
                      <h4 className="font-bold text-sm">Candidate Name</h4>
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
        </div>
      )}
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
