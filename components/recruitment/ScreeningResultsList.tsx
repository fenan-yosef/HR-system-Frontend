"use client";

import { ScreeningResult } from "@/types/recruitment";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    XCircle,
    ChevronRight,
    AlertTriangle,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    Brain,
    FileSearch
} from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

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

    // Sort by score descending for best candidates first
    const sortedResults = [...results].sort((a, b) => b.overall_score - a.overall_score);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-widest text-foreground">Screening Results</h3>
                <div className="flex gap-3 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1.5 text-emerald-600">
                        <div className="size-2 rounded-full bg-emerald-600" /> Passed
                    </div>
                    <div className="flex items-center gap-1.5 text-red-500">
                        <div className="size-2 rounded-full bg-red-500" /> Failed
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {sortedResults.map((result, idx) => {
                    const scoreColor = getScoreColor(result.overall_score);

                    return (
                    <Card
                        key={idx}
                        className="p-6 border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] group cursor-pointer overflow-hidden relative"
                        onClick={() => setSelectedResult(result)}
                    >
                        {/* Decorative background score */}
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-8xl font-black italic pointer-events-none group-hover:scale-110 transition-transform duration-500">
                            {result.overall_score.toFixed(0)}
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                            {/* Score Gauge */}
                            <div className="flex items-center gap-4">
                                <div className={`relative size-16 shrink-0 flex items-center justify-center rounded-2xl ${scoreColor.light}`}>
                                    <div className={`absolute inset-0 rounded-2xl border-2 ${scoreColor.border}`} />
                                    {/* Score fill bar at bottom */}
                                    <div
                                        className={`absolute bottom-0 left-0 right-0 rounded-b-2xl ${scoreColor.bg} opacity-20`}
                                        style={{ height: `${result.overall_score}%` }}
                                    />
                                    <span className={`text-xl font-black relative z-10 ${scoreColor.text}`}>
                                        {result.overall_score.toFixed(0)}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">{result.applicant_name}</h4>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* hard_criteria_met badge */}
                                        {result.hard_criteria_met ? (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                <CheckCircle2 className="size-3" /> PASSED
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                                                <XCircle className="size-3" /> FAILED REQUIREMENTS
                                            </span>
                                        )}
                                        {/* Score tier label */}
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${scoreColor.light} ${scoreColor.text}`}>
                                            {scoreColor.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Pro/Con Insights */}
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                        <CheckCircle2 className="size-3 text-emerald-500" /> Key Strengths
                                    </p>
                                    <ul className="space-y-0.5">
                                        {result.key_strengths.slice(0, 2).map((s, i) => (
                                            <li key={i} className="flex items-center gap-1.5 text-[11px] font-semibold">
                                                <CheckCircle2 className="size-2.5 text-emerald-500 shrink-0" />{s}
                                            </li>
                                        ))}
                                        {result.key_strengths.length > 2 && <li className="text-[10px] text-muted-foreground">+{result.key_strengths.length - 2} more</li>}
                                    </ul>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                        <AlertTriangle className="size-3 text-amber-500" /> Weaknesses
                                    </p>
                                    <ul className="space-y-0.5">
                                        {result.key_weaknesses.slice(0, 2).map((w, i) => (
                                            <li key={i} className="flex items-center gap-1.5 text-[11px] font-semibold">
                                                <AlertTriangle className="size-2.5 text-amber-500 shrink-0" />{w}
                                            </li>
                                        ))}
                                        {result.key_weaknesses.length > 2 && <li className="text-[10px] text-muted-foreground">+{result.key_weaknesses.length - 2} more</li>}
                                    </ul>
                                </div>
                            </div>

                            {/* View AI Logic button */}
                            <div className="flex items-center justify-end">
                                <Button variant="ghost" className="rounded-xl group-hover:bg-primary/5 group-hover:text-primary transition-all gap-2 font-black uppercase tracking-widest text-[10px]">
                                    View AI Logic <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                    );
                })}
            </div>

            {/* "AI Audit" Modal — Transparency (from doc) */}
            <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
                <DialogContent className="max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    {selectedResult && (() => {
                        const scoreColor = getScoreColor(selectedResult.overall_score);
                        return (
                        <div className="flex flex-col h-[80vh]">
                            <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent border-b border-border/50">
                                <DialogHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${selectedResult.hard_criteria_met ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'}`}>
                                                {selectedResult.hard_criteria_met ? "PASSED" : "FAILED REQUIREMENTS"}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${scoreColor.light} ${scoreColor.text}`}>
                                                {scoreColor.label}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Brain className="size-4 text-primary" />
                                            <span className={`text-xl font-black ${scoreColor.text}`}>{selectedResult.overall_score.toFixed(1)}% FIT</span>
                                        </div>
                                    </div>
                                    <DialogTitle className="text-3xl font-black tracking-tight">{selectedResult.applicant_name}</DialogTitle>
                                    <DialogDescription className="text-muted-foreground font-medium text-lg">
                                        AI Screening Report — Automated Analysis
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Explanation */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary">
                                        <MessageSquare className="size-4" /> AI Explanation
                                    </div>
                                    <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 text-sm leading-relaxed font-medium">
                                        {selectedResult.explanation}
                                    </div>
                                </section>

                                {/* Pro/Con — two columns with bullet points */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600">
                                            <CheckCircle2 className="size-4" /> Strengths
                                        </div>
                                        <ul className="space-y-2">
                                            {selectedResult.key_strengths.map((s, i) => (
                                                <li key={i} className="flex gap-3 text-sm font-semibold p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-500">
                                            <AlertTriangle className="size-4" /> Weaknesses
                                        </div>
                                        <ul className="space-y-2">
                                            {selectedResult.key_weaknesses.map((w, i) => (
                                                <li key={i} className="flex gap-3 text-sm font-semibold p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                                    <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                                                    {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                </div>

                                {/* Raw LLM Response — "View AI Logic" (transparency) */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                                        <FileSearch className="size-4" /> Raw AI Logic (Thought Process)
                                    </div>
                                    <pre className="p-6 rounded-2xl bg-zinc-950 text-zinc-400 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
                                        {selectedResult.raw_llm_response}
                                    </pre>
                                </section>
                            </div>

                            <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-end">
                                <Button onClick={() => setSelectedResult(null)} className="rounded-xl px-8 font-black uppercase tracking-widest">
                                    Close Report
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
