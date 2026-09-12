import React from "react";
import { render, screen } from "@testing-library/react";
import PremiumMembershipBadge from "./PremiumMembershipBadge";

describe("PremiumMembershipBadge Component", () => {
  test("renders SILVER MEMBER badge with silver tier class", () => {
    const { container } = render(<PremiumMembershipBadge plan="silver" />);
    const badge = screen.getByText("SILVER MEMBER");
    expect(badge).toBeTruthy();
    expect(badge.className).toContain("membership-badge");
    expect(badge.className).toContain("silver");
    expect(container.textContent).not.toContain("👑");
  });

  test("renders GOLD MEMBER badge with gold tier class and object prop", () => {
    const { container } = render(<PremiumMembershipBadge plan={{ plan: "gold", status: "active" }} />);
    const badge = screen.getByText("GOLD MEMBER");
    expect(badge).toBeTruthy();
    expect(badge.className).toContain("membership-badge");
    expect(badge.className).toContain("gold");
    expect(container.textContent).not.toContain("👑");
  });

  test("renders PLATINUM MEMBER badge with platinum tier class and strictly NO crown", () => {
    const { container } = render(<PremiumMembershipBadge plan="platinum" />);
    const badge = screen.getByText("PLATINUM MEMBER");
    expect(badge).toBeTruthy();
    expect(badge.className).toContain("membership-badge");
    expect(badge.className).toContain("platinum");
    expect(badge.textContent).toBe("PLATINUM MEMBER");
    expect(container.querySelector("svg")).toBeNull();
    expect(container.textContent).not.toContain("👑");
  });

  test("renders FREE MEMBER badge when plan is null, undefined, or 'free'", () => {
    const { rerender } = render(<PremiumMembershipBadge plan={null} />);
    expect(screen.getByText("FREE MEMBER").className).toContain("free");

    rerender(<PremiumMembershipBadge plan="free" />);
    expect(screen.getByText("FREE MEMBER").className).toContain("free");

    rerender(<PremiumMembershipBadge plan={{ plan: "free" }} />);
    expect(screen.getByText("FREE MEMBER").className).toContain("free");
  });

  test("applies size-sm and size-lg classes correctly", () => {
    const { rerender } = render(<PremiumMembershipBadge plan="platinum" size="sm" />);
    let badge = screen.getByText("PLATINUM MEMBER");
    expect(badge.className).toContain("size-sm");

    rerender(<PremiumMembershipBadge plan="platinum" size="lg" />);
    badge = screen.getByText("PLATINUM MEMBER");
    expect(badge.className).toContain("size-lg");
  });
});
