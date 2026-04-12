"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchApplication,
  confirmApplication,
  inviteToInterview,
  hireApplicant,
} from "@/services/recruitmentService";
import type { Application } from "@/types/recruitment";
import { getMediaUrl } from "@/services/apiClient";
import { useToast } from "@/components/ui/toast";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  FileText,
  ExternalLink,
  Brain,
  CheckCircle2,
  XCircle,
  Clock,
  Briefcase,
  MapPin,
  Download,
  MoreVertical,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const applicationId = Number(params.id);

  const [app, setApp] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "resume" | "ai">("overview");

  const loadApplication = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchApplication(applicationId);
      setApp(data);
    } catch (error) {
      console.error("Failed to load application:", error);
      toast("Failed to load application details", "error");
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, toast]);

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId, loadApplication]);

  const handleAction = async (action: "confirm" | "invite" | "hire") => {
    if (!app) return;
    try {
      if (action === "confirm") await confirmApplication(app.application_id);
      else if (action === "invite") await inviteToInterview(app.application_id);
      else if (action === "hire") await hireApplicant(app.application_id);
      
      toast(`Successfully updated status: ${action}`, "success");
      loadApplication();
    } catch (error: any) {
      toast(`Action failed: ${error.message}`, "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Fetching Candidate Intel...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <XCircle className="size-16 text-red-500/50" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black">Application Not Found</h2>
          <p className="text-muted-foreground">The application you are looking for does not exist or has been removed.</p>
        </div>
        <Link href="/recruitment/applications">
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="size-4 mr-2" /> Back to Applications
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hired": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "shortlisted": return "bg-violet-500/10 text-violet-600 border-violet-500/20";
      case "rejected": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "interview_invited": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default: return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Navigation Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <Link 
            href="/recruitment/applications" 
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-3 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="size-20 rounded-[2rem] bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20">
                {app.full_name?.charAt(0) || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 size-8 rounded-full bg-background border-4 border-background flex items-center justify-center shadow-lg">
                 <ShieldCheck className="size-4 text-emerald-500" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tighter uppercase">{app.full_name}</h1>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(app.status)} shadow-sm`}>
                  {app.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="size-4 text-primary" /> {app.position.title}
                </span>
                <span className="opacity-30">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4 text-primary" /> Applied {new Date(app.submitted_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
            <Button 
              variant="outline" 
              className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-xs border-2 hover:bg-muted transition-all active:scale-95"
              onClick={() => handleAction("confirm")}
            >
              Shortlist
            </Button>
            <Button 
              className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
              onClick={() => handleAction("invite")}
            >
              Invite to Interview
            </Button>
            <button className="p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-all">
              <MoreVertical size={20} className="text-muted-foreground" />
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Sidebar: Contact & Quick Info */}
        <aside className="lg:col-span-4 space-y-8">
          <Card className="p-8 rounded-[2.5rem] border-none bg-muted/20 shadow-none space-y-8">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Mail size={14} /> Contact Information
              </h3>
              <div className="space-y-4">
                <div className="group flex items-center gap-4 p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all cursor-pointer">
                  <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Mail size={18} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-0.5">Email Address</p>
                    <p className="font-bold truncate">{app.email}</p>
                  </div>
                </div>
                <div className="group flex items-center gap-4 p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/30 transition-all cursor-pointer">
                  <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-0.5">Phone Number</p>
                    <p className="font-bold">{app.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <FileText size={14} /> Documents
              </h3>
              <div className="space-y-3">
                <a
                  href={getMediaUrl(app.cv_path)}
                  target="_blank"
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-background border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-red-500" />
                    <span className="font-bold text-sm">Main Resume / CV</span>
                  </div>
                  <Download className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
                
                {app.screening_result && (
                  <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">AI MATCH SCORE</span>
                       <span className="text-xl font-black text-emerald-600">{(app.screening_result.final_score || 0).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-emerald-500/10 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${app.screening_result.final_score}%` }}
                         className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                       />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* HR Notes / Tags Placeholder */}
          <Card className="p-8 rounded-[2.5rem] border-none bg-primary/5 shadow-none space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Internal Notes</h3>
             <p className="text-sm font-medium italic text-muted-foreground/80 leading-relaxed">
               {app.applicant_note || "No internal notes have been added for this candidate yet."}
             </p>
             <Button variant="ghost" className="w-full justify-start p-0 h-auto text-[10px] font-black uppercase tracking-widest text-primary hover:bg-transparent hover:underline">
               + Add Note
             </Button>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-8 space-y-8">
          {/* Tabs */}
          <div className="flex items-center p-1.5 bg-muted/30 rounded-2xl w-fit">
            {(["overview", "resume", "ai"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? "bg-background text-primary shadow-lg shadow-black/5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="min-h-[500px]"
            >
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* AI Summary Section */}
                  {(app.evaluation?.summary || app.screening_result?.explanation) && (
                    <section className="p-8 rounded-[2.5rem] bg-gradient-to-br from-violet-600/5 to-primary/5 border border-primary/10 space-y-4">
                       <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-violet-600">
                          <Brain size={16} /> AI Snapshot Analysis
                       </div>
                       <p className="text-lg font-bold leading-relaxed tracking-tight">
                         "{app.evaluation?.summary || app.screening_result?.explanation}"
                       </p>
                       <div className="flex flex-wrap gap-2 pt-2">
                          {app.screening_result?.key_strengths.slice(0, 3).map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-700 text-[10px] font-black uppercase rounded-lg border border-emerald-500/10">
                              + {s}
                            </span>
                          ))}
                       </div>
                    </section>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Skills Breakdown */}
                    <Card className="p-8 rounded-[2.5rem] border border-border/50 space-y-6 shadow-sm">
                       <h3 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                          <Sparkles size={14} className="text-amber-500" /> Key Skill Match
                       </h3>
                       <div className="flex flex-wrap gap-2">
                          {(app.evaluation?.skill_gaps?.matched_skills || app.evaluation?.matched_keywords)?.map((skill) => (
                            <span key={skill} className="px-4 py-2 bg-muted/50 text-foreground text-xs font-bold rounded-xl border border-border">
                              {skill}
                            </span>
                          ))}
                          {!(app.evaluation?.skill_gaps?.matched_skills?.length) && (
                            <p className="text-sm text-muted-foreground italic">No skill match data found.</p>
                          )}
                       </div>
                    </Card>

                    {/* Missing Skills / Gaps */}
                    <Card className="p-8 rounded-[2.5rem] border border-border/50 space-y-6 shadow-sm">
                       <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                          <AlertTriangle size={14} /> Identified Gaps
                       </h3>
                       <div className="space-y-3">
                          {(app.evaluation?.skill_gaps?.missing_skills || app.evaluation?.missing_keywords)?.map((gap) => (
                            <div key={gap} className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                               <div className="size-1.5 rounded-full bg-red-400" />
                               {gap}
                            </div>
                          ))}
                       </div>
                    </Card>
                  </div>

                  {/* Interview Questions */}
                  {app.evaluation?.interview_questions && (
                    <section className="space-y-6">
                       <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <MessageSquare size={14} /> Suggested Questions
                       </h3>
                       <div className="grid gap-4">
                         {app.evaluation.interview_questions.map((q, i) => (
                           <div key={i} className="group p-5 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 transition-all flex gap-4">
                              <span className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                {i + 1}
                              </span>
                              <p className="font-bold text-base leading-relaxed">{q}</p>
                           </div>
                         ))}
                       </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === "resume" && (
                <Card className="rounded-[2.5rem] border border-border/50 overflow-hidden shadow-sm">
                  <div className="bg-muted/10 p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="size-5 text-primary" />
                      <h3 className="text-xs font-black uppercase tracking-widest">Resume Extraction</h3>
                    </div>
                    <Button variant="ghost" className="h-8 text-[10px] font-black uppercase tracking-widest" onClick={() => window.open(getMediaUrl(app.cv_path))}>
                      View Original <ExternalLink className="size-3 ml-2" />
                    </Button>
                  </div>
                  <div className="p-10">
                    {app.extracted_resume ? (
                      <div className="prose prose-sm max-w-none prose-headings:font-black prose-p:font-medium prose-p:text-muted-foreground">
                         <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed opacity-80">
                            {typeof app.extracted_resume === 'string' 
                              ? app.extracted_resume 
                              : app.extracted_resume.raw_llm_response}
                         </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <Loader2 className="size-10 text-primary/30 animate-spin" />
                        <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Processing resume content via AI...</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {activeTab === "ai" && (
                <div className="space-y-8">
                   {app.screening_result ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Card className="p-8 rounded-[2.5rem] border-none bg-zinc-950 text-white space-y-6">
                         <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Raw AI Logic Trace</h3>
                         <pre className="text-[10px] font-mono leading-relaxed text-zinc-400 whitespace-pre-wrap max-h-[400px] overflow-auto custom-scrollbar">
                           {app.screening_result.raw_llm_response}
                         </pre>
                       </Card>

                       <Card className="p-8 rounded-[2.5rem] border border-border/50 space-y-8">
                          <div className="space-y-4">
                             <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <ShieldCheck size={14} /> Full Evaluation
                             </h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-muted/20 border border-border/30">
                                   <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Rule Score</p>
                                   <p className="text-xl font-black">{app.screening_result.rule_score}%</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                   <p className="text-[9px] font-black uppercase text-primary mb-1">AI Intuition</p>
                                   <p className="text-xl font-black text-primary">{app.screening_result.ai_score}%</p>
                                </div>
                             </div>
                             
                             <div className="pt-4 space-y-4">
                                <div className="space-y-2">
                                   <p className="text-[10px] font-black uppercase text-foreground">Scoring Explanation</p>
                                   <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                     {app.screening_result.explanation}
                                   </p>
                                </div>
                             </div>
                          </div>
                       </Card>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-32 bg-muted/10 rounded-[3rem] border border-dashed border-border/50 text-center">
                        <Brain className="size-16 text-muted-foreground/30 mb-6" />
                        <h3 className="text-2xl font-black uppercase tracking-widest">No AI screening data</h3>
                        <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                          This applicant has not been processed by the AI screening pipeline yet.
                        </p>
                     </div>
                   )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function Loader2({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${className}`}
      {...props}
    >
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </svg>
  );
}
