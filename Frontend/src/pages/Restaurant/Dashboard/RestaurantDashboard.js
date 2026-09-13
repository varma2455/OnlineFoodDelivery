import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantAPI, getFoodImageUrl } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./RestaurantDashboard.css";
import {
    FaStore,
    FaClipboardList,
    FaUtensils,
    FaBoxes,
    FaUserCircle,
    FaStar,
    FaExclamationTriangle,
    FaCheckCircle,
    FaClock,
    FaMotorcycle,
    FaSyncAlt
} from "react-icons/fa";

const RestaurantDashboard = () => {
    const { user, showToast } = useContext(StoreContext);
    const { restaurant } = useOutletContext() || {};

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await restaurantAPI.getDashboard();
            setDashboardData(data);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            showToast(err.message || "Failed to load restaurant dashboard data", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    // Handle Quick Kitchen Actions
    const handleAction = async (orderId, action, label) => {
        try {
            if (action === "accept") await restaurantAPI.acceptOrder(orderId);
            else if (action === "prepare") await restaurantAPI.prepareOrder(orderId);
            else if (action === "ready") await restaurantAPI.readyOrder(orderId);

            showToast(`Order updated: ${label}! 🍳`, "success");
            loadDashboard();
        } catch (err) {
            showToast(err.message || "Failed to update order status", "error");
        }
    };

    if (loading && !dashboardData) {
        return <Loader />;
    }

    const stats = dashboardData?.stats || {
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        readyOrders: 0,
        deliveredOrders: 0
    };

    const recentOrders = dashboardData?.recentOrders || [];
    const topFoods = dashboardData?.topFoods || [];
    const lowStockFoods = dashboardData?.lowStockFoods || [];
    const restName = restaurant?.name || dashboardData?.restaurant?.name || "Your Restaurant";

    return (
        <div className="rd-container">
            {/* Welcome Banner */}
            <div className="rd-welcome-banner">
                <div>
                    <h1 className="rd-welcome-title">Welcome, {restName}! 🍳</h1>
                    <p className="rd-welcome-sub">
                        Kitchen operations live summary for today. Keep food prep running smoothly!
                    </p>
                </div>

                <div className="rd-quick-actions-bar">
                    <Link to="/restaurant/orders" className="btn-rd-action">
                        <FaClipboardList /> Orders
                    </Link>
                    <Link to="/restaurant/menu" className="btn-rd-action">
                        <FaUtensils /> Manage Menu
                    </Link>
                    <Link to="/restaurant/inventory" className="btn-rd-action">
                        <FaBoxes /> Inventory
                    </Link>
                    <button
                        type="button"
                        onClick={loadDashboard}
                        className="btn-rd-action"
                        style={{ cursor: "pointer", background: "rgba(0,0,0,0.15)" }}
                    >
                        <FaSyncAlt /> Refresh
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="rd-metrics-grid">
                <div className="rd-metric-card orange">
                    <span className="rd-metric-label">TODAY'S ORDERS</span>
                    <span className="rd-metric-value">{stats.todayOrders}</span>
                </div>

                <div className="rd-metric-card yellow">
                    <span className="rd-metric-label">PENDING / CONFIRMED</span>
                    <span className="rd-metric-value">{stats.pendingOrders}</span>
                </div>

                <div className="rd-metric-card orange">
                    <span className="rd-metric-label">IN PREPARATION</span>
                    <span className="rd-metric-value">{stats.preparingOrders}</span>
                </div>

                <div className="rd-metric-card blue">
                    <span className="rd-metric-label">READY FOR PICKUP</span>
                    <span className="rd-metric-value">{stats.readyOrders}</span>
                </div>

                <div className="rd-metric-card green">
                    <span className="rd-metric-label">DELIVERED ORDERS</span>
                    <span className="rd-metric-value">{stats.deliveredOrders}</span>
                </div>

                <div className="rd-metric-card purple">
                    <span className="rd-metric-label">TODAY'S REVENUE</span>
                    <span className="rd-metric-value">₹{stats.todayRevenue}</span>
                </div>
            </div>

            {/* 2-Column Main Section */}
            <div className="rd-main-grid">
                {/* Left: Active Kitchen Orders Queue */}
                <div className="rd-section-card">
                    <div className="rd-section-header">
                        <h3 className="rd-section-title">
                            <FaClipboardList color="#ff5200" /> Recent Kitchen Orders
                        </h3>
                        <Link to="/restaurant/orders" className="rd-see-all-link">
                            View All Orders →
                        </Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                            <FaClipboardList size={36} color="#cbd5e1" style={{ marginBottom: "10px" }} />
                            <p style={{ margin: 0 }}>No recent orders for your restaurant yet.</p>
                        </div>
                    ) : (
                        <div className="rd-table-responsive">
                            <table className="rd-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Your Items</th>
                                        <th>Subtotal</th>
                                        <th>Status</th>
                                        <th>Kitchen Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => {
                                        const statusClass = (order.orderStatus || "")
                                            .toLowerCase()
                                            .replace(/\s+/g, "-");
                                        return (
                                            <tr key={order._id}>
                                                <td>
                                                    <code style={{ fontWeight: "700", color: "#0f172a" }}>
                                                        {order.orderNumber}
                                                    </code>
                                                </td>
                                                <td>
                                                    <strong>{order.customerName}</strong>
                                                    <div style={{ fontSize: "11px", color: "#64748b" }}>
                                                        {order.customerPhone}
                                                    </div>
                                                </td>
                                                <td>
                                                    {order.items?.map((it, idx) => (
                                                        <div key={idx} style={{ fontSize: "12px" }}>
                                                            • {it.quantity}x {it.name}
                                                        </div>
                                                    ))}
                                                </td>
                                                <td>
                                                    <strong>₹{order.restaurantTotal}</strong>
                                                </td>
                                                <td>
                                                    <span className={`rd-order-badge ${statusClass}`}>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    {order.orderStatus === "Placed" && (
                                                        <button
                                                            type="button"
                                                            className="btn-kitchen-action accept"
                                                            onClick={() => handleAction(order._id, "accept", "Order Confirmed")}
                                                        >
                                                            Accept & Confirm
                                                        </button>
                                                    )}

                                                    {order.orderStatus === "Confirmed" && (
                                                        <button
                                                            type="button"
                                                            className="btn-kitchen-action prepare"
                                                            onClick={() => handleAction(order._id, "prepare", "Cooking Started")}
                                                        >
                                                            Start Cooking 🍳
                                                        </button>
                                                    )}

                                                    {order.orderStatus === "Preparing" && (
                                                        <button
                                                            type="button"
                                                            className="btn-kitchen-action ready"
                                                            onClick={() => handleAction(order._id, "ready", "Ready for Rider")}
                                                        >
                                                            Mark Ready 🚀
                                                        </button>
                                                    )}

                                                    {["Out for Delivery", "Delivered", "Cancelled"].includes(order.orderStatus) && (
                                                        <span style={{ fontSize: "12px", color: "#64748b" }}>
                                                            Kitchen Done ✓
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right Column: Rating + Top Foods + Low Stock */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    {/* Restaurant Rating Card */}
                    <div className="rd-section-card" style={{ background: "linear-gradient(135deg, #fff7ed, #ffffff)" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <span style={{ fontSize: "12px", fontWeight: "700", color: "#ea580c" }}>CUSTOMER RATING</span>
                                <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                    <FaStar color="#f59e0b" size={24} /> {restaurant?.rating || "5.0"}
                                </div>
                                <div style={{ fontSize: "12px", color: "#64748b" }}>
                                    Based on {restaurant?.totalReviews || 0} reviews
                                </div>
                            </div>
                            <Link to="/restaurant/reviews" style={{ fontSize: "13px", color: "#ff5200", fontWeight: "700", textDecoration: "none" }}>
                                View Reviews →
                            </Link>
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="rd-section-card">
                        <div className="rd-section-header" style={{ marginBottom: "12px" }}>
                            <h3 className="rd-section-title" style={{ fontSize: "15px" }}>
                                <FaExclamationTriangle color="#f59e0b" /> Low Stock Alerts
                            </h3>
                            <Link to="/restaurant/inventory" className="rd-see-all-link">
                                Inventory →
                            </Link>
                        </div>

                        {lowStockFoods.length === 0 ? (
                            <p style={{ fontSize: "13px", color: "#10b981", margin: 0 }}>
                                ✓ All dishes are well stocked!
                            </p>
                        ) : (
                            <div>
                                {lowStockFoods.slice(0, 4).map((food) => (
                                    <div key={food._id} className="rd-dish-mini-row">
                                        <img
                                            src={getFoodImageUrl(food.image)}
                                            alt={food.name}
                                            className="rd-dish-mini-img"
                                        />
                                        <div className="rd-dish-mini-info">
                                            <div className="rd-dish-mini-name">{food.name}</div>
                                            <div className="rd-dish-mini-meta">₹{food.price}</div>
                                        </div>
                                        <span className={`rd-stock-tag ${food.stock === 0 ? "out" : "low"}`}>
                                            {food.stock === 0 ? "Out of Stock" : `${food.stock} left`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Selling Dishes */}
                    <div className="rd-section-card">
                        <div className="rd-section-header" style={{ marginBottom: "12px" }}>
                            <h3 className="rd-section-title" style={{ fontSize: "15px" }}>
                                <FaStar color="#ff5200" /> Popular on Your Menu
                            </h3>
                            <Link to="/restaurant/menu" className="rd-see-all-link">
                                Menu →
                            </Link>
                        </div>

                        {topFoods.length === 0 ? (
                            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                                Dishes will appear here as orders roll in.
                            </p>
                        ) : (
                            <div>
                                {topFoods.slice(0, 4).map((food) => (
                                    <div key={food._id} className="rd-dish-mini-row">
                                        <img
                                            src={getFoodImageUrl(food.image)}
                                            alt={food.name}
                                            className="rd-dish-mini-img"
                                        />
                                        <div className="rd-dish-mini-info">
                                            <div className="rd-dish-mini-name">{food.name}</div>
                                            <div className="rd-dish-mini-meta">
                                                {food.category} • ₹{food.price}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: "12px", color: "#f59e0b", fontWeight: "700" }}>
                                            ★ {food.rating || "5.0"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDashboard;
