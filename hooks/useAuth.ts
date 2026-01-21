"use client";

import { useAuthContext } from "@/context/AuthContext";

// Small convenience hook to keep imports clean at feature level.
export function useAuth() {
  return useAuthContext();
}
