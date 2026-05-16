import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RoleGuard } from "@/context/RoleGuard";

vi.mock("@/hooks/useRoleGuard", () => ({
  useRoleGuard: vi.fn(),
}));

import { useRoleGuard } from "@/hooks/useRoleGuard";

const mockUseRoleGuard = useRoleGuard as ReturnType<typeof vi.fn>;

describe("RoleGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state when authentication is checking", () => {
    mockUseRoleGuard.mockReturnValue({
      canAccess: false,
      isLoading: true,
      isAuthenticated: false,
    });

    render(
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div>Protected Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Loading your workspace...")).toBeInTheDocument();
  });

  it("should render children when user has access", () => {
    mockUseRoleGuard.mockReturnValue({
      canAccess: true,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div>Admin Dashboard</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    expect(
      screen.queryByText("You do not have permission"),
    ).not.toBeInTheDocument();
  });

  it("should show permission denied message when user lacks access", () => {
    mockUseRoleGuard.mockReturnValue({
      canAccess: false,
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div>Admin Dashboard</div>
      </RoleGuard>,
    );

    expect(
      screen.getByText("You do not have permission to access this area."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Admin Dashboard")).not.toBeInTheDocument();
  });

  it("should show redirect loading when authenticated but wrong role", () => {
    mockUseRoleGuard.mockReturnValue({
      canAccess: false,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div>Admin Dashboard</div>
      </RoleGuard>,
    );

    expect(
      screen.getByText("Redirecting to your workspace..."),
    ).toBeInTheDocument();
  });

  it("should pass allowedRoles to useRoleGuard hook", () => {
    mockUseRoleGuard.mockReturnValue({
      canAccess: true,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard allowedRoles={["ADMIN", "HR_MANAGER"]}>
        <div>Content</div>
      </RoleGuard>,
    );

    expect(mockUseRoleGuard).toHaveBeenCalledWith({
      allowedRoles: ["ADMIN", "HR_MANAGER"],
    });
  });

  it("should work without specifying allowedRoles", () => {
    mockUseRoleGuard.mockReturnValue({
      canAccess: true,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard>
        <div>Public Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Public Content")).toBeInTheDocument();
    expect(mockUseRoleGuard).toHaveBeenCalledWith({
      allowedRoles: undefined,
    });
  });

  it("should handle complex children elements", () => {
    mockUseRoleGuard.mockReturnValue({
      canAccess: true,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to admin panel</p>
          <button>Click me</button>
        </div>
      </RoleGuard>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Welcome to admin panel")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("should transition from loading to denied state", () => {
    const { rerender } = render(
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div>Content</div>
      </RoleGuard>,
    );

    mockUseRoleGuard.mockReturnValue({
      canAccess: false,
      isLoading: true,
      isAuthenticated: false,
    });

    rerender(
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div>Content</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Loading your workspace...")).toBeInTheDocument();

    mockUseRoleGuard.mockReturnValue({
      canAccess: false,
      isLoading: false,
      isAuthenticated: false,
    });

    rerender(
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div>Content</div>
      </RoleGuard>,
    );

    expect(
      screen.getByText("You do not have permission to access this area."),
    ).toBeInTheDocument();
  });

  it("should transition from loading to allowed state", () => {
    mockUseRoleGuard.mockReturnValue({
      canAccess: false,
      isLoading: true,
      isAuthenticated: false,
    });

    const { rerender } = render(
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div>Admin Area</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Loading your workspace...")).toBeInTheDocument();

    mockUseRoleGuard.mockReturnValue({
      canAccess: true,
      isLoading: false,
      isAuthenticated: true,
    });

    rerender(
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div>Admin Area</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Admin Area")).toBeInTheDocument();
  });
});
