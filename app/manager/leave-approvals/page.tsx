"use client";

import { Clock3, ThumbsUp, UserMinus } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const requests = [
  {
    name: "Priya Singh",
    type: "Annual leave",
    dates: "Feb 3-7",
    status: "Pending",
  },
  {
    name: "Jordan Lee",
    type: "Sick leave",
    dates: "Jan 28",
    status: "Pending",
  },
];

export default function ManagerLeaveApprovalsPage() {
  return (
    <RoleAppShell role="MANAGER" userName="Mike Manager">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
            <CardDescription>Awaiting decision</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-4xl font-semibold">2</div>
              <p className="text-sm text-slate-500">Handle today</p>
            </div>
            <div className="bg-amber-50 text-amber-600 flex size-12 items-center justify-center rounded-full">
              <Clock3 className="size-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approved</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-4xl font-semibold">11</div>
              <p className="text-sm text-slate-500">Including carryover</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 flex size-12 items-center justify-center rounded-full">
              <ThumbsUp className="size-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Declined</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-4xl font-semibold">1</div>
              <p className="text-sm text-slate-500">With notes provided</p>
            </div>
            <div className="bg-rose-50 text-rose-600 flex size-12 items-center justify-center rounded-full">
              <UserMinus className="size-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review queue</CardTitle>
            <CardDescription>Decide on requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            {requests.map((req) => (
              <div
                key={`${req.name}-${req.dates}`}
                className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{req.name}</div>
                  <div className="text-xs text-slate-500">{req.type} · {req.dates}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">Notes</Button>
                  <Button size="sm" variant="secondary">Approve</Button>
                  <Button size="sm" variant="outline">Decline</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Guidelines</CardTitle>
            <CardDescription>Approval policy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-6 pb-6 text-sm text-slate-700">
            <p>Ensure coverage before approving overlapping dates.</p>
            <p>Medical requests may need supporting documents.</p>
            <p>Escalate long leaves (&gt;15 days) to HR for review.</p>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
