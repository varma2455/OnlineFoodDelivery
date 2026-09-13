import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./ApplicationStatus.css";
import {
    FaStore,
    FaSyncAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaBan,
    FaArrowRight,
    FaEdit,
    FaClock,
    FaSignOutAlt
} from "react-icons/fa";

const ApplicationStatus = () => {
    const navigate = useNavigate();
    const { logout, showToast } = useContext(StoreContext);

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await restaurantAPI.getMyRestaurant();

            if (!data.hasRestaurant || !data.restaurant) {
                showToast("No active restaurant application found. Please register your restaurant.", "info");
                navigate("/restaurant/register");
                return;
            }

            setRestaurant(data.restaurant);
        } catch (err) {
            console.error("Failed to load application status:", err);
            showToast(err.message || "Failed to load application status", "error");
        } finally {
            setLoading(false);
        }
    }, [navigate, showToast]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    if (loading) {
        return (
            <div className="app-status-page">
                <Loader />
            </div>
        );
    }

    if (!restaurant) {
        return null;
    }

    const status = restaurant.status || "pending";
    const appId = `REST-${restaurant._id ? restaurant._id.slice(-6).toUpperCase() : "1001"}`;
    const submittedDate = restaurant.createdAt
        ? new Date(restaurant.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
          })
        : "Recent";

    return (
        <div className="app-status-page">
            <div className="app-status-card">
                {/* Header */}
                <div className="app-status-header">
                    <div>
                        <div className="app-badge-id">
                            Application ID: <code>{appId}</code>
                        </div>
                        <h1 style={{ margin: "6px 0 2px", fontSize: "24px", color: "#0f172a" }}>
                            {restaurant.name}
                        </h1>
                        <div style={{ fontSize: "13px", color: "#64748b" }}>
                            Submitted on {submittedDate} • {restaurant.address?.city || "Hyderabad"}
                        </div>
                    </div>

                    <div className={`app-status-badge ${status}`}>
                        {status === "pending" && "🟡 Under Review"}
                        {status === "approved" && "🟢 Approved"}
                        {status === "rejected" && "🔴 Requires Changes"}
                        {status === "suspended" && "🟠 Suspended"}
                        {status === "closed" && "⚪ Closed"}
                    </div>
                </div>

                {/* Status Notice Alert */}
                {status === "pending" && (
                    <div className="app-notice-box pending">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", marginBottom: "4px" }}>
                            <FaClock /> Application Under Review
                        </div>
                        Your restaurant application is currently being reviewed by the FoodExpress onboarding team. Approvals typically take 1–2 business days. Please check back soon!
                    </div>
                )}

                {status === "approved" && (
                    <div className="app-notice-box approved">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", marginBottom: "4px" }}>
                            <FaCheckCircle /> Congratulations! Your restaurant has been approved 🎉
                        </div>
                        Your restaurant is now verified and active. You can now access your partner dashboard to manage orders, update menu prices, control inventory stock, and track sales.
                    </div>
                )}

                {status === "rejected" && (
                    <div className="app-notice-box rejected">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", marginBottom: "4px" }}>
                            <FaExclamationTriangle /> Application Requires Changes
                        </div>
                        <div>
                            <strong>Admin Feedback:</strong>{" "}
                            {restaurant.rejectionReason || "Please verify your restaurant address, contact number, and menu details."}
                        </div>
                        <div style={{ marginTop: "8px", fontSize: "13px" }}>
                            Click "Edit Application" below to update your information and resubmit for review.
                        </div>
                    </div>
                )}

                {status === "suspended" && (
                    <div className="app-notice-box suspended">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", marginBottom: "4px" }}>
                            <FaBan /> Restaurant Account Suspended
                        </div>
                        <div>
                            <strong>Reason:</strong>{" "}
                            {restaurant.suspensionReason || "Suspended by administrator due to policy compliance."}
                        </div>
                        <div style={{ marginTop: "8px", fontSize: "13px" }}>
                            Please contact FoodExpress Partner Support at <strong>partners@foodexpress.com</strong> for assistance.
                        </div>
                    </div>
                )}

                {/* Visual Stepper Timeline */}
                <h3 style={{ margin: "24px 0 12px", fontSize: "16px", color: "#0f172a" }}>Application Progress</h3>
                <div className="app-timeline">
                    <div className="app-timeline-item completed">
                        <div className="app-timeline-dot">✓</div>
                        <div className="app-timeline-title">Account Created</div>
                    </div>
                    <div className="app-timeline-item completed">
                        <div className="app-timeline-dot">✓</div>
                        <div className="app-timeline-title">Restaurant Information Provided</div>
                    </div>
                    <div className="app-timeline-item completed">
                        <div className="app-timeline-dot">✓</div>
                        <div className="app-timeline-title">Pickup Location Added</div>
                    </div>
                    <div className="app-timeline-item completed">
                        <div className="app-timeline-dot">✓</div>
                        <div className="app-timeline-title">Business & Timings Verified</div>
                    </div>
                    <div className="app-timeline-item completed">
                        <div className="app-timeline-dot">✓</div>
                        <div className="app-timeline-title">Initial Menu Configured</div>
                    </div>

                    {/* Admin Review Step */}
                    <div
                        className={`app-timeline-item ${
                            status === "approved"
                                ? "completed"
                                : status === "rejected" || status === "suspended"
                                ? "completed"
                                : "current"
                        }`}
                    >
                        <div className="app-timeline-dot">
                            {status === "approved" ? "✓" : status === "rejected" ? "!" : "●"}
                        </div>
                        <div className="app-timeline-title">
                            Admin Operations Review{" "}
                            {status === "pending" && <span style={{ color: "#eab308", fontSize: "12px" }}>(In Progress)</span>}
                        </div>
                    </div>

                    {/* Final Approved Step */}
                    <div className={`app-timeline-item ${status === "approved" ? "completed current" : ""}`}>
                        <div className="app-timeline-dot">{status === "approved" ? "✓" : "○"}</div>
                        <div className="app-timeline-title">Restaurant Approved & Live on FoodExpress</div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="app-actions-footer">
                    <button
                        type="button"
                        onClick={fetchStatus}
                        style={{
                            padding: "10px 18px",
                            borderRadius: "10px",
                            border: "1.5px solid #cbd5e1",
                            background: "#ffffff",
                            color: "#334155",
                            fontWeight: "600",
                            fontSize: "14px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px"
                        }}
                    >
                        <FaSyncAlt /> Refresh Status
                    </button>

                    <div style={{ display: "flex", gap: "10px" }}>
                        {status === "approved" && (
                            <Link
                                to="/restaurant/dashboard"
                                style={{
                                    padding: "10px 22px",
                                    borderRadius: "10px",
                                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                    color: "#ffffff",
                                    fontWeight: "700",
                                    fontSize: "14px",
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
                                }}
                            >
                                Open Restaurant Dashboard <FaArrowRight />
                            </Link>
                        )}

                        {status === "rejected" && (
                            <Link
                                to="/restaurant/register"
                                style={{
                                    padding: "10px 22px",
                                    borderRadius: "10px",
                                    background: "linear-gradient(135deg, #ff5200 0%, #ea580c 100%)",
                                    color: "#ffffff",
                                    fontWeight: "700",
                                    fontSize: "14px",
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px"
                                }}
                            >
                                <FaEdit /> Edit Application
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                logout();
                                navigate("/restaurant/login");
                            }}
                            style={{
                                padding: "10px 16px",
                                borderRadius: "10px",
                                border: "1.5px solid #ef4444",
                                background: "#fff",
                                color: "#ef4444",
                                fontWeight: "600",
                                fontSize: "14px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px"
                            }}
                        >
                            <FaSignOutAlt /> Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationStatus;
