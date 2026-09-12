import React from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardFooterFeatures.css";

import {
  FaMotorcycle,
  FaShieldAlt,
  FaUtensils,
  FaHeadset,
  FaArrowRight
} from "react-icons/fa";

const features = [
  {
    id: 1,
    title: "Fast 30-Min Delivery",
    description: "Lightning-fast doorstep delivery straight from hot kitchen stoves.",
    icon: <FaMotorcycle />,
    color: "#ff5200",
    link: "/browse-food"
  },
  {
    id: 2,
    title: "100% Secure Checkout",
    description: "Encrypted payments via UPI, Cards, NetBanking, and FoodExpress Wallet.",
    icon: <FaShieldAlt />,
    color: "#0f8a65",
    link: "/cart"
  },
  {
    id: 3,
    title: "Hygiene & Freshness",
    description: "FSSAI audited partner kitchens adhering to rigorous safety standards.",
    icon: <FaUtensils />,
    color: "#f59e0b",
    link: "/browse-food"
  },
  {
    id: 4,
    title: "24/7 Priority Support",
    description: "Dedicated assistance for tracking, cancellations, and order refunds.",
    icon: <FaHeadset />,
    color: "#2563eb",
    link: "/contact"
  }
];

const DashboardFooterFeatures = () => {
  const navigate = useNavigate();

  return (
    <section className="foodexpress-footer-features">
      <div className="features-header-block">
        <span className="features-badge-pill">✨ The FoodExpress Promise</span>
        <h2>Why Order With FoodExpress?</h2>
        <p>Premium food delivery experience handcrafted for convenience, taste, and speed.</p>
      </div>

      <div className="features-cards-grid">
        {features.map((item) => (
          <div
            className="single-feature-card"
            key={item.id}
            onClick={() => navigate(item.link)}
          >
            <div
              className="feature-icon-wrapper"
              style={{ backgroundColor: `${item.color}15`, color: item.color }}
            >
              {item.icon}
            </div>

            <h4 className="feature-item-title">{item.title}</h4>
            <p className="feature-item-desc">{item.description}</p>

            <span className="feature-learn-more" style={{ color: item.color }}>
              Explore <FaArrowRight className="arrow-icon" />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DashboardFooterFeatures;