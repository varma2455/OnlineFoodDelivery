import React, { useContext, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import FoodExpressLogo from "../FoodExpressLogo";
import "./RestaurantNavbar.css";
import {
    FaBars,
    FaBell,
    FaUser,
    FaCheckCircle,
    FaClock,
    FaBan,
    FaTimesCircle
} from "react-icons/fa";

/**
 * Restaurant Owner Dashboard Navbar
 * Strict content per specification:
 * FoodExpress Logo | Restaurant Name | Restaurant Status | Notifications | Owner Profile
 * Zero customer links (No Browse Food, No Cart, No Wishlist, No Customer Orders).
 */
const RestaurantNavbar = ({ restaurant, toggleMobileSidebar }) => {
    const { user, showToast } = useContext(StoreContext);
    const [showNotifMenu, setShowNotifMenu] = useState(false);

    const restaurantName = restaurant?.name || "Spice Kitchen";
    const rawStatus = restaurant?.status || "approved";
    const isOpen = restaurant?.isOpen !== false;

    // Determine status badge config
    let statusConfig = {
        label: "Approved",
        icon: FaCheckCircle,
        dotColor: "#10b981",
        badgeClass: "badge-approved",
        emoji: "🟢"
    };

    if (rawStatus === "pending") {
        statusConfig = {
            label: "Under Review",
            icon: FaClock,
            dotColor: "#f59e0b",
            badgeClass: "badge-review",
            emoji: "🟡"
        };
    } else if (rawStatus === "suspended") {
        statusConfig = {
            label: "Suspended",
            icon: FaBan,
            dotColor: "#ef4444",
            badgeClass: "badge-suspended",
            emoji: "🔴"
        };
    } else if (rawStatus === "closed" || !isOpen) {
        statusConfig = {
            label: "Closed",
            icon: FaTimesCircle,
            dotColor: "#94a3b8",
            badgeClass: "badge-closed",
            emoji: "⚪"
        };
    }

    const ownerName = user?.fullName || "Restaurant Owner";
    const ownerInitials = user?.fullName
        ? user.fullName
              .split(" ")
              .filter(Boolean)
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
        : "RO";

    const handleNotifClick = () => {
        setShowNotifMenu((prev) => !prev);
    };

    return (
        <header className="rest-navbar-shell">
            <div className="rest-navbar-inner">
                {/* Left Cluster: Hamburger (Mobile) + Logo + Divider + Restaurant Name + Divider + Status */}
                <div className="rest-nav-left">
                    <button
                        type="button"
                        className="btn-rest-hamburger"
                        onClick={toggleMobileSidebar}
                        aria-label="Toggle navigation drawer"
                    >
                        <FaBars />
                    </button>

                    {/* Logo (Never wraps) */}
                    <div className="rest-nav-logo-box">
                        <FoodExpressLogo variant="navbar" to="/restaurant/dashboard" />
                    </div>

                    <span className="rest-nav-divider">|</span>

                    {/* Restaurant Name */}
                    <div className="rest-nav-store-name" title={restaurantName}>
                        {restaurantName}
                    </div>

                    <span className="rest-nav-divider">|</span>

                    {/* Restaurant Status Badge */}
                    <div className={`rest-status-badge ${statusConfig.badgeClass}`}>
                        <span className="rest-status-emoji">{statusConfig.emoji}</span>
                        <span className="rest-status-text">{statusConfig.label}</span>
                    </div>
                </div>

                {/* Right Cluster: Notifications + Divider + Owner Profile */}
                <div className="rest-nav-right">
                    {/* Notifications Button */}
                    <div className="rest-notif-wrapper">
                        <button
                            type="button"
                            className="btn-rest-notif"
                            onClick={handleNotifClick}
                            title="Restaurant Notifications"
                            aria-label="Notifications"
                        >
                            <FaBell />
                            <span className="rest-notif-ping"></span>
                        </button>

                        {showNotifMenu && (
                            <div className="rest-notif-dropdown">
                                <div className="rest-notif-header">
                                    <span>Notifications</span>
                                    <span className="notif-count-badge">2 New</span>
                                </div>
                                <div className="rest-notif-list">
                                    <div
                                        className="rest-notif-item unread"
                                        onClick={() => {
                                            setShowNotifMenu(false);
                                            if (showToast) showToast("Kitchen is ready to receive orders! 🍳", "info");
                                        }}
                                    >
                                        <div className="notif-dot-icon">🔔</div>
                                        <div className="notif-body">
                                            <p className="notif-text">Daily kitchen summary initialized.</p>
                                            <span className="notif-time">Just now</span>
                                        </div>
                                    </div>
                                    <div
                                        className="rest-notif-item"
                                        onClick={() => {
                                            setShowNotifMenu(false);
                                            if (showToast) showToast("Store status is verified. All systems active.", "success");
                                        }}
                                    >
                                        <div className="notif-dot-icon">✅</div>
                                        <div className="notif-body">
                                            <p className="notif-text">Menu & store status verified on FoodExpress.</p>
                                            <span className="notif-time">1 hr ago</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <span className="rest-nav-divider">|</span>

                    {/* Owner Profile */}
                    <div className="rest-owner-profile-pill" title={ownerName}>
                        <div className="rest-owner-avatar" aria-hidden="true">
                            {ownerInitials || <FaUser />}
                        </div>
                        <span className="rest-owner-name">
                            <span className="owner-prefix">👤</span> {ownerName}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default RestaurantNavbar;
