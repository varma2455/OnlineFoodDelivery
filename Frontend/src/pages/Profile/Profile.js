import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { authAPI, walletAPI, orderAPI, foodAPI, getFoodImageUrl } from "../../services/api";
import "./Profile.css";
import PremiumMembershipBadge from "../../components/PremiumMembershipBadge/PremiumMembershipBadge";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaLock,
    FaWallet,
    FaAward,
    FaSignOutAlt,
    FaTrash,
    FaPlus,
    FaReceipt,
    FaShieldAlt,
    FaCheckCircle,
    FaEdit,
    FaCamera,
    FaHome,
    FaBriefcase,
    FaMapPin,
    FaStar,
    FaHeart,
    FaUtensils,
    FaBell,
    FaQuestionCircle,
    FaChevronRight,
    FaSyncAlt,
    FaTimes,
    FaGift,
    FaMoneyBillWave,
    FaArrowRight,
    FaCalendarAlt,
    FaVenusMars,
    FaCheck,
    FaExclamationCircle
} from "react-icons/fa";

const PRESET_TOPUPS = [100, 200, 500, 1000, 2000];

const Profile = () => {
    const {
        token,
        user,
        setUser,
        refreshUser,
        logout,
        foodList,
        addToCart,
        wishlist,
        toggleWishlist,
        showToast
    } = useContext(StoreContext);

    const navigate = useNavigate();

    // Tab state: 'overview', 'personal', 'addresses', 'orders', 'wallet', 'favorites', 'security', 'preferences', 'support'
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    // Profile Extra Data State
    const [myOrders, setMyOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingWallet, setLoadingWallet] = useState(false);

    // Personal Info Form
    const [isEditingPersonal, setIsEditingPersonal] = useState(false);
    const [personalForm, setPersonalForm] = useState({
        fullName: "",
        phone: "",
        city: "",
        address: "",
        dateOfBirth: "",
        gender: "Prefer not to say"
    });

    // Address Modal & Form State
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({
        title: "Home",
        fullName: "",
        phone: "",
        houseNo: "",
        street: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: false
    });

    // Wallet Top-up State
    const [showTopupModal, setShowTopupModal] = useState(false);
    const [topupAmount, setTopupAmount] = useState(500);
    const [topupMethod, setTopupMethod] = useState("UPI");
    const [topupLoading, setTopupLoading] = useState(false);

    // Avatar Change Modal
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [avatarUrlInput, setAvatarUrlInput] = useState("");

    // Password Form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Notification Preferences
    const [notifications, setNotifications] = useState({
        orderUpdates: true,
        deliveryUpdates: true,
        offersPromotions: true,
        rewards: true
    });

    // Load initial user details
    useEffect(() => {
        if (user) {
            setPersonalForm({
                fullName: user.fullName || "",
                phone: user.phone || "",
                city: user.city || "",
                address: user.address || "",
                dateOfBirth: user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : "",
                gender: user.gender || "Prefer not to say"
            });
            if (user.notifications) {
                setNotifications({
                    orderUpdates: user.notifications.orderUpdates !== false,
                    deliveryUpdates: user.notifications.deliveryUpdates !== false,
                    offersPromotions: user.notifications.offersPromotions !== false,
                    rewards: user.notifications.rewards !== false
                });
            }
            if (user.profileImage) {
                setAvatarUrlInput(user.profileImage);
            }
        }
    }, [user]);

    // Fetch Orders and Wallet History
    const fetchUserData = useCallback(async () => {
        if (!token) return;
        setPageLoading(true);
        try {
            // Load orders
            setLoadingOrders(true);
            try {
                const ordersRes = await orderAPI.getMyOrders();
                const ordersData = ordersRes.data?.orders || ordersRes.data || [];
                setMyOrders(Array.isArray(ordersData) ? ordersData : []);
            } catch (err) {
                console.warn("Could not load orders in profile:", err.message);
            } finally {
                setLoadingOrders(false);
            }

            // Load wallet transactions
            setLoadingWallet(true);
            try {
                const walletRes = await walletAPI.getTransactions();
                const txData = walletRes.data?.transactions || [];
                setTransactions(Array.isArray(txData) ? txData : []);
            } catch (err) {
                console.warn("Could not load wallet history:", err.message);
            } finally {
                setLoadingWallet(false);
            }
        } finally {
            setPageLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Computed Stats
    const stats = useMemo(() => {
        const total = myOrders.length;
        const delivered = myOrders.filter((o) => (o.orderStatus || "").toLowerCase() === "delivered").length;
        const walletBalance = Number(user?.wallet) || 0;
        const rewardPoints = Number(user?.rewardPoints) || 0;
        return { total, delivered, walletBalance, rewardPoints };
    }, [myOrders, user]);

    // Saved Addresses
    const savedAddresses = useMemo(() => {
        return user?.savedAddresses || [];
    }, [user]);

    // Favorite foods
    const favoriteFoods = useMemo(() => {
        const favIds = (user?.favorites || []).map((id) => (typeof id === "object" ? id._id : id));
        const allFavIds = Array.from(new Set([...favIds, ...wishlist]));
        return foodList.filter((food) => allFavIds.includes(food._id));
    }, [user, wishlist, foodList]);

    // Handle Personal Info Update
    const handleUpdatePersonal = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await authAPI.updateProfile(personalForm);
            if (res.data?.user) {
                setUser(res.data.user);
            } else if (refreshUser) {
                await refreshUser();
            }
            showToast("Personal details updated successfully! ✨", "success");
            setIsEditingPersonal(false);
        } catch (error) {
            showToast(error.message || "Failed to update profile", "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle Avatar Save
    const handleSaveAvatar = async (url) => {
        try {
            setLoading(true);
            const res = await authAPI.updateProfile({ profileImage: url });
            if (res.data?.user) {
                setUser(res.data.user);
            } else if (refreshUser) {
                await refreshUser();
            }
            showToast("Profile picture updated! 📸", "success");
            setShowAvatarModal(false);
        } catch (error) {
            showToast(error.message || "Failed to update profile image", "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle Save Address (Add or Edit)
    const handleOpenAddAddress = () => {
        setEditingAddressId(null);
        setAddressForm({
            title: "Home",
            fullName: user?.fullName || "",
            phone: user?.phone || "",
            houseNo: "",
            street: "",
            landmark: "",
            city: user?.city || "Hyderabad",
            state: "Telangana",
            pincode: "",
            isDefault: savedAddresses.length === 0
        });
        setShowAddressModal(true);
    };

    const handleOpenEditAddress = (addr) => {
        setEditingAddressId(addr._id);
        setAddressForm({
            title: addr.title || "Home",
            fullName: addr.fullName || user?.fullName || "",
            phone: addr.phone || user?.phone || "",
            houseNo: addr.houseNo || "",
            street: addr.street || addr.address || "",
            landmark: addr.landmark || "",
            city: addr.city || user?.city || "Hyderabad",
            state: addr.state || "Telangana",
            pincode: addr.pincode || "",
            isDefault: Boolean(addr.isDefault)
        });
        setShowAddressModal(true);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        if (!addressForm.houseNo && !addressForm.street && !addressForm.landmark) {
            showToast("Please enter house/flat or street details.", "error");
            return;
        }

        try {
            setLoading(true);
            if (editingAddressId) {
                await authAPI.updateAddress(editingAddressId, addressForm);
                showToast("Address updated successfully! 📍", "success");
            } else {
                await authAPI.addAddress(addressForm);
                showToast("New address added! 📍", "success");
            }
            if (refreshUser) await refreshUser();
            setShowAddressModal(false);
        } catch (error) {
            showToast(error.message || "Failed to save address", "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle Delete Address
    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        try {
            await authAPI.deleteAddress(addressId);
            if (refreshUser) await refreshUser();
            showToast("Address removed.", "info");
        } catch (error) {
            showToast(error.message || "Failed to delete address", "error");
        }
    };

    // Handle Set Default Address
    const handleSetDefaultAddress = async (addressId) => {
        try {
            await authAPI.setDefaultAddress(addressId);
            if (refreshUser) await refreshUser();
            showToast("Default address updated! ✓", "success");
        } catch (error) {
            showToast(error.message || "Failed to set default address", "error");
        }
    };

    // Handle Wallet Top-Up
    const handleAddMoney = async () => {
        const amt = Number(topupAmount);
        if (!amt || amt < 10) {
            showToast("Please enter at least ₹10.", "error");
            return;
        }

        try {
            setTopupLoading(true);
            const res = await walletAPI.addMoney(amt, topupMethod);
            if (res.data?.wallet !== undefined) {
                setUser((prev) => ({ ...prev, wallet: res.data.wallet }));
            }
            if (refreshUser) await refreshUser();
            showToast(res.data?.message || `₹${amt} added to FoodExpress Wallet! 💰`, "success");
            setShowTopupModal(false);
            // Refresh transactions
            const txRes = await walletAPI.getTransactions();
            setTransactions(txRes.data?.transactions || []);
        } catch (error) {
            showToast(error.message || "Failed to add money", "error");
        } finally {
            setTopupLoading(false);
        }
    };

    // Handle Password Change
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast("New passwords do not match.", "error");
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            showToast("Password must be at least 6 characters.", "error");
            return;
        }

        try {
            setLoading(true);
            await authAPI.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            showToast("Password updated securely! 🔒", "success");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setActiveTab("overview");
        } catch (error) {
            showToast(error.message || "Failed to change password", "error");
        } finally {
            setLoading(false);
        }
    };

    // Handle Notification Preference Toggle
    const handleToggleNotification = async (key) => {
        const nextState = { ...notifications, [key]: !notifications[key] };
        setNotifications(nextState);
        try {
            await authAPI.updateProfile({ notifications: nextState });
            showToast("Notification preferences updated.", "success");
        } catch (error) {
            setNotifications(notifications);
            showToast("Could not update preference.", "error");
        }
    };

    // Reorder 1-Click
    const handleReorder = (order) => {
        if (!order || !order.items || order.items.length === 0) return;
        let count = 0;
        order.items.forEach((item) => {
            const foodId = item.food?._id || item.food;
            if (foodId) {
                addToCart(foodId, item.quantity || 1);
                count++;
            }
        });
        showToast(`Added ${count} items from Order #${(order._id || "").slice(-6)} to your cart! 🛒`, "success");
        navigate("/cart");
    };

    // Format helpers
    const getInitials = (name) => {
        if (!name) return "FE";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const getStatusClass = (status) => {
        switch ((status || "").toLowerCase()) {
            case "delivered":
                return "status-delivered";
            case "preparing":
            case "confirmed":
                return "status-active";
            case "out for delivery":
                return "status-transit";
            case "cancelled":
                return "status-cancelled";
            default:
                return "status-placed";
        }
    };

    return (
        <div className="profile-page-shell">
            <div className="profile-page-container">
                {/* 1. BREADCRUMBS */}
                <div className="profile-breadcrumbs">
                    <Link to="/dashboard">Dashboard</Link>
                    <span className="crumb-sep">/</span>
                    <span className="crumb-current">My Profile</span>
                </div>

                {/* 2. PROFILE HERO HEADER CARD */}
                <div className="profile-hero-card">
                    <div className="hero-left-cluster">
                        {/* Avatar */}
                        <div className="profile-avatar-wrapper">
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={user.fullName || "User"}
                                    className="profile-avatar-img"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                        if (e.target.nextSibling) {
                                            e.target.nextSibling.style.display = "flex";
                                        }
                                    }}
                                />
                            ) : null}
                            <div
                                className="profile-avatar-initials"
                                style={{ display: user?.profileImage ? "none" : "flex" }}
                            >
                                {getInitials(user?.fullName)}
                            </div>
                            <button
                                type="button"
                                className="btn-avatar-camera"
                                title="Change Profile Picture"
                                onClick={() => setShowAvatarModal(true)}
                            >
                                <FaCamera />
                            </button>
                            <span className="online-pulse-dot" title="Account Active" />
                        </div>

                        {/* Name & Identifiers */}
                        <div className="profile-identity-info">
                            <div className="identity-title-row">
                                <h1 className="profile-user-name">
                                    {user?.fullName || "FoodExpress Member"}
                                </h1>
                                <span className="verified-badge" title="Verified Account">
                                    <FaCheckCircle /> Verified Foodie
                                </span>
                                {user?.role && user.role !== "customer" && (
                                    <span className={`role-pill role-${user.role}`}>
                                        {user.role.toUpperCase()}
                                    </span>
                                )}
                            </div>

                            <div className="identity-contact-row">
                                <span className="contact-item">
                                    <FaEnvelope className="contact-icon" /> {user?.email || "No email"}
                                </span>
                                <span className="contact-bullet">•</span>
                                <span className="contact-item">
                                    <FaPhone className="contact-icon" /> {user?.phone || "Phone not added"}
                                </span>
                                <span className="contact-bullet">•</span>
                                <span className="contact-item">
                                    <FaMapMarkerAlt className="contact-icon" /> {user?.city || "Hyderabad"}
                                </span>
                            </div>

                            <div className="identity-tags-row">
                                <Link to="/membership" style={{ textDecoration: "none" }} title="Manage Membership">
                                    <PremiumMembershipBadge plan={user?.membership?.plan || user?.membership} />
                                </Link>
                                {user?.membership?.endDate && (
                                    <span className="member-expiry-tag" style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                        <FaCalendarAlt style={{ fontSize: "11px" }} /> Active until: {formatDate(user.membership.endDate)}
                                    </span>
                                )}
                                <span className="member-since-tag">
                                    Member since {user?.createdAt ? formatDate(user.createdAt) : "2024"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-right-actions">
                        <button
                            type="button"
                            className="btn-quick-edit"
                            onClick={() => {
                                setActiveTab("personal");
                                setIsEditingPersonal(true);
                            }}
                        >
                            <FaEdit /> Edit Profile
                        </button>
                        <button
                            type="button"
                            className="btn-header-logout"
                            onClick={() => {
                                logout();
                                navigate("/login");
                            }}
                            title="Sign out from FoodExpress"
                        >
                            <FaSignOutAlt /> Sign Out
                        </button>
                    </div>
                </div>

                {/* 3. KEY METRICS STATS BAR */}
                <div className="profile-stats-grid">
                    <div
                        className="stat-card stat-orders clickable"
                        onClick={() => navigate("/my-orders")}
                        title="View My Orders"
                    >
                        <div className="stat-icon-bubble bg-orange-soft">
                            <FaReceipt />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Total Orders</span>
                            <h3 className="stat-value">{stats.total}</h3>
                            <span className="stat-subtext">
                                View History <FaArrowRight className="inline-arrow" />
                            </span>
                        </div>
                    </div>

                    <div className="stat-card stat-delivered">
                        <div className="stat-icon-bubble bg-green-soft">
                            <FaCheckCircle />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Delivered Orders</span>
                            <h3 className="stat-value">{stats.delivered}</h3>
                            <span className="stat-subtext text-green">100% on-time delivery</span>
                        </div>
                    </div>

                    <div className="stat-card stat-wallet">
                        <div className="stat-icon-bubble bg-blue-soft">
                            <FaWallet />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Wallet Balance</span>
                            <h3 className="stat-value">₹{stats.walletBalance.toLocaleString("en-IN")}</h3>
                            <button
                                type="button"
                                className="stat-action-link"
                                onClick={() => setShowTopupModal(true)}
                            >
                                + Add Money
                            </button>
                        </div>
                    </div>

                    <div className="stat-card stat-rewards">
                        <div className="stat-icon-bubble bg-gold-soft">
                            <FaGift />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Reward Points</span>
                            <h3 className="stat-value">{stats.rewardPoints} pts</h3>
                            <span className="stat-subtext text-gold">
                                {stats.rewardPoints >= 500 ? "Gold Tier" : "Silver Tier"} Member
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. MAIN INTERACTIVE LAYOUT (TABS SIDEBAR + CONTENT CARD) */}
                <div className="profile-workspace">
                    {/* Workspace Nav Sidebar */}
                    <aside className="workspace-tabs-menu">
                        <div className="tabs-header-label">ACCOUNT SETTINGS</div>

                        <button
                            type="button"
                            className={`ws-tab-btn ${activeTab === "overview" ? "active" : ""}`}
                            onClick={() => setActiveTab("overview")}
                        >
                            <FaUser className="tab-icon" />
                            <span>Account Overview</span>
                            <FaChevronRight className="tab-arrow" />
                        </button>

                        <button
                            type="button"
                            className={`ws-tab-btn ${activeTab === "personal" ? "active" : ""}`}
                            onClick={() => setActiveTab("personal")}
                        >
                            <FaEdit className="tab-icon" />
                            <span>Personal Information</span>
                            <FaChevronRight className="tab-arrow" />
                        </button>

                        <button
                            type="button"
                            className={`ws-tab-btn ${activeTab === "addresses" ? "active" : ""}`}
                            onClick={() => setActiveTab("addresses")}
                        >
                            <FaMapMarkerAlt className="tab-icon" />
                            <span>Saved Addresses</span>
                            <span className="tab-count-badge">{savedAddresses.length}</span>
                        </button>

                        <button
                            type="button"
                            className={`ws-tab-btn ${activeTab === "orders" ? "active" : ""}`}
                            onClick={() => setActiveTab("orders")}
                        >
                            <FaReceipt className="tab-icon" />
                            <span>Orders & Activity</span>
                            <span className="tab-count-badge">{myOrders.length}</span>
                        </button>

                        <button
                            type="button"
                            className={`ws-tab-btn ${activeTab === "wallet" ? "active" : ""}`}
                            onClick={() => setActiveTab("wallet")}
                        >
                            <FaWallet className="tab-icon" />
                            <span>Wallet & Rewards</span>
                            <span className="tab-pill-highlight">₹{stats.walletBalance}</span>
                        </button>

                        <button
                            type="button"
                            className={`ws-tab-btn ${activeTab === "favorites" ? "active" : ""}`}
                            onClick={() => setActiveTab("favorites")}
                        >
                            <FaHeart className="tab-icon" />
                            <span>Favorites & Wishlist</span>
                            <span className="tab-count-badge">{favoriteFoods.length}</span>
                        </button>

                        <button
                            type="button"
                            className={`ws-tab-btn ${activeTab === "security" ? "active" : ""}`}
                            onClick={() => setActiveTab("security")}
                        >
                            <FaShieldAlt className="tab-icon" />
                            <span>Security & Password</span>
                            <FaChevronRight className="tab-arrow" />
                        </button>

                        <button
                            type="button"
                            className={`ws-tab-btn ${activeTab === "preferences" ? "active" : ""}`}
                            onClick={() => setActiveTab("preferences")}
                        >
                            <FaBell className="tab-icon" />
                            <span>Notification Preferences</span>
                            <FaChevronRight className="tab-arrow" />
                        </button>

                        <button
                            type="button"
                            className={`ws-tab-btn ${activeTab === "support" ? "active" : ""}`}
                            onClick={() => setActiveTab("support")}
                        >
                            <FaQuestionCircle className="tab-icon" />
                            <span>Help & Support</span>
                            <FaChevronRight className="tab-arrow" />
                        </button>

                        <div className="tab-divider" />

                        <button
                            type="button"
                            className="ws-logout-btn"
                            onClick={() => {
                                logout();
                                navigate("/login");
                            }}
                        >
                            <FaSignOutAlt className="tab-icon" />
                            <span>Log Out</span>
                        </button>
                    </aside>

                    {/* Workspace Main Display Panel */}
                    <main className="workspace-panel">
                        {/* ============================================================ */}
                        {/* TAB 1: OVERVIEW */}
                        {/* ============================================================ */}
                        {activeTab === "overview" && (
                            <div className="panel-tab-pane">
                                <div className="panel-pane-header">
                                    <div>
                                        <h2 className="pane-title">Account Overview</h2>
                                        <p className="pane-subtitle">
                                            Welcome back, {user?.fullName || "Foodie"}! Here is your quick FoodExpress summary.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-action-primary"
                                        onClick={() => {
                                            setActiveTab("personal");
                                            setIsEditingPersonal(true);
                                        }}
                                    >
                                        <FaEdit /> Edit Details
                                    </button>
                                </div>

                                <div className="overview-sections-grid">
                                    {/* Quick Personal Info Card */}
                                    <div className="overview-card">
                                        <div className="card-header-flex">
                                            <h3>Personal Details</h3>
                                            <button
                                                type="button"
                                                className="card-text-btn"
                                                onClick={() => {
                                                    setActiveTab("personal");
                                                    setIsEditingPersonal(true);
                                                }}
                                            >
                                                Manage
                                            </button>
                                        </div>
                                        <div className="info-key-value-list">
                                            <div className="info-row">
                                                <span className="row-key">Full Name:</span>
                                                <span className="row-val font-semibold">{user?.fullName || "Not provided"}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="row-key">Email Address:</span>
                                                <span className="row-val">{user?.email || "Not provided"}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="row-key">Phone:</span>
                                                <span className="row-val">{user?.phone || "Not provided"}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="row-key">City:</span>
                                                <span className="row-val">{user?.city || "Hyderabad"}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="row-key">Date of Birth:</span>
                                                <span className="row-val">{user?.dateOfBirth ? formatDate(user.dateOfBirth) : "Not set"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Default Delivery Address Card */}
                                    <div className="overview-card">
                                        <div className="card-header-flex">
                                            <h3>Primary Delivery Address</h3>
                                            <button
                                                type="button"
                                                className="card-text-btn"
                                                onClick={() => setActiveTab("addresses")}
                                            >
                                                Change
                                            </button>
                                        </div>
                                        {savedAddresses.length > 0 ? (
                                            (() => {
                                                const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
                                                return (
                                                    <div className="primary-address-box">
                                                        <div className="addr-tag-pill">
                                                            <FaHome /> {defaultAddr.title || "Home"} (Default)
                                                        </div>
                                                        <p className="addr-text-full">
                                                            {defaultAddr.houseNo ? `${defaultAddr.houseNo}, ` : ""}
                                                            {defaultAddr.street ? `${defaultAddr.street}, ` : ""}
                                                            {defaultAddr.landmark ? `Near ${defaultAddr.landmark}, ` : ""}
                                                            {defaultAddr.city || user?.city}, {defaultAddr.state || "Telangana"} {defaultAddr.pincode}
                                                        </p>
                                                        {defaultAddr.phone && (
                                                            <span className="addr-phone">📞 {defaultAddr.phone}</span>
                                                        )}
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <div className="empty-mini-state">
                                                <p>No saved addresses yet.</p>
                                                <button
                                                    type="button"
                                                    className="btn-mini-action"
                                                    onClick={handleOpenAddAddress}
                                                >
                                                    + Add Delivery Address
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Membership Status Card */}
                                    <div className="overview-card span-2">
                                        <div className="card-header-flex">
                                            <h3>Membership</h3>
                                            <Link to="/membership" className="card-text-btn">
                                                Manage Membership
                                            </Link>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", padding: "12px 0 6px" }}>
                                            <div>
                                                <span style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Current Tier</span>
                                                <PremiumMembershipBadge plan={user?.membership?.plan || user?.membership} size="lg" />
                                            </div>
                                            {user?.membership?.endDate ? (
                                                <div style={{ textAlign: "right" }}>
                                                    <span style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>Active Until</span>
                                                    <strong style={{ fontSize: "15px", color: "#1E293B" }}>{formatDate(user.membership.endDate)}</strong>
                                                </div>
                                            ) : (
                                                <div>
                                                    <Link to="/membership" className="btn-mini-action" style={{ textDecoration: "none" }}>
                                                        Upgrade Plan
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Wallet & Rewards Quick Snapshot */}
                                    <div className="overview-card span-2">
                                        <div className="card-header-flex">
                                            <h3>Wallet & Benefits</h3>
                                            <button
                                                type="button"
                                                className="card-text-btn"
                                                onClick={() => setActiveTab("wallet")}
                                            >
                                                Full Wallet Details
                                            </button>
                                        </div>
                                        <div className="wallet-benefits-row">
                                            <div className="wallet-balance-box">
                                                <span className="sub">FoodExpress Balance</span>
                                                <h4 className="balance-text">₹{stats.walletBalance.toLocaleString("en-IN")}</h4>
                                                <button
                                                    type="button"
                                                    className="btn-topup-inline"
                                                    onClick={() => setShowTopupModal(true)}
                                                >
                                                    <FaPlus /> Add Money
                                                </button>
                                            </div>

                                            <div className="reward-tier-box">
                                                <div className="tier-header">
                                                    <span className="tier-title">Loyalty Rewards</span>
                                                    <span className="tier-badge">{stats.rewardPoints} Points</span>
                                                </div>
                                                <div className="tier-progress-track">
                                                    <div
                                                        className="tier-progress-fill"
                                                        style={{
                                                            width: `${Math.min(100, (stats.rewardPoints / 1000) * 100)}%`
                                                        }}
                                                    />
                                                </div>
                                                <p className="tier-caption">
                                                    {1000 - (stats.rewardPoints % 1000)} points remaining to unlock Platinum Tier discounts!
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Orders Snapshot */}
                                    <div className="overview-card span-2">
                                        <div className="card-header-flex">
                                            <h3>Recent Orders</h3>
                                            <Link to="/my-orders" className="card-text-btn">
                                                View All Orders ({myOrders.length})
                                            </Link>
                                        </div>
                                        {myOrders.length > 0 ? (
                                            <div className="recent-orders-compact-list">
                                                {myOrders.slice(0, 3).map((order) => {
                                                    const formattedId = `#FE${(order._id || "").slice(-6).toUpperCase()}`;
                                                    const firstItem = order.items?.[0]?.food;
                                                    const totalItems = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1;

                                                    return (
                                                        <div key={order._id} className="recent-order-compact-item">
                                                            <div className="order-item-left">
                                                                <div className="order-id-date">
                                                                    <span className="order-id-pill">{formattedId}</span>
                                                                    <span className="order-date-text">{formatDate(order.createdAt)}</span>
                                                                </div>
                                                                <p className="order-items-snippet">
                                                                    {firstItem?.name || "Delicious Food Items"}
                                                                    {order.items?.length > 1 ? ` + ${order.items.length - 1} more` : ""}
                                                                    <span className="item-count-badge">({totalItems} items)</span>
                                                                </p>
                                                            </div>

                                                            <div className="order-item-right">
                                                                <div className="order-amt-status">
                                                                    <span className="order-price">₹{order.totalAmount || order.finalAmount}</span>
                                                                    <span className={`status-tag ${getStatusClass(order.orderStatus)}`}>
                                                                        {order.orderStatus || "Placed"}
                                                                    </span>
                                                                </div>
                                                                <div className="order-actions-mini">
                                                                    <button
                                                                        type="button"
                                                                        className="btn-reorder-mini"
                                                                        onClick={() => handleReorder(order)}
                                                                        title="Reorder items into cart"
                                                                    >
                                                                        <FaUtensils /> Reorder
                                                                    </button>
                                                                    <Link
                                                                        to={`/my-orders/${order._id}`}
                                                                        className="btn-view-mini"
                                                                    >
                                                                        Track
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="empty-mini-state">
                                                <p>No orders placed yet.</p>
                                                <Link to="/menu" className="btn-mini-action">
                                                    Browse Food & Order Now
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* TAB 2: PERSONAL INFORMATION */}
                        {/* ============================================================ */}
                        {activeTab === "personal" && (
                            <div className="panel-tab-pane">
                                <div className="panel-pane-header">
                                    <div>
                                        <h2 className="pane-title">Personal Information</h2>
                                        <p className="pane-subtitle">
                                            Update your personal details and delivery profile.
                                        </p>
                                    </div>
                                    {!isEditingPersonal && (
                                        <button
                                            type="button"
                                            className="btn-action-primary"
                                            onClick={() => setIsEditingPersonal(true)}
                                        >
                                            <FaEdit /> Edit Details
                                        </button>
                                    )}
                                </div>

                                {!isEditingPersonal ? (
                                    /* Read Only View */
                                    <div className="personal-details-view">
                                        <div className="details-card-box">
                                            <div className="details-grid-2col">
                                                <div className="detail-field">
                                                    <span className="field-label">Full Name</span>
                                                    <span className="field-value font-bold">
                                                        {user?.fullName || "Not provided"}
                                                    </span>
                                                </div>

                                                <div className="detail-field">
                                                    <span className="field-label">Email Address</span>
                                                    <span className="field-value">
                                                        {user?.email || "Not provided"}
                                                        <span className="inline-verified">✓ Verified</span>
                                                    </span>
                                                </div>

                                                <div className="detail-field">
                                                    <span className="field-label">Phone Number</span>
                                                    <span className="field-value">
                                                        {user?.phone || "Not provided"}
                                                    </span>
                                                </div>

                                                <div className="detail-field">
                                                    <span className="field-label">Current City</span>
                                                    <span className="field-value">
                                                        {user?.city || "Hyderabad"}
                                                    </span>
                                                </div>

                                                <div className="detail-field">
                                                    <span className="field-label">Date of Birth</span>
                                                    <span className="field-value">
                                                        {user?.dateOfBirth ? formatDate(user.dateOfBirth) : "Not specified"}
                                                    </span>
                                                </div>

                                                <div className="detail-field">
                                                    <span className="field-label">Gender</span>
                                                    <span className="field-value">
                                                        {user?.gender || "Prefer not to say"}
                                                    </span>
                                                </div>

                                                <div className="detail-field span-full">
                                                    <span className="field-label">Default Delivery Address</span>
                                                    <span className="field-value">
                                                        {user?.address || "No default address specified."}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="account-meta-box">
                                            <div className="meta-item">
                                                <span className="meta-lbl">Account Role:</span>
                                                <span className="meta-val capitalize">{user?.role || "Customer"}</span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-lbl">Account Status:</span>
                                                <span className="meta-val text-green">Active & Verified</span>
                                            </div>
                                            <div className="meta-item">
                                                <span className="meta-lbl">User ID:</span>
                                                <span className="meta-val code-font">{user?._id || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Edit Mode Form */
                                    <form className="personal-edit-form" onSubmit={handleUpdatePersonal}>
                                        <div className="form-grid-2col">
                                            <div className="form-group">
                                                <label className="form-label">
                                                    Full Name <span className="req">*</span>
                                                </label>
                                                <div className="input-with-icon">
                                                    <FaUser className="input-icon" />
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={personalForm.fullName}
                                                        onChange={(e) =>
                                                            setPersonalForm({ ...personalForm, fullName: e.target.value })
                                                        }
                                                        placeholder="Your full name"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Phone Number</label>
                                                <div className="input-with-icon">
                                                    <FaPhone className="input-icon" />
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        value={personalForm.phone}
                                                        onChange={(e) =>
                                                            setPersonalForm({ ...personalForm, phone: e.target.value })
                                                        }
                                                        placeholder="10-digit mobile number"
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">City</label>
                                                <div className="input-with-icon">
                                                    <FaMapMarkerAlt className="input-icon" />
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={personalForm.city}
                                                        onChange={(e) =>
                                                            setPersonalForm({ ...personalForm, city: e.target.value })
                                                        }
                                                        placeholder="e.g. Hyderabad, Bengaluru, etc."
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Date of Birth</label>
                                                <div className="input-with-icon">
                                                    <FaCalendarAlt className="input-icon" />
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={personalForm.dateOfBirth}
                                                        onChange={(e) =>
                                                            setPersonalForm({ ...personalForm, dateOfBirth: e.target.value })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Gender</label>
                                                <div className="input-with-icon">
                                                    <FaVenusMars className="input-icon" />
                                                    <select
                                                        className="form-control"
                                                        value={personalForm.gender}
                                                        onChange={(e) =>
                                                            setPersonalForm({ ...personalForm, gender: e.target.value })
                                                        }
                                                    >
                                                        <option value="Prefer not to say">Prefer not to say</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-group span-full">
                                                <label className="form-label">Primary Delivery Address</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    value={personalForm.address}
                                                    onChange={(e) =>
                                                        setPersonalForm({ ...personalForm, address: e.target.value })
                                                    }
                                                    placeholder="Enter your flat/house, street, area, landmark"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-actions-bar">
                                            <button
                                                type="submit"
                                                className="btn-action-save"
                                                disabled={loading}
                                            >
                                                {loading ? <FaSyncAlt className="spin-icon" /> : <FaCheck />}
                                                <span>{loading ? "Saving Changes..." : "Save Changes"}</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-action-cancel"
                                                onClick={() => setIsEditingPersonal(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* TAB 3: SAVED ADDRESSES */}
                        {/* ============================================================ */}
                        {activeTab === "addresses" && (
                            <div className="panel-tab-pane">
                                <div className="panel-pane-header">
                                    <div>
                                        <h2 className="pane-title">Saved Addresses</h2>
                                        <p className="pane-subtitle">
                                            Manage your delivery locations for fast 1-click checkout.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-action-primary"
                                        onClick={handleOpenAddAddress}
                                    >
                                        <FaPlus /> Add New Address
                                    </button>
                                </div>

                                {savedAddresses.length > 0 ? (
                                    <div className="saved-addresses-grid">
                                        {savedAddresses.map((addr) => {
                                            const isHome = (addr.title || "").toLowerCase().includes("home");
                                            const isWork = (addr.title || "").toLowerCase().includes("work");
                                            const IconComponent = isHome ? FaHome : isWork ? FaBriefcase : FaMapPin;

                                            return (
                                                <div
                                                    key={addr._id}
                                                    className={`address-card ${addr.isDefault ? "is-default" : ""}`}
                                                >
                                                    <div className="address-card-header">
                                                        <div className="addr-type-cluster">
                                                            <div className="addr-icon-circle">
                                                                <IconComponent />
                                                            </div>
                                                            <div>
                                                                <h4 className="addr-title-text">{addr.title || "Address"}</h4>
                                                                {addr.isDefault && (
                                                                    <span className="default-pill">
                                                                        <FaCheck /> Default
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="addr-card-menu">
                                                            <button
                                                                type="button"
                                                                className="btn-addr-icon"
                                                                onClick={() => handleOpenEditAddress(addr)}
                                                                title="Edit Address"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn-addr-icon btn-addr-delete"
                                                                onClick={() => handleDeleteAddress(addr._id)}
                                                                title="Delete Address"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="address-card-body">
                                                        <p className="addr-contact-person">
                                                            {addr.fullName || user?.fullName}
                                                            {addr.phone ? ` • ${addr.phone}` : ""}
                                                        </p>
                                                        <p className="addr-text-details">
                                                            {addr.houseNo ? `${addr.houseNo}, ` : ""}
                                                            {addr.street ? `${addr.street}, ` : ""}
                                                            {addr.landmark ? `Near ${addr.landmark}, ` : ""}
                                                            {addr.address && !addr.street && !addr.houseNo ? `${addr.address}, ` : ""}
                                                            {addr.city || user?.city || "Hyderabad"}, {addr.state || "Telangana"} {addr.pincode}
                                                        </p>
                                                    </div>

                                                    <div className="address-card-footer">
                                                        {!addr.isDefault ? (
                                                            <button
                                                                type="button"
                                                                className="btn-make-default"
                                                                onClick={() => handleSetDefaultAddress(addr._id)}
                                                            >
                                                                Set as Default Address
                                                            </button>
                                                        ) : (
                                                            <span className="default-status-note">
                                                                ✓ Selected as your active checkout address
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="empty-panel-state">
                                        <div className="empty-icon-circle">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <h3>No Saved Addresses Yet</h3>
                                        <p>Save your home, office, or frequently visited addresses for seamless ordering.</p>
                                        <button
                                            type="button"
                                            className="btn-action-primary"
                                            onClick={handleOpenAddAddress}
                                        >
                                            <FaPlus /> Add Your First Address
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* TAB 4: ORDERS & ACTIVITY */}
                        {/* ============================================================ */}
                        {activeTab === "orders" && (
                            <div className="panel-tab-pane">
                                <div className="panel-pane-header">
                                    <div>
                                        <h2 className="pane-title">Orders & Activity</h2>
                                        <p className="pane-subtitle">
                                            Review your order history, track active orders, or reorder dishes.
                                        </p>
                                    </div>
                                    <Link to="/my-orders" className="btn-action-primary">
                                        Open My Orders Page <FaArrowRight />
                                    </Link>
                                </div>

                                {loadingOrders ? (
                                    <div className="panel-loading-spinner">
                                        <FaSyncAlt className="spin-icon" />
                                        <p>Loading your orders...</p>
                                    </div>
                                ) : myOrders.length > 0 ? (
                                    <div className="orders-full-list">
                                        {myOrders.map((order) => {
                                            const formattedId = `#FE${(order._id || "").slice(-6).toUpperCase()}`;
                                            const itemCount = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;

                                            return (
                                                <div key={order._id} className="order-history-card">
                                                    <div className="oh-card-header">
                                                        <div className="oh-left">
                                                            <span className="oh-id-badge">{formattedId}</span>
                                                            <span className="oh-date">{formatDate(order.createdAt)}</span>
                                                        </div>
                                                        <div className="oh-right">
                                                            <span className={`status-tag ${getStatusClass(order.orderStatus)}`}>
                                                                {order.orderStatus || "Placed"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="oh-items-list">
                                                        {order.items?.map((item, idx) => (
                                                            <div key={idx} className="oh-item-row">
                                                                <span className="oh-item-qty">{item.quantity}x</span>
                                                                <span className="oh-item-name">{item.food?.name || item.name || "Food Item"}</span>
                                                                <span className="oh-item-price">₹{item.price * (item.quantity || 1)}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="oh-card-footer">
                                                        <div className="oh-summary-text">
                                                            <span>Total ({itemCount} items): </span>
                                                            <span className="oh-total-price">₹{order.totalAmount || order.finalAmount}</span>
                                                            <span className="oh-payment-method">• {order.paymentMethod || "COD"}</span>
                                                        </div>

                                                        <div className="oh-actions-group">
                                                            <button
                                                                type="button"
                                                                className="btn-reorder-action"
                                                                onClick={() => handleReorder(order)}
                                                            >
                                                                <FaUtensils /> Reorder
                                                            </button>
                                                            <Link
                                                                to={`/my-orders/${order._id}`}
                                                                className="btn-track-action"
                                                            >
                                                                View Tracking
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="empty-panel-state">
                                        <div className="empty-icon-circle">
                                            <FaReceipt />
                                        </div>
                                        <h3>No Orders Yet</h3>
                                        <p>You haven't placed any food orders yet. Explore our delicious menu!</p>
                                        <Link to="/menu" className="btn-action-primary">
                                            Browse Food Menu
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* TAB 5: WALLET & REWARDS */}
                        {/* ============================================================ */}
                        {activeTab === "wallet" && (
                            <div className="panel-tab-pane">
                                <div className="panel-pane-header">
                                    <div>
                                        <h2 className="pane-title">FoodExpress Wallet & Rewards</h2>
                                        <p className="pane-subtitle">
                                            Enjoy 1-click checkout with instant refunds and zero payment failures.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-action-primary"
                                        onClick={() => setShowTopupModal(true)}
                                    >
                                        <FaPlus /> Add Money to Wallet
                                    </button>
                                </div>

                                <div className="wallet-overview-grid">
                                    {/* Balance Card */}
                                    <div className="wallet-big-card">
                                        <div className="wbc-top">
                                            <span className="wbc-label">AVAILABLE BALANCE</span>
                                            <div className="wbc-balance-display">
                                                <span className="currency">₹</span>
                                                <span className="amount">{stats.walletBalance.toLocaleString("en-IN")}</span>
                                            </div>
                                        </div>

                                        <div className="wbc-quick-actions">
                                            <button
                                                type="button"
                                                className="btn-wbc-add"
                                                onClick={() => setShowTopupModal(true)}
                                            >
                                                <FaPlus /> Add Money
                                            </button>
                                            <Link to="/menu" className="btn-wbc-pay">
                                                Order Food Now
                                            </Link>
                                        </div>

                                        <div className="wbc-perks">
                                            <span>✓ Instant Refunds</span>
                                            <span>✓ 100% Secure</span>
                                            <span>✓ No OTP Needed</span>
                                        </div>
                                    </div>

                                    {/* Rewards Tier Card */}
                                    <div className="rewards-big-card">
                                        <div className="rbc-header">
                                            <div>
                                                <span className="rbc-label">FOODEXPRESS REWARDS</span>
                                                <h3 className="rbc-tier-name">
                                                    {stats.rewardPoints >= 500 ? "Gold Member" : "Silver Member"}
                                                </h3>
                                            </div>
                                            <div className="rbc-points-bubble">
                                                <FaGift /> {stats.rewardPoints} Pts
                                            </div>
                                        </div>

                                        <div className="rbc-tier-progress">
                                            <div className="rbc-track">
                                                <div
                                                    className="rbc-fill"
                                                    style={{ width: `${Math.min(100, (stats.rewardPoints / 1000) * 100)}%` }}
                                                />
                                            </div>
                                            <div className="rbc-track-legend">
                                                <span>Silver (0 pts)</span>
                                                <span>Gold (500 pts)</span>
                                                <span>Platinum (1000 pts)</span>
                                            </div>
                                        </div>

                                        <div className="rbc-perks-list">
                                            <div className="perk-point">
                                                <FaCheck className="perk-chk" />
                                                <span>Earn 10% points on every completed order</span>
                                            </div>
                                            <div className="perk-point">
                                                <FaCheck className="perk-chk" />
                                                <span>Redeem points directly on checkout for cash discounts</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Transaction History */}
                                <div className="transactions-section">
                                    <div className="section-title-row">
                                        <h3>Recent Wallet Transactions</h3>
                                        <button
                                            type="button"
                                            className="card-text-btn"
                                            onClick={fetchUserData}
                                            title="Refresh Transactions"
                                        >
                                            <FaSyncAlt /> Refresh
                                        </button>
                                    </div>

                                    {loadingWallet ? (
                                        <div className="panel-loading-spinner">
                                            <FaSyncAlt className="spin-icon" />
                                            <p>Loading transactions...</p>
                                        </div>
                                    ) : transactions.length > 0 ? (
                                        <div className="tx-table-wrapper">
                                            <table className="tx-table">
                                                <thead>
                                                    <tr>
                                                        <th>Transaction</th>
                                                        <th>Method</th>
                                                        <th>Date</th>
                                                        <th>Status</th>
                                                        <th className="text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {transactions.map((tx) => {
                                                        const isCredit = tx.type === "credit";
                                                        return (
                                                            <tr key={tx._id}>
                                                                <td className="tx-desc-cell">
                                                                    <div className="tx-type-indicator">
                                                                        <span className={`tx-dot ${isCredit ? "tx-credit" : "tx-debit"}`}>
                                                                            {isCredit ? "+" : "-"}
                                                                        </span>
                                                                        <div>
                                                                            <span className="tx-title">{tx.description || tx.category || "Transaction"}</span>
                                                                            <span className="tx-id-sub">ID: {(tx._id || "").slice(-8)}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>{tx.paymentMethod || "UPI"}</td>
                                                                <td>{formatDate(tx.createdAt)}</td>
                                                                <td>
                                                                    <span className="status-tag status-delivered">
                                                                        {tx.status || "Success"}
                                                                    </span>
                                                                </td>
                                                                <td className={`tx-amt-cell ${isCredit ? "amt-credit" : "amt-debit"}`}>
                                                                    {isCredit ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="empty-tx-box">
                                            <FaMoneyBillWave className="empty-tx-icon" />
                                            <p>No wallet transactions yet. Add money to get started!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* TAB 6: FAVORITES & WISHLIST */}
                        {/* ============================================================ */}
                        {activeTab === "favorites" && (
                            <div className="panel-tab-pane">
                                <div className="panel-pane-header">
                                    <div>
                                        <h2 className="pane-title">Saved Favorites</h2>
                                        <p className="pane-subtitle">
                                            Your saved dishes for instant 1-click ordering.
                                        </p>
                                    </div>
                                    <Link to="/menu" className="btn-action-primary">
                                        Explore More Dishes
                                    </Link>
                                </div>

                                {favoriteFoods.length > 0 ? (
                                    <div className="favorites-grid">
                                        {favoriteFoods.map((food) => (
                                            <div key={food._id} className="fav-food-card">
                                                <div className="fav-food-img-wrap">
                                                    <img
                                                        src={getFoodImageUrl(food.image)}
                                                        alt={food.name}
                                                        className="fav-food-img"
                                                        onError={(e) => {
                                                            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600";
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn-fav-heart active"
                                                        onClick={() => toggleWishlist(food._id)}
                                                        title="Remove from favorites"
                                                    >
                                                        <FaHeart />
                                                    </button>
                                                    <span className="fav-category-tag">{food.category}</span>
                                                </div>

                                                <div className="fav-food-info">
                                                    <h4 className="fav-food-name">{food.name}</h4>
                                                    <p className="fav-food-desc">
                                                        {(food.description || "").slice(0, 75)}...
                                                    </p>

                                                    <div className="fav-food-footer">
                                                        <div className="fav-price-cluster">
                                                            <span className="fav-price">
                                                                ₹{food.discountPrice > 0 ? food.discountPrice : food.price}
                                                            </span>
                                                            {food.discountPrice > 0 && (
                                                                <span className="fav-original-price">₹{food.price}</span>
                                                            )}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="btn-fav-add-cart"
                                                            onClick={() => addToCart(food._id, 1)}
                                                        >
                                                            <FaPlus /> Add
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-panel-state">
                                        <div className="empty-icon-circle">
                                            <FaHeart />
                                        </div>
                                        <h3>No Favorites Saved Yet</h3>
                                        <p>Tap the heart icon on any food item to save it here for fast reordering!</p>
                                        <Link to="/menu" className="btn-action-primary">
                                            Explore Menu & Save Favorites
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* TAB 7: SECURITY & PASSWORD */}
                        {/* ============================================================ */}
                        {activeTab === "security" && (
                            <div className="panel-tab-pane">
                                <div className="panel-pane-header">
                                    <div>
                                        <h2 className="pane-title">Security & Password</h2>
                                        <p className="pane-subtitle">
                                            Protect your FoodExpress account with a robust password.
                                        </p>
                                    </div>
                                </div>

                                <div className="security-content-grid">
                                    <form className="password-change-form" onSubmit={handleChangePassword}>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Current Password <span className="req">*</span>
                                            </label>
                                            <div className="input-with-icon">
                                                <FaLock className="input-icon" />
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    value={passwordForm.currentPassword}
                                                    onChange={(e) =>
                                                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                                                    }
                                                    placeholder="Enter your existing password"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                New Password <span className="req">*</span>
                                            </label>
                                            <div className="input-with-icon">
                                                <FaLock className="input-icon" />
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) =>
                                                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                                                    }
                                                    placeholder="Minimum 6 characters"
                                                    required
                                                />
                                            </div>
                                            <span className="input-help-text">
                                                Use letters, numbers, and special characters for higher security.
                                            </span>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Confirm New Password <span className="req">*</span>
                                            </label>
                                            <div className="input-with-icon">
                                                <FaLock className="input-icon" />
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) =>
                                                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                                                    }
                                                    placeholder="Re-type new password"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-actions-bar">
                                            <button
                                                type="submit"
                                                className="btn-action-save"
                                                disabled={loading}
                                            >
                                                {loading ? <FaSyncAlt className="spin-icon" /> : <FaCheck />}
                                                <span>{loading ? "Updating..." : "Update Password"}</span>
                                            </button>
                                        </div>
                                    </form>

                                    <div className="security-tips-card">
                                        <div className="tips-header">
                                            <FaShieldAlt className="shield-icon" />
                                            <h4>Security Recommendations</h4>
                                        </div>
                                        <ul className="tips-list">
                                            <li>Never share your FoodExpress OTP or login password with anyone.</li>
                                            <li>Use a unique password not shared with other personal accounts.</li>
                                            <li>Keep your verified phone number updated for real-time delivery alerts.</li>
                                            <li>Logout from public devices when done ordering.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* TAB 8: NOTIFICATION PREFERENCES */}
                        {/* ============================================================ */}
                        {activeTab === "preferences" && (
                            <div className="panel-tab-pane">
                                <div className="panel-pane-header">
                                    <div>
                                        <h2 className="pane-title">Notification Preferences</h2>
                                        <p className="pane-subtitle">
                                            Choose how and when you want FoodExpress to contact you.
                                        </p>
                                    </div>
                                </div>

                                <div className="preferences-list-box">
                                    <div className="preference-item-row">
                                        <div className="pref-meta">
                                            <h4 className="pref-title">Order Status Updates</h4>
                                            <p className="pref-desc">
                                                Receive real-time notifications when your food is confirmed, prepared, and ready.
                                            </p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notifications.orderUpdates}
                                                onChange={() => handleToggleNotification("orderUpdates")}
                                            />
                                            <span className="toggle-slider" />
                                        </label>
                                    </div>

                                    <div className="preference-item-row">
                                        <div className="pref-meta">
                                            <h4 className="pref-title">Live Delivery Tracking</h4>
                                            <p className="pref-desc">
                                                Get SMS and app notifications when the delivery rider is on the way to your door.
                                            </p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notifications.deliveryUpdates}
                                                onChange={() => handleToggleNotification("deliveryUpdates")}
                                            />
                                            <span className="toggle-slider" />
                                        </label>
                                    </div>

                                    <div className="preference-item-row">
                                        <div className="pref-meta">
                                            <h4 className="pref-title">Exclusive Deals & Promo Codes</h4>
                                            <p className="pref-desc">
                                                Be the first to hear about weekend flash sales, discount coupons, and free delivery vouchers.
                                            </p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notifications.offersPromotions}
                                                onChange={() => handleToggleNotification("offersPromotions")}
                                            />
                                            <span className="toggle-slider" />
                                        </label>
                                    </div>

                                    <div className="preference-item-row">
                                        <div className="pref-meta">
                                            <h4 className="pref-title">Loyalty Points & Wallet Reminders</h4>
                                            <p className="pref-desc">
                                                Updates on points earned, tier status upgrades, and wallet top-up confirmations.
                                            </p>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={notifications.rewards}
                                                onChange={() => handleToggleNotification("rewards")}
                                            />
                                            <span className="toggle-slider" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ============================================================ */}
                        {/* TAB 9: HELP & SUPPORT */}
                        {/* ============================================================ */}
                        {activeTab === "support" && (
                            <div className="panel-tab-pane">
                                <div className="panel-pane-header">
                                    <div>
                                        <h2 className="pane-title">Help & Customer Care</h2>
                                        <p className="pane-subtitle">
                                            Have questions or issues with an order? We are here 24/7.
                                        </p>
                                    </div>
                                </div>

                                <div className="support-cards-grid">
                                    <div className="support-feature-card">
                                        <div className="sfc-icon-bubble bg-orange-soft">
                                            <FaReceipt />
                                        </div>
                                        <h4>Issue with an Order?</h4>
                                        <p>Report wrong items, missing items, or quality issues for immediate resolution.</p>
                                        <Link to="/my-orders" className="btn-sfc-action">
                                            View Orders
                                        </Link>
                                    </div>

                                    <div className="support-feature-card">
                                        <div className="sfc-icon-bubble bg-blue-soft">
                                            <FaWallet />
                                        </div>
                                        <h4>Wallet & Payment Queries</h4>
                                        <p>Get instant assistance regarding top-ups, failed transactions, and refunds.</p>
                                        <button
                                            type="button"
                                            className="btn-sfc-action"
                                            onClick={() => setActiveTab("wallet")}
                                        >
                                            View Wallet
                                        </button>
                                    </div>

                                    <div className="support-feature-card">
                                        <div className="sfc-icon-bubble bg-green-soft">
                                            <FaPhone />
                                        </div>
                                        <h4>Contact Customer Care</h4>
                                        <p>Reach out directly via email or call our toll-free support line anytime.</p>
                                        <a href="mailto:support@foodexpress.local" className="btn-sfc-action">
                                            Email Support
                                        </a>
                                    </div>
                                </div>

                                <div className="faq-quick-section">
                                    <h3>Frequently Asked Questions</h3>
                                    <div className="faq-accordion">
                                        <div className="faq-item">
                                            <h5>How do I redeem my FoodExpress Reward Points?</h5>
                                            <p>During checkout, your available reward points are automatically converted into cash discount credits.</p>
                                        </div>
                                        <div className="faq-item">
                                            <h5>How long does a wallet top-up take?</h5>
                                            <p>Wallet top-ups are instantaneous. Your balance updates immediately upon successful UPI or card verification.</p>
                                        </div>
                                        <div className="faq-item">
                                            <h5>Can I change my delivery address after placing an order?</h5>
                                            <p>Please contact support or track the order directly on the My Orders page before the rider picks up your package.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* ============================================================ */}
            {/* MODAL 1: ADD / EDIT ADDRESS MODAL */}
            {/* ============================================================ */}
            {showAddressModal && (
                <div className="profile-modal-backdrop" onClick={() => setShowAddressModal(false)}>
                    <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-card-header">
                            <h3>{editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}</h3>
                            <button
                                type="button"
                                className="btn-modal-close"
                                onClick={() => setShowAddressModal(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAddress} className="modal-address-form">
                            {/* Address Type Selector */}
                            <div className="address-type-selector">
                                {["Home", "Work", "Other"].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        className={`addr-type-chip ${addressForm.title === type ? "selected" : ""}`}
                                        onClick={() => setAddressForm({ ...addressForm, title: type })}
                                    >
                                        {type === "Home" && <FaHome />}
                                        {type === "Work" && <FaBriefcase />}
                                        {type === "Other" && <FaMapPin />}
                                        <span>{type}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="modal-form-grid">
                                <div className="form-group">
                                    <label className="form-label">Contact Name <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={addressForm.fullName}
                                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Contact Phone <span className="req">*</span></label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        value={addressForm.phone}
                                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                        placeholder="10-digit mobile"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Flat / House / Block No. <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={addressForm.houseNo}
                                        onChange={(e) => setAddressForm({ ...addressForm, houseNo: e.target.value })}
                                        placeholder="e.g. Flat 402, Sunshine Apts"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Street / Area <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={addressForm.street}
                                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                        placeholder="e.g. Hitech City Road"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Landmark (Optional)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={addressForm.landmark}
                                        onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                                        placeholder="e.g. Opposite Metro Pillar 42"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">City <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        placeholder="e.g. Hyderabad"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={addressForm.state}
                                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                        placeholder="e.g. Telangana"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">PIN Code</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={addressForm.pincode}
                                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                        placeholder="e.g. 500081"
                                    />
                                </div>
                            </div>

                            <div className="modal-checkbox-row">
                                <label className="custom-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={addressForm.isDefault}
                                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                    />
                                    <span>Make this my default delivery address</span>
                                </label>
                            </div>

                            <div className="modal-actions-bar">
                                <button
                                    type="submit"
                                    className="btn-action-save"
                                    disabled={loading}
                                >
                                    {loading ? <FaSyncAlt className="spin-icon" /> : <FaCheck />}
                                    <span>{loading ? "Saving Address..." : "Save Address"}</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn-action-cancel"
                                    onClick={() => setShowAddressModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MODAL 2: TOP-UP WALLET MODAL */}
            {/* ============================================================ */}
            {showTopupModal && (
                <div className="profile-modal-backdrop" onClick={() => setShowTopupModal(false)}>
                    <div className="profile-modal-card topup-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-card-header">
                            <h3>Add Money to FoodExpress Wallet</h3>
                            <button
                                type="button"
                                className="btn-modal-close"
                                onClick={() => setShowTopupModal(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="topup-modal-body">
                            <div className="current-balance-reminder">
                                <span>Current Balance:</span>
                                <strong>₹{stats.walletBalance.toLocaleString("en-IN")}</strong>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Enter Amount (₹)</label>
                                <input
                                    type="number"
                                    className="form-control text-2xl font-bold"
                                    value={topupAmount}
                                    onChange={(e) => setTopupAmount(Number(e.target.value))}
                                    min="10"
                                    max="50000"
                                />
                            </div>

                            {/* Preset Buttons */}
                            <div className="preset-amounts-row">
                                {PRESET_TOPUPS.map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        className={`preset-chip ${topupAmount === amt ? "active" : ""}`}
                                        onClick={() => setTopupAmount(amt)}
                                    >
                                        +₹{amt}
                                    </button>
                                ))}
                            </div>

                            <div className="form-group mt-4">
                                <label className="form-label">Payment Method</label>
                                <div className="payment-methods-select">
                                    {["UPI", "Card", "Net Banking"].map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            className={`method-chip ${topupMethod === m ? "active" : ""}`}
                                            onClick={() => setTopupMethod(m)}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-actions-bar mt-6">
                                <button
                                    type="button"
                                    className="btn-action-save w-full"
                                    onClick={handleAddMoney}
                                    disabled={topupLoading}
                                >
                                    {topupLoading ? <FaSyncAlt className="spin-icon" /> : <FaPlus />}
                                    <span>{topupLoading ? "Processing Top-up..." : `Add ₹${topupAmount} to Wallet`}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* MODAL 3: AVATAR CHANGE MODAL */}
            {/* ============================================================ */}
            {showAvatarModal && (
                <div className="profile-modal-backdrop" onClick={() => setShowAvatarModal(false)}>
                    <div className="profile-modal-card avatar-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-card-header">
                            <h3>Change Profile Picture</h3>
                            <button
                                type="button"
                                className="btn-modal-close"
                                onClick={() => setShowAvatarModal(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="avatar-modal-body">
                            <p className="modal-desc">
                                Choose an avatar preset or enter a direct image URL:
                            </p>

                            {/* Presets */}
                            <div className="avatar-presets-grid">
                                {[
                                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
                                    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200",
                                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
                                    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
                                    "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=200",
                                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
                                ].map((url, i) => (
                                    <div
                                        key={i}
                                        className="preset-avatar-thumb"
                                        onClick={() => handleSaveAvatar(url)}
                                    >
                                        <img src={url} alt={`Preset ${i}`} />
                                    </div>
                                ))}
                            </div>

                            <div className="divider-or">
                                <span>OR ENTER IMAGE URL</span>
                            </div>

                            <div className="form-group">
                                <input
                                    type="url"
                                    className="form-control"
                                    placeholder="https://example.com/avatar.jpg"
                                    value={avatarUrlInput}
                                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                                />
                            </div>

                            <div className="modal-actions-bar">
                                <button
                                    type="button"
                                    className="btn-action-save"
                                    onClick={() => handleSaveAvatar(avatarUrlInput)}
                                    disabled={loading || !avatarUrlInput}
                                >
                                    Save Image URL
                                </button>
                                <button
                                    type="button"
                                    className="btn-action-cancel"
                                    onClick={() => setShowAvatarModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
