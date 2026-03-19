"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApplications, fetchJobPositions, fetchShortlist } from "@/services/recruitmentService";
import type { Application, JobPosition, ShortlistEntry } from "@/types/recruitment";
import { ArrowLeft, BarChart3, Briefcase, Clock3, Target, Users } from "lucide-react";

function normalizeStatus(value: string | undefined): string {
  if (!value) return "unknown";
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function formatStatus(status: string): string {
  return status
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function RecruitmentAnalyticsPage() {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [shortlist, setShortlist] = useState<ShortlistEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [positionsRes, applicationsRes, shortlistRes] = await Promise.all([
          fetchJobPositions().catch(() => ({ results: [] })),
          fetchApplications().catch(() => ({ results: [] })),
          fetchShortlist().catch(() => ({ results: [] })),
        ]);

        setPositions(positionsRes.results ?? []);
        setApplications(applicationsRes.results ?? []);
        setShortlist(shortlistRes.results ?? []);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const stats = useMemo(() => {
    const openPositions = positions.filter((item) => item.status === "open").length;

    const statusMap = applications.reduce<Record<string, number>>((acc, app) => {
      const status = normalizeStatus(app.status);
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    }, {});

    const hired = statusMap.hired ?? 0;
    const interviewed = (statusMap.interview ?? 0) + (statusMap.interviewed ?? 0);
    const pending = statusMap.pending ?? 0;
    const totalApplications = applications.length;
    const conversionRate = totalApplications > 0 ? ((hired / totalApplications) * 100).toFixed(1) : "0.0";

    const topStatuses = Object.entries(statusMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      openPositions,
      totalApplications,
      shortlisted: shortlist.length,
      hired,
      interviewed,
      pending,
      conversionRate,
      topStatuses,
    };
  }, [applications, positions, shortlist]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back To Dashboard
          </Link>
          <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight">
            <BarChart3 className="size-8 text-primary" />
            Recruitment Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Funnel health and hiring performance across all job postings.
          </p>
        </div>

        <Link href="/recruitment/job-postings">
          <Button className="gap-2">
            <Briefcase className="size-4" />
            Manage Positions
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Open Positions</p>
          <p className="mt-3 text-3xl font-black">{loading ? "..." : stats.openPositions}</p>
        </Card>
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Applications</p>
          <p className="mt-3 text-3xl font-black">{loading ? "..." : stats.totalApplications}</p>
        </Card>
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Shortlisted</p>
          <p className="mt-3 text-3xl font-black">{loading ? "..." : stats.shortlisted}</p>
        </Card>
        <Card className="rounded-2xl border-none p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Hire Conversion</p>
          <p className="mt-3 text-3xl font-black">{loading ? "..." : `${stats.conversionRate}%`}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-none p-6 shadow-sm">
          <h2 className="text-lg font-black tracking-tight">Pipeline Snapshot</h2>
          <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="font-black uppercase tracking-widest text-muted-foreground">Pending</p>
              <p className="mt-2 text-2xl font-black">{loading ? "..." : stats.pending}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="font-black uppercase tracking-widest text-muted-foreground">Interview</p>
              <p className="mt-2 text-2xl font-black">{loading ? "..." : stats.interviewed}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="font-black uppercase tracking-widest text-muted-foreground">Hired</p>
              <p className="mt-2 text-2xl font-black">{loading ? "..." : stats.hired}</p>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-primary/5 p-4 text-sm text-muted-foreground">
            <Target className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              Keep shortlist quality high to improve conversion. This dashboard updates from live recruitment data.
            </p>
          </div>
        </Card>

        <Card className="rounded-2xl border-none p-6 shadow-sm">
          <h2 className="text-lg font-black tracking-tight">Application Status Mix</h2>
          <p className="mt-1 text-sm text-muted-foreground">Top statuses across all applications.</p>

          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading status distribution...</p>
            ) : stats.topStatuses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No application data available.</p>
            ) : (
              stats.topStatuses.map(([status, count]) => {
                const percent = stats.totalApplications > 0 ? (count / stats.totalApplications) * 100 : 0;
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <span>{formatStatus(status)}</span>
                      <span>{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" />
            Live values shown from current API results
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border-none p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Users className="size-4 text-primary" />
          Hiring summary: {loading ? "..." : `${stats.openPositions} open positions, ${stats.shortlisted} shortlisted candidates`}
        </div>
      </Card>
    </section>
  );
}
