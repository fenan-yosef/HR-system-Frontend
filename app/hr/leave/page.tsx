"use client";

import React from "react";
import ActionButton from "@/components/ui/action-button";

export default function LeavePage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-slate-800">Leave Management</h2>
        <ActionButton role="HR" className="px-3 py-2 text-sm">New Request</ActionButton>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-slate-600">Submit and review leave requests here.</p>
      </div>
    </div>
  );
}
