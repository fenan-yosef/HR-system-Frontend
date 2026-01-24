"use client";

import { FileText, BarChart3, PieChart } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HrReportsPage() {
  const router = useRouter();
  return (
    <RoleAppShell role="HR_MANAGER" userName="Sarah HR Officer">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Headcount Report</CardTitle>
            <CardDescription>By department</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-sm text-slate-600">View distribution of employees across teams.</div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => router.push("/hr/reports?report=headcount")}>View</Button>
              <Button size="sm" variant="secondary" onClick={() => alert("Downloading headcount report...")}>Download</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
            <CardDescription>Monthly trends</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-sm text-slate-600">Analyze presence, lateness, and absences.</div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => router.push("/hr/reports?report=attendance")}>View</Button>
              <Button size="sm" variant="secondary" onClick={() => alert("Downloading attendance summary...")}>Download</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recruitment Funnel</CardTitle>
            <CardDescription>Conversion rates</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-sm text-slate-600">Track candidates through pipeline stages.</div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => router.push("/hr/reports?report=recruitment")}>View</Button>
              <Button size="sm" variant="secondary" onClick={() => alert("Downloading recruitment funnel...")}>Download</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
