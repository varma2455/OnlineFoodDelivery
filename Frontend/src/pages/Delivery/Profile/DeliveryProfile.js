import React, { useState, useEffect, useCallback, useContext } from "react";
import { StoreContext } from "../../../context/StoreContext";
import { deliveryPartnerAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./DeliveryProfile.css";
import {
    FaUserCircle,
    FaMotorcycle,
    FaIdCard,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaCheckCircle,
    FaShieldAlt,
    FaStar,
    FaSave,
    FaSyncAlt
} from "react-icons/fa";

const DeliveryProfile = () => {
    const { showToast } = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [application, setApplication] = useState(null);

    const [formData, setFormData] = useState({
        phone: "",
        emergencyContact: "",
        city: "",
        address: ""
    });

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await deliveryPartnerAPI.getProfile();
            setProfile(data.partner);
            setApplication(data.application || null);
            setFormData({
                phone: data.partner?.phone || "",
                emergencyContact: data.partner?.emergencyContact || "",
                city: data.partner?.city || "",
                address: data.partner?.address || ""
            });
        } catch (err) {
            console.error("Failed to load delivery profile:", err);
            showToast(err.message || "Failed to load profile", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const { data } = await deliveryPartnerAPI.updateProfile(formData);
            showToast(data.message || "Profile updated successfully", "success");
            fetchProfile();
        } catch (err) {
            showToast(err.message || "Failed to save profile changes", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dp-profile-loader">
                <Loader />
            </div>
        );
    }

    return (
        <div className="dp-profile-page">
            {/* Header */}
            <div className="dp-profile-header">
                <div>
                    <h2>Rider Profile & Credentials</h2>
                    <p>Verified delivery partner credentials, vehicle specifications, and operational contact</p>
                </div>
                <button className="btn-profile-refresh" onClick={fetchProfile}>
                    <FaSyncAlt /> Refresh
                </button>
            </div>

            {/* Profile Overview Banner */}
            <div className="profile-banner-card">
                <div className="banner-left">
                    <div className="avatar-wrap">
                        <FaUserCircle />
                    </div>
                    <div className="rider-main-info">
                        <h3>{profile?.name || "Delivery Partner"}</h3>
                        <div className="badge-row">
                            <span className="app-id-tag">ID: {profile?.applicationId || "DP-VERIFIED"}</span>
                            <span className="status-verified-tag">
                                <FaCheckCircle /> Verified Partner
                            </span>
                            <span className="rating-tag">
                                <FaStar color="#f59e0b" /> {profile?.rating?.toFixed(1) || "5.0"} Rating
                            </span>
                        </div>
                    </div>
                </div>

                <div className="banner-stats">
                    <div className="stat-box">
                        <span className="stat-label">Total Deliveries</span>
                        <span className="stat-value">{profile?.totalDeliveries || 0}</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">Lifetime Earnings</span>
                        <span className="stat-value green">₹{profile?.totalEarnings || 0}</span>
                    </div>
                </div>
            </div>

            <div className="profile-grid-cols">
                {/* Left Column: Verified Credentials */}
                <div className="profile-col">
                    {/* Vehicle Details */}
                    <div className="info-card">
                        <div className="info-card-header">
                            <FaMotorcycle className="section-icon" />
                            <h4>Vehicle Specifications</h4>
                        </div>
                        <div className="info-rows">
                            <div className="info-row">
                                <span className="label">Vehicle Type</span>
                                <span className="value">{profile?.vehicleType || application?.vehicleType || "Motorcycle / Bike"}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Vehicle Model</span>
                                <span className="value">{application?.vehicleModel || "Verified 2-Wheeler"}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Registration / Plate No.</span>
                                <span className="value bold">{profile?.vehicleNumber || application?.vehicleNumber || "Verified"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Driving License & Identity */}
                    <div className="info-card">
                        <div className="info-card-header">
                            <FaIdCard className="section-icon" />
                            <h4>License & Background Verification</h4>
                        </div>
                        <div className="info-rows">
                            <div className="info-row">
                                <span className="label">Driving License Number</span>
                                <span className="value bold">{profile?.licenseNumber || application?.licenseNumber || "Verified DL"}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Aadhaar Verification</span>
                                <span className="value green">
                                    <FaCheckCircle /> Verified by Admin
                                </span>
                            </div>
                            <div className="info-row">
                                <span className="label">Background Check</span>
                                <span className="value green">
                                    <FaShieldAlt /> Clear
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Editable Contact & Operations */}
                <div className="profile-col">
                    <div className="info-card">
                        <div className="info-card-header">
                            <FaMapMarkerAlt className="section-icon" />
                            <h4>Operational Contact Details</h4>
                        </div>

                        <form onSubmit={handleSave} className="profile-form">
                            <div className="form-group">
                                <label>
                                    <FaEnvelope /> Registered Email Address
                                </label>
                                <input
                                    type="text"
                                    value={profile?.email || ""}
                                    disabled
                                    className="input-disabled"
                                />
                                <small className="field-hint">Registered during partner onboarding</small>
                            </div>

                            <div className="form-group">
                                <label>
                                    <FaPhoneAlt /> Active Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="e.g. +91 9876543210"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <FaPhoneAlt /> Emergency Contact Number
                                </label>
                                <input
                                    type="tel"
                                    name="emergencyContact"
                                    value={formData.emergencyContact}
                                    onChange={handleInputChange}
                                    placeholder="Family or Guardian Contact"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <FaMapMarkerAlt /> Operational City / Delivery Hub
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Hyderabad"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-save-profile" disabled={saving}>
                                {saving ? (
                                    "Saving..."
                                ) : (
                                    <>
                                        <FaSave /> Save Contact Updates
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryProfile;
