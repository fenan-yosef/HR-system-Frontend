"use client";

import { Bell, Lock, UserCog } from "lucide-react";
import { RoleAppShell } from "@/components/layout/RoleAppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ManagerSettingsPage() {
  return (
    <RoleAppShell role="MANAGER" userName="Mike Manager">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <div>
              <label className="text-xs text-slate-600">Display name</label>
              <Input defaultValue="Mike Manager" className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-slate-600">Title</label>
              <Input defaultValue="Engineering Manager" className="mt-1" />
            </div>
            <Button size="sm" variant="secondary">Save profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Stay informed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-indigo-600" />
                Leave approvals
              </div>
              <Button size="sm" variant="outline">Toggle</Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-indigo-600" />
                Project status updates
              </div>
              <Button size="sm" variant="outline">Toggle</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Access controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-slate-600" />
              Enable MFA for approvals
            </div>
            <Button size="sm" variant="secondary">Manage MFA</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delegation</CardTitle>
            <CardDescription>Assign backup approver</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <div>
              <label className="text-xs text-slate-600">Delegate to</label>
              <Input placeholder="Start typing a name" className="mt-1" />
            </div>
            <Button size="sm">
              <UserCog className="mr-2 size-4" /> Set delegate
            </Button>
          </CardContent>
        </Card>
      </div>
    </RoleAppShell>
  );
}
