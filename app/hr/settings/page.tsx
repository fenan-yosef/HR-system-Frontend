"use client";

import { Settings } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HrSettingsPage() {
  return (
    <RoleAppShell role="HR_MANAGER" userName="Sarah HR Officer">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Organization preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <div className="grid gap-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input id="orgName" placeholder="Acme Inc." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" placeholder="UTC+3" />
            </div>
            <Button size="sm" className="mt-2">Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policies</CardTitle>
            <CardDescription>Configure rules</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <span>Require manager approval for leave</span>
              <Button size="sm" variant="outline">Toggle</Button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm">Edit policy</Button>
              <Button size="sm" variant="secondary">Download</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
