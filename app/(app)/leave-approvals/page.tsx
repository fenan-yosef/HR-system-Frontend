"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/services/apiClient";

interface LeaveRequest {
  id: number;
  employee_name: string;
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  comments?: string;
  status: "pending" | "approved" | "rejected";
  requested_at: string;
}

export default function LeaveApprovalsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<number | null>(null);

  // Fetch pending leave requests
  useEffect(() => {
    async function loadPendingRequests() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<LeaveRequest[]>(
          "leave-requests/?status=pending",
          { requiresAuth: true }
        );
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load pending leave requests:", err);
        setError("Failed to load pending leave requests.");
      } finally {
        setLoading(false);
      }
    }
    loadPendingRequests();
  }, []);

  // Approve a leave request
  const handleApprove = async (id: number) => {
    setActioningId(id);
    try {
      await apiFetch(`leave-requests/${id}/approve/`, {
        method: "PATCH",
        requiresAuth: true,
      });
      // Remove the approved request from the list
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to approve leave request:", err);
      setError("Failed to approve leave request.");
    } finally {
      setActioningId(null);
    }
  };

  // Reject a leave request
  const handleReject = async (id: number) => {
    setActioningId(id);
    try {
      await apiFetch(`leave-requests/${id}/reject/`, {
        method: "PATCH",
        requiresAuth: true,
      });
      // Remove the rejected request from the list
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to reject leave request:", err);
      setError("Failed to reject leave request.");
    } finally {
      setActioningId(null);
    }
  };

  function formatDate(dateStr: string) {
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Leave Approvals</h1>
        <p className="text-muted-foreground">Review and approve pending leave requests from your team.</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 text-red-600 rounded-lg text-sm border border-red-200"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="size-8 text-primary animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-8 text-center">
          <Clock className="size-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No pending leave requests at this time.</p>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {requests.map((request) => (
            <motion.div
              key={request.id}
              variants={itemVariants}
              className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Left: Employee & Request Details */}
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Employee</p>
                    <p className="font-semibold text-lg">{request.employee_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Leave Type</p>
                    <p className="capitalize text-sm font-medium">{request.leave_type}</p>
                  </div>
                </div>

                {/* Middle: Dates & Days */}
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Period</p>
                    <p className="text-sm font-medium">
                      {formatDate(request.start_date)} — {formatDate(request.end_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Days Requested</p>
                    <p className="text-sm font-semibold text-primary">{request.days_requested} days</p>
                  </div>
                </div>

                {/* Right: Comments & Actions */}
                <div className="space-y-3">
                  {request.comments && (
                    <div>
                      <p className="text-sm text-muted-foreground">Comments</p>
                      <p className="text-sm italic">{request.comments}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      disabled={actioningId === request.id}
                      className="flex-1 flex items-center gap-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                      variant="outline"
                    >
                      {actioningId === request.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(request.id)}
                      disabled={actioningId === request.id}
                      className="flex-1 flex items-center gap-2 bg-red-500/10 text-red-600 hover:bg-red-500/20"
                      variant="outline"
                    >
                      {actioningId === request.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <XCircle className="size-4" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
