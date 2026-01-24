"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type Role = "ADMIN" | "HR" | "MANAGER" | "EMPLOYEE" | "APPLICANT" | "UNKNOWN";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  role?: Role;
  intent?: "primary" | "secondary" | "danger";
}

export function ActionButton({ role = "UNKNOWN", intent = "primary", className, ...props }: ActionButtonProps) {
  // Admin/HR use gray, others use blue
  const isAdminLike = role === "ADMIN" || role === "HR";

  const base = isAdminLike
    ? "bg-slate-600 hover:bg-slate-700 text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const danger = intent === "danger" ? "bg-rose-600 hover:bg-rose-700" : "";

  return <Button className={`${base} ${danger} ${className ?? ""}`} {...props} />;
}

export default ActionButton;
