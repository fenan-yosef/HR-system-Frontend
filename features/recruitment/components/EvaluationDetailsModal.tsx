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
  BookOpen,
  XCircle,
  AlertTriangle,
  FileSearch,
  Brain,
  History,
  Clock,
  Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Application, ScreeningResult, ScreeningHistoryEntry } from "@/types/recruitment";
import { getMediaUrl } from "@/services/apiClient";
import { formatScore } from "@/lib/utils";
import { toggleShortlist } from "@/services/recruitmentService";
import { useToast } from "@/components/ui/toast";
import { Star } from "lucide-react";

function getScoreColor(score: number) {
  if (score >= 80) return { text: "text-emerald-600", light: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Strong Fit" };
  if (score >= 60) return { text: "text-teal-600", light: "bg-teal-500/10", border: "border-teal-500/20", label: "Qualified" };
  if (score >= 40) return { text: "text-amber-600", light: "bg-amber-500/10", border: "border-amber-500/20", label: "Needs Review" };
  return { text: "text-red-500", light: "bg-red-500/10", border: "border-red-500/20", label: "Low Match" };
}

interface EvaluationDetailsModalProps {
  application: Application;
  onClose: () => void;
}

export function EvaluationDetailsModal({ application, onClose }: EvaluationDetailsModalProps) {
  const { toast } = useToast();
  const evalData = application.evaluation;
  const screening = application.screening_result;
  const history = application.screening_history || screening?.history || [];
  
  const [activeTab, setActiveTab] = useState<"matched" | "missing">("matched");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    rawLogic: false
  });
  
  // Track which version we are currently viewing (defaults to active screening result)
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | string | null>(screening?.id || null);
  const [isShortlisted, setIsShortlisted] = useState(application.is_shortlisted || application.status === "shortlisted");
  const [isToggling, setIsToggling] = useState(false);
  
  if (!evalData && !screening) return null;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

    // Determine which snapshot to display
    const currentSnapshot = selectedSnapshotId === (screening?.id)
         ? screening
         : history.find((h: ScreeningHistoryEntry) => h.id === selectedSnapshotId) || screening;

    // Type guard for snapshots that include full screening details
    const isFullSnapshot = (s: ScreeningResult | ScreeningHistoryEntry | undefined): s is ScreeningResult =>
       !!s && 'rule_score' in s && 'ai_score' in s;

    const fullSnapshot = isFullSnapshot(currentSnapshot) ? currentSnapshot : undefined;

    // Coerce numeric fields that may arrive as strings from the API
    const screeningScoreNum = currentSnapshot ? (Number(currentSnapshot.final_score) || 0) : 0;
    const screeningRuleNum = fullSnapshot ? (Number(fullSnapshot.rule_score) || 0) : 0;
    const screeningAiNum = fullSnapshot ? (Number(fullSnapshot.ai_score) || 0) : 0;

    const hardCriteriaMet = fullSnapshot ? !!fullSnapshot.hard_criteria_met : false;
    const explanationText = fullSnapshot ? fullSnapshot.explanation : "";
    const keyStrengths: string[] = fullSnapshot ? (fullSnapshot.key_strengths || []) : [];
    const keyWeaknesses: string[] = fullSnapshot ? (fullSnapshot.key_weaknesses || []) : [];
    const rawLlmResponse = fullSnapshot ? fullSnapshot.raw_llm_response : undefined;

    // Extract interview questions from breakdown if present, fall back to evaluation data
    let interviewQuestions: string[] = [];
    if (fullSnapshot && Array.isArray(fullSnapshot.scoring_breakdown?.interview_questions)) {
       interviewQuestions = fullSnapshot.scoring_breakdown!.interview_questions as string[];
    } else if (evalData?.interview_questions) {
       interviewQuestions = evalData.interview_questions;
    }

    const handleToggleShortlist = async () => {
      try {
        setIsToggling(true);
        const res = await toggleShortlist(application.application_id);
        setIsShortlisted(res.shortlisted);
        toast(res.shortlisted ? "Added to shortlist" : "Removed from shortlist", "success");
      } catch (err: any) {
        toast(`Action failed: ${err.message}`, "error");
      } finally {
        setIsToggling(false);
      }
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
          
          {/* Rejection Status */}
          {application.status === "rejected" && application.rejection_reason && (
            <section className="p-4 rounded-2xl bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <XCircle className="size-5" />
                <h4 className="font-black text-sm uppercase tracking-wider">Candidate Rejected</h4>
              </div>
              <p className="text-sm text-red-700 font-medium leading-relaxed bg-white/50 p-3 rounded-xl border border-red-100 italic">
                "{application.rejection_reason}"
              </p>
            </section>
          )}
          {screening && (
            <section className="border border-border/50 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
                <button 
                  onClick={() => toggleSection('screening')}
                  className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors border-b border-border/30"
               >
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg ${getScoreColor(screeningScoreNum).light} ${getScoreColor(screeningScoreNum).text}`}>
                        <Brain size={16} />
                     </div>
                     <div className="text-left">
                        <div className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                           {selectedSnapshotId === screening?.id ? "Latest AI Screening" : "Archived Screening Version"}
                           <span className={`px-2 py-0.5 rounded-full text-[10px] ${hardCriteriaMet ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                              {hardCriteriaMet ? 'Passed Criteria' : 'Failed Criteria'}
                           </span>
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase">Weighted Fit: {formatScore(currentSnapshot?.final_score, 1)}% (V{currentSnapshot?.evaluation_version})</div>
                     </div>
                  </div>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${expandedSections.screening ? '' : '-rotate-90'}`} />
               </button>
               
               <AnimatePresence>
                  {expandedSections.screening && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                     >
                        <div className="p-4 space-y-4">
                           {/* Scores Grid */}
                           <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 rounded-xl bg-background/50 border border-border/30 text-center">
                                 <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Rule Score</p>
                                 <p className="text-lg font-black">{formatScore(screeningRuleNum, 0)}%</p>
                              </div>
                              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                                 <p className="text-[9px] font-black uppercase text-primary mb-1">AI Match</p>
                                 <p className="text-lg font-black text-primary">{formatScore(screeningAiNum, 0)}%</p>
                              </div>
                           </div>

                           {/* Explanation */}
                           <div className="p-4 rounded-xl bg-background/50 border border-border/30">
                              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                                 <MessageSquare size={12} /> AI Logic Explanation
                              </p>
                              <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap italic">"{explanationText}"</div>
                           </div>

                           {/* Pros/Cons */}
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5 border-b border-emerald-500/10 pb-1">
                                    <CheckCircle2 size={12} /> Strong Signals
                                 </p>
                                 <div className="flex flex-col gap-1.5">
                                    {keyStrengths.map((s: string, i: number) => (
                                       <div key={i} className="text-[11px] font-semibold text-foreground/80 flex items-start gap-1.5">
                                          <div className="size-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {s}
                                       </div>
                                    ))}
                                    {keyStrengths.length === 0 && <span className="text-[10px] italic text-muted-foreground">None identified.</span>}
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1.5 border-b border-amber-500/10 pb-1">
                                    <AlertTriangle size={12} /> Identified Gaps
                                 </p>
                                 <div className="flex flex-col gap-1.5">
                                    {keyWeaknesses.map((w: string, i: number) => (
                                       <div key={i} className="text-[11px] font-semibold text-foreground/80 flex items-start gap-1.5">
                                          <div className="size-1 rounded-full bg-amber-500 mt-1.5 shrink-0" /> {w}
                                       </div>
                                    ))}
                                    {keyWeaknesses.length === 0 && <span className="text-[10px] italic text-muted-foreground">None identified.</span>}
                                 </div>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </section>
          )}

          {/* Evaluation History Section */}
          {history.length > 0 && (
            <section className="border border-border/50 rounded-2xl overflow-hidden bg-muted/5">
               <button 
                  onClick={() => toggleSection('history')}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
               >
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                     <History size={14} />
                     <span>Evaluation History</span>
                     <span className="ml-1 px-2 py-0.5 rounded-full bg-muted text-[10px]">{history.length} Previous</span>
                  </div>
                  <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${expandedSections.history ? '' : '-rotate-90'}`} />
               </button>
               <AnimatePresence>
                  {expandedSections.history && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                     >
                        <div className="p-4 pt-0 space-y-2">
                           {/* Current Snapshot indicator */}
                           {screening && (
                              <button 
                                 onClick={() => setSelectedSnapshotId(screening?.id ?? null)}
                                 className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between ${selectedSnapshotId === screening.id ? 'bg-primary/10 border-primary ring-2 ring-primary/20' : 'bg-background/50 border-border/30 hover:bg-muted/30'}`}
                              >
                                 <div className="flex items-center gap-3 text-left">
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                                       <CheckCircle2 size={14} />
                                    </div>
                                    <div>
                                       <div className="text-xs font-black flex items-center gap-2">Latest: {formatScore(screening.final_score, 1)}% <span className="text-[8px] bg-primary text-primary-foreground px-1 rounded">V{screening.evaluation_version}</span></div>
                                       <div className="text-[10px] text-muted-foreground font-bold">CURRENT ACTIVE VERSION</div>
                                    </div>
                                 </div>
                                 {selectedSnapshotId === screening.id && <ChevronRight size={14} className="text-primary" />}
                              </button>
                           )}

                           <div className="h-px bg-border/20 my-2" />

                           {history.map((entry: ScreeningHistoryEntry, idx: number) => (
                              <button 
                                 key={entry.id ?? idx} 
                                 onClick={() => setSelectedSnapshotId(entry.id ?? null)}
                                 className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between ${selectedSnapshotId === entry.id ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20' : 'bg-background/50 border-border/30 hover:bg-muted/30'}`}
                              >
                                 <div className="flex items-center gap-3 text-left">
                                    <div className={`p-1.5 rounded-lg ${entry.status === 'passed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                                       {entry.status === 'passed' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                    </div>
                                    <div>
                                       <div className="text-xs font-black flex items-center gap-2 tracking-tight">
                                          Score: {formatScore(entry.final_score, 1)}%
                                          <span className="text-[9px] font-bold text-muted-foreground uppercase px-1.5 py-0.5 rounded-md bg-muted">v{entry.evaluation_version}</span>
                                       </div>
                                       <div className="text-[9px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                                          <Clock size={10} /> {new Date(entry.screened_at).toLocaleDateString()}
                                          <span className="opacity-30">•</span>
                                          <span className="flex items-center gap-1"><Archive size={10} /> {(entry.archive_reason || '').replace('_', ' ')}</span>
                                       </div>
                                    </div>
                                 </div>
                                 {selectedSnapshotId === entry.id && <ChevronRight size={14} className="text-amber-500" />}
                              </button>
                           ))}
                           <p className="text-[10px] text-center text-muted-foreground italic font-medium pt-2 border-t border-border/20">
                              History tracking started from the latest system update.
                           </p>
                        </div>
                     </motion.div>
                )}
             </AnimatePresence>
          </section>
          )}

          {/* Existing AiEvaluation fields */}
          {evalData && (
            <>
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
 
           {/* Scoring Breakdown (Standardized) */}
           {fullSnapshot?.scoring_breakdown && (
           <section className="border border-border/50 rounded-2xl overflow-hidden bg-muted/5">
              <button 
                 onClick={() => toggleSection('breakdown')}
                 className="w-full flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
              >
                 <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                    <Brain size={14} />
                    <span>Scoring Detail Breakdown</span>
                 </div>
                 <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-300 ${expandedSections.breakdown ? '' : '-rotate-90'}`} />
              </button>
              <AnimatePresence>
                 {expandedSections.breakdown && (
                    <motion.div 
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: 'auto', opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="overflow-hidden"
                    >
                       <div className="p-4 pt-0 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {/* AI Side */}
                             <div className="space-y-3">
                                <p className="text-[9px] font-black uppercase text-muted-foreground border-b border-border/30 pb-1">AI Intuition</p>
                                {fullSnapshot.scoring_breakdown.ai ? (
                                   Object.entries(fullSnapshot.scoring_breakdown.ai).map(([k, v]) => (
                                      <div key={k} className="space-y-1.5">
                                         <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold opacity-70 uppercase tracking-tighter">{k.replace(/_/g, ' ')}</span>
                                            <span className="font-black text-primary">{typeof v !== 'object' ? String(v) : null}</span>
                                         </div>
                                         {typeof v === 'object' && v !== null && (
                                            <div className="space-y-2 pl-2 border-l border-primary/10">
                                               {Object.entries(v).map(([subK, subV]) => (
                                                  <div key={subK} className="space-y-1">
                                                     <div className="flex justify-between text-[9px]">
                                                        <span className="opacity-60">{subK.replace(/_/g, ' ')}</span>
                                                        <span className="font-bold">{typeof subV === 'number' ? `${(subV * 100).toFixed(0)}%` : String(subV)}</span>
                                                     </div>
                                                     {typeof subV === 'number' && (
                                                        <div className="h-1 w-full bg-primary/5 rounded-full overflow-hidden">
                                                           <div className="h-full bg-primary/60" style={{ width: `${subV * 100}%` }} />
                                                        </div>
                                                     )}
                                                  </div>
                                               ))}
                                            </div>
                                         )}
                                      </div>
                                   ))
                                ) : <span className="text-[10px] italic text-muted-foreground">No data</span>}
                             </div>

                             {/* Rule Side */}
                             <div className="space-y-3">
                                <p className="text-[9px] font-black uppercase text-muted-foreground border-b border-border/30 pb-1">Rule Enforcement</p>
                                {fullSnapshot.scoring_breakdown.rule ? (
                                   Object.entries(fullSnapshot.scoring_breakdown.rule).map(([k, v]) => (
                                      <div key={k} className="space-y-2">
                                         <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold opacity-70 uppercase tracking-tighter">{k.replace(/_/g, ' ')}</span>
                                            <span className="font-black text-amber-600">{typeof v !== 'object' ? String(v) : null}</span>
                                         </div>
                                         {k === 'rule_adjustments' && typeof v === 'object' && v !== null && (
                                            <div className="flex flex-wrap gap-1.5">
                                               {Object.entries(v).map(([rule, val]: [string, any]) => (
                                                  <div key={rule} className={`px-2 py-0.5 rounded-lg text-[8px] font-black border ${val < 0 ? "bg-red-500/5 text-red-600 border-red-500/10" : "bg-green-500/5 text-green-600 border-green-500/10"}`}>
                                                     {rule.replace(/_/g, ' ')} {val > 0 ? '+' : ''}{val}
                                                  </div>
                                               ))}
                                            </div>
                                         )}
                                      </div>
                                   ))
                                ) : <span className="text-[10px] italic text-muted-foreground">No data</span>}
                             </div>
                          </div>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </section>
           )}

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
          {interviewQuestions.length > 0 && (
          <section className="border border-border/50 rounded-2xl overflow-hidden bg-muted/5">
             <button 
                onClick={() => toggleSection('questions')}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/10 transition-colors"
             >
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-violet-600">
                   <MessageSquare size={14} />
                   <span>Tailored Interview Questions ({selectedSnapshotId === screening?.id ? "Latest" : "Archived"})</span>
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
                         {(interviewQuestions.length > 0 ? interviewQuestions : evalData.interview_questions)?.map((q: string, i: number) => (
                            <div key={i} className="flex gap-4 p-4 rounded-xl bg-background/50 border border-border/30 hover:bg-muted/20 transition-all group">
                               <span className="size-6 shrink-0 bg-violet-100 text-violet-700 text-[10px] font-black rounded-lg flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                  {i+1}
                               </span>
                               <p className="text-sm font-medium leading-relaxed">{q}</p>
                            </div>
                         ))}
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </section>
          )}
            </>
          )}

          {/* AI Audit Section (Transparency) */}
          {currentSnapshot && (
            <section className="border border-border/50 rounded-2xl overflow-hidden bg-zinc-950">
               <button 
                  onClick={() => toggleSection('rawLogic')}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
               >
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                     <FileSearch size={14} />
                     <span>AI Audit (Raw LLM Response - V{currentSnapshot.evaluation_version})</span>
                  </div>
                  <ChevronDown size={16} className={`text-zinc-500 transition-transform duration-300 ${expandedSections.rawLogic ? '' : '-rotate-90'}`} />
               </button>
               <AnimatePresence>
                  {expandedSections.rawLogic && (
                     <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                     >
                        <div className="p-4 pt-0">
                           <pre className="p-4 rounded-xl bg-black text-zinc-500 text-[10px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-48">
                             {rawLlmResponse || "No raw logic stored for this version."}
                           </pre>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </section>
          )}

          {/* Clustering & Meta */}
          <section className="flex flex-wrap gap-4 items-center justify-between pt-4 border-t border-border/50">
             <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-sm">
                   <Layers size={14} className="text-blue-400" />
                   <span className="text-[10px] font-black uppercase">Cluster #{evalData?.cluster_id || "N/A"}</span>
                </div>
                {evalData?.ai_rank && (
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
        <div className="p-6 border-t border-border bg-muted/20 flex justify-between items-center">
           <Button 
              onClick={handleToggleShortlist} 
              disabled={isToggling}
              variant={isShortlisted ? "secondary" : "outline"}
              className={`rounded-xl font-bold flex items-center gap-2 ${isShortlisted ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20" : "border-amber-200 text-amber-700 hover:bg-amber-50"}`}
           >
              <Star size={16} fill={isShortlisted ? "currentColor" : "none"} />
              {isShortlisted ? "Shortlisted" : "Add to Shortlist"}
           </Button>
           <Button onClick={onClose} variant="secondary" className="rounded-xl font-bold bg-background shadow-sm hover:bg-muted">
              Close Assessment
           </Button>
        </div>
      </motion.div>
    </div>
  );
}
