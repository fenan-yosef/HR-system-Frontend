"use client";

import { ScreeningResult } from "@/types/recruitment";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatScore } from "@/lib/utils";
import {
    CheckCircle2,
    XCircle,
    ChevronRight,
    AlertTriangle,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    Brain,
    FileSearch,
    Sparkles
} from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

interface ScreeningResultsListProps {
    results: ScreeningResult[];
}

/**
 * Color-graded scale for instant visual sorting (from the doc):
 * 80-100: Dark Green (Strong Fit)
 * 60-79:  Light Green/Blue (Qualified)
 * 40-59:  Amber (Needs Review)
 * 0-39:   Red (Low Match)
 */
function getScoreColor(score: number) {
    if (score >= 80) return { bg: "bg-emerald-600", text: "text-emerald-600", light: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Strong Fit" };
    if (score >= 60) return { bg: "bg-teal-500", text: "text-teal-600", light: "bg-teal-500/10", border: "border-teal-500/20", label: "Qualified" };
    if (score >= 40) return { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-500/10", border: "border-amber-500/20", label: "Needs Review" };
    return { bg: "bg-red-500", text: "text-red-500", light: "bg-red-500/10", border: "border-red-500/20", label: "Low Match" };
}

export function ScreeningResultsList({ results }: ScreeningResultsListProps) {
    const [selectedResult, setSelectedResult] = useState<ScreeningResult | null>(null);
    const { toast } = useToast();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast("Copied to clipboard", "success");
    };

    // Sort by final_score descending for best candidates first
    const sortedResults = [...results].sort((a, b) => (Number(b.final_score) || 0) - (Number(a.final_score) || 0));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-widest text-foreground">Ranked Results</h3>
                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                        <div className="size-2 rounded-full bg-emerald-600 font-bold" /> Passed
                    </div>
                    <div className="flex items-center gap-1.5 text-red-500">
                        <div className="size-2 rounded-full bg-red-500" /> Failed
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {sortedResults.map((result, idx) => {
                    const scoreColor = getScoreColor(Number(result.final_score) || 0);

                    return (
                    <Card
                        key={result.application_id || idx}
                        className="p-6 border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] group cursor-pointer overflow-hidden relative border border-border/20"
                        onClick={() => setSelectedResult(result)}
                    >
                        {/* Decorative background score */}
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-8xl font-black italic pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                {formatScore(result.final_score, 0)}
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                            {/* Score Gauge */}
                            <div className="flex items-center gap-4 min-w-[200px]">
                                <div className={`relative size-16 shrink-0 flex items-center justify-center rounded-2xl ${scoreColor.light}`}>
                                    <div className={`absolute inset-0 rounded-2xl border-2 ${scoreColor.border}`} />
                                    {/* Score fill bar at bottom */}
                                    <div
                                        className={`absolute bottom-0 left-0 right-0 rounded-b-2xl ${scoreColor.bg} opacity-20`}
                                            style={{ height: `${Number(result.final_score) || 0}%` }}
                                    />
                                    <span className={`text-xl font-black relative z-10 ${scoreColor.text}`}>
                                            {formatScore(result.final_score, 0)}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">{result.applicant_name}</h4>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {result.hard_criteria_met ? (
                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                <CheckCircle2 className="size-2.5" /> PASSED
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                                <XCircle className="size-2.5" /> FAILED
                                            </span>
                                        )}
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted/20 px-2 py-0.5 rounded-full">
                                            V{result.evaluation_version}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Broken down scores */}
                            <div className="flex items-center justify-around md:justify-start gap-4 md:gap-6 md:border-x border-border/50 md:px-6 py-4 md:py-0 border-y md:border-y-0">
                                <div className="text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Rule</p>
                                    <p className="text-xs font-black">{formatScore(result.rule_score, 0)}%</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">AI</p>
                                    <p className="text-xs font-black text-primary">{formatScore(result.ai_score, 0)}%</p>
                                </div>
                            </div>

                            {/* Pro/Con Insights */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <ul className="space-y-0.5">
                                        {result.key_strengths.slice(0, 2).map((s, i) => (
                                            <li key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80">
                                                <div className="size-1.5 rounded-full bg-emerald-500 shrink-0" />{s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="space-y-1">
                                    <ul className="space-y-0.5">
                                        {result.key_weaknesses.slice(0, 1).map((w, i) => (
                                            <li key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80 italic">
                                                <TrendingDown className="size-3 text-amber-500 shrink-0" />{w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex items-center justify-end">
                                <Button variant="ghost" className="rounded-xl group-hover:bg-primary/5 group-hover:text-primary transition-all gap-2 font-black uppercase tracking-widest text-[9px] h-9">
                                    Full Audit <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                    );
                })}
            </div>

            <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
                <DialogContent className="max-w-3xl w-[95vw] sm:w-full rounded-2xl sm:rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    {selectedResult && (() => {
                                const selectedScore = Number(selectedResult.final_score) || 0;
                                const scoreColor = getScoreColor(selectedScore);
                        return (
                        <div className="flex flex-col h-[90vh] sm:h-[80vh]">
                            <div className="p-4 sm:p-8 bg-gradient-to-br from-primary/10 to-transparent border-b border-border/50">
                                <DialogHeader>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${selectedResult.hard_criteria_met ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                                                {selectedResult.hard_criteria_met ? "PASSED REQUIREMENTS" : "FAILED CRITERIA"}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-muted/40 text-muted-foreground">
                                                VERSION {selectedResult.evaluation_version}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-left sm:text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Weighted Total</p>
                                                            <p className={`text-2xl font-black ${scoreColor.text}`}>{formatScore(selectedResult.final_score, 1)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                    <DialogTitle className="text-2xl sm:text-4xl font-black tracking-tighter uppercase">{selectedResult.applicant_name}</DialogTitle>
                                    <DialogDescription className="text-muted-foreground font-bold text-sm sm:text-base mt-1 flex items-center gap-2">
                                        <Brain className="size-4 text-primary" /> AI-Augmented Screening Audit
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-10">
                                {/* Score Breakdown Display */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="p-5 rounded-3xl bg-muted/20 border-border/40 space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rule-based Score</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-black">{formatScore(selectedResult.rule_score, 0)}%</span>
                                            <span className="text-[10px] font-bold text-muted-foreground mb-1.5">HARD CRITERIA</span>
                                        </div>
                                    </Card>
                                    <Card className="p-5 rounded-3xl bg-primary/5 border-primary/10 space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">LLM Reasoning Score</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-3xl font-black text-primary">{formatScore(selectedResult.ai_score, 0)}%</span>
                                            <span className="text-[10px] font-bold text-primary/60 mb-1.5">SEMANTIC MATCH</span>
                                        </div>
                                    </Card>
                                </div>

                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground">
                                        <MessageSquare className="size-4 text-primary" /> Executive Summary
                                    </div>
                                    <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 text-base leading-relaxed font-medium">
                                        {selectedResult.explanation}
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600">
                                            <CheckCircle2 className="size-4" /> Strong Signals
                                        </div>
                                        <ul className="space-y-2">
                                            {selectedResult.key_strengths.map((s, i) => (
                                                <li key={i} className="flex gap-3 text-sm font-bold p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 border-l-4 border-l-emerald-500">
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-rose-500">
                                            <AlertTriangle className="size-4" /> Identified Gaps
                                        </div>
                                        <ul className="space-y-2">
                                            {selectedResult.key_weaknesses.map((w, i) => (
                                                <li key={i} className="flex gap-3 text-sm font-bold p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 border-l-4 border-l-rose-500">
                                                    {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                </div>

                                {/* Interview Questions Section */}
                                {selectedResult.scoring_breakdown?.interview_questions && selectedResult.scoring_breakdown.interview_questions.length > 0 && (
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                                            <Sparkles className="size-4" /> AI-Suggested Interview Questions
                                        </div>
                                        <ul className="space-y-3">
                                            {selectedResult.scoring_breakdown.interview_questions.map((q, i) => (
                                                <li 
                                                    key={i} 
                                                    onClick={() => copyToClipboard(q)}
                                                    className="flex gap-4 p-5 rounded-3xl bg-primary/5 border border-primary/10 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-center size-8 rounded-2xl bg-primary text-primary-foreground font-black text-xs shrink-0 group-hover:scale-110 transition-transform">
                                                        {i + 1}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold leading-relaxed text-foreground/90 pt-1">
                                                            {q}
                                                        </p>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity">Click to copy</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        <FileSearch className="size-4" /> AI Critical Reasoning (Raw Output)
                                    </div>
                                    <pre className="p-6 rounded-3xl bg-zinc-950 text-zinc-400 text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap border border-white/5">
                                        {selectedResult.raw_llm_response}
                                    </pre>
                                </section>
                            </div>

                            <div className="p-4 sm:p-6 border-t border-border/40 bg-muted/10 flex flex-col sm:flex-row justify-end gap-3">
                                <Button variant="ghost" onClick={() => setSelectedResult(null)} className="rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] h-12 order-2 sm:order-1">
                                    Close
                                </Button>
                                <Button className="rounded-2xl px-10 font-black uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-primary/20 order-1 sm:order-2">
                                    Approve for Interview
                                </Button>
                            </div>
                        </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
