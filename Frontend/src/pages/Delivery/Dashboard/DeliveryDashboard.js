import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
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
    FaSyncAlt,
    FaCheck,
    FaEye
} from "react-icons/fa";

const DeliveryDashboard = () => {
    const { user, showToast } = useContext(StoreContext);
    const navigate = useNavigate();
    const outletContext = useOutletContext() || {};
    const { partner, availability } = outletContext;

    const [stats, setStats] = useState({
        todayDeliveries: 0,
        completedDeliveries: 0,
        assignedDeliveries: 0,
        activeDeliveries: 0,
        pendingDeliveries: 0,
        todayEarnings: 0,
        totalEarnings: 0,
        walletBalance: 0,
        rating: 5.0,
        availabilityStatus: "offline"
    });
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [activeDelivery, setActiveDelivery] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [acceptingId, setAcceptingId] = useState(null);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const fetchDashboard = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const { data } = await deliveryPartnerAPI.getDashboard();
            if (data.stats) {
                setStats(data.stats);
            }
            setActiveDelivery(data.activeDelivery || null);
            setAssignedOrders(data.assignedOrders || []);
        } catch (err) {
            console.error("Failed to load dashboard:", err);
            if (!isSilent) {
                showToast(err.message || "Failed to load dashboard statistics", "error");
            }
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchDashboard();
        // Safe auto-refresh polling interval of 15 seconds so new restaurant assignments appear automatically
        const interval = setInterval(() => {
            fetchDashboard(true);
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchDashboard]);

    // Handle accepting an assigned order
    const handleAcceptOrder = async (orderId) => {
        try {
            setAcceptingId(orderId);
            const { data } = await deliveryPartnerAPI.acceptOrder(orderId);
            showToast(data.message || "Order accepted! Navigate to kitchen pickup.", "success");
            await fetchDashboard(true);
        } catch (err) {
            showToast(err.message || "Failed to accept order. It may have been modified.", "error");
            fetchDashboard(true);
        } finally {
            setAcceptingId(null);
        }
    };

    // Handle delivery status transitions
    const handleUpdateDeliveryStatus = async (orderId, newStatus) => {
        try {
            setActionLoading(true);
            const { data } = await deliveryPartnerAPI.updateOrderStatus(orderId, newStatus);
            showToast(data.message || `Delivery status updated to ${newStatus}`, "success");
            await fetchDashboard(true);
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

                <button className="btn-dash-refresh" onClick={() => fetchDashboard(false)}>
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
                    <div className="kpi-icon-wrap orange">
                        <FaClipboardList />
                    </div>
                    <div>
                        <div className="kpi-label">Assigned Deliveries</div>
                        <div className="kpi-value">{stats.assignedDeliveries ?? assignedOrders.length}</div>
                    </div>
                </div>

                <div className="dp-kpi-card">
                    <div className="kpi-icon-wrap blue">
                        <FaMotorcycle />
                    </div>
                    <div>
                        <div className="kpi-label">Active Deliveries</div>
                        <div className="kpi-value">{stats.activeDeliveries ?? (activeDelivery ? 1 : 0)}</div>
                    </div>
                </div>

                <div className="dp-kpi-card">
                    <div className="kpi-icon-wrap green">
                        <FaCheckCircle />
                    </div>
                    <div>
                        <div className="kpi-label">Completed Today</div>
                        <div className="kpi-value">{stats.todayDeliveries ?? 0}</div>
                    </div>
                </div>

                <div className="dp-kpi-card">
                    <div className="kpi-icon-wrap amber">
                        <FaCoins />
                    </div>
                    <div>
                        <div className="kpi-label">Today's Earnings</div>
                        <div className="kpi-value">₹{stats.todayEarnings ?? 0}</div>
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

            {/* =========================================================================
                SECTION 1: MY ASSIGNED ORDERS (Assigned directly by restaurants)
                ========================================================================= */}
            <div className="dp-section-container">
                <div className="dp-section-header">
                    <div>
                        <h2 className="dp-section-title">
                            <FaMotorcycle color="#ff5200" /> My Assigned Deliveries ({assignedOrders.length})
                        </h2>
                        <p className="dp-section-sub">
                            Orders specifically assigned to you by partner restaurants awaiting your acceptance
                        </p>
                    </div>
                    {assignedOrders.length > 0 && (
                        <span className="dp-badge-count-assigned">
                            {assignedOrders.length} New
                        </span>
                    )}
                </div>

                {assignedOrders.length === 0 ? (
                    <div className="dp-no-assigned-card">
                        <div className="dp-no-assigned-icon">🛵</div>
                        <h3>No Deliveries Assigned To You Yet</h3>
                        <p>
                            When a kitchen marks an order Ready for Pickup and assigns you, it will appear here instantly. You can also browse open orders in Available Deliveries.
                        </p>
                        <Link to="/delivery/orders" className="btn-browse-available">
                            <FaBoxOpen /> Check Available Orders
                        </Link>
                    </div>
                ) : (
                    <div className="dp-assigned-cards-grid">
                        {assignedOrders.map((order) => {
                            const restaurant = order.items?.[0]?.restaurantId || {};
                            const customerName = order.deliveryAddress?.fullName || order.user?.fullName || "Customer";
                            const deliveryArea = order.deliveryAddress?.city
                                ? `${order.deliveryAddress?.addressLine1 || ""}, ${order.deliveryAddress?.city}`
                                : (order.deliveryAddress?.addressLine1 || "Customer Address");
                            const earnings = order.deliveryEarnings || 50;
                            const isAccepting = acceptingId === order._id;

                            return (
                                <div key={order._id} className="dp-assigned-order-card">
                                    <div className="assigned-card-top-bar">
                                        <div className="assigned-card-badge">
                                            <FaMotorcycle /> New Delivery
                                        </div>
                                        <span className="assigned-card-id">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </span>
                                        <div className="assigned-card-earnings">
                                            Earn ₹{earnings}
                                        </div>
                                    </div>

                                    <div className="assigned-card-content">
                                        {/* Restaurant Info */}
                                        <div className="assigned-info-block restaurant">
                                            <div className="assigned-block-label">RESTAURANT</div>
                                            <div className="assigned-block-title">
                                                {restaurant.name || "Partner Restaurant"}
                                            </div>
                                            <div className="assigned-block-desc">
                                                <FaMapMarkerAlt size={12} /> {restaurant.address?.street || "Pickup Address"},{" "}
                                                {restaurant.address?.city || "Hyderabad"}
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        <div className="assigned-info-block customer">
                                            <div className="assigned-block-label customer-label">CUSTOMER & DESTINATION</div>
                                            <div className="assigned-block-title">
                                                {customerName}
                                            </div>
                                            <div className="assigned-block-desc">
                                                <FaMapMarkerAlt size={12} /> {deliveryArea}
                                            </div>
                                        </div>

                                        <div className="assigned-status-strip">
                                            <span>Status: <strong style={{ color: "#ea580c" }}>Assigned</strong></span>
                                            <span>• Items: {order.items?.length || 1}</span>
                                            <span>• Total: ₹{order.totalAmount}</span>
                                        </div>
                                    </div>

                                    <div className="assigned-card-action-bar">
                                        <Link to={`/delivery/orders/${order._id}`} className="btn-assigned-view">
                                            <FaEye /> View Order
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn-assigned-accept"
                                            onClick={() => handleAcceptOrder(order._id)}
                                            disabled={isAccepting || actionLoading}
                                        >
                                            {isAccepting ? (
                                                "Accepting..."
                                            ) : (
                                                <>
                                                    <FaCheck /> Accept Delivery
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* =========================================================================
                SECTION 2: ACTIVE DELIVERY CARD (In-progress delivery)
                ========================================================================= */}
            {activeDelivery && (
                <div className="dp-active-order-card">
                    <div className="active-order-header">
                        <div className="order-tag">
                            <span className="live-pulse"></span> ACTIVE ORDER #
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
                            Current Status: <strong>{currentStatus}</strong>
                        </div>

                        <div className="action-buttons-wrap">
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
                                            fetchDashboard(false);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
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
