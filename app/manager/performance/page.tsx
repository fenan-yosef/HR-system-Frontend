"use client";

import { Activity, TrendingUp, Trophy, BarChart } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ManagerPerformancePage() {
  return (
    <RoleAppShell role="MANAGER" userName="Mike Manager">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Avg Score</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-4xl font-semibold">3.8 / 5.0</div>
              <p className="text-sm text-slate-500">Improving vs last month</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 flex size-12 items-center justify-center rounded-full">
              <TrendingUp className="size-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Check-ins</CardTitle>
            <CardDescription>Completed this week</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-4xl font-semibold">9</div>
              <p className="text-sm text-slate-500">3 remaining</p>
            </div>
            <div className="bg-blue-50 text-blue-600 flex size-12 items-center justify-center rounded-full">
              <Activity className="size-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Performer</CardTitle>
            <CardDescription>This sprint</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-2xl font-semibold">Alex Chen</div>
              <p className="text-sm text-slate-500">4.7 score · Eng</p>
            </div>
            <div className="bg-amber-50 text-amber-600 flex size-12 items-center justify-center rounded-full">
              <Trophy className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Objectives</CardTitle>
            <CardDescription>In-progress OKRs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span>Reduce incident MTTR to 30m</span>
              <span className="text-xs text-emerald-600">On track</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span>Improve NPS by 5pts</span>
              <span className="text-xs text-amber-600">At risk</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span>Ship Q1 roadmap 80%</span>
              <span className="text-xs text-slate-500">In progress</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Performance tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 px-6 pb-6">
            <Button size="sm">
              <BarChart className="mr-2 size-4" /> Open scorecard
            </Button>
            <Button size="sm" variant="secondary">Schedule 1:1s</Button>
            <Button size="sm" variant="ghost">Export report</Button>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
