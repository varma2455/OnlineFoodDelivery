import React, { useState, useEffect, useCallback, useContext } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { deliveryPartnerAPI } from "../../services/api";
import Loader from "../Loader/Loader";
import "./DeliveryLayout.css";
import {
    FaMotorcycle,
    FaBoxOpen,
    FaClipboardList,
    FaCoins,
    FaWallet,
    FaUserCircle,
    FaSignOutAlt,
    FaCircle,
    FaBars,
    FaTimes
} from "react-icons/fa";

const DeliveryLayout = () => {
    const navigate = useNavigate();
    const { token, user, logout, showToast } = useContext(StoreContext);

    const [partner, setPartner] = useState(null);
    const [loading, setLoading] = useState(true);
    const [availability, setAvailability] = useState("offline");
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const fetchPartnerProfile = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await deliveryPartnerAPI.getMe();
            if (data.deliveryPartner) {
                setPartner(data.deliveryPartner);
                setAvailability(data.deliveryPartner.availabilityStatus || "offline");

                if (data.deliveryPartner.status === "suspended") {
                    showToast("Your delivery partner account has been suspended.", "error");
                    navigate("/delivery/application-status");
                }
            }
        } catch (err) {
            console.error("Failed to load delivery partner profile:", err);
            if (err.response?.status === 404) {
                navigate("/delivery/partner-application");
            }
        } finally {
            setLoading(false);
        }
    }, [navigate, showToast]);

    useEffect(() => {
        if (token) {
            fetchPartnerProfile();
        } else {
            navigate("/delivery/login");
        }
    }, [token, fetchPartnerProfile, navigate]);

    const handleToggleAvailability = async (newStatus) => {
        try {
            setUpdatingStatus(true);
            const { data } = await deliveryPartnerAPI.updateAvailability(newStatus);
            setAvailability(data.availabilityStatus);
            showToast(`Status updated to ${newStatus.toUpperCase()}`, "success");
        } catch (err) {
            showToast(err.message || "Failed to update availability", "error");
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return (
            <div className="delivery-loading-screen">
                <Loader />
                <p style={{ marginTop: "14px", color: "#64748b" }}>Loading Delivery Partner Portal...</p>
            </div>
        );
    }

    return (
        <div className="delivery-portal-layout">
            {/* Top Navigation Bar */}
            <header className="delivery-top-nav">
                <div className="delivery-nav-container">
                    {/* Brand */}
                    <div className="delivery-brand-section">
                        <Link to="/delivery/dashboard" className="delivery-logo-link">
                            <span className="logo-icon">🍔</span>
                            <span className="logo-title">FoodExpress</span>
                            <span className="rider-pill">RIDER</span>
                        </Link>
                    </div>

                    {/* Online / Offline / Busy Selector */}
                    <div className="availability-selector-wrap">
                        <div className="availability-btn-group">
                            <button
                                type="button"
                                className={`btn-avail online ${availability === "online" ? "active" : ""}`}
                                onClick={() => handleToggleAvailability("online")}
                                disabled={updatingStatus}
                            >
                                <FaCircle className="status-dot green" /> Online
                            </button>
                            <button
                                type="button"
                                className={`btn-avail busy ${availability === "busy" ? "active" : ""}`}
                                onClick={() => handleToggleAvailability("busy")}
                                disabled={updatingStatus}
                            >
                                <FaCircle className="status-dot yellow" /> Busy
                            </button>
                            <button
                                type="button"
                                className={`btn-avail offline ${availability === "offline" ? "active" : ""}`}
                                onClick={() => handleToggleAvailability("offline")}
                                disabled={updatingStatus}
                            >
                                <FaCircle className="status-dot gray" /> Offline
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="btn-mobile-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>

                    {/* Desktop Right Actions */}
                    <div className="delivery-user-actions">
                        <div className="rider-identity">
                            <span className="rider-name">{partner?.name || user?.fullName}</span>
                            <span className="rider-vehicle">{partner?.vehicleType || "Fleet"} • ⭐ {partner?.rating || "5.0"}</span>
                        </div>

                        <button
                            className="btn-rider-logout"
                            title="Sign Out"
                            onClick={() => {
                                logout();
                                navigate("/delivery/login");
                            }}
                        >
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>

                {/* Main Navigation Tabs */}
                <nav className={`delivery-nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
                    <NavLink
                        to="/delivery/dashboard"
                        end
                        className={({ isActive }) => `del-nav-item ${isActive ? "active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <FaMotorcycle /> Dashboard
                    </NavLink>
                    <NavLink
                        to="/delivery/orders"
                        className={({ isActive }) => `del-nav-item ${isActive ? "active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <FaBoxOpen /> Available Orders
                    </NavLink>
                    <NavLink
                        to="/delivery/my-deliveries"
                        className={({ isActive }) => `del-nav-item ${isActive ? "active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <FaClipboardList /> My Deliveries
                    </NavLink>
                    <NavLink
                        to="/delivery/earnings"
                        className={({ isActive }) => `del-nav-item ${isActive ? "active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <FaCoins /> Earnings
                    </NavLink>
                    <NavLink
                        to="/delivery/wallet"
                        className={({ isActive }) => `del-nav-item ${isActive ? "active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <FaWallet /> Wallet
                    </NavLink>
                    <NavLink
                        to="/delivery/profile"
                        className={({ isActive }) => `del-nav-item ${isActive ? "active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <FaUserCircle /> Profile
                    </NavLink>
                </nav>
            </header>

            {/* Page Content Outlet */}
            <main className="delivery-portal-content">
                <Outlet context={{ partner, setPartner, availability, setAvailability, fetchPartnerProfile }} />
            </main>
        </div>
    );
};

export default DeliveryLayout;
