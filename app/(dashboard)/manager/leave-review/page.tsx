"use client";

import React from "react";
import ActionButton from "@/components/ui/action-button";

export default function ManagerLeaveReviewPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Leave Review</h1>
        <p className="text-sm text-muted-foreground">Approve or decline leave requests.</p>
      </div>
      <div className="rounded-xl border bg-white p-4 shadow">
        <p className="text-sm text-muted-foreground">Hook this to leave approval workflow.</p>
        <div className="mt-4 flex gap-2">
          <ActionButton role="MANAGER" className="px-3 py-2 text-sm">Approve</ActionButton>
          <ActionButton role="MANAGER" className="px-3 py-2 text-sm">Reject</ActionButton>
        </div>
      </div>
    </section>
  );
}
