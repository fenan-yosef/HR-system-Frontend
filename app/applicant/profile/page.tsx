"use client";

import { UserRound, FileText } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ApplicantProfilePage() {
  return (
    <RoleAppShell role="APPLICANT" userName="Emma Applicant">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Emma Applicant" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="emma@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="(+1) 555-0100" />
            </div>
            <Button className="mt-2" size="sm">Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
            <CardDescription>Upload your latest CV</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3">
              <FileText className="size-5" />
              <div>
                <div className="text-sm font-semibold">resume.pdf</div>
                <div className="text-xs text-slate-500">Updated 2 months ago</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm">Upload new</Button>
              <Button size="sm" variant="secondary">Download</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
