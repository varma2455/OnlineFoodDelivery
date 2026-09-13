import React, { useEffect, useState, useContext, useCallback } from "react";
import { StoreContext } from "../../context/StoreContext";
import { deliveryAPI } from "../../services/api";
import Loader from "../../components/Loader/Loader";
import {
    FaMotorcycle,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaCheckCircle,
    FaSignOutAlt,
    FaSyncAlt,
    FaBoxOpen
} from "react-icons/fa";
import { Link } from "react-router-dom";

const DeliveryDashboard = () => {
    const { user, logout, showToast } = useContext(StoreContext);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await deliveryAPI.getOrders();
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Failed to load delivery orders:", error);
            showToast(error.message || "Failed to load deliveries", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleMarkDelivered = async (orderId) => {
        try {
            await deliveryAPI.updateDeliveryStatus(orderId, "Delivered");
            showToast("Order marked as Delivered! Great job! 🎉", "success");
            setOrders((prev) =>
                prev.map((o) => (o._id === orderId ? { ...o, orderStatus: "Delivered" } : o))
            );
        } catch (error) {
            showToast(error.message || "Failed to update delivery status", "error");
        }
    };

    const activeDeliveries = orders.filter((o) => o.orderStatus === "Out for Delivery");
    const completedToday = orders.filter((o) => o.orderStatus === "Delivered");

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "clamp(14px, 3vw, 32px)", fontFamily: "inherit", boxSizing: "border-box", width: "100%" }}>
            {/* TOP HEADER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    background: "#fff",
                    padding: "16px 20px",
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
                            background: "#eff6ff",
                            color: "#2563eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px"
                        }}
                    >
                        <FaMotorcycle />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "22px", color: "#0f172a" }}>Delivery Partner Portal</h1>
                        <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "14px" }}>
                            Rider: <strong>{user?.fullName || "Delivery Executive"}</strong> ({user?.email})
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                        onClick={fetchOrders}
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
                        <FaSyncAlt /> Refresh Deliveries
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
                    <div style={{ color: "#3b82f6", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>ACTIVE RUNS</div>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#1d4ed8" }}>{activeDeliveries.length}</div>
                </div>

                <div style={{ background: "#fff", padding: "20px", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                    <div style={{ color: "#10b981", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>DELIVERED TODAY</div>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#047857" }}>{completedToday.length}</div>
                </div>

                <div style={{ background: "#fff", padding: "20px", borderRadius: "14px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
                    <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>TOTAL ASSIGNED</div>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a" }}>{orders.length}</div>
                </div>
            </div>

            {/* DELIVERIES LIST */}
            {loading ? (
                <Loader />
            ) : (
                <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <h2 style={{ fontSize: "18px", margin: "0 0 16px", color: "#0f172a" }}>Assigned Delivery Orders</h2>

                    {orders.length === 0 ? (
                        <p style={{ color: "#64748b" }}>No active delivery assignments at this time.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {orders.map((o) => (
                                <div
                                    key={o._id}
                                    style={{
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "12px",
                                        padding: "18px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: "16px",
                                        flexWrap: "wrap",
                                        background: o.orderStatus === "Delivered" ? "#f8fafc" : "#fff"
                                    }}
                                >
                                    <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                            <code style={{ fontSize: "12px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px" }}>
                                                #{o._id.substring(o._id.length - 6).toUpperCase()}
                                            </code>
                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    padding: "2px 8px",
                                                    borderRadius: "10px",
                                                    background:
                                                        o.orderStatus === "Delivered"
                                                            ? "#dcfce7"
                                                            : o.orderStatus === "Out for Delivery"
                                                            ? "#dbeafe"
                                                            : "#fef9c3",
                                                    color:
                                                        o.orderStatus === "Delivered"
                                                            ? "#166534"
                                                            : o.orderStatus === "Out for Delivery"
                                                            ? "#1e40af"
                                                            : "#854d0e"
                                                }}
                                            >
                                                {o.orderStatus}
                                            </span>
                                            <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>
                                                ₹{o.finalAmount || o.totalAmount} ({o.paymentMethod || "COD"})
                                            </span>
                                        </div>

                                        <div style={{ fontSize: "15px", fontWeight: "600", color: "#0f172a", marginBottom: "4px" }}>
                                            {o.deliveryAddress?.fullName || o.user?.fullName || "Customer"}
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "13px", marginBottom: "4px" }}>
                                            <FaMapMarkerAlt style={{ color: "#ef4444" }} />
                                            {o.deliveryAddress?.addressLine1 || o.deliveryAddress?.street || o.user?.address || "Address not provided"},{" "}
                                            {o.deliveryAddress?.city || o.user?.city}
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "13px" }}>
                                            <FaPhoneAlt style={{ color: "#10b981" }} />
                                            {o.deliveryAddress?.phone || o.user?.phone || "No phone provided"}
                                        </div>
                                    </div>

                                    <div style={{ flex: "1 1 200px" }}>
                                        <div style={{ fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "4px" }}>
                                            PARCEL CONTENTS:
                                        </div>
                                        {o.items?.map((item, idx) => (
                                            <div key={idx} style={{ fontSize: "13px", color: "#334155" }}>
                                                • {item.quantity}x {item.name || item.food?.name}
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        {o.orderStatus === "Out for Delivery" && (
                                            <button
                                                onClick={() => handleMarkDelivered(o._id)}
                                                style={{
                                                    padding: "10px 18px",
                                                    borderRadius: "8px",
                                                    border: "none",
                                                    background: "#10b981",
                                                    color: "#fff",
                                                    fontWeight: "600",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px"
                                                }}
                                            >
                                                <FaCheckCircle /> Mark as Delivered
                                            </button>
                                        )}

                                        {o.orderStatus === "Preparing" && (
                                            <span style={{ fontSize: "13px", color: "#ca8a04", fontWeight: "600" }}>
                                                Awaiting Kitchen Pickup
                                            </span>
                                        )}

                                        {o.orderStatus === "Delivered" && (
                                            <span style={{ fontSize: "13px", color: "#059669", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                                                <FaCheckCircle /> Delivered Successfully
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DeliveryDashboard;