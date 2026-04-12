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
} from "lucide-react";
import {
  fetchApplications,
  exportApplicationsCsv,
  confirmApplication,
  inviteToInterview,
  hireApplicant,
  retryExtraction,
  fetchJobPositions,
  startScreening,
} from "@/services/recruitmentService";
import type { Application, JobPosition } from "@/types/recruitment";
import { useAuth } from "@/hooks/useAuth";
import { ApplicationFilters } from "./ApplicationFilters";
import { ApplicationMetrics } from "./ApplicationMetrics";
import { EvaluationDetailsModal } from "./EvaluationDetailsModal";
import { useToast } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import { getMediaUrl } from "@/services/apiClient";

interface ApplicationsListProps {
  jobPositions?: JobPosition[];
}

export function ApplicationsList({ jobPositions: initialJobPositions }: ApplicationsListProps) {
  const [apps, setApps] = useState<Application[]>([]);
  const [localJobPositions, setLocalJobPositions] = useState<JobPosition[]>(initialJobPositions || []);
  const [isLoading, setIsLoading] = useState(true);
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
  const router = useRouter();


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
      setApps(response.results);
    } catch (err: any) {
      setError(err.message || "Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, minScore, startsWith, appliedToday, selectedJobId, sortBy]);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        loadApplications();
      },
      search ? 300 : 0,
    );
    return () => clearTimeout(timer);
  }, [loadApplications, search]);

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
    if (selectedJobId) {
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
          toast("Failed to start screening. The AI service may be offline.", "error");
        }
      } finally {
        setIsBatchEvaluating(false);
      }
    } else {
      toast("Please select a specific job position first to run AI screening.", "warning");
    }
  };

  const handleBrainClick = async (app: Application) => {
    if (app.screening_result) {
      setSelectedApp(app);
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
        toast("Failed to start screening. The AI service may be offline.", "error");
      }
    } finally {
      setIsBatchEvaluating(false);
    }
  };


  const handleRetryExtraction = async (appId: number) => {
    setRetryingApps(prev => [...prev, appId]);
    try {
      await retryExtraction(appId);
      toast("Re-extraction triggered successfully.", "success");
      loadApplications();
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("405") || msg.includes("404")) {
        toast("Re-extraction endpoint not available on this backend.", "warning");
      } else {
        toast("Failed to retry extraction. The AI service may be offline.", "error");
      }
    } finally {
      setRetryingApps(prev => prev.filter(id => id !== appId));
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

  const canEdit = user?.role === "HR_MANAGER" || user?.role === "HR_CEO";
  const canShortlist = user?.role === "HR_MANAGER";
  const canCEOActions = user?.role === "HR_CEO";

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

  return (
    <div className="space-y-8 pb-20">
      <ApplicationMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Column */}
        <aside className="lg:col-span-1 space-y-8">
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
            canBatchEvaluate={canShortlist}
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
                onClick={() => { setStartsWith(""); setPage(1); }}
                className={`col-span-2 py-1 rounded-md text-[10px] font-bold transition-all ${!startsWith ? "bg-primary text-white shadow-sm" : "bg-background border border-border/50 text-muted-foreground hover:bg-muted"}`}
              >
                ALL
              </button>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => { setStartsWith(letter); setPage(1); }}
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
                <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-[2rem] border border-border/30" />
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center py-20 bg-red-500/5 rounded-[3rem] border border-dashed border-red-500/20">
              <AlertCircle className="size-12 text-red-500 mb-4 animate-bounce" />
              <h3 className="text-xl font-black uppercase tracking-tight text-red-600">Sync Error</h3>
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
              <h3 className="text-2xl font-black uppercase tracking-widest">No matching candidates</h3>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto mb-8">
                We couldn't find any applicants matching your current filter set. Try broadening your search or resetting the filters.
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
                  Showing {apps.length} Candidate{apps.length !== 1 ? 's' : ''}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBatchEvaluate}
                    disabled={!selectedJobId}
                    className={`px-3 py-2 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 ${selectedJobId ? 'bg-primary text-white hover:shadow-xl' : 'bg-muted/10 text-muted-foreground cursor-not-allowed'}`}
                  >
                    {isBatchEvaluating ? <Loader2 className="size-4 animate-spin" /> : <BrainCircuit className="size-4" />}
                    {isBatchEvaluating ? 'Starting...' : 'Batch Screen'}
                  </button>
                </div>
              </div>

              {Object.entries(jobGroups).map(([jobTitle, jobApps]) => (
                <div key={jobTitle} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-black tracking-tight">{jobTitle}</span>
                    <div className="h-px flex-1 bg-border/40" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                      {jobApps.length} APPS
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {jobApps.map((app) => (
                      <motion.div
                        key={app.application_id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative"
                      >
                        <div className="p-6 rounded-[2rem] bg-background border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                            {/* Candidate Info */}
                            <div className="flex items-center gap-4 flex-1">
                              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                                {app.full_name?.charAt(0) || "U"}
                              </div>
                              <div>
                                <Link
                                  href={`/recruitment/applications/${app.application_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <h4 className="font-black text-lg group-hover:text-primary transition-colors cursor-pointer">
                                    {app.full_name}
                                  </h4>
                                </Link>

                                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                  <span>{app.email}</span>
                                  <span className="opacity-30">•</span>
                                  <span>{new Date(app.submitted_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>

                            {/* AI Insights & Score */}
                            <div className="flex items-center gap-6">
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Score</span>
                                <span className={`text-xl font-black ${(app.screening_result?.overall_score || 0) >= 80 ? 'text-emerald-600' :
                                  (app.screening_result?.overall_score || 0) >= 60 ? 'text-teal-600' :
                                    (app.screening_result?.overall_score || 0) >= 40 ? 'text-amber-600' : 'text-red-500'
                                  }`}>
                                  {Number(app.screening_result?.overall_score || app.evaluation?.matching_percentage || 0).toFixed(0)}%

                                </span>
                              </div>

                              {app.screening_result && (
                                <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${app.screening_result.hard_criteria_met
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
                                  : "bg-red-500/5 border-red-500/20 text-red-600"
                                  }`}>
                                  {app.screening_result.hard_criteria_met ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                  <span className="text-[10px] font-black uppercase tracking-widest">
                                    {app.screening_result.hard_criteria_met ? "Qualified" : "Failed Req"}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleBrainClick(app)}
                                  className="p-3 rounded-2xl bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                                  title="Quick AI View"
                                >
                                  <BrainCircuit size={18} />
                                </button>
                                <Link
                                  href={`/recruitment/applications/${app.application_id}`}
                                  target="_blank"
                                  className="p-3 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                                  title="View Full Profile"
                                >
                                  <ExternalLink size={18} />
                                </Link>
                              </div>
                            </div>

                            {/* Actions Trigger */}
                            <div className="flex items-center gap-2">
                              {canShortlist && (
                                <button
                                  onClick={() => handleRetryExtraction(app.application_id)}
                                  disabled={retryingApps.includes(app.application_id)}
                                  className="px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-700 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center gap-2"
                                >
                                  {retryingApps.includes(app.application_id) ? <Loader2 size={12} animate-spin /> : <RotateCcw size={12} />}
                                  Re-try
                                </button>
                              )}
                              <div className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                                {getStatusIcon(app.status)} {app.status.replace("_", " ")}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
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
    </div>
  );
}

