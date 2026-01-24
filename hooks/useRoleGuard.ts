"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UserRole } from "@/types/auth";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_ALLOWED_ROUTES, ROLE_DASHBOARD_ROUTE } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";

interface UseRoleGuardOptions {
  allowedRoles?: UserRole[];
}

export function useRoleGuard(options: UseRoleGuardOptions = {}) {
  const { allowedRoles } = options;
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const normalizedPathname = useMemo(() => {
    if (!pathname) return "";
    if (pathname === "/") return "/";
    return pathname.replace(/\/+$/, "");
  }, [pathname]);

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
    return allowedRoutes.includes(normalizedPathname);
  }, [isAuthenticated, normalizedPathname, user]);

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

  useEffect(() => {
    if (!isLoading && !isAuthenticated && normalizedPathname !== ROUTES.LOGIN) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLoading, isAuthenticated, normalizedPathname, router]);

  // If the user is authenticated but not authorised for the current route,
  // redirect them to their role's dashboard/landing page to avoid the
  // generic "no permission" screen and provide a better UX.
  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      user &&
      !isAuthorisedForRoute &&
      normalizedPathname !== ROUTES.LOGIN
    ) {
      const landing = ROLE_DASHBOARD_ROUTE[user.role] ?? ROUTES.DASHBOARD;
      if (landing !== normalizedPathname) {
        router.replace(landing);
      }
    }
  }, [isLoading, isAuthenticated, isAuthorisedForRoute, user, normalizedPathname, router]);

  const canAccess = isAuthenticated && isAuthorisedForRoute && isAuthorisedForRole;

  return {
    isLoading,
    isAuthenticated,
    user,
    canAccess,
  };
}
