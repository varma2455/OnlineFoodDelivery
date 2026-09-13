import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantPartnerAPI } from "../../../services/api";
import "./RestaurantPartnerRequest.css";
import {
    FaStore,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaUtensils,
    FaClock,
    FaRupeeSign,
    FaFileContract,
    FaCheckCircle,
    FaArrowRight,
    FaArrowLeft,
    FaBuilding
} from "react-icons/fa";

const CUISINE_OPTIONS = [
    "Indian",
    "Biryani",
    "South Indian",
    "North Indian",
    "Chinese",
    "Italian",
    "Pizza",
    "Burgers",
    "Fast Food",
    "Desserts",
    "Beverages",
    "Noodles",
    "Salads"
];

const RestaurantPartnerRequest = () => {
    const navigate = useNavigate();
    const { showToast } = useContext(StoreContext);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Owner Info
        ownerName: "",
        email: "",
        phone: "",

        // Restaurant Info
        restaurantName: "",
        description: "",
        cuisineTypes: ["Indian", "Biryani"],
        restaurantType: "Both",

        // Business Info
        businessEmail: "",
        openingTime: "09:00 AM",
        closingTime: "11:00 PM",
        minimumOrderAmount: 100,
        deliveryFee: 40,

        // Location
        street: "",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",

        // Optional Compliance
        businessRegistrationNumber: "",
        gstNumber: "",
        fssaiNumber: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCuisineToggle = (cuisine) => {
        setFormData((prev) => {
            const exists = prev.cuisineTypes.includes(cuisine);
            const updated = exists
                ? prev.cuisineTypes.filter((c) => c !== cuisine)
                : [...prev.cuisineTypes, cuisine];
            return {
                ...prev,
                cuisineTypes: updated.length > 0 ? updated : [cuisine]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.ownerName.trim()) {
            showToast("Owner full name is required.", "error");
            return;
        }
        if (!formData.email.trim()) {
            showToast("Owner email address is required.", "error");
            return;
        }
        if (!formData.phone.trim()) {
            showToast("Contact phone number is required.", "error");
            return;
        }
        if (!formData.restaurantName.trim()) {
            showToast("Restaurant name is required.", "error");
            return;
        }
        if (!formData.city.trim()) {
            showToast("City is required.", "error");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                ownerName: formData.ownerName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                restaurantName: formData.restaurantName.trim(),
                description: formData.description.trim(),
                cuisineTypes: formData.cuisineTypes,
                restaurantType: formData.restaurantType,
                address: {
                    street: formData.street.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim()
                },
                businessEmail: formData.businessEmail.trim() || formData.email.trim(),
                openingTime: formData.openingTime,
                closingTime: formData.closingTime,
                minimumOrderAmount: Number(formData.minimumOrderAmount) || 0,
                deliveryFee: Number(formData.deliveryFee) || 0,
                businessRegistrationNumber: formData.businessRegistrationNumber.trim(),
                gstNumber: formData.gstNumber.trim(),
                fssaiNumber: formData.fssaiNumber.trim()
            };

            const { data } = await restaurantPartnerAPI.apply(payload);

            if (data.success) {
                const appId = data.application?.applicationId;
                if (appId) {
                    localStorage.setItem("foodexpress_partner_app_id", appId);
                }

                showToast(
                    data.message || "Application submitted successfully! Redirecting to status tracker...",
                    "success"
                );

                // Redirect to status tracker
                navigate(appId ? `/restaurant/application-status?id=${appId}` : "/restaurant/application-status");
            }
        } catch (err) {
            console.error("Failed to submit partner application:", err);
            showToast(err.message || "Failed to submit application. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="partner-request-page">
            {/* Top Navigation Bar */}
            <header className="partner-header">
                <div className="partner-header-inner">
                    <Link to="/" className="partner-brand">
                        <span className="brand-logo-icon">🍔</span>
                        <span className="brand-name">FoodExpress</span>
                        <span className="partner-badge-pill">PARTNER</span>
                    </Link>

                    <div className="partner-header-actions">
                        <Link to="/restaurant/application-status" className="partner-link-status">
                            Check Application Status
                        </Link>
                        <Link to="/restaurant/login" className="partner-btn-login">
                            Partner Login
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="partner-hero">
                <div className="partner-hero-content">
                    <div className="hero-kicker">
                        <FaStore /> PARTNER WITH FOODEXPRESS
                    </div>
                    <h1 className="hero-title">Expand Your Kitchen’s Reach</h1>
                    <p className="hero-desc">
                        Partner with FoodExpress to serve thousands of hungry customers in your city.
                        Fill out your details below and our operations team will review your application.
                    </p>
                    <div className="hero-perks">
                        <span><FaCheckCircle color="#10b981" /> Zero Upfront Fee</span>
                        <span><FaCheckCircle color="#10b981" /> Live Kitchen Orders</span>
                        <span><FaCheckCircle color="#10b981" /> Fast Admin Verification</span>
                    </div>
                </div>
            </section>

            {/* Form Container */}
            <main className="partner-form-container">
                <form className="partner-request-form" onSubmit={handleSubmit}>
                    {/* 1. OWNER INFORMATION */}
                    <div className="form-card">
                        <div className="form-card-header">
                            <div className="form-section-number">1</div>
                            <div>
                                <h2>Owner Information</h2>
                                <p>Primary contact details of the restaurant owner</p>
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>
                                    Full Name <span className="req">*</span>
                                </label>
                                <div className="input-wrapper">
                                    <FaUser className="input-icon" />
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        placeholder="e.g. Ravi Kumar"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    Owner Email <span className="req">*</span>
                                </label>
                                <div className="input-wrapper">
                                    <FaEnvelope className="input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="ravi@gmail.com"
                                        required
                                    />
                                </div>
                                <span className="input-help">
                                    Admin will send your activation link to this email address.
                                </span>
                            </div>

                            <div className="form-group">
                                <label>
                                    Contact Phone <span className="req">*</span>
                                </label>
                                <div className="input-wrapper">
                                    <FaPhone className="input-icon" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. RESTAURANT INFORMATION */}
                    <div className="form-card">
                        <div className="form-card-header">
                            <div className="form-section-number">2</div>
                            <div>
                                <h2>Restaurant Information</h2>
                                <p>Public brand details visible to food ordering customers</p>
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group full-width">
                                <label>
                                    Restaurant / Outlet Name <span className="req">*</span>
                                </label>
                                <div className="input-wrapper">
                                    <FaStore className="input-icon" />
                                    <input
                                        type="text"
                                        name="restaurantName"
                                        value={formData.restaurantName}
                                        onChange={handleChange}
                                        placeholder="e.g. Spice Kitchen & Biryani Zone"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Authentic dum biryanis, spicy kebabs, and traditional Andhra specialties crafted fresh daily."
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Restaurant Dietary Type</label>
                                <div className="dietary-selector">
                                    {["Veg", "Non-Veg", "Both"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            className={`dietary-btn ${formData.restaurantType === type ? "active" : ""}`}
                                            onClick={() => setFormData((p) => ({ ...p, restaurantType: type }))}
                                        >
                                            {type === "Veg" && "🟢 Pure Vegetarian"}
                                            {type === "Non-Veg" && "🔴 Non-Vegetarian"}
                                            {type === "Both" && "🟡 Veg & Non-Veg"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Cuisine Specialties (Select all that apply)</label>
                                <div className="cuisine-chips-grid">
                                    {CUISINE_OPTIONS.map((c) => {
                                        const selected = formData.cuisineTypes.includes(c);
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                className={`cuisine-chip ${selected ? "selected" : ""}`}
                                                onClick={() => handleCuisineToggle(c)}
                                            >
                                                {c}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. BUSINESS INFORMATION */}
                    <div className="form-card">
                        <div className="form-card-header">
                            <div className="form-section-number">3</div>
                            <div>
                                <h2>Business Operations</h2>
                                <p>Working hours, order limits, and operational emails</p>
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Business / Operations Email</label>
                                <div className="input-wrapper">
                                    <FaEnvelope className="input-icon" />
                                    <input
                                        type="email"
                                        name="businessEmail"
                                        value={formData.businessEmail}
                                        onChange={handleChange}
                                        placeholder="orders@spicekitchen.com (optional)"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Opening Time</label>
                                <div className="input-wrapper">
                                    <FaClock className="input-icon" />
                                    <input
                                        type="text"
                                        name="openingTime"
                                        value={formData.openingTime}
                                        onChange={handleChange}
                                        placeholder="09:00 AM"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Closing Time</label>
                                <div className="input-wrapper">
                                    <FaClock className="input-icon" />
                                    <input
                                        type="text"
                                        name="closingTime"
                                        value={formData.closingTime}
                                        onChange={handleChange}
                                        placeholder="11:00 PM"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Minimum Order Amount (₹)</label>
                                <div className="input-wrapper">
                                    <FaRupeeSign className="input-icon" />
                                    <input
                                        type="number"
                                        name="minimumOrderAmount"
                                        min="0"
                                        value={formData.minimumOrderAmount}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Delivery Fee (₹)</label>
                                <div className="input-wrapper">
                                    <FaRupeeSign className="input-icon" />
                                    <input
                                        type="number"
                                        name="deliveryFee"
                                        min="0"
                                        value={formData.deliveryFee}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. LOCATION */}
                    <div className="form-card">
                        <div className="form-card-header">
                            <div className="form-section-number">4</div>
                            <div>
                                <h2>Kitchen / Outlet Location</h2>
                                <p>Pickup address where delivery partners will collect food orders</p>
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group full-width">
                                <label>Street Address</label>
                                <div className="input-wrapper">
                                    <FaMapMarkerAlt className="input-icon" />
                                    <input
                                        type="text"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleChange}
                                        placeholder="Plot 42, Hitech City Main Road, Madhapur"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    City <span className="req">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Hyderabad"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Telangana"
                                />
                            </div>

                            <div className="form-group">
                                <label>Pincode</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder="500081"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 5. OPTIONAL COMPLIANCE */}
                    <div className="form-card">
                        <div className="form-card-header">
                            <div className="form-section-number">5</div>
                            <div>
                                <h2>Business Verification Details (Optional)</h2>
                                <p>Adding official registrations speeds up admin verification</p>
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>FSSAI License Number</label>
                                <div className="input-wrapper">
                                    <FaFileContract className="input-icon" />
                                    <input
                                        type="text"
                                        name="fssaiNumber"
                                        value={formData.fssaiNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. 13621011000123"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>GST Identification Number (GSTIN)</label>
                                <div className="input-wrapper">
                                    <FaBuilding className="input-icon" />
                                    <input
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. 36AAAAA0000A1Z5"
                                    />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Business Registration / Trade License</label>
                                <div className="input-wrapper">
                                    <FaFileContract className="input-icon" />
                                    <input
                                        type="text"
                                        name="businessRegistrationNumber"
                                        value={formData.businessRegistrationNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. REG-HYD-2024-889"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="partner-submit-card">
                        <div className="terms-note">
                            By submitting this partnership application, you confirm that the provided restaurant
                            and ownership information is accurate and agree to FoodExpress partner terms.
                        </div>

                        <button type="submit" className="btn-submit-partner" disabled={loading}>
                            {loading ? (
                                "Submitting Application..."
                            ) : (
                                <>
                                    Submit Partnership Request <FaArrowRight />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default RestaurantPartnerRequest;
