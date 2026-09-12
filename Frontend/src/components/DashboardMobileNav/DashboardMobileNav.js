import React, { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./DashboardMobileNav.css";

import {
  FaHome,
  FaSearch,
  FaReceipt,
  FaShoppingBag,
  FaUser
} from "react-icons/fa";

const DashboardMobileNav = () => {
  const { getCartCount } = useContext(StoreContext);
  const location = useLocation();
  const cartCount = getCartCount ? getCartCount() : 0;

  return (
    <nav className="foodexpress-mobile-bottom-nav" aria-label="Mobile Navigation">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `mobile-nav-item ${isActive || location.pathname === "/" ? "active" : ""}`
        }
      >
        <FaHome className="nav-icon" />
        <span className="nav-label">Home</span>
      </NavLink>

      <NavLink
        to="/browse-food"
        className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
      >
        <FaSearch className="nav-icon" />
        <span className="nav-label">Explore</span>
      </NavLink>

      <NavLink
        to="/my-orders"
        className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
      >
        <FaReceipt className="nav-icon" />
        <span className="nav-label">Orders</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
      >
        <div className="cart-nav-wrapper">
          <FaShoppingBag className="nav-icon" />
          {cartCount > 0 && <span className="cart-nav-badge">{cartCount}</span>}
        </div>
        <span className="nav-label">Cart</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `mobile-nav-item ${isActive ? "active" : ""}`}
      >
        <FaUser className="nav-icon" />
        <span className="nav-label">Account</span>
      </NavLink>
    </nav>
  );
};

export default DashboardMobileNav;
