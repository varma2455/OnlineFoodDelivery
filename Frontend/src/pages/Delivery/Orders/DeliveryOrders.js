import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { deliveryPartnerAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./DeliveryOrders.css";
import {
    FaBoxOpen,
    FaMapMarkerAlt,
    FaUtensils,
    FaMoneyBillWave,
    FaClock,
    FaSyncAlt,
    FaExclamationTriangle,
    FaCheck,
    FaMotorcycle,
    FaClipboardList,
    FaEye
} from "react-icons/fa";

const DeliveryOrders = () => {
    const { showToast } = useContext(StoreContext);
    const navigate = useNavigate();
    const outletContext = useOutletContext() || {};
    const { availability } = outletContext;

    const [assignedOrders, setAssignedOrders] = useState([]);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("assigned"); // "assigned" or "available"
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState(null);

    const fetchOrdersFeed = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const { data } = await deliveryPartnerAPI.getAvailableOrders();
            setAssignedOrders(data.assignedOrders || []);
            setAvailableOrders(data.availableOrders || []);
        } catch (err) {
            console.error("Error loading delivery orders:", err);
            if (!isSilent) {
                showToast(err.message || "Failed to fetch orders feed", "error");
            }
        } finally {
            if (!isSilent) setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchOrdersFeed();
        // Auto-refresh polling every 15 seconds
        const interval = setInterval(() => {
            fetchOrdersFeed(true);
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchOrdersFeed]);

    const handleAcceptOrder = async (orderId) => {
        try {
            setAcceptingId(orderId);
            const { data } = await deliveryPartnerAPI.acceptOrder(orderId);
            showToast(data.message || "Order accepted! Navigate to pickup location.", "success");
            navigate("/delivery/dashboard");
        } catch (err) {
            showToast(err.message || "Could not accept order. It may have expired or been reassigned.", "error");
            fetchOrdersFeed(true);
        } finally {
            setAcceptingId(null);
        }
    };

    const renderOrderCard = (order, isAssigned) => {
        const restaurant = order.items?.[0]?.restaurantId || {};
        const earnings = order.deliveryEarnings || 50;
        const itemCount = order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1;
        const isAccepting = acceptingId === order._id;
        const customerName = order.deliveryAddress?.fullName || order.user?.fullName || "Customer";
        const customerAddress = order.deliveryAddress?.city
            ? `${order.deliveryAddress?.addressLine1 || ""}, ${order.deliveryAddress?.city}`
            : (order.deliveryAddress?.addressLine1 || "Customer Address");

        return (
            <div key={order._id} className={`dp-order-card ${isAssigned ? "is-assigned-border" : ""}`}>
                <div className="order-card-header">
                    <div className="order-num-pill">
                        {isAssigned ? (
                            <span style={{ color: "#ff5200", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <FaMotorcycle /> #{order._id.slice(-6).toUpperCase()}
                            </span>
                        ) : (
                            `#${order._id.slice(-6).toUpperCase()}`
                        )}
                    </div>
                    <div className="order-earn-badge">
                        <FaMoneyBillWave /> Earn ₹{earnings}
                    </div>
                </div>

                <div className="order-card-content">
                    {isAssigned && (
                        <div className="assigned-direct-tag">
                            ⭐ Assigned to you by {restaurant.name || "Kitchen"}
                        </div>
                    )}

                    {/* Pickup Info */}
                    <div className="order-step-info pickup">
                        <div className="step-icon"><FaUtensils /></div>
                        <div className="step-details">
                            <div className="step-tag">RESTAURANT PICKUP</div>
                            <div className="step-title">{restaurant.name || "FoodExpress Kitchen"}</div>
                            <div className="step-desc">
                                {restaurant.address?.street || "Pickup Address"}, {restaurant.address?.city || "Hyderabad"}
                            </div>
                        </div>
                    </div>

                    {/* Drop Info */}
                    <div className="order-step-info drop">
                        <div className="step-icon"><FaMapMarkerAlt /></div>
                        <div className="step-details">
                            <div className="step-tag customer">CUSTOMER DROP</div>
                            <div className="step-title">{customerName}</div>
                            <div className="step-desc">
                                {customerAddress}
                            </div>
                        </div>
                    </div>

                    {/* Order Meta */}
                    <div className="order-card-meta">
                        <span>
                            <FaBoxOpen /> {itemCount} {itemCount === 1 ? "Item" : "Items"}
                        </span>
                        <span>
                            <FaClock /> Ordered {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span>
                            ₹{order.totalAmount} Total
                        </span>
                    </div>
                </div>

                <div className="order-card-actions">
                    <button
                        type="button"
                        className="btn-accept-order"
                        onClick={() => handleAcceptOrder(order._id)}
                        disabled={isAccepting}
                    >
                        {isAccepting ? (
                            "Accepting Task..."
                        ) : (
                            <>
                                <FaCheck /> {isAssigned ? "Accept Assigned Task" : "Claim Delivery Task"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    };

    const displayedOrders = activeTab === "assigned" ? assignedOrders : availableOrders;

    return (
        <div className="dp-orders-page">
            <div className="dp-orders-header">
                <div>
                    <h2>Deliveries Feed</h2>
                    <p>Manage your restaurant assignments and browse nearby claimable orders</p>
                </div>
                <button
                    className="btn-refresh-orders"
                    onClick={() => fetchOrdersFeed(false)}
                    disabled={loading}
                >
                    <FaSyncAlt className={loading ? "spin" : ""} /> Refresh Feed
                </button>
            </div>

            {availability === "offline" && (
                <div className="dp-orders-alert-offline">
                    <FaExclamationTriangle />
                    <div>
                        <strong>You are currently Offline.</strong> Switch to <strong>Online</strong> in the top header so restaurants can assign delivery tasks to you.
                    </div>
                </div>
            )}

            {/* Sub-tabs: My Assigned Orders vs Available Orders */}
            <div className="dp-feed-tabs">
                <button
                    type="button"
                    className={`dp-feed-tab-btn ${activeTab === "assigned" ? "active" : ""}`}
                    onClick={() => setActiveTab("assigned")}
                >
                    <FaClipboardList /> My Assigned Orders ({assignedOrders.length})
                </button>

                <button
                    type="button"
                    className={`dp-feed-tab-btn ${activeTab === "available" ? "active" : ""}`}
                    onClick={() => setActiveTab("available")}
                >
                    <FaBoxOpen /> Available Orders ({availableOrders.length})
                </button>
            </div>

            {loading && displayedOrders.length === 0 ? (
                <div className="dp-orders-loader">
                    <Loader />
                </div>
            ) : displayedOrders.length === 0 ? (
                <div className="dp-no-orders-box">
                    <div className="empty-icon"><FaBoxOpen /></div>
                    <h3>
                        {activeTab === "assigned"
                            ? "No Deliveries Assigned to You Right Now"
                            : "No Unassigned Orders Nearby"}
                    </h3>
                    <p>
                        {activeTab === "assigned"
                            ? "When restaurants confirm order preparation and assign you as their rider, tickets will show up here immediately."
                            : "All current orders are assigned to riders. When new open orders become available for claiming, they will appear here."}
                    </p>
                    <button className="btn-empty-refresh" onClick={() => fetchOrdersFeed(false)}>
                        <FaSyncAlt /> Check Again
                    </button>
                </div>
            ) : (
                <div className="dp-orders-grid">
                    {displayedOrders.map((order) => renderOrderCard(order, activeTab === "assigned"))}
                </div>
            )}
        </div>
    );
};

export default DeliveryOrders;
