"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Plus, Clock, CheckCircle2, XCircle, X } from "lucide-react";
import { Card } from "@/components/ui/card";

type LeaveType = "Annual Leave" | "Sick Leave" | "Unpaid Leave";
type LeaveStatus = "Approved" | "Rejected" | "Pending" | "Withdrawn";

interface LeaveRequestItem {
  id: number;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  reason: string;
}

interface LeaveBalanceItem {
  label: LeaveType;
  total: number;
  color: string;
}

const leaveCatalog: LeaveBalanceItem[] = [
  { label: "Annual Leave", total: 20, color: "bg-blue-500" },
  { label: "Sick Leave", total: 10, color: "bg-emerald-500" },
  { label: "Unpaid Leave", total: 5, color: "bg-amber-500" },
];

const initialRequests: LeaveRequestItem[] = [
  { id: 1, type: "Annual Leave", startDate: "2026-02-12", endDate: "2026-02-15", days: 3, status: "Approved", reason: "Family trip" },
  { id: 2, type: "Sick Leave", startDate: "2026-01-10", endDate: "2026-01-10", days: 1, status: "Approved", reason: "Medical appointment" },
  { id: 3, type: "Unpaid Leave", startDate: "2025-12-24", endDate: "2025-12-26", days: 2, status: "Rejected", reason: "Extended travel" },
  { id: 4, type: "Annual Leave", startDate: "2026-03-01", endDate: "2026-03-05", days: 5, status: "Pending", reason: "Personal time" },
];

function formatDisplayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function calculateDays(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const difference = end.getTime() - start.getTime();
  return Math.floor(difference / 86400000) + 1;
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
  const [requests, setRequests] = useState<LeaveRequestItem[]>(initialRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "Annual Leave" as LeaveType,
    startDate: "",
    endDate: "",
    reason: "",
  });

  const balances = useMemo(() => {
    return leaveCatalog.map((item) => {
      const used = requests
        .filter((request) => request.type === item.label && request.status === "Approved")
        .reduce((sum, request) => sum + request.days, 0);

      return {
        ...item,
        used,
        remaining: Math.max(0, item.total - used),
      };
    });
  }, [requests]);

  const recentRequests = useMemo(
    () => [...requests].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [requests],
  );

  const resetForm = () => {
    setFormData({ type: "Annual Leave", startDate: "", endDate: "", reason: "" });
    setError(null);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      setError("Start date and end date are required.");
      return;
    }

    const days = calculateDays(formData.startDate, formData.endDate);
    if (days <= 0) {
      setError("End date must be the same day or later than start date.");
      return;
    }

    if (!formData.reason.trim()) {
      setError("Please add a reason for this request.");
      return;
    }

    const matchingBalance = balances.find((item) => item.label === formData.type);
    if (formData.type !== "Unpaid Leave" && matchingBalance && days > matchingBalance.remaining) {
      setError(`Only ${matchingBalance.remaining} ${formData.type.toLowerCase()} days are available.`);
      return;
    }

    setRequests((previous) => [
      {
        id: Math.max(...previous.map((request) => request.id), 0) + 1,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days,
        status: "Pending",
        reason: formData.reason.trim(),
      },
      ...previous,
    ]);
    closeModal();
  };

  const handleWithdraw = (id: number) => {
    setRequests((previous) =>
      previous.map((request) =>
        request.id === id ? { ...request, status: "Withdrawn" } : request,
      ),
    );
  };

  const handleResubmit = (request: LeaveRequestItem) => {
    setFormData({
      type: request.type,
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason,
    });
    setError(null);
    setIsModalOpen(true);
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Time Off</h1>
          <p className="text-muted-foreground">Manage your leave requests and check your balances.</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="size-4" /> Request Time Off
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {balances.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group relative overflow-hidden border-none p-6 shadow-sm">
              <div className="absolute right-0 top-0 p-3 opacity-10 transition-opacity group-hover:opacity-20">
                <CalendarDays className={`size-24 ${item.color.replace("bg-", "text-")}`} />
              </div>

              <div className="relative z-10">
                <span className="text-xs font-bold uppercase text-muted-foreground">{item.label}</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-foreground">{item.remaining}</span>
                  <span className="text-sm font-medium text-muted-foreground">/ {item.total} days available</span>
                </div>

                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${item.color}`} style={{ width: `${(item.used / item.total) * 100}%` }} />
                </div>
                <p className="mt-2 text-xs font-medium text-muted-foreground">{item.used} days used</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="mb-4 text-xl font-bold tracking-tight">Recent Requests</h3>
        <div className="grid gap-4">
          {recentRequests.map((request, index) => {
            const StatusIcon = getStatusIcon(request.status);

            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-l-4 border-l-primary/0 p-4 transition-all hover:border-l-primary hover:shadow-md">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <CalendarDays className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{request.type}</h4>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatDisplayDate(request.startDate)} - {formatDisplayDate(request.endDate)}</span>
                          <span className="size-1 rounded-full bg-muted-foreground/30" />
                          <span>{request.days} days</span>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Reason: {request.reason}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusStyles(request.status)}`}>
                        <StatusIcon className="size-3.5" /> {request.status}
                      </div>

                      {request.status === "Pending" && (
                        <button
                          onClick={() => handleWithdraw(request.id)}
                          className="rounded-lg border border-border px-3 py-2 text-xs font-bold uppercase tracking-wider hover:bg-muted"
                        >
                          Withdraw
                        </button>
                      )}

                      {request.status === "Rejected" && (
                        <button
                          onClick={() => handleResubmit(request)}
                          className="rounded-lg bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground"
                        >
                          Resubmit
                        </button>
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

          <Card className="relative z-10 w-full max-w-lg border-none p-6 shadow-2xl">
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
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Leave Type</label>
                <select
                  value={formData.type}
                  onChange={(event) => setFormData((previous) => ({ ...previous, type: event.target.value as LeaveType }))}
                  className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {leaveCatalog.map((item) => (
                    <option key={item.label} value={item.label}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(event) => setFormData((previous) => ({ ...previous, startDate: event.target.value }))}
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(event) => setFormData((previous) => ({ ...previous, endDate: event.target.value }))}
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(event) => setFormData((previous) => ({ ...previous, reason: event.target.value }))}
                  className="min-h-[120px] w-full rounded-xl border border-border bg-background p-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Explain why you need time off"
                />
              </div>

              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 rounded-xl bg-muted px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-muted/80">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
                  Submit Request
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </section>
  );
}
