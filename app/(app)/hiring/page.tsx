"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  ChevronRight,
  AlertTriangle,
  UserCheck,
  Search,
  Filter,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fetchApplications,
  approveHire,
  rejectHire,
  hireApplicant,
} from "@/services/recruitmentService";
import {
  HireModal,
  RejectHireModal,
} from "@/features/recruitment/components/CEOActionModals";
import { Application } from "@/types/recruitment";
import { useAuth } from "@/hooks/useAuth";
import { canApproveRecruitment, isHRStaff } from "@/lib/permissions";
import { useToast } from "@/components/ui/toast";

type HireStatus =
  | "interview_invited"
  | "hire_pending"
  | "hired"
  | "hire_rejected";

const STATUS_META: Record<
  HireStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  interview_invited: {
    label: "Interview Done",
    color: "text-blue-600",
    bg: "bg-blue-500/10 border-blue-200",
    icon: UserCheck,
  },
  hire_pending: {
    label: "Pending Approval",
    color: "text-amber-600",
    bg: "bg-amber-500/10 border-amber-200",
    icon: Clock,
  },
  hired: {
    label: "Hired",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10 border-emerald-200",
    icon: CheckCircle,
  },
  hire_rejected: {
    label: "Rejected",
    color: "text-red-600",
    bg: "bg-red-500/10 border-red-200",
    icon: XCircle,
  },
};

const PIPELINE_STAGES: HireStatus[] = [
  "interview_invited",
  "hire_pending",
  "hired",
  "hire_rejected",
];

