import React, { useState, useEffect, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantAPI } from "../../../services/api";
import "./RestaurantProfile.css";
import {
    FaUserCircle,
    FaStore,
    FaSave,
    FaCheckCircle,
    FaClock,
    FaExclamationCircle
} from "react-icons/fa";

const RestaurantProfile = () => {
    const { showToast } = useContext(StoreContext);
    const { restaurant, refreshRestaurant } = useOutletContext() || {};

    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        phone: "",
        email: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        openingTime: "09:00 AM",
        closingTime: "11:00 PM",
        minimumOrderAmount: 100,
        deliveryFee: 40,
        deliveryAvailable: true,
        restaurantType: "Both"
    });

    useEffect(() => {
        if (restaurant) {
            setFormData({
                name: restaurant.name || "",
                description: restaurant.description || "",
                phone: restaurant.phone || "",
                email: restaurant.email || "",
                street: restaurant.address?.street || "",
                city: restaurant.address?.city || "",
                state: restaurant.address?.state || "",
                pincode: restaurant.address?.pincode || "",
                openingTime: restaurant.openingTime || "09:00 AM",
                closingTime: restaurant.closingTime || "11:00 PM",
                minimumOrderAmount: restaurant.minimumOrderAmount !== undefined ? restaurant.minimumOrderAmount : 100,
                deliveryFee: restaurant.deliveryFee !== undefined ? restaurant.deliveryFee : 40,
                deliveryAvailable: restaurant.deliveryAvailable !== undefined ? restaurant.deliveryAvailable : true,
                restaurantType: restaurant.restaurantType || "Both"
            });
        }
    }, [restaurant]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                address: {
                    street: formData.street.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim()
                },
                openingTime: formData.openingTime,
                closingTime: formData.closingTime,
                minimumOrderAmount: Number(formData.minimumOrderAmount),
                deliveryFee: Number(formData.deliveryFee),
                deliveryAvailable: Boolean(formData.deliveryAvailable),
                restaurantType: formData.restaurantType
            };

            await restaurantAPI.updateMyRestaurant(payload);
            showToast("Restaurant profile updated successfully! 🎉", "success");
            if (refreshRestaurant) refreshRestaurant();
        } catch (err) {
            showToast(err.message || "Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rp-container">
            {/* Header */}
            <div className="rp-header">
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                        <FaStore color="#ff5200" /> Restaurant Profile & Details
                    </h1>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                        Manage public restaurant info, operating timings, and delivery policies.
                    </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>APPLICATION STATUS:</span>
                    <span className={`app-status-badge ${restaurant?.status || "approved"}`}>
                        {restaurant?.status?.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Form */}
            <div className="rp-card">
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div>
                        <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a" }}>General Information</h3>
                        <div className="rp-form-grid">
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Restaurant Name *</label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Contact Phone *</label>
                                <input
                                    type="tel"
                                    className="rest-input"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Official Email *</label>
                                <input
                                    type="email"
                                    className="rest-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Store Type</label>
                                <select
                                    className="rest-select"
                                    value={formData.restaurantType}
                                    onChange={(e) => setFormData({ ...formData, restaurantType: e.target.value })}
                                >
                                    <option value="Both">Both Veg & Non-Veg</option>
                                    <option value="Veg">Pure Vegetarian 🟢</option>
                                    <option value="Non-Veg">Non-Vegetarian 🔴</option>
                                </select>
                            </div>

                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Restaurant Story & Description</label>
                                <textarea
                                    className="rest-textarea"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a" }}>Location & Address</h3>
                        <div className="rp-form-grid">
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Street Address *</label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>City *</label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>State *</label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Pincode *</label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
                        <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a" }}>Operating Hours & Order Settings</h3>
                        <div className="rp-form-grid">
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Opening Time</label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    value={formData.openingTime}
                                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Closing Time</label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    value={formData.closingTime}
                                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Minimum Order Amount (₹)</label>
                                <input
                                    type="number"
                                    className="rest-input"
                                    value={formData.minimumOrderAmount}
                                    onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>Delivery Fee (₹)</label>
                                <input
                                    type="number"
                                    className="rest-input"
                                    value={formData.deliveryFee}
                                    onChange={(e) => setFormData({ ...formData, deliveryFee: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                            type="submit"
                            className="btn-rest-continue"
                            disabled={saving}
                            style={{ minWidth: "160px", justifyContent: "center" }}
                        >
                            <FaSave /> {saving ? "Saving Changes..." : "Save Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RestaurantProfile;
