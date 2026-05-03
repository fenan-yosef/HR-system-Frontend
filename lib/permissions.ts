import type { AuthUser } from "@/types/auth";

/**
 * Helper to check if a user is an Admin or Superuser.
 */
export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === "ADMIN" || user.roleName?.toLowerCase() === "admin" || user.id === 1;
}

/**
 * Helper to check if a user has HR CEO privileges (CEO or Admin).
 */
export function isHRCeo(user: AuthUser | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return user.role === "HR_CEO" || user.roleName === "HR CEO";
}

/**
 * Helper to check if a user has HR Staff privileges (Staff, CEO, or Admin).
 */
export function isHRStaff(user: AuthUser | null): boolean {
  if (!user) return false;
  if (isHRCeo(user)) return true;
  return (
    user.role === "HR_STAFF" ||
    user.roleName === "HR Staff" ||
    user.roleName === "HR" ||
    user.roleName === "Staff"
  );
}
/**
 * Helper to check if a user can perform initial recruitment tasks (Shortlist, Invite).
 * Restricted to Admins and HR Staff (excluding CEO for strict separation).
 */
export function canManageRecruitment(user: AuthUser | null): boolean {
  return isHRStaff(user);
}

/**
 * Helper to check if a user can perform final recruitment approvals (Confirm, Reject).
 * Restricted to Admins and HR CEO.
 */
export function canApproveRecruitment(user: AuthUser | null): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return user.role === "HR_CEO" || user.roleName === "HR CEO";
}
