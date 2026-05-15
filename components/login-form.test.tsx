import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ROUTES } from "@/constants/routes";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  login: vi.fn(),
  isLoading: false,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    login: mocks.login,
    isLoading: mocks.isLoading,
  }),
}));

vi.mock("framer-motion", async () => {
  const React = await import("react");

  type IntrinsicTag = Extract<keyof React.JSX.IntrinsicElements, string>;

  const createMotionComponent = (Tag: IntrinsicTag) => {
    const MotionComponent = ({
      children,
      animate: _animate,
      exit: _exit,
      initial: _initial,
      transition: _transition,
      variants: _variants,
      whileHover: _whileHover,
      whileTap: _whileTap,
      ...props
    }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>) => {
      void _animate;
      void _exit;
      void _initial;
      void _transition;
      void _variants;
      void _whileHover;
      void _whileTap;
      return React.createElement(Tag, props, children);
    };

    MotionComponent.displayName = `motion.${String(Tag)}`;
    return MotionComponent;
  };

  const AnimatePresence = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );
  AnimatePresence.displayName = "AnimatePresence";

  return {
    AnimatePresence,
    motion: {
      div: createMotionComponent("div"),
      h1: createMotionComponent("h1"),
      p: createMotionComponent("p"),
    },
  };
});

import { LoginForm } from "@/components/login-form";

describe("LoginForm", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.login.mockReset();
    mocks.isLoading = false;
  });

  it("submits credentials and redirects to the dashboard", async () => {
    mocks.login.mockResolvedValue(undefined);

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "jane.doe" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mocks.login).toHaveBeenCalledWith("jane.doe", "secret");
    });
    expect(mocks.replace).toHaveBeenCalledWith(ROUTES.DASHBOARD);
  });

  it("shows a loading state when authentication is in progress", () => {
    mocks.isLoading = true;

    render(<LoginForm />);

    expect(
      screen.getByRole("button", { name: /authenticating/i }),
    ).toBeDisabled();
    expect(screen.getByText("Authenticating...")).toBeInTheDocument();
  });

  it("shows an error message when login fails", async () => {
    mocks.login.mockRejectedValue(new Error("invalid credentials"));

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "jane.doe" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(
        screen.getByText("Unable to sign in. Please check your credentials."),
      ).toBeInTheDocument();
    });
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
