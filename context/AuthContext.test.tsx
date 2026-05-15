import { renderHook, waitFor, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/types/auth";

const mocks = vi.hoisted(() => ({
  buildAuthUserFromAccessToken: vi.fn(),
  loginRequest: vi.fn(),
  clearTokens: vi.fn(),
  persistTokens: vi.fn(),
}));

vi.mock("@/services/authService", () => ({
  buildAuthUserFromAccessToken: mocks.buildAuthUserFromAccessToken,
  loginRequest: mocks.loginRequest,
}));

vi.mock("@/services/apiClient", () => ({
  clearTokens: mocks.clearTokens,
  persistTokens: mocks.persistTokens,
}));

import { AuthProvider, useAuthContext } from "@/context/AuthContext";

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
  };
}

describe("AuthProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mocks.buildAuthUserFromAccessToken.mockReset();
    mocks.loginRequest.mockReset();
    mocks.clearTokens.mockReset();
    mocks.persistTokens.mockReset();
  });

  it("hydrates authentication state from localStorage access token", async () => {
    const tokenUser: AuthUser = {
      id: 9,
      username: "jane.doe",
      role: "EMPLOYEE",
      roleName: "Employee",
    };

    window.localStorage.setItem("hrms_access_token", "stored-token");
    mocks.buildAuthUserFromAccessToken.mockReturnValue(tokenUser);

    const { result } = renderHook(() => useAuthContext(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.user).toEqual(tokenUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(window.localStorage.getItem("hrms_user")).toBe(JSON.stringify(tokenUser));
  });

  it("logs in, persists tokens, and stores the authenticated user", async () => {
    const authenticatedUser: AuthUser = {
      id: 12,
      username: "sam",
      role: "HR_MANAGER",
      roleName: "HR Manager",
    };

    mocks.loginRequest.mockResolvedValue({
      access: "access-token",
      refresh: "refresh-token",
    });
    mocks.buildAuthUserFromAccessToken.mockReturnValue(authenticatedUser);

    const { result } = renderHook(() => useAuthContext(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login("sam", "secret");
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(authenticatedUser);
    });

    expect(mocks.loginRequest).toHaveBeenCalledWith({ username: "sam", password: "secret" });
    expect(mocks.persistTokens).toHaveBeenCalledWith("access-token", "refresh-token");
    expect(window.localStorage.getItem("hrms_access_token")).toBeNull();
    expect(window.localStorage.getItem("hrms_refresh_token")).toBeNull();
    expect(window.localStorage.getItem("hrms_user")).toBe(JSON.stringify(authenticatedUser));
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("logs out by clearing tokens and removing stored user data", async () => {
    const existingUser: AuthUser = {
      id: 5,
      username: "employee",
      role: "EMPLOYEE",
    };

    window.localStorage.setItem("hrms_user", JSON.stringify(existingUser));

    const { result } = renderHook(() => useAuthContext(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });

    expect(mocks.clearTokens).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem("hrms_user")).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});