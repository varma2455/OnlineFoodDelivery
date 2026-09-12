import React, { useEffect, useState, useContext, useCallback } from "react";
import { StoreContext } from "../../context/StoreContext";
import { restaurantAPI, getFoodImageUrl } from "../../services/api";
import Loader from "../../components/Loader/Loader";
import {
    FaUtensils,
    FaClipboardList,
    FaCheckCircle,
    FaClock,
    FaMotorcycle,
    FaSignOutAlt,
    FaSyncAlt,
    FaStore
} from "react-icons/fa";
import { Link } from "react-router-dom";

const RestaurantDashboard = () => {
    const { user, logout, showToast } = useContext(StoreContext);

    const [orders, setOrders] = useState([]);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("orders"); // "orders" | "menu"

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [ordersRes, foodsRes] = await Promise.all([
                restaurantAPI.getOrders(),
                restaurantAPI.getFoods()
            ]);
            setOrders(ordersRes.data.orders || []);
            setFoods(foodsRes.data.foods || []);
        } catch (error) {
            console.error("Failed to load restaurant data:", error);
            showToast(error.message || "Failed to load restaurant dashboard data", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await restaurantAPI.updateOrderStatus(orderId, newStatus);
            showToast(`Order status updated to "${newStatus}"! 🍳`, "success");
            setOrders((prev) =>
                prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
            );
        } catch (error) {
            showToast(error.message || "Failed to update order status", "error");
        }
    };

    const handleToggleFood = async (foodId) => {
        try {
            const { data } = await restaurantAPI.toggleAvailability(foodId);
            showToast(data.message || "Dish status updated!", "success");
            setFoods((prev) =>
                prev.map((f) => (f._id === foodId ? { ...f, isAvailable: !f.isAvailable } : f))
            );
        } catch (error) {
            showToast(error.message || "Failed to toggle dish availability", "error");
        }
    };

    const preparingOrders = orders.filter((o) => o.orderStatus === "Preparing");
    const readyOrders = orders.filter((o) => o.orderStatus === "Out for Delivery");

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "24px 32px", fontFamily: "inherit" }}>
            {/* TOP HEADER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#fff",
                    padding: "20px 28px",
                    borderRadius: "16px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    marginBottom: "24px"
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "#fff7ed",
                            color: "#ea580c",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px"
                        }}
                    >
                        <FaStore />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "22px", color: "#0f172a" }}>Restaurant Kitchen Portal</h1>
                        <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "14px" }}>
                            Logged in as: <strong>{user?.fullName || "Restaurant Manager"}</strong> ({user?.email})
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                        onClick={fetchData}
                        style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            background: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: "500"
                        }}
                    >
                        <FaSyncAlt /> Refresh
                    </button>

                    <Link
                        to="/"
                        style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            background: "#f1f5f9",
                            color: "#334155",
                            textDecoration: "none",
                            fontWeight: "500"
                        }}
                    >
                        View Store
                    </Link>

                    <button
                        onClick={logout}
                        style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#ef4444",
                            color: "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: "600"
                        }}
                    >
                        <FaSignOutAlt /> Sign Out
                    </button>
                </div>
            </div>

            {/* METRICS ROW */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                <div style={{ background: "#fff", padding: "20px", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                    <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>TOTAL ORDERS</div>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a" }}>{orders.length}</div>
                </div>

                <div style={{ background: "#fff", padding: "20px", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                    <div style={{ color: "#eab308", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>IN PREPARATION</div>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#ca8a04" }}>{preparingOrders.length}</div>
                </div>

                <div style={{ background: "#fff", padding: "20px", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                    <div style={{ color: "#3b82f6", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>READY FOR PICKUP</div>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#2563eb" }}>{readyOrders.length}</div>
                </div>

                <div style={{ background: "#fff", padding: "20px", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                    <div style={{ color: "#10b981", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>DISHES ON MENU</div>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#059669" }}>{foods.length}</div>
                </div>
            </div>

            {/* TAB SELECTOR */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: activeTab === "orders" ? "#ea580c" : "#e2e8f0",
                        color: activeTab === "orders" ? "#fff" : "#475569"
                    }}
                >
                    <FaClipboardList /> Kitchen Orders ({orders.length})
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("menu")}
                    style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: activeTab === "menu" ? "#ea580c" : "#e2e8f0",
                        color: activeTab === "menu" ? "#fff" : "#475569"
                    }}
                >
                    <FaUtensils /> Menu Items Availability ({foods.length})
                </button>
            </div>

            {/* TAB CONTENT */}
            {loading ? (
                <Loader />
            ) : activeTab === "orders" ? (
                <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <h2 style={{ fontSize: "18px", margin: "0 0 16px", color: "#0f172a" }}>Active Orders Queue</h2>

                    {orders.length === 0 ? (
                        <p style={{ color: "#64748b" }}>No restaurant orders at the moment.</p>
                    ) : (
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid #f1f5f9", color: "#64748b", fontSize: "13px" }}>
                                        <th style={{ padding: "12px" }}>Order ID</th>
                                        <th style={{ padding: "12px" }}>Customer</th>
                                        <th style={{ padding: "12px" }}>Items Ordered</th>
                                        <th style={{ padding: "12px" }}>Total</th>
                                        <th style={{ padding: "12px" }}>Current Status</th>
                                        <th style={{ padding: "12px" }}>Kitchen Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o._id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "14px" }}>
                                            <td style={{ padding: "12px" }}>
                                                <code>#{o._id.substring(o._id.length - 6).toUpperCase()}</code>
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                <strong>{o.user?.fullName || "Guest Customer"}</strong>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>{o.user?.phone}</div>
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                {o.items?.map((item, idx) => (
                                                    <div key={idx} style={{ fontSize: "13px" }}>
                                                        • {item.quantity}x {item.name || item.food?.name}
                                                    </div>
                                                ))}
                                            </td>
                                            <td style={{ padding: "12px", fontWeight: "600", color: "#0f172a" }}>
                                                ₹{o.finalAmount || o.totalAmount}
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                <span
                                                    style={{
                                                        padding: "4px 10px",
                                                        borderRadius: "12px",
                                                        fontSize: "12px",
                                                        fontWeight: "600",
                                                        background:
                                                            o.orderStatus === "Delivered"
                                                                ? "#dcfce7"
                                                                : o.orderStatus === "Preparing"
                                                                ? "#fef9c3"
                                                                : o.orderStatus === "Out for Delivery"
                                                                ? "#dbeafe"
                                                                : "#f1f5f9",
                                                        color:
                                                            o.orderStatus === "Delivered"
                                                                ? "#166534"
                                                                : o.orderStatus === "Preparing"
                                                                ? "#854d0e"
                                                                : o.orderStatus === "Out for Delivery"
                                                                ? "#1e40af"
                                                                : "#475569"
                                                    }}
                                                >
                                                    {o.orderStatus}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px" }}>
                                                {o.orderStatus === "Placed" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(o._id, "Confirmed")}
                                                        style={{
                                                            padding: "6px 12px",
                                                            borderRadius: "6px",
                                                            border: "none",
                                                            background: "#2563eb",
                                                            color: "#fff",
                                                            cursor: "pointer",
                                                            fontWeight: "600"
                                                        }}
                                                    >
                                                        Accept & Confirm
                                                    </button>
                                                )}

                                                {o.orderStatus === "Confirmed" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(o._id, "Preparing")}
                                                        style={{
                                                            padding: "6px 12px",
                                                            borderRadius: "6px",
                                                            border: "none",
                                                            background: "#ca8a04",
                                                            color: "#fff",
                                                            cursor: "pointer",
                                                            fontWeight: "600"
                                                        }}
                                                    >
                                                        Start Preparing 🍳
                                                    </button>
                                                )}

                                                {o.orderStatus === "Preparing" && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(o._id, "Out for Delivery")}
                                                        style={{
                                                            padding: "6px 12px",
                                                            borderRadius: "6px",
                                                            border: "none",
                                                            background: "#059669",
                                                            color: "#fff",
                                                            cursor: "pointer",
                                                            fontWeight: "600"
                                                        }}
                                                    >
                                                        Ready for Delivery 🚀
                                                    </button>
                                                )}

                                                {["Out for Delivery", "Delivered", "Cancelled"].includes(o.orderStatus) && (
                                                    <span style={{ color: "#64748b", fontSize: "13px" }}>Kitchen Completed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <h2 style={{ fontSize: "18px", margin: "0 0 16px", color: "#0f172a" }}>Menu Items Stock & Availability</h2>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                        {foods.map((food) => (
                            <div
                                key={food._id}
                                style={{
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    padding: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "14px"
                                }}
                            >
                                <img
                                    src={getFoodImageUrl(food.image)}
                                    alt={food.name}
                                    style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover" }}
                                />
                                <div style={{ flex: 1 }}>
                                    <strong style={{ display: "block", fontSize: "15px", color: "#0f172a" }}>{food.name}</strong>
                                    <div style={{ color: "#64748b", fontSize: "13px" }}>
                                        {food.category} • ₹{food.price}
                                    </div>
                                    <button
                                        onClick={() => handleToggleFood(food._id)}
                                        style={{
                                            marginTop: "8px",
                                            padding: "4px 10px",
                                            borderRadius: "6px",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            fontWeight: "600",
                                            background: food.isAvailable ? "#dcfce7" : "#fee2e2",
                                            color: food.isAvailable ? "#166534" : "#991b1b"
                                        }}
                                    >
                                        {food.isAvailable ? "Available" : "Out of Stock"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantDashboard;