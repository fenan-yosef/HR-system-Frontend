"use client";

import { Headset, LifeBuoy, MessageCircle, Phone } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const faqs = [
  { q: "How do I update my bank details?", a: "Submit a payroll ticket with your new account information." },
  { q: "Where can I see my leave balance?", a: "Check the Leave page; balances update nightly." },
  { q: "Who approves my requests?", a: "Your manager approves leave; HR handles payroll changes." },
];

export default function EmployeeSupportPage() {
  return (
    <RoleAppShell role="EMPLOYEE" userName="Emma Employee">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contact HR</CardTitle>
            <CardDescription>Weekdays · 9:00-17:00</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-emerald-600" /> +1 (555) 123-9876
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 text-blue-600" /> hr-support@company.com
            </div>
            <div className="flex items-center gap-2">
              <Headset className="size-4 text-indigo-600" /> Live chat: 9:00-12:00
            </div>
            <Button size="sm" variant="secondary">Open HR ticket</Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
            <CardDescription>Quick answers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-lg border bg-white px-4 py-3">
                <div className="font-semibold text-slate-900">{item.q}</div>
                <p className="text-slate-600">{item.a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Policies</CardTitle>
            <CardDescription>Handbooks and guides</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div className="text-sm text-slate-700">View the employee handbook and leave policy.</div>
            <Button size="sm" variant="outline">Open</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Escalation</CardTitle>
            <CardDescription>Need urgent help?</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 px-6 pb-6 text-sm text-slate-700">
            <LifeBuoy className="size-5 text-rose-500" />
            For urgent access or pay issues, call your manager and tag HR lead.
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
