"use client";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_LABELS } from "@/constants/roles";

export function DashboardOverview() {
  const { user } = useAuth();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="flex flex-col gap-2 p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Signed-in user
        </p>
        <p className="text-sm font-semibold">{user?.fullName ?? "Guest"}</p>
        <p className="text-xs text-muted-foreground">{user?.email ?? "Not authenticated"}</p>
      </Card>
      <Card className="flex flex-col gap-2 p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Role context
        </p>
        <p className="text-sm font-semibold">
          {user ? ROLE_LABELS[user.role] : "No role assigned"}
        </p>
        <p className="text-xs text-muted-foreground">
          UI adapts based on role configuration (HR, Admin, Employee, Applicant).
        </p>
      </Card>
      <Card className="flex flex-col gap-2 p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Recruitment focus
        </p>
        <p className="text-sm font-semibold">Intelligent recruitment support</p>
        <p className="text-xs text-muted-foreground">
          This dashboard will later surface KPIs, automation insights, and analytics.
        </p>
      </Card>
    </div>
  );
}
