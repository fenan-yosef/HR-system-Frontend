"use client";

import { Briefcase, MapPin, Banknote } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ApplicantJobsPage() {
  const router = useRouter();
  return (
    <RoleAppShell role="APPLICANT" userName="Emma Applicant">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Openings</CardTitle>
            <CardDescription>Browse and apply</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {[
              { title: "Frontend Developer", company: "Ethio Telecom", location: "Addis Ababa (Remote)", salary: "Br 90,000" },
              { title: "Product Designer", company: "Dashen Bank", location: "Addis Ababa (Hybrid)", salary: "Br 70,000" },
              { title: "QA Engineer", company: "Hibret Bank", location: "Adama (Onsite)", salary: "Br 60,000" },
            ].map((job, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                <div>
                  <div className="font-semibold flex items-center gap-2"><Briefcase className="size-4" /> {job.title}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>{job.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="size-3" /> {job.location}</span>
                    <span className="flex items-center gap-1"><Banknote className="size-3" /> {job.salary}</span>
                  </div>
                </div>
                <Button size="sm" onClick={() => router.push("/applicant/applications")}>Apply</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Roles</CardTitle>
            <CardDescription>Your shortlist</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="text-sm text-slate-600">No saved roles yet.</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => router.push("/applicant/jobs")}>Explore recommendations</Button>
              <Button size="sm" variant="ghost" onClick={() => router.push("/applicant/messages")}>Manage alerts</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
