"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Briefcase, MapPin, Users, Calendar, MoreVertical } from "lucide-react";

export function JobPostingListPlaceholder() {
  const jobs = [
    { title: "Senior Frontend Engineer", dept: "Engineering", type: "Full-time", loc: "Remote", applicants: 24 },
    { title: "HR Business Partner", dept: "Operaions", type: "Hybrid", loc: "Addis Ababa", applicants: 12 },
    { title: "Product Designer", dept: "Design", type: "Full-time", loc: "Remote", applicants: 8 },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight">Active Postings</h3>
        <div className="flex gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">12 Open Roles</span>
        </div>
      </div>

      <div className="grid gap-4">
        {jobs.map((job, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group flex items-center justify-between p-5 border-none shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="bg-muted p-3 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Briefcase className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{job.title}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <MapPin className="size-3" /> {job.loc}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <Users className="size-3" /> {job.applicants} Applicants
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-primary uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded-md">
                      {job.dept}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-bold text-foreground">{job.type}</span>
                  <span className="text-[10px] text-muted-foreground">Posted 2 days ago</span>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <MoreVertical className="size-5 text-muted-foreground" />
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center p-8 border-2 border-dashed border-border/50 rounded-2xl bg-muted/20"
      >
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">More postings will appear as you integrate and fetch from the API.</p>
          <button className="mt-4 text-xs font-bold text-primary hover:underline">Download Report (.xlsx)</button>
        </div>
      </motion.div>
    </div>
  );
}
