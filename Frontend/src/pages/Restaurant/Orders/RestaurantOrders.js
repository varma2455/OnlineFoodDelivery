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
    FaPhoneAlt,
    FaUser,
    FaStar,
    FaStore,
    FaExchangeAlt
} from "react-icons/fa";

const TABS = ["All", "Placed", "Confirmed", "Preparing", "Ready for Pickup", "Out for Delivery", "Delivered", "Cancelled"];

const RestaurantOrders = () => {
    const { showToast } = useContext(StoreContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [myRestaurant, setMyRestaurant] = useState(null);

    // Modal state for driver assignment
    const [assignModalOrder, setAssignModalOrder] = useState(null);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [selectedDriverId, setSelectedDriverId] = useState("");
    const [loadingDrivers, setLoadingDrivers] = useState(false);
    const [assigning, setAssigning] = useState(false);

    // Fetch Restaurant Details for pickup info
    const fetchRestaurantInfo = useCallback(async () => {
        try {
            const { data } = await restaurantAPI.getMyRestaurant();
            if (data?.restaurant) {
                setMyRestaurant(data.restaurant);
            }
        } catch (err) {
            console.warn("Could not fetch restaurant profile:", err.message);
        }
    }, []);

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
        fetchRestaurantInfo();
    }, [fetchRestaurantInfo]);

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

    // Open Assign Driver Modal
    const openAssignModal = async (order) => {
        setAssignModalOrder(order);
        setSelectedDriverId(order.deliveryPartner?._id || order.deliveryPartnerId || "");
        setLoadingDrivers(true);
        try {
            const { data } = await restaurantAPI.getAvailableDeliveryPartners();
            setAvailableDrivers(data.deliveryPartners || []);
        } catch (err) {
            console.error("Failed to fetch available drivers:", err);
            showToast(err.message || "Failed to fetch online delivery partners", "error");
            setAvailableDrivers([]);
        } finally {
            setLoadingDrivers(false);
        }
    };

    const closeAssignModal = () => {
        setAssignModalOrder(null);
        setSelectedDriverId("");
        setAvailableDrivers([]);
    };

    // Confirm Driver Assignment
    const handleConfirmAssign = async () => {
        if (!selectedDriverId) {
            showToast("Please select an online delivery partner", "warning");
            return;
        }

        try {
            setAssigning(true);
            const { data } = await restaurantAPI.assignDeliveryPartner(assignModalOrder._id, selectedDriverId);
            showToast(data.message || "Delivery partner assigned successfully! 🛵", "success");
            closeAssignModal();
            fetchOrders();
        } catch (err) {
            showToast(err.message || "Failed to assign delivery partner", "error");
        } finally {
            setAssigning(false);
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
                        View incoming orders, accept tickets, prepare dishes, and allocate online delivery partners when ready.
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
                        const partner = order.deliveryPartner;

                        return (
                            <div key={order._id} className="ro-card">
                                <div className="ro-card-top">
                                    <div>
                                        <div className="ro-card-order-id">{order.orderNumber}</div>
                                        <div className="ro-card-time">{orderDate} • {new Date(order.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <span className={`rd-order-badge status-${statusClass}`}>
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
                                    {order.deliveryAddress?.addressLine1 && (
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", marginTop: "2px", fontSize: "12px" }}>
                                            <FaMapMarkerAlt size={11} /> {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city}
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

                                {/* Delivery Partner Status Strip if assigned */}
                                {partner && partner.name && (
                                    <div className="ro-driver-strip">
                                        <div className="ro-driver-info-left">
                                            <FaMotorcycle color="#2563eb" />
                                            <div>
                                                <div className="ro-driver-name">{partner.name}</div>
                                                <div className="ro-driver-sub">
                                                    {partner.vehicleType || "Bike"} • ⭐ {Number(partner.rating || 5.0).toFixed(1)}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`ro-driver-status-badge ${(order.deliveryStatus || "assigned").toLowerCase().replace(/\s+/g, "-")}`}>
                                            {order.deliveryStatus || "Assigned"}
                                        </span>
                                    </div>
                                )}

                                <div className="ro-card-footer">
                                    <div>
                                        <div style={{ fontSize: "11px", color: "#64748b" }}>YOUR SUBTOTAL</div>
                                        <div className="ro-total-amount">₹{order.restaurantSubtotal}</div>
                                    </div>

                                    <div className="ro-actions-wrap">
                                        {/* Placed -> Accept or Reject */}
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
                                                    className="btn-kitchen-action reject"
                                                    onClick={() => handleUpdateStatus(order._id, "reject", "Cancelled")}
                                                >
                                                    <FaTimes /> Reject
                                                </button>
                                            </div>
                                        )}

                                        {/* Confirmed -> Start Cooking */}
                                        {order.orderStatus === "Confirmed" && (
                                            <button
                                                type="button"
                                                className="btn-kitchen-action prepare"
                                                onClick={() => handleUpdateStatus(order._id, "prepare", "Preparing")}
                                            >
                                                <FaFire /> Start Cooking
                                            </button>
                                        )}

                                        {/* Preparing -> Mark Ready (NO assign driver button allowed yet!) */}
                                        {order.orderStatus === "Preparing" && (
                                            <div className="ro-preparing-action-col">
                                                <button
                                                    type="button"
                                                    className="btn-kitchen-action ready"
                                                    onClick={() => handleUpdateStatus(order._id, "ready", "Ready for Pickup")}
                                                >
                                                    <FaCheck /> Mark Ready for Pickup
                                                </button>
                                                <span className="ro-prep-notice">
                                                    Delivery assignment available after order is ready.
                                                </span>
                                            </div>
                                        )}

                                        {/* Ready for Pickup -> Assign or Reassign Delivery Partner */}
                                        {order.orderStatus === "Ready for Pickup" && (
                                            <div className="ro-ready-action-col">
                                                {!partner ? (
                                                    <button
                                                        type="button"
                                                        className="btn-kitchen-action assign"
                                                        onClick={() => openAssignModal(order)}
                                                    >
                                                        <FaMotorcycle /> Assign Delivery Partner
                                                    </button>
                                                ) : (
                                                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                        <span className="ro-assigned-pill">
                                                            Driver Assigned ✓
                                                        </span>
                                                        {(order.deliveryStatus === "Assigned" || order.deliveryStatus === "Accepted") && (
                                                            <button
                                                                type="button"
                                                                className="btn-change-driver"
                                                                onClick={() => openAssignModal(order)}
                                                                title="Change assigned delivery partner"
                                                            >
                                                                <FaExchangeAlt /> Change
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {order.orderStatus === "Out for Delivery" && (
                                            <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: "700" }}>
                                                Out with Rider 🛵
                                            </span>
                                        )}

                                        {order.orderStatus === "Delivered" && (
                                            <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "700" }}>
                                                Delivered ✓
                                            </span>
                                        )}

                                        {order.orderStatus === "Cancelled" && (
                                            <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700" }}>
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

            {/* ========================================================= */}
            {/* ASSIGN DELIVERY PARTNER MODAL */}
            {/* ========================================================= */}
            {assignModalOrder && (
                <div className="ro-modal-backdrop" onClick={closeAssignModal}>
                    <div className="ro-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="ro-modal-header">
                            <div>
                                <h3 className="ro-modal-title">
                                    <FaMotorcycle color="#ff5200" /> Assign Delivery Partner
                                </h3>
                                <p className="ro-modal-sub">
                                    Order #{assignModalOrder.orderNumber || assignModalOrder._id.slice(-6).toUpperCase()}
                                </p>
                            </div>
                            <button className="ro-modal-close" onClick={closeAssignModal} aria-label="Close modal">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="ro-modal-body">
                            {/* Order Context Details */}
                            <div className="ro-order-brief-grid">
                                <div className="ro-brief-item">
                                    <div className="brief-label">
                                        <FaStore /> RESTAURANT PICKUP
                                    </div>
                                    <div className="brief-val bold">{myRestaurant?.name || "Your Restaurant"}</div>
                                    <div className="brief-val muted">
                                        {myRestaurant?.address?.street ? `${myRestaurant.address.street}, ` : ""}
                                        {myRestaurant?.address?.city || "Hyderabad"}
                                    </div>
                                </div>

                                <div className="ro-brief-item">
                                    <div className="brief-label">
                                        <FaUser /> CUSTOMER DROP
                                    </div>
                                    <div className="brief-val bold">{assignModalOrder.user?.fullName}</div>
                                    <div className="brief-val muted">
                                        {assignModalOrder.deliveryAddress?.addressLine1 || "Customer Address"},{" "}
                                        {assignModalOrder.deliveryAddress?.city || "Hyderabad"}
                                    </div>
                                </div>
                            </div>

                            <hr className="ro-modal-divider" />

                            {/* Available Delivery Partners Section */}
                            <div className="ro-drivers-section-head">
                                <h4>AVAILABLE DELIVERY PARTNERS</h4>
                                <span className="ro-drivers-badge">
                                    {availableDrivers.length} Online & Approved
                                </span>
                            </div>

                            {loadingDrivers ? (
                                <div style={{ padding: "30px", textAlign: "center" }}>
                                    <Loader />
                                    <p style={{ marginTop: "10px", color: "#64748b", fontSize: "13px" }}>
                                        Searching for nearby approved online delivery partners...
                                    </p>
                                </div>
                            ) : availableDrivers.length === 0 ? (
                                <div className="ro-no-drivers-box">
                                    <FaMotorcycle size={36} color="#cbd5e1" />
                                    <h5>No Online Delivery Partners Found</h5>
                                    <p>
                                        There are currently no approved delivery partners with <strong>Online</strong> status in your area. Drivers must switch their availability to online to receive orders.
                                    </p>
                                </div>
                            ) : (
                                <div className="ro-driver-selection-list">
                                    {availableDrivers.map((driver) => {
                                        const isSelected = selectedDriverId === driver._id;
                                        return (
                                            <div
                                                key={driver._id}
                                                className={`ro-driver-card ${isSelected ? "selected" : ""}`}
                                                onClick={() => setSelectedDriverId(driver._id)}
                                            >
                                                <input
                                                    type="radio"
                                                    name="selectedDriver"
                                                    checked={isSelected}
                                                    onChange={() => setSelectedDriverId(driver._id)}
                                                    className="ro-driver-radio"
                                                />

                                                <div className="ro-driver-avatar">
                                                    🛵
                                                </div>

                                                <div className="ro-driver-details">
                                                    <div className="ro-driver-name-row">
                                                        <span className="driver-name">{driver.name}</span>
                                                        <span className="online-indicator">🟢 Online</span>
                                                    </div>

                                                    <div className="ro-driver-sub-row">
                                                        <span className="driver-vehicle">
                                                            {driver.vehicleType || "Bike"} {driver.vehicleNumber ? `• ${driver.vehicleNumber}` : ""}
                                                        </span>
                                                        <span className="driver-rating">
                                                            <FaStar color="#f59e0b" size={11} /> {Number(driver.rating || 5.0).toFixed(1)}
                                                        </span>
                                                        <span className="driver-city">
                                                            📍 {driver.city || "Zone"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="ro-driver-workload">
                                                    <span className={`workload-pill ${driver.activeDeliveriesCount === 0 ? "free" : "busy"}`}>
                                                        {driver.activeDeliveriesCount === 0 ? "Free (0 orders)" : `${driver.activeDeliveriesCount} active`}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="ro-modal-footer">
                            <button
                                type="button"
                                className="btn-modal-cancel"
                                onClick={closeAssignModal}
                                disabled={assigning}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn-modal-assign"
                                onClick={handleConfirmAssign}
                                disabled={!selectedDriverId || assigning || availableDrivers.length === 0}
                            >
                                {assigning ? "Assigning Driver..." : "Assign Selected Driver"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantOrders;
