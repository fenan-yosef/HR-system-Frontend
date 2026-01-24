"use client";

import { Briefcase, CheckCircle2, MessageSquare } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ApplicantDashboard() {
  return (
    <RoleAppShell role="APPLICANT" userName="Emma Applicant">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Applications Sent</CardTitle>
            <CardDescription>Active submissions</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">3</div>
            <p className="text-sm text-slate-500">Keep an eye on updates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
            <CardDescription>Under review</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">2</div>
            <p className="text-sm text-slate-500">Awaiting feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interviews</CardTitle>
            <CardDescription>Scheduled</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">1</div>
            <p className="text-sm text-slate-500">Prepare your talking points</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Featured Openings</CardTitle>
            <CardDescription>Recommended for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <div>
                <div className="font-semibold">Senior Frontend Developer</div>
                <div className="text-xs text-slate-500">Tech Corp · Remote</div>
              </div>
              <Button size="sm" variant="secondary">
                <Briefcase className="mr-2 size-4" /> View role
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <div>
                <div className="font-semibold">Product Designer</div>
                <div className="text-xs text-slate-500">Bright Labs · Hybrid</div>
              </div>
              <Button size="sm" variant="ghost">Save</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>From recruiters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">Tech Corp</div>
                <p className="text-slate-600">Interview confirmed for Jan 20.</p>
              </div>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">Bright Labs</div>
                <p className="text-slate-600">Can you share portfolio links?</p>
              </div>
              <MessageSquare className="size-4 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
