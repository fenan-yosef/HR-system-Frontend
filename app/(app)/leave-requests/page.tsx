"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Clock, CheckCircle2, XCircle, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiFetch } from "@/services/apiClient";

type LeaveType = "annual" | "sick" | "maternity" | "emergency" | "unpaid" | "other";
type LeaveStatus = "Approved" | "Rejected" | "Pending" | "Withdrawn";

interface LeaveRequestItem {
  id: number;
  leave_type: LeaveType;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  days_requested: number;
  status: LeaveStatus;
  requested_at: string;
  comments?: string;
}

const ANNUAL_ALLOWANCE = 20;

function formatDisplayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function calculateDays(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / 86400000) + 1;
}

function getStatusStyles(status: LeaveStatus) {
  if (status === "Approved") return "text-emerald-500 bg-emerald-500/10";
  if (status === "Rejected") return "text-red-500 bg-red-500/10";
  if (status === "Withdrawn") return "text-slate-500 bg-slate-500/10";
  return "text-amber-500 bg-amber-500/10";
}

function getStatusIcon(status: LeaveStatus) {
  if (status === "Approved") return CheckCircle2;
  if (status === "Rejected" || status === "Withdrawn") return XCircle;
  return Clock;
}

export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    leave_type: "annual" as LeaveType,
    start_date: "",
    end_date: "",
    days_requested: 0,
    comments: "",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setFetchError(null);
      try {
        const data = await apiFetch<LeaveRequestItem[]>("leave-requests", { requiresAuth: true });
        setRequests(Array.isArray(data) ? data : []);
      } catch (e) {
        setFetchError("Failed to load leave requests.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const usedAnnualDays = useMemo(() => {
    return requests
      .filter((r) => r.leave_type === "annual" && r.status === "Approved")
      .reduce((sum, r) => sum + (r.days_requested || 0), 0);
  }, [requests]);

  const remainingAnnual = Math.max(0, ANNUAL_ALLOWANCE - usedAnnualDays);

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const approvedCount = requests.filter((r) => r.status === "Approved").length;

  useEffect(() => {
    // auto-calc days_requested from dates
    const days = calculateDays(formData.start_date, formData.end_date);
    setFormData((prev) => ({ ...prev, days_requested: days > 0 ? days : 0 }));
  }, [formData.start_date, formData.end_date]);

  const openModal = () => {
    setFormData({ leave_type: "annual", start_date: "", end_date: "", days_requested: 0, comments: "" });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { leave_type, start_date, end_date, days_requested, comments } = formData;

    if (!start_date || !end_date) {
      setError("Start date and end date are required.");
      return;
    }

    const days = calculateDays(start_date, end_date);
    if (days <= 0) {
      setError("End date must be the same day or later than start date.");
      return;
    }

    if (days !== days_requested) {
      setError("Days requested must match the inclusive date range.");
      return;
    }

    if (leave_type === "annual" && days > remainingAnnual) {
      setError(`Only ${remainingAnnual} annual days are available.`);
      return;
    }

    const payload = {
      leave_type,
      start_date,
      end_date,
      days_requested: days,
      comments,
    };

    setSubmitting(true);
    try {
        const created = await apiFetch<LeaveRequestItem>("leave-requests", {
          method: "POST",
          body: JSON.stringify(payload),
          requiresAuth: true,
        });

      // If API returns the created object, use it; otherwise synthesize a pending entry
      const newEntry: LeaveRequestItem = created && created.id
        ? created
        : {
            id: Math.max(0, ...requests.map((r) => r.id)) + 1,
            leave_type: payload.leave_type as LeaveType,
            start_date: payload.start_date,
            end_date: payload.end_date,
            days_requested: payload.days_requested,
            status: "Pending",
            requested_at: new Date().toISOString(),
            comments: payload.comments,
          };

      setRequests((prev) => [newEntry, ...prev]);
      closeModal();
    } catch (err) {
      console.error("Leave request submission failed:", err);
      const detail =
        err instanceof ApiError
          ? err.detail
          : err instanceof Error
            ? err.message
            : null;
      setError(detail ? `Failed to submit leave request: ${detail}` : "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = (id: number) => {
    // local optimistic update only; real implementation should call DELETE or PATCH
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Withdrawn" } : r)));
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Leave Request</h1>
          <p className="text-muted-foreground">Submit and track your personal leave requests.</p>
        </div>
        <Button onClick={openModal} className="flex items-center gap-2">
          <Plus className="size-4" /> Request Time Off
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <p className="text-xs font-bold uppercase text-muted-foreground">Annual balance</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-black text-foreground">{remainingAnnual}</span>
              <span className="text-sm font-medium text-muted-foreground">/ {ANNUAL_ALLOWANCE} days</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{usedAnnualDays} days used</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <p className="text-xs font-bold uppercase text-muted-foreground">Pending</p>
            <div className="mt-2 text-3xl font-black">{pendingCount}</div>
            <p className="mt-2 text-xs text-muted-foreground">Open requests</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <p className="text-xs font-bold uppercase text-muted-foreground">Approved</p>
            <div className="mt-2 text-3xl font-black">{approvedCount}</div>
            <p className="mt-2 text-xs text-muted-foreground">Approved this year</p>
          </Card>
        </motion.div>
      </div>

      <div>
        <h3 className="mb-4 text-xl font-bold tracking-tight">My Requests</h3>

        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {fetchError && <p className="text-sm text-red-600">{fetchError}</p>}

        <div className="grid gap-4">
          {requests.map((request, index) => {
            const StatusIcon = getStatusIcon(request.status);
            return (
              <motion.div key={request.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                <Card className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold">{request.leave_type}</p>
                      <p className="text-sm text-muted-foreground">{formatDisplayDate(request.start_date)} - {formatDisplayDate(request.end_date)} • {request.days_requested} days</p>
                      {request.comments && <p className="mt-1 text-xs text-muted-foreground">Comments: {request.comments}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusStyles(request.status)}`}>
                        <StatusIcon className="size-3.5" /> {request.status}
                      </div>
                      {request.status === "Pending" && (
                        <button onClick={() => handleWithdraw(request.id)} className="rounded-lg border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-muted">Withdraw</button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Close leave request modal" onClick={closeModal} className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

          <Card className="relative z-10 w-full max-w-lg p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black">Request Time Off</h3>
                <p className="mt-1 text-sm text-muted-foreground">Submit a leave request and track it from this page.</p>
              </div>
              <button onClick={closeModal} className="rounded-full p-2 hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="leave_type">Leave Type</Label>
                <select id="leave_type" value={formData.leave_type} onChange={(e) => setFormData((p) => ({ ...p, leave_type: e.target.value as LeaveType }))} className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm">
                  <option value="annual">Annual</option>
                  <option value="sick">Sick</option>
                  <option value="maternity">Maternity</option>
                  <option value="emergency">Emergency</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))} />
                </div>
              </div>

              <div>
                <Label htmlFor="days">Days Requested</Label>
                <Input id="days" type="number" value={formData.days_requested} readOnly />
              </div>

              {formData.leave_type === "annual" && (
                <div className="rounded-md border border-border/60 p-3">
                  <p className="text-sm font-semibold">Annual leave remaining: {remainingAnnual} days</p>
                </div>
              )}

              <div>
                <Label htmlFor="comments">Comments</Label>
                <textarea id="comments" value={formData.comments} onChange={(e) => setFormData((p) => ({ ...p, comments: e.target.value }))} className="min-h-[96px] w-full rounded-xl border border-border p-3 text-sm" />
              </div>

              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 rounded-xl bg-muted px-4 py-3 text-sm font-bold text-muted-foreground">Cancel</button>
                <button type="submit" disabled={submitting || formData.days_requested <= 0} className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60">
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </section>
  );
}
