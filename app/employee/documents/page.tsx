"use client";

import { FileText, ShieldCheck, Upload } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const documents = [
  { name: "Employment Agreement.pdf", date: "Uploaded Aug 12, 2024" },
  { name: "Policy Handbook.pdf", date: "Updated Nov 04, 2025" },
  { name: "Benefits Summary.pdf", date: "Updated Jan 02, 2026" },
];

export default function EmployeeDocumentsPage() {
  return (
    <RoleAppShell role="EMPLOYEE" userName="Emma Employee">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>Download or view important files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            {documents.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 text-white flex size-9 items-center justify-center rounded-md">
                    <FileText className="size-4" />
                  </div>
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-xs text-slate-500">{doc.date}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">Download</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Center</CardTitle>
            <CardDescription>Submit documents to HR</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            <p>Upload certificates or supporting documents securely.</p>
            <Button size="sm">
              <Upload className="mr-2 size-4" /> Upload file
            </Button>
            <p className="text-xs text-slate-500">Accepted: PDF, DOCX, PNG, JPG (max 10MB).</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
            <CardDescription>Data protection</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 px-6 pb-6 text-sm text-slate-700">
            <ShieldCheck className="size-5 text-emerald-600" />
            Your documents are encrypted at rest and in transit.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Need help?</CardTitle>
            <CardDescription>Document requests</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between px-6 pb-6">
            <div className="text-sm text-slate-700">Ask HR to re-issue letters or pay confirmations.</div>
            <Button size="sm" variant="secondary">Request</Button>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
