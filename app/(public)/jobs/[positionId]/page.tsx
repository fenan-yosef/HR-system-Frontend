"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  fetchPublicJobPosition,
  fetchDepartmentsAll
} from "@/services/recruitmentService";
import { JobPosition } from "@/types/recruitment";
import { Department } from "@/types/department";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, ArrowRight, Building2, 
  Clock, MapPin, Sparkles, Share2,
  Calendar, Briefcase, UserCheck
} from "lucide-react";
import { getJobApplyPath } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function JobDetailsPage() {
  const params = useParams();
  const positionId = Number(params.positionId);
  const [job, setJob] = useState<JobPosition | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!positionId) return;

    Promise.all([
      fetchPublicJobPosition(positionId),
      fetchDepartmentsAll().catch(() => ({ results: [] }))
    ])
      .then(([jobData, deptRes]) => {
        setJob(jobData);
        setDepartments(deptRes.results || []);
      })
      .catch((err) => {
        console.error("Failed to load details", err);
        setError("Job listing not found or has been removed.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [positionId]);

  const getDeptName = (id?: number | null) => {
    if (!id) return "General";
    return departments.find(d => d.department_id === id)?.name || "Department";
  };

  const handleShare = () => {
    if (!job) return;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this opening: ${job.title}`,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
        </div>
        <p className="text-sm font-black text-muted-foreground uppercase tracking-widest animate-pulse">Loading Position...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-24 max-w-md mx-auto space-y-6 px-4">
        <div className="size-20 rounded-[2.5rem] bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto shadow-sm">
          <Briefcase className="size-10" />
        </div>
        <h2 className="text-3xl font-black tracking-tight">{error || "Listing Over"}</h2>
        <p className="text-muted-foreground font-medium">This position may have been filled or the posting has reached its deadline.</p>
        <Link href="/jobs" className="block">
          <Button variant="outline" className="h-14 px-8 rounded-2xl font-bold w-full md:w-auto">
            <ArrowLeft className="mr-2 size-4" />
            Browse Openings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-12 pb-24">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/jobs">
          <motion.button 
            whileHover={{ x: -10 }}
            className="flex items-center gap-3 text-sm font-black text-muted-foreground/60 hover:text-primary transition-colors group uppercase tracking-widest"
          >
            <div className="size-10 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <ArrowLeft className="size-4" />
            </div>
            Back to Openings
          </motion.button>
        </Link>

        <Button 
          variant="ghost" 
          size="icon-sm" 
          onClick={handleShare}
          className="rounded-2xl h-12 w-12 hover:bg-primary/10 hover:text-primary"
        >
          <Share2 className="size-5" />
        </Button>
      </div>

      {/* Main Header Card */}
      <section className="relative p-10 md:p-16 rounded-[3.5rem] bg-card border border-border/50 shadow-sm overflow-hidden group">
        <div className="absolute top-0 right-0 size-[32rem] bg-primary/5 rounded-full -mr-64 -mt-64 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
        
        <div className="relative space-y-8 z-10">
          <div className="flex flex-wrap items-center gap-3">
             <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/5">
                Full Time
             </div>
             <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/5">
                Active
             </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 pt-2">
               <div className="flex items-center gap-3 text-muted-foreground/80 font-bold">
                 <div className="size-10 rounded-2xl bg-muted/50 flex items-center justify-center text-primary">
                    <Building2 className="size-5" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-black">Department</span>
                   <span>{getDeptName(job.department)}</span>
                 </div>
               </div>
               <div className="flex items-center gap-3 text-muted-foreground/80 font-bold">
                 <div className="size-10 rounded-2xl bg-muted/50 flex items-center justify-center text-primary">
                    <Clock className="size-5" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-black">Date Posted</span>
                   <span>{new Date(job.posted_date).toLocaleDateString()}</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col md:flex-row gap-4 items-center">
             <Link href={getJobApplyPath(job)} className="w-full md:w-auto">
               <Button size="lg" className="h-16 px-12 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 w-full md:w-auto group/mainBtn">
                 Submit Application
                 <ArrowRight className="size-5 ml-3 group-hover/mainBtn:translate-x-2 transition-transform" />
               </Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
             <div className="flex items-center gap-3">
               <div className="h-1.5 w-1.5 rounded-full bg-primary" />
               <h3 className="text-xl font-black uppercase tracking-widest text-foreground/80">Role Overview</h3>
             </div>
             <div className="prose prose-lg max-w-none text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap selection:bg-primary/10">
               {job.description || "As part of our high-performing team, you will be instrumental in developing cutting-edge solutions. We value creativity, technical excellence, and collaborative spirit. Join us to make a lasting impact."}
             </div>
          </section>

          <section className="p-10 rounded-[2.5rem] bg-muted/30 border border-border/40 space-y-6">
             <div className="flex items-center gap-3">
               <UserCheck className="size-5 text-primary" />
               <h3 className="text-lg font-black uppercase tracking-widest text-foreground/80">Hiring Process</h3>
             </div>
             <div className="grid gap-4">
                {[
                  { step: "01", label: "Initial Application Review" },
                  { step: "02", label: "Talent Advisor Consultation" },
                  { step: "03", label: "Technical / Logic Evaluation" },
                  { step: "04", label: "Foundational Leadership Sync" }
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 group/step">
                    <span className="text-xl font-black text-primary/30 group-hover/step:text-primary transition-colors">{s.step}</span>
                    <div className="h-px flex-1 bg-border/50" />
                    <span className="font-bold text-muted-foreground group-hover/step:text-foreground transition-colors">{s.label}</span>
                  </div>
                ))}
             </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
           <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-card space-y-6 relative overflow-hidden group/card shadow-xl shadow-primary/5">
              <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative space-y-6">
                <h3 className="text-lg font-black">Why Join Us?</h3>
                <div className="space-y-4">
                  {[
                    "Mission Driven Culture",
                    "Elite Technical Stack",
                    "Global Growth Exposure",
                    "Remote-First Flexibility"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 group/item">
                       <div className="size-1.5 rounded-full bg-emerald-500 group-hover/item:scale-150 transition-transform" />
                       <span className="text-sm font-bold text-muted-foreground/80 group-hover/item:text-foreground transition-colors">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                   <Link href="/apply-demo">
                     <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                       Learn About Culture
                     </Button>
                   </Link>
                </div>
              </div>
           </Card>

           <div className="p-8 rounded-[2.5rem] bg-primary text-white space-y-6 shadow-xl shadow-primary/20">
              <h3 className="text-lg font-black leading-tight">Ready to take the next step in your career?</h3>
              <p className="text-white/80 text-sm font-medium">Join 500+ professionals building the next generation of HR technology.</p>
              <Link href={getJobApplyPath(job)} className="block">
                <Button className="w-full h-14 rounded-2xl bg-white text-primary hover:bg-white/90 font-black uppercase text-[10px] tracking-widest shadow-lg">
                  Apply Now
                </Button>
              </Link>
           </div>
        </aside>
      </div>
    </div>
  );
}
