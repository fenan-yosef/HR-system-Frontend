"use client";

import { motion } from "framer-motion";
import { ListTodo, Calendar, Briefcase, Zap, FileText, Share2, ClipboardCheck, Users, ChevronRight, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "../widgets/StatCard";
import { ActionButton } from "../widgets/AnalyticsWidgets";
import { cn } from "@/lib/utils";

interface HRStaffDashboardProps {
  metrics: any;
}

export function HRStaffDashboard({ metrics }: HRStaffDashboardProps) {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-emerald-600">Operations Hub</h2>
          <p className="text-muted-foreground font-medium">Daily workflows and talent pipeline management.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {metrics.stats.map((stat: any, i: number) => (
          <StatCard key={i} {...stat} delay={i * 0.1} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Workflow Actions */}
        <div className="md:col-span-1 grid gap-4">
          <ActionButton label="New Job Post" icon={Briefcase} variant="black" />
          <ActionButton label="Shortlist Talent" icon={Users} variant="outline" />
          <ActionButton label="Approve Leaves" icon={Calendar} variant="outline" />
          <ActionButton label="Verify Profile" icon={UserPlus} variant="outline" />
        </div>

        {/* Recent Applications */}
        <Card className="p-6 border-none bg-card/50 backdrop-blur-sm shadow-xl md:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <FileText className="size-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-black">Recent Applications</h3>
            </div>
            <button className="text-xs font-black text-blue-500 uppercase tracking-widest hover:underline">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {metrics.recent_applications.map((app: any, i: number) => (
              <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-border/50">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center font-black text-blue-600">
                    {app.applicant__full_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-black">{app.applicant__full_name}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{app.position__title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase px-2 py-1 bg-white/50 rounded-lg text-muted-foreground">
                    {new Date(app.submitted_at).toLocaleDateString()}
                  </span>
                  <div className="p-2 bg-white/50 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                    <ChevronRight className="size-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Requests Summary */}
        <Card className="p-6 border-none bg-emerald-600 text-white shadow-xl flex flex-col justify-between overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                <ListTodo className="size-6 text-white" />
              </div>
              <h3 className="text-lg font-black">Pending Approval Queue</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Leaves", value: metrics.pending_requests.leaves, icon: Calendar },
                { label: "Letters", value: metrics.pending_requests.letters, icon: FileText },
                { label: "Transfers", value: metrics.pending_requests.transfers, icon: Share2 },
              ].map((req, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/10 backdrop-blur-md flex flex-col items-center gap-2">
                  <req.icon className="size-4 text-emerald-100" />
                  <span className="text-2xl font-black">{req.value}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">{req.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 size-32 bg-white/10 rounded-full blur-2xl" />
        </Card>

        {/* Today's Tasks */}
        <Card className="p-6 border-none bg-card/50 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <ClipboardCheck className="size-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-black">Task Checklist</h3>
          </div>
          <div className="space-y-3">
            {metrics.today_tasks.map((task: any, i: number) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl border border-border/30 bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer">
                <div className={cn(
                  "size-5 rounded-full border-2 flex items-center justify-center",
                  task.priority === 'high' ? 'border-rose-500' : 'border-primary'
                )}>
                  <div className={cn("size-2 rounded-full", task.priority === 'high' ? 'bg-rose-500' : 'bg-primary')} />
                </div>
                <div>
                  <p className="text-sm font-black">{task.text}</p>
                  <span className={cn(
                    "text-[8px] font-black uppercase px-1.5 py-0.5 rounded tracking-tighter",
                    task.priority === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'
                  )}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
