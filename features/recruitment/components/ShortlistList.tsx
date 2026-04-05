"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star, Calendar, MessageSquare, UserCheck, ChevronRight, Loader2, Send, Check } from "lucide-react";
import { fetchShortlist, confirmApplication, inviteToInterview, hireApplicant } from "@/services/recruitmentService";
import { ShortlistEntry, Application } from "@/types/recruitment";
import { useAuth } from "@/hooks/useAuth";
import { isHRCeo } from "@/lib/permissions";
import { EvaluationDetailsModal } from "./EvaluationDetailsModal";
import { AnimatePresence } from "framer-motion";

export function ShortlistList() {
  const [shortlist, setShortlist] = useState<ShortlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { user } = useAuth();
  const canCEOActions = isHRCeo(user);

  useEffect(() => {
    loadShortlist();
  }, []);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Simulation of report generation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      window.alert("The detailed shortlist report has been generated successfully.");
    } catch (error) {
      console.error("Report generation failed:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const loadShortlist = async () => {
    setIsLoading(true);
    try {
      const response = await fetchShortlist();
      setShortlist(response.results || []);
    } catch (error) {
      console.error("Failed to fetch shortlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: string, entry: ShortlistEntry) => {
    const appId = entry.application.application_id;
    try {
      if (action === "confirm") {
        await confirmApplication(appId, { confirmed_by: user?.id ?? null, note: "Manager approved" });
        window.alert("Candidate confirmed!");
      } else if (action === "invite") {
        await inviteToInterview(appId, {
          datetime: new Date(Date.now() + 86400000).toISOString(),
          location: "Virtual Meeting Room",
          message: "We'd like to interview you for the position."
        });
        window.alert("Interview invitation sent!");
      } else if (action === "hire") {
        await hireApplicant(appId, {
          start_date: "2026-04-01",
          package: { salary: 75000 },
          hired_by: user?.id ?? null,
        });
        window.alert("Candidate marked as HIRED!");
      }
      loadShortlist();
    } catch (error) {
      window.alert(`Action ${action} failed.`);
    }
  };

  const openDetailsModal = (app: Application) => {
    setSelectedApp(app);
    setIsDetailsModalOpen(true);
  };

  const getStatusStyle = (s: string) => {
    switch (s) {
      case "shortlisted":
        return "bg-emerald-500/10 text-emerald-600";
      case "pending":
        return "bg-blue-500/10 text-blue-600";
      case "rejected":
        return "bg-red-500/10 text-red-600";
      case "confirmed":
        return "bg-violet-500/10 text-violet-600";
      case "hired":
        return "bg-amber-500/10 text-amber-600";
      case "interview_invited":
        return "bg-cyan-500/10 text-cyan-600";
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
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Priority Candidates</h3>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total: {shortlist.length}</span>
        </div>

        <div className="grid gap-4">
          {shortlist.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-xl border-dashed">No priority candidates at the moment.</div>
          ) : (
            shortlist.map((entry, i) => (
              <motion.div
                key={entry.shortlist_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 border-none shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-14 rounded-2xl bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all">
                        {entry.application.full_name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-tight">{entry.application.full_name}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">{entry.application.position?.title}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-amber-500 mb-1">
                        <Star className="size-3 fill-current" />
                        <span className="text-xs font-bold">{entry.ai_rank ? (entry.ai_rank * 5).toFixed(1) : "N/A"}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(entry.application.status)}`}>
                        {entry.application.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border/50 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Calendar className="size-3.5" /> Evaluated {new Date(entry.evaluated_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground border-l border-border/50 pl-4">
                        <MessageSquare className="size-3.5" /> AI Score: {(entry.ai_rank * 100).toFixed(0)}%
                      </div>
                    </div>

                      {canCEOActions && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAction("confirm", entry)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500/20 transition-colors"
                        >
                          <Check className="size-3" /> Confirm
                        </button>
                        <button 
                          onClick={() => handleAction("invite", entry)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-colors"
                        >
                          <Send className="size-3" /> Invite
                        </button>
                        <button 
                          onClick={() => handleAction("hire", entry)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
                        >
                          <UserCheck className="size-3" /> Hire
                        </button>
                      </div>
                    )}

                    <button 
                      onClick={() => openDetailsModal(entry.application)}
                      className="p-2 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold tracking-tight">Pipeline Health</h3>
        <Card className="p-6 border-none bg-primary/5 shadow-none space-y-6">
           <div>
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hiring Velocity</span>
                <span className="text-xs font-bold text-primary">85%</span>
             </div>
             <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: "85%" }}
                   transition={{ duration: 1.5 }}
                   className="h-full bg-primary"
                />
             </div>
           </div>

           <div className="space-y-4 pt-4">
             <div className="flex items-center gap-3">
               <div className="size-2 rounded-full bg-emerald-500" />
               <p className="text-xs font-medium">4 candidates in final stages</p>
             </div>
             <div className="flex items-center gap-3">
               <div className="size-2 rounded-full bg-amber-500" />
               <p className="text-xs font-medium">2 offers pending approval</p>
             </div>
           </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGeneratingReport || shortlist.length === 0}
              className="w-full py-3 rounded-xl bg-background text-xs font-bold text-foreground border border-border shadow-sm hover:bg-muted transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingReport ? "Generating Report..." : "Generate Detailed Report"}
            </button>
        </Card>

        <Card className="p-6 border-none bg-card shadow-sm flex items-center gap-4">
           <div className="bg-primary text-primary-foreground p-3 rounded-xl">
              <UserCheck className="size-5" />
           </div>
           <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ready to Hire</p>
              <p className="text-xl font-extrabold">{shortlist.filter(e => e.application.status === 'confirmed').length}</p>
           </div>
        </Card>
      </div>
      <AnimatePresence>
        {isDetailsModalOpen && selectedApp && (
          <EvaluationDetailsModal
            application={selectedApp}
            onClose={() => { setIsDetailsModalOpen(false); setSelectedApp(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
