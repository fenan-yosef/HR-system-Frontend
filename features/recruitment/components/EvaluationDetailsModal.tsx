"use client";

import { useState } from "react";
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
  ChevronDown,
  TrendingUp,
  BrainCircuit,
  Search,
  BookOpen
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
  const [activeTab, setActiveTab] = useState<"matched" | "missing">("matched");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    skills: true,
    questions: true
  });
  
  if (!evalData) return null;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Summary Section */}
          <section className="border border-border/50 rounded-2xl overflow-hidden bg-muted/5">
             <button 
                onClick={() => toggleSection('summary')}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
             >
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                   <Quote size={14} />
                   <span>Resume Summary</span>
                </div>
                <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${expandedSections.summary ? '' : '-rotate-90'}`} />
             </button>
             <AnimatePresence>
                {expandedSections.summary && (
                   <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                   >
                      <div className="p-4 pt-0">
                         <p className="text-sm leading-relaxed text-foreground/80 bg-background/50 p-4 rounded-xl border border-border/30">
                            {evalData.summary || "No resume summary available."}
                         </p>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </section>

          {/* Skill Analysis */}
          <section className="border border-border/50 rounded-2xl overflow-hidden bg-muted/5">
             <div className="p-4 border-b border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600">
                   <TrendingUp size={14} />
                   <span>Skill Analysis</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                   <span className="text-[10px] font-black uppercase text-emerald-700">Match Accuracy</span>
                   <span className="text-xs font-black text-emerald-700">{evalData.matching_percentage}%</span>
                </div>
             </div>

             <div className="p-4">
                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-muted/50 rounded-xl mb-4">
                   <button 
                      onClick={() => setActiveTab('matched')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'matched' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:bg-background/30'}`}
                   >
                      Matched Skills
                   </button>
                   <button 
                      onClick={() => setActiveTab('missing')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'missing' ? 'bg-background text-amber-600 shadow-sm' : 'text-muted-foreground hover:bg-background/30'}`}
                   >
                      Missing Skills
                   </button>
                </div>

                <AnimatePresence mode="wait">
                   {activeTab === 'matched' ? (
                      <motion.div 
                         key="matched"
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: 10 }}
                         className="flex flex-wrap gap-2"
                      >
                         {(evalData.skill_gaps?.matched_skills || evalData.matched_keywords)?.map((skill) => (
                            <span key={skill} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase border border-emerald-100 rounded-lg shadow-sm flex items-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-default">
                               <CheckCircle2 size={12} />
                               {skill}
                            </span>
                         )) || (
                            <p className="text-xs text-muted-foreground w-full py-4 text-center">No matched skills identified.</p>
                         )}
                      </motion.div>
                   ) : (
                      <motion.div 
                         key="missing"
                         initial={{ opacity: 0, x: 10 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -10 }}
                         className="space-y-3"
                      >
                         <div className="flex flex-wrap gap-2">
                            {(evalData.skill_gaps?.missing_skills || evalData.missing_keywords)?.map((skill) => (
                               <a 
                                  key={skill} 
                                  href={`https://www.google.com/search?q=learn+${encodeURIComponent(skill)}+courses`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase border border-amber-100 rounded-lg shadow-sm flex items-center gap-1.5 hover:bg-amber-100 transition-colors group"
                               >
                                  <AlertCircle size={12} />
                                  {skill}
                                  <Search size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                               </a>
                            )) || (
                               <p className="text-xs text-muted-foreground w-full py-4 text-center text-emerald-600 font-medium">Excellent match! No critical skills missing.</p>
                            )}
                         </div>
                         
                         {evalData.skill_gaps?.gaps && evalData.skill_gaps.gaps.length > 0 && (
                            <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border/50 space-y-2">
                               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1.5">
                                  <BookOpen size={12} />
                                  Improvement Suggestions
                               </p>
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
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </section>

          {/* Interview Questions */}
          <section className="border border-border/50 rounded-2xl overflow-hidden bg-muted/5">
             <button 
                onClick={() => toggleSection('questions')}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
             >
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-violet-600">
                   <MessageSquare size={14} />
                   <span>Tailored Interview Questions</span>
                </div>
                <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${expandedSections.questions ? '' : '-rotate-90'}`} />
             </button>
             <AnimatePresence>
                {expandedSections.questions && (
                   <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                   >
                      <div className="p-4 pt-0 space-y-3">
                         {evalData.interview_questions?.map((q, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border/30 hover:bg-muted/20 transition-all group">
                               <span className="size-6 shrink-0 bg-violet-100 text-violet-700 text-[10px] font-black rounded-lg flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                  {i+1}
                               </span>
                               <p className="text-sm font-medium leading-relaxed">{q}</p>
                            </div>
                         )) || (
                            <div className="text-center py-6 bg-muted/10 rounded-xl border border-dashed text-xs text-muted-foreground">
                               Evaluation pending more data for tailored questions.
                            </div>
                         )}
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </section>

          {/* Clustering & Meta */}
          <section className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t border-border/50">
             <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-sm">
                   <Layers size={14} className="text-blue-400" />
                   <span className="text-[10px] font-black uppercase">Cluster #{evalData.cluster_id || "N/A"}</span>
                </div>
                {evalData.ai_rank && (
                   <div className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                      Top Rank {evalData.ai_rank}
                   </div>
                )}
             </div>
             
             <a 
               href={getMediaUrl(application.cv_path || application.applicant?.cv_path)} 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center gap-2 text-[10px] font-black uppercase text-primary hover:bg-primary/5 px-3 py-1.5 rounded-xl transition-colors"
             >
                <ExternalLink size={14} />
                Original Resume
             </a>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/20 flex justify-end">
           <Button onClick={onClose} variant="secondary" className="rounded-xl font-bold bg-background shadow-sm hover:bg-muted">
              Close Assessment
           </Button>
        </div>
      </motion.div>
    </div>
  );
}
