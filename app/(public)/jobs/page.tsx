"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchPublicJobPositions,
  fetchDepartmentsAll
} from "@/services/recruitmentService";
import { JobPosition } from "@/types/recruitment";
import { Department } from "@/types/department";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Share2, Briefcase, ArrowRight,
  Search, Users, Filter
} from "lucide-react";
import { getJobApplyPath } from "@/lib/utils";

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<number | "all">("all");

  useEffect(() => {
    Promise.all([
      fetchPublicJobPositions(),
      fetchDepartmentsAll().catch(() => ({ results: [] }))
    ])
      .then(([jobRes, deptRes]) => {
        const results = Array.isArray(jobRes) ? jobRes : jobRes.results;
        if (!results) throw new Error("No results found");

        const openJobs = results.filter((job) =>
          job.status === "open" || job.status === "opend"
        );
        setJobs(openJobs);
        setDepartments(deptRes.results || []);
      })
      .catch((err) => {
        console.error("Failed to load data", err);
        setError("Unable to load job openings. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getDeptName = (id?: number | null) => {
    if (!id) return "General";
    return departments.find(d => d.department_id === id)?.name || "Department";
  };

  const handleShare = (job: JobPosition) => {
    const applyPath = getJobApplyPath(job);
    const url = `${window.location.origin}${applyPath}`;
    if (navigator.share) {
      navigator.share({
        title: `Apply for ${job.title}`,
        text: `Check out this opening: ${job.title}`,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === "all" || job.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
        </div>
        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest animate-pulse">Scanning Opportunities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950/50">
      {/* Redesigned Compact Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-border/40 py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-primary/10 text-primary">
               <Briefcase size={20} className="font-bold" />
             </div>
             <div>
               <h1 className="text-xl font-black tracking-tight">Careers</h1>
               <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                 <span className="flex items-center gap-1"><Users size={10} /> {jobs.length} Open Roles</span>
               </div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 max-w-2xl justify-end">
            <div className="relative w-full sm:max-w-xs group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find your role..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/30 border border-transparent focus:bg-background focus:border-primary/20 transition-all outline-none text-sm font-bold"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={14} className="text-muted-foreground ml-2 hidden sm:block" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="h-10 w-full sm:w-40 rounded-xl bg-muted/30 border border-transparent px-3 text-xs font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
              >
                <option value="all">All DepTS</option>
                {departments.map(d => (
                  <option key={d.department_id} value={d.department_id}>{d.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-10">
        {/* Removed non-API statistics bar to keep UI focused on API-driven job fields */}

        {/* Jobs Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Available Postings</h2>
             <div className="h-px flex-1 bg-border/40 mx-6 hidden md:block" />
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sorting by Newest</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredJobs.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center space-y-4 rounded-[2rem] border-2 border-dashed border-border/40">
                  <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 opacity-50">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight">No results matched your search</h3>
                  <Button onClick={() => {setSearchQuery(""); setSelectedDept("all");}} variant="link" className="font-black text-xs uppercase tracking-widest">Reset Filters</Button>
                </motion.div>
              ) : (
                filteredJobs.map((job, i) => (
                  <motion.div
                    key={job.position_id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className="group relative p-6 md:p-8 rounded-[2rem] border border-border/50 bg-white/50 dark:bg-zinc-900/50 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-all duration-500" />
                       
                       <div className="flex flex-col md:flex-row md:items-center gap-8">
                          {/* Left: Job Major Info */}
                          <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                               <div className="flex flex-wrap items-center gap-2">
                                   <span className="px-2.5 py-1 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                     {getDeptName(job.department)}
                                   </span>
                               </div>
                               <Link href={`/jobs/${job.position_id}`}>
                                 <h3 className="text-2xl font-black group-hover:text-primary transition-colors tracking-tight leading-tight">
                                   {job.title}
                                 </h3>
                               </Link>
                            </div>

                            <p className="text-sm font-medium text-muted-foreground leading-relaxed line-clamp-2 max-w-3xl">
                               {job.description || "Join our team to help build the next generation of enterprise tools. We're looking for passionate individuals who value quality and innovation."}
                            </p>

                            {/* Skills Chips */}
                            {job.required_skills && job.required_skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {job.required_skills.slice(0, 5).map((s) => (
                                  <span key={s} className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wide border border-border/30">
                                    {s}
                                  </span>
                                ))}
                                {job.required_skills.length > 5 && (
                                  <span className="px-2 py-0.5 rounded-md bg-muted/40 text-muted-foreground/60 text-[10px] font-bold uppercase">
                                    +{job.required_skills.length - 5}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right: Actions */}
                          <div className="flex flex-row md:flex-col items-center gap-3 shrink-0 pt-4 md:pt-0">
                             <div className="hidden md:flex flex-col items-end mb-2 mr-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Requirements</p>
                                <p className="text-xs font-bold">{job.min_years_experience ? `${job.min_years_experience}yrs` : 'Entry'}</p>
                             </div>
                             
                             <div className="flex items-center gap-2 w-full md:w-auto">
                               <Button 
                                 size="icon" 
                                 variant="ghost" 
                                 className="rounded-2xl shrink-0 border border-border/40 hover:bg-primary/10 hover:text-primary"
                                 onClick={() => handleShare(job)}
                               >
                                 <Share2 size={16} />
                               </Button>
                               <Link href={getJobApplyPath(job)} className="flex-1">
                                 <Button className="w-full h-12 md:w-40 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/10 hover:shadow-primary/20 group/btn transition-all duration-300">
                                   Apply <ArrowRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                 </Button>
                               </Link>
                             </div>
                          </div>
                       </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Culture / Newsletter CTA removed per request to keep only API-driven fields */}
      </main>

      <footer className="py-12 border-t border-border/40 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">© 2026 HR-Systems Architecture • All Rights Reserved</p>
      </footer>
    </div>
  );
}
