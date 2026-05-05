"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Users, UserCircle, Settings, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "../widgets/StatCard";

interface AdminDashboardProps {
  metrics: any;
}

export function AdminDashboard({ metrics }: AdminDashboardProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Console</h2>
          <p className="text-muted-foreground">Manage system integrity and user access.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <Settings className="size-4" />
            System Settings
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.stats.map((stat: any, i: number) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* System Logs */}
        <Card className="p-6 border-none bg-card/50 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Shield className="size-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold">System Logs</h3>
          </div>
          <div className="space-y-4">
            {metrics.recent_activity.map((log: any, i: number) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="size-2 mt-2 rounded-full bg-blue-500" />
                <div>
                  <p className="text-sm font-medium">{log.text}</p>
                  <p className="text-xs text-muted-foreground">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 border-none bg-card/50 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Zap className="size-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-bold">Maintenance Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Manage Roles", icon: Lock, color: "text-rose-500" },
              { label: "Audit Trails", icon: Shield, color: "text-indigo-500" },
              { label: "Global Users", icon: Users, color: "text-cyan-500" },
              { label: "Configurations", icon: Settings, color: "text-emerald-500" },
            ].map((action, i) => (
              <button 
                key={i}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-muted/30 hover:bg-muted transition-all group"
              >
                <action.icon className={`size-6 ${action.color} transition-transform group-hover:scale-110`} />
                <span className="text-xs font-bold">{action.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
