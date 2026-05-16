"use client";
import React from "react";
import PensionForm from "@/components/pension/PensionForm";
import PensionStatusCard from "@/components/pension/PensionStatusCard";

export default function EmployeePensionPage() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Pension Registration</h2>
      </div>
      <PensionStatusCard />
      <PensionForm />
    </div>
  );
}
