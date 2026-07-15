import React from "react";
import { NavLink } from "react-router-dom";
import "./DashboardSidebar.css";

import {
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
  FaPercent
} from "react-icons/fa";

const DashboardSidebar = () => {

    return (

        <aside className="dashboard-sidebar">

            {/* Logo */}

            <div className="sidebar-logo">

                <div className="logo-circle">
                    🍔
                </div>

                <div>

                    <h2>FoodExpress</h2>

                    <p>Food Delivery</p>

                </div>

            </div>

            {/* Menu */}

            <ul className="sidebar-menu">

                <li>

                    <NavLink to="/dashboard" className="active-link">

                        <FaHome />

                        <span>Dashboard</span>

                    </NavLink>

                </li>

                <li>

                    <NavLink to="/menu">

                        <FaUtensils />

                        <span>Browse Food</span>

                    </NavLink>

                </li>

                <li>

                    <NavLink to="/orders">

                        <FaClipboardList />

                        <span>My Orders</span>

                    </NavLink>

                </li>

                <li>

                    <NavLink to="/cart">

                        <FaShoppingCart />

                        <span>Cart</span>

                    </NavLink>

                </li>

                <li>

                    <NavLink to="/wishlist">

                        <FaHeart />

                        <span>Wishlist</span>

                    </NavLink>

                </li>

                <li>

                    <NavLink to="/wallet">

                        <FaWallet />

                        <span>Wallet</span>

                    </NavLink>

                </li>

                <li>

                    <NavLink to="/address">

                        <FaMapMarkerAlt />

                        <span>Saved Address</span>

                    </NavLink>

                </li>

                <li>

                    <NavLink to="/offers">

                        <FaPercent />

                        <span>Offers</span>

                    </NavLink>

                </li>

                <li>

                    <NavLink to="/rewards">

                        <FaGift />

                        <span>Rewards</span>

                    </NavLink>

                </li>

                <li>

                    <NavLink to="/support">

                        <FaHeadset />

                        <span>Support</span>

                    </NavLink>

                </li>

                <li>

                    <NavLink to="/settings">

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

                <button>
                    Upgrade Now
                </button>

            </div>

            {/* Logout */}

            <div className="logout-section">

                <button className="logout-btn">

                    <FaSignOutAlt />

                    Logout

                </button>

            </div>

        </aside>

    );

};

export default DashboardSidebar;