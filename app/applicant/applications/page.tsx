"use client";

import { ClipboardList, CheckCircle2, Clock3 } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ApplicantApplicationsPage() {
  const router = useRouter();
  return (
    <RoleAppShell role="APPLICANT" userName="Emma Applicant">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Applications</CardTitle>
            <CardDescription>Status overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {[
              { role: "Frontend Developer", company: "Ethio Telecom", status: "Interview Scheduled", icon: CheckCircle2, accent: "text-emerald-600" },
              { role: "Product Designer", company: "Dashen Bank", status: "Under Review", icon: Clock3, accent: "text-slate-500" },
            ].map((app, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                <div>
                  <div className="font-semibold flex items-center gap-2"><ClipboardList className="size-4" /> {app.role}</div>
                  <div className="text-xs text-slate-500">{app.company}</div>
                </div>
                <div className={`flex items-center gap-2 ${app.accent}`}>
                  <app.icon className="size-4" />
                  <span className="text-sm">{app.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Quick tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 px-6 pb-6">
            <Button size="sm" onClick={() => alert("Application withdrawn.")}>Withdraw application</Button>
            <Button size="sm" variant="secondary" onClick={() => router.push("/applicant/profile")}>Update resume</Button>
            <Button size="sm" variant="ghost" onClick={() => router.push("/applicant/messages")}>Contact recruiter</Button>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
