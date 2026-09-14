import React, { useState, useEffect, useCallback, useContext } from "react";
import { StoreContext } from "../../../context/StoreContext";
import { deliveryPartnerAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import DeliveryOtpInput from "../../../components/DeliveryOtpInput/DeliveryOtpInput";
import "./MyDeliveries.css";
import {
    FaClipboardList,
    FaCheckCircle,
    FaMotorcycle,
    FaMapMarkerAlt,
    FaUtensils,
    FaPhoneAlt,
    FaArrowRight,
    FaClock,
    FaCalendarAlt,
    FaSyncAlt,
    FaLock,
    FaTimes
} from "react-icons/fa";

const MyDeliveries = () => {
    const { showToast } = useContext(StoreContext);
    const [deliveries, setDeliveries] = useState([]);
    const [filter, setFilter] = useState("all"); // "all", "active", "completed"
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [otpModalOrder, setOtpModalOrder] = useState(null);

    const fetchDeliveries = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await deliveryPartnerAPI.getMyDeliveries({ status: filter });
            setDeliveries(data.deliveries || []);
        } catch (err) {
            console.error("Error fetching deliveries:", err);
            showToast(err.message || "Failed to load deliveries", "error");
        } finally {
            setLoading(false);
        }
    }, [filter, showToast]);

    useEffect(() => {
        fetchDeliveries();
    }, [fetchDeliveries]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setActionLoading(true);
            const { data } = await deliveryPartnerAPI.updateOrderStatus(orderId, newStatus);
            showToast(data.message || `Delivery status changed to ${newStatus}`, "success");
            fetchDeliveries();
        } catch (err) {
            showToast(err.message || "Failed to advance delivery stage", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const getNextStatusAction = (currentStatus) => {
        switch (currentStatus) {
            case "Accepted":
                return { next: "Going to Restaurant", label: "Going to Restaurant" };
            case "Going to Restaurant":
                return { next: "Arrived at Restaurant", label: "Arrived at Restaurant" };
            case "Arrived at Restaurant":
                return { next: "Order Picked Up", label: "Confirm Picked Up" };
            case "Order Picked Up":
                return { next: "Going to Customer", label: "Going to Customer" };
            case "Going to Customer":
                return { next: "Arrived at Customer", label: "Arrived at Customer" };
            case "Arrived at Customer":
                return { next: "verify-otp", label: "Verify Delivery OTP 🔐", requiresOtp: true, isFinal: true };
            default:
                return null;
        }
    };

    const totalCount = deliveries.length;
    const activeCount = deliveries.filter((d) => d.deliveryStatus !== "Delivered" && d.status !== "Cancelled").length;
    const completedCount = deliveries.filter((d) => d.deliveryStatus === "Delivered").length;

    return (
        <div className="dp-deliveries-page">
            {/* Header */}
            <div className="dp-deliveries-header">
                <div>
                    <h2>My Deliveries History</h2>
                    <p>Track ongoing delivery routes and past completed assignments</p>
                </div>
                <button className="btn-deliveries-refresh" onClick={fetchDeliveries}>
                    <FaSyncAlt /> Refresh
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="dp-tabs-row">
                <button
                    className={`dp-filter-tab ${filter === "all" ? "active" : ""}`}
                    onClick={() => setFilter("all")}
                >
                    All Deliveries ({totalCount})
                </button>
                <button
                    className={`dp-filter-tab ${filter === "active" ? "active" : ""}`}
                    onClick={() => setFilter("active")}
                >
                    Active / In-Progress ({activeCount})
                </button>
                <button
                    className={`dp-filter-tab ${filter === "completed" ? "active" : ""}`}
                    onClick={() => setFilter("completed")}
                >
                    Completed ({completedCount})
                </button>
            </div>

            {/* Deliveries List */}
            {loading ? (
                <div className="dp-deliveries-loader">
                    <Loader />
                </div>
            ) : deliveries.length === 0 ? (
                <div className="dp-deliveries-empty">
                    <FaClipboardList className="empty-icon" />
                    <h3>No Deliveries Found</h3>
                    <p>
                        {filter === "active"
                            ? "You don't have any active deliveries at the moment. Accept an order from the Available Deliveries tab!"
                            : "No delivery records match this category."}
                    </p>
                </div>
            ) : (
                <div className="dp-deliveries-list">
                    {deliveries.map((delivery) => {
                        const isDelivered = delivery.deliveryStatus === "Delivered";
                        const isCancelled = delivery.status === "Cancelled";
                        const nextAction = getNextStatusAction(delivery.deliveryStatus);
                        const restaurant = delivery.items?.[0]?.restaurantId || {};

                        return (
                            <div
                                key={delivery._id}
                                className={`dp-delivery-card ${isDelivered ? "delivered" : isCancelled ? "cancelled" : "in-progress"}`}
                            >
                                <div className="card-top-bar">
                                    <div className="delivery-id-group">
                                        <span className="id-badge">#{delivery._id.slice(-6).toUpperCase()}</span>
                                        <span className="order-date">
                                            <FaCalendarAlt />{" "}
                                            {new Date(delivery.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric"
                                            })}
                                        </span>
                                    </div>

                                    <div className="status-and-earnings">
                                        <span className={`status-pill ${delivery.deliveryStatus?.toLowerCase().replace(/\s+/g, "-")}`}>
                                            {delivery.deliveryStatus || delivery.status}
                                        </span>
                                        <span className="earning-badge">
                                            ₹{delivery.deliveryEarnings || 50}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-locations-grid">
                                    {/* Pickup */}
                                    <div className="deliv-loc-box">
                                        <div className="box-title orange">
                                            <FaUtensils /> PICKUP
                                        </div>
                                        <div className="box-name">{restaurant.name || "Restaurant"}</div>
                                        <div className="box-address">
                                            {restaurant.address?.street || "Address"},{" "}
                                            {restaurant.address?.city || "Hyderabad"}
                                        </div>
                                        {restaurant.phone && !isDelivered && (
                                            <div className="box-contact">
                                                <FaPhoneAlt /> <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Drop */}
                                    <div className="deliv-loc-box">
                                        <div className="box-title green">
                                            <FaMapMarkerAlt /> DROP OFF
                                        </div>
                                        <div className="box-name">
                                            {delivery.deliveryAddress?.fullName || delivery.user?.fullName || "Customer"}
                                        </div>
                                        <div className="box-address">
                                            {delivery.deliveryAddress?.addressLine1 || delivery.deliveryAddress?.street || "Address"},{" "}
                                            {delivery.deliveryAddress?.city} - {delivery.deliveryAddress?.postalCode}
                                        </div>
                                        {delivery.deliveryAddress?.phone && !isDelivered && (
                                            <div className="box-contact">
                                                <FaPhoneAlt /> <a href={`tel:${delivery.deliveryAddress.phone}`}>{delivery.deliveryAddress.phone}</a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Items Summary */}
                                <div className="card-items-summary">
                                    <div className="summary-label">ITEMS ({delivery.items?.length || 0}):</div>
                                    <div className="summary-list">
                                        {delivery.items?.map((it, idx) => (
                                            <span key={idx} className="item-chip">
                                                {it.name || it.foodId?.name || "Dish"} × {it.quantity || 1}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Next Action Button for Active Orders */}
                                {!isDelivered && !isCancelled && nextAction && (
                                    <div className="card-actions-bar">
                                        <div className="status-progress-text">
                                            Next Step: <strong>{nextAction.label}</strong>
                                        </div>
                                        <button
                                            className={`btn-advance-status ${nextAction.isFinal ? "finish" : ""}`}
                                            onClick={() => {
                                                if (nextAction.requiresOtp) {
                                                    setOtpModalOrder(delivery);
                                                } else {
                                                    handleUpdateStatus(delivery._id, nextAction.next);
                                                }
                                            }}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading ? "Updating..." : (
                                                <>
                                                    {nextAction.label} <FaArrowRight />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {isDelivered && (
                                    <div className="card-delivered-footer">
                                        <FaCheckCircle className="check-icon" /> Delivered & Earnings Credited to Wallet
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* OTP Verification Modal */}
            {otpModalOrder && (
                <div
                    className="dp-otp-modal-backdrop"
                    onClick={() => setOtpModalOrder(null)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(15, 23, 42, 0.7)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        padding: "16px"
                    }}
                >
                    <div
                        className="dp-otp-modal-dialog"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: "480px",
                            width: "100%",
                            position: "relative"
                        }}
                    >
                        <DeliveryOtpInput
                            orderId={otpModalOrder._id}
                            orderNumber={`#FE${otpModalOrder._id.slice(-6).toUpperCase()}`}
                            customerName={otpModalOrder.deliveryAddress?.fullName || otpModalOrder.user?.fullName || "Customer"}
                            onCancel={() => setOtpModalOrder(null)}
                            onSuccess={() => {
                                showToast("Delivery verified successfully! 🎉", "success");
                                setOtpModalOrder(null);
                                fetchDeliveries();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyDeliveries;
