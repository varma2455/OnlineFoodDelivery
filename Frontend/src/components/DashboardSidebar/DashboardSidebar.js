import React, { useContext, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./DashboardSidebar.css";

import {
  FaUser,
  FaHome,
  FaUtensils,
  FaClipboardList,
  FaShoppingCart,
  FaHeart,
  FaWallet,
  FaMapMarkerAlt,
  FaGift,
  FaCog,
  FaSignOutAlt,
  FaHeadset,
  FaPercent,
  FaTimes
} from "react-icons/fa";

const DashboardSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { mobileSidebarOpen, closeMobileSidebar, logout } = useContext(StoreContext);

    // Auto-close mobile drawer when location changes
    useEffect(() => {
        if (closeMobileSidebar) {
            closeMobileSidebar();
        }
    }, [location.pathname, closeMobileSidebar]);

    const handleLinkClick = () => {
        if (closeMobileSidebar) {
            closeMobileSidebar();
        }
    };

    const handleLogout = () => {
        if (closeMobileSidebar) {
            closeMobileSidebar();
        }
        if (logout) {
            logout();
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        navigate("/login");
    };

    return (
        <>
            {/* Backdrop overlay for mobile drawer */}
            {mobileSidebarOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={closeMobileSidebar}
                    aria-label="Close navigation sidebar"
                />
            )}

            <aside className={`dashboard-sidebar sidebar ${mobileSidebarOpen ? "active" : ""}`}>
                {/* Mobile Drawer Close Button */}
                <button
                    type="button"
                    className="sidebar-close-btn"
                    onClick={closeMobileSidebar}
                    aria-label="Close menu"
                >
                    <FaTimes />
                </button>

                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="logo-circle">
                        🍔
                    </div>

                    <div>
                        <h2>FoodExpress</h2>
                        <p>FOOD DELIVERY</p>
                    </div>
                </div>

                {/* Menu */}
                <ul className="sidebar-menu">
                    <li>
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => (isActive ? "sidebar-item active" : "sidebar-item")}
                            onClick={handleLinkClick}
                        >
                            <FaHome />
                            <span>Dashboard</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/browse-food"
                            className={({ isActive }) =>
                                !location.pathname.startsWith("/my-orders") &&
                                !location.pathname.startsWith("/orders") &&
                                (isActive ||
                                    location.pathname === "/browse-food" ||
                                    location.pathname === "/biryani" ||
                                    location.pathname.startsWith("/category/") ||
                                    location.pathname.startsWith("/order-burger") ||
                                    location.pathname.startsWith("/order-pizza") ||
                                    location.pathname.startsWith("/order-fastfood") ||
                                    location.pathname.startsWith("/order-drink") ||
                                    location.pathname.startsWith("/order-dessert") ||
                                    location.pathname.startsWith("/order-noodles") ||
                                    location.pathname.startsWith("/order-salads") ||
                                    location.pathname.startsWith("/order-biryani"))
                                    ? "sidebar-item active"
                                    : "sidebar-item"
                            }
                            onClick={handleLinkClick}
                        >
                            <FaUtensils />
                            <span>Browse Food</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/my-orders"
                            className={({ isActive }) =>
                                isActive ||
                                location.pathname.startsWith("/my-orders") ||
                                location.pathname.startsWith("/orders")
                                    ? "sidebar-item active"
                                    : "sidebar-item"
                            }
                            onClick={handleLinkClick}
                        >
                            <FaClipboardList />
                            <span>My Orders</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/cart"
                            className={({ isActive }) => (isActive ? "sidebar-item active" : "sidebar-item")}
                            onClick={handleLinkClick}
                        >
                            <FaShoppingCart />
                            <span>Cart</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) => (isActive ? "sidebar-item active" : "sidebar-item")}
                            onClick={handleLinkClick}
                        >
                            <FaUser />
                            <span>Profile</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/offers"
                            className={({ isActive }) => (isActive ? "sidebar-item active" : "sidebar-item")}
                            onClick={handleLinkClick}
                        >
                            <FaPercent />
                            <span>Offers</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/rewards"
                            className={({ isActive }) => (isActive ? "sidebar-item active" : "sidebar-item")}
                            onClick={handleLinkClick}
                        >
                            <FaGift />
                            <span>Rewards</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/support"
                            className={({ isActive }) => (isActive ? "sidebar-item active" : "sidebar-item")}
                            onClick={handleLinkClick}
                        >
                            <FaHeadset />
                            <span>Support</span>
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/settings"
                            className={({ isActive }) => (isActive ? "sidebar-item active" : "sidebar-item")}
                            onClick={handleLinkClick}
                        >
                            <FaCog />
                            <span>Settings</span>
                        </NavLink>
                    </li>
                </ul>

                {/* Bottom Card */}
                <div className="premium-card">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
                        alt="Delivery"
                    />

                    <h3>Premium Membership</h3>

                    <p>
                        Get unlimited free delivery and exclusive discounts.
                    </p>

                    <button
                        type="button"
                        onClick={() => {
                            handleLinkClick();
                            navigate("/membership");
                        }}
                    >
                        Upgrade Now
                    </button>
                </div>

                {/* Logout */}
                <div className="logout-section">
                    <button className="logout-btn" onClick={handleLogout}>
                        <FaSignOutAlt />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;