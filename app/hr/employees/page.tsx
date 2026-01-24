"use client";

import { Users, UserPlus } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HrEmployeesPage() {
  const router = useRouter();
  return (
    <RoleAppShell role="HR_MANAGER" userName="Sarah HR Officer">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
            <CardDescription>Directory overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {[
              { name: "Abebe Kebede", role: "Backend Engineer", dept: "Engineering" },
              { name: "Hanna Tesfaye", role: "Product Manager", dept: "Product" },
              { name: "Bekele Alemu", role: "HR Generalist", dept: "HR" },
            ].map((emp, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                <div>
                  <div className="font-semibold flex items-center gap-2"><Users className="size-4" /> {emp.name}</div>
                  <div className="text-xs text-slate-500">{emp.role} · {emp.dept}</div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => router.push(`/hr/employees?view=${encodeURIComponent(emp.name)}`)}>View</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage people</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 px-6 pb-6">
            <Button size="sm"><UserPlus className="mr-2 size-4" /> Add employee</Button>
            <Button size="sm" variant="secondary">Import CSV</Button>
            <Button size="sm" variant="ghost">Export directory</Button>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
