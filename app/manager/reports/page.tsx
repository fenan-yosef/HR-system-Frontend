"use client";

import { BarChart3, Download, FileText, PieChart } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const reports = [
  { title: "Team Performance", period: "Last 30 days" },
  { title: "Attendance Summary", period: "Month-to-date" },
  { title: "Leave Approvals", period: "Quarter-to-date" },
];

export default function ManagerReportsPage() {
  return (
    <RoleAppShell role="MANAGER" userName="Mike Manager">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Key Metric</CardTitle>
            <CardDescription>Velocity trend</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-4xl font-semibold">+8%</div>
              <p className="text-sm text-slate-500">Vs last month</p>
            </div>
            <div className="bg-indigo-50 text-indigo-600 flex size-12 items-center justify-center rounded-full">
              <BarChart3 className="size-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Utilization</CardTitle>
            <CardDescription>Engineering</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">74%</div>
            <p className="text-sm text-slate-500">Target 75-80%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attrition</CardTitle>
            <CardDescription>Annualized</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">6.2%</div>
            <p className="text-sm text-slate-500">Within threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available reports</CardTitle>
            <CardDescription>Download CSV/PDF</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            {reports.map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.period}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">View</Button>
                  <Button size="sm" variant="secondary">
                    <Download className="mr-2 size-4" /> Export
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>At a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <PieChart className="size-5 text-indigo-600" />
              Backend squad leads throughput; design has capacity.
            </div>
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-emerald-600" />
              PTO peaks mid-quarter; stagger approvals.
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="size-5 text-amber-600" />
              Performance dips align with on-call load; rebalance rotations.
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
