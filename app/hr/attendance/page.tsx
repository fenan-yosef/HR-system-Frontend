"use client";

import { AlarmClock, CalendarCheck2, UserCheck } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HrAttendancePage() {
  const router = useRouter();
  return (
    <RoleAppShell role="HR_MANAGER" userName="Sarah HR Officer">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Presence Rate</CardTitle>
            <CardDescription>This week</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">94%</div>
            <p className="text-sm text-slate-500">Across all teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Late Arrivals</CardTitle>
            <CardDescription>Today</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">7</div>
            <p className="text-sm text-slate-500">Monitor patterns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Absences</CardTitle>
            <CardDescription>Today</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">3</div>
            <p className="text-sm text-slate-500">Verify reasons</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
            <CardDescription>Clock-ins and outs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span>Eng · Jane · 9:07 AM · Clock in</span>
              <span className="text-xs text-slate-500">+7m</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span>Ops · Mark · 8:55 AM · Clock in</span>
              <span className="text-xs text-emerald-600">On time</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Attendance controls</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 px-6 pb-6">
            <Button size="sm" onClick={() => alert("Exporting timesheets...")}>Export timesheets</Button>
            <Button size="sm" variant="secondary" onClick={() => router.push("/hr/settings")}>View policy</Button>
            <Button size="sm" variant="ghost" onClick={() => router.push("/hr/settings?tab=support")}>Report issue</Button>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
