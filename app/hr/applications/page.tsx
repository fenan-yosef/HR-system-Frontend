"use client";

import React, { useEffect, useState } from "react";
import ActionButton from "@/components/ui/action-button";
import { fetchApplications, triggerShortlist } from "@/services/recruitmentService";
import type { Application } from "@/types/recruitment";

export default function ApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetchApplications();
        if (mounted) setApps(res.results ?? []);
      } catch {
        if (mounted) setApps([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function onShortlist(applicationId: number) {
    try {
      await triggerShortlist(applicationId);
      // Optimistically update status if present
      setApps((prev) => prev.map(a => a.application_id === applicationId ? { ...a, status: "Shortlisted" } : a));
    } catch {}
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Job Applications</h2>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-200 text-slate-700">
            <tr>
              <th className="px-4 py-3 text-left">Applicant Name</th>
              <th className="px-4 py-3 text-left">Position</th>
              <th className="px-4 py-3 text-left">AI Score</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={5}>Loading applications…</td>
              </tr>
            ) : apps.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={5}>No applications found.</td>
              </tr>
            ) : (
              apps.map((a) => (
                <tr key={a.application_id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3">{a.full_name}</td>
                  <td className="px-4 py-3">{a.position?.title ?? "—"}</td>
                  <td className="px-4 py-3">{formatAiScore(a)}</td>
                  <td className="px-4 py-3">{renderStatus(a.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <ActionButton role="HR" className="px-3 py-1 text-xs">View</ActionButton>
                      <ActionButton role="HR" className="px-3 py-1 text-xs" onClick={() => onShortlist(a.application_id)}>
                        Shortlist
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderStatus(status: string | undefined) {
  const s = (status ?? "").toLowerCase();
  const map: Record<string, string> = {
    shortlisted: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
  };
  const cls = map[s] ?? "bg-slate-100 text-slate-700";
  const label = status ?? "Unknown";
  return <span className={`px-3 py-1 rounded-full text-xs ${cls}`}>{label}</span>;
}

function formatAiScore(a: Application): string {
  // Backend may provide matching_percentage or AI rank metrics on shortlist, not on application; placeholder
  return "—";
}
