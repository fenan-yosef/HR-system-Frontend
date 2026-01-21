"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AuthContextState, AuthUser } from "@/types/auth";
import { buildAuthUserFromAccessToken, loginRequest } from "@/services/authService";
import { clearTokens, persistTokens } from "@/services/apiClient";

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

  // On first load, hydrate authentication state from localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
    if (rawUser) {
      try {
        const parsedUser: AuthUser = JSON.parse(rawUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user", error);
      }
    } else {
      const accessToken = window.localStorage.getItem("hrms_access_token");
      if (accessToken) {
        const tokenUser = buildAuthUserFromAccessToken(accessToken);
        if (tokenUser) {
          setUser(tokenUser);
          persistUser(tokenUser);
        }
      }
    }
    setIsLoading(false);
  }, []);

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
