"use client";

import { useAuth } from "@/hooks/useAuth";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";

export default function DashboardPage() {
  const { user } = useAuth();
  const username = user?.role.trim().toLocaleLowerCase();
  const greetingName = username && username.length > 0 ? username : "Explorer";

  return (
    <section className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          Welcome back, {greetingName}.
        </h1>
        <p className="text-base font-medium text-muted-foreground max-w-2xl">
          Unified command center for HR operations, talent acquisition, and
          organizational health.
        </p>
      </div>
      <DashboardOverview />
    </section>
  );
}
