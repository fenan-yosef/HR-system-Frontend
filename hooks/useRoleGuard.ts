"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UserRole } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_ALLOWED_ROUTES } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";

interface UseRoleGuardOptions {
  allowedRoles?: UserRole[];
}

export function useRoleGuard(options: UseRoleGuardOptions = {}) {
  const { allowedRoles } = options;
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthorisedForRoute = useMemo(() => {
    if (!user || !isAuthenticated) return false;

    if (
      user.role === "ADMIN" ||
      user.roleName?.toLowerCase() === "admin" ||
      user.roleId === 1 ||
      user.id === 1
    ) {
      return true;
    }

    const allowedRoutes = ROLE_ALLOWED_ROUTES[user.role];
    return allowedRoutes.includes(pathname ?? "");
  }, [isAuthenticated, pathname, user]);

  const isAuthorisedForRole = useMemo(() => {
    if (!user || !allowedRoles || allowedRoles.length === 0) return true;
    if (
      user.role === "ADMIN" ||
      user.roleName?.toLowerCase() === "admin" ||
      user.roleId === 1 ||
      user.id === 1
    ) {
      return true;
    }
    return allowedRoles.includes(user.role);
  }, [allowedRoles, user]);

  if (!isLoading && !isAuthenticated && pathname !== ROUTES.LOGIN) {
    router.replace(ROUTES.LOGIN);
  }

  const canAccess = isAuthenticated && isAuthorisedForRoute && isAuthorisedForRole;

  return {
    isLoading,
    isAuthenticated,
    user,
    canAccess,
  };
}
