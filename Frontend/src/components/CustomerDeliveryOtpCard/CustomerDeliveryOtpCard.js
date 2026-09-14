import React, { useState, useEffect } from "react";
import { orderAPI } from "../../services/api";
import "./CustomerDeliveryOtpCard.css";
import {
  FaShieldAlt,
  FaKey,
  FaCopy,
  FaCheck,
  FaSyncAlt,
  FaExclamationTriangle,
  FaMotorcycle,
  FaCheckCircle,
  FaClock
} from "react-icons/fa";

/**
 * CustomerDeliveryOtpCard
 * Displays the secure delivery handover OTP to the customer.
 * Hides raw OTP when delivered and provides regeneration with rate limit handling.
 */
const CustomerDeliveryOtpCard = ({ order, onOtpUpdated, showToast }) => {
  const [currentOtp, setCurrentOtp] = useState(order?.deliveryOtp || null);
  const [isCopied, setIsCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Sync OTP if parent order updates
  useEffect(() => {
    if (order?.deliveryOtp) {
      setCurrentOtp(order.deliveryOtp);
    }
  }, [order?.deliveryOtp]);

  // Handle countdown for rate limit
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  if (!order) return null;

  const isDelivered =
    (order.orderStatus || "").toLowerCase() === "delivered" ||
    (order.deliveryStatus || order.delivery?.status || "").toLowerCase() === "delivered";

  const isCancelled = (order.orderStatus || "").toLowerCase() === "cancelled";

  // If cancelled, no OTP card needed
  if (isCancelled) return null;

  const deliveryStatus = (order.deliveryStatus || order.delivery?.status || "").toLowerCase();
  const partner = order.deliveryPartner || order.delivery?.deliveryPartner;

  // Compute rider status badge text and urgency
  let statusBadge = {
    text: "Order In Kitchen • Assigning Delivery Partner",
    className: "status-stage-pending",
    icon: <FaClock />
  };

  if (isDelivered) {
    statusBadge = {
      text: "Order Delivered • Handover Verified",
      className: "status-stage-delivered",
      icon: <FaCheckCircle />
    };
  } else if (deliveryStatus === "arrived at customer") {
    statusBadge = {
      text: "Rider Has Arrived • Please Share OTP for Handover",
      className: "status-stage-arrived",
      icon: <FaMotorcycle />
    };
  } else if (
    deliveryStatus === "going to customer" ||
    deliveryStatus === "order picked up" ||
    (order.orderStatus === "Out for Delivery" && !isDelivered)
  ) {
    statusBadge = {
      text: "Out for Delivery • Rider On The Way",
      className: "status-stage-transit",
      icon: <FaMotorcycle />
    };
  } else if (
    deliveryStatus === "accepted" ||
    deliveryStatus === "going to restaurant" ||
    deliveryStatus === "arrived at restaurant" ||
    partner
  ) {
    statusBadge = {
      text: "Driver Assigned & Heading to Restaurant",
      className: "status-stage-assigned",
      icon: <FaMotorcycle />
    };
  }

  // Handle Copy OTP
  const handleCopyOtp = () => {
    if (!currentOtp) return;
    navigator.clipboard.writeText(currentOtp);
    setIsCopied(true);
    if (showToast) showToast("OTP copied to clipboard!", "success");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle Regenerate OTP
  const handleRegenerateOtp = async () => {
    if (isRegenerating || cooldownSeconds > 0 || isDelivered) return;
    try {
      setIsRegenerating(true);
      const res = await orderAPI.regenerateDeliveryOtp(order._id);
      if (res.data?.success && res.data?.otp) {
        setCurrentOtp(res.data.otp);
        if (onOtpUpdated) {
          onOtpUpdated(res.data.otp, {
            ...order,
            deliveryOtp: res.data.otp
          });
        }
        setCooldownSeconds(30);
        if (showToast) showToast("New Delivery OTP generated successfully!", "success");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to regenerate OTP.";
      if (err.response?.status === 429) {
        setCooldownSeconds(30);
      }
      if (showToast) showToast(msg, "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  // If delivered, show verified success banner
  if (isDelivered) {
    const verifiedTime =
      order.delivery?.otpVerifiedAt || order.deliveredAt || order.updatedAt;
    const formattedTime = verifiedTime
      ? new Date(verifiedTime).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit"
        })
      : "Recently";

    return (
      <div className="customer-otp-card delivered animate-fade-in">
        <div className="otp-card-header">
          <div className="otp-title-group">
            <span className="otp-shield-icon verified">
              <FaCheckCircle />
            </span>
            <div>
              <h4 className="otp-heading">Order Handover Verified</h4>
              <p className="otp-subheading">
                Delivery completed at {formattedTime} via secure OTP verification.
              </p>
            </div>
          </div>
          <span className="otp-pill-verified">
            <FaCheck /> Verified & Handed Over
          </span>
        </div>
      </div>
    );
  }

  // Active / in-progress order OTP card
  return (
    <div className={`customer-otp-card active animate-fade-in ${deliveryStatus === "arrived at customer" ? "highlight-pulse" : ""}`}>
      {/* Card Header */}
      <div className="otp-card-header">
        <div className="otp-title-group">
          <span className="otp-shield-icon active">
            <FaShieldAlt />
          </span>
          <div>
            <h4 className="otp-heading">Delivery Verification OTP</h4>
            <p className="otp-subheading">Give this code to your rider only upon food handover</p>
          </div>
        </div>

        <div className={`otp-partner-status-badge ${statusBadge.className}`}>
          {statusBadge.icon}
          <span>{statusBadge.text}</span>
        </div>
      </div>

      {/* OTP Display Body */}
      <div className="otp-card-body">
        <div className="otp-digits-display">
          {currentOtp ? (
            <div className="otp-digit-boxes" title="Your 6-digit delivery verification OTP">
              {String(currentOtp)
                .padStart(6, "0")
                .split("")
                .map((digit, i) => (
                  <span key={i} className="otp-digit-cell">
                    {digit}
                  </span>
                ))}
            </div>
          ) : (
            <div className="otp-pending-state">
              <span className="otp-placeholder">------</span>
              <small>Generating secure code...</small>
            </div>
          )}

          {currentOtp && (
            <button
              type="button"
              className={`btn-copy-otp ${isCopied ? "copied" : ""}`}
              onClick={handleCopyOtp}
              title="Copy OTP to clipboard"
            >
              {isCopied ? <FaCheck /> : <FaCopy />}
              <span>{isCopied ? "Copied" : "Copy"}</span>
            </button>
          )}
        </div>

        {/* Action button: Regenerate OTP */}
        <div className="otp-card-actions">
          <button
            type="button"
            className="btn-regenerate-otp"
            onClick={handleRegenerateOtp}
            disabled={isRegenerating || cooldownSeconds > 0}
            title={
              cooldownSeconds > 0
                ? `Wait ${cooldownSeconds}s before requesting a new OTP`
                : "Generate a new verification code"
            }
          >
            <FaSyncAlt className={isRegenerating ? "spinning" : ""} />
            <span>
              {isRegenerating
                ? "Generating..."
                : cooldownSeconds > 0
                ? `New code in ${cooldownSeconds}s`
                : "Regenerate OTP"}
            </span>
          </button>
        </div>
      </div>

      {/* Security Warning Notice */}
      <div className="otp-security-banner">
        <FaExclamationTriangle className="warning-icon" />
        <p>
          <strong>Security Notice:</strong> Never share this code over phone or before
          receiving and inspecting your order package from the rider.
        </p>
      </div>
    </div>
  );
};

export default CustomerDeliveryOtpCard;
