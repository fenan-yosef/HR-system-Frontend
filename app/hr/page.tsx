"use client";

import { Briefcase, FileBarChart2, Users } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HrDashboard() {
  const router = useRouter();
  return (
    <RoleAppShell role="HR_MANAGER" userName="Sarah HR Officer">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
            <CardDescription>Active headcount</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-4xl font-semibold">248</div>
            <p className="text-sm text-slate-500">People across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
            <CardDescription>Hiring pipeline</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-4xl font-semibold">12</div>
              <p className="text-sm text-slate-500">Across engineering and ops</p>
            </div>
            <div className="bg-blue-50 text-blue-600 flex size-12 items-center justify-center rounded-full">
              <Briefcase className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
            <CardDescription>Require review</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-4xl font-semibold">156</div>
              <p className="text-sm text-slate-500">Move promising talent forward</p>
            </div>
            <div className="bg-indigo-50 text-indigo-600 flex size-12 items-center justify-center rounded-full">
              <FileBarChart2 className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common HR tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 px-6 pb-6">
            <Button size="sm" onClick={() => router.push("/hr/employees")}>
              <Users className="mr-2 size-4" /> Add Employee
            </Button>
            <Button size="sm" variant="secondary" onClick={() => router.push("/hr/recruitment")}>
              <Briefcase className="mr-2 size-4" /> Post Job
            </Button>
            <Button size="sm" variant="ghost" onClick={() => router.push("/hr/reports")}>
              <FileBarChart2 className="mr-2 size-4" /> View Reports
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Items awaiting your decision</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-center justify-between">
                Leave request · Abebe Kebede · Jan 15-20
                <Button size="sm" variant="outline" onClick={() => router.push("/hr/leave")}>Review</Button>
              </li>
              <li className="flex items-center justify-between">
                Offer letter · Backend Engineer · Draft
                <Button size="sm" variant="outline" onClick={() => router.push("/hr/recruitment")}>Finalize</Button>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
