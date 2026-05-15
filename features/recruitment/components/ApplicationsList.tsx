"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Search,
  Download,
  Filter,
  RefreshCw,
  Wand2,
  Loader2,
  Layers,
  AlertTriangle,
  RotateCcw,
  User,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  AlertCircle,
  Inbox,
  CheckCircle2,
  Eye,
  Star,
  Brain,
} from "lucide-react";
import {
  fetchApplications,
  fetchApplication,
  exportApplicationsCsv,
  confirmApplication,
  inviteToInterview,
  hireApplicant,
  retryExtraction,
  fetchJobPositions,
  toggleShortlist,
  startScreening,
} from "@/services/recruitmentService";
import type { Application, JobPosition } from "@/types/recruitment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  isAdmin,
  isHRCeo,
  isHRStaff,
  canManageRecruitment,
  canApproveRecruitment,
} from "@/lib/permissions";
import { ApplicationFilters } from "./ApplicationFilters";
import { ApplicationMetrics } from "./ApplicationMetrics";
import { EvaluationDetailsModal } from "./EvaluationDetailsModal";
import { useToast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import { getMediaUrl } from "@/services/apiClient";

interface ApplicationsListProps {
  jobPositions?: JobPosition[];
}

export function ApplicationsList({
  jobPositions: initialJobPositions,
}: ApplicationsListProps) {
  const [apps, setApps] = useState<Application[]>([]);
  const [localJobPositions, setLocalJobPositions] = useState<JobPosition[]>(
    initialJobPositions || [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [appliedToday, setAppliedToday] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | number>("");
  const [startsWith, setStartsWith] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);
  const [evaluatingApps, setEvaluatingApps] = useState<number[]>([]);
  const [retryingApps, setRetryingApps] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showShortlistDialog, setShowShortlistDialog] = useState(false);
  const [shortlistAppId, setShortlistAppId] = useState<number | null>(null);
  const router = useRouter();

  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const orderingMap: Record<string, string> = {
        score_desc: "-screening_result__overall_score",
        score_asc: "screening_result__overall_score",
        rank_asc: "screening_result__overall_score",
        newest: "-submitted_at",
      };
      const response = await fetchApplications({
        page,
        search,
        status,
        min_score: minScore > 0 ? minScore : undefined,
        ordering: orderingMap[sortBy] || undefined,
        starts_with: startsWith || undefined,
        applied_today: appliedToday || undefined,
        position_id: selectedJobId || undefined,
      });
      setApps(
        response.results.map((app: any) => ({
          ...app,
          full_name:
            app.full_name ||
            app.applicant?.full_name ||
            app.applicant_name ||
            "Unknown Applicant",
        })),
      );
    } catch (err: any) {
      setError(err.message || "Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    search,
    status,
    minScore,
    startsWith,
    appliedToday,
    selectedJobId,
    sortBy,
  ]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        loadApplications();
      },
      search ? 300 : 0,
    );
    return () => clearTimeout(timer);
  }, [
    loadApplications,
    search,
    page,
    status,
    minScore,
    startsWith,
    appliedToday,
    selectedJobId,
    sortBy,
  ]);

  useEffect(() => {
    if (!initialJobPositions || initialJobPositions.length === 0) {
      const loadPositions = async () => {
        try {
          const response = await fetchJobPositions();
          setLocalJobPositions(response.results);
        } catch (err) {
          console.error("Failed to load job positions for filters:", err);
        }
      };
      loadPositions();
    }
  }, [initialJobPositions]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportApplicationsCsv();
      toast("Applications exported successfully", "success");
    } catch (err: any) {
      toast("Export failed: " + err.message, "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleBatchEvaluate = async () => {
    if (!selectedJobId) {
      toast(
        "Please select a specific job position first to run AI screening.",
        "warning",
      );
      return;
    }

    // Check if any applications already have results
    const alreadyEvaluatedCount = apps.filter(
      (app) => app.screening_result,
    ).length;

    if (alreadyEvaluatedCount > 0 && !showConfirmModal) {
      setShowConfirmModal(true);
      return;
    }

    setShowConfirmModal(false);
    setIsBatchEvaluating(true);
    try {
      await startScreening(Number(selectedJobId));
      toast("Screening started — redirecting to progress view.", "success");
      router.push(`/recruitment/job-postings/${selectedJobId}/screening`);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("405") || msg.includes("404")) {
        toast("Screening endpoint not available on this backend.", "warning");
      } else {
        toast(
          "Failed to start screening. The AI service may be offline.",
          "error",
        );
      }
    } finally {
      setIsBatchEvaluating(false);
    }
  };

  const handleBrainClick = async (app: Application) => {
    if (app.screening_result) {
      try {
        const details = await fetchApplication(app.application_id, {
          includeHistory: true,
          includeDeleted: true,
        });
        setSelectedApp(details);
      } catch {
        // Fallback to list payload if full fetch fails.
        setSelectedApp(app);
      }
      return;
    }

    const posId = app.position?.position_id;
    if (!posId) {
      toast("Could not determine job position for this application.", "error");
      return;
    }

    setIsBatchEvaluating(true);
    try {
      await startScreening(Number(posId));
      toast("Screening started — redirecting to progress view.", "success");
      router.push(`/recruitment/job-postings/${posId}/screening`);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("405") || msg.includes("404")) {
        toast("Screening endpoint not available on this backend.", "warning");
      } else {
        toast(
          "Failed to start screening. The AI service may be offline.",
          "error",
        );
      }
    } finally {
      setIsBatchEvaluating(false);
    }
  };

  const handleToggleShortlist = async (appId: number, skipAiCheck = false) => {
    const app = apps.find((a) => a.application_id === appId);
    if (!app) return;

    // Requirement: shortlist without ai review dialog
    if (!app.screening_result && !app.is_shortlisted && !skipAiCheck) {
      setShortlistAppId(appId);
      setShowShortlistDialog(true);
      return;
    }

    try {
      const res = await toggleShortlist(appId);
      setApps((prev) =>
        prev.map((a) =>
          a.application_id === appId
            ? {
                ...a,
                is_shortlisted: res.shortlisted,
                status: res.status as any,
              }
            : a,
        ),
      );
      toast(
        res.shortlisted ? "Added to shortlist" : "Removed from shortlist",
        "success",
      );
      setShowShortlistDialog(false);
    } catch (err: any) {
      toast("Action failed: " + err.message, "error");
    }
  };

  const handleShortlistWithAi = async () => {
    if (!shortlistAppId) return;
    const app = apps.find((a) => a.application_id === shortlistAppId);
    if (!app) return;

    const posId = app.position?.position_id;
    if (!posId) {
      toast("Position ID not found", "error");
      return;
    }

    try {
      await startScreening(Number(posId));
      toast("Screening started — redirecting to progress view.", "success");
      router.push(`/recruitment/job-postings/${posId}/screening`);
    } catch (err: any) {
      toast("Failed to start screening: " + err.message, "error");
    }
  };

  const handleRetryExtraction = async (appId: number) => {
    setRetryingApps((prev) => [...prev, appId]);
    try {
      await retryExtraction(appId);
      toast("Re-extraction triggered successfully.", "success");
      loadApplications();
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("405") || msg.includes("404")) {
        toast(
          "Re-extraction endpoint not available on this backend.",
          "warning",
        );
      } else {
        toast(
          "Failed to retry extraction. The AI service may be offline.",
          "error",
        );
      }
    } finally {
      setRetryingApps((prev) => prev.filter((id) => id !== appId));
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setMinScore(0);
    setAppliedToday(false);
    setSelectedJobId("");
    setStartsWith("");
    setSortBy("newest");
  };

  const handleActionError = (err: any, action: string) => {
    toast(`Failed to ${action}: ${err.message}`, "error");
  };

  const canPerformRecruitment = canManageRecruitment(user);
  const canPerformApproval = canApproveRecruitment(user);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "hired":
        return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
      case "shortlisted":
        return "bg-violet-500/10 text-violet-600 border border-violet-500/20";
      case "interview_invited":
        return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-600 border border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "hired":
        return "✓";
      case "shortlisted":
        return "★";
      case "interview_invited":
        return "✉";
      case "rejected":
        return "✕";
      default:
        return "•";
    }
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const jobGroups = useMemo(() => {
    return apps.reduce(
      (acc, app) => {
        const jobTitle = app.position?.title || "Other Positions";
        if (!acc[jobTitle]) acc[jobTitle] = [];
        acc[jobTitle].push(app);
        return acc;
      },
      {} as Record<string, Application[]>,
    );
  }, [apps]);

  // Prevent hydration mismatch and provide a stable mounting state
  if (!isMounted) {
    return (
      <div className="space-y-6 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="size-16 border-4 border-primary/10 border-t-primary/40 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="size-6 text-primary/40 animate-pulse" />
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 animate-pulse">
          Initializing Interface...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <ApplicationMetrics />

      <div className="flex lg:hidden items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-xs font-black uppercase tracking-widest"
        >
          <Filter size={14} /> {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Column */}
        <aside
          className={`lg:col-span-1 space-y-8 ${showFilters ? "block" : "hidden lg:block"}`}
        >
          <ApplicationFilters
            search={search}
            status={status}
            minScore={minScore}
            appliedToday={appliedToday}
            selectedJobId={selectedJobId}
            jobPositions={localJobPositions}
            isExporting={isExporting}
            isBatchEvaluating={isBatchEvaluating}
            onBatchEvaluate={handleBatchEvaluate}
            canBatchEvaluate={canPerformRecruitment}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onMinScoreChange={setMinScore}
            onAppliedTodayChange={setAppliedToday}
            onJobChange={setSelectedJobId}
            onExport={handleExport}
            onReset={handleResetFilters}
            sortBy={sortBy}
            onSortByChange={setSortBy}
          />

          {/* Quick Alphabet Filter Card */}
          <div className="p-5 rounded-2xl bg-muted/5 border border-border/50 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <User size={12} /> Name Filter
            </div>
            <div className="grid grid-cols-6 gap-1">
              <button
                onClick={() => {
                  setStartsWith("");
                  setPage(1);
                }}
                className={`col-span-2 py-1 rounded-md text-[10px] font-bold transition-all ${!startsWith ? "bg-primary text-white shadow-sm" : "bg-background border border-border/50 text-muted-foreground hover:bg-muted"}`}
              >
                ALL
              </button>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => {
                    setStartsWith(letter);
                    setPage(1);
                  }}
                  className={`py-1 rounded-md text-[10px] font-bold transition-all ${startsWith === letter ? "bg-primary text-white shadow-sm" : "bg-background border border-border/50 text-muted-foreground hover:bg-muted"}`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Column */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            /* Skeleton Loader */
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-muted/30 animate-pulse rounded-[2rem] border border-border/30"
                />
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center py-20 bg-red-500/5 rounded-[3rem] border border-dashed border-red-500/20">
              <AlertCircle className="size-12 text-red-500 mb-4 animate-bounce" />
              <h3 className="text-xl font-black uppercase tracking-tight text-red-600">
                Sync Error
              </h3>
              <p className="text-muted-foreground font-medium mb-6">{error}</p>
              <button
                onClick={loadApplications}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:shadow-xl transition-all active:scale-95"
              >
                <RefreshCw className="size-4" /> Try Refreshing
              </button>
            </div>
          ) : apps.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-32 bg-muted/5 rounded-[3rem] border border-dashed border-border/50 text-center">
              <div className="size-20 bg-muted rounded-full flex items-center justify-center mb-6 opacity-40">
                <Inbox className="size-10" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest">
                No matching candidates
              </h3>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto mb-8">
                We couldn't find any applicants matching your current filter
                set. Try broadening your search or resetting the filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-8 py-3 rounded-2xl bg-primary/10 text-primary font-black uppercase tracking-widest text-xs hover:bg-primary/20 transition-all"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Results List */
            <div className="space-y-12">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Showing {apps.length} Candidate{apps.length !== 1 ? "s" : ""}
                </h2>
                <div className="flex items-center gap-3">
                  {canPerformRecruitment && (
                    <button
                      onClick={handleBatchEvaluate}
                      disabled={!selectedJobId}
                      className={`px-3 py-2 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${selectedJobId ? "bg-primary text-white hover:shadow-xl" : "bg-muted/10 text-muted-foreground cursor-not-allowed"}`}
                    >
                      {isBatchEvaluating ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <BrainCircuit className="size-4" />
                      )}
                      {isBatchEvaluating ? "Starting..." : "Batch Screen"}
                    </button>
                  )}
                </div>
              </div>

              {Object.entries(jobGroups).map(([jobTitle, jobApps]) => {
                const jobSkills =
                  (jobApps?.[0]?.position as any)?.required_skills || [];
                return (
                  <div key={jobTitle} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-black tracking-tight">
                        {jobTitle}
                      </span>
                      <div className="h-px flex-1 bg-border/40" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                        {jobApps.length} APPS
                      </span>
                    </div>

                    {jobSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {jobSkills.slice(0, 8).map((s: string) => (
                          <span
                            key={s}
                            className="px-3 py-1 rounded-full bg-muted/10 text-muted-foreground text-[10px] font-black uppercase"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="grid gap-4">
                      {jobApps.map((app) => {
                        const applicant: any =
                          (app as any).applicant || (app as any);
                        const fullName =
                          applicant?.full_name ||
                          (app as any).full_name ||
                          (app as any).applicant_name ||
                          "Unknown";
                        const email =
                          applicant?.email || (app as any).email || "";
                        const phone =
                          applicant?.phone || (app as any).phone || "";
                        const submittedAt =
                          applicant?.submitted_at ||
                          (app as any).submitted_at ||
                          app.submitted_at;
                        const tracking =
                          applicant?.tracking_code ||
                          (app as any).tracking_code ||
                          "";
                        const documents: any[] =
                          applicant?.documents || (app as any).documents || [];
                        const cvDoc = documents.find(
                          (d: any) => d.document_type === "cv",
                        );
                        const cvUrl = cvDoc?.file_url;
                        const scoreValue = Number(
                          app.screening_result?.final_score ||
                            app.screening_result?.overall_score ||
                            app.evaluation?.matching_percentage ||
                            (app.evaluation?.ai_rank
                              ? app.evaluation.ai_rank * 100
                              : 0) ||
                            0,
                        );

                        return (
                          <motion.div
                            key={app.application_id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative"
                          >
                            <div
                              className="p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-background border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer"
                              onClick={() => handleBrainClick(app)}
                            >
                              <div className="flex flex-col xl:flex-row xl:items-center gap-4 sm:gap-6">
                                {/* Candidate Info */}
                                <div className="flex items-start sm:items-center gap-4 flex-1">
                                  <div className="size-10 sm:size-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-base sm:text-lg shrink-0">
                                    {fullName?.charAt(0) || "U"}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <Link
                                      href={`/recruitment/applications/${app.application_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <h4 className="font-black text-base sm:text-lg group-hover:text-primary transition-colors cursor-pointer truncate">
                                        {fullName}
                                      </h4>
                                    </Link>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-muted-foreground font-medium">
                                      {email && (
                                        <span className="truncate max-w-[150px] sm:max-w-none">
                                          {email}
                                        </span>
                                      )}
                                      {phone && (
                                        <span className="hidden sm:inline opacity-30">
                                          •
                                        </span>
                                      )}
                                      {phone && <span>{phone}</span>}
                                      <span className="hidden sm:inline opacity-30">
                                        •
                                      </span>
                                      <span>
                                        {submittedAt
                                          ? new Date(
                                              submittedAt,
                                            ).toLocaleDateString(undefined, {
                                              year: "numeric",
                                              month: "short",
                                              day: "numeric",
                                            })
                                          : ""}
                                      </span>
                                      {tracking && (
                                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-muted/5 text-muted-foreground">
                                          {tracking}
                                        </span>
                                      )}
                                      {cvUrl && (
                                        <a
                                          href={cvUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary font-black flex items-center gap-1"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Download className="size-3" /> CV
                                        </a>
                                      )}
                                    </div>

                                    {/* Quick strengths / keywords */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {(
                                        (app.screening_result
                                          ?.key_strengths as string[]) ||
                                        app.evaluation?.matched_keywords ||
                                        []
                                      )
                                        .slice(0, 3)
                                        .map((s, idx) => (
                                          <span
                                            key={`${s}-${idx}`}
                                            className="px-2 py-0.5 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] sm:text-xs font-black"
                                          >
                                            {s}
                                          </span>
                                        ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-between xl:justify-end">
                                  {/* AI Insights & Score */}
                                  <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="flex flex-col items-center">
                                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        Score
                                      </span>
                                      <span
                                        className={`text-lg sm:text-xl font-black ${
                                          scoreValue >= 80
                                            ? "text-emerald-600"
                                            : scoreValue >= 60
                                              ? "text-teal-600"
                                              : scoreValue >= 40
                                                ? "text-amber-600"
                                                : "text-red-500"
                                        }`}
                                      >
                                        {scoreValue.toFixed(0)}%
                                      </span>
                                    </div>

                                    {app.screening_result && (
                                      <div
                                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border flex items-center gap-1.5 ${
                                          app.screening_result.hard_criteria_met
                                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
                                            : "bg-red-500/5 border-red-500/20 text-red-600"
                                        }`}
                                      >
                                        {app.screening_result
                                          .hard_criteria_met ? (
                                          <CheckCircle2 size={12} />
                                        ) : (
                                          <AlertTriangle size={12} />
                                        )}
                                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                                          {app.screening_result
                                            .hard_criteria_met
                                            ? "Qualified"
                                            : "Failed Req"}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleBrainClick(app);
                                        }}
                                        className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                                        title="Quick AI View"
                                      >
                                        <BrainCircuit
                                          size={16}
                                          className="sm:size-[18px]"
                                        />
                                      </button>
                                      <Link
                                        href={`/recruitment/applications/${app.application_id}`}
                                        target="_blank"
                                        className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                                        title="View Full Profile"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ExternalLink
                                          size={16}
                                          className="sm:size-[18px]"
                                        />
                                      </Link>
                                    </div>
                                  </div>

                                  {/* Actions Trigger */}
                                  <div className="flex items-center gap-2 w-full sm:w-auto">
                                    {canPerformRecruitment && (
                                      <>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleShortlist(
                                              app.application_id,
                                            );
                                          }}
                                          disabled={
                                            app.status === "shortlisted" ||
                                            (app as any).is_shortlisted
                                          }
                                          className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                            (app as any).is_shortlisted ||
                                            app.status === "shortlisted"
                                              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                                              : !app.screening_result
                                                ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                                                : "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                                          }`}
                                        >
                                          <Star
                                            size={12}
                                            fill={
                                              (app as any).is_shortlisted ||
                                              app.status === "shortlisted"
                                                ? "currentColor"
                                                : "none"
                                            }
                                          />
                                          <span className="truncate">
                                            {(app as any).is_shortlisted ||
                                            app.status === "shortlisted"
                                              ? "Shortlisted"
                                              : !app.screening_result
                                                ? "Shortlist (No AI)"
                                                : "Shortlist"}
                                          </span>
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRetryExtraction(
                                              app.application_id,
                                            );
                                          }}
                                          disabled={retryingApps.includes(
                                            app.application_id,
                                          )}
                                          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-muted/10 text-muted-foreground text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-muted/20 transition-all flex items-center gap-2"
                                        >
                                          {retryingApps.includes(
                                            app.application_id,
                                          ) ? (
                                            <Loader2
                                              size={12}
                                              className="animate-spin"
                                            />
                                          ) : (
                                            <RotateCcw size={12} />
                                          )}
                                          Retry
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedApp && (
          <EvaluationDetailsModal
            application={selectedApp}
            onClose={() => setSelectedApp(null)}
          />
        )}
      </AnimatePresence>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} />
              Re-evaluate Applicants?
            </DialogTitle>
            <DialogDescription className="py-2">
              Some applicants already have screening results. Starting a new
              batch screen will re-evaluate them and overwrite existing scores.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">
                Affected Applicants
              </p>
              <p className="text-xl font-black text-foreground">
                {apps.filter((app) => app.screening_result).length} /{" "}
                {apps.length}
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 italic">
              Tip: AI Screening can take a few minutes depending on the pool
              size.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleBatchEvaluate()}
              className="rounded-xl font-bold bg-primary text-white hover:bg-primary/90"
            >
              Confirm & Start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showShortlistDialog} onOpenChange={setShowShortlistDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuit className="text-amber-500" size={20} />
              AI Review Pending
            </DialogTitle>
            <DialogDescription className="py-2 font-medium">
              This candidate has not been reviewed by AI yet. How would you like
              to proceed?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs text-amber-700 leading-relaxed">
              <strong>Shortlisting without AI review</strong> will add the
              candidate to the priority queue immediately but without AI scores
              or rankings.
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowShortlistDialog(false)}
              className="rounded-xl font-bold flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                shortlistAppId && handleToggleShortlist(shortlistAppId, true)
              }
              className="rounded-xl font-bold flex-1 border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              Shortlist Anyway
            </Button>
            <Button
              onClick={handleShortlistWithAi}
              className="rounded-xl font-bold flex-1 bg-primary text-white"
            >
              Run AI Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
