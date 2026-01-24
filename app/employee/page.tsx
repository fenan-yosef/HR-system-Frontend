"use client";

import { ArrowRight, CalendarCheck2, FileText, Headset } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmployeeHome() {
  return (
    <RoleAppShell role="EMPLOYEE" userName="Emma Employee">
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
            <CardDescription>This week</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3 px-6 pb-6">
            <div>
              <div className="text-3xl font-semibold">4/5</div>
              <div className="text-sm text-slate-500">Present days</div>
            </div>
            <div className="bg-sky-50 text-sky-600 flex size-12 items-center justify-center rounded-full">
              <CalendarCheck2 className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Balance</CardTitle>
            <CardDescription>Annual leave remaining</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3 px-6 pb-6">
            <div>
              <div className="text-3xl font-semibold">12</div>
              <div className="text-sm text-slate-500">Days left</div>
            </div>
            <div className="bg-indigo-50 text-indigo-600 flex size-12 items-center justify-center rounded-full">
              <FileText className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
            <CardDescription>Need help?</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="text-sm text-slate-600">
              Talk to HR for payroll, leave, or document updates.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <Headset className="mr-2 size-4" /> Contact HR
              </Button>
              <Button size="sm" variant="ghost">
                View handbook
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
