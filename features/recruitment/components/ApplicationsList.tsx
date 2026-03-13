"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { User, CheckCircle2, Clock, ArrowUpRight, Loader2, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchApplications, triggerShortlist, exportApplicationsCsv } from "@/services/recruitmentService";
import { Application } from "@/types/recruitment";
import { useAuth } from "@/hooks/useAuth";
import { isHRStaff, isHRCeo } from "@/lib/permissions";
import { ApplicationMetrics } from "./ApplicationMetrics";
import { ApplicationFilters } from "./ApplicationFilters";

export function ApplicationsList() {
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [startsWith, setStartsWith] = useState("");
  const [page, setPage] = useState(1);

  const { user } = useAuth();
  const canShortlist = isHRStaff(user);
  const canCEOActions = isHRCeo(user);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchApplications({
        page,
        search,
        status,
        min_score: minScore > 0 ? minScore : undefined,
        starts_with: startsWith || undefined,
      });
      console.log("Fetched applications:", response.results);
      setApps(response.results);
      setTotalCount(response.count);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, minScore, startsWith]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadApplications();
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadApplications, search]);

  const handleShortlist = async (appId: number) => {
    try {
      await triggerShortlist(appId);
      window.alert("Application shortlisted successfully");
      loadApplications();
    } catch (error) {
      window.alert("Failed to shortlist application");
    }
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setMinScore(0);
    setStartsWith("");
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <ApplicationMetrics />

      <ApplicationFilters 
        search={search}
        status={status}
        minScore={minScore}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onMinScoreChange={setMinScore}
        onExport={() => exportApplicationsCsv({ status, min_score: minScore })}
        onReset={handleResetFilters}
      />

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
        <button 
          onClick={() => setStartsWith("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!startsWith ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
        >
          All
        </button>
        {alphabet.map((letter) => (
          <button
            key={letter}
            onClick={() => setStartsWith(letter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${startsWith === letter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="grid gap-4 min-h-[400px]">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
          ))
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
            <User className="size-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground font-medium">No candidates match your criteria.</p>
            <button onClick={handleResetFilters} className="mt-4 text-xs font-bold text-primary hover:underline">Clear all filters</button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {apps.map((app, i) => (
              <motion.div
                key={app.application_id}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 border-none shadow-sm hover:shadow-md transition-all gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <User className="size-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base leading-none mb-1.5">{app.full_name || app.applicant?.full_name}</h4>
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                         {app.position?.title}
                         <span className="size-1 rounded-full bg-border" />
                         {new Date(app.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* AI Evaluation Section */}
                  <div className="flex items-center gap-6 px-6 border-x border-border/50 hidden lg:flex">
                    <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                       <div className="flex items-center justify-between w-full">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Match Score</span>
                          <span className="text-xs font-bold text-primary">{(app as any).evaluation?.matching_percentage || 0}%</span>
                       </div>
                       <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(app as any).evaluation?.matching_percentage || 0}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-primary"
                          />
                       </div>
                    </div>
                    {(app as any).evaluation?.ai_rank && (
                      <div className="bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <Star className="size-3.5 fill-current" />
                        <span className="text-xs font-extrabold">RANK #{(app as any).evaluation.ai_rank}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6 justify-between sm:justify-end">
                    <div className="flex flex-col items-end min-w-[100px]">
                      <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        app.status === "shortlisted" ? "bg-emerald-500/10 text-emerald-600" : 
                        app.status === "pending" ? "bg-blue-500/10 text-blue-600" :
                        app.status === "rejected" ? "bg-red-500/10 text-red-600" :
                        "bg-primary/10 text-primary"
                      }`}>
                        {app.status === "shortlisted" ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
                        {app.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {canShortlist && app.status === "pending" && (
                        <button
                          onClick={() => handleShortlist(app.application_id)}
                          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                          Shortlist
                        </button>
                      )}
                      <div className="bg-muted p-2.5 rounded-xl group-hover:bg-primary/10 transition-colors cursor-pointer">
                        <ArrowUpRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 10 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2 rounded-xl bg-muted disabled:opacity-30 hover:bg-muted/80 transition-colors"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="text-sm font-bold">Page {page} of {Math.ceil(totalCount / 10)}</span>
          <button 
            disabled={page >= Math.ceil(totalCount / 10)}
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-xl bg-muted disabled:opacity-30 hover:bg-muted/80 transition-colors"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
