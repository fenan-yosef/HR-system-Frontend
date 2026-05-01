"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchApplication,
  confirmApplication,
  inviteToInterview,
  hireApplicant,
  updateApplication,
  softDeleteScreeningResult,
  restoreScreeningResult,
  softDeleteScreeningHistory,
  restoreScreeningHistory,
  toggleShortlist,
} from "@/services/recruitmentService";
import type { Application } from "@/types/recruitment";
import { getMediaUrl } from "@/services/apiClient";
import { formatScore } from "@/lib/utils";
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
  Sparkles,
  Star,
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
  const [resumeView, setResumeView] = useState<'ui' | 'formatted' | 'raw'>('ui');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'other' | null>(null);
  const [actionBusyKey, setActionBusyKey] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const loadApplication = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchApplication(applicationId, { includeHistory: true, includeDeleted: true });
      setApp(data);
    } catch (error) {
      console.error("Failed to load application:", error);
      toast("Failed to load application details", "error");
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, toast]);

  const closePreview = useCallback(() => {
    setPreviewUrl(null);
    setPreviewName(null);
    setPreviewType(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreview();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closePreview]);

  const openPreview = (url: string, name?: string) => {
    if (!url) return;
    setPreviewUrl(url);
    setPreviewName(name || url.split("/").pop() || "file");
    const ext = (url.split(".").pop() || "").toLowerCase();
    if (ext === "pdf") setPreviewType('pdf');
    else if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) setPreviewType('image');
    else setPreviewType('other');
  };

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId, loadApplication]);

  useEffect(() => {
    if (app) {
      setNote(app.applicant_note || "");
    }
  }, [app]);

  const handleSaveNote = async () => {
    if (!app) return;
    try {
      setIsSavingNote(true);
      await updateApplication(app.application_id, { applicant_note: note });
      toast("Note saved successfully", "success");
      setIsEditingNote(false);
      loadApplication();
    } catch (error: any) {
      toast(`Failed to save note: ${error.message}`, "error");
    } finally {
      setIsSavingNote(false);
    }
  };

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

  const handleToggleShortlist = async () => {
    if (!app) return;
    try {
      setActionBusyKey("shortlist");
      const res = await toggleShortlist(app.application_id);
      setApp((prev) => prev ? { ...prev, is_shortlisted: res.shortlisted } : null);
      toast(res.shortlisted ? "Added to shortlist" : "Removed from shortlist", "success");
    } catch (error: any) {
      toast(`Action failed: ${error.message}`, "error");
    } finally {
      setActionBusyKey(null);
    }
  };

  const handleArchiveLiveResult = async () => {
    if (!app?.screening_result?.id) {
      toast("No active screening result ID was returned by the API.", "warning");
      return;
    }

    const confirmed = window.confirm("Move this evaluation to archive? This can be restored by HR.");
    if (!confirmed) return;

    const reason = window.prompt("Optional archive reason", "manual_archive") || undefined;
    try {
      setActionBusyKey("live-archive");
      await softDeleteScreeningResult(app.screening_result.id, reason?.trim() || undefined);
      toast("Evaluation moved to archive.", "success");
      await loadApplication();
    } catch (error: any) {
      toast(`Failed to archive evaluation: ${error.message || "Unknown error"}`, "error");
    } finally {
      setActionBusyKey(null);
    }
  };

  const handleRestoreLiveResult = async () => {
    if (!app?.screening_result?.id) {
      toast("No screening result ID was returned by the API.", "warning");
      return;
    }

    try {
      setActionBusyKey("live-restore");
      await restoreScreeningResult(app.screening_result.id);
      toast("Evaluation restored.", "success");
      await loadApplication();
    } catch (error: any) {
      toast(`Failed to restore evaluation: ${error.message || "Unknown error"}`, "error");
    } finally {
      setActionBusyKey(null);
    }
  };

  const handleArchiveHistoryEntry = async (historyId: number) => {
    const confirmed = window.confirm("Hide this archived history entry? You can restore it later from Archived evaluations.");
    if (!confirmed) return;

    const reason = window.prompt("Optional reason", "manual_cleanup") || undefined;
    try {
      setActionBusyKey(`history-archive-${historyId}`);
      await softDeleteScreeningHistory(historyId, reason?.trim() || undefined);
      toast("History entry archived.", "success");
      await loadApplication();
    } catch (error: any) {
      toast(`Failed to archive history entry: ${error.message || "Unknown error"}`, "error");
    } finally {
      setActionBusyKey(null);
    }
  };

  const handleRestoreHistoryEntry = async (historyId: number) => {
    try {
      setActionBusyKey(`history-restore-${historyId}`);
      await restoreScreeningHistory(historyId);
      toast("History entry restored.", "success");
      await loadApplication();
    } catch (error: any) {
      toast(`Failed to restore history entry: ${error.message || "Unknown error"}`, "error");
    } finally {
      setActionBusyKey(null);
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

  function formatBytes(bytes?: number) {
    if (!bytes || bytes <= 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
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

  const historyEntries = [...(app.screening_history || [])].sort((a, b) => {
    const aTs = new Date(a.archived_at || a.screened_at || 0).getTime();
    const bTs = new Date(b.archived_at || b.screened_at || 0).getTime();
    return bTs - aTs;
  });
  const visibleHistory = historyEntries.filter((entry) => !entry.is_deleted);
  const archivedHistory = historyEntries.filter((entry) => !!entry.is_deleted);

  const parsedExtractedResume = (() => {
    if (!app?.extracted_resume) return null;
    try {
      if (typeof app.extracted_resume === 'string') {
        return JSON.parse(app.extracted_resume);
      }
      if ((app.extracted_resume as any).extracted_json) return (app.extracted_resume as any).extracted_json;
      if ((app.extracted_resume as any).raw_llm_response) return JSON.parse((app.extracted_resume as any).raw_llm_response);
    } catch (e) {
      return null;
    }
    return null;
  })();

  const rawExtractedText = typeof app?.extracted_resume === 'string' ? app.extracted_resume : app?.extracted_resume?.raw_llm_response || '';

  const interviewQuestions = Array.from(new Set([
    ...(app.evaluation?.interview_questions || []),
    ...(app.screening_result?.scoring_breakdown?.interview_questions || [])
  ])).filter(Boolean);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard", "success");
  };

  function JsonPrettyView({ data, depth = 0 }: any) {
    if (data === null || data === undefined) return <div className="text-sm text-muted-foreground">—</div>;
    if (typeof data !== 'object') {
      return <div className="text-sm font-medium">{String(data)}</div>;
    }
    if (Array.isArray(data)) {
      return (
        <div className="space-y-2" style={{ marginLeft: depth * 8 }}>
          {data.map((item: any, i: number) => (
            <div key={i} className="p-3 rounded-lg bg-background border border-border/20">
              <JsonPrettyView data={item} depth={depth + 1} />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="p-3 rounded-2xl bg-muted/5 border border-border/20">
            <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">{k}</div>
            <JsonPrettyView data={v} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

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
              className={`h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-xs border-2 transition-all active:scale-95 flex items-center gap-2 ${
                app.is_shortlisted 
                  ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600" 
                  : "hover:bg-muted"
              }`}
              onClick={handleToggleShortlist}
              disabled={actionBusyKey === "shortlist"}
            >
              <Star size={16} fill={app.is_shortlisted ? "currentColor" : "none"} />
              {app.is_shortlisted ? "Shortlisted" : "Shortlist"}
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
                {/* Prefer applicant.documents if provided by API */}
                {((app as any)?.applicant?.documents && (app as any).applicant.documents.length > 0) ? (
                  (app as any).applicant.documents.map((doc: any) => {
                    const url = doc.file_url || getMediaUrl(doc.file_path);
                    return (
                      <div
                        key={doc.upload_id || doc.file_path}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="size-5 text-red-500" />
                          <div className="text-left flex-1 min-w-0 overflow-hidden">
                            <div className="font-bold text-sm truncate">{doc.original_name}</div>
                            <div className="text-[11px] text-muted-foreground truncate">{doc.document_type} • {formatBytes(doc.size_bytes)} • {new Date(doc.uploaded_at).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => openPreview(url, doc.original_name)} className="text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-muted/10 hover:bg-muted/20">Preview</button>
                          <a href={url} target="_blank" rel="noreferrer" className="text-muted-foreground group-hover:text-primary transition-colors"><Download className="size-4" /></a>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="w-full flex items-center justify-between p-4 rounded-2xl bg-background border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="size-5 text-red-500" />
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <span className="font-bold text-sm truncate">Main Resume / CV</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => openPreview(getMediaUrl(app.cv_path), 'Resume')} className="text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-muted/10 hover:bg-muted/20">Preview</button>
                        <a href={getMediaUrl(app.cv_path)} target="_blank" rel="noreferrer" className="text-muted-foreground group-hover:text-primary transition-colors"><Download className="size-4" /></a>
                      </div>
                    </div>
                    {app.certificate_paths && app.certificate_paths.map((p, i) => (
                      <div key={`cert-${i}`} className="w-full flex items-center justify-between p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="size-5 text-amber-500" />
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <span className="font-bold text-sm truncate">Certificate #{i+1}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => openPreview(getMediaUrl(p), `Certificate #${i+1}`)} className="text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg bg-muted/10 hover:bg-muted/20">Preview</button>
                          <a href={getMediaUrl(p)} target="_blank" rel="noreferrer" className="text-muted-foreground group-hover:text-primary transition-colors"><Download className="size-4" /></a>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Compact AI match summary in the documents area for quick glance */}
                {app.screening_result && (
                  <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">AI MATCH SCORE</span>
                         <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">V{app.screening_result.evaluation_version}</span>
                       </div>
                       <span className="text-2xl font-black text-emerald-600">{Number(app.screening_result.final_score || 0).toFixed(0)}%</span>

                    </div>
                    <div className="h-2 bg-emerald-500/10 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Number(app.screening_result.final_score || 0)}%` }}
                         className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                       />
                    </div>
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest pt-2">
                      <div className="flex items-center gap-2"><span className="text-muted-foreground">Rule</span><span className="font-black">{Number(app.screening_result.rule_score || 0).toFixed(0)}%</span></div>
                      <div className="flex items-center gap-2"><span className="text-muted-foreground">AI</span><span className="font-black">{Number(app.screening_result.ai_score || 0).toFixed(0)}%</span></div>
                      <div className="flex items-center gap-2"><span className="text-muted-foreground">Status</span><span className="font-black">{app.screening_result.status}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* HR Notes / Tags Placeholder */}
          <Card className="p-8 rounded-[2.5rem] border-none bg-primary/5 shadow-none space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Internal Notes</h3>
             {isEditingNote ? (
               <div className="space-y-4">
                 <textarea
                   className="w-full h-32 p-4 rounded-2xl bg-background border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium resize-none"
                   placeholder="Add internal notes about this candidate..."
                   value={note}
                   onChange={(e) => setNote(e.target.value)}
                   autoFocus
                 />
                 <div className="flex items-center gap-2">
                   <Button 
                     size="sm" 
                     className="rounded-xl px-4 font-black uppercase tracking-widest text-[10px]"
                     onClick={handleSaveNote}
                     disabled={isSavingNote}
                   >
                     {isSavingNote ? "Saving..." : "Save Note"}
                   </Button>
                   <Button 
                     size="sm" 
                     variant="ghost" 
                     className="rounded-xl px-4 font-black uppercase tracking-widest text-[10px]"
                     onClick={() => {
                       setIsEditingNote(false);
                       setNote(app.applicant_note || "");
                     }}
                   >
                     Cancel
                   </Button>
                 </div>
               </div>
             ) : (
               <>
                 <p className="text-sm font-medium italic text-muted-foreground/80 leading-relaxed">
                   {app.applicant_note || "No internal notes have been added for this candidate yet."}
                 </p>
                 <Button 
                   variant="ghost" 
                   className="w-full justify-start p-0 h-auto text-[10px] font-black uppercase tracking-widest text-primary hover:bg-transparent hover:underline"
                   onClick={() => setIsEditingNote(true)}
                 >
                   {app.applicant_note ? "Edit Note" : "+ Add Note"}
                 </Button>
               </>
             )}
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

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="p-4 rounded-2xl bg-background/50 border border-border/30">
                               <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Weighted Total</p>
                               <div className="flex items-baseline gap-3">
                                 <span className="text-3xl font-black">{app.screening_result ? Number(app.screening_result.final_score || 0).toFixed(0) : (app.evaluation?.matching_percentage || 0)}%</span>
                                 <span className="text-xs font-bold text-muted-foreground">V{app.screening_result?.evaluation_version || ''}</span>
                               </div>
                               <p className="text-xs text-muted-foreground mt-2">{app.screening_result?.status?.toUpperCase()}</p>
                             </div>

                             <div className="p-4 rounded-2xl bg-background/50 border border-border/30">
                               <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Breakdown</p>
                               <div className="flex gap-4">
                                 <div>
                                   <p className="text-xs font-black text-muted-foreground">Rule</p>
                                   <p className="text-lg font-black">{app.screening_result ? Number(app.screening_result.rule_score || 0).toFixed(0) : 'N/A'}%</p>
                                 </div>
                                 <div>
                                   <p className="text-xs font-black text-muted-foreground">AI</p>
                                   <p className="text-lg font-black text-primary">{app.screening_result ? Number(app.screening_result.ai_score || 0).toFixed(0) : 'N/A'}%</p>
                                 </div>
                               </div>
                               <p className="text-xs text-muted-foreground mt-3">Model: {app.screening_result?.screening_model || '—'}</p>
                             </div>

                             <div className="p-4 rounded-2xl bg-background/50 border border-border/30">
                               <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Meta</p>
                               <p className="text-sm font-black">Recommendation: <span className="font-bold">{(app.screening_result?.scoring_breakdown?.recommendation || '').toUpperCase() || (app.evaluation?.fit_label || '—')}</span></p>
                               <p className="text-xs text-muted-foreground mt-2">Screened: {app.screening_result?.screened_at ? new Date(app.screening_result.screened_at).toLocaleString() : '—'}</p>
                             </div>
                           </div>

                           <p className="text-lg font-bold leading-relaxed tracking-tight mt-4">
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
                  {interviewQuestions.length > 0 && (
                    <section className="space-y-6">
                       <div className="flex items-center justify-between">
                         <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <MessageSquare size={14} /> Suggested Interview Questions
                         </h3>
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                           {interviewQuestions.length} AI Prompts
                         </span>
                       </div>
                       <div className="grid gap-4">
                         {interviewQuestions.map((q, i) => (
                           <div 
                             key={i} 
                             onClick={() => copyToClipboard(q)}
                             className="group p-5 rounded-[2rem] bg-background border border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all flex gap-5 cursor-pointer relative overflow-hidden"
                           >
                              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Sparkles size={14} className="text-primary animate-pulse" />
                              </div>
                              <span className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                {i + 1}
                              </span>
                              <div className="space-y-1 pr-8">
                                <p className="font-bold text-base leading-relaxed text-foreground/90 group-hover:text-foreground transition-colors">{q}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-primary/60 transition-colors">Click to copy to clipboard</p>
                              </div>
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
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-background p-1 flex items-center gap-1 border border-border/30">
                        <button onClick={() => setResumeView('ui')} className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded ${resumeView === 'ui' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/10'}`}>
                          Beautiful UI
                        </button>
                        <button onClick={() => setResumeView('formatted')} className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded ${resumeView === 'formatted' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/10'}`}>
                          Formatted JSON
                        </button>
                        <button onClick={() => setResumeView('raw')} className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded ${resumeView === 'raw' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/10'}`}>
                          Raw
                        </button>
                      </div>
                      <Button variant="ghost" className="h-8 text-[10px] font-black uppercase tracking-widest" onClick={() => openPreview(getMediaUrl(app.cv_path), 'Resume')}>
                        View Original <ExternalLink className="size-3 ml-2" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-10">
                    {app.extracted_resume ? (
                      <>
                        {resumeView === 'raw' && (
                          <div className="prose prose-sm max-w-none prose-headings:font-black prose-p:font-medium prose-p:text-muted-foreground">
                            <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed opacity-80">
                              {rawExtractedText || (typeof app.extracted_resume === 'string' ? app.extracted_resume : (app.extracted_resume as any).raw_llm_response)}
                            </div>
                          </div>
                        )}

                        {resumeView === 'formatted' && (
                          <pre className="text-[12px] font-mono leading-relaxed max-h-[500px] overflow-auto custom-scrollbar p-4 bg-background border border-border rounded-lg whitespace-pre-wrap">
                            {parsedExtractedResume ? JSON.stringify(parsedExtractedResume, null, 2) : (rawExtractedText || (typeof app.extracted_resume === 'string' ? app.extracted_resume : (app.extracted_resume as any).raw_llm_response))}
                          </pre>
                        )}

                        {resumeView === 'ui' && (
                          <div className="space-y-4">
                            {parsedExtractedResume ? (
                              <JsonPrettyView data={parsedExtractedResume} />
                            ) : (
                              <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed opacity-80">
                                {rawExtractedText || (typeof app.extracted_resume === 'string' ? app.extracted_resume : (app.extracted_resume as any).raw_llm_response)}
                              </div>
                            )}
                          </div>
                        )}
                      </>
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
                     <>
                       <div className="flex items-center gap-3 justify-end">
                         {app.screening_result.is_deleted ? (
                           <Button
                             variant="outline"
                             onClick={handleRestoreLiveResult}
                             disabled={actionBusyKey === "live-restore"}
                             className="rounded-xl font-black uppercase tracking-widest text-[10px]"
                           >
                             {actionBusyKey === "live-restore" ? "Restoring..." : "Restore Live Evaluation"}
                           </Button>
                         ) : (
                           <Button
                             variant="outline"
                             onClick={handleArchiveLiveResult}
                             disabled={actionBusyKey === "live-archive"}
                             className="rounded-xl font-black uppercase tracking-widest text-[10px]"
                           >
                             {actionBusyKey === "live-archive" ? "Archiving..." : "Move To Archive"}
                           </Button>
                         )}
                       </div>

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
                               <div className="grid grid-cols-1 gap-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/30">
                                       <p className="text-[9px] font-black uppercase text-muted-foreground mb-1">Rule Score</p>
                                       <p className="text-xl font-black">{formatScore(app.screening_result.rule_score, 0)}%</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                       <p className="text-[9px] font-black uppercase text-primary mb-1">AI Intuition</p>
                                       <p className="text-xl font-black text-primary">{formatScore(app.screening_result.ai_score, 0)}%</p>
                                    </div>
                                  </div>

                                  <div className="p-4 rounded-2xl bg-background/50 border border-border/30">
                                     <p className="text-[10px] font-black uppercase text-foreground">Scoring Explanation</p>
                                     <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                                       {app.screening_result.explanation}
                                     </p>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-muted/10 border border-border/30">
                                      <p className="text-[10px] font-black uppercase text-muted-foreground mb-4">AI Insight Breakdown</p>
                                      {app.screening_result.scoring_breakdown?.ai ? (
                                        <div className="space-y-4">
                                          {Object.entries(app.screening_result.scoring_breakdown.ai).map(([k, v]) => (
                                            <div key={k} className="space-y-2">
                                              <div className="flex items-center justify-between">
                                                <div className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{k.replace(/_/g, ' ')}</div>
                                                <div className="font-black text-sm text-primary">
                                                  {typeof v !== 'object' ? String(v) : null}
                                                </div>
                                              </div>
                                              
                                              {typeof v === 'object' && v !== null && (
                                                <div className="space-y-1.5">
                                                  {Object.entries(v).map(([subK, subV]) => (
                                                    <div key={subK} className="flex flex-col gap-1">
                                                      <div className="flex justify-between text-[10px]">
                                                        <span className="font-bold opacity-70">{subK.replace(/_/g, ' ')}</span>
                                                        <span className="font-black text-primary">{typeof subV === 'number' ? `${(subV * 100).toFixed(0)}%` : String(subV)}</span>
                                                      </div>
                                                      {typeof subV === 'number' && (
                                                        <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                                                          <div className="h-full bg-primary" style={{ width: `${subV * 100}%` }} />
                                                        </div>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-sm text-muted-foreground">No AI breakdown available.</div>
                                      )}
                                    </div>

                                    <div className="p-4 rounded-2xl bg-muted/10 border border-border/30">
                                      <p className="text-[10px] font-black uppercase text-muted-foreground mb-4">Rule Enforcement</p>
                                      {app.screening_result.scoring_breakdown?.rule ? (
                                        <div className="space-y-4">
                                          {Object.entries(app.screening_result.scoring_breakdown.rule).map(([k, v]) => (
                                            <div key={k} className="space-y-2">
                                              <div className="flex items-center justify-between">
                                                <div className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{k.replace(/_/g, ' ')}</div>
                                                <div className="font-black text-sm text-amber-600">
                                                  {typeof v !== 'object' ? String(v) : null}
                                                </div>
                                              </div>

                                              {k === 'rule_adjustments' && typeof v === 'object' && v !== null && (
                                                <div className="flex flex-wrap gap-2">
                                                  {Object.entries(v).map(([rule, val]: [string, any]) => (
                                                    <div 
                                                      key={rule} 
                                                      className={`px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-2 border ${
                                                        val < 0 
                                                          ? "bg-red-500/10 text-red-600 border-red-500/20" 
                                                          : "bg-green-500/10 text-green-600 border-green-500/20"
                                                      }`}
                                                    >
                                                      <span className="opacity-70">{rule.replace(/_/g, ' ')}</span>
                                                      <span className="font-black">{val > 0 ? '+' : ''}{val}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}

                                              {k !== 'rule_adjustments' && typeof v === 'object' && v !== null && (
                                                <div className="bg-muted/10 rounded-xl p-3 text-[10px] font-mono text-muted-foreground/90 grid grid-cols-1 gap-y-1.5">
                                                  {Array.isArray(v) ? (
                                                    <div className="flex flex-wrap gap-1">
                                                      {v.map((item, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 rounded-md bg-background border border-border/50">{String(item)}</span>
                                                      ))}
                                                    </div>
                                                  ) : (
                                                    Object.entries(v).map(([subK, subV]) => (
                                                      <div key={subK} className="flex justify-between items-start gap-4">
                                                        <span className="opacity-70 shrink-0">{subK.replace(/_/g, ' ')}:</span>
                                                        <span className="font-bold text-right break-all">
                                                          {typeof subV === 'object' ? JSON.stringify(subV) : String(subV)}
                                                        </span>
                                                      </div>
                                                    ))
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-sm text-muted-foreground">No rule breakdown available.</div>
                                      )}
                                    </div>
                                  </div>
                                  </div>
                               </div>

                               {/* Interview Questions In AI Tab */}
                               {interviewQuestions.length > 0 && (
                                  <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-6">
                                     <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                                        <Sparkles size={16} /> Strategic Interview Prompts
                                     </div>
                                     <div className="space-y-3">
                                       {interviewQuestions.map((q, i) => (
                                         <div 
                                           key={i} 
                                           onClick={() => copyToClipboard(q)}
                                           className="p-4 rounded-2xl bg-background border border-primary/10 hover:border-primary/30 transition-all cursor-pointer group"
                                         >
                                           <div className="flex gap-4">
                                             <div className="font-black text-primary/40 text-xs mt-1">Q{i+1}</div>
                                             <p className="text-sm font-bold leading-relaxed">{q}</p>
                                           </div>
                                         </div>
                                       ))}
                                     </div>
                                  </div>
                               )}
                            </Card>
                       </div>
                     </>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-16 bg-muted/10 rounded-[3rem] border border-dashed border-border/50 text-center">
                        <Brain className="size-16 text-muted-foreground/30 mb-6" />
                        <h3 className="text-2xl font-black uppercase tracking-widest">No Active Live Evaluation</h3>
                        <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                          Live screening may be archived or not generated yet. Historical evaluations are listed below.
                        </p>
                     </div>
                   )}

                   <Card className="p-8 rounded-[2.5rem] border border-border/50 space-y-6">
                     <div className="flex items-center justify-between">
                       <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                         <Clock size={14} /> Evaluation History
                       </h3>
                       <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                         {visibleHistory.length} visible • {archivedHistory.length} archived
                       </span>
                     </div>

                     {visibleHistory.length === 0 ? (
                       <p className="text-sm text-muted-foreground">No visible historical evaluations returned.</p>
                     ) : (
                       <div className="space-y-3">
                         {visibleHistory.map((entry) => (
                           <div key={entry.id} className="p-4 rounded-2xl bg-muted/10 border border-border/40 flex items-center justify-between gap-4">
                             <div className="space-y-1">
                               <div className="text-sm font-black">
                                 Version {entry.evaluation_version} • Score {formatScore(entry.final_score, 1)}%
                               </div>
                               <div className="text-xs text-muted-foreground">
                                 {entry.status.toUpperCase()} • Screened {entry.screened_at ? new Date(entry.screened_at).toLocaleString() : "—"}
                               </div>
                               <div className="text-xs text-muted-foreground">Reason: {entry.archive_reason || "—"}</div>
                             </div>
                             <Button
                               variant="outline"
                               onClick={() => handleArchiveHistoryEntry(entry.id)}
                               disabled={actionBusyKey === `history-archive-${entry.id}`}
                               className="rounded-xl text-[10px] font-black uppercase tracking-widest"
                             >
                               {actionBusyKey === `history-archive-${entry.id}` ? "Archiving..." : "Archive Entry"}
                             </Button>
                           </div>
                         ))}
                       </div>
                     )}

                     <div className="pt-4 border-t border-border/40 space-y-3">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Archived Evaluations</h4>
                       {archivedHistory.length === 0 ? (
                         <p className="text-sm text-muted-foreground">No soft-deleted evaluations found.</p>
                       ) : (
                         archivedHistory.map((entry) => (
                           <div key={`archived-${entry.id}`} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-4">
                             <div className="space-y-1">
                               <div className="text-sm font-black">Version {entry.evaluation_version} • Score {formatScore(entry.final_score, 1)}%</div>
                               <div className="text-xs text-muted-foreground">
                                 Deleted {entry.deleted_at ? new Date(entry.deleted_at).toLocaleString() : "—"}
                               </div>
                             </div>
                             <Button
                               onClick={() => handleRestoreHistoryEntry(entry.id)}
                               disabled={actionBusyKey === `history-restore-${entry.id}`}
                               className="rounded-xl text-[10px] font-black uppercase tracking-widest"
                             >
                               {actionBusyKey === `history-restore-${entry.id}` ? "Restoring..." : "Restore"}
                             </Button>
                           </div>
                         ))
                       )}
                     </div>
                   </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        {/* Inline Preview Modal */}
        {previewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-sm truncate">{previewName}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a href={previewUrl} target="_blank" rel="noreferrer" className="text-xs font-black px-3 py-2 rounded-lg hover:underline">Open in new tab</a>
                  <a href={previewUrl} download className="text-xs font-black px-3 py-2 rounded-lg hover:underline">Download</a>
                  <button onClick={closePreview} className="text-xs font-black px-3 py-2 rounded-lg">Close</button>
                </div>
              </div>
              <div className="p-4 h-[80vh] overflow-auto flex items-center justify-center bg-background">
                {previewType === 'pdf' && (
                  <iframe src={previewUrl} title={previewName || 'document'} className="w-full h-full border-0" />
                )}
                {previewType === 'image' && (
                  <img src={previewUrl} alt={previewName || 'image'} className="max-w-full max-h-full object-contain" />
                )}
                {previewType === 'other' && (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">Preview not available for this file type.</p>
                    <a href={previewUrl} target="_blank" rel="noreferrer" className="text-primary underline">Open in new tab</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
