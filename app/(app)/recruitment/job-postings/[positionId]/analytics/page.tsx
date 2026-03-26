"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApplications, fetchJobPosition } from "@/services/recruitmentService";
import type { Application, JobPosition } from "@/types/recruitment";
import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  Calendar,
  Clock3,
  Mail,
  Users,
} from "lucide-react";

type CandidateRecord = Application & {
  _derived_position_id: number;
};

function normaliseStatus(rawStatus: string | undefined): string {
  if (!rawStatus) return "unknown";
  const value = rawStatus.trim().toLowerCase();

  if (value.includes("hire")) return "hired";
  if (value.includes("short")) return "shortlisted";
  if (value.includes("interview")) return "interview";
  if (value.includes("confirm")) return "confirmed";
  if (value.includes("reject") || value.includes("declin")) return "rejected";
  if (value.includes("review") || value.includes("pending")) return "pending";
  return value.replace(/\s+/g, "_");
}

function formatStatusLabel(status: string): string {
  return status
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function PositionAnalyticsPage() {
  const params = useParams();
  const positionId = Number(params.positionId);

  const [job, setJob] = useState<JobPosition | null>(null);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Number.isFinite(positionId) || positionId <= 0) return;

    setLoading(true);
    Promise.all([
      fetchJobPosition(positionId).catch((error) => {
        console.error("Failed to load position", error);
        return null;
      }),
      fetchApplications().catch((error) => {
        console.error("Failed to load applications", error);
        return { results: [] } as { results: Application[] };
      }),
    ])
      .then(([jobData, appsData]) => {
        setJob(jobData);

        const rawResults = Array.isArray(appsData)
          ? appsData
          : (appsData?.results ?? []);

        const flattened = rawResults.map((item: any) => {
          const applicant = item.applicant ?? {};
          const position = item.position ?? {};
          const apiPositionId =
            (typeof position === "object"
              ? position.position_id ?? position.job_id
              : position) ?? item.position_id ?? item.job_id;

          return {
            ...item,
            full_name: applicant.full_name ?? item.full_name ?? "Unknown Name",
            email: applicant.email ?? item.email ?? "",
            phone: applicant.phone ?? item.phone ?? "",
            _derived_position_id: Number(apiPositionId),
          } as CandidateRecord;
        });

        setCandidates(
          flattened.filter(
            (candidate) =>
              Number.isFinite(candidate._derived_position_id) &&
              candidate._derived_position_id === positionId,
          ),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [positionId]);

  const analytics = useMemo(() => {
    const total = candidates.length;
    const statusCounts = candidates.reduce<Record<string, number>>((acc, candidate) => {
      const key = normaliseStatus(candidate.status);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const shortlist = (statusCounts.shortlisted ?? 0) + (statusCounts.confirmed ?? 0);
    const interview = statusCounts.interview ?? 0;
    const hired = statusCounts.hired ?? 0;
    const rejected = statusCounts.rejected ?? 0;
    const pending = statusCounts.pending ?? 0;

    const conversionRate = total > 0 ? ((hired / total) * 100).toFixed(1) : "0.0";
    const shortlistRate = total > 0 ? ((shortlist / total) * 100).toFixed(1) : "0.0";

    const topStatuses = Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const recentCandidates = [...candidates]
      .sort(
        (a, b) =>
          new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
      )
      .slice(0, 6);

    return {
      total,
      shortlist,
      interview,
      hired,
      rejected,
      pending,
      conversionRate,
      shortlistRate,
      topStatuses,
      recentCandidates,
    };
  }, [candidates]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm font-semibold text-muted-foreground">
        Loading analytics...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-black">Position Not Found</h2>
        <Link href="/recruitment/job-postings">
          <Button>Back to Positions</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href={`/recruitment/job-postings/${positionId}`}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back To Job Details
          </Link>
          <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight">
            <BarChart3 className="size-8 text-primary" />
            Position Analytics
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            {job.title} | Position #{job.position_id}
          </p>
        </div>

        <Link href={`/recruitment/job-postings/${positionId}`}>
          <Button className="gap-2">
            <Briefcase className="size-4" />
            Open Job Details
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Total Applications
          </p>
          <p className="mt-3 text-3xl font-black">{analytics.total}</p>
        </Card>

        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Shortlist Rate
          </p>
          <p className="mt-3 text-3xl font-black">{analytics.shortlistRate}%</p>
          <p className="mt-1 text-xs text-muted-foreground">{analytics.shortlist} candidates</p>
        </Card>

        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Hires
          </p>
          <p className="mt-3 text-3xl font-black">{analytics.hired}</p>
          <p className="mt-1 text-xs text-muted-foreground">Conversion {analytics.conversionRate}%</p>
        </Card>

        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Pending Review
          </p>
          <p className="mt-3 text-3xl font-black">{analytics.pending}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-none p-6 shadow-sm">
          <h2 className="text-lg font-black tracking-tight">Pipeline Breakdown</h2>
          <p className="mt-1 text-sm text-muted-foreground">Status distribution for this role.</p>

          <div className="mt-6 space-y-4">
            {analytics.topStatuses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications available yet.</p>
            ) : (
              analytics.topStatuses.map(([status, count]) => {
                const percent = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <span>{formatStatusLabel(status)}</span>
                      <span>
                        {count} ({percent.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="font-black uppercase tracking-widest text-muted-foreground">Interview</p>
              <p className="mt-2 text-lg font-black">{analytics.interview}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="font-black uppercase tracking-widest text-muted-foreground">Rejected</p>
              <p className="mt-2 text-lg font-black">{analytics.rejected}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border-none p-6 shadow-sm">
          <h2 className="text-lg font-black tracking-tight">Recent Applicants</h2>
          <p className="mt-1 text-sm text-muted-foreground">Most recent submissions for this position.</p>

          <div className="mt-5 space-y-3">
            {analytics.recentCandidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applicants yet.</p>
            ) : (
              analytics.recentCandidates.map((candidate) => (
                <div
                  key={candidate.application_id}
                  className="rounded-xl border border-border/60 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold leading-none">{candidate.full_name}</p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="size-3.5" />
                        {candidate.email || "No email"}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {formatStatusLabel(normaliseStatus(candidate.status))}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {new Date(candidate.submitted_at).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      {new Date(candidate.submitted_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border-none p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-black tracking-tight">
          <Users className="size-5 text-primary" />
          Insights
        </h2>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <p>
            Time to fill improves when shortlisted candidates are above 30% of total applications.
          </p>
          <p>
            This role currently has {analytics.total} applications with {analytics.hired} final hires.
          </p>
        </div>
      </Card>
    </div>
  );
}
