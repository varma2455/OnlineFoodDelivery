import React, { useContext, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./BrowseOffers.css";

import {
  FaGift,
  FaTag,
  FaMotorcycle,
  FaPercent,
  FaCopy,
  FaCheck
} from "react-icons/fa";

const offers = [
  {
    id: 1,
    title: "30% OFF",
    subtitle: "New FoodExpress Customer Special",
    coupon: "FIRST30",
    color: "#ff5200",
    icon: <FaGift />,
    minOrder: "₹199",
    details: [
      "Flat 30% discount up to ₹200",
      "Valid on all restaurants & dishes",
      "No maximum order limit",
      "Valid for limited time"
    ]
  },
  {
    id: 2,
    title: "40% OFF",
    subtitle: "Welcome Feast Special",
    coupon: "WELCOME40",
    color: "#e63946",
    icon: <FaPercent />,
    minOrder: "₹299",
    details: [
      "40% off on all trending items",
      "Maximum discount up to ₹160",
      "Applicable with all payment modes",
      "Auto-applies at final checkout"
    ]
  },
  {
    id: 3,
    title: "20% OFF",
    subtitle: "Daily Foodie Craving Deal",
    coupon: "FOOD20",
    color: "#0f8a65",
    icon: <FaTag />,
    minOrder: "₹149",
    details: [
      "20% discount on entire cart",
      "Valid on breakfast, lunch & dinner",
      "Unlimited orders per week",
      "Direct instant bill deduction"
    ]
  },
  {
    id: 4,
    title: "FREE DELIVERY",
    subtitle: "On All Orders Above ₹499",
    coupon: "FREEDEL",
    color: "#2563eb",
    icon: <FaMotorcycle />,
    minOrder: "₹499",
    details: [
      "100% free doorstep delivery",
      "Priority rider dispatch",
      "Valid on top rated kitchens",
      "Save ₹40 instantly"
    ]
  }
];

export default function BrowseOffers() {
  const { couponCode, applyCoupon, removeCoupon, showToast } = useContext(StoreContext);
  const [copiedCode, setCopiedCode] = useState("");

  const handleCopy = (code, e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    if (showToast) showToast(`Coupon "${code}" copied to clipboard!`, "info");
    setTimeout(() => setCopiedCode(""), 2200);
  };

  const handleApply = (code, isApplied) => {
    if (isApplied) {
      removeCoupon();
    } else {
      applyCoupon(code);
    }
  };

  return (
    <section className="offers-section" id="offers-section">
      <div className="section-header">
        <div>
          <span className="offers-pill-badge">🎁 Special Coupons</span>
          <h2>Exclusive Offers & Deals</h2>
          <p>Apply coupons and save more on your meal today</p>
        </div>
      </div>

      <div className="offer-grid">
        {offers.map((offer) => {
          const isApplied = couponCode === offer.coupon;
          const isCopied = copiedCode === offer.coupon;

          return (
            <div
              key={offer.id}
              className={`offer-card ${isApplied ? "applied" : ""}`}
            >
              {/* Header: Icon + Titles */}
              <div className="offer-card-top">
                <div className="offer-header">
                  <div
                    className="offer-icon"
                    style={{
                      backgroundColor: `${offer.color}15`,
                      color: offer.color
                    }}
                  >
                    {offer.icon}
                  </div>

                  <div className="offer-header-info">
                    <div className="offer-title-row">
                      <span className="offer-discount" style={{ color: offer.color }}>
                        {offer.title}
                      </span>
                      <span className="offer-min-order">Min {offer.minOrder}</span>
                    </div>
                    <h4 className="offer-description">{offer.subtitle}</h4>
                  </div>
                </div>

                {/* Coupon Code & Apply Button Row */}
                <div className="coupon-action">
                  <div
                    className="coupon-code"
                    onClick={(e) => handleCopy(offer.coupon, e)}
                    title="Click to copy coupon code"
                  >
                    <span className="code-text">{offer.coupon}</span>
                    <button
                      type="button"
                      className="copy-btn"
                      onClick={(e) => handleCopy(offer.coupon, e)}
                      aria-label={`Copy coupon ${offer.coupon}`}
                    >
                      {isCopied ? <FaCheck className="copied-check" /> : <FaCopy />}
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`apply-button ${isApplied ? "active" : ""}`}
                    onClick={() => handleApply(offer.coupon, isApplied)}
                  >
                    {isApplied ? "APPLIED ✓" : "APPLY"}
                  </button>
                </div>
              </div>

              {/* Benefits List */}
              <div className="offer-benefits">
                <ul>
                  {offer.details.map((benefit, idx) => (
                    <li key={idx}>
                      <span className="benefit-check" style={{ color: offer.color }}>
                        ✓
                      </span>
                      <span className="benefit-text">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
