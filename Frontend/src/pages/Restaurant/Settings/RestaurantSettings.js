import React, { useState, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantAPI } from "../../../services/api";
import {
    FaCog,
    FaToggleOn,
    FaToggleOff,
    FaBell,
    FaLock,
    FaShieldAlt
} from "react-icons/fa";

const RestaurantSettings = () => {
    const { user, showToast } = useContext(StoreContext);
    const { restaurant, refreshRestaurant } = useOutletContext() || {};

    const [isAcceptingOrders, setIsAcceptingOrders] = useState(
        restaurant?.deliveryAvailable !== undefined ? restaurant.deliveryAvailable : true
    );
    const [soundAlerts, setSoundAlerts] = useState(true);
    const [updating, setUpdating] = useState(false);

    const handleToggleOrders = async () => {
        try {
            setUpdating(true);
            const newState = !isAcceptingOrders;
            await restaurantAPI.updateMyRestaurant({ deliveryAvailable: newState });
            setIsAcceptingOrders(newState);
            showToast(
                newState ? "Kitchen is now accepting online orders 🟢" : "Kitchen is paused from receiving orders ⏸️",
                "info"
            );
            if (refreshRestaurant) refreshRestaurant();
        } catch (err) {
            showToast(err.message || "Failed to update status", "error");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", maxWidth: "700px" }}>
            <div>
                <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                    <FaCog color="#ff5200" /> Restaurant Operations Settings
                </h1>
                <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                    Configure kitchen order intake, sound notifications, and store operational toggles.
                </p>
            </div>

            {/* Store Intake Toggle */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <strong style={{ fontSize: "16px", color: "#0f172a", display: "block" }}>
                        Accept Online Orders
                    </strong>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                        Temporarily pause incoming customer orders during busy rush hours or kitchen maintenance.
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleToggleOrders}
                    disabled={updating}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "36px",
                        cursor: "pointer",
                        color: isAcceptingOrders ? "#10b981" : "#cbd5e1",
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    {isAcceptingOrders ? <FaToggleOn /> : <FaToggleOff />}
                </button>
            </div>

            {/* Notifications */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <strong style={{ fontSize: "16px", color: "#0f172a", display: "block" }}>
                        Kitchen Sound Notifications
                    </strong>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                        Play a ringing chime when a new customer order arrives in your queue.
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setSoundAlerts(!soundAlerts);
                        showToast(soundAlerts ? "Sound alerts muted" : "Sound alerts enabled", "info");
                    }}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "36px",
                        cursor: "pointer",
                        color: soundAlerts ? "#ff5200" : "#cbd5e1",
                        display: "flex",
                        alignItems: "center"
                    }}
                >
                    {soundAlerts ? <FaToggleOn /> : <FaToggleOff />}
                </button>
            </div>

            {/* Account Credentials Summary */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #f1f5f9" }}>
                <strong style={{ fontSize: "16px", color: "#0f172a", display: "block", marginBottom: "12px" }}>
                    Owner Account Credentials
                </strong>
                <div style={{ fontSize: "14px", color: "#475569", lineHeight: "1.8" }}>
                    <div>Account Owner: <strong>{user?.fullName}</strong></div>
                    <div>Account Email: <strong>{user?.email}</strong></div>
                    <div>Account Role: <code>{user?.role}</code></div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantSettings;
