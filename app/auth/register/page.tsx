"use client";

import React from "react";
import ActionButton from "@/components/ui/action-button";

export default function ApplicantRegisterPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Applicant Registration</h1>
        <p className="text-sm text-muted-foreground">Create your applicant account.</p>
      </div>
      <div className="rounded-xl border bg-white p-4 shadow">
        <p className="text-sm text-muted-foreground">Hook this to your registration form.</p>
        <div className="mt-4">
          <ActionButton role="APPLICANT" className="px-3 py-2 text-sm">Register</ActionButton>
        </div>
      </div>
    </section>
  );
}