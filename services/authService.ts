import type { AuthUser, DecodedTokenPayload, UserRole } from "@/types/auth";
import { apiFetch } from "@/services/apiClient";

interface LoginPayload {
  username: string;
  password: string;
}

export interface TokenResponse {
  refresh: string;
  access: string;
}

const ROLE_MAP: Record<string, UserRole> = {
  ADMIN: "ADMIN",
  ADMINISTRATOR: "ADMIN",
  ADMINISTRATOR_ROLE: "ADMIN",
  ADMIN_ROLE: "ADMIN",
  HR_MANAGER: "HR_MANAGER",
  HRMANAGER: "HR_MANAGER",
  HR: "HR_MANAGER",
  HR_OFFICER: "HR_MANAGER",
  HROFFICER: "HR_MANAGER",
  HR_STAFF: "HR_MANAGER",
  STAFF: "HR_MANAGER",
  MANAGER: "MANAGER",
  MANAGER_ROLE: "MANAGER",
  TEAM_LEAD: "MANAGER",
  TEAMLEAD: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
  APPLICANT: "APPLICANT",
};

function mapRoleNameToUserRole(roleName?: string): UserRole {
  if (!roleName) return "UNKNOWN";
  const normalised = roleName.trim().replace(/\s|-/g, "_").toUpperCase();
  return ROLE_MAP[normalised] ?? "UNKNOWN";
}

function decodeTokenPayload(token: string): DecodedTokenPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    if (typeof window === "undefined" || typeof window.atob !== "function") return null;

    // JWT payloads are base64url encoded; normalise before decoding.
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedLength = padded.length + (4 - (padded.length % 4 || 4));
    const withPadding = padded.padEnd(paddedLength, "=");

    const decoded = window.atob(withPadding);
    return JSON.parse(decoded) as DecodedTokenPayload;
  } catch (error) {
    console.warn("Failed to decode JWT", error);
    return null;
  }
}

export function buildAuthUserFromAccessToken(access: string): AuthUser | null {
  const payload = decodeTokenPayload(access);
  if (!payload) return null;

  const rawUserId = payload.user_id ?? (payload as { userId?: number | string }).userId;
  const userId = rawUserId !== undefined && rawUserId !== null
    ? Number(rawUserId)
    : null;

  const rawRoleId = payload.role_id ?? payload.roleId;
  const roleId = rawRoleId !== undefined && rawRoleId !== null
    ? Number(rawRoleId)
    : null;

  let roleName = (payload.role_name ?? payload.role)?.toString();
  let role = mapRoleNameToUserRole(roleName);

  // Fallbacks: treat role_id=1 or user_id=1 as admin when role is not embedded.
  if (!roleName && (roleId === 1 || userId === 1)) {
    roleName = "Admin";
    role = "ADMIN";
  }

  return {
    id: userId,
    username: (payload.username ?? payload.email ?? "user").toString(),
    email: payload.email?.toString(),
    firstName: payload.first_name?.toString(),
    lastName: payload.last_name?.toString(),
    role,
    roleName: roleName?.toString(),
    roleId,
  };
}

export async function loginRequest(payload: LoginPayload): Promise<TokenResponse> {
  // Hardcoded credentials for demo purposes
  const hardcodedUsers = {
    admin: {
      username: "admin",
      password: "admin123",
      role: "ADMIN",
      userId: 1,
      email: "admin@company.com",
      firstName: "Admin",
      lastName: "User"
    },
    employee: {
      username: "employee",
      password: "emp123",
      role: "EMPLOYEE",
      userId: 2,
      email: "employee@company.com",
      firstName: "John",
      lastName: "Doe"
    }
  };

  const user = Object.values(hardcodedUsers).find(
    u => u.username === payload.username && u.password === payload.password
  );

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Create a mock JWT payload
  const payload_data = {
    user_id: user.userId,
    username: user.username,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours from now
  };

  // Create a mock JWT (header.payload.signature)
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload_encoded = btoa(JSON.stringify(payload_data));
  const signature = "mock_signature"; // Mock signature
  const mockToken = `${header}.${payload_encoded}.${signature}`;

  return {
    access: mockToken,
    refresh: mockToken // Using same token for simplicity
  };
}

export async function refreshAccessToken(refresh: string): Promise<Pick<TokenResponse, "access">> {
  return apiFetch<Pick<TokenResponse, "access">>("/auth/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
}
