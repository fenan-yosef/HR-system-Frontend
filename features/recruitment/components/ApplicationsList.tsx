"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Wand2,
  Loader2,
  Layers,
} from "lucide-react";
import {
  fetchApplications,
  fetchJobPositions,
  triggerShortlist,
  exportApplicationsCsv,
  confirmApplication,
  inviteToInterview,
  hireApplicant,
  batchEvaluateApplications,
} from "@/services/recruitmentService";
import type { Application, JobPosition } from "@/types/recruitment";
import { useAuth } from "@/hooks/useAuth";
import { isHRStaff, isHRCeo } from "@/lib/permissions";
import { useToast } from "@/components/ui/toast";
import { ApplicationMetrics } from "./ApplicationMetrics";
import { ApplicationFilters } from "./ApplicationFilters";
import { ConfirmModal, InviteInterviewModal, HireModal } from "./CEOActionModals";
import { EvaluationDetailsModal } from "./EvaluationDetailsModal";

type CeoModalType = "confirm" | "invite" | "hire" | null;

export function ApplicationsList() {
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [startsWith, setStartsWith] = useState("");
  const [appliedToday, setAppliedToday] = useState(false);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedJobId, setSelectedJobId] = useState<string | number>("");
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // CEO action modals
  const [ceoModal, setCeoModal] = useState<CeoModalType>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);
  const [evaluatingApps, setEvaluatingApps] = useState<number[]>([]);

  const { user } = useAuth();
  const { toast } = useToast();
  const canShortlist = isHRStaff(user);
  const canCEOActions = isHRCeo(user);
 
  useEffect(() => {
    fetchJobPositions().then(res => setJobPositions(res.results)).catch(console.error);
  }, []);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchApplications({
        page,
        search,
        status,
        min_score: minScore > 0 ? minScore : undefined,
        starts_with: startsWith || undefined,
        applied_today: appliedToday || undefined,
        position_id: selectedJobId || undefined,
      });
      setApps(response.results);
      setTotalCount(response.count);
    } catch (err: any) {
      const message = err?.message || "Failed to load applications";
      if (message.includes("401")) {
        window.location.href = "/login";
        return;
      }
      setError(message);
      console.error("Failed to fetch applications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, minScore, startsWith, appliedToday, selectedJobId]);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        loadApplications();
      },
      search ? 300 : 0
    );
    return () => clearTimeout(timer);
  }, [loadApplications, search]);

  /* ───── Shortlist/Evaluate action ───── */
  const handleShortlist = async (appId: number) => {
    setEvaluatingApps(prev => [...prev, appId]);
    try {
      await triggerShortlist(appId);
      toast("AI Evaluation completed successfully", "success");
      loadApplications();
    } catch (err: any) {
      handleActionError(err, "evaluate");
    } finally {
      setEvaluatingApps(prev => prev.filter(id => id !== appId));
    }
  };

  const handleBatchEvaluate = async () => {
    setIsBatchEvaluating(true);
    try {
      const resp = await batchEvaluateApplications();
      toast(resp.message || "Batch evaluation started", "success");
      loadApplications();
    } catch (err: any) {
      handleActionError(err, "batch evaluate");
    } finally {
      setIsBatchEvaluating(false);
    }
  };

  /* ───── CEO: Confirm ───── */
  const handleConfirm = async (note: string) => {
    if (!selectedApp) return;
    try {
      await confirmApplication(selectedApp.application_id, {
        confirmed_by: user?.id ?? null,
        note,
      });
      toast("Application confirmed successfully", "success");
      setCeoModal(null);
      setSelectedApp(null);
      loadApplications();
    } catch (err: any) {
      handleActionError(err, "confirm");
    }
  };

  /* ───── CEO: Invite ───── */
  const handleInvite = async (data: { datetime: string; location: string; message: string }) => {
    if (!selectedApp) return;
    try {
      await inviteToInterview(selectedApp.application_id, data);
      toast("Interview invitation sent successfully", "success");
      setCeoModal(null);
      setSelectedApp(null);
      loadApplications();
    } catch (err: any) {
      handleActionError(err, "invite");
    }
  };

  /* ───── CEO: Hire ───── */
  const handleHire = async (data: { start_date: string; salary: number }) => {
    if (!selectedApp) return;
    try {
      await hireApplicant(selectedApp.application_id, {
        start_date: data.start_date,
        package: { salary: data.salary },
        hired_by: user?.id ?? null,
      });
      toast("Candidate hired successfully! 🎉", "success");
      setCeoModal(null);
      setSelectedApp(null);
      loadApplications();
    } catch (err: any) {
      handleActionError(err, "hire");
    }
  };

  /* ───── Shared error handler for actions ───── */
  const handleActionError = (err: any, action: string) => {
    const msg = err?.message || "";
    if (msg.includes("401")) {
      window.location.href = "/login";
    } else if (msg.includes("403")) {
      toast("You don't have permission to perform this action.", "error");
    } else if (msg.includes("400")) {
      toast(`Validation error for ${action}. Please check your input.`, "warning");
    } else {
      toast(`Failed to ${action}. Please try again.`, "error");
    }
  };

  /* ───── Export CSV ───── */
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportApplicationsCsv({ status, min_score: minScore });
      toast("CSV export started — check your downloads.", "success");
    } catch {
      toast("Failed to export CSV. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setMinScore(0);
    setStartsWith("");
    setAppliedToday(false);
    setPage(1);
    setSortBy("newest");
    setSelectedJobId("");
  };

  const openCeoModal = (app: Application, modal: CeoModalType) => {
    setSelectedApp(app);
    setCeoModal(modal);
  };

  const openDetailsModal = (app: Application) => {
    setSelectedApp(app);
    setIsDetailsModalOpen(true);
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const getApplicantName = (app: Application) =>
    app.full_name || app.applicant?.full_name || "Unknown";

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "shortlisted":
        return "bg-emerald-500/10 text-emerald-600";
      case "pending":
        return "bg-blue-500/10 text-blue-600";
      case "rejected":
        return "bg-red-500/10 text-red-600";
      case "confirmed":
        return "bg-violet-500/10 text-violet-600";
      case "hired":
        return "bg-amber-500/10 text-amber-600";
      case "interview_invited":
        return "bg-cyan-500/10 text-cyan-600";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case "shortlisted":
        return <CheckCircle2 className="size-3" />;
      case "confirmed":
        return <ShieldCheck className="size-3" />;
      case "hired":
        return <Briefcase className="size-3" />;
      case "interview_invited":
        return <Calendar className="size-3" />;
      default:
        return <Clock className="size-3" />;
    }
  };

  return (
    <div className="space-y-8">
      <ApplicationMetrics />

      <ApplicationFilters
        search={search}
        status={status}
        minScore={minScore}
        appliedToday={appliedToday}
        isExporting={isExporting}
        isBatchEvaluating={isBatchEvaluating}
        onBatchEvaluate={handleBatchEvaluate}
        canBatchEvaluate={canShortlist}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        selectedJobId={selectedJobId}
        jobPositions={jobPositions.map(j => ({ id: j.position_id, title: j.title }))}
        onJobChange={(val) => { setSelectedJobId(val); setPage(1); }}
        onMinScoreChange={setMinScore}
        onAppliedTodayChange={setAppliedToday}
        onExport={handleExport}
        onReset={handleResetFilters}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      {/* Alphabet quick-filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
        <button
          onClick={() => { setStartsWith(""); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            !startsWith
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All
        </button>
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => { setStartsWith(letter); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              startsWith === letter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Application cards */}
      <div className="grid gap-4 min-h-[400px]">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
          ))
        ) : error ? (
          /* ────── Error state with retry ────── */
          <div className="flex flex-col items-center justify-center py-20 bg-red-500/5 rounded-3xl border border-dashed border-red-500/20">
            <AlertCircle className="size-12 text-red-400 mb-4" />
            <p className="text-muted-foreground font-medium text-center max-w-md mb-1">
              Something went wrong
            </p>
            <p className="text-sm text-muted-foreground/70 text-center max-w-md mb-6">
              {error}
            </p>
            <button
              onClick={loadApplications}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:shadow-lg transition-all active:scale-95"
            >
              <RefreshCw className="size-4" />
              Try Again
            </button>
          </div>
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
            <User className="size-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium">
              No candidates match your criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 text-xs font-bold text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(
              apps.reduce((acc, app) => {
                const jobTitle = app.position?.title || "Other Positions";
                if (!acc[jobTitle]) acc[jobTitle] = [];
                acc[jobTitle].push(app);
                return acc;
              }, {} as Record<string, Application[]>)
            ).map(([jobTitle, jobApps]) => (
              <div key={jobTitle} className="space-y-4">
                <div className="flex items-center gap-4 px-2">
                   <div className="h-8 w-1 bg-primary rounded-full" />
                   <h3 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
                     {jobTitle}
                     <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                       {jobApps.length} candidates
                     </span>
                   </h3>
                </div>
                
                <AnimatePresence mode="popLayout">
                  {[...jobApps]
                    .sort((a, b) => {
                      if (sortBy === "score_desc") return (b.evaluation?.matching_percentage ?? 0) - (a.evaluation?.matching_percentage ?? 0);
                      if (sortBy === "score_asc") return (a.evaluation?.matching_percentage ?? 0) - (b.evaluation?.matching_percentage ?? 0);
                      if (sortBy === "rank_asc") return (a.evaluation?.ai_rank ?? 999) - (b.evaluation?.ai_rank ?? 999);
                      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
                    })
                    .map((app, i) => (
                <motion.div
                  key={app.application_id}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 border-none shadow-sm hover:shadow-md transition-all gap-6">
                    {/* ── Applicant info ── */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <User className="size-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base leading-none mb-1.5">
                          {getApplicantName(app)}
                        </h4>
                        <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                          {app.position?.title}
                          <span className="size-1 rounded-full bg-border" />
                          {new Date(app.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* ── AI Evaluation Section ── */}
                    <div className="flex items-center gap-6 px-6 border-x border-border/50 hidden lg:flex">
                      <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                            Match Score
                          </span>
                          <span className="text-xs font-bold text-primary">
                            {app.evaluation?.matching_percentage ?? 0}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${app.evaluation?.matching_percentage ?? 0}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-primary"
                          />
                        </div>
                      </div>
                      {app.evaluation?.ai_rank && (
                        <div className="flex items-center gap-2">
                          <div className="bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-xl flex items-center gap-2">
                            <Star className="size-3.5 fill-current" />
                            <span className="text-xs font-extrabold">
                              RANK #{app.evaluation.ai_rank}
                            </span>
                          </div>
                          {app.evaluation.cluster_id && (
                            <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl flex items-center gap-2">
                               <Layers className="size-3.5 text-blue-400" />
                               <span className="text-[10px] font-black tracking-tighter">
                                  CLUSTER {app.evaluation.cluster_id}
                               </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* ── Status & Actions ── */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between sm:justify-end">
                      <div className="flex flex-col items-start sm:items-end min-w-[120px] gap-2">
                        <span
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(
                            app.status
                          )}`}
                        >
                          {getStatusIcon(app.status)}
                          {app.status.replace("_", " ")}
                        </span>
                        
                        {app.evaluation?.fit_label && (
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                            app.evaluation.fit_label === "Strong fit" 
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" 
                              : app.evaluation.fit_label === "Good fit (gaps)"
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                              : "bg-red-500/10 border-red-500/30 text-red-600"
                          }`}>
                            {app.evaluation.fit_label}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Evaluate/Shortlist Action */}
                        {canShortlist && (app.status === "pending" || app.status === "submitted") && (
                          <button
                            onClick={() => handleShortlist(app.application_id)}
                            disabled={evaluatingApps.includes(app.application_id)}
                            className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:shadow-lg shadow-violet-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                          >
                            {evaluatingApps.includes(app.application_id) ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Wand2 className="size-3" />
                            )}
                            {app.evaluation ? "Re-evaluate" : "Evaluate AI"}
                          </button>
                        )}

                        {/* CEO Actions */}
                        {canCEOActions && app.status === "shortlisted" && (
                          <button
                            onClick={() => openCeoModal(app, "confirm")}
                            className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all active:scale-95"
                          >
                            <ShieldCheck className="size-3.5 inline mr-1" />
                            Confirm
                          </button>
                        )}
                        {canCEOActions && (app.status === "confirmed" || app.status === "shortlisted") && (
                          <button
                            onClick={() => openCeoModal(app, "invite")}
                            className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all active:scale-95"
                          >
                            <Calendar className="size-3.5 inline mr-1" />
                            Invite
                          </button>
                        )}
                        {canCEOActions && (app.status === "confirmed" || app.status === "interview_invited") && (
                          <button
                            onClick={() => openCeoModal(app, "hire")}
                            className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-all active:scale-95"
                          >
                            <Briefcase className="size-3.5 inline mr-1" />
                            Hire
                          </button>
                        )}

                        <div 
                          onClick={() => openDetailsModal(app)}
                          className="bg-muted p-2.5 rounded-xl group-hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 10 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-2 rounded-xl bg-muted disabled:opacity-30 hover:bg-muted/80 transition-colors"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="text-sm font-bold">
            Page {page} of {Math.ceil(totalCount / 10)}
          </span>
          <button
            disabled={page >= Math.ceil(totalCount / 10)}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 rounded-xl bg-muted disabled:opacity-30 hover:bg-muted/80 transition-colors"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}

      {/* CEO Action Modals */}
      <AnimatePresence>
        {ceoModal === "confirm" && selectedApp && (
          <ConfirmModal
            applicationId={selectedApp.application_id}
            applicantName={getApplicantName(selectedApp)}
            onConfirm={handleConfirm}
            onClose={() => { setCeoModal(null); setSelectedApp(null); }}
          />
        )}
        {ceoModal === "invite" && selectedApp && (
          <InviteInterviewModal
            applicationId={selectedApp.application_id}
            applicantName={getApplicantName(selectedApp)}
            onInvite={handleInvite}
            onClose={() => { setCeoModal(null); setSelectedApp(null); }}
          />
        )}
        {ceoModal === "hire" && selectedApp && (
          <HireModal
            applicationId={selectedApp.application_id}
            applicantName={getApplicantName(selectedApp)}
            onHire={handleHire}
            onClose={() => { setCeoModal(null); setSelectedApp(null); }}
          />
        )}
        {isDetailsModalOpen && selectedApp && (
          <EvaluationDetailsModal
            application={selectedApp}
            onClose={() => { setIsDetailsModalOpen(false); setSelectedApp(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
