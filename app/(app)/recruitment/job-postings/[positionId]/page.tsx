"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    JobPosition,
    Application
} from "@/types/recruitment";
import {
    fetchJobPosition,
    fetchApplications,
    updateJobPosition,
    getSkillSuggestions,
    fetchCustomApplicationFields,
} from "@/services/recruitmentService";
import { getMediaUrl, apiDownload } from "@/services/apiClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomFieldsSettings } from "@/components/recruitment/CustomFieldsSettings";
import {
    ArrowLeft,
    BarChart3,
    Briefcase,
    Calendar,
    Users,
    Mail,
    Phone,
    Clock,
    FileText,
    ExternalLink,
    Sparkles,
    Brain,
    FileSearch,
    ChevronRight,
    Search,
    CheckCircle2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export default function JobDetailsPage() {
    const params = useParams();
    const positionId = Number(params.positionId);

    const [job, setJob] = useState<JobPosition | null>(null);
    const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [selectedSuggestionChips, setSelectedSuggestionChips] = useState<string[]>([]);
    const [candidates, setCandidates] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    type RawApplication = Application & {
        applicant?: {
            full_name?: string;
            email?: string;
            phone?: string;
            cv_path?: string;
        };
        position?: {
            position_id?: number;
            job_id?: number;
        } | number;
        position_id?: number;
        job_id?: number;
        cv_version_path?: string;
    };

    type CandidateWithDerivedPosition = Application & {
        _derived_position_id: number;
    };

    useEffect(() => {
        if (!positionId) return;

        // Load Job & Applications in parallel
        Promise.all([
            fetchJobPosition(positionId).catch(err => {
                console.error("Job load error:", err);
                return null;
            }),
            fetchApplications().catch(err => {
                console.error("Applicants load error:", err);
                return { results: [] };
            })
        ]).then(([jobData, appsData]) => {
            setJob(jobData);

            // appsData.results contains API Application objects
            const rawResults = Array.isArray(appsData) ? appsData : (appsData?.results || []);

            const flattened: CandidateWithDerivedPosition[] = rawResults.map((r: RawApplication) => {
                const applicant = r.applicant;
                const pos = r.position;

                // Extremely robust ID extraction
                const apiPositionId =
                    (typeof pos === 'number' ? pos : (pos?.position_id || pos?.job_id)) ||
                    (r.position_id || r.job_id);

                return {
                    ...r,
                    full_name: applicant?.full_name || r.full_name || "Unknown Name",
                    email: applicant?.email || r.email || "",
                    phone: applicant?.phone || r.phone || "",
                    cv_path: applicant?.cv_path || r.cv_path || r.cv_version_path || "",
                    _derived_position_id: Number(apiPositionId)
                };
            });

            // Loose comparison to handle any string/number boundary issues
            const relatedApps = flattened.filter((app) => {
                const appId = Number(app._derived_position_id);
                return !isNaN(appId) && appId === positionId;
            });

            console.log(`[JobDetails Debug] Current positionId: ${positionId}`);
            console.log(`[JobDetails Debug] Found ${rawResults.length} total local apps.`);
            console.log(`[JobDetails Debug] Matched ${relatedApps.length} candidates.`);

            setCandidates(relatedApps);
            setLoading(false);
            // Load saved skill suggestions for this job (if any)
            try {
                setLoadingSuggestions(true);
                getSkillSuggestions(positionId).then(res => {
                    setSkillSuggestions(res.skills || []);
                }).catch(() => {
                    setSkillSuggestions([]);
                }).finally(() => setLoadingSuggestions(false));
            } catch (e) {
                setLoadingSuggestions(false);
            }
        });
    }, [positionId]);

    const handleStatusChange = async (newStatus: JobPosition["status"]) => {
        if (!job) return;
        try {
            setJob({ ...job, status: newStatus });
            await updateJobPosition(job.position_id, { status: newStatus });
        } catch (e) {
            console.error(e);
            // revert not handled properly here for simplicity, but basic optimisim is applied.
        }
    };

    const [cvLoading, setCvLoading] = useState<number | null>(null);

    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [isExtractionModalOpen, setIsExtractionModalOpen] = useState(false);

    const handleViewExtraction = (app: Application) => {
        setSelectedApp(app);
        setIsExtractionModalOpen(true);
    };

    const handleViewCV = async (cvPath: string, appId: number) => {
        try {
            setCvLoading(appId);
            const url = getMediaUrl(cvPath);
            const blobUrl = await apiDownload(url);
            window.open(blobUrl, '_blank');
        } catch (err) {
            console.error("Failed to view CV:", err);
            alert("Could not load CV. It may be missing or you may not have permission.");
        } finally {
            setCvLoading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'open':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'closed':
                return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'on_hold':
                return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'cancelled':
                return 'bg-gray-200/60 text-red-700 border-red-200/40';
            default:
                return 'bg-muted/10 text-muted-foreground border-border/20';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center p-8 text-muted-foreground font-medium animate-pulse">
                Loading Job Details & Talent Pool...
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 p-8">
                <h2 className="text-2xl font-black">Position Not Found</h2>
                <Link href="/recruitment/job-postings">
                    <Button>Back to Positions</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <Link
                    href="/recruitment/job-postings"
                    className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
                >
                    <ArrowLeft className="size-4" /> Back to Dashboard
                </Link>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/recruitment/job-postings/${job.position_id}/analytics`}
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
                    >
                        <BarChart3 className="size-4" />
                        View Analytics
                    </Link>
                    <Link
                        href={`/recruitment/job-postings/${job.position_id}/screening`}
                        className="inline-flex items-center gap-2 rounded-xl border-none bg-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-primary-foreground transition-all hover:scale-105 shadow-lg shadow-primary/20"
                    >
                        <Sparkles className="size-4 fill-current" />
                        AI Screening
                    </Link>
                    <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(e.target.value as JobPosition["status"])}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border appearance-none cursor-pointer outline-none hover:opacity-80 transition-opacity ${getStatusColor(job.status)}`}
                    >
                        <option value="open">OPEN</option>
                        <option value="on_hold">ON HOLD</option>
                        <option value="closed">CLOSED</option>
                        <option value="cancelled">CANCELLED</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Job Details */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 border-none shadow-xl rounded-3xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                            <Briefcase className="size-32" />
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight leading-tight">{job.title}</h1>
                                <p className="text-muted-foreground text-sm font-medium mt-2 flex items-center gap-2 uppercase tracking-wide">
                                    Department #{job.department}
                                </p>
                            </div>

                            <div className="h-px bg-border w-full" />

                            <div className="space-y-4 text-sm font-medium">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Calendar className="size-4 text-primary" />
                                    <span>Posted: {new Date(job.posted_date).toLocaleDateString()}</span>
                                </div>
                                {job.closed_date && (
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <Clock className="size-4 text-red-500" />
                                        <span>Closed: {new Date(job.closed_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {job.public_id && (
                                    <div className="flex items-center gap-3 pt-2">
                                        <ExternalLink className="size-4 text-primary" />
                                        <a
                                            href={`/apply/${job.public_id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-primary hover:underline font-bold"
                                        >
                                            View Public Application Page
                                        </a>
                                    </div>
                                )}
                            </div>

                            {job.description && (
                                <div className="pt-4 space-y-2">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Description</h4>
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap rounded-xl bg-muted/30 p-4 border border-border/50">
                                        {job.description}
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 border-t border-border/50">
                                <CustomFieldsSettings positionId={job.position_id} />
                            </div>

                            {/* Skill Suggestions Card */}
                            <div className="pt-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Suggested Skills</h4>
                                <div className="mt-2 p-3 rounded-2xl bg-muted/10 border border-border/40">
                                    {loadingSuggestions ? (
                                        <div className="text-sm text-muted-foreground">Loading suggestions…</div>
                                    ) : skillSuggestions.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">No saved suggestions for this position.</div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {skillSuggestions.map(s => {
                                                const selected = selectedSuggestionChips.includes(s);
                                                return (
                                                    <button
                                                        key={s}
                                                        onClick={() => setSelectedSuggestionChips(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selected ? 'bg-primary text-white border-primary' : 'bg-background text-muted-foreground border-border/30'}`}>
                                                        {s}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {skillSuggestions.length > 0 && (
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    if (!job) return;
                                                    if (selectedSuggestionChips.length === 0) return;
                                                    try {
                                                        const merged = Array.from(new Set([...(job.required_skills || []), ...selectedSuggestionChips]));
                                                        const updated = await updateJobPosition(job.position_id, { required_skills: merged });
                                                        setJob(updated);
                                                        setSelectedSuggestionChips([]);
                                                    } catch (e) {
                                                        console.error('Failed to add suggested skills', e);
                                                    }
                                                }}
                                                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest"
                                            >
                                                Add Selected to Job
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    // Refresh suggestions from server
                                                    try {
                                                        setLoadingSuggestions(true);
                                                        const res = await getSkillSuggestions(positionId);
                                                        setSkillSuggestions(res.skills || []);
                                                    } catch (e) {
                                                        console.error('Failed to refresh suggestions', e);
                                                    } finally {
                                                        setLoadingSuggestions(false);
                                                    }
                                                }}
                                                className="px-4 py-2 rounded-xl bg-muted/20 text-muted-foreground font-black uppercase tracking-widest"
                                            >
                                                Refresh
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Col: Talent Pool / Applicants */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <Users className="size-6 text-primary" />
                            Talent Pool <span className="text-muted-foreground text-lg">({candidates.length})</span>
                        </h2>
                    </div>

                    <div className="grid gap-4">
                        {candidates.length === 0 ? (
                            <Card className="p-12 text-center rounded-3xl border-dashed border-2 bg-muted/10 shadow-none">
                                <div className="mx-auto bg-primary/10 w-fit p-4 rounded-full text-primary mb-4">
                                    <Users className="size-8" />
                                </div>
                                <h3 className="text-lg font-bold">No Candidates Yet</h3>
                                <p className="text-muted-foreground mt-2">Applications for this position will appear here.</p>
                            </Card>
                        ) : (
                            candidates.map((app) => (
                                <Card
                                    key={app.application_id}
                                    className="p-6 border-none shadow-sm hover:shadow-lg transition-all rounded-2xl flex flex-col sm:flex-row gap-6 sm:items-center justify-between group"
                                >
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between sm:justify-start sm:items-center gap-3">
                                            <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{app.full_name}</h4>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border bg-muted/50 text-muted-foreground">
                                                {app.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                                            <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                                                <Mail className="size-3.5" />
                                                {app.email}
                                            </a>
                                            <a href={`tel:${app.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                                                <Phone className="size-3.5" />
                                                {app.phone}
                                            </a>
                                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Clock className="size-3.5" />
                                                {new Date(app.submitted_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4 sm:pt-0 sm:border-l sm:border-t-0 border-t border-border sm:pl-6">
                                        {app.cv_path ? (
                                            <button
                                                onClick={() => handleViewCV(app.cv_path, app.application_id)}
                                                disabled={cvLoading === app.application_id}
                                                className="flex-1 sm:flex-initial flex justify-center items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap disabled:opacity-50"
                                            >
                                                {cvLoading === app.application_id ? (
                                                    <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                ) : <FileText className="size-4" />}
                                                {cvLoading === app.application_id ? "Loading..." : "View CV"}
                                            </button>
                                        ) : (
                                            <div className="flex-1 sm:flex-initial text-center text-xs text-muted-foreground px-4 py-2.5 bg-muted rounded-xl">
                                                No CV
                                            </div>
                                        )}
                                        <button
                                            onClick={() => handleViewExtraction(app)}
                                            className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap"
                                        >
                                            <Search className="size-4" />
                                            AI Extraction
                                        </button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* AI Extraction Modal */}
            <Dialog open={isExtractionModalOpen} onOpenChange={setIsExtractionModalOpen}>
                <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    {selectedApp && (
                        <div className="flex flex-col h-[80vh]">
                            <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent border-b border-border/50">
                                <DialogHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary">
                                            AI Resume Extraction
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Brain className="size-4 text-primary" />
                                            <span className="text-xl font-black text-primary">PARSED CV</span>
                                        </div>
                                    </div>
                                    <DialogTitle className="text-3xl font-black tracking-tight">{selectedApp.full_name}</DialogTitle>
                                    <DialogDescription className="text-muted-foreground font-medium text-lg">
                                        Data automatically extracted from PDF/Docx by LLM
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {selectedApp.extracted_resume ? (
                                    <>
                                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card className="p-4 rounded-2xl bg-muted/20 border-border/50">
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Extracted JSON Data</h5>
                                                <pre className="text-xs font-mono bg-black/5 p-3 rounded-lg overflow-x-auto">
                                                    {JSON.stringify(selectedApp.extracted_resume.extracted_json, null, 2)}
                                                </pre>
                                            </Card>
                                            <div className="space-y-4">
                                                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Parser Status</p>
                                                        <p className="text-sm font-bold">Successfully Structured</p>
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                                                    <Brain className="size-5 text-primary" />
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-widest text-primary">AI Model</p>
                                                        <p className="text-sm font-bold">Ollama / Deepseek-Coder</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-4">
                                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                                <FileSearch className="size-4" /> Raw LLM Response
                                            </div>
                                            <pre className="p-6 rounded-2xl bg-zinc-950 text-zinc-400 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                                {selectedApp.extracted_resume.raw_llm_response}
                                            </pre>
                                        </section>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                        <div className="p-4 rounded-full bg-muted">
                                            <FileSearch className="size-12 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black uppercase tracking-widest">No Extraction Data</h4>
                                            <p className="text-muted-foreground max-w-sm">
                                                AI extraction hasn't been performed for this candidate yet. Try running screening first.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-end">
                                <Button onClick={() => setIsExtractionModalOpen(false)} className="rounded-xl px-8 font-black uppercase tracking-widest">
                                    Close Viewer
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
