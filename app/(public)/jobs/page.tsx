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
  Share2, Briefcase, Calendar,
  MapPin, Clock, ArrowRight,
  Sparkles, Search, Building2,
  ChevronRight
} from "lucide-react";
import { getJobApplyPath } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-6 text-primary animate-pulse" />
        </div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Curating opportunities...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-12 pb-24">
      {/* Hero Section */}
      <section className="relative text-center py-16 space-y-6 overflow-hidden rounded-[3rem] bg-card border border-border/50 shadow-sm group">
        <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
        <div className="absolute bottom-0 left-0 size-96 bg-primary/5 rounded-full -ml-48 -mb-48 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative space-y-4 z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-2">
            <Sparkles className="size-3" /> Career Opportunities
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
            Jobs
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            We look for visionary thinkers and relentless builders.
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto px-6 pt-4 relative z-10">
          <div className="relative group/search">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles (e.g. Engineer, Designer)..."
              className="w-full h-16 pl-14 pr-6 rounded-2xl bg-background border-none shadow-xl shadow-primary/5 focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-lg"
            />
          </div>
        </div>
      </section>

      {/* Jobs Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            Open Positions
            <span className="text-sm font-bold bg-muted px-3 py-1 rounded-full text-muted-foreground">
              {filteredJobs.length}
            </span>
          </h2>
          <div className="hidden md:flex gap-4">
            {/* Potential filters could go here */}
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <Card className="py-24 text-center border-dashed bg-transparent rounded-[2.5rem]">
            <div className="size-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Briefcase className="size-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold">No active openings matching "{searchQuery}"</h3>
            <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Check back regularly or follow our social channels for updates.</p>
            <Button onClick={() => setSearchQuery("")} variant="link" className="mt-4 font-bold">Clear Search</Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job, i) => (
                <motion.div
                  key={job.position_id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="group p-1 border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] bg-white dark:bg-card relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleShare(job)}
                        className="rounded-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all hover:bg-primary/10 hover:text-primary"
                      >
                        <Share2 className="size-4" />
                      </Button>
                    </div>

                    <div className="p-8 flex flex-col md:flex-row md:items-center gap-8">
                      <div className="size-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shrink-0 border border-primary/10">
                        <Building2 className="size-10" />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                          <Link href={`/jobs/${job.position_id}`} className="block">
                            <h3 className="text-2xl font-black group-hover:text-primary transition-colors leading-tight">
                              {job.title}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-muted-foreground/70 uppercase tracking-tighter">
                            <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-lg">
                              <Building2 className="size-3.5" /> {getDeptName(job.department)}
                            </span>
                            <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-lg">
                              <Clock className="size-3.5" /> Posted {new Date(job.posted_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <p className="text-muted-foreground font-medium line-clamp-2 max-w-2xl leading-relaxed">
                          {job.description || "Exciting opportunity to join a high-growth team building future-proof infrastructure."}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Link href={`/jobs/${job.position_id}`} className="flex-1 md:flex-none">
                          <Button variant="ghost" className="w-full h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
                            Details
                          </Button>
                        </Link>
                        <Link href={getJobApplyPath(job)} className="flex-1 md:flex-none">
                          <Button className="w-full h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 group/btn">
                            Apply Now
                            <ArrowRight className="size-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <section className="py-12 border-t border-border/50 text-center space-y-4">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Our Culture</p>
        <h2 className="text-3xl font-black">Not seeing the right fit?</h2>
        <p className="text-muted-foreground max-w-md mx-auto font-medium">We're always growing. Sign up for our newsletter to get notified about new opportunities.</p>
        <div className="pt-4">
          <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold">Contact Recruitment</Button>
        </div>
      </section>
    </div>
  );
}
