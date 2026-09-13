import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import FoodExpressLogo from "../FoodExpressLogo";
import "./Navbar.css";
import {
    FaSearch,
    FaShoppingBag,
    FaHeart,
    FaUser,
    FaMapMarkerAlt,
    FaBars,
    FaTimes,
    FaSignOutAlt,
    FaShieldAlt,
    FaChevronDown,
    FaReceipt,
    FaThLarge,
    FaCog
} from "react-icons/fa";

const Navbar = ({ isDashboardLayout = false }) => {
    const {
        user,
        logout,
        getCartCount,
        wishlist,
        selectedArea,
        setSelectedArea,
        availableAreas,
        mobileSidebarOpen,
        toggleMobileSidebar
    } = useContext(StoreContext);
    const [searchTerm, setSearchTerm] = useState("");
    const selectedCity = selectedArea || "Hyderabad";
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const locationRef = useRef(null);
    const userMenuRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const cartCount = getCartCount();

    // Track scroll for sticky elevated appearance
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 8);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menus on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
        setLocationModalOpen(false);
    }, [location.pathname]);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (locationRef.current && !locationRef.current.contains(e.target)) {
                setLocationModalOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Role-based dashboard navigation logic
    const getDashboardRoute = () => {
        if (!user) return "/dashboard";
        switch (user.role) {
            case "admin":
                return "/admin/dashboard";
            case "restaurant":
                return "/restaurant";
            case "delivery":
                return "/delivery";
            case "customer":
            default:
                return "/dashboard";
        }
    };
    const dashboardRoute = getDashboardRoute();

    // Determine profile frame tier based strictly on active membership
    const getProfileMembershipTier = () => {
        if (!user || !user.membership) return "free";
        const mem = user.membership;
        let plan = "";
        let isActive = false;
        if (typeof mem === "object") {
            plan = (mem.plan || "").toLowerCase();
            isActive = mem.status === "active";
        } else if (typeof mem === "string") {
            plan = mem.toLowerCase();
            isActive = ["silver", "gold", "platinum"].includes(plan);
        }
        if (isActive && ["silver", "gold", "platinum"].includes(plan)) {
            return plan;
        }
        return "free";
    };
    const profileMembershipTier = getProfileMembershipTier();

    const isDashboardActive =
        location.pathname === "/dashboard" ||
        location.pathname.startsWith("/restaurant") ||
        location.pathname.startsWith("/delivery") ||
        location.pathname.startsWith("/admin");

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/menu?search=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm("");
            setMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        setUserDropdownOpen(false);
        navigate("/");
    };

    const cities = availableAreas || [
        "Hyderabad",
        "Bhimavaram",
        "Bengaluru",
        "Mumbai",
        "Delhi NCR",
        "Pune",
        "Chennai",
        "Kolkata"
    ];

    return (
        <header className={`navbar-wrapper ${isScrolled ? "is-scrolled" : ""}`}>
            <nav className="navbar-container">
                {/* 1. BRAND LOGO */}
                <div className="navbar-brand">
                    <FoodExpressLogo variant="navbar" to="/" />
                </div>

                {/* 2. LOCATION SELECTOR */}
                <div className="navbar-location" ref={locationRef}>
                    <button
                        type="button"
                        className="location-pill"
                        onClick={() => setLocationModalOpen(!locationModalOpen)}
                        title="Select delivery location"
                        aria-expanded={locationModalOpen}
                    >
                        <FaMapMarkerAlt className="loc-icon" />
                        <span className="loc-text">{selectedCity}</span>
                        <FaChevronDown className={`loc-chevron ${locationModalOpen ? "rotated" : ""}`} />
                    </button>

                    {locationModalOpen && (
                        <div className="location-dropdown">
                            <div className="location-dropdown-header">Select Location</div>
                            {cities.map((city) => (
                                <button
                                    key={city}
                                    type="button"
                                    className={`location-item ${city === selectedCity ? "active" : ""}`}
                                    onClick={() => {
                                        setSelectedArea(city);
                                        setLocationModalOpen(false);
                                    }}
                                >
                                    <FaMapMarkerAlt className="loc-item-icon" />
                                    <span>{city}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. SEARCH BAR + SEARCH BUTTON */}
                <form className="navbar-search" onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        placeholder="Search food, restaurants..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search food or restaurant"
                    />
                    <button type="submit" className="search-btn" title="Search food, restaurants" aria-label="Search">
                        <FaSearch className="nav-search-btn-icon" />
                        <span className="search-btn-text">Search</span>
                    </button>
                </form>

                {/* 4-8. NAVIGATION LINKS */}
                <ul className="navbar-nav-links">
                    <li>
                        <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/menu" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                            Menu
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/my-orders" className={({ isActive }) => (isActive || location.pathname === "/orders" ? "nav-link active" : "nav-link")}>
                            Orders
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to={dashboardRoute}
                            className={({ isActive }) =>
                                isActive || isDashboardActive ? "nav-link active" : "nav-link"
                            }
                        >
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                        >
                            Profile
                        </NavLink>
                    </li>
                </ul>

                {/* 9-11. ACTION BUTTONS (Wishlist, Cart, User Profile) */}
                <div className="navbar-actions">
                    {/* Mobile Search Toggle Icon */}
                    <button
                        type="button"
                        className="mobile-search-toggle"
                        onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                        aria-label="Toggle mobile search"
                        title="Search dishes"
                    >
                        <FaSearch />
                    </button>

                    {/* 9. Wishlist Link */}
                    <Link to="/menu?filter=wishlist" className="action-icon-btn" title="Wishlist" aria-label="Wishlist">
                        <FaHeart />
                        {wishlist && wishlist.length > 0 && (
                            <span className="badge-count wishlist-badge">{wishlist.length}</span>
                        )}
                    </Link>

                    {/* 10. Cart Button */}
                    <Link to="/cart" className="action-cart-btn" title="Shopping Cart" aria-label="Shopping Cart">
                        <FaShoppingBag className="cart-icon" />
                        <span className="cart-label">Cart</span>
                        {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
                    </Link>

                    {/* 11. User Profile Dropdown or Login / Register */}
                    {user ? (
                        <div className="user-menu-wrapper" ref={userMenuRef}>
                            <button
                                type="button"
                                className={`user-profile-btn navbar-profile navbar-profile-membership-frame ${profileMembershipTier}`}
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                aria-label="User Account Menu"
                                aria-expanded={userDropdownOpen}
                            >
                                <div className="user-avatar profile-avatar">
                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                                </div>
                                <span className="user-name profile-name">{user.fullName?.split(" ")[0] || "User"}</span>
                                <FaChevronDown className={`user-chevron profile-chevron ${userDropdownOpen ? "rotated" : ""}`} />
                            </button>

                            {userDropdownOpen && (
                                <div className="user-dropdown-menu">
                                    <div className="dropdown-user-header">
                                        <strong>{user.fullName}</strong>
                                        <small>{user.email}</small>
                                        <span className={`role-badge role-${user.role}`}>
                                            {user.role?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="dropdown-divider" />
                                    <Link
                                        to={dashboardRoute}
                                        className="dropdown-item"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        <FaThLarge /> Dashboard
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="dropdown-item"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        <FaUser /> My Profile
                                    </Link>
                                    <Link
                                        to="/my-orders"
                                        className="dropdown-item"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        <FaReceipt /> My Orders
                                    </Link>
                                    <Link
                                        to="/settings"
                                        className="dropdown-item"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        <FaCog /> Settings
                                    </Link>
                                    <div className="dropdown-divider" />
                                    <button type="button" className="dropdown-item logout-btn" onClick={handleLogout}>
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-btn-group">
                            <Link to="/login" className="btn-login">
                                Login
                            </Link>
                            <Link to="/register" className="btn-register">
                                Sign Up
                            </Link>
                        </div>
                    )}

                    {/* Mobile Hamburger Toggle */}
                    <button
                        type="button"
                        className="mobile-toggle-btn"
                        onClick={() => {
                            if (isDashboardLayout && toggleMobileSidebar) {
                                toggleMobileSidebar();
                            } else {
                                setMobileMenuOpen(!mobileMenuOpen);
                            }
                        }}
                        aria-label="Toggle navigation menu"
                    >
                        {(isDashboardLayout ? mobileSidebarOpen : mobileMenuOpen) ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </nav>

            {/* EXPANDABLE FULL-WIDTH MOBILE SEARCH BAR */}
            {mobileSearchOpen && (
                <div className="mobile-search-expandable">
                    <form className="mobile-search-expandable-form" onSubmit={(e) => {
                        handleSearchSubmit(e);
                        setMobileSearchOpen(false);
                    }}>
                        <FaSearch className="mobile-search-icon" />
                        <input
                            type="text"
                            placeholder="Search food or restaurant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                className="mobile-search-clear-btn"
                                onClick={() => setSearchTerm("")}
                            >
                                <FaTimes />
                            </button>
                        )}
                        <button type="submit" className="mobile-search-go-btn">
                            Go
                        </button>
                    </form>
                </div>
            )}

            {/* MOBILE NAVIGATION DRAWER */}
            {mobileMenuOpen && (
                <div className="mobile-nav-drawer">
                    <form className="mobile-search" onSubmit={handleSearchSubmit}>
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search food or restaurant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>

                    <ul className="mobile-nav-list">
                        <li>
                            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                                🏠 Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/menu" onClick={() => setMobileMenuOpen(false)}>
                                🍕 All Menu & Food
                            </Link>
                        </li>
                        <li>
                            <Link to="/browse-food" onClick={() => setMobileMenuOpen(false)}>
                                🍔 Browse Food
                            </Link>
                        </li>
                        <li>
                            <Link to="/offers" onClick={() => setMobileMenuOpen(false)}>
                                🏷️ Offers & Deals
                            </Link>
                        </li>
                        <li>
                            <Link to="/rewards" onClick={() => setMobileMenuOpen(false)}>
                                🎁 Rewards Program
                            </Link>
                        </li>
                        <li>
                            <Link to="/membership" onClick={() => setMobileMenuOpen(false)}>
                                ⭐ Premium Membership
                            </Link>
                        </li>
                        <li>
                            <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)}>
                                📦 My Orders
                            </Link>
                        </li>
                        <li>
                            <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
                                🛒 Cart ({cartCount})
                            </Link>
                        </li>
                        <li>
                            <Link to={dashboardRoute} onClick={() => setMobileMenuOpen(false)}>
                                📊 Dashboard
                            </Link>
                        </li>
                        {user ? (
                            <>
                                <li>
                                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                                        👤 My Profile ({user.fullName})
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/support" onClick={() => setMobileMenuOpen(false)}>
                                        🎧 Help & Support
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                                        ⚙️ Settings
                                    </Link>
                                </li>
                                <li>
                                    <button className="mobile-logout-btn" onClick={handleLogout}>
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                                        👤 Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/support" onClick={() => setMobileMenuOpen(false)}>
                                        🎧 Help & Support
                                    </Link>
                                </li>
                                <li className="mobile-auth-row">
                                    <Link to="/login" className="btn-login" onClick={() => setMobileMenuOpen(false)}>
                                        Login
                                    </Link>
                                    <Link to="/register" className="btn-register" onClick={() => setMobileMenuOpen(false)}>
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </header>
    );
};

export default Navbar;