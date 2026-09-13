import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./RestaurantNavbar.css";
import {
    FaBars,
    FaStore,
    FaCircle,
    FaExternalLinkAlt,
    FaUserCircle
} from "react-icons/fa";

const RestaurantNavbar = ({ restaurant, toggleMobileSidebar }) => {
    const { user } = useContext(StoreContext);

    const restaurantName = restaurant?.name || "Kitchen Portal";
    const status = restaurant?.status || "approved";
    const isLive = status === "approved";

    const ownerInitials = user?.fullName
        ? user.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
        : "RP";

    return (
        <header className="rest-navbar">
            <div className="rest-navbar-left">
                <button
                    type="button"
                    className="btn-rest-hamburger"
                    onClick={toggleMobileSidebar}
                    aria-label="Toggle navigation drawer"
                >
                    <FaBars />
                </button>

                <div className="rest-store-info">
                    <h2 className="rest-store-name">{restaurantName}</h2>
                    <span className="rest-live-badge">
                        <FaCircle size={8} color={isLive ? "#10b981" : "#eab308"} />
                        {isLive ? "Live Store" : status.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="rest-navbar-right">
                <Link to="/" className="btn-view-customer-store" target="_blank" rel="noreferrer">
                    <FaExternalLinkAlt size={12} />
                    <span>Customer App</span>
                </Link>

                <div className="rest-owner-profile">
                    <div className="rest-owner-avatar">
                        {ownerInitials || <FaUserCircle />}
                    </div>
                    <div className="rest-owner-meta">
                        <span className="rest-owner-name">
                            {user?.fullName || "Restaurant Manager"}
                        </span>
                        <span className="rest-owner-role">Partner Owner</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default RestaurantNavbar;
