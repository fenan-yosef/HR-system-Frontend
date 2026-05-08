"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Briefcase, ShieldCheck, PieChart, ArrowUpRight, Zap, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "../widgets/StatCard";
import { SimpleBarChart, ActionButton } from "../widgets/AnalyticsWidgets";

interface CEODashboardProps {
  metrics: any;
}

export function CEODashboard({ metrics }: CEODashboardProps) {
  // Format trend data for chart
  const trendData = (metrics.application_trends || []).map((t: any) => ({
    label: new Date(t.month).toLocaleDateString('en-US', { month: 'short' }),
    value: t.count
  }));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-400">
            Strategic Command Center
          </h2>
          <p className="text-muted-foreground font-medium">Global organizational insights and growth metrics.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {metrics.stats.map((stat: any, i: number) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recruitment Funnel - Premium Black & Silver Theme */}
        <Card className="p-8 border-none bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-zinc-100 shadow-2xl relative overflow-hidden lg:col-span-1 ring-1 ring-white/10">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                <Target className="size-5 text-zinc-300" />
              </div>
              Hiring Funnel
            </h3>
            <div className="space-y-10">
              {[
                { label: "Applicants", value: metrics.recruitment_funnel.applied, color: "bg-zinc-700" },
                { label: "Shortlisted", value: metrics.recruitment_funnel.shortlisted, color: "bg-zinc-400 shadow-[0_0_15px_rgba(255,255,255,0.2)]" },
                { label: "Hired", value: metrics.recruitment_funnel.hired, color: "bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)]" },
              ].map((stage, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">{stage.label}</span>
                    <span className="text-2xl font-black">{stage.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stage.value / (metrics.recruitment_funnel.applied || 1)) * 100}%` }}
                      transition={{ duration: 1.5, delay: i * 0.2, ease: "circOut" }}
                      className={`h-full ${stage.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative silver glow */}
          <div className="absolute -bottom-20 -left-20 size-64 bg-white/5 rounded-full blur-[80px]" />
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
        </Card>

        {/* Application Trends */}
        <Card className="p-6 border-none bg-card/50 backdrop-blur-sm shadow-xl lg:col-span-2 border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                <TrendingUp className="size-6 text-indigo-500" />
              </div>
              <h3 className="text-lg font-black">Application Velocity</h3>
            </div>
          </div>
          
          <SimpleBarChart data={trendData} color="bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
        </Card>
      </div>

      {/* Strategic Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ActionButton label="Review Strategy" icon={Zap} variant="black" />
        <ActionButton label="Expansion Plan" icon={ArrowUpRight} variant="outline" />
        <ActionButton label="Budget Report" icon={PieChart} variant="outline" />
        <ActionButton label="Board Meeting" icon={Users} variant="outline" />
      </div>

      {/* Department Breakdown */}
      <Card className="p-6 border-none bg-card/50 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <PieChart className="size-6 text-amber-500" />
          </div>
          <h3 className="text-lg font-black">Headcount by Dept</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {metrics.department_headcount.map((dept: any, i: number) => (
            <div key={i} className="group p-6 rounded-3xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-border/50 text-center relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-3xl font-black text-primary block mb-1">{dept.value}</span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate block">
                  {dept.department__name || "General"}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 size-12 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
