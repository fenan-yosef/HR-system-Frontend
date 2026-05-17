"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Users, Lock, Activity, Server, Database, Settings, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "../widgets/StatCard";
import { ActionButton } from "../widgets/AnalyticsWidgets";
import { AreaChart, DonutChart } from "@/components/ui/charts";

interface AdminDashboardProps {
  metrics: any;
}

export function AdminDashboard({ metrics }: AdminDashboardProps) {
  // Format role distribution for chart
  const roleColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
  const roleData = (metrics.role_distribution || []).map((r: any, i: number) => ({
    label: r.role_name,
    value: r.user_count,
    color: roleColors[i % roleColors.length],
  }));

  // Format user registration growth for area chart
  const growthData = (metrics.user_growth || []).map((g: any) => ({
    label: new Date(g.month).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    value: g.count,
  }));

  // Format system API latency history for area chart
  const latencyData = (metrics.latency_history || []).map((l: any) => ({
    label: l.label,
    value: l.value,
  }));

  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            System Infrastructure
          </h2>
          <p className="text-xs text-muted-foreground font-medium">Global system health and user access management.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {metrics.stats.map((stat: any, i: number) => (
          <StatCard key={i} {...stat} delay={i * 0.05} />
        ))}
      </div>

      {/* Row 2: User Distribution & Performance Monitor */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* User Distribution Donut */}
        <Card className="p-3.5 border-none bg-card/50 backdrop-blur-sm shadow-md flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
              <Users className="size-4 text-indigo-500" />
            </div>
            <h3 className="text-xs font-bold">User Distribution</h3>
          </div>
          <div className="flex-1 flex items-center justify-center py-1">
            <DonutChart data={roleData} centerLabel="Users" />
          </div>
        </Card>

        {/* System Health Monitor */}
        <Card className="p-3.5 border-none bg-zinc-900 text-zinc-100 shadow-md overflow-hidden relative flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
                <Activity className="size-4 text-emerald-400" />
              </div>
              <h3 className="text-xs font-bold">Performance Monitor</h3>
            </div>
            
            <div className="space-y-2">
              {[
                { label: "Server Load", value: 45, icon: Server, color: "bg-emerald-500" },
                { label: "Database Query", value: 12, icon: Database, color: "bg-blue-500" },
                { label: "API Latency", value: 88, icon: Zap, color: "bg-amber-500" },
              ].map((perf, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between items-center text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <perf.icon className="size-3" />
                      {perf.label}
                    </div>
                    <span>{perf.value}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${perf.value}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${perf.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-10 -left-10 size-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        </Card>
      </div>

      {/* Row 3: User Growth & API Latency Monitor (Dual Area Charts) */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* User Growth Area Chart */}
        <Card className="p-3.5 border-none bg-card/50 backdrop-blur-sm shadow-md flex flex-col">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-1.5 bg-violet-500/10 rounded-lg">
              <TrendingUp className="size-4 text-violet-500" />
            </div>
            <h3 className="text-xs font-bold">User Growth (6 Months)</h3>
          </div>
          <div className="flex-1 min-h-[120px]">
            {growthData.length > 0 ? (
              <AreaChart
                data={growthData}
                height={120}
                strokeColor="#8b5cf6"
                gradientColors={["rgba(139, 92, 246, 0.3)", "rgba(139, 92, 246, 0.0)"]}
                valueSuffix=" acct"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                No growth data available.
              </div>
            )}
          </div>
        </Card>

        {/* API Latency Monitor Area Chart */}
        <Card className="p-3.5 border-none bg-card/50 backdrop-blur-sm shadow-md flex flex-col">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg">
              <Zap className="size-4 text-emerald-500" />
            </div>
            <h3 className="text-xs font-bold">API Latency Monitor</h3>
          </div>
          <div className="flex-1 min-h-[120px]">
            {latencyData.length > 0 ? (
              <AreaChart
                data={latencyData}
                height={120}
                strokeColor="#10b981"
                gradientColors={["rgba(16, 185, 129, 0.3)", "rgba(16, 185, 129, 0.0)"]}
                valueSuffix=" ms"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                No latency history available.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Row 4: Audit Trails & Console Actions */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Security Logs */}
        <Card className="p-3.5 border-none bg-card/50 backdrop-blur-sm shadow-md md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="p-1.5 bg-rose-500/10 rounded-lg">
                <Shield className="size-4 text-rose-500" />
              </div>
              <h3 className="text-xs font-bold">Audit Trails</h3>
            </div>
            <div className="space-y-1.5">
              {metrics.recent_activity.map((log: any, i: number) => (
                <div key={i} className="flex items-start gap-2.5 p-2 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-border/50 group">
                  <div className="size-1.5 mt-1.5 rounded-full bg-rose-500 group-hover:scale-125 transition-transform" />
                  <div>
                    <p className="text-[11px] font-semibold tracking-tight">{log.text}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Console Actions */}
        <div className="grid grid-cols-1 gap-1.5 md:col-span-1">
          <ActionButton label="Role Config" icon={Lock} variant="black" />
          <ActionButton label="Backup Data" icon={Database} variant="outline" />
          <ActionButton label="Flush Cache" icon={Zap} variant="outline" />
          <ActionButton label="Settings" icon={Settings} variant="primary" />
        </div>
      </div>
    </div>
  );
}
