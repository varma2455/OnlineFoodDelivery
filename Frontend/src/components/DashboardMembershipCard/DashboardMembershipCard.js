import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import PremiumMembershipBadge from "../PremiumMembershipBadge/PremiumMembershipBadge";
import "./DashboardMembershipCard.css";
import {
  FaCheckCircle,
  FaBolt,
  FaShieldAlt,
  FaPercent,
  FaHeadset,
  FaArrowRight
} from "react-icons/fa";

export default function DashboardMembershipCard() {
  const { user } = useContext(StoreContext);
  const navigate = useNavigate();

  const planKey = (typeof user?.membership === "object" ? user?.membership?.plan : user?.membership) || "free";
  const isMemberActive = user?.membership?.status === "active" || ["silver", "gold", "platinum"].includes((planKey || "").toLowerCase());
  const isPaidMember = isMemberActive && planKey.toLowerCase() !== "free";

  const perks = [
    { icon: <FaBolt />, text: "Unlimited Free Delivery on all eligible orders" },
    { icon: <FaPercent />, text: "Exclusive Extra up to 15% OFF across top restaurants" },
    { icon: <FaHeadset />, text: "Priority VIP Customer Support & Instant Dispatch" },
    { icon: <FaShieldAlt />, text: "Monthly Wallet Cashback & Bonus Reward Points" }
  ];

  const handleUpgrade = () => {
    navigate("/membership");
  };

  return (
    <div className="membership-vip-card">
      <div className="membership-top-row">
        <div className="membership-brand">
          <div>
            <span className="membership-tag">MEMBERSHIP STATUS</span>
            <div style={{ marginTop: "6px" }}>
              <PremiumMembershipBadge plan={planKey} />
            </div>
          </div>
        </div>
        <span className="active-badge">
          <FaCheckCircle /> {isPaidMember ? "ACTIVE" : "FREE TIER"}
        </span>
      </div>

      <p className="membership-desc">
        Enjoy handcrafted fine dining, lightning-fast delivery, and members-only savings.
      </p>

      <div className="membership-perks-list">
        {perks.map((perk, idx) => (
          <div key={idx} className="perk-row">
            <span className="perk-icon">{perk.icon}</span>
            <span className="perk-text">{perk.text}</span>
          </div>
        ))}
      </div>

      <div className="membership-footer-cta">
        <div className="savings-highlight">
          <span className="save-label">Saved this month</span>
          <strong className="save-amount">₹480</strong>
        </div>
        <button
          type="button"
          className="btn-membership-action"
          onClick={handleUpgrade}
        >
          <FaArrowRight /> {isPaidMember ? "Manage Membership" : "Upgrade Membership"}
        </button>
      </div>
    </div>
  );
}
