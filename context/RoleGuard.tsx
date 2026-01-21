"use client";

import React from "react";
import type { UserRole } from "@/types/auth";
import { useRoleGuard } from "@/hooks/useRoleGuard";

interface RoleGuardProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { canAccess, isLoading } = useRoleGuard({ allowedRoles });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading your workspace...
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        You do not have permission to access this area.
      </div>
    );
  }

  return <>{children}</>;
};
