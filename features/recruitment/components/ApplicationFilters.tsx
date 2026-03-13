"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApplicationFiltersProps {
  search: string;
  status: string;
  minScore: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onMinScoreChange: (value: number) => void;
  onExport: () => void;
  onReset: () => void;
}

export function ApplicationFilters({
  search,
  status,
  minScore,
  onSearchChange,
  onStatusChange,
  onMinScoreChange,
  onExport,
  onReset,
}: ApplicationFiltersProps) {
  return (
    <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10 h-11 bg-background border-none shadow-sm rounded-xl focus-visible:ring-primary"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            className="h-11 px-4 bg-background border-none shadow-sm rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="confirmed">Confirmed</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>

          <div className="hidden md:flex items-center gap-3 px-4 h-11 bg-background shadow-sm rounded-xl">
             <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Min Score: {minScore}%</span>
             <input 
               type="range" 
               min="0" 
               max="100" 
               step="5"
               value={minScore}
               onChange={(e) => onMinScoreChange(parseInt(e.target.value))}
               className="w-24 accent-primary" 
             />
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-11 w-11 rounded-xl hover:bg-muted"
            onClick={onReset}
            title="Reset Filters"
          >
            <X className="size-4" />
          </Button>

          <Button 
            className="h-11 px-6 rounded-xl font-bold flex items-center gap-2"
            onClick={onExport}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
}
