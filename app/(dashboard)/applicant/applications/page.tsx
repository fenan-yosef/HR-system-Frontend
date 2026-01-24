"use client";

import React from "react";
import ActionButton from "@/components/ui/action-button";

export default function ApplicantApplicationsPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">My Applications</h1>
        <p className="text-sm text-muted-foreground">Track your job applications.</p>
      </div>
      <div className="rounded-xl border bg-white p-4 shadow">
        <p className="text-sm text-muted-foreground">Connect to applicant applications list.</p>
        <div className="mt-4">
          <ActionButton role="APPLICANT" className="px-3 py-2 text-sm">Refresh</ActionButton>
        </div>
      </div>
    </section>
  );
}
