"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Wand2, 
  MessageSquare, 
  Layers, 
  Quote, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Application } from "@/types/recruitment";
import { getMediaUrl } from "@/services/apiClient";

interface EvaluationDetailsModalProps {
  application: Application;
  onClose: () => void;
}

export function EvaluationDetailsModal({ application, onClose }: EvaluationDetailsModalProps) {
  const evalData = application.evaluation;
  
  if (!evalData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-background rounded-3xl border border-border shadow-2xl z-[60] overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <BrainCircuit className="size-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">{application.full_name || application.applicant?.full_name}</h3>
              <p className="text-sm text-muted-foreground font-medium">{application.position?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Summary Section */}
          <section className="space-y-3">
             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full w-fit">
                <Quote size={12} />
                <span>Executive Summary</span>
             </div>
             <p className="text-base leading-relaxed text-foreground/80 bg-muted/30 p-5 rounded-2xl border border-border/50">
                {evalData.summary || "No executive summary provided by AI evaluation."}
             </p>
          </section>

          {/* Skill Analysis */}
          <section className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                   <TrendingUp size={12} />
                   <span>Skill Alignment</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black uppercase text-muted-foreground">Match Accuracy</span>
                   <span className="text-sm font-black text-primary">{evalData.matching_percentage}%</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                   <h4 className="text-xs font-black uppercase tracking-tighter text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 size={14} /> Matched Skills
                   </h4>
                   <div className="flex flex-wrap gap-2">
                      {evalData.skill_gaps?.matched_skills?.map((skill) => (
                         <span key={skill} className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg shadow-sm">
                            {skill}
                         </span>
                      )) || evalData.matched_keywords?.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg shadow-sm">
                           {skill}
                        </span>
                     ))}
                   </div>
                </div>

                <div className="space-y-3 p-5 rounded-2xl bg-amber-50/50 border border-amber-100">
                   <h4 className="text-xs font-black uppercase tracking-tighter text-amber-700 flex items-center gap-2">
                      <AlertCircle size={14} /> Critical Gaps
                   </h4>
                   <div className="flex flex-wrap gap-2">
                      {evalData.skill_gaps?.missing_skills?.map((skill) => (
                         <span key={skill} className="px-2.5 py-1 bg-white border border-amber-200 text-amber-700 text-[10px] font-bold rounded-lg shadow-sm">
                            {skill}
                         </span>
                      )) || evalData.missing_keywords?.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-white border border-amber-200 text-amber-700 text-[10px] font-bold rounded-lg shadow-sm">
                           {skill}
                        </span>
                     ))}
                   </div>
                </div>
             </div>

             {evalData.skill_gaps?.gaps && evalData.skill_gaps.gaps.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 space-y-2">
                   <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Optimization Suggestions</p>
                   <ul className="space-y-1.5">
                      {evalData.skill_gaps.gaps.map((gap, i) => (
                         <li key={i} className="flex items-start gap-2 text-xs font-medium text-foreground/70">
                            <ChevronRight size={14} className="mt-0.5 text-primary shrink-0" />
                            {gap}
                         </li>
                      ))}
                   </ul>
                </div>
             )}
          </section>

          {/* Interview Questions */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-violet-600 bg-violet-50 px-3 py-1 rounded-full w-fit">
                <MessageSquare size={12} />
                <span>Tailored Interview Questions</span>
             </div>
             <div className="space-y-3">
                {evalData.interview_questions?.map((q, i) => (
                   <div key={i} className="flex gap-4 p-4 rounded-2xl bg-muted/20 border border-border/30 hover:bg-muted/40 transition-colors">
                      <span className="h-6 w-6 shrink-0 bg-violet-100 text-violet-600 text-[10px] font-black rounded-lg flex items-center justify-center">0{i+1}</span>
                      <p className="text-sm font-medium leading-relaxed">{q}</p>
                   </div>
                )) || (
                   <div className="text-center py-6 bg-muted/10 rounded-2xl border border-dashed text-xs text-muted-foreground">
                      Interview questions will be generated upon confirmation.
                   </div>
                )}
             </div>
          </section>

          {/* Clustering & Secondary Meta */}
          <section className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t border-border">
             <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl">
                   <Layers size={14} className="text-blue-400" />
                   <span className="text-[10px] font-black uppercase">Cluster Group {evalData.cluster_id || "N/A"}</span>
                </div>
                {evalData.ai_rank && (
                   <div className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                      AI Rank #{evalData.ai_rank}
                   </div>
                )}
             </div>
             
             <a 
               href={getMediaUrl(application.cv_path || application.applicant?.cv_path)} 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:underline"
             >
                <ExternalLink size={14} />
                View Original Resume
             </a>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/20 flex justify-end">
           <Button onClick={onClose} variant="ghost" className="rounded-xl font-bold">
              Close Insights
           </Button>
        </div>
      </motion.div>
    </div>
  );
}
