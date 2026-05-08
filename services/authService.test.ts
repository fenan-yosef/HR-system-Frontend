import { describe, expect, it } from "vitest";

import { buildAuthUserFromAccessToken } from "@/services/authService";

function createAccessToken(payload: Record<string, unknown>) {
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `header.${encodedPayload}.signature`;
}

describe("buildAuthUserFromAccessToken", () => {
  it("decodes token payload fields into an auth user", () => {
    const token = createAccessToken({
      user_id: 42,
      username: "jane.doe",
      email: "jane@example.com",
      first_name: "Jane",
      last_name: "Doe",
      role_name: "Employee",
      role_id: 4,
    });

    expect(buildAuthUserFromAccessToken(token)).toEqual({
      id: 42,
      username: "jane.doe",
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Doe",
      role: "EMPLOYEE",
      roleName: "Employee",
      roleId: 4,
    });
  });

  it("maps backend role names to app roles", () => {
    const token = createAccessToken({
      user_id: 7,
      username: "sam",
      role_name: "hr manager",
    });

    expect(buildAuthUserFromAccessToken(token)).toMatchObject({
      id: 7,
      username: "sam",
      role: "HR_MANAGER",
      roleName: "hr manager",
    });
  });

  it("falls back to admin when role metadata is missing but ids indicate admin", () => {
    const token = createAccessToken({
      user_id: 1,
      username: "admin",
    });

    expect(buildAuthUserFromAccessToken(token)).toEqual({
      id: 1,
      username: "admin",
      email: undefined,
      firstName: undefined,
      lastName: undefined,
      role: "ADMIN",
      roleName: "Admin",
      roleId: null,
    });
  });
});