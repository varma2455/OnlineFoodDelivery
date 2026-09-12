import React from "react";
import PropTypes from "prop-types";
import "./PremiumMembershipBadge.css";

/**
 * PremiumMembershipBadge
 * Reusable premium framed badge representing membership status:
 * Silver, Gold, Platinum, or Free.
 * Strictly adheres to the design specification: NO crown emoji or icon.
 */
export default function PremiumMembershipBadge({ plan, className = "", size = "md" }) {
  const normalizePlan = (raw) => {
    if (!raw) return "free";
    let p = typeof raw === "object" ? (raw.plan || raw.tier || "") : raw;
    p = String(p).trim().toLowerCase();
    if (p.includes("platinum")) return "platinum";
    if (p.includes("gold")) return "gold";
    if (p.includes("silver")) return "silver";
    return "free";
  };

  const planKey = normalizePlan(plan);

  const labels = {
    silver: "SILVER MEMBER",
    gold: "GOLD MEMBER",
    platinum: "PLATINUM MEMBER",
    free: "FREE MEMBER"
  };

  const displayText = labels[planKey] || "FREE MEMBER";

  const sizeClass = size && size !== "md" ? `size-${size}` : "";

  return (
    <span
      className={`membership-badge ${planKey} ${sizeClass} ${className}`.trim()}
      data-tier={planKey}
    >
      {displayText}
    </span>
  );
}

PremiumMembershipBadge.propTypes = {
  plan: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  className: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"])
};
