"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Users, UserCircle, Settings, Lock, Activity, Server, Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "../widgets/StatCard";
import { SimplePieChart, ActionButton } from "../widgets/AnalyticsWidgets";

interface AdminDashboardProps {
  metrics: any;
}

export function AdminDashboard({ metrics }: AdminDashboardProps) {
  // Format role distribution for chart
  const roleColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];
  const roleData = (metrics.role_distribution || []).map((r: any, i: number) => ({
    label: r.role_name,
    value: r.user_count,
    color: roleColors[i % roleColors.length]
  }));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            System Infrastructure
          </h2>
          <p className="text-muted-foreground font-medium">Global system health and user access management.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.stats.map((stat: any, i: number) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Distribution */}
        <Card className="p-6 border-none bg-card/50 backdrop-blur-sm shadow-xl flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Users className="size-6 text-indigo-500" />
            </div>
            <h3 className="text-lg font-black">User Distribution</h3>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <SimplePieChart data={roleData} />
          </div>
        </Card>

        {/* System Health Monitor */}
        <Card className="p-6 border-none bg-zinc-900 text-zinc-100 shadow-xl overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                <Activity className="size-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-black">Performance Monitor</h3>
            </div>
            
            <div className="space-y-6">
              {[
                { label: "Server Load", value: 45, icon: Server, color: "bg-emerald-500" },
                { label: "Database Query", value: 12, icon: Database, color: "bg-blue-500" },
                { label: "API Latency", value: 88, icon: Zap, color: "bg-amber-500" },
              ].map((perf, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-zinc-400">
                    <div className="flex items-center gap-2">
                      <perf.icon className="size-3" />
                      {perf.label}
                    </div>
                    <span>{perf.value}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${perf.value}%` }}
                      transition={{ duration: 1.5, delay: i * 0.3 }}
                      className={`h-full ${perf.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-10 -left-10 size-48 bg-emerald-500/10 rounded-full blur-3xl" />
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Security Logs */}
        <Card className="p-6 border-none bg-card/50 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-rose-500/10 rounded-xl">
              <Shield className="size-6 text-rose-500" />
            </div>
            <h3 className="text-lg font-black">Audit Trails</h3>
          </div>
          <div className="space-y-4">
            {metrics.recent_activity.map((log: any, i: number) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-border/50 group">
                <div className="size-2 mt-2 rounded-full bg-rose-500 group-hover:scale-150 transition-transform" />
                <div>
                  <p className="text-sm font-black tracking-tight">{log.text}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Console Actions */}
        <div className="grid grid-cols-2 gap-4">
          <ActionButton label="Role Config" icon={Lock} variant="black" />
          <ActionButton label="Backup Data" icon={Database} variant="outline" />
          <ActionButton label="Flush Cache" icon={Zap} variant="outline" />
          <ActionButton label="Global Logs" icon={Activity} variant="outline" />
          <div className="col-span-2">
            <ActionButton label="Security Settings" icon={Settings} variant="primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
