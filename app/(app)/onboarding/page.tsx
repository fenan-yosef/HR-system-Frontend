"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Loader2, 
  UserCheck, 
  XCircle, 
  Briefcase,
  AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { 
  fetchApplications, 
  approveHire, 
  rejectHire, 
  hireApplicant 
} from "@/services/recruitmentService";
import { HireModal } from "@/features/recruitment/components/CEOActionModals";
import { Application } from "@/types/recruitment";
import { useAuth } from "@/hooks/useAuth";
import { canApproveRecruitment, isHRStaff } from "@/lib/permissions";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";

export default function OnboardingPage() {
  const [candidates, setCandidates] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hireTarget, setHireTarget] = useState<Application | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const canApprove = canApproveRecruitment(user);
  const isStaff = isHRStaff(user);

  useEffect(() => {
    loadPendingHires();
  }, [user]);

  const loadPendingHires = async () => {
    setIsLoading(true);
    try {
      // HR Staff sees candidates ready to be hired (invited)
      const invitedRes = await fetchApplications({ status: "interview_invited" });
      // CEO/Admin sees candidates awaiting hiring approval
      const hirePendingRes = await fetchApplications({ status: "hire_pending" });

      const all = [
        ...(invitedRes.results || []),
        ...(hirePendingRes.results || [])
      ].sort((a, b) => 
        new Date(b.updated_at || b.submitted_at).getTime() - 
        new Date(a.updated_at || a.submitted_at).getTime()
      );
      
      setCandidates(all);
    } catch (error) {
      console.error("Failed to load pending hires:", error);
      toast("Unable to load pending hires queue.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (app: Application) => {
    try {
      await approveHire(app.application_id);
      toast("Hiring approved! Employee record created.", "success");
      loadPendingHires();
    } catch (error: any) {
      toast(`Approval failed: ${error.message}`, "error");
    }
  };

  const handleReject = async (app: Application) => {
    const reason = window.prompt("Reason for rejecting hire:");
    if (reason === null) return;
    try {
      await rejectHire(app.application_id, reason);
      toast("Hire request rejected.", "success");
      loadPendingHires();
    } catch (error: any) {
      toast(`Rejection failed: ${error.message}`, "error");
    }
  };

  const pendingHiresCount = candidates.filter(c => c.status === "hire_pending").length;
  const readyToHireCount = candidates.filter(c => c.status === "interview_invited").length;

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Onboarding & Hiring</h1>
        <p className="text-muted-foreground">Manage the transition from candidate to employee.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Awaiting Approval", value: pendingHiresCount.toString(), color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Ready to Hire", value: readyToHireCount.toString(), color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "New Hires (Month)", value: "12", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Avg. Onboarding", value: "3 Days", color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 border-none shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                <UserPlus className="size-5" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-none shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Hiring Queue</h3>
              {isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            </div>

            <div className="space-y-4">
              {candidates.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
                  <UserCheck className="size-10 mb-2 opacity-20" />
                  <p className="text-sm font-medium">No pending hires found.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {candidates.map((app) => (
                    <motion.div
                      key={app.application_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                        {app.full_name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm truncate">{app.full_name}</h4>
                          <Badge variant="secondary" className={
                            app.status === "hire_pending" 
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-100" 
                              : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                          }>
                            {app.status === "hire_pending" ? "Pending Approval" : "Ready to Hire"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{app.position?.title} • {app.applicant?.email}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {app.status === "hire_pending" && canApprove && (
                          <>
                            <button
                              onClick={() => handleApprove(app)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle className="size-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(app)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                            >
                              <XCircle className="size-3.5" /> Reject
                            </button>
                          </>
                        )}
                        {app.status === "interview_invited" && isStaff && (
                          <button
                            onClick={() => setHireTarget(app)}
                            className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-1.5"
                          >
                            <Briefcase className="size-3.5" /> Initiate Hire
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 border-none bg-primary text-primary-foreground shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <Sparkles className="size-8 mb-4 text-white/40" />
              <h3 className="text-xl font-bold mb-2">Mentor Assignment</h3>
              <p className="text-sm text-primary-foreground/80 mb-6">Pair new hires with experienced team members to boost retention.</p>
              <button className="w-full bg-background text-foreground py-2.5 rounded-lg text-sm font-bold hover:bg-muted transition-colors">
                Configure Pairs
              </button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-x-10 -translate-y-10" />
          </Card>

          <Card className="p-6 border-none shadow-sm">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Clock className="size-4 text-primary" /> Recent Onboardings
            </h3>
            <div className="space-y-3">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
                  <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[10px] font-bold">
                    OK
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">Abebe Bikila</p>
                    <p className="text-[10px] text-muted-foreground">Joined 2 days ago</p>
                  </div>
                  <CheckCircle className="size-3.5 text-emerald-500" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {hireTarget && (
        <HireModal
          applicationId={hireTarget.application_id}
          applicantName={hireTarget.full_name || "Candidate"}
          onHire={async (data) => {
            await hireApplicant(hireTarget.application_id, data);
            toast(canApprove 
              ? `${hireTarget.full_name} has been hired! Welcome email sent.` 
              : `Hire request for ${hireTarget.full_name} sent for CEO approval.`, 
              "success"
            );
            setHireTarget(null);
            loadPendingHires();
          }}
          onClose={() => setHireTarget(null)}
        />
      )}
    </section>
  );
}
