import type { UserRole } from "@/types/auth";

export const ROLES: Record<UserRole, UserRole> = {
  ADMIN: "ADMIN",
  HR_STAFF: "HR_STAFF",
  EMPLOYEE: "EMPLOYEE",
  APPLICANT: "APPLICANT",
  UNKNOWN: "UNKNOWN",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  HR_STAFF: "HR Staff",
  EMPLOYEE: "Employee",
  APPLICANT: "Applicant",
  UNKNOWN: "Unknown",
};
