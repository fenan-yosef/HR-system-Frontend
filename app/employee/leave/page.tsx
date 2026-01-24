"use client";

import { CalendarPlus, Clock4, FileCheck2 } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmployeeLeavePage() {
  return (
    <RoleAppShell role="EMPLOYEE" userName="Emma Employee">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Annual Leave</CardTitle>
            <CardDescription>Remaining balance</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-4xl font-semibold">12</div>
              <p className="text-sm text-slate-500">Days left</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 flex size-12 items-center justify-center rounded-full">
              <CalendarPlus className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sick Leave</CardTitle>
            <CardDescription>Used this year</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-4xl font-semibold">3</div>
              <p className="text-sm text-slate-500">Days taken</p>
            </div>
            <div className="bg-amber-50 text-amber-600 flex size-12 items-center justify-center rounded-full">
              <Clock4 className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Awaiting approval</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-4xl font-semibold">1</div>
              <p className="text-sm text-slate-500">Expected within 24h</p>
            </div>
            <div className="bg-blue-50 text-blue-600 flex size-12 items-center justify-center rounded-full">
              <FileCheck2 className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Status and dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span>Annual leave · Jan 15-20</span>
              <span className="text-xs text-amber-600">Pending</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span>Sick leave · Dec 2</span>
              <span className="text-xs text-emerald-600">Approved</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span>Remote day · Nov 18</span>
              <span className="text-xs text-emerald-600">Approved</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Request or manage leave</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 px-6 pb-6">
            <Button size="sm">New leave request</Button>
            <Button size="sm" variant="secondary">Download balance</Button>
            <Button size="sm" variant="ghost">See policy</Button>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
