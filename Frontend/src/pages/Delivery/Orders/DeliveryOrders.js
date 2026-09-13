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
    FaCheck
} from "react-icons/fa";

const DeliveryOrders = () => {
    const { showToast } = useContext(StoreContext);
    const navigate = useNavigate();
    const outletContext = useOutletContext() || {};
    const { availability } = outletContext;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState(null);

    const fetchAvailableOrders = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await deliveryPartnerAPI.getAvailableOrders();
            setOrders(data.orders || []);
        } catch (err) {
            console.error("Error loading available orders:", err);
            showToast(err.message || "Failed to fetch available orders", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchAvailableOrders();
        // Set up an auto-refresh polling interval of 20 seconds while on this tab
        const interval = setInterval(fetchAvailableOrders, 20000);
        return () => clearInterval(interval);
    }, [fetchAvailableOrders]);

    const handleAcceptOrder = async (orderId) => {
        try {
            setAcceptingId(orderId);
            const { data } = await deliveryPartnerAPI.acceptOrder(orderId);
            showToast(data.message || "Order accepted! Navigate to pickup location.", "success");
            navigate("/delivery/dashboard");
        } catch (err) {
            showToast(err.message || "Could not accept order. It may have been taken by another rider.", "error");
            fetchAvailableOrders();
        } finally {
            setAcceptingId(null);
        }
    };

    return (
        <div className="dp-orders-page">
            <div className="dp-orders-header">
                <div>
                    <h2>Available Deliveries</h2>
                    <p>New customer orders waiting for pickup and delivery</p>
                </div>
                <button
                    className="btn-refresh-orders"
                    onClick={fetchAvailableOrders}
                    disabled={loading}
                >
                    <FaSyncAlt className={loading ? "spin" : ""} /> Refresh Feed
                </button>
            </div>

            {availability === "offline" && (
                <div className="dp-orders-alert-offline">
                    <FaExclamationTriangle />
                    <div>
                        <strong>You are currently Offline.</strong> While offline, you can view incoming tasks, but we recommend switching to <strong>Online</strong> so the dispatcher prioritizes you.
                    </div>
                </div>
            )}

            {loading && orders.length === 0 ? (
                <div className="dp-orders-loader">
                    <Loader />
                </div>
            ) : orders.length === 0 ? (
                <div className="dp-no-orders-box">
                    <div className="empty-icon"><FaBoxOpen /></div>
                    <h3>No Available Orders Nearby</h3>
                    <p>
                        There are no unassigned food orders at this moment. New orders will automatically appear here once kitchens confirm preparation.
                    </p>
                    <button className="btn-empty-refresh" onClick={fetchAvailableOrders}>
                        <FaSyncAlt /> Check Again
                    </button>
                </div>
            ) : (
                <div className="dp-orders-grid">
                    {orders.map((order) => {
                        const restaurant = order.items?.[0]?.restaurantId || {};
                        const earnings = order.deliveryEarnings || 50;
                        const itemCount = order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 1;
                        const isAccepting = acceptingId === order._id;

                        return (
                            <div key={order._id} className="dp-order-card">
                                <div className="order-card-header">
                                    <div className="order-num-pill">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </div>
                                    <div className="order-earn-badge">
                                        <FaMoneyBillWave /> Earn ₹{earnings}
                                    </div>
                                </div>

                                <div className="order-card-content">
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
                                            <div className="step-title">{order.deliveryAddress?.fullName || "Customer"}</div>
                                            <div className="step-desc">
                                                {order.deliveryAddress?.addressLine1 || order.deliveryAddress?.street || "Drop Address"},{" "}
                                                {order.deliveryAddress?.city || "Hyderabad"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Meta */}
                                    <div className="order-card-meta">
                                        <span>
                                            <FaBoxOpen /> {itemCount} {itemCount === 1 ? "Item" : "Items"}
                                        </span>
                                        <span>
                                            <FaClock /> Ordered {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span>
                                            ₹{order.totalAmount} Total Value
                                        </span>
                                    </div>
                                </div>

                                <div className="order-card-actions">
                                    <button
                                        className="btn-accept-order"
                                        onClick={() => handleAcceptOrder(order._id)}
                                        disabled={isAccepting}
                                    >
                                        {isAccepting ? (
                                            "Claiming Task..."
                                        ) : (
                                            <>
                                                <FaCheck /> Accept Delivery Task
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
    );
};

export default DeliveryOrders;
