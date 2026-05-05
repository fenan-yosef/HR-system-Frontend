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
  Copy,
  MessageSquare,
  Briefcase,
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
import { canApproveRecruitment, isHRStaff } from "@/lib/permissions";
import { EvaluationDetailsModal } from "./EvaluationDetailsModal";
import { getApiErrorStatus } from "@/services/apiClient";
import { useToast } from "@/components/ui/toast";

export function PendingIntervieweesList() {
  const [candidates, setCandidates] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<string[] | null>(null);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [isBatchConfirming, setIsBatchConfirming] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const canApprove = canApproveRecruitment(user);
  const isStaff = isHRStaff(user);

  useEffect(() => {
    loadPendingData();
  }, []);

  const loadPendingData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const pendingRes = await fetchApplications({ status: "interview_pending" });
      const invitedRes = await fetchApplications({ status: "interview_invited" });

      const allCandidates = [
        ...(pendingRes.results || []),
        ...(invitedRes.results || []),
      ].sort((a, b) =>
        new Date(b.updated_at || b.submitted_at).getTime() -
        new Date(a.updated_at || a.submitted_at).getTime()
      );

      setCandidates(allCandidates);
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
    } catch (error: any) {
      toast(`Action failed: ${error.message || "Unknown error"}`, "error");
    }
  };

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "interview_pending":
        return "bg-amber-500/10 text-amber-600";
      case "interview_invited":
        return "bg-emerald-500/10 text-emerald-600";
      case "rejected":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const pendingCount = candidates.filter(c => c.status === "interview_pending").length;

  const handleCopyQuestions = (questions: string[]) => {
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
    navigator.clipboard.writeText(text);
    toast("Questions copied to clipboard!", "success");
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
        {canApprove && pendingCount > 0 && (
          <button
            onClick={handleBatchConfirm}
            disabled={isBatchConfirming}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isBatchConfirming ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Confirm All {pendingCount} Pending
          </button>
        )}
      </div>

      {candidates.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2 bg-muted/5">
          <Calendar className="size-12 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-bold">Activity Log Empty</h3>
          <p className="text-sm text-muted-foreground max-w-xs">No interview candidates have been processed yet.</p>
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
                <Card
                  className="p-6 border-none shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedApp(app);
                    setIsDetailsModalOpen(true);
                  }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-2xl bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all">
                        {app.full_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h4 className="font-black text-lg leading-tight group-hover:text-primary transition-colors">
                          {app.full_name}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium mt-1">
                          <span>{app.email}</span>
                          <span className="opacity-30">•</span>
                          <span>{app.position?.title}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                          <Star className="size-3.5 fill-current" />
                          <span className="text-xs font-black">
                            {(() => {
                              const scoreValue = Number(
                                app.screening_result?.final_score ||
                                app.evaluation?.matching_percentage || 0
                              );
                              return scoreValue > 0 ? `${scoreValue.toFixed(0)}%` : "N/A";
                            })()}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                          {app.status === "interview_pending" ? "Pending Approval" : 
                           app.status === "hire_pending" ? "Pending Hire Approval" : "Approved & Invited"}
                        </span>

                        {(app.screening_result?.scoring_breakdown?.interview_questions?.length ?? 0) > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQuestions(app.screening_result?.scoring_breakdown?.interview_questions || []);
                              setIsQuestionsModalOpen(true);
                            }}
                            className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline group/btn"
                          >
                            <MessageSquare className="size-3 group-hover/btn:scale-110 transition-transform" />
                            AI Suggested Questions for Interview
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        {canApprove && app.status === "interview_pending" && (
                          <>
                            <button
                              onClick={() => handleAction("confirm", app)}
                              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-sm transition-all flex items-center gap-2 active:scale-95"
                            >
                              <Check size={14} /> Confirm
                            </button>
                            <button
                              onClick={() => handleAction("reject", app)}
                              className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2 active:scale-95"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        )}
                        <button
                          className="p-2.5 rounded-xl bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-all active:scale-95"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border/50 flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <Calendar className="size-3.5" /> Applied:{" "}
                      {new Date(app.submitted_at || app.created_at).toLocaleDateString()}
                    </div>
                    {app.screening_result?.screened_at && (
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-l border-border/50 pl-6">
                        <BrainCircuit className="size-3.5 text-primary" /> AI Evaluated:{" "}
                        {new Date(app.screening_result.screened_at).toLocaleDateString()}
                      </div>
                    )}
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


      {selectedQuestions && isQuestionsModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-background w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-border"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <MessageSquare className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">AI Interview Questions</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Recommended based on profile</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQuestionsModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-muted transition-colors"
                >
                  <XCircle className="size-6 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedQuestions.map((q, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-muted/50 border border-border/50 text-sm font-medium leading-relaxed group hover:border-primary/30 transition-colors">
                    <span className="text-primary font-black mr-2">0{i + 1}</span> {q}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleCopyQuestions(selectedQuestions)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                >
                  <Copy className="size-4" /> Copy All to Clipboard
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
