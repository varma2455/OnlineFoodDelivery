import React, { useContext, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import "./DashboardBestOffers.css";

import {
  FaGift,
  FaTag,
  FaMotorcycle,
  FaCopy,
  FaCheck,
  FaPercent,
  FaChevronDown,
  FaChevronUp
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
    maxDiscount: "₹200",
    details: [
      "Flat 30% discount up to ₹200",
      "Valid on all restaurants & dishes",
      "No maximum order limit"
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
    maxDiscount: "₹160",
    details: [
      "40% off on all trending items",
      "Maximum discount up to ₹160",
      "Applicable with all payment modes"
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
    maxDiscount: "₹150",
    details: [
      "20% discount on entire cart",
      "Valid on breakfast, lunch & dinner",
      "Unlimited orders per week"
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
    maxDiscount: "₹40",
    details: [
      "100% free doorstep delivery",
      "Priority rider dispatch",
      "Valid on top rated kitchens"
    ]
  }
];

const DashboardBestOffers = () => {
  const { couponCode, applyCoupon, removeCoupon, showToast } = useContext(StoreContext);
  const [copiedCode, setCopiedCode] = useState("");
  const [showAll, setShowAll] = useState(false);

  const handleCopy = (code, e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    if (showToast) showToast(`Coupon "${code}" copied to clipboard!`, "info");
    setTimeout(() => setCopiedCode(""), 2500);
  };

  const handleApply = (code, isApplied) => {
    if (isApplied) {
      removeCoupon();
    } else {
      applyCoupon(code);
    }
  };

  const visibleOffers = showAll ? offers : offers.slice(0, 2);

  return (
    <div className="foodexpress-best-offers-section">
      <div className="offers-header-row">
        <div>
          <span className="offers-badge-pill">🏷️ Exclusive Deals</span>
          <h2>Best Offers & Discounts</h2>
          <p>Handpicked savings and promo vouchers ready to apply</p>
        </div>
      </div>

      <div className="offers-voucher-grid">
        {visibleOffers.map((offer) => {
          const isApplied = couponCode === offer.coupon;
          const isCopied = copiedCode === offer.coupon;

          return (
            <div
              className={`voucher-ticket-card ${isApplied ? "applied-card" : ""}`}
              key={offer.id}
            >
              <div className="voucher-header">
                <div
                  className="voucher-icon-box"
                  style={{ backgroundColor: `${offer.color}18`, color: offer.color }}
                >
                  {offer.icon}
                </div>

                <div className="voucher-titles">
                  <div className="voucher-headline-row">
                    <span className="voucher-discount-tag" style={{ color: offer.color }}>
                      {offer.title}
                    </span>
                    <span className="voucher-min-pill">Min {offer.minOrder}</span>
                  </div>
                  <h4 className="voucher-subtitle">{offer.subtitle}</h4>
                </div>
              </div>

              {/* Coupon Code Pill + Actions */}
              <div className="voucher-action-strip">
                <div
                  className="coupon-pill-code"
                  onClick={(e) => handleCopy(offer.coupon, e)}
                  title="Click to copy coupon code"
                >
                  <span className="code-text">{offer.coupon}</span>
                  <button
                    className="btn-copy-code"
                    onClick={(e) => handleCopy(offer.coupon, e)}
                    aria-label={`Copy coupon ${offer.coupon}`}
                  >
                    {isCopied ? <FaCheck className="copied-check" /> : <FaCopy />}
                  </button>
                </div>

                <button
                  className={`btn-apply-voucher ${isApplied ? "applied" : ""}`}
                  onClick={() => handleApply(offer.coupon, isApplied)}
                >
                  {isApplied ? "APPLIED ✓" : "APPLY"}
                </button>
              </div>

              {/* Terms details */}
              <div className="voucher-details-drawer">
                <ul>
                  {offer.details.map((item, idx) => (
                    <li key={idx}>
                      <span className="check-bullet" style={{ color: offer.color }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="btn-toggle-all-vouchers"
        onClick={() => setShowAll(!showAll)}
      >
        {showAll ? (
          <>Show Fewer Deals <FaChevronUp /></>
        ) : (
          <>View All {offers.length} Coupons <FaChevronDown /></>
        )}
      </button>
    </div>
  );
};

export default DashboardBestOffers;