import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardStatsCards.css";

import {
  FaRedo,
  FaMotorcycle,
  FaPercent,
  FaHeart,
  FaMapMarkerAlt,
  FaWallet,
  FaGift,
  FaHeadset
} from "react-icons/fa";

const quickActions = [
  {
    id: "reorder",
    title: "Reorder",
    subtitle: "Past favorites",
    icon: <FaRedo />,
    color: "#ff5200",
    bg: "#fff4ed",
    action: "orders"
  },
  {
    id: "track",
    title: "Track Order",
    subtitle: "Live status",
    icon: <FaMotorcycle />,
    color: "#00c896",
    bg: "#e6faf5",
    action: "track"
  },
  {
    id: "offers",
    title: "Offers",
    subtitle: "Up to 50% OFF",
    icon: <FaPercent />,
    color: "#3d7eff",
    bg: "#edf3ff",
    action: "offers"
  },
  {
    id: "favorites",
    title: "Favorites",
    subtitle: "Saved foods",
    icon: <FaHeart />,
    color: "#ff3b30",
    bg: "#ffebee",
    action: "favorites"
  },
  {
    id: "addresses",
    title: "Saved Addresses",
    subtitle: "Home & Work",
    icon: <FaMapMarkerAlt />,
    color: "#8b5cf6",
    bg: "#f5f3ff",
    action: "addresses"
  },
  {
    id: "wallet",
    title: "Wallet",
    subtitle: "Instant refunds",
    icon: <FaWallet />,
    color: "#f59e0b",
    bg: "#fef3c7",
    action: "wallet"
  },
  {
    id: "rewards",
    title: "Rewards",
    subtitle: "Earn coins",
    icon: <FaGift />,
    color: "#ec4899",
    bg: "#fce7f3",
    action: "rewards"
  },
  {
    id: "support",
    title: "Help & Support",
    subtitle: "24/7 assistance",
    icon: <FaHeadset />,
    color: "#10b981",
    bg: "#ecfdf5",
    action: "support"
  }
];

const DashboardStatsCards = ({ onOpenAddressModal }) => {
  const navigate = useNavigate();

  const handleAction = (act) => {
    switch (act) {
      case "orders":
        navigate("/my-orders");
        break;
      case "track":
        const liveSection = document.getElementById("active-order-section");
        if (liveSection) {
          liveSection.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate("/my-orders");
        }
        break;
      case "offers":
        const offersSec = document.getElementById("offers-section");
        if (offersSec) {
          offersSec.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate("/offers");
        }
        break;
      case "favorites":
        const favSec = document.getElementById("favorites-section");
        if (favSec) {
          favSec.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate("/profile");
        }
        break;
      case "addresses":
        if (onOpenAddressModal) {
          onOpenAddressModal();
        } else {
          navigate("/profile");
        }
        break;
      case "wallet":
        const walletSec = document.getElementById("wallet-section");
        if (walletSec) {
          walletSec.scrollIntoView({ behavior: "smooth" });
        }
        break;
      case "rewards":
        const rewardsSec = document.getElementById("rewards-section");
        if (rewardsSec) {
          rewardsSec.scrollIntoView({ behavior: "smooth" });
        }
        break;
      case "support":
        navigate("/support");
        break;
      default:
        break;
    }
  };

  return (
    <section className="foodexpress-quick-actions-bar">
      <div className="quick-actions-header">
        <h3>⚡ Quick Actions</h3>
        <span className="quick-hint">Instant shortcuts for you</span>
      </div>

      <div className="quick-actions-grid">
        {quickActions.map((item) => (
          <div
            key={item.id}
            className="action-card-item"
            onClick={() => handleAction(item.action)}
            title={item.title}
          >
            <div
              className="action-icon-badge"
              style={{ color: item.color, backgroundColor: item.bg }}
            >
              {item.icon}
            </div>
            <div className="action-text">
              <h4>{item.title}</h4>
              <p>{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DashboardStatsCards;