import React from "react";
import "./DashboardNavbar.css";

import {
  FaSearch,
  FaBell,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaSun,
  FaChevronDown
} from "react-icons/fa";

const DashboardNavbar = () => {
  return (
    <header className="dashboard-navbar">

      {/* Left Side */}
      <div className="navbar-left">

        <div className="welcome-text">
          <h2>Welcome Back 👋</h2>
          <p>Discover delicious food around you</p>
        </div>

      </div>

      {/* Center Search */}
      <div className="navbar-search">

        <FaSearch className="search-icon" />

        <input
          type="text"
          placeholder="Search food, restaurants..."
        />

      </div>

      {/* Right Side */}
      <div className="navbar-right">

        {/* Location */}
        <div className="location-box">
          <FaMapMarkerAlt />
          <span>Vijayawada</span>
        </div>

        {/* Theme */}
        <div className="nav-icon">
          <FaSun />
        </div>

        {/* Notifications */}
        <div className="nav-icon notification">

          <FaBell />

          <span className="count">4</span>

        </div>

        {/* Cart */}
        <div className="nav-icon notification">

          <FaShoppingCart />

          <span className="count">3</span>

        </div>

        {/* Profile */}
        <div className="profile-box">

          <img
            src="https://i.pravatar.cc/150?img=12"
            alt="profile"
          />

          <div className="profile-info">

            <h4>Yeswanth</h4>

            <p>Premium Member</p>

          </div>

          <FaChevronDown />

        </div>

      </div>

    </header>
  );
};

export default DashboardNavbar;