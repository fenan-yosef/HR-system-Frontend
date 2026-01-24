"use client";

import React from "react";
import type { UserRole } from "@/types/auth";
import { useRoleGuard } from "@/hooks/useRoleGuard";

interface RoleGuardProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { canAccess, isLoading, isAuthenticated } = useRoleGuard({ allowedRoles });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading your workspace...
      </div>
    );
  }

  if (!canAccess) {
    // If the user is authenticated we expect a redirect to their landing page
    // to be in progress. Show a transient loading state instead of the
    // permanent permission message to avoid flicker.
    if (isAuthenticated) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Redirecting to your workspace...
        </div>
      );
    }

    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        You do not have permission to access this area.
      </div>
    );
  }

  return <>{children}</>;
};
