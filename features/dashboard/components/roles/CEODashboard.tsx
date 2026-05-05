"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Briefcase, ShieldCheck, PieChart, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "../widgets/StatCard";

interface CEODashboardProps {
  metrics: any;
}

export function CEODashboard({ metrics }: CEODashboardProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            Strategic Overview
          </h2>
          <p className="text-muted-foreground">High-level growth and hiring analytics.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {metrics.stats.map((stat: any, i: number) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recruitment Funnel */}
        <Card className="p-8 border-none bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl relative overflow-hidden lg:col-span-1">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="size-5" />
              Recruitment Funnel
            </h3>
            <div className="space-y-8">
              {[
                { label: "Applied", value: metrics.recruitment_funnel.applied, color: "bg-white/20" },
                { label: "Shortlisted", value: metrics.recruitment_funnel.shortlisted, color: "bg-white/40" },
                { label: "Hired", value: metrics.recruitment_funnel.hired, color: "bg-white" },
              ].map((stage, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>{stage.label}</span>
                    <span>{stage.value}</span>
                  </div>
                  <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stage.value / (metrics.recruitment_funnel.applied || 1)) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className={`h-full ${stage.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        </Card>

        {/* Headcount by Department */}
        <Card className="p-6 border-none bg-card/50 backdrop-blur-sm shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                <PieChart className="size-6 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold">Department Headcount</h3>
            </div>
            <button className="text-sm font-bold text-indigo-500 hover:underline flex items-center gap-1">
              Full Report <ArrowUpRight className="size-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {metrics.department_headcount.map((dept: any, i: number) => (
              <div key={i} className="p-4 rounded-2xl bg-muted/30 flex flex-col items-center gap-2 text-center">
                <span className="text-2xl font-black text-indigo-600">{dept.value}</span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {dept.department__name || "General"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
