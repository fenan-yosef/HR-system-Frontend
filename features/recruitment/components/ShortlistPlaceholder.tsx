"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Star, Calendar, MessageSquare, UserCheck, ChevronRight } from "lucide-react";

export function ShortlistPlaceholder() {
  const shortlist = [
    { name: "Saron Tekle", role: "Senior Frontend Engineer", status: "Negotiation", interview: "Completed", rating: 4.8 },
    { name: "Abebe Bikila", role: "Mobile Lead", status: "Technical", interview: "Tomorrow, 10:00 AM", rating: 4.5 },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Priority Candidates</h3>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total: 8</span>
        </div>

        <div className="grid gap-4">
          {shortlist.map((candidate, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-6 border-none shadow-sm hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-muted flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-all">
                      {candidate.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-tight">{candidate.name}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{candidate.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-amber-500 mb-1">
                      <Star className="size-3 fill-current" />
                      <span className="text-xs font-bold">{candidate.rating}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {candidate.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Calendar className="size-3.5" /> {candidate.interview}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground border-l border-border/50 pl-4">
                      <MessageSquare className="size-3.5" /> 3 Feedback
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold tracking-tight">Pipeline Health</h3>
        <Card className="p-6 border-none bg-primary/5 shadow-none space-y-6">
           <div>
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hiring Velocity</span>
                <span className="text-xs font-bold text-primary">85%</span>
             </div>
             <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-primary"
                />
             </div>
           </div>

           <div className="space-y-4 pt-4">
             <div className="flex items-center gap-3">
               <div className="size-2 rounded-full bg-emerald-500" />
               <p className="text-xs font-medium">4 candidates in final stages</p>
             </div>
             <div className="flex items-center gap-3">
               <div className="size-2 rounded-full bg-amber-500" />
               <p className="text-xs font-medium">2 offers pending approval</p>
             </div>
           </div>

           <button className="w-full py-3 rounded-xl bg-background text-xs font-bold text-foreground border border-border shadow-sm hover:bg-muted transition-colors">
              Generate Detailed Report
           </button>
        </Card>

        <Card className="p-6 border-none bg-card shadow-sm flex items-center gap-4">
           <div className="bg-primary text-primary-foreground p-3 rounded-xl">
              <UserCheck className="size-5" />
           </div>
           <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ready to Hire</p>
              <p className="text-xl font-extrabold">12</p>
           </div>
        </Card>
      </div>
    </div>
  );
}
