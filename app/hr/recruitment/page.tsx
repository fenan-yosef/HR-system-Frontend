"use client";

import { Briefcase, ClipboardList, CheckCircle2 } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HrRecruitmentPage() {
  const router = useRouter();
  return (
    <RoleAppShell role="HR_MANAGER" userName="Sarah HR Officer">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Openings</CardTitle>
            <CardDescription>Currently hiring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {[
              { role: "Frontend Developer", dept: "Engineering", apps: 35 },
              { role: "QA Engineer", dept: "Engineering", apps: 22 },
              { role: "Office Manager", dept: "Operations", apps: 14 },
            ].map((job, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                <div>
                  <div className="font-semibold flex items-center gap-2"><Briefcase className="size-4" /> {job.role}</div>
                  <div className="text-xs text-slate-500">{job.dept} · {job.apps} applications</div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => router.push(`/hr/recruitment?role=${encodeURIComponent(job.role)}`)}>Manage</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>Stages overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span className="flex items-center gap-2"><ClipboardList className="size-4" /> Screening</span>
              <span>48 candidates</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span className="flex items-center gap-2"><ClipboardList className="size-4" /> Interviews</span>
              <span>12 scheduled</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span className="flex items-center gap-2"><CheckCircle2 className="size-4" /> Offers</span>
              <span>3 pending</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
