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
    updateJobPosition
} from "@/services/recruitmentService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Briefcase,
    Users,
    Calendar,
    FileText,
    Mail,
    Phone,
    Clock,
    ExternalLink
} from "lucide-react";

export default function JobDetailsPage() {
    const params = useParams();
    const positionId = Number(params.positionId);

    const [job, setJob] = useState<JobPosition | null>(null);
    const [candidates, setCandidates] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

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

            // Filter applications that belong to this position
            // Application.position.job_id matches positionId
            const relatedApps = appsData?.results?.filter(
                (app: Application) => app.position.job_id === positionId
            ) || [];

            setCandidates(relatedApps);
            setLoading(false);
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
                    <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(e.target.value as any)}
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
                                            <a
                                                href={app.cv_path.startsWith('http') || app.cv_path.startsWith('data:') ? app.cv_path : `${process.env.NEXT_PUBLIC_API_BASE_URL}${app.cv_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex-1 sm:flex-initial flex justify-center items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap"
                                            >
                                                <FileText className="size-4" /> View CV
                                            </a>
                                        ) : (
                                            <div className="flex-1 sm:flex-initial text-center text-xs text-muted-foreground px-4 py-2.5 bg-muted rounded-xl">
                                                No CV
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
