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
import { getExtractionRawText, parseExtractedResume } from "@/lib/recruitment/extraction";
import { formatScore } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import { canManageRecruitment } from "@/lib/permissions";
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
  const { user } = useAuth();
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
  
  const canManage = canManageRecruitment(user);

  const handleAction = async (action: "confirm" | "invite") => {
    if (!app) return;
    try {
      if (action === "confirm") await confirmApplication(app.application_id);
      else if (action === "invite") await inviteToInterview(app.application_id);
      
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

  const parsedExtractedResume = parseExtractedResume(app?.extracted_resume ?? null);

  const rawExtractedText = getExtractionRawText(app?.extracted_resume ?? null);

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
  }  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-500">
      {/* Navigation Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3">
          <Link 
            href="/recruitment/applications" 
            className="group inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="size-3 group-hover:-translate-x-0.5 transition-transform" />
            Back to Directory
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center text-primary text-xl font-semibold shadow-sm">
                {app.full_name?.charAt(0) || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-background border-2 border-background flex items-center justify-center shadow-sm">
                 <ShieldCheck className="size-3.5 text-emerald-500" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{app.full_name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                  {app.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Briefcase className="size-3.5 text-primary" /> {app.position.title}
                </span>
                <span className="opacity-30">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3.5" /> Applied {new Date(app.submitted_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          {canManage && (
            <>
              <Button 
                variant="outline" 
                className={`h-9 px-4 rounded-xl font-semibold text-xs border transition-all active:scale-98 flex items-center gap-1.5 ${
                  app.is_shortlisted 
                    ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600" 
                    : "hover:bg-muted"
                }`}
                onClick={handleToggleShortlist}
                disabled={actionBusyKey === "shortlist"}
              >
                <Star size={14} fill={app.is_shortlisted ? "currentColor" : "none"} />
                {app.is_shortlisted ? "Shortlisted" : "Shortlist"}
              </Button>
              <Button 
                className={`h-9 px-4 rounded-xl font-semibold text-xs transition-all active:scale-98 ${
                  app.status === "interview_pending" || app.status === "interview_invited"
                    ? "bg-muted text-muted-foreground cursor-not-allowed border border-transparent"
                    : "bg-primary text-white hover:opacity-90"
                }`}
                onClick={() => handleAction("invite")}
                disabled={app.status === "interview_pending" || app.status === "interview_invited"}
              >
                {app.status === "interview_pending" ? "Interview Pending" : app.status === "interview_invited" ? "Invitation Sent" : "Invite to Interview"}
              </Button>
            </>
          )}
            <button className="p-2 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted transition-all">
              <MoreVertical size={16} className="text-muted-foreground" />
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-6">
        {/* Left Sidebar: Contact & Quick Info */}
        <aside className="space-y-6">
          <Card className="p-6 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-md shadow-sm space-y-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Mail size={12} /> Contact Information
              </h3>
              <div className="space-y-2.5">
                <div className="group flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/40 hover:border-primary/20 transition-all">
                  <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Mail size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-semibold uppercase text-muted-foreground mb-0.5">Email</p>
                    <p className="text-xs font-semibold truncate text-foreground/80">{app.email}</p>
                  </div>
                </div>
                <div className="group flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/40 hover:border-primary/20 transition-all">
                  <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Phone size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-semibold uppercase text-muted-foreground mb-0.5">Phone</p>
                    <p className="text-xs font-semibold text-foreground/80">{app.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t border-border/40">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <FileText size={12} /> Documents
              </h3>
              <div className="space-y-2">
                {/* Prefer applicant.documents if provided by API */}
                {((app as any)?.applicant?.documents && (app as any).applicant.documents.length > 0) ? (
                  (app as any).applicant.documents.map((doc: any) => {
                    const url = doc.file_url || getMediaUrl(doc.file_path);
                    return (
                      <div
                        key={doc.upload_id || doc.file_path}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/40 hover:border-primary/20 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="size-4 text-red-500 shrink-0" />
                          <div className="text-left flex-1 min-w-0">
                            <div className="font-semibold text-xs truncate text-foreground">{doc.original_name}</div>
                            <div className="text-[9px] text-muted-foreground truncate">{doc.document_type} • {formatBytes(doc.size_bytes)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => openPreview(url, doc.original_name)} className="text-[9px] font-semibold uppercase tracking-wide px-2 py-1 rounded bg-muted/20 hover:bg-muted/40">Preview</button>
                          <a href={url} target="_blank" rel="noreferrer" className="text-muted-foreground group-hover:text-primary transition-colors"><Download className="size-3.5" /></a>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/40 hover:border-primary/20 hover:bg-primary/5 transition-all group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="size-4 text-red-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-xs truncate text-foreground">Main Resume / CV</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => openPreview(getMediaUrl(app.cv_path), 'Resume')} className="text-[9px] font-semibold uppercase tracking-wide px-2 py-1 rounded bg-muted/20 hover:bg-muted/40">Preview</button>
                        <a href={getMediaUrl(app.cv_path)} target="_blank" rel="noreferrer" className="text-muted-foreground group-hover:text-primary transition-colors"><Download className="size-3.5" /></a>
                      </div>
                    </div>
                    {app.certificate_paths && app.certificate_paths.map((p, i) => (
                      <div key={`cert-${i}`} className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/10 border border-border/40 hover:border-primary/20 hover:bg-primary/5 transition-all group">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="size-4 text-amber-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-xs truncate text-foreground">Certificate #{i+1}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => openPreview(getMediaUrl(p), `Certificate #${i+1}`)} className="text-[9px] font-semibold uppercase tracking-wide px-2 py-1 rounded bg-muted/20 hover:bg-muted/40">Preview</button>
                          <a href={getMediaUrl(p)} target="_blank" rel="noreferrer" className="text-muted-foreground group-hover:text-primary transition-colors"><Download className="size-3.5" /></a>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Compact AI match summary */}
                {app.screening_result && (
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2.5 mt-2">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <span className="text-[9px] font-semibold uppercase text-emerald-600 tracking-wider">AI MATCH SCORE</span>
                         <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">V{app.screening_result.evaluation_version}</span>
                       </div>
                       <span className="text-xl font-bold text-emerald-600">{Number(app.screening_result.final_score || 0).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-emerald-500/10 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${Number(app.screening_result.final_score || 0)}%` }}
                         className="h-full bg-emerald-500"
                       />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-semibold text-muted-foreground uppercase tracking-wide pt-1">
                      <div>Rule: <span className="text-foreground">{Number(app.screening_result.rule_score || 0).toFixed(0)}%</span></div>
                      <div>AI: <span className="text-foreground">{Number(app.screening_result.ai_score || 0).toFixed(0)}%</span></div>
                      <div>Status: <span className="text-foreground">{app.screening_result.status}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* HR Notes / Tags */}
          <Card className="p-6 rounded-2xl border border-border/40 bg-primary/5 shadow-none space-y-3">
             <h3 className="text-[10px] font-semibold uppercase tracking-wider text-primary">Internal Notes</h3>
             {isEditingNote ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full h-24 p-3 rounded-xl bg-background border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-xs font-medium resize-none"
                    placeholder="Add internal notes..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    autoFocus
                  />
                  <div className="flex items-center gap-1.5">
                    <Button 
                      size="sm" 
                      className="rounded-lg h-7 px-3 font-semibold text-[10px]"
                      onClick={handleSaveNote}
                      disabled={isSavingNote}
                    >
                      {isSavingNote ? "Saving..." : "Save"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="rounded-lg h-7 px-3 font-semibold text-[10px]"
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
                  <p className="text-xs font-medium italic text-muted-foreground/80 leading-relaxed">
                    {app.applicant_note || "No internal notes have been added."}
                  </p>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start p-0 h-auto text-[10px] font-semibold text-primary hover:bg-transparent hover:underline"
                    onClick={() => setIsEditingNote(true)}
                  >
                    {app.applicant_note ? "Edit Note" : "+ Add Note"}
                  </Button>
                </>
             )}
          </Card>
        </aside>

        {/* Main Content Area */}
        <main className="space-y-6">
          {/* Tabs */}
          <div className="flex items-center p-1 bg-muted/40 border border-border/40 rounded-xl w-fit shadow-sm">
            {(["overview", "resume", "ai"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-background text-primary shadow"
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
              transition={{ duration: 0.2 }}
              className="min-h-[400px]"
            >
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* AI Summary Section */}
                  {(app.evaluation?.summary || app.screening_result?.explanation) && (
                        <section className="p-6 rounded-2xl bg-gradient-to-br from-violet-600/5 to-primary/5 border border-primary/10 space-y-4">
                           <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-600">
                              <Brain size={14} /> AI Snapshot Analysis
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                             <div className="p-3.5 rounded-xl bg-background/50 border border-border/30">
                               <p className="text-[9px] font-semibold uppercase text-muted-foreground mb-1">Weighted Total</p>
                               <div className="flex items-baseline gap-2">
                                 <span className="text-2xl font-bold text-foreground">{app.screening_result ? Number(app.screening_result.final_score || 0).toFixed(0) : (app.evaluation?.matching_percentage || 0)}%</span>
                                 <span className="text-[10px] font-medium text-muted-foreground">V{app.screening_result?.evaluation_version || ''}</span>
                               </div>
                               <p className="text-[9px] text-muted-foreground/80 mt-1 uppercase font-semibold">{app.screening_result?.status}</p>
                             </div>

                             <div className="p-3.5 rounded-xl bg-background/50 border border-border/30">
                               <p className="text-[9px] font-semibold uppercase text-muted-foreground mb-1">Score Breakdown</p>
                               <div className="flex gap-4">
                                 <div>
                                   <p className="text-[10px] font-semibold text-muted-foreground">Rule</p>
                                   <p className="text-base font-bold text-foreground">{app.screening_result ? Number(app.screening_result.rule_score || 0).toFixed(0) : 'N/A'}%</p>
                                 </div>
                                 <div>
                                   <p className="text-[10px] font-semibold text-muted-foreground">AI</p>
                                   <p className="text-base font-bold text-primary">{app.screening_result ? Number(app.screening_result.ai_score || 0).toFixed(0) : 'N/A'}%</p>
                                 </div>
                               </div>
                               <p className="text-[9px] text-muted-foreground/80 mt-1">Model: {app.screening_result?.screening_model || '—'}</p>
                             </div>

                             <div className="p-3.5 rounded-xl bg-background/50 border border-border/30">
                               <p className="text-[9px] font-semibold uppercase text-muted-foreground mb-1">Meta Details</p>
                               <p className="text-xs font-semibold">Recommendation: <span className="font-bold text-primary">{(app.screening_result?.scoring_breakdown?.recommendation || '').toUpperCase() || (app.evaluation?.fit_label || '—')}</span></p>
                               <p className="text-[9px] text-muted-foreground/80 mt-1">Screened: {app.screening_result?.screened_at ? new Date(app.screening_result.screened_at).toLocaleDateString() : '—'}</p>
                             </div>
                           </div>

                           <p className="text-sm font-semibold leading-relaxed text-foreground/90 mt-2">
                             "{app.evaluation?.summary || app.screening_result?.explanation}"
                           </p>

                           <div className="flex flex-wrap gap-1.5 pt-1">
                              {app.screening_result?.key_strengths.slice(0, 3).map((s, i) => (
                                <span key={i} className="px-2.5 py-0.5 bg-emerald-500/5 text-emerald-600 text-[10px] font-semibold uppercase rounded-md border border-emerald-500/10">
                                  + {s}
                                </span>
                              ))}
                           </div>
                        </section>
                      )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skills Breakdown */}
                    <Card className="p-6 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-md space-y-4 shadow-sm">
                       <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                          <Sparkles size={12} className="text-amber-500" /> Key Skill Match
                       </h3>
                       <div className="flex flex-wrap gap-1.5">
                          {(app.evaluation?.skill_gaps?.matched_skills || app.evaluation?.matched_keywords)?.map((skill) => (
                            <span key={skill} className="px-2.5 py-1 bg-muted/40 text-foreground/85 text-xs font-medium rounded-lg border border-border/30">
                              {skill}
                            </span>
                          ))}
                          {!(app.evaluation?.skill_gaps?.matched_skills?.length) && (
                            <p className="text-xs text-muted-foreground italic">No skill match data found.</p>
                          )}
                       </div>
                    </Card>

                    {/* Missing Skills / Gaps */}
                    <Card className="p-6 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-md space-y-4 shadow-sm">
                       <h3 className="text-xs font-semibold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                          <AlertTriangle size={12} /> Identified Gaps
                       </h3>
                       <div className="space-y-2">
                          {(app.evaluation?.skill_gaps?.missing_skills || app.evaluation?.missing_keywords)?.map((gap) => (
                            <div key={gap} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                               <div className="size-1 rounded-full bg-red-400 shrink-0" />
                               {gap}
                            </div>
                          ))}
                       </div>
                    </Card>
                  </div>

                  {/* Interview Questions */}
                  {interviewQuestions.length > 0 && (
                    <section className="space-y-4">
                       <div className="flex items-center justify-between">
                         <h3 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                            <MessageSquare size={12} /> Suggested Interview Questions
                         </h3>
                         <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                           {interviewQuestions.length} AI Prompts
                         </span>
                       </div>
                       <div className="grid gap-3">
                         {interviewQuestions.map((q, i) => (
                           <div 
                             key={i} 
                             onClick={() => copyToClipboard(q)}
                             className="group p-4 rounded-xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-sm transition-all flex gap-4 cursor-pointer relative overflow-hidden"
                           >
                              <div className="absolute top-0 right-0 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Sparkles size={12} className="text-primary animate-pulse" />
                              </div>
                              <span className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                {i + 1}
                              </span>
                              <div className="space-y-0.5 pr-6">
                                <p className="font-semibold text-sm leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors">{q}</p>
                                <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground/40 group-hover:text-primary/60 transition-colors">Click to copy to clipboard</p>
                              </div>
                           </div>
                         ))}
                       </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === "resume" && (
                <Card className="rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                  <div className="bg-muted/10 p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider">Resume Extraction</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-background p-1 flex items-center gap-1 border border-border/30">
                        <button onClick={() => setResumeView('ui')} className={`px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider rounded ${resumeView === 'ui' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/10'}`}>
                          UI View
                        </button>
                        <button onClick={() => setResumeView('formatted')} className={`px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider rounded ${resumeView === 'formatted' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/10'}`}>
                          JSON View
                        </button>
                        <button onClick={() => setResumeView('raw')} className={`px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider rounded ${resumeView === 'raw' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted/10'}`}>
                          Raw
                        </button>
                      </div>
                      <Button variant="ghost" className="h-7 text-[9px] font-semibold uppercase tracking-wider" onClick={() => openPreview(getMediaUrl(app.cv_path), 'Resume')}>
                        View Original <ExternalLink className="size-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    {app.extracted_resume ? (
                      <>
                        {resumeView === 'raw' && (
                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed opacity-85">
                              {rawExtractedText || (typeof app.extracted_resume === 'string' ? app.extracted_resume : (app.extracted_resume as any).raw_llm_response)}
                            </div>
                          </div>
                        )}

                        {resumeView === 'formatted' && (
                          <pre className="text-[11px] font-mono leading-relaxed max-h-[400px] overflow-auto custom-scrollbar p-3 bg-background border border-border/40 rounded-lg whitespace-pre-wrap">
                            {parsedExtractedResume ? JSON.stringify(parsedExtractedResume, null, 2) : (rawExtractedText || (typeof app.extracted_resume === 'string' ? app.extracted_resume : (app.extracted_resume as any).raw_llm_response))}
                          </pre>
                        )}

                        {resumeView === 'ui' && (
                          <div className="space-y-3">
                            {parsedExtractedResume ? (
                              <JsonPrettyView data={parsedExtractedResume} />
                            ) : (
                              <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed opacity-85">
                                {rawExtractedText || (typeof app.extracted_resume === 'string' ? app.extracted_resume : (app.extracted_resume as any).raw_llm_response)}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                        <Loader2 className="size-8 text-primary/30 animate-spin" />
                        <p className="text-muted-foreground font-medium uppercase tracking-wider text-[9px]">Analyzing resume...</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {activeTab === "ai" && (
                <div className="space-y-6">
                   {app.screening_result ? (
                     <>
                       <div className="flex items-center gap-2 justify-end">
                         {app.screening_result.is_deleted ? (
                           <Button
                             variant="outline"
                             onClick={handleRestoreLiveResult}
                             disabled={actionBusyKey === "live-restore"}
                             className="rounded-xl h-8 font-semibold text-[10px]"
                           >
                             {actionBusyKey === "live-restore" ? "Restoring..." : "Restore Evaluation"}
                           </Button>
                         ) : (
                           <Button
                             variant="outline"
                             onClick={handleArchiveLiveResult}
                             disabled={actionBusyKey === "live-archive"}
                             className="rounded-xl h-8 font-semibold text-[10px]"
                           >
                             {actionBusyKey === "live-archive" ? "Archiving..." : "Move To Archive"}
                           </Button>
                         )}
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <Card className="p-6 rounded-2xl border border-border/40 bg-zinc-950 text-white space-y-4">
                           <h3 className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">AI Reasoning Trace</h3>
                           <pre className="text-[10px] font-mono leading-relaxed text-zinc-400 whitespace-pre-wrap max-h-[360px] overflow-auto custom-scrollbar">
                             {app.screening_result.raw_llm_response}
                           </pre>
                         </Card>

                         <Card className="p-6 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-md space-y-6 shadow-sm">
                            <div className="space-y-4">
                               <h3 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                                  <ShieldCheck size={12} /> Screening Evaluation
                                </h3>
                               <div className="grid grid-cols-1 gap-4">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-muted/20 border border-border/30">
                                       <p className="text-[9px] font-semibold uppercase text-muted-foreground mb-1">Rule Score</p>
                                       <p className="text-lg font-bold">{formatScore(app.screening_result.rule_score, 0)}%</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                                       <p className="text-[9px] font-semibold uppercase text-primary mb-1">AI Score</p>
                                       <p className="text-lg font-bold text-primary">{formatScore(app.screening_result.ai_score, 0)}%</p>
                                    </div>
                                  </div>

                                  <div className="p-3 rounded-xl bg-background border border-border/30">
                                     <p className="text-[10px] font-semibold uppercase text-foreground mb-1">Evaluation Summary</p>
                                     <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                                       {app.screening_result.explanation}
                                     </p>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3.5 rounded-xl bg-muted/10 border border-border/30 space-y-3">
                                      <p className="text-[10px] font-semibold uppercase text-muted-foreground">Qualitative Insight</p>
                                      {app.screening_result.scoring_breakdown?.ai ? (
                                        <div className="space-y-3">
                                          {Object.entries(app.screening_result.scoring_breakdown.ai).map(([k, v]) => (
                                            <div key={k} className="space-y-1">
                                              <div className="flex items-center justify-between text-[10px]">
                                                <div className="text-muted-foreground font-semibold uppercase">{k.replace(/_/g, ' ')}</div>
                                                <div className="font-bold text-primary">
                                                  {typeof v !== 'object' ? String(v) : null}
                                                </div>
                                              </div>
                                              
                                              {typeof v === 'object' && v !== null && (
                                                <div className="space-y-1">
                                                  {Object.entries(v).map(([subK, subV]) => (
                                                    <div key={subK} className="flex flex-col gap-0.5">
                                                      <div className="flex justify-between text-[9px]">
                                                        <span className="font-medium text-muted-foreground">{subK.replace(/_/g, ' ')}</span>
                                                        <span className="font-bold text-primary">{typeof subV === 'number' ? `${(subV * 100).toFixed(0)}%` : String(subV)}</span>
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
                                        <div className="text-xs text-muted-foreground italic">No details available.</div>
                                      )}
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-muted/10 border border-border/30 space-y-3">
                                      <p className="text-[10px] font-semibold uppercase text-muted-foreground">Rule Adjustments</p>
                                      {app.screening_result.scoring_breakdown?.rule ? (
                                        <div className="space-y-3">
                                          {Object.entries(app.screening_result.scoring_breakdown.rule).map(([k, v]) => (
                                            <div key={k} className="space-y-1">
                                              <div className="flex items-center justify-between text-[10px]">
                                                <div className="text-muted-foreground font-semibold uppercase">{k.replace(/_/g, ' ')}</div>
                                                <div className="font-bold text-amber-600">
                                                  {typeof v !== 'object' ? String(v) : null}
                                                </div>
                                              </div>

                                              {k === 'rule_adjustments' && typeof v === 'object' && v !== null && (
                                                <div className="flex flex-wrap gap-1">
                                                  {Object.entries(v).map(([rule, val]: [string, any]) => (
                                                    <div 
                                                      key={rule} 
                                                      className={`px-2 py-0.5 rounded text-[8px] font-semibold flex items-center gap-1 border ${
                                                        val < 0 
                                                          ? "bg-red-500/10 text-red-600 border-red-500/20" 
                                                          : "bg-green-500/10 text-green-600 border-green-500/20"
                                                      }`}
                                                    >
                                                      <span className="opacity-70">{rule.replace(/_/g, ' ')}</span>
                                                      <span className="font-bold">{val > 0 ? '+' : ''}{val}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}

                                              {k !== 'rule_adjustments' && typeof v === 'object' && v !== null && (
                                                <div className="bg-background rounded-lg p-2 text-[9px] font-mono text-muted-foreground grid grid-cols-1 gap-1">
                                                  {Array.isArray(v) ? (
                                                    <div className="flex flex-wrap gap-1">
                                                      {v.map((item, idx) => (
                                                        <span key={idx} className="px-1.5 py-0.5 rounded bg-muted/20 border border-border/30">{String(item)}</span>
                                                      ))}
                                                    </div>
                                                  ) : (
                                                    Object.entries(v).map(([subK, subV]) => (
                                                      <div key={subK} className="flex justify-between items-start gap-3">
                                                        <span className="opacity-70 shrink-0">{subK.replace(/_/g, ' ')}:</span>
                                                        <span className="font-semibold text-right break-all">
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
                                        <div className="text-xs text-muted-foreground italic">No adjustments.</div>
                                      )}
                                    </div>
                                  </div>
                                  </div>
                               </div>

                               {/* Interview Questions In AI Tab */}
                               {interviewQuestions.length > 0 && (
                                  <div className="p-5 rounded-xl bg-primary/5 border border-primary/10 space-y-4">
                                     <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                                        <Sparkles size={14} /> Recommended Interview Prompts
                                     </div>
                                     <div className="space-y-2">
                                       {interviewQuestions.map((q, i) => (
                                         <div 
                                           key={i} 
                                           onClick={() => copyToClipboard(q)}
                                           className="p-3 rounded-lg bg-background border border-primary/10 hover:border-primary/30 transition-all cursor-pointer group"
                                         >
                                           <div className="flex gap-3">
                                             <div className="font-semibold text-primary/50 text-xs shrink-0">Q{i+1}</div>
                                             <p className="text-xs font-semibold leading-relaxed">{q}</p>
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
                     <div className="flex flex-col items-center justify-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border/50 text-center">
                        <Brain className="size-12 text-muted-foreground/30 mb-4 animate-pulse" />
                        <h3 className="text-lg font-semibold uppercase tracking-wider">No Active Screening</h3>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                          Candidate has not been screened or trace is archived. History entries are below.
                        </p>
                     </div>
                   )}

                   <Card className="p-6 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-md space-y-5 shadow-sm">
                     <div className="flex items-center justify-between">
                       <h3 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                         <Clock size={12} /> Evaluation History
                       </h3>
                       <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                         {visibleHistory.length} visible • {archivedHistory.length} archived
                       </span>
                     </div>

                     {visibleHistory.length === 0 ? (
                       <p className="text-xs text-muted-foreground italic">No history available.</p>
                     ) : (
                       <div className="space-y-2">
                         {visibleHistory.map((entry) => (
                           <div key={entry.id} className="p-3 rounded-xl bg-muted/10 border border-border/40 flex items-center justify-between gap-3">
                             <div className="space-y-0.5">
                               <div className="text-xs font-bold text-foreground">
                                 Version {entry.evaluation_version} • Score {formatScore(entry.final_score, 1)}%
                               </div>
                               <div className="text-[10px] text-muted-foreground">
                                 {entry.status.toUpperCase()} • Screened {entry.screened_at ? new Date(entry.screened_at).toLocaleDateString() : "—"}
                                </div>
                               <div className="text-[10px] text-muted-foreground">Reason: {entry.archive_reason || "—"}</div>
                             </div>
                             <Button
                               variant="outline"
                               onClick={() => handleArchiveHistoryEntry(entry.id)}
                               disabled={actionBusyKey === `history-archive-${entry.id}`}
                               className="rounded-lg h-7 text-[9px] font-semibold"
                             >
                               {actionBusyKey === `history-archive-${entry.id}` ? "Archiving..." : "Archive"}
                             </Button>
                           </div>
                         ))}
                       </div>
                     )}

                     <div className="pt-3 border-t border-border/40 space-y-3">
                       <h4 className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Archived Evaluations</h4>
                       {archivedHistory.length === 0 ? (
                         <p className="text-xs text-muted-foreground italic">No archived items.</p>
                       ) : (
                         archivedHistory.map((entry) => (
                           <div key={`archived-${entry.id}`} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between gap-3">
                             <div className="space-y-0.5">
                               <div className="text-xs font-bold text-foreground">Version {entry.evaluation_version} • Score {formatScore(entry.final_score, 1)}%</div>
                               <div className="text-[10px] text-muted-foreground">
                                 Deleted {entry.deleted_at ? new Date(entry.deleted_at).toLocaleDateString() : "—"}
                               </div>
                             </div>
                             <Button
                               onClick={() => handleRestoreHistoryEntry(entry.id)}
                               disabled={actionBusyKey === `history-restore-${entry.id}`}
                               className="rounded-lg h-7 text-[9px] font-semibold animate-pulse"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-xl border border-border/40">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-xs truncate max-w-xs">{previewName}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <a href={previewUrl} target="_blank" rel="noreferrer" className="text-[10px] font-semibold px-2 py-1.5 rounded hover:bg-muted">Open New Tab</a>
                  <a href={previewUrl} download className="text-[10px] font-semibold px-2 py-1.5 rounded hover:bg-muted">Download</a>
                  <button onClick={closePreview} className="text-[10px] font-semibold px-2 py-1.5 rounded bg-muted/50">Close</button>
                </div>
              </div>
              <div className="p-2 h-[75vh] overflow-auto flex items-center justify-center bg-background">
                {previewType === 'pdf' && (
                  <iframe src={previewUrl} title={previewName || 'document'} className="w-full h-full border-0" />
                )}
                {previewType === 'image' && (
                  <img src={previewUrl} alt={previewName || 'image'} className="max-w-full max-h-full object-contain" />
                )}
                {previewType === 'other' && (
                  <div className="p-6 text-center">
                    <p className="text-muted-foreground text-xs">Preview not available.</p>
                    <a href={previewUrl} target="_blank" rel="noreferrer" className="text-primary text-xs underline">Open new tab</a>
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
