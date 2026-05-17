"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  Filter,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Square,
  Users,
  Wand2,
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
  exportApplicationsCsv,
  fetchApplication,
  fetchApplications,
  fetchJobPositions,
  getScreeningProgress,
  retryExtraction,
  startScreening,
  toggleShortlist,
} from "@/services/recruitmentService";
import { getMediaUrl } from "@/services/apiClient";
import type { Application, JobPosition, ScreeningProgress } from "@/types/recruitment";
import { useToast } from "@/components/ui/toast";
import { EvaluationDetailsModal } from "./EvaluationDetailsModal";

interface LegacyApplication extends Application {
  applicant_name?: string;
  tracking_code?: string;
}

interface JobStateLogEntry extends ScreeningProgress {
  timestamp: string;
}

interface JobUiState {
  collapsed: boolean;
  page: number;
  selectedIds: number[];
  screeningJobId?: number;
  progress?: ScreeningProgress;
  logs: JobStateLogEntry[];
  lastUpdated?: string;
}

type JobStateMap = Record<string, JobUiState>;

type JobGroup = {
  key: string;
  title: string;
  positionId: number;
  requiredSkills: string[];
  applications: Application[];
};

const STORAGE_KEY = "hrms.recruitment.applications.board.v1";
const JOB_PAGE_SIZE = 5;
const JOB_PREVIEW_SIZE = 3;
const MAX_PROGRESS_LOGS = 5;

const scoreClasses = [
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
  return scoreClasses.find((entry) => score >= entry.min)?.className ?? "text-red-500";
}

