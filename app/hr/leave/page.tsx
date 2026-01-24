"use client";

import { CalendarCheck, ClipboardList, ShieldCheck } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HrLeavePage() {
  const router = useRouter();
  return (
    <RoleAppShell role="HR_MANAGER" userName="Sarah HR Officer">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leave Approvals</CardTitle>
            <CardDescription>Requests awaiting review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            {[
              { name: "John Smith", period: "Jan 15-20", type: "Annual" },
              { name: "Alice Green", period: "Feb 3-5", type: "Sick" },
            ].map((req, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
                <div>
                  <div className="font-semibold flex items-center gap-2"><ClipboardList className="size-4" /> {req.name}</div>
                  <div className="text-xs text-slate-500">{req.period} · {req.type} leave</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => alert(`Approved ${req.name}'s ${req.type} leave.`)}>Approve</Button>
                  <Button size="sm" variant="ghost" onClick={() => alert(`Rejected ${req.name}'s ${req.type} leave.`)}>Reject</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policies</CardTitle>
            <CardDescription>Company leave rules</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span className="flex items-center gap-2"><ShieldCheck className="size-4" /> Annual Leave Policy</span>
              <Button size="sm" variant="outline" onClick={() => router.push("/hr/settings")}>View</Button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm">Update policy</Button>
              <Button size="sm" variant="secondary">Download</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
