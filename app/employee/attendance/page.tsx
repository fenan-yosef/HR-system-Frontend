"use client";

import { CalendarCheck2, Clock3, UserCheck } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmployeeAttendancePage() {
  return (
    <RoleAppShell role="EMPLOYEE" userName="Emma Employee">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
            <CardDescription>Check-in status</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-3xl font-semibold">08:55 AM</div>
              <p className="text-sm text-slate-500">Clocked in</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 flex size-12 items-center justify-center rounded-full">
              <UserCheck className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
            <CardDescription>Presence</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-3xl font-semibold">4 / 5</div>
              <p className="text-sm text-slate-500">Present days</p>
            </div>
            <div className="bg-sky-50 text-sky-600 flex size-12 items-center justify-center rounded-full">
              <CalendarCheck2 className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Shift</CardTitle>
            <CardDescription>Upcoming</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-3xl font-semibold">Mon, 9:00 AM</div>
              <p className="text-sm text-slate-500">Office · HQ</p>
            </div>
            <div className="bg-indigo-50 text-indigo-600 flex size-12 items-center justify-center rounded-full">
              <Clock3 className="size-6" />
            </div>
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
              <span>Fri · Clocked out · 5:07 PM</span>
              <span className="text-xs text-slate-500">On time</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span>Thu · Clocked out · 5:12 PM</span>
              <span className="text-xs text-amber-600">+12m</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span>Wed · Clocked out · 4:55 PM</span>
              <span className="text-xs text-emerald-600">Early leave</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Quick attendance tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 px-6 pb-6">
            <Button size="sm">Download timesheet</Button>
            <Button size="sm" variant="secondary">View policy</Button>
            <Button size="sm" variant="ghost">Report an issue</Button>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
