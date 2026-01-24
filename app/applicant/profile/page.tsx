"use client";

import { UserRound, FileText } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function ApplicantProfilePage() {
  const router = useRouter();
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
              <Input id="fullName" placeholder="Abebe Kebede" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="abebe@ethmail.et" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="(+251) 9-12-34-56-78" />
            </div>
            <Button className="mt-2" size="sm" onClick={() => alert("Profile saved.")}>Save changes</Button>
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
                <div className="text-sm font-semibold">resume_et.pdf</div>
                <div className="text-xs text-slate-500">Updated last month</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => alert("Upload flow coming soon.")}>Upload new</Button>
              <Button size="sm" variant="secondary" onClick={() => alert("Downloading resume...")}>Download</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
