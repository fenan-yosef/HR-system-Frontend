"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    JobPosition,
    ScreeningProgress,
    ScreeningResult,
} from "@/types/recruitment";
import {
    fetchJobPosition,
    startScreening,
    getScreeningProgress,
    getScreeningResults,
    fetchApplications
} from "@/services/recruitmentService";
import { Button } from "@/components/ui/button";
import { ScreeningSettings } from "@/components/recruitment/ScreeningSettings";
import { ScreeningProgressDisplay } from "@/components/recruitment/ScreeningProgress";
import { ScreeningResultsList } from "@/components/recruitment/ScreeningResultsList";
import { useToast } from "@/components/ui/toast";
import {
    ArrowLeft,
    BrainCircuit,
    Sparkles,
    History,
    Users
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ScreeningPage() {
    const params = useParams();
    const positionId = Number(params.positionId);
    const { toast } = useToast();

    const [job, setJob] = useState<JobPosition | null>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState<ScreeningProgress | null>(null);
    const [results, setResults] = useState<ScreeningResult[]>([]);
    const [candidatesCount, setCandidatesCount] = useState(0);

    // Store the screening job ID returned by the start endpoint
    const screeningJobIdRef = useRef<number | null>(null);

    const loadData = useCallback(async () => {
        if (!positionId) return;

        try {
            setLoading(true);
            const [jobData, appsData] = await Promise.all([
                fetchJobPosition(positionId),
                fetchApplications({ position_id: positionId })
            ]);

            setJob(jobData);
            setCandidatesCount(appsData.count || 0);

            // Try to load existing results
            try {
                const resultsData = await getScreeningResults(positionId);
                if (Array.isArray(resultsData) && resultsData.length > 0) {
                    setResults(resultsData);
                }
            } catch {
                // No results yet, that's OK
            }
        } catch (error) {
            console.error("Failed to load screening data:", error);
        } finally {
            setLoading(false);
        }
    }, [positionId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Polling logic — uses screening job ID, polls every 2s as recommended
    useEffect(() => {
        let interval: NodeJS.Timeout;
        const jobId = screeningJobIdRef.current;

        if (progress?.status === "running" && jobId) {
            interval = setInterval(async () => {
                try {
                    const progressData = await getScreeningProgress(jobId);
                    setProgress(progressData);

                    if (progressData.status === "completed") {
                        clearInterval(interval);
                        // Fetch final results
                        const resultsData = await getScreeningResults(positionId);
                        setResults(resultsData);
                        
                        if (progressData.fail_count && progressData.fail_count > 0) {
                            toast(`Screening complete with ${progressData.fail_count} failures. ⚠️`, "warning");
                        } else {
                            toast("Screening completed successfully! 🎉", "success");
                        }

                        // Update job version if done
                        loadData();
                    } else if (progressData.status === "failed" || progressData.status === "error") {
                        clearInterval(interval);
                        const errorMsg = progressData.error_message || progressData.error || "Screening could not complete.";
                        toast(`🤖 AI Screening Failed — ${errorMsg}`, "error");
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                    clearInterval(interval);
                    toast("🤖 AI Service Offline — could not reach screening service.", "error");
                    setProgress(prev => prev ? { ...prev, status: "error", error: "Lost connection to AI service" } : null);
                }
            }, 2000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [progress?.status, positionId, toast, loadData]);

    const handleStartScreening = async (mode: "full" | "stale_only" = "full") => {
        if (!positionId) return;
        try {
            setResults([]); // Clear previous results
            const startData = await startScreening(positionId, { mode });

            // Store the returned screening job ID
            screeningJobIdRef.current = startData.id;

            // Set initial progress to trigger polling
            setProgress({
                job_id: positionId,
                status: "running",
                progress_percent: 0,
                current: 0,
                total: candidatesCount,
                mode: mode
            });
        } catch (error: any) {
            console.error("Failed to start screening:", error);
            const msg = error?.message || "";
            if (msg.includes("405")) {
                toast("Screening endpoint not available. Check backend configuration.", "error");
            } else {
                toast("Could not start screening. Ensure the AI service is online.", "error");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center p-8 text-muted-foreground font-medium animate-pulse">
                Preparing AI Insights...
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

    const showProgress = progress && (progress.status === "running" || progress.status === "pending" || progress.status === "failed" || progress.status === "error");

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Link
                        href={`/recruitment/job-postings/${positionId}`}
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="size-4" /> Back to Job Details
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-primary shadow-lg shadow-primary/20 text-primary-foreground">
                            <BrainCircuit className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight leading-tight flex items-center gap-2">
                                AI SCREENING <Sparkles className="size-6 text-amber-500 fill-amber-500" />
                            </h1>
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest flex items-center gap-2">
                                For {job.title} <span className="text-primary/50">#ID-{job.position_id}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Card className="px-6 py-3 border-none shadow-sm rounded-2xl bg-muted/30 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Applicants</span>
                        <span className="text-2xl font-black flex items-center gap-2">
                            <Users className="size-5 text-primary" /> {candidatesCount}
                        </span>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Configuration Sidebar */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                    <ScreeningSettings
                        job={job}
                        onStartScreening={handleStartScreening}
                        onUpdate={(updated) => setJob(updated)}
                    />

                    {results.length > 0 && !showProgress && (
                        <div className="p-6 rounded-3xl bg-muted/20 border border-border/50 space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <History className="size-4" /> Last Screening
                            </h4>
                            <p className="text-sm font-medium">
                                Results from previous analysis are available below. You can re-run screening anytime to refresh them.
                            </p>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {showProgress ? (
                        <ScreeningProgressDisplay progress={progress} />
                    ) : results.length > 0 ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                             <ScreeningResultsList results={results} />
                        </div>
                    ) : (
                        <Card className="p-16 text-center rounded-[3rem] border-dashed border-2 bg-muted/5 shadow-none flex flex-col items-center justify-center space-y-6">
                            <div className="bg-primary/10 w-fit p-8 rounded-[2rem] text-primary relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-[2rem] animate-ping" />
                                <BrainCircuit className="size-16 relative z-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black uppercase tracking-widest">Click to analyze applicants</h3>
                                <p className="text-muted-foreground font-medium max-w-md mx-auto">
                                    Configure your job requirements on the left and run the AI screening to automatically rank your candidates based on fit.
                                </p>
                            </div>
                            <Button
                                onClick={() => handleStartScreening("full")}
                                className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-all text-lg"
                            >
                                Screen All Applicants
                            </Button>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
