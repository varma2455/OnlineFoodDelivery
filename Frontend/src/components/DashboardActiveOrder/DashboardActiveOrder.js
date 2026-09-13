import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import "./DashboardActiveOrder.css";

import {
  FaMotorcycle,
  FaCheckCircle,
  FaClock,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUtensils,
  FaArrowRight,
  FaShoppingBag,
  FaCompass
} from "react-icons/fa";

const timelineStages = [
  { key: "Placed", label: "Order Placed", icon: "✓" },
  { key: "Confirmed", label: "Confirmed", icon: "✓" },
  { key: "Preparing", label: "Cooking in Kitchen", icon: "🍳" },
  { key: "Out for Delivery", label: "Out for Delivery", icon: "🛵" },
  { key: "Delivered", label: "Delivered", icon: "🏠" }
];

const DashboardActiveOrder = ({ onExploreClick }) => {
  const navigate = useNavigate();
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const API_BASE = API_BASE_URL;
        const { data } = await axios.get(`${API_BASE}/api/dashboard/active-order`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success && data.activeOrder) {
          setActiveOrder(data.activeOrder);
        } else {
          setActiveOrder(null);
        }
      } catch (err) {
        console.warn("Active order fetch note:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOrder();
    const interval = setInterval(fetchActiveOrder, 25000); // refresh every 25s
    return () => clearInterval(interval);
  }, []);

  const getStageIndex = (status) => {
    switch (status) {
      case "Placed":
        return 0;
      case "Confirmed":
        return 1;
      case "Preparing":
        return 2;
      case "Out for Delivery":
        return 3;
      case "Delivered":
        return 4;
      default:
        return 1;
    }
  };

  if (loading) {
    return (
      <div className="active-order-skeleton animate-pulse">
        <div className="skeleton-bar title"></div>
        <div className="skeleton-bar timeline"></div>
      </div>
    );
  }

  // SMART EMPTY STATE (Requirement 8 & 21)
  if (!activeOrder) {
    return (
      <section className="smart-empty-order-card">
        <div className="empty-order-left">
          <div className="empty-badge">
            <span className="pulse-dot"></span> Live Kitchens Open
          </div>
          <h2>Ready to order something delicious? 🍕</h2>
          <p>
            Hot & fresh meals prepared by top-rated local restaurants. Enjoy lightning-fast delivery in under 30 minutes!
          </p>
          <div className="empty-actions">
            <button
              className="btn-order-now"
              onClick={() => {
                if (onExploreClick) onExploreClick();
                else navigate("/browse-food");
              }}
            >
              <FaUtensils /> Order Now <FaArrowRight />
            </button>
            <button className="btn-past-orders" onClick={() => navigate("/my-orders")}>
              <FaShoppingBag /> View Past Orders
            </button>
          </div>
        </div>

        <div className="empty-order-right">
          <div className="empty-illustration-badge">
            <span className="big-emoji">🛵</span>
            <div className="mini-bubble bubble-1">⚡ 25 Min</div>
            <div className="mini-bubble bubble-2">⭐ 4.9 Rating</div>
          </div>
        </div>
      </section>
    );
  }

  const currentStage = getStageIndex(activeOrder.orderStatus);
  const orderNumber = (activeOrder._id || "").slice(-6).toUpperCase();
  const firstItemName = activeOrder.items?.[0]?.name || "Delicious Food";
  const moreCount = (activeOrder.items?.length || 1) - 1;

  const rider = activeOrder.deliveryPartner || activeOrder.delivery?.deliveryPartner;

  return (
    <section className="live-active-order-container animate-fade-in">
      {/* Card Header */}
      <div className="active-card-top-bar">
        <div className="order-lead-info">
          <div className="motorcycle-live-indicator">
            <FaMotorcycle />
          </div>
          <div>
            <div className="status-title-row">
              <h3>
                {activeOrder.orderStatus === "Out for Delivery"
                  ? "Your Order is on the Way! 🛵"
                  : activeOrder.orderStatus === "Preparing"
                  ? "Kitchen is Preparing your Food! 🍳"
                  : "Order Confirmed & Being Prepped! 🍲"}
              </h3>
              <span className="live-pill">LIVE TRACKING</span>
            </div>
            <p className="order-time-stamp">
              Order #{orderNumber} • Arriving in ~{activeOrder.estimatedDeliveryTime || 30} mins
            </p>
          </div>
        </div>

        <div className="action-top-badges">
          <span className="order-pill-status">{activeOrder.orderStatus || "Confirmed"}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="timeline-stages-track">
        <div
          className="timeline-progress-bar-fill"
          style={{ width: `${(currentStage / (timelineStages.length - 1)) * 100}%` }}
        ></div>
        {timelineStages.map((stage, idx) => {
          const isDone = idx < currentStage;
          const isCurrent = idx === currentStage;
          return (
            <div key={stage.key} className={`timeline-stage-point ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}>
              <div className="step-node">
                {isDone ? <FaCheckCircle className="check-done" /> : isCurrent ? <span className="current-ping">●</span> : <span className="pending-circle">○</span>}
              </div>
              <span className="step-label">{stage.label}</span>
            </div>
          );
        })}
      </div>

      {/* Details Bar & Contact */}
      <div className="active-card-details-row">
        <div className="detail-chip-group">
          <div className="chip">
            <FaUtensils className="chip-icon" />
            <span>
              <strong>{firstItemName}</strong>
              {moreCount > 0 && ` +${moreCount} more`}
            </span>
          </div>
          <div className="chip">
            <FaMapMarkerAlt className="chip-icon" />
            <span>
              Delivering to: <strong>{activeOrder.deliveryAddress?.city || "Home"}</strong>
            </span>
          </div>
          <div className="chip rider">
            <span className="rider-avatar">🛵</span>
            <span>
              {rider && rider.name ? (
                <>
                  Rider: <strong>{rider.name}</strong> ({rider.rating ? Number(rider.rating).toFixed(1) : "5.0"} ★)
                </>
              ) : (
                <>
                  Rider: <em>Finding a delivery partner...</em>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="active-action-buttons">
          <button className="btn-track-full" onClick={() => navigate("/my-orders")}>
            <FaCompass /> Track Live Order
          </button>
          {rider && rider.phone ? (
            <a href={`tel:${rider.phone}`} className="btn-call-partner">
              <FaPhoneAlt /> Call Rider
            </a>
          ) : (
            <button className="btn-call-partner" disabled style={{ opacity: 0.6, cursor: "not-allowed" }}>
              <FaPhoneAlt /> Finding Rider
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardActiveOrder;
