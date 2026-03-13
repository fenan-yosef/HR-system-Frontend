import type { UserRole } from "@/types/auth";

export const ROLES: Record<UserRole, UserRole> = {
  ADMIN: "ADMIN",
  HR_CEO: "HR_CEO",
  HR_MANAGER: "HR_MANAGER",
  EMPLOYEE: "EMPLOYEE",
  APPLICANT: "APPLICANT",
  UNKNOWN: "UNKNOWN",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  HR_CEO: "HR CEO",
  HR_MANAGER: "HR Staff",
  EMPLOYEE: "Employee",
  APPLICANT: "Applicant",
  UNKNOWN: "Unknown",
};
