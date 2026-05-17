"use client";

import { useRouter } from "next/navigation";
import {
  ListTodo,
  Calendar,
  Briefcase,
  FileText,
  Share2,
  ClipboardCheck,
  Users,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { StatCard } from "../widgets/StatCard";
import { ActionButton } from "../widgets/AnalyticsWidgets";
import { cn } from "@/lib/utils";
import { DonutChart, InteractiveBarChart } from "@/components/ui/charts";

interface HRStaffDashboardProps {
  metrics: any;
}

export function HRStaffDashboard({ metrics }: HRStaffDashboardProps) {
  const router = useRouter();

  // Format pending requests for Donut Chart
  const reqData = [
    { label: "Leaves", value: metrics?.pending_requests?.leaves || 0, color: "#10b981" },
    { label: "Letters", value: metrics?.pending_requests?.letters || 0, color: "#3b82f6" },
    { label: "Transfers", value: metrics?.pending_requests?.transfers || 0, color: "#f59e0b" },
  ];

  // Format application status distribution for Bar Chart
  const statusData = (metrics?.application_status_distribution || []).map((s: any) => {
    const rawStatus = s.status || "other";
    const label = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).replace(/_/g, " ");
    return {
      label,
      value: s.value,
    };
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {(metrics?.stats ?? []).map((stat: any, i: number) => (
          <StatCard key={i} {...stat} delay={i * 0.05} />
        ))}
      </div>

      {/* Row 2: Action items & Recent Applications */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Recent Applications Card */}
        <Card className="p-4 border-none bg-card/50 backdrop-blur-sm shadow-md md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="size-4.5 text-blue-500" />
              </div>
              <h3 className="text-sm font-bold">Recent Applications</h3>
            </div>
            <button className="text-[10px] font-bold text-blue-500 uppercase tracking-wider hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-2">
            {metrics.recent_applications.map((app: any, i: number) => (
              <div
                key={i}
                className="group flex items-center justify-between p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-600 text-xs">
                    {app.applicant__full_name ? app.applicant__full_name[0] : "A"}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{app.applicant__full_name}</p>
                    <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                      {app.position__title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-semibold uppercase px-2 py-0.5 bg-white/50 rounded-lg text-muted-foreground">
                    {new Date(app.submitted_at).toLocaleDateString()}
                  </span>
                  <div className="p-1.5 bg-white/50 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                    <ChevronRight className="size-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Pending Approval Queue & Task Checklist */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pending Requests Donut & Cards */}
        <Card className="p-4 border-none bg-emerald-950 text-white shadow-md flex flex-col justify-between overflow-hidden relative min-h-[250px]">
          <div className="relative z-10 flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                <ListTodo className="size-4.5 text-white" />
              </div>
              <h3 className="text-sm font-bold">Pending Approval Queue</h3>
            </div>

            {/* Layout with Donut on left, grid on right */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center flex-1">
              <div className="flex justify-center py-1">
                <DonutChart data={reqData} centerLabel="Pending" />
              </div>

              <div className="space-y-2">
                {[
                  { label: "Leaves", value: metrics.pending_requests.leaves, icon: Calendar, color: "text-emerald-300 bg-emerald-500/20" },
                  { label: "Letters", value: metrics.pending_requests.letters, icon: FileText, color: "text-blue-300 bg-blue-500/20" },
                  { label: "Transfers", value: metrics.pending_requests.transfers, icon: Share2, color: "text-amber-300 bg-amber-500/20" },
                ].map((req, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-white/5 backdrop-blur-md flex items-center gap-3 border border-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className={cn("p-1.5 rounded-lg", req.color)}>
                      <req.icon className="size-3.5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-200/80 block">
                        {req.label}
                      </span>
                      <span className="text-lg font-bold">{req.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 size-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
        </Card>

        {/* Task Checklist */}
        <Card className="p-4 border-none bg-card/50 backdrop-blur-sm shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <ClipboardCheck className="size-4.5 text-amber-500" />
              </div>
              <h3 className="text-sm font-bold">Task Checklist</h3>
            </div>
            <div className="space-y-2">
              {metrics.today_tasks.map((task: any, i: number) => (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-xl border border-border/30 bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer"
                >
                  <div
                    className={cn(
                      "size-4 mt-0.5 rounded-full border-2 flex items-center justify-center",
                      task.priority === "high" ? "border-rose-500" : "border-primary"
                    )}
                  >
                    <div
                      className={cn(
                        "size-1.5 rounded-full",
                        task.priority === "high" ? "bg-rose-500" : "bg-primary"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{task.text}</p>
                    <span
                      className={cn(
                        "text-[7px] font-semibold uppercase px-1.5 py-0.5 rounded tracking-wider",
                        task.priority === "high" ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                      )}
                    >
                      {task.priority} Priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Row 4: Application Pipeline Funnel breakdown */}
      <Card className="p-4 border-none bg-card/50 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="size-4.5 text-primary" />
          </div>
          <h3 className="text-sm font-bold">Recruitment Pipeline Breakdown</h3>
        </div>
        <div className="h-48">
          {statusData.length > 0 ? (
            <InteractiveBarChart
              data={statusData}
              height={140}
              color="from-primary to-primary/80 shadow-[0_0_10px_rgba(59,130,246,0.15)]"
              hoverColor="from-blue-600 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              valueSuffix=" cand"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              No recruitment pipeline data available.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
