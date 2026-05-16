import { describe, expect, it } from "vitest";
import {
  isAdmin,
  isHRCeo,
  isHRStaff,
  canManageRecruitment,
  canApproveRecruitment,
} from "@/lib/permissions";
import type { AuthUser } from "@/types/auth";

describe("permissions", () => {
  const createUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
    id: 99, // Default non-admin ID
    email: "test@example.com",
    role: "USER",
    roleName: "User",
    firstName: "Test",
    lastName: "User",
    ...overrides,
  });

  describe("isAdmin", () => {
    it("should return false for null user", () => {
      expect(isAdmin(null)).toBe(false);
    });

    it("should return true for user with ADMIN role", () => {
      const user = createUser({ role: "ADMIN" });
      expect(isAdmin(user)).toBe(true);
    });

    it("should return true for user with admin roleName", () => {
      const user = createUser({ roleName: "admin" });
      expect(isAdmin(user)).toBe(true);
    });

    it("should return true for user with id 1", () => {
      const user = createUser({ id: 1, role: "USER" });
      expect(isAdmin(user)).toBe(true);
    });

    it("should return false for regular user", () => {
      const user = createUser({ id: 2, role: "USER" });
      expect(isAdmin(user)).toBe(false);
    });

    it("should handle case-insensitive roleName", () => {
      expect(isAdmin(createUser({ roleName: "ADMIN" }))).toBe(true);
      expect(isAdmin(createUser({ roleName: "Admin" }))).toBe(true);
    });
  });

  describe("isHRCeo", () => {
    it("should return false for null user", () => {
      expect(isHRCeo(null)).toBe(false);
    });

    it("should return true for admin user", () => {
      const user = createUser({ role: "ADMIN" });
      expect(isHRCeo(user)).toBe(true);
    });

    it("should return true for HR_CEO role", () => {
      const user = createUser({ role: "HR_CEO" });
      expect(isHRCeo(user)).toBe(true);
    });

    it("should return true for HR CEO roleName", () => {
      const user = createUser({ roleName: "HR CEO" });
      expect(isHRCeo(user)).toBe(true);
    });

    it("should return false for HR staff (non-CEO)", () => {
      const user = createUser({ role: "HR_STAFF" });
      expect(isHRCeo(user)).toBe(false);
    });

    it("should return false for regular user", () => {
      const user = createUser({ role: "USER" });
      expect(isHRCeo(user)).toBe(false);
    });
  });

  describe("isHRStaff", () => {
    it("should return false for null user", () => {
      expect(isHRStaff(null)).toBe(false);
    });

    it("should return true for admin user", () => {
      const user = createUser({ role: "ADMIN" });
      expect(isHRStaff(user)).toBe(true);
    });

    it("should return true for HR_CEO", () => {
      const user = createUser({ role: "HR_CEO" });
      expect(isHRStaff(user)).toBe(true);
    });

    it("should return true for HR_STAFF role", () => {
      const user = createUser({ role: "HR_STAFF" });
      expect(isHRStaff(user)).toBe(true);
    });

    it("should return true for HR Staff roleName", () => {
      const user = createUser({ roleName: "HR Staff" });
      expect(isHRStaff(user)).toBe(true);
    });

    it("should return true for HR roleName", () => {
      const user = createUser({ roleName: "HR" });
      expect(isHRStaff(user)).toBe(true);
    });

    it("should return true for Staff roleName", () => {
      const user = createUser({ roleName: "Staff" });
      expect(isHRStaff(user)).toBe(true);
    });

    it("should return false for regular user", () => {
      const user = createUser({ role: "USER" });
      expect(isHRStaff(user)).toBe(false);
    });
  });

  describe("canManageRecruitment", () => {
    it("should return false for null user", () => {
      expect(canManageRecruitment(null)).toBe(false);
    });

    it("should return true for HR staff", () => {
      const user = createUser({ role: "HR_STAFF" });
      expect(canManageRecruitment(user)).toBe(true);
    });

    it("should return true for admin", () => {
      const user = createUser({ role: "ADMIN" });
      expect(canManageRecruitment(user)).toBe(true);
    });

    it("should return true for HR CEO (inherits isHRStaff)", () => {
      const user = createUser({ role: "HR_CEO" });
      expect(canManageRecruitment(user)).toBe(true);
    });

    it("should return false for regular user", () => {
      const user = createUser({ role: "USER" });
      expect(canManageRecruitment(user)).toBe(false);
    });
  });

  describe("canApproveRecruitment", () => {
    it("should return false for null user", () => {
      expect(canApproveRecruitment(null)).toBe(false);
    });

    it("should return true for admin", () => {
      const user = createUser({ role: "ADMIN" });
      expect(canApproveRecruitment(user)).toBe(true);
    });

    it("should return true for HR_CEO", () => {
      const user = createUser({ role: "HR_CEO" });
      expect(canApproveRecruitment(user)).toBe(true);
    });

    it("should return true for HR CEO roleName", () => {
      const user = createUser({ roleName: "HR CEO" });
      expect(canApproveRecruitment(user)).toBe(true);
    });

    it("should return false for HR staff (not CEO)", () => {
      const user = createUser({ role: "HR_STAFF" });
      expect(canApproveRecruitment(user)).toBe(false);
    });

    it("should return false for regular user", () => {
      const user = createUser({ role: "USER" });
      expect(canApproveRecruitment(user)).toBe(false);
    });
  });

  describe("role hierarchy", () => {
    it("admin should have all permissions", () => {
      const admin = createUser({ role: "ADMIN" });
      expect(isAdmin(admin)).toBe(true);
      expect(isHRCeo(admin)).toBe(true);
      expect(isHRStaff(admin)).toBe(true);
      expect(canManageRecruitment(admin)).toBe(true);
      expect(canApproveRecruitment(admin)).toBe(true);
    });

    it("HR CEO should have CEO and staff permissions but not approval", () => {
      const hrCeo = createUser({ role: "HR_CEO" });
      expect(isAdmin(hrCeo)).toBe(false);
      expect(isHRCeo(hrCeo)).toBe(true);
      expect(isHRStaff(hrCeo)).toBe(true);
      expect(canManageRecruitment(hrCeo)).toBe(true);
      expect(canApproveRecruitment(hrCeo)).toBe(true);
    });

    it("HR Staff should only have staff permissions", () => {
      const hrStaff = createUser({ role: "HR_STAFF" });
      expect(isAdmin(hrStaff)).toBe(false);
      expect(isHRCeo(hrStaff)).toBe(false);
      expect(isHRStaff(hrStaff)).toBe(true);
      expect(canManageRecruitment(hrStaff)).toBe(true);
      expect(canApproveRecruitment(hrStaff)).toBe(false);
    });

    it("regular user should have no permissions", () => {
      const user = createUser({ id: 99, role: "USER" });
      expect(isAdmin(user)).toBe(false);
      expect(isHRCeo(user)).toBe(false);
      expect(isHRStaff(user)).toBe(false);
      expect(canManageRecruitment(user)).toBe(false);
      expect(canApproveRecruitment(user)).toBe(false);
    });
  });
});
