import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders button with default data attributes", () => {
    render(<Button>Save</Button>);

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-variant", "default");
    expect(button).toHaveAttribute("data-size", "default");
  });

  it("renders child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/profile">Go to profile</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Go to profile" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/profile");
  });
});
