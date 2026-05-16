"use client";
import React from "react";

interface Props {
  registrationType?: string;
  pensionStatus?: string;
  pensionId?: string | null;
}

const statusColor = (status?: string) => {
  switch (status) {
    case "SUBMITTED":
      return "#F59E0B"; // yellow
    case "REGISTERED":
      return "#10B981"; // green
    default:
      return "#6B7280"; // gray
  }
};

export default function PensionStatusCard({ registrationType, pensionStatus, pensionId }: Props) {
  return (
    <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Pension Registration</div>
        <div style={{ marginTop: 8 }}>
          <div>Registration Type: {registrationType ?? "-"}</div>
          <div>Status: <span style={{ color: statusColor(pensionStatus), fontWeight: 600 }}>{pensionStatus ?? "NOT_STARTED"}</span></div>
          <div>Pension ID: {pensionId ?? "-"}</div>
        </div>
      </div>
      <div>
        <div style={{ width: 12, height: 12, borderRadius: 6, background: statusColor(pensionStatus) }} />
      </div>
    </div>
  );
}
