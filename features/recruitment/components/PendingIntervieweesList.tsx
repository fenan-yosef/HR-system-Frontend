"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Calendar,
  UserCheck,
  ChevronRight,
  Loader2,
  Check,
  BrainCircuit,
  AlertCircle,
  Mail,
  XCircle,
} from "lucide-react";
import {
  fetchApplications,
  fetchApplication,
  confirmApplication,
  rejectShortlisted,
  batchConfirmInterviews,
} from "@/services/recruitmentService";
import {
  Application,
} from "@/types/recruitment";
import { useAuth } from "@/hooks/useAuth";
import { canApproveRecruitment } from "@/lib/permissions";
import { EvaluationDetailsModal } from "./EvaluationDetailsModal";
import { getApiErrorStatus } from "@/services/apiClient";
import { useToast } from "@/components/ui/toast";

export function PendingIntervieweesList() {
  const [candidates, setCandidates] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isBatchConfirming, setIsBatchConfirming] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const canApprove = canApproveRecruitment(user);

  useEffect(() => {
    loadPendingData();
  }, []);

  const loadPendingData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetchApplications({ status: "interview_pending" });
      setCandidates(response.results || []);
    } catch (error) {
      setErrorMessage("Unable to load pending interviewees.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchConfirm = async () => {
    if (candidates.length === 0) return;
    const confirmed = window.confirm(`Approve and send interview invitations to all ${candidates.length} candidates?`);
    if (!confirmed) return;

    try {
      setIsBatchConfirming(true);
      const ids = candidates.map(c => c.application_id);
      await batchConfirmInterviews(ids);
      toast("Batch invitations sent successfully!", "success");
      loadPendingData();
    } catch (error: any) {
      toast(`Batch confirmation failed: ${error.message}`, "error");
    } finally {
      setIsBatchConfirming(false);
    }
  };

  const handleAction = async (action: "confirm" | "reject", app: Application) => {
    try {
      if (action === "confirm") {
        await confirmApplication(app.application_id);
        toast("Interview invitation sent!", "success");
      } else if (action === "reject") {
        const reason = window.prompt("Reason for rejection:");
        if (reason === null) return;
        await rejectShortlisted(app.application_id, reason);
        toast("Candidate rejected.", "success");
      }
      loadPendingData();
    } catch (error) {
      toast("Action failed.", "error");
    }
  };

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "interview_pending":
        return "bg-amber-500/10 text-amber-600";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">Interview Approvals</h2>
          <p className="text-sm text-muted-foreground font-medium">Candidates waiting for CEO/HR-CEO final confirmation.</p>
        </div>
        {canApprove && candidates.length > 0 && (
          <button
            onClick={handleBatchConfirm}
            disabled={isBatchConfirming}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isBatchConfirming ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Confirm All Pending
          </button>
        )}
      </div>

      {candidates.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2 bg-muted/5">
          <Check className="size-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-bold">Queue Empty</h3>
          <p className="text-sm text-muted-foreground max-w-xs">No candidates are currently awaiting interview approval.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {candidates.map((app) => (
              <motion.div
                key={app.application_id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="p-6 hover:shadow-md transition-shadow group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                        {app.full_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h4 className="font-black text-lg group-hover:text-primary transition-colors">
                          {app.full_name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                          <span>{app.email}</span>
                          <span className="opacity-30">•</span>
                          <span>{app.position?.title}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                          Pending Approval
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {canApprove && (
                          <>
                            <button
                              onClick={() => handleAction("confirm", app)}
                              className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-sm transition-all flex items-center gap-2"
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button
                              onClick={() => handleAction("reject", app)}
                              className="px-4 py-2 rounded-xl bg-red-500/10 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setIsDetailsModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {selectedApp && isDetailsModalOpen && (
        <EvaluationDetailsModal
          onClose={() => setIsDetailsModalOpen(false)}
          application={selectedApp}
        />
      )}
    </div>
  );
}
