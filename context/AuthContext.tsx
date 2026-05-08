"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { AuthContextState, AuthUser } from "@/types/auth";
import { buildAuthUserFromAccessToken, loginRequest, mapRoleNameToUserRole } from "@/services/authService";
import { clearTokens, persistTokens, getApiErrorStatus } from "@/services/apiClient";
import { fetchProfile } from "@/services/profileService";

const AuthContext = createContext<AuthContextState | undefined>(undefined);

const USER_STORAGE_KEY = "hrms_user";

function persistUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hydratedUserIdRef = useRef<number | null>(null);

  // On first load, hydrate authentication state from localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const accessToken = window.localStorage.getItem("hrms_access_token");
    if (accessToken) {
      const tokenUser = buildAuthUserFromAccessToken(accessToken);
      if (tokenUser) {
        setUser(tokenUser);
        persistUser(tokenUser);
        setIsLoading(false);
        return;
      }
    }

    const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
    if (rawUser) {
      try {
        const parsedUser = JSON.parse(rawUser) as AuthUser;
        parsedUser.role = mapRoleNameToUserRole(parsedUser.roleName ?? parsedUser.role);
        if (!parsedUser.roleName) {
          parsedUser.roleName = parsedUser.role === "HR_STAFF"
            ? "HR Staff"
            : parsedUser.role === "HR_CEO"
              ? "HR CEO"
              : parsedUser.role === "ADMIN"
                ? "Admin"
                : parsedUser.role === "EMPLOYEE"
                  ? "Employee"
                  : parsedUser.role === "APPLICANT"
                    ? "Applicant"
                    : "Unknown";
        }
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user", error);
      }
    }
    setIsLoading(false);
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      persistUser(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    if (!user?.id) {
      hydratedUserIdRef.current = null;
      return;
    }

    if (hydratedUserIdRef.current === user.id) {
      return;
    }

    const safeUser = user as AuthUser;
    let cancelled = false;

    async function hydrateProfile() {
      try {
        const profile = await fetchProfile();
        if (cancelled) return;

        updateUser({
          firstName: profile.first_name || safeUser.firstName,
          lastName: profile.last_name || safeUser.lastName,
          email: profile.email || safeUser.email,
          profilePictureUrl: profile.profile_photo_url || profile.onboarding_data?.profile_photo_url || safeUser.profilePictureUrl || null,
        });
        hydratedUserIdRef.current = safeUser.id;
      } catch (error) {
        console.warn("Failed to hydrate profile data", error);
        // If profile fetch fails with 401, it means our session is likely invalid.
        if (getApiErrorStatus(error) === 401) {
          logout();
        }
      }
    }

    void hydrateProfile();

    return () => {
      cancelled = true;
    };
  }, [updateUser, user]);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const { access, refresh } = await loginRequest({ username, password });
      persistTokens(access, refresh);

      const authenticatedUser = buildAuthUserFromAccessToken(access);
      if (!authenticatedUser) {
        throw new Error("Unable to derive user information from access token.");
      }

      persistUser(authenticatedUser);
      setUser(authenticatedUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    persistUser(null);
    setUser(null);
  }, []);


  const value: AuthContextState = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext(): AuthContextState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
