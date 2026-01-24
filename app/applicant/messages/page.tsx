"use client";

import { Mail, MessageSquare, CheckCircle2 } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ApplicantMessagesPage() {
  return (
    <RoleAppShell role="APPLICANT" userName="Emma Applicant">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>From recruiters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            {[
              { from: "Tech Corp", text: "Interview confirmed for Jan 20.", read: true, icon: CheckCircle2, accent: "text-emerald-600" },
              { from: "Bright Labs", text: "Can you share portfolio links?", read: false, icon: MessageSquare, accent: "text-slate-500" },
              { from: "QualityWorks", text: "We received your application.", read: true, icon: Mail, accent: "text-slate-400" },
            ].map((m, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 rounded-lg border bg-white px-4 py-3">
                <div>
                  <div className="font-semibold">{m.from}</div>
                  <p className="text-slate-600">{m.text}</p>
                </div>
                <m.icon className={`size-4 ${m.accent}`} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Respond and manage</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 px-6 pb-6">
            <Button size="sm">Compose</Button>
            <Button size="sm" variant="secondary">Mark all read</Button>
            <Button size="sm" variant="ghost">Archive</Button>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
