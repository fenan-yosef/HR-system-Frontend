"use client";

import { Users, UserPlus, BadgeCheck } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ManagerTeamPage() {
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
            <CardTitle>Open Roles</CardTitle>
            <CardDescription>Hiring with HR</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">3</div>
            <p className="text-sm text-slate-500">Backend, QA, Design</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New Joins</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">2</div>
            <p className="text-sm text-slate-500">Onboarding in progress</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>People</CardTitle>
            <CardDescription>Profiles and statuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <div>
                <div className="font-semibold">Alex Chen</div>
                <div className="text-xs text-slate-500">Senior Engineer · Active</div>
              </div>
              <BadgeCheck className="size-4 text-emerald-600" />
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <div>
                <div className="font-semibold">Priya Singh</div>
                <div className="text-xs text-slate-500">Product Designer · PTO</div>
              </div>
              <span className="text-xs text-amber-600">On leave</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <div>
                <div className="font-semibold">Jordan Lee</div>
                <div className="text-xs text-slate-500">QA Lead · Active</div>
              </div>
              <span className="text-xs text-slate-500">Remote</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Team management</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 px-6 pb-6">
            <Button size="sm">
              <UserPlus className="mr-2 size-4" /> Add member
            </Button>
            <Button size="sm" variant="secondary">
              <Users className="mr-2 size-4" /> View org chart
            </Button>
            <Button size="sm" variant="ghost">Share onboarding plan</Button>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
