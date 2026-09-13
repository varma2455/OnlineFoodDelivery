import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./RestaurantSidebar.css";
import {
    FaStore,
    FaTachometerAlt,
    FaClipboardList,
    FaUtensils,
    FaBoxes,
    FaChartBar,
    FaStar,
    FaUserCircle,
    FaCog,
    FaSignOutAlt,
    FaTimes
} from "react-icons/fa";

const navItems = [
    { name: "Dashboard", path: "/restaurant/dashboard", icon: FaTachometerAlt },
    { name: "Orders", path: "/restaurant/orders", icon: FaClipboardList },
    { name: "Menu", path: "/restaurant/menu", icon: FaUtensils },
    { name: "Inventory", path: "/restaurant/inventory", icon: FaBoxes },
    { name: "Analytics", path: "/restaurant/analytics", icon: FaChartBar },
    { name: "Reviews", path: "/restaurant/reviews", icon: FaStar },
    { name: "Restaurant Profile", path: "/restaurant/profile", icon: FaUserCircle },
    { name: "Settings", path: "/restaurant/settings", icon: FaCog }
];

const RestaurantSidebar = ({ mobileOpen, closeMobileSidebar }) => {
    const { logout } = useContext(StoreContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/restaurant/login");
    };

    return (
        <>
            <div
                className={`rest-sidebar-backdrop ${mobileOpen ? "mobile-open" : ""}`}
                onClick={closeMobileSidebar}
            />

            <aside className={`rest-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
                {/* Brand Header */}
                <div className="rest-sidebar-brand">
                    <div className="rest-brand-icon">
                        <FaStore />
                    </div>
                    <div style={{ flex: 1 }}>
                        <span className="rest-brand-text">FoodExpress</span>
                        <span className="rest-brand-sub">KITCHEN PARTNER</span>
                    </div>
                    {mobileOpen && (
                        <button
                            type="button"
                            onClick={closeMobileSidebar}
                            style={{
                                background: "none",
                                border: "none",
                                fontSize: "18px",
                                color: "#64748b",
                                cursor: "pointer",
                                padding: "4px"
                            }}
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className="rest-nav-menu">
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/restaurant/dashboard"}
                                className={({ isActive }) =>
                                    `rest-nav-link ${isActive ? "active" : ""}`
                                }
                                onClick={() => {
                                    if (mobileOpen) closeMobileSidebar();
                                }}
                            >
                                <IconComponent size={16} />
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Sidebar Footer Logout */}
                <div className="rest-sidebar-footer">
                    <button
                        type="button"
                        className="btn-rest-sidebar-logout"
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt /> Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
};

export default RestaurantSidebar;
