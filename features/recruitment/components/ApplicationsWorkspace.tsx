"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CalendarCheck,
  Download,
  ExternalLink,
  Filter,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  Star,
  Users,
  Wand2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { canManageRecruitment } from "@/lib/permissions";
import {
  fetchApplication,
  fetchApplications,
  fetchJobPositions,
  exportApplicationsCsv,
  retryExtraction,
  startScreening,
  toggleShortlist,
} from "@/services/recruitmentService";
import { getMediaUrl } from "@/services/apiClient";
import type { Application, JobPosition } from "@/types/recruitment";
import { useToast } from "@/components/ui/toast";
import { EvaluationDetailsModal } from "./EvaluationDetailsModal";

interface PaginationState {
  count: number;
  next: string | null;
  previous: string | null;
}

type LegacyApplication = Application & {
  applicant_name?: string;
  tracking_code?: string;
};

const scoreClassMap = [
  { min: 80, className: "text-emerald-600" },
  { min: 60, className: "text-teal-600" },
  { min: 40, className: "text-amber-600" },
];

function formatDate(value?: string) {
  if (!value) return "Unknown date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown date";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getScoreClass(score: number) {
  return scoreClassMap.find((entry) => score >= entry.min)?.className ?? "text-red-500";
}

function getApplicantName(app: Application) {
  const legacyApp = app as LegacyApplication;
  return (
    app.full_name ||
    app.applicant?.full_name ||
    legacyApp.applicant_name ||
    "Unknown Applicant"
  );
}

function getApplicantContact(app: Application) {
  return {
    email: app.email || app.applicant?.email || "",
    phone: app.phone || app.applicant?.phone || "",
  };
}

function getTrackingCode(app: Application) {
  const legacyApp = app as LegacyApplication;
  const applicant = app.applicant as (NonNullable<Application["applicant"]> & {
    tracking_code?: string;
  }) | undefined;

  return legacyApp.tracking_code || applicant?.tracking_code || "";
}

function getCvUrl(app: Application) {
  const applicantCv = app.applicant?.cv_path || "";
  const topLevelCv = app.cv_path || "";
  const rawCv = applicantCv || topLevelCv;
  return rawCv ? getMediaUrl(rawCv) : "";
}

function compactText(value: string, fallback = "Not available") {
  return value?.trim() || fallback;
}

export function ApplicationsWorkspace() {
  const [apps, setApps] = useState<Application[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    count: 0,
    next: null,
    previous: null,
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [appliedToday, setAppliedToday] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [startsWith, setStartsWith] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isExporting, setIsExporting] = useState(false);
  const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);
  const [retryingApps, setRetryingApps] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showShortlistDialog, setShowShortlistDialog] = useState(false);
  const [shortlistAppId, setShortlistAppId] = useState<number | null>(null);

  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const canRecruit = canManageRecruitment(user);
  const hasActiveFilters =
    search || status || minScore > 0 || appliedToday || selectedJobId || startsWith;

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
        response.results.map((app) => ({
          ...app,
          full_name:
            app.full_name ||
            app.applicant?.full_name ||
            app.applicant_name ||
            "Unknown Applicant",
        })),
      );
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
      });
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  }, [appliedToday, minScore, page, search, selectedJobId, sortBy, startsWith, status]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadApplications();
    }, search ? 300 : 0);

    return () => window.clearTimeout(timer);
  }, [loadApplications, page, search, status, minScore, appliedToday, selectedJobId, startsWith, sortBy]);

  useEffect(() => {
    const loadPositions = async () => {
      try {
        const response = await fetchJobPositions();
        setJobPositions(response.results);
      } catch (err) {
        console.error("Failed to load job positions:", err);
      }
    };

    loadPositions();
  }, []);

  const groupedApplications = useMemo(() => {
    return apps.reduce((acc, app) => {
      const title = app.position?.title || "Other Positions";
      if (!acc[title]) acc[title] = [];
      acc[title].push(app);
      return acc;
    }, {} as Record<string, Application[]>);
  }, [apps]);

  const groupEntries = useMemo(() => Object.entries(groupedApplications), [groupedApplications]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportApplicationsCsv();
      toast("Applications exported successfully", "success");
    } catch (error: unknown) {
      toast(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleBatchEvaluate = async () => {
    if (!selectedJobId) {
      toast("Select a specific job position before starting screening.", "warning");
      return;
    }

    const alreadyEvaluatedCount = apps.filter((app) => app.screening_result).length;
    if (alreadyEvaluatedCount > 0 && !showConfirmModal) {
      setShowConfirmModal(true);
      return;
    }

    setShowConfirmModal(false);
    setIsBatchEvaluating(true);

    try {
      await startScreening(Number(selectedJobId));
      toast("Screening started. Redirecting to progress view.", "success");
      router.push(`/recruitment/job-postings/${selectedJobId}/screening`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("405") || message.includes("404")) {
        toast("Screening endpoint not available on this backend.", "warning");
      } else {
        toast("Failed to start screening. The AI service may be offline.", "error");
      }
    } finally {
      setIsBatchEvaluating(false);
    }
  };

  const handleOpenCandidate = async (app: Application) => {
    if (app.screening_result) {
      try {
        const details = await fetchApplication(app.application_id, {
          includeHistory: true,
          includeDeleted: true,
        });
        setSelectedApp(details);
      } catch {
        setSelectedApp(app);
      }
      return;
    }

    const positionId = app.position?.position_id;
    if (!positionId) {
      toast("Could not determine job position for this application.", "error");
      return;
    }

    setIsBatchEvaluating(true);
    try {
      await startScreening(Number(positionId));
      toast("Screening started. Redirecting to progress view.", "success");
      router.push(`/recruitment/job-postings/${positionId}/screening`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("405") || message.includes("404")) {
        toast("Screening endpoint not available on this backend.", "warning");
      } else {
        toast("Failed to start screening. The AI service may be offline.", "error");
      }
    } finally {
      setIsBatchEvaluating(false);
    }
  };

  const handleToggleShortlist = async (appId: number, skipAiCheck = false) => {
    const app = apps.find((entry) => entry.application_id === appId);
    if (!app) return;

    if (!app.screening_result && !app.is_shortlisted && !skipAiCheck) {
      setShortlistAppId(appId);
      setShowShortlistDialog(true);
      return;
    }

    try {
      const response = await toggleShortlist(appId);
      setApps((prev) =>
        prev.map((entry) =>
          entry.application_id === appId
            ? {
                ...entry,
                is_shortlisted: response.shortlisted,
                status: String(response.status),
              }
            : entry,
        ),
      );
      toast(response.shortlisted ? "Added to shortlist" : "Removed from shortlist", "success");
      setShowShortlistDialog(false);
    } catch (error: unknown) {
      toast(
        `Action failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleShortlistWithAi = async () => {
    if (!shortlistAppId) return;
    const app = apps.find((entry) => entry.application_id === shortlistAppId);
    if (!app?.position?.position_id) return;

    try {
      await startScreening(Number(app.position.position_id));
      toast("Screening started. Redirecting to progress view.", "success");
      router.push(`/recruitment/job-postings/${app.position.position_id}/screening`);
    } catch (error: unknown) {
      toast(
        `Failed to start screening: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleRetryExtraction = async (appId: number) => {
    setRetryingApps((prev) => [...prev, appId]);
    try {
      await retryExtraction(appId);
      toast("Re-extraction triggered successfully.", "success");
      loadApplications();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("405") || message.includes("404")) {
        toast("Re-extraction endpoint not available on this backend.", "warning");
      } else {
        toast("Failed to retry extraction. The AI service may be offline.", "error");
      }
    } finally {
      setRetryingApps((prev) => prev.filter((entry) => entry !== appId));
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setMinScore(0);
    setAppliedToday(false);
    setSelectedJobId("");
    setStartsWith("");
    setSortBy("newest");
    setPage(1);
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="size-14 animate-spin rounded-full border-4 border-primary/10 border-t-primary/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BrainCircuit className="size-5 animate-pulse text-primary/50" />
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
          Loading applications workspace
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/50 bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                Total applications
              </p>
              <p className="mt-1 text-2xl font-black tracking-tight">
                {pagination.count}
              </p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Users className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="border-border/50 bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                Pending review
              </p>
              <p className="mt-1 text-2xl font-black tracking-tight">
                {apps.filter((app) => !app.screening_result).length}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600">
              <Sparkles className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="border-border/50 bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                Shortlisted
              </p>
              <p className="mt-1 text-2xl font-black tracking-tight">
                {apps.filter((app) => app.is_shortlisted).length}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
              <Star className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="border-border/50 bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                Reviewed today
              </p>
              <p className="mt-1 text-2xl font-black tracking-tight">
                {apps.filter((app) => app.screening_result).length}
              </p>
            </div>
            <div className="rounded-2xl bg-teal-500/10 p-3 text-teal-600">
              <BrainCircuit className="size-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button
          onClick={() => setShowFilters((value) => !value)}
          className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-background px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-foreground shadow-sm"
        >
          <Filter className="size-4" />
          {showFilters ? "Hide filters" : "Show filters"}
        </button>
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-muted-foreground"
        >
          Reset
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={`space-y-4 ${showFilters ? "block" : "hidden lg:block"}`}>
          <Card className="sticky top-6 space-y-4 border-border/50 bg-background p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                <Filter className="size-3.5" />
                Filters
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[10px] font-black uppercase tracking-[0.24em] text-primary"
                >
                  Reset all
                </button>
              )}
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                className="h-11 rounded-xl border-border/50 pl-10 shadow-sm"
              />
            </div>

            {canRecruit && (
              <Button
                onClick={handleBatchEvaluate}
                disabled={isBatchEvaluating}
                className="h-11 w-full rounded-xl bg-primary text-xs font-black uppercase tracking-[0.24em] text-white shadow-sm"
              >
                {isBatchEvaluating ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                {isBatchEvaluating ? "Starting..." : "Screen all applicants"}
              </Button>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                Hiring status
              </label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-11 w-full rounded-xl border border-border/50 bg-background px-3 text-sm shadow-sm outline-none transition focus:border-primary"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="confirmed">Confirmed</option>
                <option value="interview_invited">Interview invited</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                Job position
              </label>
              <select
                value={selectedJobId}
                onChange={(event) => setSelectedJobId(event.target.value)}
                className="h-11 w-full rounded-xl border border-border/50 bg-background px-3 text-sm shadow-sm outline-none transition focus:border-primary"
              >
                <option value="">All job posts</option>
                {jobPositions.map((job) => (
                  <option key={job.position_id} value={job.position_id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                Sort candidates
              </label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-11 w-full rounded-xl border border-border/50 bg-background px-3 text-sm shadow-sm outline-none transition focus:border-primary"
              >
                <option value="newest">Newest first</option>
                <option value="score_desc">Highest match</option>
                <option value="score_asc">Lowest match</option>
                <option value="rank_asc">AI rank</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                  Min score
                </label>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                  {minScore}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minScore}
                onChange={(event) => setMinScore(Number(event.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <button
              onClick={() => setAppliedToday((value) => !value)}
              className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-left text-xs font-bold transition ${
                appliedToday
                  ? "border-primary/20 bg-primary text-primary-foreground shadow-sm"
                  : "border-border/50 bg-background text-muted-foreground shadow-sm"
              }`}
            >
              <span className="flex items-center gap-2">
                <CalendarCheck className="size-4" />
                Show applied today
              </span>
              {appliedToday ? <span>On</span> : <span>Off</span>}
            </button>

            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
              className="h-11 w-full rounded-xl border-border/50 text-xs font-black uppercase tracking-[0.24em]"
            >
              {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </Card>
        </aside>

        <main className="space-y-4">
          <div className="flex flex-col gap-3 rounded-3xl border border-border/50 bg-background p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                Applications overview
              </p>
              <h2 className="mt-1 text-lg font-black tracking-tight sm:text-xl">
                {pagination.count} total candidates
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-muted/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                {groupEntries.length} job groups
              </span>
              <span className="rounded-full bg-muted/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                {apps.filter((app) => app.screening_result).length} reviewed
              </span>
              {canRecruit && (
                <Button
                  onClick={handleBatchEvaluate}
                  disabled={!selectedJobId || isBatchEvaluating}
                  className="h-10 rounded-full bg-primary px-4 text-[10px] font-black uppercase tracking-[0.22em] text-white"
                >
                  {isBatchEvaluating ? <Loader2 className="size-4 animate-spin" /> : <BrainCircuit className="size-4" />}
                  {isBatchEvaluating ? "Starting" : "Batch screen"}
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-3xl border border-border/40 bg-muted/30"
                />
              ))}
            </div>
          ) : error ? (
            <Card className="flex flex-col items-center justify-center gap-4 border-dashed border-red-500/20 bg-red-500/5 px-6 py-14 text-center">
              <AlertCircle className="size-12 text-red-500" />
              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tight text-red-600">Sync error</h3>
                <p className="max-w-md text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={loadApplications} className="rounded-xl bg-primary text-white">
                <RefreshCw className="size-4" />
                Try refreshing
              </Button>
            </Card>
          ) : apps.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-4 border-dashed border-border/50 bg-background px-6 py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Inbox className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tight">No matching candidates</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Broaden your filters or reset them to view more applicants.
                </p>
              </div>
              <Button onClick={resetFilters} variant="outline" className="rounded-xl">
                Reset filters
              </Button>
            </Card>
          ) : (
            <div className="space-y-5">
              {groupEntries.map(([jobTitle, jobApps]) => {
                const jobSkills = (jobApps[0]?.position?.required_skills || []).slice(0, 6);

                return (
                  <section key={jobTitle} className="space-y-3 rounded-3xl border border-border/50 bg-muted/10 p-4 shadow-sm">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-lg font-black tracking-tight sm:text-xl">{jobTitle}</h3>
                          <span className="rounded-full bg-background px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                            {jobApps.length} apps
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Scan compact summaries, then open a profile or screening detail only when needed.
                        </p>
                      </div>
                      {jobSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {jobSkills.map((skill: string) => (
                            <span
                              key={skill}
                              className="rounded-full border border-border/50 bg-background px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3">
                      {jobApps.map((app) => {
                        const applicantName = getApplicantName(app);
                        const { email, phone } = getApplicantContact(app);
                        const submittedAt = app.submitted_at || app.applicant?.submitted_at;
                        const trackingCode = getTrackingCode(app);
                        const cvUrl = getCvUrl(app);
                        const scoreValue = Number(
                          app.screening_result?.final_score ||
                            app.screening_result?.overall_score ||
                            app.evaluation?.matching_percentage ||
                            (app.evaluation?.ai_rank ? app.evaluation.ai_rank * 100 : 0) ||
                            0,
                        );
                        const strengths = app.screening_result?.key_strengths || app.evaluation?.matched_keywords || [];
                        const weaknesses = app.screening_result?.key_weaknesses || [];
                        const shortlisted = Boolean(app.is_shortlisted || app.status === "shortlisted");

                        return (
                          <motion.article
                            key={app.application_id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group cursor-pointer"
                            onClick={() => handleOpenCandidate(app)}
                          >
                            <div className="rounded-2xl border border-border/50 bg-background p-4 shadow-sm transition hover:border-primary/20 hover:shadow-md">
                              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_auto] xl:items-center">
                                <div className="flex min-w-0 items-start gap-3">
                                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-black text-primary">
                                    {applicantName.charAt(0) || "U"}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                      <Link
                                        href={`/recruitment/applications/${app.application_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(event) => event.stopPropagation()}
                                        className="min-w-0"
                                      >
                                        <h4 className="truncate text-base font-black tracking-tight transition group-hover:text-primary sm:text-lg">
                                          {applicantName}
                                        </h4>
                                      </Link>
                                      {shortlisted && (
                                        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
                                          Shortlisted
                                        </span>
                                      )}
                                      {app.screening_result ? (
                                        <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${app.screening_result.hard_criteria_met ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
                                          {app.screening_result.hard_criteria_met ? "Qualified" : "Needs review"}
                                        </span>
                                      ) : (
                                        <span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
                                          Awaiting AI
                                        </span>
                                      )}
                                    </div>

                                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                      {email && <span className="truncate">{email}</span>}
                                      {phone && <span className="truncate">{phone}</span>}
                                      <span>{formatDate(submittedAt)}</span>
                                      {trackingCode && (
                                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                          {trackingCode}
                                        </span>
                                      )}
                                      {cvUrl && (
                                        <a
                                          href={cvUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(event) => event.stopPropagation()}
                                          className="inline-flex items-center gap-1 text-primary"
                                        >
                                          <Download className="size-3.5" />
                                          CV
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="min-w-0 space-y-3">
                                  {app.screening_result ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                                          AI summary
                                        </span>
                                        <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                          {app.screening_result.evaluation_version ? `v${app.screening_result.evaluation_version}` : "latest"}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {strengths.slice(0, 2).map((strength: string, index: number) => (
                                          <span
                                            key={`${strength}-${index}`}
                                            className="max-w-full truncate rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700"
                                          >
                                            {strength}
                                          </span>
                                        ))}
                                        {weaknesses.slice(0, 1).map((weakness: string, index: number) => (
                                          <span
                                            key={`${weakness}-${index}`}
                                            className="max-w-full truncate rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-700"
                                          >
                                            {weakness}
                                          </span>
                                        ))}
                                        {strengths.length === 0 && weaknesses.length === 0 && (
                                          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                            No summary available
                                          </span>
                                        )}
                                      </div>
                                      <p
                                        className="max-w-2xl text-xs leading-5 text-muted-foreground"
                                        style={{
                                          display: "-webkit-box",
                                          WebkitBoxOrient: "vertical",
                                          WebkitLineClamp: 2,
                                          overflow: "hidden",
                                        }}
                                      >
                                        {compactText(app.screening_result.explanation, "AI summary not available")}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 px-3 py-3 text-xs text-muted-foreground">
                                      This applicant has not been screened yet. Keep the row compact and start review only when needed.
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col gap-3 xl:items-end">
                                  <div className="flex items-center gap-3 xl:justify-end">
                                    <div className="text-right">
                                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                                        Score
                                      </p>
                                      <p className={`text-2xl font-black tracking-tight ${getScoreClass(scoreValue)}`}>
                                        {scoreValue > 0 ? `${Math.round(scoreValue)}%` : "--"}
                                      </p>
                                    </div>
                                    {app.screening_result && (
                                      <div className="rounded-2xl border border-border/50 bg-muted/30 px-3 py-2 text-right">
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                                          Hard criteria
                                        </p>
                                        <p className={`text-xs font-black ${app.screening_result.hard_criteria_met ? "text-emerald-600" : "text-red-600"}`}>
                                          {app.screening_result.hard_criteria_met ? "Passed" : "Failed"}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                                    <button
                                      onClick={() => handleOpenCandidate(app)}
                                      className="inline-flex size-10 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground transition hover:border-primary/20 hover:text-primary"
                                      title="Open screening details"
                                    >
                                      <BrainCircuit className="size-4" />
                                    </button>
                                    <Link
                                      href={`/recruitment/applications/${app.application_id}`}
                                      target="_blank"
                                      className="inline-flex size-10 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground transition hover:border-primary/20 hover:text-primary"
                                      title="Open profile"
                                    >
                                      <ExternalLink className="size-4" />
                                    </Link>
                                    {canRecruit && (
                                      <>
                                        <button
                                          onClick={() => handleToggleShortlist(app.application_id)}
                                          disabled={shortlisted}
                                          className={`inline-flex h-10 items-center gap-2 rounded-xl px-3 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                                            shortlisted
                                              ? "cursor-not-allowed bg-muted text-muted-foreground"
                                              : app.screening_result
                                                ? "bg-amber-500 text-white hover:bg-amber-600"
                                                : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
                                          }`}
                                        >
                                          <Star className="size-4" />
                                          {shortlisted ? "Shortlisted" : "Shortlist"}
                                        </button>
                                        <button
                                          onClick={() => handleRetryExtraction(app.application_id)}
                                          disabled={retryingApps.includes(app.application_id)}
                                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground transition hover:bg-muted/50"
                                        >
                                          {retryingApps.includes(app.application_id) ? (
                                            <Loader2 className="size-4 animate-spin" />
                                          ) : (
                                            <RefreshCw className="size-4" />
                                          )}
                                          Retry
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              <div className="flex flex-col gap-3 rounded-3xl border border-border/50 bg-background p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-muted-foreground">
                  Showing <span className="font-black text-foreground">{apps.length}</span> of <span className="font-black text-foreground">{pagination.count}</span> applicants
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={!pagination.previous || page <= 1}
                    className="h-10 rounded-xl border-border/50 px-3"
                  >
                    <ArrowLeft className="size-4" />
                    Previous
                  </Button>
                  <span className="rounded-xl bg-muted/40 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
                    Page {page}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((value) => value + 1)}
                    disabled={!pagination.next}
                    className="h-10 rounded-xl border-border/50 px-3"
                  >
                    Next
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
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
              Re-evaluate applicants?
            </DialogTitle>
            <DialogDescription className="py-2">
              Some applicants already have screening results. Starting a new batch screen will overwrite those scores.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-border/50 bg-muted/30 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Affected applicants</p>
            <p className="mt-2 text-2xl font-black">{apps.filter((app) => app.screening_result).length} / {apps.length}</p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="rounded-xl font-bold">
              Cancel
            </Button>
            <Button onClick={() => handleBatchEvaluate()} className="rounded-xl bg-primary font-bold text-white">
              Confirm & start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showShortlistDialog} onOpenChange={setShowShortlistDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuit className="text-amber-500" size={20} />
              AI review pending
            </DialogTitle>
            <DialogDescription className="py-2 font-medium">
              This candidate has not been reviewed by AI yet. How would you like to proceed?
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-4 text-xs leading-relaxed text-amber-700">
            Shortlisting without AI review adds the candidate to the priority queue immediately, but without AI scores or rankings.
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button variant="ghost" onClick={() => setShowShortlistDialog(false)} className="flex-1 rounded-xl font-bold">
              Cancel
            </Button>
            <Button variant="outline" onClick={() => shortlistAppId && handleToggleShortlist(shortlistAppId, true)} className="flex-1 rounded-xl border-amber-200 font-bold text-amber-700 hover:bg-amber-50">
              Shortlist anyway
            </Button>
            <Button onClick={handleShortlistWithAi} className="flex-1 rounded-xl bg-primary font-bold text-white">
              Run AI review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
