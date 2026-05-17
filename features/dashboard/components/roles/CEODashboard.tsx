"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, ArrowUpRight, Zap, Target, PieChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "../widgets/StatCard";
import { ActionButton } from "../widgets/AnalyticsWidgets";
import { AreaChart, DonutChart } from "@/components/ui/charts";

interface CEODashboardProps {
  metrics: any;
}

export function CEODashboard({ metrics }: CEODashboardProps) {
  // Format application velocity trends data for area chart
  const trendData = (metrics.application_trends || []).map((t: any) => ({
    label: new Date(t.month).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    value: t.count,
  }));

  // Format department headcount data for donut chart
  const deptColors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const deptData = (metrics.department_headcount || []).map((d: any, i: number) => ({
    label: d.department__name || "General",
    value: d.value,
    color: deptColors[i % deptColors.length],
  }));

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-950 via-zinc-700 to-zinc-500">
            Strategic Command Center
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Global organizational insights and growth metrics.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-3">
        {metrics.stats.map((stat: any, i: number) => (
          <StatCard key={i} {...stat} delay={i * 0.05} />
        ))}
      </div>

      {/* Row 2: Hiring Funnel & Application Velocity Area Chart */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recruitment Funnel - Premium Black & Silver Theme */}
        <Card className="p-4 border-none bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-zinc-100 shadow-md relative overflow-hidden lg:col-span-1 ring-1 ring-white/10 flex flex-col justify-between">
          <div className="relative z-10">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
                <Target className="size-4 text-zinc-300" />
              </div>
              Hiring Funnel
            </h3>
            <div className="space-y-4">
              {[
                { label: "Applicants", value: metrics.recruitment_funnel.applied, color: "bg-zinc-700" },
                { label: "Shortlisted", value: metrics.recruitment_funnel.shortlisted, color: "bg-zinc-400 shadow-[0_0_10px_rgba(255,255,255,0.15)]" },
                { label: "Hired", value: metrics.recruitment_funnel.hired, color: "bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" },
              ].map((stage, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{stage.label}</span>
                    <span className="text-lg font-bold">{stage.value}</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(stage.value / (metrics.recruitment_funnel.applied || 1)) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.15, ease: "circOut" }}
                      className={`h-full ${stage.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Decorative silver glow */}
          <div className="absolute -bottom-20 -left-20 size-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </Card>

        {/* Application Velocity Area Chart */}
        <Card className="p-4 border-none bg-card/50 backdrop-blur-sm shadow-md lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <TrendingUp className="size-4.5 text-indigo-500" />
            </div>
            <h3 className="text-sm font-bold">Application Velocity</h3>
          </div>
          <div className="flex-1 min-h-[160px]">
            {trendData.length > 0 ? (
              <AreaChart
                data={trendData}
                height={160}
                strokeColor="#06b6d4"
                gradientColors={["rgba(6, 182, 212, 0.3)", "rgba(6, 182, 212, 0.0)"]}
                valueSuffix=" apps"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                No trends data available.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Row 3: Department Headcount breakdown with Donut Chart */}
      <Card className="p-4 border-none bg-card/50 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <PieChart className="size-4.5 text-amber-500" />
          </div>
          <h3 className="text-sm font-bold">Headcount by Dept</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Donut chart view */}
          <div className="md:col-span-1 flex justify-center border-r border-border/40 pr-0 md:pr-6">
            <DonutChart data={deptData} centerLabel="Headcount" />
          </div>

          {/* Cards list grid */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {metrics.department_headcount.map((dept: any, i: number) => (
              <div
                key={i}
                className="group p-2.5 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-border/50 text-center relative overflow-hidden"
              >
                <div className="relative z-10">
                  <span
                    className="text-xl font-bold block mb-0.5"
                    style={{ color: deptColors[i % deptColors.length] }}
                  >
                    {dept.value}
                  </span>
                  <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider truncate block">
                    {dept.department__name || "General"}
                  </span>
                </div>
                <div
                  className="absolute -bottom-2 -right-2 size-8 rounded-full blur-lg opacity-10 group-hover:opacity-20 transition-colors pointer-events-none"
                  style={{ backgroundColor: deptColors[i % deptColors.length] }}
                />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Strategic Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ActionButton label="Review Strategy" icon={Zap} variant="black" />
        <ActionButton label="Expansion Plan" icon={ArrowUpRight} variant="outline" />
        <ActionButton label="Budget Report" icon={PieChart} variant="outline" />
        <ActionButton label="Board Meeting" icon={Users} variant="outline" />
      </div>
    </div>
  );
}
