"use client";

import { BarChart3, ClipboardCheck, Users } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ManagerDashboard() {
  return (
    <RoleAppShell role="MANAGER" userName="Mike Manager">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Direct reports</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">21</div>
            <p className="text-sm text-slate-500">Across two squads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Present Today</CardTitle>
            <CardDescription>Attendance</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">18</div>
            <p className="text-sm text-slate-500">3 on PTO</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Performance</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">3.8 / 5.0</div>
            <p className="text-sm text-slate-500">Holding steady</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your team</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 px-6 pb-6">
            <Button size="sm">
              <Users className="mr-2 size-4" /> View Team
            </Button>
            <Button size="sm" variant="secondary">
              <BarChart3 className="mr-2 size-4" /> Performance
            </Button>
            <Button size="sm" variant="ghost">
              <ClipboardCheck className="mr-2 size-4" /> Approvals
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Awaiting your decision</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-center justify-between">
                Leave approval · John Smith
                <Button size="sm" variant="outline">Review</Button>
              </li>
              <li className="flex items-center justify-between">
                Project kickoff · Platform revamp
                <Button size="sm" variant="outline">Open</Button>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
