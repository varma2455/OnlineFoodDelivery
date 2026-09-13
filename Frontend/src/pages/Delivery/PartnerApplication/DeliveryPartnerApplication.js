import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { deliveryPartnerAPI } from "../../../services/api";
import "./DeliveryPartnerApplication.css";
import {
    FaMotorcycle,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaIdCard,
    FaFileContract,
    FaCheckCircle,
    FaArrowRight,
    FaShieldAlt
} from "react-icons/fa";

const VEHICLE_OPTIONS = [
    { type: "Bike", icon: "🏍️", desc: "Standard Motorcycle" },
    { type: "Scooter", icon: "🛵", desc: "Automatic Scooter" },
    { type: "Electric Bike", icon: "⚡", desc: "EV 2-Wheeler" },
    { type: "Bicycle", icon: "🚲", desc: "Eco-friendly Cycle" },
    { type: "Car", icon: "🚗", desc: "4-Wheeler Delivery" }
];

const DeliveryPartnerApplication = () => {
    const navigate = useNavigate();
    const { showToast } = useContext(StoreContext);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Personal Information
        ownerName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "Male",
        profilePhoto: "default-user.png",

        // Address
        street: "",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",

        // Delivery Information
        vehicleType: "Bike",
        vehicleNumber: "",
        licenseNumber: "",
        experience: "0-1 years",

        // Documents
        drivingLicenseDocument: "",
        vehicleRcDocument: "",

        // Agreement
        agreed: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleVehicleSelect = (type) => {
        setFormData((prev) => ({ ...prev, vehicleType: type }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.ownerName.trim()) {
            showToast("Full name is required.", "error");
            return;
        }
        if (!formData.email.trim()) {
            showToast("Email address is required.", "error");
            return;
        }
        if (!formData.phone.trim()) {
            showToast("Mobile number is required.", "error");
            return;
        }
        if (!formData.city.trim() || !formData.pincode.trim()) {
            showToast("City and Pincode are required.", "error");
            return;
        }
        if (!formData.agreed) {
            showToast("You must agree to the Delivery Partner Terms and Conditions.", "error");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                ownerName: formData.ownerName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                profilePhoto: formData.profilePhoto,
                address: {
                    street: formData.street.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim()
                },
                vehicleType: formData.vehicleType,
                vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
                licenseNumber: formData.licenseNumber.trim().toUpperCase(),
                experience: formData.experience,
                drivingLicenseDocument: formData.drivingLicenseDocument.trim(),
                vehicleRcDocument: formData.vehicleRcDocument.trim()
            };

            const { data } = await deliveryPartnerAPI.apply(payload);

            if (data.success) {
                const appId = data.application?.applicationId;
                if (appId) {
                    localStorage.setItem("foodexpress_delivery_app_id", appId);
                }

                showToast(
                    data.message || "Application submitted successfully! Redirecting to status tracker...",
                    "success"
                );

                navigate(appId ? `/delivery/application-status?id=${appId}` : "/delivery/application-status");
            }
        } catch (err) {
            console.error("Failed to submit delivery partner application:", err);
            showToast(err.message || "Failed to submit application. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dp-application-page">
            {/* Top Navigation */}
            <header className="dp-header">
                <div className="dp-header-inner">
                    <Link to="/" className="dp-brand">
                        <span className="dp-logo-icon">🍔</span>
                        <span className="dp-brand-name">FoodExpress</span>
                        <span className="dp-badge-pill">DELIVERY PARTNER</span>
                    </Link>

                    <div className="dp-header-actions">
                        <Link to="/delivery/application-status" className="dp-link-status">
                            Check Status
                        </Link>
                        <Link to="/delivery/login" className="dp-btn-login">
                            Rider Login
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Banner */}
            <section className="dp-hero">
                <div className="dp-hero-content">
                    <div className="dp-kicker">
                        <FaMotorcycle /> JOIN FOODEXPRESS FLEET
                    </div>
                    <h1 className="dp-hero-title">Become a FoodExpress Delivery Partner</h1>
                    <p className="dp-hero-desc">
                        Deliver food, earn money, and grow with FoodExpress. Flexible hours, daily payouts,
                        and insurance coverage on every ride.
                    </p>
                    <div className="dp-hero-perks">
                        <span><FaCheckCircle color="#10b981" /> Flexible Timings</span>
                        <span><FaCheckCircle color="#10b981" /> Instant Weekly Payouts</span>
                        <span><FaCheckCircle color="#10b981" /> Fuel & Performance Incentives</span>
                    </div>
                </div>
            </section>

            {/* Application Form */}
            <main className="dp-form-container">
                <form className="dp-form" onSubmit={handleSubmit}>
                    {/* SECTION 1: PERSONAL INFORMATION */}
                    <div className="dp-card">
                        <div className="dp-card-header">
                            <div className="dp-step-badge">1</div>
                            <div>
                                <h2>Personal Information</h2>
                                <p>Tell us about yourself so we can verify your identity</p>
                            </div>
                        </div>

                        <div className="dp-grid-2">
                            <div className="dp-group">
                                <label>Full Name <span className="req">*</span></label>
                                <div className="dp-input-wrap">
                                    <FaUser className="dp-icon" />
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        placeholder="e.g. Yeswanth Varma"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="dp-group">
                                <label>Email Address <span className="req">*</span></label>
                                <div className="dp-input-wrap">
                                    <FaEnvelope className="dp-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="rider@example.com"
                                        required
                                    />
                                </div>
                                <span className="dp-help">Invitation link will be delivered to this email.</span>
                            </div>

                            <div className="dp-group">
                                <label>Mobile Number <span className="req">*</span></label>
                                <div className="dp-input-wrap">
                                    <FaPhone className="dp-icon" />
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

                            <div className="dp-group">
                                <label>Date of Birth</label>
                                <div className="dp-input-wrap">
                                    <FaCalendarAlt className="dp-icon" />
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="dp-group">
                                <label>Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="dp-select"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>

                            <div className="dp-group">
                                <label>Profile Photo URL</label>
                                <input
                                    type="text"
                                    name="profilePhoto"
                                    value={formData.profilePhoto}
                                    onChange={handleChange}
                                    placeholder="https://example.com/photo.jpg or default-user.png"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: ADDRESS */}
                    <div className="dp-card">
                        <div className="dp-card-header">
                            <div className="dp-step-badge">2</div>
                            <div>
                                <h2>Address Details</h2>
                                <p>Your residential address for local delivery zone assignment</p>
                            </div>
                        </div>

                        <div className="dp-grid-2">
                            <div className="dp-group full-width">
                                <label>Street Address</label>
                                <div className="dp-input-wrap">
                                    <FaMapMarkerAlt className="dp-icon" />
                                    <input
                                        type="text"
                                        name="street"
                                        value={formData.street}
                                        onChange={handleChange}
                                        placeholder="Flat 204, Green Heights, Madhapur"
                                    />
                                </div>
                            </div>

                            <div className="dp-group">
                                <label>City <span className="req">*</span></label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Hyderabad"
                                    required
                                />
                            </div>

                            <div className="dp-group">
                                <label>State <span className="req">*</span></label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="Telangana"
                                    required
                                />
                            </div>

                            <div className="dp-group">
                                <label>Pincode <span className="req">*</span></label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    placeholder="500081"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: DELIVERY INFORMATION */}
                    <div className="dp-card">
                        <div className="dp-card-header">
                            <div className="dp-step-badge">3</div>
                            <div>
                                <h2>Delivery Information</h2>
                                <p>Vehicle and licensing details for delivering orders</p>
                            </div>
                        </div>

                        <div className="dp-group full-width" style={{ marginBottom: "16px" }}>
                            <label>Vehicle Type <span className="req">*</span></label>
                            <div className="vehicle-selector-grid">
                                {VEHICLE_OPTIONS.map((v) => (
                                    <button
                                        key={v.type}
                                        type="button"
                                        className={`vehicle-card-btn ${formData.vehicleType === v.type ? "active" : ""}`}
                                        onClick={() => handleVehicleSelect(v.type)}
                                    >
                                        <span className="v-icon">{v.icon}</span>
                                        <span className="v-title">{v.type}</span>
                                        <span className="v-desc">{v.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="dp-grid-2">
                            <div className="dp-group">
                                <label>Vehicle Registration Number</label>
                                <input
                                    type="text"
                                    name="vehicleNumber"
                                    value={formData.vehicleNumber}
                                    onChange={handleChange}
                                    placeholder="e.g. TS 09 EA 1234"
                                />
                            </div>

                            <div className="dp-group">
                                <label>Driving License Number</label>
                                <div className="dp-input-wrap">
                                    <FaIdCard className="dp-icon" />
                                    <input
                                        type="text"
                                        name="licenseNumber"
                                        value={formData.licenseNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. TS-142021000987"
                                    />
                                </div>
                            </div>

                            <div className="dp-group">
                                <label>Delivery Experience</label>
                                <select
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    className="dp-select"
                                >
                                    <option value="Fresher">Fresher (New to Delivery)</option>
                                    <option value="0-1 years">0–1 Years</option>
                                    <option value="1-3 years">1–3 Years</option>
                                    <option value="3+ years">3+ Years Experienced</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: DOCUMENTS */}
                    <div className="dp-card">
                        <div className="dp-card-header">
                            <div className="dp-step-badge">4</div>
                            <div>
                                <h2>Documents & Verification</h2>
                                <p>Upload document references or IDs for quick admin verification</p>
                            </div>
                        </div>

                        <div className="dp-grid-2">
                            <div className="dp-group">
                                <label>Driving License Document Link / Ref</label>
                                <div className="dp-input-wrap">
                                    <FaFileContract className="dp-icon" />
                                    <input
                                        type="text"
                                        name="drivingLicenseDocument"
                                        value={formData.drivingLicenseDocument}
                                        onChange={handleChange}
                                        placeholder="DL-Document-URL or ID Proof"
                                    />
                                </div>
                            </div>

                            <div className="dp-group">
                                <label>Vehicle RC Document Link / Ref</label>
                                <div className="dp-input-wrap">
                                    <FaFileContract className="dp-icon" />
                                    <input
                                        type="text"
                                        name="vehicleRcDocument"
                                        value={formData.vehicleRcDocument}
                                        onChange={handleChange}
                                        placeholder="RC-Document-URL or Reg Copy"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: AGREEMENT & SUBMIT */}
                    <div className="dp-submit-card">
                        <label className="dp-agree-label">
                            <input
                                type="checkbox"
                                name="agreed"
                                checked={formData.agreed}
                                onChange={handleChange}
                                required
                            />
                            <span>
                                I agree to the <strong>FoodExpress Delivery Partner Terms and Conditions</strong> and confirm that all details and documents provided are genuine.
                            </span>
                        </label>

                        <button type="submit" className="btn-submit-dp" disabled={loading}>
                            {loading ? (
                                "Submitting Application..."
                            ) : (
                                <>
                                    Submit Application <FaArrowRight />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default DeliveryPartnerApplication;
