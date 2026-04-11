"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Search, Download, X, Loader2, CalendarCheck, Wand2, Filter, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ApplicationFiltersProps {
  search: string;
  status: string;
  minScore: number;
  appliedToday: boolean;
  selectedJobId: string | number;
  jobPositions: { position_id: number; title: string }[];
  isExporting: boolean;
  isBatchEvaluating?: boolean;
  onBatchEvaluate?: () => void;
  canBatchEvaluate?: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onMinScoreChange: (value: number) => void;
  onAppliedTodayChange: (value: boolean) => void;
  onJobChange: (value: string) => void;
  onExport: () => void;
  onReset: () => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
}

export function ApplicationFilters({
  search,
  status,
  minScore,
  appliedToday,
  selectedJobId,
  jobPositions = [],
  isExporting,
  isBatchEvaluating,
  onBatchEvaluate,
  canBatchEvaluate,
  onSearchChange,
  onStatusChange,
  onMinScoreChange,
  onAppliedTodayChange,
  onJobChange,
  onExport,
  onReset,
  sortBy,
  onSortByChange,
}: ApplicationFiltersProps) {
  const hasActiveFilters = search || status || minScore > 0 || appliedToday || selectedJobId;

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          className="pl-10 h-11 bg-background border-border/50 shadow-sm rounded-xl focus-visible:ring-primary"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Card className="p-5 border-none shadow-sm rounded-2xl bg-muted/20 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground">
            <Filter className="size-3.5" />
            Filter Sidebar
          </div>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
            >
              <Trash2 size={10} /> Reset
            </button>
          )}
        </div>

        {/* Global Evaluation Trigger */}
        {canBatchEvaluate && (
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Intelligence</Label>
            <Button
              className="w-full h-11 rounded-xl font-bold flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
              onClick={onBatchEvaluate}
              disabled={isBatchEvaluating}
            >
              {isBatchEvaluating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              {isBatchEvaluating ? "Navigating..." : "Screen All Applicants"}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hiring Status</Label>
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-border/50 shadow-sm rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="confirmed">Confirmed</option>
              <option value="interview_invited">Interview Invited</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Job Position</Label>
            <select
              value={selectedJobId}
              onChange={(e) => onJobChange(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-border/50 shadow-sm rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
            >
              <option value="">All Job Posts</option>
              {jobPositions.map((job) => (
                <option key={job.position_id} value={job.position_id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sort Candidates</Label>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full h-11 px-4 bg-background border border-border/50 shadow-sm rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="score_desc">Highest Match</option>
              <option value="score_asc">Lowest Match</option>
              <option value="rank_asc">AI Rank (1-X)</option>
            </select>
          </div>

          {/* Applied Today toggle */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timeline</Label>
            <button
              onClick={() => onAppliedTodayChange(!appliedToday)}
              className={`w-full h-11 px-4 rounded-xl text-xs font-bold flex items-center justify-between gap-2 transition-all ${appliedToday
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-background border border-border/50 shadow-sm text-muted-foreground hover:bg-muted/50"
                }`}
            >
              <div className="flex items-center gap-2">
                <CalendarCheck className="size-4" />
                Show Applied Today
              </div>
              {appliedToday && <X size={14} />}
            </button>
          </div>

          {/* Min Score Slider - Document requirement */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <SlidersHorizontal size={12} /> Min Score
              </Label>
              <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {minScore}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minScore}
              onChange={(e) => onMinScoreChange(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[8px] font-black text-muted-foreground px-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <Button
            className="w-full h-11 rounded-xl font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all active:scale-95"
            onClick={onExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block mb-1.5 ${className}`}>{children}</label>;
}
