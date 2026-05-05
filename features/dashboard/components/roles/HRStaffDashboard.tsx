"use client";

import { motion } from "framer-motion";
import { ListTodo, Calendar, Briefcase, Zap, FileText, Share2, ClipboardCheck, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "../widgets/StatCard";

interface HRStaffDashboardProps {
  metrics: any;
}

export function HRStaffDashboard({ metrics }: HRStaffDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-emerald-600">Operations Hub</h2>
          <p className="text-muted-foreground">Monitor daily tasks and pending approvals.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {metrics.stats.map((stat: any, i: number) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Pending Requests */}
        <Card className="p-6 border-none bg-card/50 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <ListTodo className="size-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold">Pending Approvals</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: "Leave Requests", value: metrics.pending_requests.leaves, icon: Calendar },
                { label: "Letter Requests", value: metrics.pending_requests.letters, icon: FileText },
                { label: "Transfer Requests", value: metrics.pending_requests.transfers, icon: Share2 },
              ].map((req, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <req.icon className="size-4 text-emerald-500" />
                    <span className="text-sm font-medium">{req.label}</span>
                  </div>
                  <span className="text-sm font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {req.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button className="mt-8 w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors">
            Review All
          </button>
        </Card>

        {/* Today's Tasks */}
        <Card className="p-6 border-none bg-card/50 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <ClipboardCheck className="size-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold">Today's Focus</h3>
          </div>
          <div className="space-y-4">
            {metrics.today_tasks.map((task: any, i: number) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-white/50">
                <input type="checkbox" className="mt-1 size-4 rounded-full border-2 border-primary" />
                <div>
                  <p className="text-sm font-bold">{task.text}</p>
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                    task.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Recruitment Actions */}
        <Card className="p-6 border-none bg-emerald-600 text-white shadow-xl flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-4">Hiring Actions</h3>
            <p className="text-emerald-100 text-sm mb-8">Quickly manage the recruitment pipeline.</p>
            <div className="space-y-3">
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <Briefcase className="size-4" />
                Create New Job
              </button>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <Users className="size-4" />
                Shortlist Candidates
              </button>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 size-32 bg-white/10 rounded-full blur-2xl" />
        </Card>
      </div>
    </div>
  );
}
