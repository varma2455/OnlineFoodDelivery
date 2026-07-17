import React, { useEffect, useState } from "react";
import axios from "axios";

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


  const [navbarData, setNavbarData] = useState({
    name: "",
    profileImage: "",
    membership: "",
    location: "",
    notifications: 0,
    cartItems: 0
});

const [loading, setLoading] = useState(true);



useEffect(() => {

  const fetchNavbar = async () => {

      try {

        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No JWT token found.");
          setLoading(false);
          return;
        }


        const response = await axios.get(
          "https://onlinefooddelivery-9g60.onrender.com/api/dashboard/navbar",
              {
                  headers: {
                      Authorization: `Bearer ${token}`
                  }
              }
          );

          setNavbarData(response.data);

      } catch (error) {

        console.error( "Navbar Error:",error.response?.data || error.message );

      } finally {

          setLoading(false);

      }

  };

  fetchNavbar();

}, []);



if (loading) {

  return <div>Loading...</div>;

}



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
          <span>{navbarData.location || "Unknown Location"}</span>
        </div>

        {/* Theme */}
        <div className="nav-icon" onClick={() => { document.body.classList.toggle("dark-mode"); }}>
          <FaSun />
        </div>

        {/* Notifications */}
        <div className="nav-icon notification">
          <FaBell />
          <span className="count">{navbarData.notifications}</span>
        </div>

        {/* Cart */}
        <div className="nav-icon notification">
          <FaShoppingCart />
          <span className="count">{navbarData.cartItems}</span>
        </div>

        {/* Profile */}
        <div className="profile-box">

        <img src={navbarData.profileImage || "https://i.pravatar.cc/150?img=12"} alt={navbarData.name || "Profile"}/>

          <div className="profile-info">

          <h4>{navbarData.name || "Guest User"}</h4>

          <p>{navbarData.membership || "Basic Member"}</p>

          </div>
          <FaChevronDown />
        </div>

      </div>

    </header>
  );
};

export default DashboardNavbar;