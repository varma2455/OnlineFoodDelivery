import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { deliveryPartnerAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import DeliveryOtpInput from "../../../components/DeliveryOtpInput/DeliveryOtpInput";
import "./DeliveryDashboard.css";
import {
    FaMotorcycle,
    FaCheckCircle,
    FaClock,
    FaCoins,
    FaStar,
    FaBoxOpen,
    FaClipboardList,
    FaWallet,
    FaUserCircle,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaArrowRight,
    FaSyncAlt
} from "react-icons/fa";

const DeliveryDashboard = () => {
    const { user, showToast } = useContext(StoreContext);
    const outletContext = useOutletContext() || {};
    const { partner, availability } = outletContext;

    const [stats, setStats] = useState({
        todayDeliveries: 0,
        completedDeliveries: 0,
        pendingDeliveries: 0,
        todayEarnings: 0,
        totalEarnings: 0,
        walletBalance: 0,
        rating: 5.0,
        availabilityStatus: "offline"
    });
    const [activeDelivery, setActiveDelivery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await deliveryPartnerAPI.getDashboard();
            if (data.stats) {
                setStats(data.stats);
            }
            setActiveDelivery(data.activeDelivery || null);
        } catch (err) {
            console.error("Failed to load dashboard:", err);
            showToast(err.message || "Failed to load dashboard statistics", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    // Handle delivery status transitions
    const handleUpdateDeliveryStatus = async (orderId, newStatus) => {
        try {
            setActionLoading(true);
            const { data } = await deliveryPartnerAPI.updateOrderStatus(orderId, newStatus);
            showToast(data.message || `Delivery status updated to ${newStatus}`, "success");
            fetchDashboard();
        } catch (err) {
            showToast(err.message || "Failed to update delivery status", "error");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dp-dash-loading">
                <Loader />
            </div>
        );
    }

    const riderName = partner?.name || user?.fullName || "Delivery Partner";
    const currentStatus = activeDelivery?.deliveryStatus || "Accepted";

    return (
        <div className="dp-dashboard-container">
            {/* Greeting Header */}
            <div className="dp-welcome-bar">
                <div>
                    <h1 className="dp-greeting-title">
                        {getGreeting()}, {riderName} 👋
                    </h1>
                    <p className="dp-greeting-sub">
                        Vehicle: <strong>{partner?.vehicleType || "Bike"}</strong> ({partner?.vehicleNumber || "Verified"}) • Zone: <strong>{partner?.city || "Hyderabad"}</strong>
                    </p>
                </div>

                <button className="btn-dash-refresh" onClick={fetchDashboard}>
                    <FaSyncAlt /> Refresh
                </button>
            </div>

            {/* Offline Alert If Offline */}
            {availability === "offline" && (
                <div className="dp-offline-banner">
                    <span className="dot gray">●</span> You are currently <strong>Offline</strong>. Switch to <strong>Online</strong> in the top bar to accept incoming food deliveries.
                </div>
            )}

            {/* KPI Statistics Cards */}
            <div className="dp-kpi-grid">
                <div className="dp-kpi-card">
                    <div className="kpi-icon-wrap blue">
                        <FaMotorcycle />
                    </div>
                    <div>
                        <div className="kpi-label">Today's Deliveries</div>
                        <div className="kpi-value">{stats.todayDeliveries}</div>
                    </div>
                </div>

                <div className="dp-kpi-card">
                    <div className="kpi-icon-wrap green">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <div className="kpi-label">Completed Deliveries</div>
                        <div className="kpi-value">{stats.completedDeliveries}</div>
                    </div>
                </div>

                <div className="dp-kpi-card">
                    <div className="kpi-icon-wrap orange">
                        <FaClock />
                    </div>
                    <div>
                        <div className="kpi-label">Pending Deliveries</div>
                        <div className="kpi-value">{stats.pendingDeliveries}</div>
                    </div>
                </div>

                <div className="dp-kpi-card">
                    <div className="kpi-icon-wrap amber">
                        <FaCoins />
                    </div>
                    <div>
                        <div className="kpi-label">Today's Earnings</div>
                        <div className="kpi-value">₹{stats.todayEarnings}</div>
                    </div>
                </div>

                <div className="dp-kpi-card">
                    <div className="kpi-icon-wrap purple">
                        <FaStar />
                    </div>
                    <div>
                        <div className="kpi-label">Rider Rating</div>
                        <div className="kpi-value">⭐ {stats.rating?.toFixed(1) || "5.0"}</div>
                    </div>
                </div>
            </div>

            {/* Active Delivery Card (If in progress) */}
            {activeDelivery ? (
                <div className="dp-active-order-card">
                    <div className="active-order-header">
                        <div className="order-tag">
                            <span className="live-pulse"></span> {currentStatus === "Assigned" ? "NEW DELIVERY #" : "ACTIVE ORDER #"}
                            {activeDelivery._id.slice(-6).toUpperCase()}
                        </div>
                        <div className="order-earnings-pill">
                            Earnings: ₹{activeDelivery.deliveryEarnings || 50}
                        </div>
                    </div>

                    <div className="active-order-body">
                        {/* Restaurant Pickup Info */}
                        <div className="location-box pickup">
                            <div className="loc-badge">PICKUP FROM RESTAURANT</div>
                            <div className="loc-name">
                                {activeDelivery.items?.[0]?.restaurantId?.name || "Partner Restaurant"}
                            </div>
                            <div className="loc-addr">
                                <FaMapMarkerAlt />{" "}
                                {activeDelivery.items?.[0]?.restaurantId?.address?.street || "Pickup Address"},{" "}
                                {activeDelivery.items?.[0]?.restaurantId?.address?.city || "Hyderabad"}
                            </div>
                            {activeDelivery.items?.[0]?.restaurantId?.phone && (
                                <div className="loc-phone">
                                    <FaPhoneAlt /> Call Kitchen:{" "}
                                    <a href={`tel:${activeDelivery.items[0].restaurantId.phone}`}>
                                        {activeDelivery.items[0].restaurantId.phone}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Customer Drop Info */}
                        <div className="location-box drop">
                            <div className="loc-badge customer">DROP TO CUSTOMER</div>
                            <div className="loc-name">
                                {activeDelivery.deliveryAddress?.fullName || activeDelivery.user?.fullName}
                            </div>
                            <div className="loc-addr">
                                <FaMapMarkerAlt /> {activeDelivery.deliveryAddress?.addressLine1},{" "}
                                {activeDelivery.deliveryAddress?.city} - {activeDelivery.deliveryAddress?.postalCode}
                            </div>
                            {activeDelivery.deliveryAddress?.phone && (
                                <div className="loc-phone">
                                    <FaPhoneAlt /> Call Customer:{" "}
                                    <a href={`tel:${activeDelivery.deliveryAddress.phone}`}>
                                        {activeDelivery.deliveryAddress.phone}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step Action Buttons based on valid transition */}
                    <div className="active-order-actions">
                        <div className="current-status-note">
                            Current Status: <strong>{currentStatus === "Assigned" ? "Assigned (Waiting for Acceptance)" : currentStatus}</strong>
                        </div>

                        <div className="action-buttons-wrap">
                            {currentStatus === "Assigned" && (
                                <button
                                    className="btn-step-action"
                                    style={{ background: "#10b981", color: "#ffffff", borderColor: "#059669" }}
                                    onClick={() => handleUpdateDeliveryStatus(activeDelivery._id, "Accepted")}
                                    disabled={actionLoading}
                                >
                                    <FaCheckCircle /> Accept Delivery Order
                                </button>
                            )}

                            {currentStatus === "Accepted" && (
                                <button
                                    className="btn-step-action"
                                    onClick={() => handleUpdateDeliveryStatus(activeDelivery._id, "Going to Restaurant")}
                                    disabled={actionLoading}
                                >
                                    Going to Restaurant <FaArrowRight />
                                </button>
                            )}

                            {currentStatus === "Going to Restaurant" && (
                                <button
                                    className="btn-step-action"
                                    onClick={() => handleUpdateDeliveryStatus(activeDelivery._id, "Arrived at Restaurant")}
                                    disabled={actionLoading}
                                >
                                    Arrived at Restaurant <FaArrowRight />
                                </button>
                            )}

                            {currentStatus === "Arrived at Restaurant" && (
                                <button
                                    className="btn-step-action"
                                    onClick={() => handleUpdateDeliveryStatus(activeDelivery._id, "Order Picked Up")}
                                    disabled={actionLoading}
                                >
                                    Confirm Order Picked Up <FaArrowRight />
                                </button>
                            )}

                            {currentStatus === "Order Picked Up" && (
                                <button
                                    className="btn-step-action"
                                    onClick={() => handleUpdateDeliveryStatus(activeDelivery._id, "Going to Customer")}
                                    disabled={actionLoading}
                                >
                                    Going to Customer <FaArrowRight />
                                </button>
                            )}

                            {currentStatus === "Going to Customer" && (
                                <button
                                    className="btn-step-action"
                                    onClick={() => handleUpdateDeliveryStatus(activeDelivery._id, "Arrived at Customer")}
                                    disabled={actionLoading}
                                >
                                    Arrived at Customer Location <FaArrowRight />
                                </button>
                            )}

                            {currentStatus === "Arrived at Customer" && (
                                <div style={{ width: "100%", marginTop: "12px" }}>
                                    <DeliveryOtpInput
                                        orderId={activeDelivery._id}
                                        orderNumber={`#FE${activeDelivery._id.slice(-6).toUpperCase()}`}
                                        customerName={activeDelivery.deliveryAddress?.fullName || activeDelivery.user?.fullName || "Customer"}
                                        onSuccess={(data) => {
                                            showToast(data.message || "Delivery verified successfully! 🎉", "success");
                                            fetchDashboard();
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="dp-no-active-order">
                    <div className="idle-icon">🛵</div>
                    <h3>No Active Delivery Right Now</h3>
                    <p>You are ready for assignments! Check the available orders feed to accept your next delivery.</p>
                    <Link to="/delivery/orders" className="btn-find-orders">
                        <FaBoxOpen /> View Available Orders
                    </Link>
                </div>
            )}

            {/* Quick Navigation Cards */}
            <div className="dp-quick-grid">
                <Link to="/delivery/orders" className="quick-card">
                    <div className="qc-icon"><FaBoxOpen color="#2563eb" /></div>
                    <div className="qc-info">
                        <h4>Available Orders</h4>
                        <p>Browse nearby kitchen pickup orders</p>
                    </div>
                </Link>

                <Link to="/delivery/my-deliveries" className="quick-card">
                    <div className="qc-icon"><FaClipboardList color="#10b981" /></div>
                    <div className="qc-info">
                        <h4>My Deliveries</h4>
                        <p>Track history and completed trips</p>
                    </div>
                </Link>

                <Link to="/delivery/earnings" className="quick-card">
                    <div className="qc-icon"><FaCoins color="#f59e0b" /></div>
                    <div className="qc-info">
                        <h4>Earnings</h4>
                        <p>Review daily, weekly, and monthly payouts</p>
                    </div>
                </Link>

                <Link to="/delivery/wallet" className="quick-card">
                    <div className="qc-icon"><FaWallet color="#8b5cf6" /></div>
                    <div className="qc-info">
                        <h4>Wallet</h4>
                        <p>Balance: ₹{stats.walletBalance}</p>
                    </div>
                </Link>

                <Link to="/delivery/profile" className="quick-card">
                    <div className="qc-icon"><FaUserCircle color="#64748b" /></div>
                    <div className="qc-info">
                        <h4>Profile & Vehicle</h4>
                        <p>Vehicle, documents, and zone info</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
