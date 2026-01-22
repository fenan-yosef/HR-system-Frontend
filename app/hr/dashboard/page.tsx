"use client";

import React from "react";
import { DashboardOverview } from "@/features/dashboard/components/DashboardOverview";

export default function HRDashboardPage() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">HR Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview for HR staff and administrators.</p>
      </div>
      <DashboardOverview />
    </section>
  );
}
