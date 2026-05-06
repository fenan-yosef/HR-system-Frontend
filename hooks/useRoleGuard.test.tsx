import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ROLE_DASHBOARD_ROUTE } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import type { AuthUser } from "@/types/auth";

const mocks = vi.hoisted(() => ({
  pathname: vi.fn(() => ROUTES.DASHBOARD),
  replace: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname(),
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mocks.useAuth(),
}));

import { useRoleGuard } from "@/hooks/useRoleGuard";

describe("useRoleGuard", () => {
  beforeEach(() => {
    mocks.pathname.mockReturnValue(ROUTES.DASHBOARD);
    mocks.replace.mockReset();
    mocks.useAuth.mockReset();
  });

  it("redirects unauthenticated users to login", async () => {
    mocks.pathname.mockReturnValue(ROUTES.EMPLOYEES);
    mocks.useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    const { result } = renderHook(() => useRoleGuard());

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
    expect(result.current.canAccess).toBe(false);
  });

  it("redirects authenticated users away from unauthorized routes", async () => {
    const employee: AuthUser = {
      id: 2,
      username: "employee",
      role: "EMPLOYEE",
    };

    mocks.pathname.mockReturnValue(ROUTES.EMPLOYEES);
    mocks.useAuth.mockReturnValue({
      user: employee,
      isAuthenticated: true,
      isLoading: false,
    });

    renderHook(() => useRoleGuard({ allowedRoles: ["EMPLOYEE"] }));

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith(ROLE_DASHBOARD_ROUTE.EMPLOYEE);
    });
  });

  it("allows access when the route and role are permitted", async () => {
    const admin: AuthUser = {
      id: 1,
      username: "admin",
      role: "ADMIN",
      roleName: "Admin",
      roleId: 1,
    };

    mocks.pathname.mockReturnValue(ROUTES.SECURITY);
    mocks.useAuth.mockReturnValue({
      user: admin,
      isAuthenticated: true,
      isLoading: false,
    });

    const { result } = renderHook(() => useRoleGuard({ allowedRoles: ["ADMIN"] }));

    await waitFor(() => {
      expect(result.current.canAccess).toBe(true);
    });
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});