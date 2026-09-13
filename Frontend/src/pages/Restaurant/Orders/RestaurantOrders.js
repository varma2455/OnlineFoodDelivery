import React, { useState, useEffect, useCallback, useContext } from "react";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./RestaurantOrders.css";
import {
    FaClipboardList,
    FaSyncAlt,
    FaCheck,
    FaTimes,
    FaFire,
    FaMotorcycle,
    FaMapMarkerAlt,
    FaPhoneAlt
} from "react-icons/fa";

const TABS = ["All", "Placed", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

const RestaurantOrders = () => {
    const { showToast } = useContext(StoreContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await restaurantAPI.getOrders({
                status: activeTab === "All" ? undefined : activeTab
            });
            setOrders(data.orders || []);
        } catch (err) {
            console.error("Orders fetch error:", err);
            showToast(err.message || "Failed to load orders", "error");
        } finally {
            setLoading(false);
        }
    }, [activeTab, showToast]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleUpdateStatus = async (orderId, action, label) => {
        try {
            if (action === "accept") await restaurantAPI.acceptOrder(orderId);
            else if (action === "reject") await restaurantAPI.rejectOrder(orderId);
            else if (action === "prepare") await restaurantAPI.prepareOrder(orderId);
            else if (action === "ready") await restaurantAPI.readyOrder(orderId);

            showToast(`Order updated: ${label}! 🍳`, "success");
            fetchOrders();
        } catch (err) {
            showToast(err.message || "Failed to update order status", "error");
        }
    };

    return (
        <div className="ro-container">
            {/* Header */}
            <div className="ro-header">
                <div>
                    <h1 className="ro-title">
                        <FaClipboardList color="#ff5200" /> Kitchen Orders Management
                    </h1>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                        View incoming orders, accept new tickets, and mark food ready for pickup.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchOrders}
                    style={{
                        padding: "9px 16px",
                        borderRadius: "10px",
                        border: "1.5px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#334155",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >
                    <FaSyncAlt /> Refresh Orders
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="ro-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        className={`ro-tab-btn ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Orders Grid / Cards */}
            {loading ? (
                <Loader />
            ) : orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                    <FaClipboardList size={40} color="#cbd5e1" style={{ marginBottom: "12px" }} />
                    <h3 style={{ margin: "0 0 6px", color: "#0f172a" }}>No Orders in "{activeTab}"</h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                        Incoming tickets belonging to your restaurant will show up here.
                    </p>
                </div>
            ) : (
                <div className="ro-cards-grid">
                    {orders.map((order) => {
                        const statusClass = (order.orderStatus || "").toLowerCase().replace(/\s+/g, "-");
                        const orderDate = new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        });

                        return (
                            <div key={order._id} className="ro-card">
                                <div className="ro-card-top">
                                    <div>
                                        <div className="ro-card-order-id">{order.orderNumber}</div>
                                        <div className="ro-card-time">{orderDate} • {new Date(order.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <span className={`rd-order-badge ${statusClass}`}>
                                        {order.orderStatus}
                                    </span>
                                </div>

                                <div className="ro-customer-box">
                                    <div style={{ fontWeight: "700", color: "#0f172a" }}>
                                        {order.user?.fullName}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", marginTop: "4px" }}>
                                        <FaPhoneAlt size={11} /> {order.user?.phone || "No phone provided"}
                                    </div>
                                    {order.deliveryAddress?.city && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", marginTop: "2px", fontSize: "12px" }}>
                                            <FaMapMarkerAlt size={11} /> {order.deliveryAddress.city}
                                        </div>
                                    )}
                                </div>

                                <div className="ro-items-list">
                                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>
                                        Your Kitchen Items ({order.items?.length || 0})
                                    </div>
                                    {order.items?.map((it, idx) => (
                                        <div key={idx} className="ro-item-row">
                                            <span>
                                                <strong>{it.quantity}x</strong> {it.name}
                                            </span>
                                            <strong>₹{it.subtotal || it.price * it.quantity}</strong>
                                        </div>
                                    ))}
                                </div>

                                <div className="ro-card-footer">
                                    <div>
                                        <div style={{ fontSize: "11px", color: "#64748b" }}>YOUR SUBTOTAL</div>
                                        <div className="ro-total-amount">₹{order.restaurantSubtotal}</div>
                                    </div>

                                    <div>
                                        {order.orderStatus === "Placed" && (
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                <button
                                                    type="button"
                                                    className="btn-kitchen-action accept"
                                                    onClick={() => handleUpdateStatus(order._id, "accept", "Confirmed")}
                                                >
                                                    <FaCheck /> Accept
                                                </button>
                                                <button
                                                    type="button"
                                                    style={{
                                                        padding: "6px 12px",
                                                        borderRadius: "8px",
                                                        border: "1px solid #fee2e2",
                                                        background: "#fff5f5",
                                                        color: "#ef4444",
                                                        fontWeight: "700",
                                                        fontSize: "12px",
                                                        cursor: "pointer"
                                                    }}
                                                    onClick={() => handleUpdateStatus(order._id, "reject", "Cancelled")}
                                                >
                                                    <FaTimes /> Reject
                                                </button>
                                            </div>
                                        )}

                                        {order.orderStatus === "Confirmed" && (
                                            <button
                                                type="button"
                                                className="btn-kitchen-action prepare"
                                                onClick={() => handleUpdateStatus(order._id, "prepare", "Preparing")}
                                            >
                                                <FaFire /> Start Cooking
                                            </button>
                                        )}

                                        {order.orderStatus === "Preparing" && (
                                            <button
                                                type="button"
                                                className="btn-kitchen-action ready"
                                                onClick={() => handleUpdateStatus(order._id, "ready", "Ready for Rider")}
                                            >
                                                <FaMotorcycle /> Mark Ready
                                            </button>
                                        )}

                                        {order.orderStatus === "Out for Delivery" && (
                                            <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: "600" }}>
                                                Out with Rider 🛵
                                            </span>
                                        )}

                                        {order.orderStatus === "Delivered" && (
                                            <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "600" }}>
                                                Delivered ✓
                                            </span>
                                        )}

                                        {order.orderStatus === "Cancelled" && (
                                            <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "600" }}>
                                                Order Cancelled ✕
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RestaurantOrders;