export default function HiringPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<HireStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [hireTarget, setHireTarget] = useState<Application | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Application | null>(null);
  const [reRequestTarget, setReRequestTarget] = useState<Application | null>(
    null
  );

  const { user } = useAuth();
  const { toast } = useToast();
  const canApprove = canApproveRecruitment(user);
  const isStaff = isHRStaff(user);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [invited, pending, hired, rejected] = await Promise.all([
        fetchApplications({ status: "interview_invited" }),
        fetchApplications({ status: "hire_pending" }),
        fetchApplications({ status: "hired" }),
        fetchApplications({ status: "hire_rejected" }),
      ]);

      const all = [
        ...(invited.results || []),
        ...(pending.results || []),
        ...(hired.results || []),
        ...(rejected.results || []),
      ].sort(
        (a, b) =>
          new Date(b.updated_at || b.submitted_at).getTime() -
          new Date(a.updated_at || a.submitted_at).getTime()
      );

      setApplications(all);
    } catch {
      toast("Failed to load hiring requests.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleApprove = async (app: Application) => {
    try {
      await approveHire(app.application_id);
      toast(`${app.full_name} hire approved. Employee record created.`, "success");
      loadAll();
    } catch (e: any) {
      toast(`Approval failed: ${e.message}`, "error");
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      await rejectHire(rejectTarget.application_id, reason);
      toast("Hire request rejected and reason recorded.", "success");
      setRejectTarget(null);
      loadAll();
    } catch (e: any) {
      toast(`Rejection failed: ${e.message}`, "error");
    }
  };

  const handleHire = async (data: {
    start_date: string;
    salary: number;
    national_id: string;
  }) => {
    const target = hireTarget || reRequestTarget;
    if (!target) return;
    await hireApplicant(target.application_id, data);
    toast(
      canApprove
        ? `${target.full_name} hired! Welcome email sent.`
        : `Hire request for ${target.full_name} submitted for CEO approval.`,
      "success"
    );
    setHireTarget(null);
    setReRequestTarget(null);
    loadAll();
  };

  const counts = PIPELINE_STAGES.reduce(
    (acc, s) => ({
      ...acc,
      [s]: applications.filter((a) => a.status === s).length,
    }),
    {} as Record<HireStatus, number>
  );

  const filtered = applications.filter((a) => {
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchSearch =
      !search ||
      a.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.position?.title?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <section className="space-y-8">
      {/* ── Header Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center">
              <Briefcase className="size-5 text-violet-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Hiring Requests
              </h1>
              <p className="text-slate-400 text-sm">
                Track, approve, and manage all hire requests
              </p>
            </div>
          </div>

          {/* Pipeline stage counters */}
          <div className="mt-6 flex flex-wrap gap-4">
            {PIPELINE_STAGES.map((stage, i) => {
              const meta = STATUS_META[stage];
              const Icon = meta.icon;
              return (
                <motion.button
                  key={stage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() =>
                    setFilterStatus((prev) =>
                      prev === stage ? "all" : stage
                    )
                  }
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 border transition-all text-sm font-semibold ${
                    filterStatus === stage
                      ? "bg-white text-slate-900 border-white shadow-lg"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{meta.label}</span>
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-xs font-black ${
                      filterStatus === stage
                        ? "bg-slate-900 text-white"
                        : "bg-white/20"
                    }`}
                  >
                    {counts[stage] ?? 0}
                  </span>
                </motion.button>
              );
            })}

            <button
              onClick={() => setFilterStatus("all")}
              className={`ml-auto flex items-center gap-1.5 rounded-xl px-4 py-2.5 border text-sm font-semibold transition-all ${
                filterStatus === "all"
                  ? "bg-white text-slate-900 border-white"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
            >
              All · {applications.length}
            </button>
          </div>
        </div>
      </div>

      {/* ── Search + Refresh ── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or position…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={loadAll}
          disabled={isLoading}
          className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted transition-colors"
        >
          <RefreshCw
            className={`size-4 text-muted-foreground ${isLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* ── Table ── */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Candidate
                </th>
                <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Position
                </th>
                <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Status
                </th>
                <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Last Updated
                </th>
                <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Notes / Reason
                </th>
                <th className="text-right py-3 px-5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="size-6 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <Briefcase className="size-10 mb-3 opacity-20" />
                      <p className="text-sm font-medium">No hiring requests found.</p>
                      <p className="text-xs mt-1 opacity-60">
                        Try changing the filter or search term.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filtered.map((app, idx) => {
                    const status = app.status as HireStatus;
                    const meta = STATUS_META[status] ?? STATUS_META["hire_pending"];
                    const Icon = meta.icon;
                    const initials = app.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <motion.tr
                        key={app.application_id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        {/* Candidate */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold">{app.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {app.applicant?.email || app.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Position */}
                        <td className="py-4 px-5">
                          <p className="font-medium">{app.position?.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {app.position?.department}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border ${meta.bg} ${meta.color}`}
                          >
                            <Icon className="size-3.5" />
                            {meta.label}
                          </span>
                        </td>

                        {/* Last Updated */}
                        <td className="py-4 px-5 text-xs text-muted-foreground">
                          {new Date(
                            app.updated_at || app.submitted_at
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        {/* Rejection reason / note */}
                        <td className="py-4 px-5 max-w-[200px]">
                          {status === "hire_rejected" && app.rejection_reason ? (
                            <div className="flex items-start gap-1.5">
                              <AlertTriangle className="size-3.5 text-red-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-red-600 line-clamp-2">
                                {app.rejection_reason}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-end gap-2">
                            {/* HR Staff: initiate hire for interview_invited */}
                            {status === "interview_invited" && isStaff && (
                              <button
                                onClick={() => setHireTarget(app)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all"
                              >
                                <Briefcase className="size-3.5" />
                                Initiate Hire
                              </button>
                            )}

                            {/* CEO/Admin: approve or reject hire_pending */}
                            {status === "hire_pending" && canApprove && (
                              <>
                                <button
                                  onClick={() => handleApprove(app)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all"
                                >
                                  <CheckCircle className="size-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => setRejectTarget(app)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-200"
                                >
                                  <XCircle className="size-3.5" />
                                  Reject
                                </button>
                              </>
                            )}

                            {/* HR Staff: re-request on hire_rejected */}
                            {status === "hire_rejected" && isStaff && (
                              <button
                                onClick={() => setReRequestTarget(app)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-700 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all border border-amber-200"
                              >
                                <RotateCcw className="size-3.5" />
                                Re-request
                              </button>
                            )}

                            {/* CEO sees rejection reason for rejected */}
                            {status === "hire_rejected" && canApprove && !isStaff && (
                              <span className="text-xs text-muted-foreground italic">
                                Recorded
                              </span>
                            )}

                            {status === "hired" && (
                              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                <CheckCircle className="size-3.5" />
                                Complete
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Modals ── */}
      <AnimatePresence>
        {(hireTarget || reRequestTarget) && (
          <HireModal
            applicationId={(hireTarget || reRequestTarget)!.application_id}
            applicantName={(hireTarget || reRequestTarget)!.full_name || "Candidate"}
            onHire={handleHire}
            onClose={() => {
              setHireTarget(null);
              setReRequestTarget(null);
            }}
          />
        )}
        {rejectTarget && (
          <RejectHireModal
            applicationId={rejectTarget.application_id}
            applicantName={rejectTarget.full_name || "Candidate"}
            onReject={handleReject}
            onClose={() => setRejectTarget(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
