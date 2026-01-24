"use client";

import { CalendarClock, CreditCard, Download } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmployeePayrollPage() {
  return (
    <RoleAppShell role="EMPLOYEE" userName="Emma Employee">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Last Pay</CardTitle>
            <CardDescription>December 30</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-4xl font-semibold">$4,250</div>
              <p className="text-sm text-slate-500">Net pay</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 flex size-12 items-center justify-center rounded-full">
              <CreditCard className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Pay</CardTitle>
            <CardDescription>Scheduled</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div>
              <div className="text-3xl font-semibold">Jan 30</div>
              <p className="text-sm text-slate-500">In 12 days</p>
            </div>
            <div className="bg-blue-50 text-blue-600 flex size-12 items-center justify-center rounded-full">
              <CalendarClock className="size-6" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deductions</CardTitle>
            <CardDescription>Monthly summary</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-3xl font-semibold">$420</div>
            <p className="text-sm text-slate-500">Taxes, benefits, misc.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payslips</CardTitle>
            <CardDescription>Download your statements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            {["Dec 2025", "Nov 2025", "Oct 2025"].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
              >
                <span className="font-medium">{label}</span>
                <Button size="sm" variant="outline">
                  <Download className="mr-2 size-4" /> PDF
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions?</CardTitle>
            <CardDescription>Payroll contacts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-6 pb-6 text-sm text-slate-700">
            <p>For deductions or adjustments, reach out to payroll@company.com.</p>
            <p>For banking updates, submit a ticket via Support.</p>
            <div className="flex gap-3 pt-2">
              <Button size="sm">Open ticket</Button>
              <Button size="sm" variant="secondary">View policy</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
