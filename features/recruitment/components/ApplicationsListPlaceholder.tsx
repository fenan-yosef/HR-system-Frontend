"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { User, FileText, CheckCircle2, Clock, Filter, ArrowUpRight } from "lucide-react";

export function ApplicationsListPlaceholder() {
  const apps = [
    { name: "Saron Tekle", role: "Senior Frontend Engineer", stage: "Interview", date: "Jan 24, 2026", score: 92 },
    { name: "Kebede Molla", role: "HR Business Partner", stage: "Reviewing", date: "Jan 22, 2026", score: 78 },
    { name: "Hilina Bekele", role: "Product Designer", stage: "New", date: "Jan 24, 2026", score: 85 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
             {[1,2,3].map(i => (
               <div key={i} className="size-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                 {String.fromCharCode(64 + i)}
               </div>
             ))}
          </div>
          <p className="text-sm font-medium text-muted-foreground">+14 more applied today</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg bg-muted/50">
          <Filter className="size-4" />
          Filter
        </button>
      </div>

      <div className="grid gap-4">
        {apps.map((app, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="group flex items-center justify-between p-4 border-none shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-4 flex-1">
                <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <User className="size-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base leading-none mb-1">{app.name}</h4>
                  <p className="text-xs text-muted-foreground font-medium">{app.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="hidden sm:flex flex-col items-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Match Score</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${app.score}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-primary"
                        />
                    </div>
                    <span className="text-xs font-bold">{app.score}%</span>
                  </div>
                </div>

                <div className="flex flex-col items-end min-w-[100px]">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    app.stage === "Interview" ? "bg-amber-500/10 text-amber-600" :
                    app.stage === "Reviewing" ? "bg-blue-500/10 text-blue-600" :
                    "bg-emerald-500/10 text-emerald-600"
                  }`}>
                    {app.stage === "Interview" ? <Clock className="size-3" /> : <CheckCircle2 className="size-3" />}
                    {app.stage}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1 font-medium">{app.date}</span>
                </div>
                
                <div className="bg-muted p-2 rounded-lg group-hover:bg-primary/10 transition-colors">
                  <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