function getApplicantName(app: Application) {
  const legacy = app as LegacyApplication;
  return (
    app.full_name ||
    app.applicant?.full_name ||
    legacy.applicant_name ||
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
  const legacy = app as LegacyApplication;
  const applicant = app.applicant as (NonNullable<Application["applicant"]> & {
    tracking_code?: string;
  }) | undefined;

  return legacy.tracking_code || applicant?.tracking_code || "";
}

function getCvUrl(app: Application) {
  const rawPath = app.applicant?.cv_path || app.cv_path || "";
  return rawPath ? getMediaUrl(rawPath) : "";
}

function compactText(value: string, fallback = "Not available") {
  return value?.trim() || fallback;
}

function safeParseState(raw: string | null): JobStateMap {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as JobStateMap;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function makeDefaultJobState(isCollapsed: boolean): JobUiState {
  return {
    collapsed: isCollapsed,
    page: 1,
    selectedIds: [],
    logs: [],
  };
}

function mergeUniqueIds(existing: number[], nextIds: number[]) {
  return Array.from(new Set([...existing, ...nextIds]));
}

function formatProgressLabel(progress?: ScreeningProgress) {
  if (!progress) return "Idle";
  return `${progress.progress_percent}% · ${progress.current}/${progress.total}`;
}

export function ApplicationsBoard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isBatchEvaluating, setIsBatchEvaluating] = useState(false);
  const [retryingApps, setRetryingApps] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showShortlistDialog, setShowShortlistDialog] = useState(false);
  const [shortlistAppId, setShortlistAppId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [appliedToday, setAppliedToday] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [startsWith, setStartsWith] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [totalCount, setTotalCount] = useState(0);
  const [jobStateMap, setJobStateMap] = useState<JobStateMap>({});

  const pollingTimersRef = useRef<Record<string, number>>({});
  const saveTimerRef = useRef<number | null>(null);
  const loadApplicationsRef = useRef<() => Promise<void>>(async () => undefined);
  const { user } = useAuth();
  const { toast } = useToast();
  const canRecruit = canManageRecruitment(user);

  const hasActiveFilters = search || status || minScore > 0 || appliedToday || selectedJobId || startsWith;

  const persistJobState = useCallback((nextState: JobStateMap) => {
    if (typeof window === "undefined") return;
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }, 80);
  }, []);

  const updateJobState = useCallback(
    (jobKey: string, updater: (state: JobUiState) => JobUiState) => {
      setJobStateMap((previous) => {
        const current = previous[jobKey] ?? makeDefaultJobState(false);
        const next = updater(current);
        const nextState = { ...previous, [jobKey]: next };
        persistJobState(nextState);
        return nextState;
      });
    },
    [persistJobState],
  );

  const stopPolling = useCallback((jobKey: string) => {
    const timerId = pollingTimersRef.current[jobKey];
    if (timerId) {
      window.clearInterval(timerId);
      delete pollingTimersRef.current[jobKey];
    }
  }, []);

  const saveProgressSnapshot = useCallback(
    (jobKey: string, progress: ScreeningProgress) => {
      updateJobState(jobKey, (state) => {
        const snapshot: JobStateLogEntry = {
          ...progress,
          timestamp: new Date().toISOString(),
        };
        const dedupedLogs = state.logs.filter((entry) => {
          return (
            entry.status !== snapshot.status ||
            entry.progress_percent !== snapshot.progress_percent ||
            entry.current_applicant !== snapshot.current_applicant ||
            entry.current !== snapshot.current ||
            entry.total !== snapshot.total
          );
        });

        return {
          ...state,
          progress,
          screeningJobId: progress.job_id,
          logs: [...dedupedLogs, snapshot].slice(-MAX_PROGRESS_LOGS),
          lastUpdated: snapshot.timestamp,
        };
      });
    },
    [updateJobState],
  );

  const startPolling = useCallback(
    (jobKey: string, screeningJobId: number) => {
      if (pollingTimersRef.current[jobKey]) return;

      const poll = async () => {
        try {
          const progress = await getScreeningProgress(screeningJobId);
          saveProgressSnapshot(jobKey, progress);

          if (progress.status === "completed") {
            stopPolling(jobKey);
            toast(`${progress.total} applicants processed for this job.`, "success");
            void loadApplicationsRef.current();
            return;
          }

          if (progress.status === "failed" || progress.status === "error") {
            stopPolling(jobKey);
            toast(
              progress.error_message || progress.error || "Screening stopped with an error.",
              "error",
            );
          }
        } catch (pollError) {
          stopPolling(jobKey);
          toast("Could not reach screening progress endpoint.", "error");
          setJobStateMap((previous) => {
            const current = previous[jobKey] ?? makeDefaultJobState(false);
            const errorState: ScreeningProgress = {
              job_id: screeningJobId,
              status: "error",
              progress_percent: current.progress?.progress_percent ?? 0,
              current: current.progress?.current ?? 0,
              total: current.progress?.total ?? 0,
              current_applicant: current.progress?.current_applicant ?? null,
              error: pollError instanceof Error ? pollError.message : "Lost connection to AI service",
            };
            const nextState = {
              ...previous,
              [jobKey]: {
                ...current,
                progress: errorState,
                logs: [
                  ...current.logs,
                  {
                    ...errorState,
                    timestamp: new Date().toISOString(),
                  },
                ].slice(-MAX_PROGRESS_LOGS),
              },
            };
            persistJobState(nextState);
            return nextState;
          });
        }
      };

      void poll();
      pollingTimersRef.current[jobKey] = window.setInterval(poll, 2000);
    },
    [persistJobState, saveProgressSnapshot, stopPolling, toast],
  );

  const resumePollingFromStorage = useCallback(() => {
    Object.entries(jobStateMap).forEach(([jobKey, state]) => {
      const progress = state.progress;
      if (!state.screeningJobId || !progress) return;
      if (progress.status === "running" || progress.status === "pending") {
        startPolling(jobKey, state.screeningJobId);
      }
    });
  }, [jobStateMap, startPolling]);

  const loadJobPositions = useCallback(async () => {
    try {
      const collected: JobPosition[] = [];
      let page = 1;
      while (true) {
        const response = await fetchJobPositions({ page, page_size: 100 });
        collected.push(...response.results);
        if (!response.next) break;
        page += 1;
      }
      setJobPositions(collected);
    } catch (err) {
      console.error("Failed to load job positions", err);
    }
  }, []);

  const loadAllApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const orderingMap: Record<string, string> = {
        score_desc: "-screening_result__overall_score",
        score_asc: "screening_result__overall_score",
        rank_asc: "screening_result__overall_score",
        newest: "-submitted_at",
      };

      const filters: Record<string, string | number | boolean | undefined> = {
        search: search || undefined,
        status: status || undefined,
        min_score: minScore > 0 ? minScore : undefined,
        ordering: orderingMap[sortBy] || undefined,
        starts_with: startsWith || undefined,
        applied_today: appliedToday || undefined,
        position_id: selectedJobId || undefined,
      };

      const collected: Application[] = [];
      let page = 1;
      let responseCount = 0;

      while (true) {
        const response = await fetchApplications({ ...filters, page });
        responseCount = response.count;
        collected.push(
          ...response.results.map((app) => ({
            ...app,
            full_name:
              app.full_name ||
              app.applicant?.full_name ||
              (app as LegacyApplication).applicant_name ||
              "Unknown Applicant",
          })),
        );

        if (!response.next) break;
        page += 1;
      }

      setApplications(collected);
      setTotalCount(responseCount);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load applications");
    } finally {
      setIsLoading(false);
    }
  }, [appliedToday, minScore, search, selectedJobId, sortBy, startsWith, status]);

  useEffect(() => {
    loadApplicationsRef.current = loadAllApplications;
  }, [loadAllApplications]);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== "undefined") {
      const storedState = safeParseState(window.localStorage.getItem(STORAGE_KEY));
      if (Object.keys(storedState).length > 0) {
        setJobStateMap(storedState);
      }
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAllApplications();
    }, search ? 300 : 0);

    return () => window.clearTimeout(timer);
  }, [loadAllApplications, search]);

  useEffect(() => {
    void loadJobPositions();
  }, [loadJobPositions]);

  useEffect(() => {
    if (!isMounted) return;
    resumePollingFromStorage();
  }, [isMounted, resumePollingFromStorage]);

  useEffect(() => {
    return () => {
      Object.values(pollingTimersRef.current).forEach((timerId) => window.clearInterval(timerId));
      pollingTimersRef.current = {};
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setJobStateMap((previous) => {
      let changed = false;
      const next: JobStateMap = { ...previous };
      const validAppIdsByJob = new Map<string, Set<number>>();

      for (const app of applications) {
        const jobKey = String(app.position?.position_id || app.position?.title || "other");
        if (!validAppIdsByJob.has(jobKey)) {
          validAppIdsByJob.set(jobKey, new Set<number>());
        }
        validAppIdsByJob.get(jobKey)?.add(app.application_id);
      }

      for (const [jobKey, state] of Object.entries(previous)) {
        const validIds = validAppIdsByJob.get(jobKey);
        if (!validIds) continue;
        const filteredSelected = state.selectedIds.filter((id) => validIds.has(id));
        if (filteredSelected.length !== state.selectedIds.length) {
          next[jobKey] = { ...state, selectedIds: filteredSelected };
          changed = true;
        }
      }

      if (!changed) return previous;
      persistJobState(next);
      return next;
    });
  }, [applications, persistJobState]);

  const groupedJobs = useMemo(() => {
    const groups = applications.reduce((acc, app) => {
      const position = app.position;
      const key = String(position?.position_id || position?.title || "other");
      const title = position?.title || "Other Positions";
      const existing = acc[key];
      if (existing) {
        existing.applications.push(app);
      } else {
        acc[key] = {
          key,
          title,
          positionId: Number(position?.position_id || 0),
          requiredSkills: ((position as any)?.required_skills || []).slice(0, 6),
          applications: [app],
        };
      }
      return acc;
    }, {} as Record<string, JobGroup>);

    return Object.values(groups).sort((left, right) => left.title.localeCompare(right.title));
  }, [applications]);

  const activeScreenings = useMemo(() => {
    return Object.entries(jobStateMap)
      .filter(([_, state]) => state.progress && ["running", "pending"].includes(state.progress.status))
      .map(([jobKey, state]) => ({
        jobKey,
        jobTitle: groupedJobs.find((g) => g.key === jobKey)?.title || "Unknown Job",
        progress: state.progress!,
      }));
  }, [jobStateMap, groupedJobs]);

  const visibleJobs = useMemo(() => {
    if (!selectedJobId) return groupedJobs;
    return groupedJobs.filter((group) => String(group.positionId) === selectedJobId);
  }, [groupedJobs, selectedJobId]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportApplicationsCsv();
      toast("Applications exported successfully", "success");
    } catch (exportError) {
      toast(
        `Export failed: ${exportError instanceof Error ? exportError.message : "Unknown error"}`,
        "error",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const openApplicantDetails = async (app: Application) => {
    if (!app.screening_result) return;
    try {
      const details = await fetchApplication(app.application_id, {
        includeHistory: true,
        includeDeleted: true,
      });
      setSelectedApp(details);
    } catch {
      setSelectedApp(app);
    }
  };

  const handleToggleShortlist = async (appId: number, skipAiCheck = false) => {
    const app = applications.find((entry) => entry.application_id === appId);
    if (!app) return;

    if (!app.screening_result && !app.is_shortlisted && !skipAiCheck) {
      setShortlistAppId(appId);
      setShowShortlistDialog(true);
      return;
    }

    try {
      const response = await toggleShortlist(appId);
      setApplications((previous) =>
        previous.map((entry) =>
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
    } catch (shortlistError) {
      toast(
        `Action failed: ${shortlistError instanceof Error ? shortlistError.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleShortlistWithAi = async () => {
    if (!shortlistAppId) return;
    const app = applications.find((entry) => entry.application_id === shortlistAppId);
    if (!app?.position?.position_id) return;

    try {
      await startScreening(Number(app.position.position_id), {
        application_ids: [shortlistAppId],
      });
      toast("Screening started for the selected applicant.", "success");
      setShowShortlistDialog(false);
    } catch (screeningError) {
      toast(
        `Failed to start screening: ${screeningError instanceof Error ? screeningError.message : "Unknown error"}`,
        "error",
      );
    }
  };

  const handleRetryExtraction = async (appId: number) => {
    setRetryingApps((previous) => [...previous, appId]);
    try {
      await retryExtraction(appId);
      toast("Re-extraction triggered successfully.", "success");
      void loadAllApplications();
    } catch (retryError) {
      const message = retryError instanceof Error ? retryError.message : "";
      if (message.includes("405") || message.includes("404")) {
        toast("Re-extraction endpoint not available on this backend.", "warning");
      } else {
        toast("Failed to retry extraction. The AI service may be offline.", "error");
      }
    } finally {
      setRetryingApps((previous) => previous.filter((entry) => entry !== appId));
    }
  };

  const toggleCollapse = (jobKey: string) => {
    updateJobState(jobKey, (state) => ({
      ...state,
      collapsed: !state.collapsed,
      page: state.page,
    }));
  };

  const toggleSelectAll = (job: JobGroup, checked: boolean) => {
    updateJobState(job.key, (state) => ({
      ...state,
      selectedIds: checked ? job.applications.map((app) => app.application_id) : [],
      collapsed: false,
    }));
  };

  const toggleApplicantSelection = (jobKey: string, applicationId: number, checked: boolean) => {
    updateJobState(jobKey, (state) => ({
      ...state,
      selectedIds: checked
        ? mergeUniqueIds(state.selectedIds, [applicationId])
        : state.selectedIds.filter((id) => id !== applicationId),
    }));
  };

  const changeJobPage = (jobKey: string, delta: number) => {
    updateJobState(jobKey, (state) => ({
      ...state,
      page: Math.max(1, state.page + delta),
    }));
  };

  const handleStartJobScreening = async (job: JobGroup) => {
    const state = jobStateMap[job.key] ?? makeDefaultJobState(job.applications.length > JOB_PAGE_SIZE);
    const selectedIds = state.selectedIds.length > 0 ? state.selectedIds : job.applications.map((app) => app.application_id);

    if (selectedIds.length === 0) {
      toast("Select at least one applicant before screening.", "warning");
      return;
    }

    if (job.positionId === 0) {
      toast("Could not determine the job position for this group.", "error");
      return;
    }

    setIsBatchEvaluating(true);
    try {
      const response = await startScreening(job.positionId, {
        application_ids: selectedIds,
      });
      const initialProgress: ScreeningProgress = {
        job_id: response.id,
        status: "running",
        progress_percent: 0,
        current: 0,
        total: selectedIds.length,
        current_applicant: null,
        mode: "full",
      };
      saveProgressSnapshot(job.key, initialProgress);
      updateJobState(job.key, (current) => ({
        ...current,
        screeningJobId: response.id,
        progress: initialProgress,
        collapsed: false,
        selectedIds,
      }));
      startPolling(job.key, response.id);
      toast(`Screening started for ${selectedIds.length} selected applicant(s).`, "success");
    } catch (screeningError) {
      const message = screeningError instanceof Error ? screeningError.message : "";
      if (message.includes("405") || message.includes("404")) {
        toast("Screening endpoint not available on this backend.", "warning");
      } else {
        toast("Failed to start screening. The AI service may be offline.", "error");
      }
    } finally {
      setIsBatchEvaluating(false);
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
      {activeScreenings.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
            <Loader2 className="size-4 animate-spin" />
            Active Screening
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activeScreenings.map(({ jobKey, jobTitle, progress }) => (
              <div key={jobKey} className="space-y-2 rounded-xl bg-background p-3 shadow-sm border border-border/50">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold">{jobTitle}</span>
                  <span className="text-xs font-black text-primary">{progress.progress_percent}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${progress.progress_percent}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground truncate gap-2">
                  <span className="truncate">{progress.current_applicant ? `Now: ${progress.current_applicant}` : "Waiting"}</span>
                  <span className="shrink-0">{progress.current}/{progress.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/50 bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Total applications</p>
              <p className="mt-1 text-2xl font-black tracking-tight">{totalCount}</p>
            </div>
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Users className="size-5" />
            </div>
          </div>
        </Card>
        <Card className="border-border/50 bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Pending review</p>
              <p className="mt-1 text-2xl font-black tracking-tight">
                {applications.filter((app) => !app.screening_result).length}
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
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Shortlisted</p>
              <p className="mt-1 text-2xl font-black tracking-tight">
                {applications.filter((app) => app.is_shortlisted).length}
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
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Reviewed today</p>
              <p className="mt-1 text-2xl font-black tracking-tight">
                {applications.filter((app) => app.screening_result).length}
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
                <button onClick={resetFilters} className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
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

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Hiring status</label>
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
              <label className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Job position</label>
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
              <label className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Sort candidates</label>
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
                <label className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Min score</label>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">{minScore}%</span>
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
              {appliedToday ? <Check className="size-4" /> : <Square className="size-4" />}
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
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Applications overview</p>
              <h2 className="mt-1 text-lg font-black tracking-tight sm:text-xl">
                {applications.length} loaded of {totalCount} applicants
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-muted/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                {visibleJobs.length} job groups
              </span>
              <span className="rounded-full bg-muted/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                {applications.filter((app) => app.screening_result).length} reviewed
              </span>
              <span className="rounded-full bg-muted/60 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                Scroll stays inside each job
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-3xl border border-border/40 bg-muted/30" />
              ))}
            </div>
          ) : error ? (
            <Card className="flex flex-col items-center justify-center gap-4 border-dashed border-red-500/20 bg-red-500/5 px-6 py-14 text-center">
              <AlertCircle className="size-12 text-red-500" />
              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tight text-red-600">Sync error</h3>
                <p className="max-w-md text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={() => void loadAllApplications()} className="rounded-xl bg-primary text-white">
                <RefreshCw className="size-4" />
                Try refreshing
              </Button>
            </Card>
          ) : visibleJobs.length === 0 ? (
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
              {visibleJobs.map((job) => {
                const state = jobStateMap[job.key] ?? makeDefaultJobState(job.applications.length > JOB_PAGE_SIZE);
                const selectAllChecked = job.applications.length > 0 && state.selectedIds.length === job.applications.length;
                const selectAllMixed = state.selectedIds.length > 0 && state.selectedIds.length < job.applications.length;
                const totalPages = Math.max(1, Math.ceil(job.applications.length / JOB_PAGE_SIZE));
                const effectivePage = Math.min(Math.max(state.page, 1), totalPages);
                const startIndex = (effectivePage - 1) * JOB_PAGE_SIZE;
                const visibleApplications = state.collapsed ? job.applications.slice(0, JOB_PREVIEW_SIZE) : job.applications.slice(startIndex, startIndex + JOB_PAGE_SIZE);
                const screenedCount = job.applications.filter((app) => app.screening_result).length;
                const progress = state.progress;

                return (
                  <section key={job.key} className="space-y-3 rounded-3xl border border-border/50 bg-muted/10 p-4 shadow-sm">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-lg font-black tracking-tight sm:text-xl">{job.title}</h3>
                          <span className="rounded-full bg-background px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                            {job.applications.length} apps
                          </span>
                          {screenedCount > 0 && (
                            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">
                              {screenedCount} screened
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Select applicants for this job, then screen only that subset. Collapse the job after you have what you need.
                        </p>
                        {job.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {job.requiredSkills.map((skill) => (
                              <span key={skill} className="rounded-full border border-border/50 bg-background px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                        <label className="flex items-center gap-2 rounded-xl border border-border/50 bg-background px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={selectAllChecked}
                            ref={(node) => {
                              if (node) {
                                node.indeterminate = selectAllMixed;
                              }
                            }}
                            onChange={(event) => toggleSelectAll(job, event.target.checked)}
                            className="size-4 rounded border-border text-primary accent-primary"
                          />
                          Select all
                        </label>

                        <Button
                          onClick={() => void handleStartJobScreening(job)}
                          disabled={isBatchEvaluating || job.positionId === 0 || state.selectedIds.length === 0}
                          className="h-11 rounded-xl bg-primary px-4 text-[10px] font-black uppercase tracking-[0.22em] text-white"
                        >
                          {isBatchEvaluating ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                          {state.selectedIds.length > 0 ? `Screen selected (${state.selectedIds.length})` : "Select applicants"}
                        </Button>

                        <button
                          onClick={() => toggleCollapse(job.key)}
                          className="inline-flex h-11 items-center gap-2 rounded-xl border border-border/50 bg-background px-3 text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground shadow-sm"
                        >
                          {state.collapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                          {state.collapsed ? "Expand" : "Collapse"}
                        </button>
                      </div>
                    </div>

                    {progress && (
                      <div className="space-y-3 rounded-2xl border border-border/50 bg-background px-4 py-3 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
                            <BrainCircuit className="size-4 text-primary" />
                            Screening progress
                          </div>
                          <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                            {progress.status}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full rounded-full ${progress.status === "error" || progress.status === "failed" ? "bg-red-500" : "bg-primary"}`} style={{ width: `${progress.progress_percent}%` }} />
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>{formatProgressLabel(progress)}</span>
                          <span>{progress.current_applicant ? `Now: ${progress.current_applicant}` : "Waiting"}</span>
                        </div>
                        {state.logs.length > 0 && (
                          <div className="space-y-1 border-t border-border/50 pt-3">
                            {state.logs.slice(-3).map((entry, index) => (
                              <div key={`${entry.timestamp}-${index}`} className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
                                <span className="font-black uppercase tracking-[0.18em]">{entry.status}</span>
                                <span>{entry.current_applicant || "System"}</span>
                                <span>{entry.progress_percent}% · {entry.current}/{entry.total}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {state.collapsed ? (
                      <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 px-4 py-3 text-xs text-muted-foreground">
                        Showing a compact preview of the first {Math.min(JOB_PREVIEW_SIZE, job.applications.length)} applicants. Expand to review, select, or screen the rest of the queue.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {visibleApplications.map((app) => {
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
                          const shortlisted = Boolean(app.is_shortlisted || app.status === "shortlisted");
                          const isSelected = state.selectedIds.includes(app.application_id);
                          const canRetry = Boolean(app.screening_result);
                          const strengths = app.screening_result?.key_strengths || app.evaluation?.matched_keywords || [];
                          const weaknesses = app.screening_result?.key_weaknesses || [];

                          return (
                            <motion.article
                              key={app.application_id}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="rounded-2xl border border-border/50 bg-background p-4 shadow-sm transition hover:border-primary/20 hover:shadow-md"
                            >
                              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_auto] xl:items-center">
                                <div className="flex min-w-0 items-start gap-3">
                                  <label className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/30 text-muted-foreground">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(event) => toggleApplicantSelection(job.key, app.application_id, event.target.checked)}
                                      className="size-4 rounded border-border text-primary accent-primary"
                                    />
                                  </label>

                                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-black text-primary">
                                    {applicantName.charAt(0) || "U"}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => void openApplicantDetails(app)}
                                        className={`min-w-0 text-left text-base font-black tracking-tight transition sm:text-lg ${app.screening_result ? "hover:text-primary" : "text-foreground/80"}`}
                                      >
                                        <span className="truncate">{applicantName}</span>
                                      </button>
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
                                        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">AI summary</span>
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
                                      This applicant has not been screened yet. Select them or use select-all for this job to run screening.
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col gap-3 xl:items-end">
                                  <div className="flex items-center gap-3 xl:justify-end">
                                    <div className="text-right">
                                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Score</p>
                                      <p className={`text-2xl font-black tracking-tight ${getScoreClass(scoreValue)}`}>
                                        {scoreValue > 0 ? `${Math.round(scoreValue)}%` : "--"}
                                      </p>
                                    </div>
                                    {app.screening_result && (
                                      <div className="rounded-2xl border border-border/50 bg-muted/30 px-3 py-2 text-right">
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Hard criteria</p>
                                        <p className={`text-xs font-black ${app.screening_result.hard_criteria_met ? "text-emerald-600" : "text-red-600"}`}>
                                          {app.screening_result.hard_criteria_met ? "Passed" : "Failed"}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
                                    <button
                                      onClick={() => void openApplicantDetails(app)}
                                      disabled={!app.screening_result}
                                      className="inline-flex size-10 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground transition hover:border-primary/20 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                                      title={app.screening_result ? "Open screening details" : "Screening details will appear after AI review"}
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
                                        {canRetry && (
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
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.article>
                          );
                        })}

                        {job.applications.length > JOB_PREVIEW_SIZE && state.collapsed && (
                          <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 px-4 py-3 text-xs text-muted-foreground">
                            {job.applications.length - JOB_PREVIEW_SIZE} applicants hidden in collapsed view.
                          </div>
                        )}
                      </div>
                    )}

                    {!state.collapsed && job.applications.length > JOB_PAGE_SIZE && (
                      <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-background px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-muted-foreground">
                          Showing <span className="font-black text-foreground">{visibleApplications.length}</span> of <span className="font-black text-foreground">{job.applications.length}</span> applicants
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => changeJobPage(job.key, -1)}
                            disabled={effectivePage <= 1}
                            className="h-10 rounded-xl border-border/50 px-3"
                          >
                            <ArrowLeft className="size-4" />
                            Previous
                          </Button>
                          <span className="rounded-xl bg-muted/40 px-3 py-2 text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
                            Page {effectivePage} / {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            onClick={() => changeJobPage(job.key, 1)}
                            disabled={effectivePage >= totalPages}
                            className="h-10 rounded-xl border-border/50 px-3"
                          >
                            Next
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {selectedApp && (
          <EvaluationDetailsModal application={selectedApp} onClose={() => setSelectedApp(null)} />
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
            <p className="mt-2 text-2xl font-black">
              {applications.filter((app) => app.screening_result).length} / {applications.length}
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="rounded-xl font-bold">
              Cancel
            </Button>
            <Button onClick={() => setShowConfirmModal(false)} className="rounded-xl bg-primary font-bold text-white">
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
            <Button
              variant="outline"
              onClick={() => shortlistAppId && void handleToggleShortlist(shortlistAppId, true)}
              className="flex-1 rounded-xl border-amber-200 font-bold text-amber-700 hover:bg-amber-50"
            >
              Shortlist anyway
            </Button>
            <Button onClick={() => void handleShortlistWithAi()} className="flex-1 rounded-xl bg-primary font-bold text-white">
              Run AI review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
