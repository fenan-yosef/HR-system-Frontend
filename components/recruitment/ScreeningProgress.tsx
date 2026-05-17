"use client";

import { ScreeningProgress } from "@/types/recruitment";
import { Card } from "@/components/ui/card";
import { BrainCircuit, Loader2, AlertCircle, CheckCircle2, WifiOff } from "lucide-react";
import { Loading } from "@/components/ui/loading";

interface ScreeningProgressDisplayProps {
    progress: ScreeningProgress;
}

export function ScreeningProgressDisplay({ progress }: ScreeningProgressDisplayProps) {
    const isRunning = progress.status === "running" || progress.status === "pending";
    const isCompleted = progress.status === "completed";
    const isFailed = progress.status === "failed" || progress.status === "error";

    return (
        <Card className="p-6 sm:p-8 border-none shadow-2xl rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-primary/5 via-background to-primary/5 overflow-hidden relative">
            {/* Background Animation */}
            {isRunning && (
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
                </div>
            )}

            <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6">
                <div className="relative">
                    <div className={`p-6 rounded-full ${isRunning ? 'bg-primary/20 animate-pulse' : isFailed ? 'bg-red-500/20' : 'bg-emerald-500/20'} transition-all duration-500`}>
                        {isRunning ? (
                            <BrainCircuit className="size-12 text-primary" />
                        ) : isFailed ? (
                            progress.status === "error" ? (
                                <WifiOff className="size-12 text-red-500" />
                            ) : (
                                <AlertCircle className="size-12 text-red-500" />
                            )
                        ) : (
                            <CheckCircle2 className="size-12 text-emerald-500" />
                        )}
                    </div>
                    {isRunning && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-xs rounded-full">
                            <Loading size="lg" />
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight uppercase">
                        {isRunning
                            ? progress.mode === "stale_only" ? "AI RE-EVALUATING STALE APPLICANTS" : "AI IS SCREENING APPLICANTS"
                            : progress.status === "error"
                                ? "🤖 AI SERVICE OFFLINE"
                                : isFailed
                                    ? "SCREENING FAILED"
                                    : "SCREENING COMPLETE"}
                    </h3>
                    <p className="text-muted-foreground font-medium max-w-md">
                        {isRunning
                            ? progress.current_applicant
                                ? `Analyzing: ${progress.current_applicant}...`
                                : "Currently analyzing CVs against your requirements. This may take a moment."
                            : isFailed
                                ? progress.error || "An unexpected error occurred while screening."
                                : `All ${progress.total} applicants have been screened successfully.`
                        }
                    </p>
                </div>

                <div className="w-full max-w-md space-y-4">
                    <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                        <div
                            className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${isFailed ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${progress.progress_percent}%` }}
                        >
                            {isRunning && (
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[shimmer_2s_linear_infinite]" />
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground bg-muted/30 px-4 py-2 rounded-xl border border-border/40">
                            <span>Progress: {progress.progress_percent}%</span>
                            <span>{progress.current} / {progress.total} PROCESSED</span>
                        </div>
                        {progress.fail_count !== undefined && progress.fail_count > 0 && (
                            <div className="flex justify-center text-[10px] font-black uppercase tracking-tighter text-red-500/80">
                                ⚠️ {progress.fail_count} FAILED APPLICATIONS
                            </div>
                        )}
                    </div>
                </div>

                {isRunning && (
                    <div className="flex items-center gap-2 text-xs font-bold text-primary animate-pulse">
                        <Loading size="xs" />
                        POLLING ACTIVE &middot; REFRESHING EVERY 2s
                    </div>
                )}
            </div>
        </Card>
    );
}
