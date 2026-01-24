"use client";

import React, { useEffect, useState } from "react";
import ActionButton from "@/components/ui/action-button";
import { apiFetch } from "@/services/apiClient";

export default function RoleAwareDashboardPage() {
  const [metrics, setMetrics] = useState({ employees: 0, activeJobs: 0, applicants: 0, pendingLeaves: 0 });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [emp, jobs, apps, leaves] = await Promise.all([
          apiFetch<{ count: number }>("/employees/", { requiresAuth: true, suppressErrorLog: true, ignoreNotFound: true }).catch(() => ({ count: 0 })),
          apiFetch<{ count: number }>("/job-posts/", { requiresAuth: true, suppressErrorLog: true, ignoreNotFound: true }).catch(() => ({ count: 0 })),
          apiFetch<{ count: number }>("/applications/", { requiresAuth: true, suppressErrorLog: true, ignoreNotFound: true }).catch(() => ({ count: 0 })),
          apiFetch<{ count: number }>("/leave-requests/?status=pending", { requiresAuth: true, suppressErrorLog: true, ignoreNotFound: true }).catch(() => ({ count: 0 })),
        ]);
        if (mounted) {
          setMetrics({
            employees: emp?.count ?? 0,
            activeJobs: jobs?.count ?? 0,
            applicants: apps?.count ?? 0,
            pendingLeaves: leaves?.count ?? 0,
          });
        }
      } catch {
        /* ignore */
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Role-aware overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total employees" value={metrics.employees} />
        <MetricCard title="Active job postings" value={metrics.activeJobs} />
        <MetricCard title="Total applicants" value={metrics.applicants} />
        <MetricCard title="Pending leave requests" value={metrics.pendingLeaves} />
      </div>

      <div className="rounded-xl border bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Recent activities</h2>
            <p className="text-sm text-muted-foreground">Connect to audit logs.</p>
          </div>
          <ActionButton role="ADMIN" className="px-3 py-2 text-sm">View details</ActionButton>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• Placeholder feed</li>
          <li>• New job posted: Software Engineer</li>
          <li>• Applicant shortlisted: Jane Doe</li>
        </ul>
      </div>
    </section>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
