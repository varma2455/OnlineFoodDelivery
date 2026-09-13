import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import FoodExpressLogo from "../FoodExpressLogo";
import "./RestaurantSidebar.css";
import {
    FaHome,
    FaClipboardList,
    FaUtensils,
    FaBoxes,
    FaChartBar,
    FaStar,
    FaStore,
    FaCog,
    FaSignOutAlt,
    FaTimes
} from "react-icons/fa";

const navItems = [
    { name: "Dashboard", path: "/restaurant/dashboard", icon: FaHome },
    { name: "Orders", path: "/restaurant/orders", icon: FaClipboardList },
    { name: "Menu", path: "/restaurant/menu", icon: FaUtensils },
    { name: "Inventory", path: "/restaurant/inventory", icon: FaBoxes },
    { name: "Analytics", path: "/restaurant/analytics", icon: FaChartBar },
    { name: "Reviews", path: "/restaurant/reviews", icon: FaStar },
    { name: "Restaurant Profile", path: "/restaurant/profile", icon: FaStore },
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
            {/* Mobile backdrop drawer overlay */}
            <div
                className={`rest-sidebar-backdrop ${mobileOpen ? "mobile-open" : ""}`}
                onClick={closeMobileSidebar}
                aria-hidden="true"
            />

            <aside className={`sidebar rest-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
                {/* Top Logo Area with FoodExpress Orange Branding */}
                <div className="rest-sidebar-header">
                    <FoodExpressLogo variant="sidebar" to="/restaurant/dashboard" />

                    {mobileOpen && (
                        <button
                            type="button"
                            className="btn-rest-sidebar-close"
                            onClick={closeMobileSidebar}
                            aria-label="Close navigation drawer"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className="rest-sidebar-menu">
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/restaurant/dashboard"}
                                className={({ isActive }) =>
                                    `rest-sidebar-item ${isActive ? "active" : ""}`
                                }
                                onClick={() => {
                                    if (mobileOpen && closeMobileSidebar) closeMobileSidebar();
                                }}
                            >
                                <IconComponent className="rest-item-icon" />
                                <span className="rest-item-label">{item.name}</span>
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
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default RestaurantSidebar;
