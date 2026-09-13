import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { StoreContext } from "../../context/StoreContext";
import FoodExpressLogo from "../FoodExpressLogo";
import "./DashboardNavbar.css";

import {
  FaSearch,
  FaBell,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaChevronDown,
  FaUser,
  FaClipboardList,
  FaHeart,
  FaWallet,
  FaGift,
  FaAward,
  FaCog,
  FaSignOutAlt,
  FaHeadset,
  FaPercent,
  FaTimes,
  FaPlus,
  FaCheckCircle,
  FaHistory,
  FaFire
} from "react-icons/fa";

const popularSearches = ["Biryani", "Pizza", "Burger", "Noodles", "Pasta", "Desserts", "Salads", "Drinks"];
const defaultRecentSearches = ["Chicken Biryani", "Farmhouse Pizza", "Crispy Burger"];

const DashboardNavbar = ({ onSearchQuery, onLocationChange }) => {
  const navigate = useNavigate();
  const { user, setUser, getCartCount, showToast } = useContext(StoreContext);

  const getMemberLabel = (member) => {
    const planKey = (typeof member === "object" ? member?.plan : member) || "free";
    if (planKey && planKey.toLowerCase() !== "free" && planKey.toLowerCase() !== "basic") {
      return `${planKey.charAt(0).toUpperCase() + planKey.slice(1)} Member`;
    }
    return "Free Member";
  };

  const [navbarData, setNavbarData] = useState({
    name: user?.fullName || "Customer",
    profileImage: user?.profileImage || "",
    membership: getMemberLabel(user?.membership),
    city: user?.city || "Bhimavaram",
    address: user?.address || "Main Road, Andhra Pradesh",
    notifications: user?.notificationCount || 3,
    cartItems: 0
  });

  // Dropdown & Modal States
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem("foodexpress_recent_searches");
      return saved ? JSON.parse(saved) : defaultRecentSearches;
    } catch {
      return defaultRecentSearches;
    }
  });

  // Selected Location
  const [currentAddress, setCurrentAddress] = useState(() => {
    return user?.address || "Bhimavaram, Andhra Pradesh";
  });
  const [addressLabel, setAddressLabel] = useState("Home");

  // New Address Form
  const [newAddressForm, setNewAddressForm] = useState({
    title: "Home",
    address: "",
    city: "Bhimavaram"
  });

  const locationRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocationDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync user updates
  useEffect(() => {
    if (user) {
      setNavbarData((prev) => ({
        ...prev,
        name: user.fullName || "Customer",
        profileImage: user.profileImage,
        membership: getMemberLabel(user.membership),
        city: user.city || "Bhimavaram",
        address: user.address || "Main Road, Andhra Pradesh"
      }));
      if (user.address) {
        setCurrentAddress(user.address);
      }
    }
  }, [user]);

  // Fetch Navbar telemetry from backend
  useEffect(() => {
    const fetchNavbar = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const API_BASE = API_BASE_URL;
        const response = await axios.get(`${API_BASE}/api/dashboard/navbar`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data) {
          setNavbarData((prev) => ({
            ...prev,
            ...response.data
          }));
        }
      } catch (error) {
        console.warn("Navbar fetch note:", error.message);
      }
    };

    fetchNavbar();
  }, []);

  // Handle Search Execution
  const handleSearchSubmit = (term) => {
    const query = term || searchQuery;
    if (!query.trim()) return;

    // Save to recent searches
    const updated = [query.trim(), ...recentSearches.filter((s) => s !== query.trim())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("foodexpress_recent_searches", JSON.stringify(updated));
    setShowSearchDropdown(false);

    if (onSearchQuery) {
      onSearchQuery(query.trim());
    } else {
      navigate(`/browse-food?search=${encodeURIComponent(query.trim())}`);
    }
  };

  // Handle Add Address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddressForm.address.trim()) {
      showToast("Please enter an address", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const fullAddr = `${newAddressForm.address.trim()}, ${newAddressForm.city}`;
      setCurrentAddress(fullAddr);
      setAddressLabel(newAddressForm.title);

      if (token) {
        const API_BASE = API_BASE_URL;
        await axios.put(
          `${API_BASE}/api/auth/profile`,
          { address: fullAddr, city: newAddressForm.city },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (setUser && user) {
        setUser({ ...user, address: fullAddr, city: newAddressForm.city });
      }

      showToast(`Delivery location set to ${newAddressForm.title}! 📍`, "success");
      setShowAddressModal(false);
      setShowLocationDropdown(false);
      setNewAddressForm({ title: "Home", address: "", city: "Bhimavaram" });

      if (onLocationChange) onLocationChange(fullAddr);
    } catch (err) {
      showToast("Failed to save address: " + err.message, "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (showToast) showToast("Logged out successfully. See you soon! 👋", "info");
    navigate("/login");
  };

  const cartCount = getCartCount ? getCartCount() : navbarData.cartItems;

  return (
    <>
      <header className="dashboard-navbar-advanced">
        {/* Left Side: Brand & Location */}
        <div className="nav-left-cluster">
          <FoodExpressLogo variant="navbar" to="/dashboard" />

          {/* Location Selector */}
          <div className="location-trigger-wrapper" ref={locationRef}>
            <div
              className="location-pill"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              title="Change Delivery Location"
            >
              <div className="loc-marker-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="loc-text-group">
                <span className="loc-tag">
                  Delivering to <strong className="loc-label">{addressLabel}</strong>
                </span>
                <span className="loc-address-text">{currentAddress}</span>
              </div>
              <FaChevronDown className={`loc-chevron ${showLocationDropdown ? "open" : ""}`} />
            </div>

            {/* Location Dropdown */}
            {showLocationDropdown && (
              <div className="location-dropdown-panel animate-fade-in">
                <div className="panel-header">
                  <h4>Choose Delivery Address</h4>
                  <button onClick={() => setShowLocationDropdown(false)}>
                    <FaTimes />
                  </button>
                </div>

                <div className="address-preset-list">
                  <div
                    className={`address-preset-item ${addressLabel === "Home" ? "active" : ""}`}
                    onClick={() => {
                      setAddressLabel("Home");
                      setCurrentAddress(user?.address || "Bhimavaram, Andhra Pradesh");
                      setShowLocationDropdown(false);
                      showToast("Delivery address set to Home 🏠", "success");
                    }}
                  >
                    <div className="preset-icon">🏠</div>
                    <div className="preset-info">
                      <h5>Home</h5>
                      <p>{user?.address || "Bhimavaram, Andhra Pradesh"}</p>
                    </div>
                    {addressLabel === "Home" && <FaCheckCircle className="check-icon" />}
                  </div>

                  <div
                    className={`address-preset-item ${addressLabel === "Work" ? "active" : ""}`}
                    onClick={() => {
                      setAddressLabel("Work");
                      setCurrentAddress("Tech Park, Sector 4, Bhimavaram");
                      setShowLocationDropdown(false);
                      showToast("Delivery address set to Work 💼", "success");
                    }}
                  >
                    <div className="preset-icon">💼</div>
                    <div className="preset-info">
                      <h5>Work</h5>
                      <p>Tech Park, Sector 4, Bhimavaram</p>
                    </div>
                    {addressLabel === "Work" && <FaCheckCircle className="check-icon" />}
                  </div>

                  <div
                    className={`address-preset-item ${addressLabel === "Other" ? "active" : ""}`}
                    onClick={() => {
                      setAddressLabel("Other");
                      setCurrentAddress("Green Meadows, Flat 302, Bhimavaram");
                      setShowLocationDropdown(false);
                      showToast("Delivery address set to Other 📍", "success");
                    }}
                  >
                    <div className="preset-icon">📍</div>
                    <div className="preset-info">
                      <h5>Other</h5>
                      <p>Green Meadows, Flat 302, Bhimavaram</p>
                    </div>
                    {addressLabel === "Other" && <FaCheckCircle className="check-icon" />}
                  </div>
                </div>

                <button className="btn-add-new-address" onClick={() => setShowAddressModal(true)}>
                  <FaPlus /> Add New Address
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Search with Autocomplete */}
        <div className="nav-center-search" ref={searchRef}>
          <div className="search-bar-input-wrap">
            <FaSearch className="search-lead-icon" />
            <input
              type="text"
              placeholder="Search for dishes, restaurants, or cuisines..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
                if (onSearchQuery) onSearchQuery(e.target.value);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            />
            {searchQuery && (
              <button
                className="btn-clear-search"
                onClick={() => {
                  setSearchQuery("");
                  if (onSearchQuery) onSearchQuery("");
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Overlay */}
          {showSearchDropdown && (
            <div className="search-autocomplete-panel animate-fade-in">
              {recentSearches.length > 0 && (
                <div className="search-sub-block">
                  <h5>
                    <FaHistory /> Recent Searches
                  </h5>
                  <div className="chips-row">
                    {recentSearches.map((term, i) => (
                      <span
                        key={i}
                        className="search-chip"
                        onClick={() => {
                          setSearchQuery(term);
                          handleSearchSubmit(term);
                        }}
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="search-sub-block">
                <h5>
                  <FaFire /> Popular Searches
                </h5>
                <div className="chips-row">
                  {popularSearches.map((term, i) => (
                    <span
                      key={i}
                      className="search-chip popular"
                      onClick={() => {
                        setSearchQuery(term);
                        handleSearchSubmit(term);
                      }}
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Navigation Actions */}
        <div className="nav-right-actions">
          {/* Offers Link */}
          <Link to="/offers" className="nav-link-item">
            <FaPercent className="nav-link-icon" />
            <span>Offers</span>
            <span className="badge-pill">NEW</span>
          </Link>

          {/* Help & Support */}
          <Link to="/support" className="nav-link-item">
            <FaHeadset className="nav-link-icon" />
            <span>Help</span>
          </Link>

          {/* Cart with Live Count */}
          <Link to="/cart" className="nav-action-btn cart-btn" title="View Cart">
            <FaShoppingCart />
            {cartCount > 0 && <span className="action-badge-counter animate-pop">{cartCount}</span>}
          </Link>

          {/* Notifications Dropdown */}
          <div className="nav-dropdown-trigger" ref={notificationRef}>
            <button
              className="nav-action-btn notif-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <FaBell />
              {navbarData.notifications > 0 && (
                <span className="action-badge-counter">{navbarData.notifications}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown-panel animate-fade-in">
                <div className="notif-header">
                  <h4>Notifications</h4>
                  <span className="unread-tag">{navbarData.notifications} New</span>
                </div>
                <ul className="notif-list">
                  <li className="notif-item unread">
                    <span className="notif-bullet">🛵</span>
                    <div className="notif-details">
                      <h6>Order Status Update</h6>
                      <p>Your order #FD1052 is on the way with delivery partner!</p>
                      <small>5 minutes ago</small>
                    </div>
                  </li>
                  <li className="notif-item unread">
                    <span className="notif-bullet">🎟️</span>
                    <div className="notif-details">
                      <h6>Coupon Unlocked!</h6>
                      <p>Use code <strong>FIRST30</strong> for 30% OFF on your meal.</p>
                      <small>1 hour ago</small>
                    </div>
                  </li>
                  <li className="notif-item">
                    <span className="notif-bullet">⭐</span>
                    <div className="notif-details">
                      <h6>Gold Membership Active</h6>
                      <p>You enjoy unlimited free delivery on all orders above ₹199.</p>
                      <small>1 day ago</small>
                    </div>
                  </li>
                </ul>
                <div className="notif-footer">
                  <button
                    onClick={() => {
                      setNavbarData((p) => ({ ...p, notifications: 0 }));
                      setShowNotifications(false);
                      showToast("All notifications marked as read", "info");
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="nav-dropdown-trigger" ref={profileRef}>
            <div
              className="profile-capsule"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title="Account Menu"
            >
              <img
                src={navbarData.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                alt={navbarData.name}
                className="profile-avatar"
              />
              <div className="profile-text">
                <span className="profile-name">{navbarData.name.split(" ")[0]}</span>
                <span className="profile-tier">
                  {navbarData.membership}
                </span>
              </div>
              <FaChevronDown className={`profile-chevron ${showProfileMenu ? "open" : ""}`} />
            </div>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="profile-dropdown-panel animate-fade-in">
                <div className="profile-panel-header">
                  <img
                    src={navbarData.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                    alt={navbarData.name}
                  />
                  <div>
                    <h5>{navbarData.name}</h5>
                    <p>{user?.email || "customer@foodexpress.com"}</p>
                    <span className="badge-tier-pill">{navbarData.membership}</span>
                  </div>
                </div>

                <div className="profile-menu-links">
                  <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                    <FaUser /> My Profile
                  </Link>
                  <Link to="/membership" onClick={() => setShowProfileMenu(false)} style={{ color: "#ff6b35", fontWeight: "600" }}>
                    <FaAward /> FoodExpress Membership
                  </Link>
                  <Link to="/my-orders" onClick={() => setShowProfileMenu(false)}>
                    <FaClipboardList /> My Orders
                  </Link>
                  <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                    <FaHeart /> Favorites & Wishlist
                  </Link>
                  <a
                    href="#wallet-section"
                    onClick={(e) => {
                      setShowProfileMenu(false);
                    }}
                  >
                    <FaWallet /> FoodExpress Wallet (₹{user?.wallet || 1000})
                  </a>
                  <a
                    href="#rewards-section"
                    onClick={() => {
                      setShowProfileMenu(false);
                    }}
                  >
                    <FaGift /> Reward Points ({user?.rewardPoints || 500} pts)
                  </a>
                  <Link to="/support" onClick={() => setShowProfileMenu(false)}>
                    <FaHeadset /> Help & Support
                  </Link>
                  <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                    <FaCog /> Settings
                  </Link>
                </div>

                <div className="profile-panel-footer">
                  <button className="btn-menu-logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Add New Address Modal */}
      {showAddressModal && (
        <div className="modal-backdrop animate-fade-in">
          <div className="address-modal-card">
            <div className="modal-header">
              <h3>📍 Add New Delivery Address</h3>
              <button className="btn-close-modal" onClick={() => setShowAddressModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="address-modal-form">
              <div className="form-group">
                <label>Address Label</label>
                <div className="label-radio-group">
                  {["Home", "Work", "Other"].map((lbl) => (
                    <button
                      type="button"
                      key={lbl}
                      className={`tag-btn ${newAddressForm.title === lbl ? "selected" : ""}`}
                      onClick={() => setNewAddressForm({ ...newAddressForm, title: lbl })}
                    >
                      {lbl === "Home" ? "🏠" : lbl === "Work" ? "💼" : "📍"} {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Complete Street Address *</label>
                <textarea
                  rows="3"
                  placeholder="House/Flat No., Apartment, Landmark, Street"
                  required
                  value={newAddressForm.address}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  required
                  value={newAddressForm.city}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddressModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save-address">
                  Save Address & Deliver Here
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardNavbar;