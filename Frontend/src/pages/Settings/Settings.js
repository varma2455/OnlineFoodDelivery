import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { settingsAPI, authAPI } from "../../services/api";
import "./Settings.css";
import PremiumMembershipBadge from "../../components/PremiumMembershipBadge/PremiumMembershipBadge";
import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaLock,
    FaShieldAlt,
    FaBell,
    FaPalette,
    FaCreditCard,
    FaShoppingBag,
    FaWallet,
    FaGift,
    FaGlobe,
    FaUniversalAccess,
    FaDatabase,
    FaExclamationTriangle,
    FaHeadset,
    FaSignOutAlt,
    FaSave,
    FaUndo,
    FaCheck,
    FaCheckCircle,
    FaTimes,
    FaEdit,
    FaTrash,
    FaPlus,
    FaSearch,
    FaSun,
    FaMoon,
    FaDesktop,
    FaLaptop,
    FaEye,
    FaEyeSlash,
    FaArrowRight,
    FaDownload,
    FaAward,
    FaInfoCircle
} from "react-icons/fa";

// Navigation tabs definition with search keywords
const SETTINGS_SECTIONS = [
    { id: "account", label: "Account", icon: FaUser, keywords: ["name", "email", "phone", "profile", "avatar", "gender", "dob"] },
    { id: "security", label: "Security", icon: FaShieldAlt, keywords: ["password", "2fa", "two-factor", "sessions", "devices", "login"] },
    { id: "privacy", label: "Privacy", icon: FaLock, keywords: ["visibility", "recommendations", "tracking", "history", "viewed", "favorites"] },
    { id: "notifications", label: "Notifications", icon: FaBell, keywords: ["alerts", "email", "sms", "push", "orders", "offers", "rewards"] },
    { id: "appearance", label: "Appearance", icon: FaPalette, keywords: ["theme", "dark", "light", "font", "compact", "animations"] },
    { id: "location", label: "Location & Addresses", icon: FaMapMarkerAlt, keywords: ["address", "city", "home", "work", "delivery", "pincode"] },
    { id: "payments", label: "Payments", icon: FaCreditCard, keywords: ["upi", "card", "net banking", "cod", "billing", "methods"] },
    { id: "orders", label: "Order Preferences", icon: FaShoppingBag, keywords: ["instructions", "contactless", "food preference", "veg", "non-veg"] },
    { id: "wallet", label: "Wallet", icon: FaWallet, keywords: ["balance", "auto-use", "money", "credits", "topup"] },
    { id: "rewards", label: "Rewards", icon: FaGift, keywords: ["points", "tier", "vouchers", "membership", "discounts"] },
    { id: "language", label: "Language & Region", icon: FaGlobe, keywords: ["currency", "inr", "english", "date", "time", "format"] },
    { id: "accessibility", label: "Accessibility", icon: FaUniversalAccess, keywords: ["contrast", "large text", "screen reader", "motion", "keyboard"] },
    { id: "data", label: "Data Management", icon: FaDatabase, keywords: ["download", "export", "clear history", "json", "backup"] },
    { id: "danger", label: "Danger Zone", icon: FaExclamationTriangle, keywords: ["delete", "deactivate", "close", "disable account"] },
    { id: "support", label: "Support & Help", icon: FaHeadset, keywords: ["help", "ticket", "faq", "contact", "chat", "customer care"] }
];

const AVATAR_PRESETS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150"
];

const Settings = () => {
    const { token, user, setUser, refreshUser, logout, showToast, selectedArea, setSelectedArea, availableAreas } = useContext(StoreContext);
    const navigate = useNavigate();

    // Active Section State
    const [activeSection, setActiveSection] = useState("account");
    const [searchQuery, setSearchQuery] = useState("");

    // Loading & Network States
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Master Settings States
    const [originalSettings, setOriginalSettings] = useState(null);
    const [settingsState, setSettingsState] = useState(null);

    // Password Form State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Address Modal State
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

    // Card Modal State
    const [showCardModal, setShowCardModal] = useState(false);
    const [cardForm, setCardForm] = useState({
        cardHolder: "",
        last4: "",
        brand: "Visa",
        expMonth: "12",
        expYear: "2028",
        isDefault: true
    });

    // Danger Zone Modals
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    // Fetch initial settings from backend
    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await settingsAPI.getSettings();
            if (res.data?.success && res.data.settings) {
                setOriginalSettings(res.data.settings);
                setSettingsState(JSON.parse(JSON.stringify(res.data.settings)));
            }
        } catch (err) {
            console.error("Error loading settings:", err);
            showToast("Failed to load settings. Please refresh.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (token) {
            fetchSettings();
        }
    }, [token, fetchSettings]);

    // Check if there are unsaved changes
    const isDirty = useMemo(() => {
        if (!originalSettings || !settingsState) return false;
        const origStr = JSON.stringify({
            user: settingsState.user,
            preferences: settingsState.preferences
        });
        const currStr = JSON.stringify({
            user: originalSettings.user,
            preferences: originalSettings.preferences
        });
        return origStr !== currStr;
    }, [originalSettings, settingsState]);

    // Apply client-side accessibility & appearance classes to document
    useEffect(() => {
        if (!settingsState?.preferences) return;
        const { appearance, accessibility } = settingsState.preferences;

        // Theme
        if (appearance?.theme === "dark") {
            document.body.classList.add("dark-theme");
        } else {
            document.body.classList.remove("dark-theme");
        }

        // Reduced motion
        if (appearance?.reducedMotion || accessibility?.reducedMotion) {
            document.body.classList.add("reduced-motion");
        } else {
            document.body.classList.remove("reduced-motion");
        }

        // Font size
        document.body.classList.remove("font-small", "font-medium", "font-large");
        if (appearance?.fontSize) {
            document.body.classList.add(`font-${appearance.fontSize}`);
        }

        // High contrast
        if (accessibility?.highContrast) {
            document.body.classList.add("high-contrast-mode");
        } else {
            document.body.classList.remove("high-contrast-mode");
        }
    }, [settingsState?.preferences]);

    // Handle Deep Preference State Change
    const updatePref = (section, key, value) => {
        setSettingsState((prev) => {
            const next = { ...prev };
            if (!next.preferences) next.preferences = {};
            if (!next.preferences[section]) next.preferences[section] = {};

            if (typeof key === "object" && key !== null) {
                next.preferences[section] = {
                    ...next.preferences[section],
                    ...key
                };
            } else {
                next.preferences[section] = {
                    ...next.preferences[section],
                    [key]: value
                };
            }
            return { ...next };
        });
    };

    // Handle User Personal Details Change
    const updateUserField = (field, value) => {
        setSettingsState((prev) => ({
            ...prev,
            user: {
                ...prev.user,
                [field]: value
            }
        }));
    };

    // Save All Settings to Backend
    const handleSaveAllSettings = async () => {
        if (!isDirty || isSaving) return;
        setIsSaving(true);
        try {
            const payload = {
                personal: {
                    fullName: settingsState.user.fullName,
                    phone: settingsState.user.phone,
                    city: settingsState.user.city,
                    address: settingsState.user.address,
                    dateOfBirth: settingsState.user.dateOfBirth,
                    gender: settingsState.user.gender,
                    profileImage: settingsState.user.profileImage
                },
                preferences: settingsState.preferences
            };

            const res = await settingsAPI.updateSettings(payload);
            if (res.data?.success) {
                showToast("All settings saved successfully! ✓", "success");
                setOriginalSettings(JSON.parse(JSON.stringify(settingsState)));
                if (res.data.user) {
                    setUser(res.data.user);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                }
                refreshUser();
            } else {
                showToast(res.data?.message || "Failed to save settings.", "error");
            }
        } catch (err) {
            console.error("Save settings error:", err);
            showToast(err.message || "Failed to persist settings.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    // Discard Unsaved Changes
    const handleDiscardChanges = () => {
        if (originalSettings) {
            setSettingsState(JSON.parse(JSON.stringify(originalSettings)));
            showToast("Changes discarded.", "info");
        }
    };

    // Quick Setting: Toggle Dark Mode
    const handleQuickToggleTheme = () => {
        const current = settingsState?.preferences?.appearance?.theme || "light";
        const nextTheme = current === "dark" ? "light" : "dark";
        updatePref("appearance", "theme", nextTheme);
    };

    // Quick Setting: Toggle All Notifications
    const handleQuickToggleNotifications = () => {
        const currentNotifs = settingsState?.preferences?.notifications || {};
        const isAnyEnabled = Object.values(currentNotifs).some((n) => n?.email || n?.push);
        const nextVal = !isAnyEnabled;

        const updated = {};
        Object.keys(currentNotifs).forEach((cat) => {
            updated[cat] = {
                email: nextVal,
                push: nextVal,
                sms: nextVal && currentNotifs[cat]?.sms !== undefined ? nextVal : false
            };
        });
        updatePref("notifications", updated);
        showToast(nextVal ? "Notifications enabled" : "Notifications muted", "info");
    };

    // Change Password Handler
    const handleChangePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
            showToast("New password must be at least 6 characters.", "error");
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast("New passwords do not match.", "error");
            return;
        }

        setIsChangingPassword(true);
        try {
            const res = await settingsAPI.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            if (res.data?.success) {
                showToast("Password changed successfully! 🔒", "success");
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                showToast(res.data?.message || "Password change failed.", "error");
            }
        } catch (err) {
            showToast(err.message || "Could not change password.", "error");
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Toggle 2FA
    const handleToggle2FA = async () => {
        const current = settingsState?.preferences?.security?.twoFactorEnabled;
        const nextVal = !current;
        try {
            const res = await settingsAPI.toggleTwoFactor(nextVal);
            if (res.data?.success) {
                updatePref("security", "twoFactorEnabled", nextVal);
                showToast(nextVal ? "2-Factor Authentication Enabled 🛡️" : "2-Factor Authentication Disabled", "success");
            }
        } catch (e) {
            showToast("Could not update 2FA status.", "error");
        }
    };

    // Invalidate other sessions
    const handleLogoutOtherDevices = async () => {
        try {
            const res = await settingsAPI.logoutOtherDevices();
            if (res.data?.success) {
                showToast("All other device sessions logged out successfully.", "success");
            }
        } catch (e) {
            showToast("Could not terminate other sessions.", "error");
        }
    };

    // Download My Data
    const handleDownloadUserData = async () => {
        try {
            showToast("Preparing your account data...", "info");
            const res = await settingsAPI.downloadUserData();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
            const downloadAnchor = document.createElement("a");
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `foodexpress-data-${user?._id || "account"}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast("Data downloaded successfully! 📁", "success");
        } catch (e) {
            showToast("Could not export data.", "error");
        }
    };

    // Clear Search History
    const handleClearSearchHistory = async () => {
        try {
            await settingsAPI.clearSearchHistory();
            showToast("Search history cleared.", "success");
        } catch (e) {
            showToast("Could not clear search history.", "error");
        }
    };

    // Clear Recently Viewed
    const handleClearRecentlyViewed = async () => {
        try {
            await settingsAPI.clearRecentlyViewed();
            showToast("Recently viewed items cleared.", "success");
        } catch (e) {
            showToast("Could not clear recently viewed items.", "error");
        }
    };

    // Address Management
    const handleOpenAddAddress = () => {
        setEditingAddressId(null);
        setAddressForm({
            title: "Home",
            fullName: user?.fullName || "",
            phone: user?.phone || "",
            houseNo: "",
            street: "",
            landmark: "",
            city: user?.city || selectedArea || "Hyderabad",
            state: "Telangana",
            pincode: "",
            isDefault: (settingsState?.user?.savedAddresses || []).length === 0
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
            street: addr.street || "",
            landmark: addr.landmark || "",
            city: addr.city || "",
            state: addr.state || "",
            pincode: addr.pincode || "",
            isDefault: Boolean(addr.isDefault)
        });
        setShowAddressModal(true);
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingAddressId) {
                res = await authAPI.updateAddress(editingAddressId, addressForm);
            } else {
                res = await authAPI.addAddress(addressForm);
            }

            if (res.data?.success) {
                showToast("Address saved successfully.", "success");
                setShowAddressModal(false);
                fetchSettings();
                refreshUser();
            }
        } catch (err) {
            showToast(err.message || "Failed to save address.", "error");
        }
    };

    const handleDeleteAddress = async (addrId) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        try {
            const res = await authAPI.deleteAddress(addrId);
            if (res.data?.success) {
                showToast("Address deleted.", "info");
                fetchSettings();
                refreshUser();
            }
        } catch (err) {
            showToast("Failed to delete address.", "error");
        }
    };

    const handleSetDefaultAddress = async (addrId) => {
        try {
            const res = await authAPI.setDefaultAddress(addrId);
            if (res.data?.success) {
                showToast("Default address updated.", "success");
                fetchSettings();
                refreshUser();
            }
        } catch (err) {
            showToast("Failed to set default address.", "error");
        }
    };

    // Safe Card Management
    const handleSaveCard = (e) => {
        e.preventDefault();
        if (!cardForm.last4 || cardForm.last4.length !== 4) {
            showToast("Please enter the last 4 digits of your card.", "error");
            return;
        }

        const currentCards = settingsState?.preferences?.payments?.savedCards || [];
        const newCard = {
            _id: "card_" + Date.now(),
            cardHolder: cardForm.cardHolder || user?.fullName || "Cardholder",
            last4: cardForm.last4,
            brand: cardForm.brand,
            expMonth: cardForm.expMonth,
            expYear: cardForm.expYear,
            isDefault: currentCards.length === 0 || cardForm.isDefault
        };

        const updatedCards = cardForm.isDefault
            ? [...currentCards.map((c) => ({ ...c, isDefault: false })), newCard]
            : [...currentCards, newCard];

        updatePref("payments", "savedCards", updatedCards);
        setShowCardModal(false);
        showToast("Payment method token added safely.", "success");
    };

    const handleRemoveCard = (cardId) => {
        const currentCards = settingsState?.preferences?.payments?.savedCards || [];
        const updated = currentCards.filter((c) => (c._id || c.last4) !== cardId);
        updatePref("payments", "savedCards", updated);
        showToast("Card removed.", "info");
    };

    // Deactivate Account
    const handleDeactivateAccount = async () => {
        try {
            const res = await settingsAPI.deactivateAccount();
            if (res.data?.success) {
                showToast("Account deactivated. Signing out...", "info");
                setShowDeactivateModal(false);
                setTimeout(() => logout(), 1200);
            }
        } catch (e) {
            showToast("Deactivation failed.", "error");
        }
    };

    // Delete Account
    const handleDeleteAccount = async () => {
        if (deleteConfirmationText !== "DELETE") {
            showToast("Please type DELETE exactly to proceed.", "error");
            return;
        }

        setIsDeletingAccount(true);
        try {
            const res = await settingsAPI.deleteAccount("DELETE");
            if (res.data?.success) {
                showToast("Account permanently deleted. Goodbye!", "info");
                setShowDeleteModal(false);
                setTimeout(() => logout(), 1500);
            } else {
                showToast(res.data?.message || "Deletion failed.", "error");
            }
        } catch (e) {
            showToast("Account deletion failed.", "error");
        } finally {
            setIsDeletingAccount(false);
        }
    };

    // Filter Sections by Search Query
    const filteredSections = useMemo(() => {
        if (!searchQuery.trim()) return SETTINGS_SECTIONS;
        const q = searchQuery.toLowerCase().trim();
        return SETTINGS_SECTIONS.filter((s) => {
            const titleMatch = s.label.toLowerCase().includes(q);
            const keyMatch = s.keywords?.some((k) => k.toLowerCase().includes(q));
            return titleMatch || keyMatch;
        });
    }, [searchQuery]);

    // User details shorthand
    const activeUser = settingsState?.user || user || {};
    const prefs = settingsState?.preferences || {};

    if (loading && !settingsState) {
        return (
            <div className="settings-page-container">
                <div className="settings-skeleton-hero skeleton" />
                <div className="settings-layout-two-column">
                    <div className="settings-nav-panel skeleton" style={{ height: 420 }} />
                    <div className="settings-content-pane skeleton" style={{ height: 500 }} />
                </div>
            </div>
        );
    }

    return (
        <div className="settings-page-container">
            {/* ===================================================
                1. SETTINGS HERO HEADER
                =================================================== */}
            <header className="settings-hero-header">
                <div className="hero-profile-row">
                    <div className="hero-avatar-wrapper">
                        <img
                            src={activeUser.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                            alt={activeUser.fullName || "User Avatar"}
                            className="hero-avatar-img"
                            onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
                            }}
                        />
                        <span className="role-pill-badge">{activeUser.role || "customer"}</span>
                    </div>

                    <div className="hero-info-text">
                        <div className="hero-title-strip">
                            <h1 className="settings-main-title">Settings</h1>
                            {activeUser.isVerified && (
                                <span className="verified-badge" title="Verified Account">
                                    <FaCheckCircle /> Verified
                                </span>
                            )}
                        </div>
                        <p className="settings-subtitle">
                            Manage your FoodExpress account, privacy, security, order preferences, and notification channels.
                        </p>
                        <div className="hero-user-meta-chips">
                            <span className="meta-chip">
                                <FaUser /> {activeUser.fullName || "FoodExpress Member"}
                            </span>
                            <span className="meta-chip">
                                <FaEnvelope /> {activeUser.email || "user@foodexpress.in"}
                            </span>
                            {activeUser.phone && (
                                <span className="meta-chip">
                                    <FaPhone /> {activeUser.phone}
                                </span>
                            )}
                            <Link to="/membership" style={{ textDecoration: "none" }} title="Manage Membership">
                                <PremiumMembershipBadge plan={activeUser?.membership?.plan || activeUser?.membership} size="sm" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Quick Settings Action Bar */}
                <div className="quick-settings-bar">
                    <div className="quick-setting-item" onClick={handleQuickToggleTheme}>
                        <span className="qs-icon">
                            {prefs.appearance?.theme === "dark" ? <FaMoon /> : <FaSun />}
                        </span>
                        <div className="qs-label-wrap">
                            <span className="qs-title">Theme</span>
                            <span className="qs-val">{prefs.appearance?.theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
                        </div>
                    </div>

                    <div className="quick-setting-item" onClick={handleQuickToggleNotifications}>
                        <span className="qs-icon"><FaBell /></span>
                        <div className="qs-label-wrap">
                            <span className="qs-title">Notifications</span>
                            <span className="qs-val">Quick Toggle</span>
                        </div>
                    </div>

                    <div className="quick-setting-item" onClick={() => setActiveSection("location")}>
                        <span className="qs-icon"><FaMapMarkerAlt /></span>
                        <div className="qs-label-wrap">
                            <span className="qs-title">City / Area</span>
                            <span className="qs-val">{selectedArea || "Hyderabad"}</span>
                        </div>
                    </div>

                    <div className="quick-setting-item" onClick={() => setActiveSection("wallet")}>
                        <span className="qs-icon"><FaWallet /></span>
                        <div className="qs-label-wrap">
                            <span className="qs-title">Wallet</span>
                            <span className="qs-val">₹{activeUser.wallet || 0}</span>
                        </div>
                    </div>

                    <div className="quick-setting-item" onClick={() => setActiveSection("language")}>
                        <span className="qs-icon"><FaGlobe /></span>
                        <div className="qs-label-wrap">
                            <span className="qs-title">Language</span>
                            <span className="qs-val">English (IN)</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ===================================================
                2. SEARCH SETTINGS BAR
                =================================================== */}
            <div className="settings-search-toolbar">
                <div className="settings-search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search settings (e.g. 'password', 'notifications', 'theme', 'addresses')..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                            <FaTimes />
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <span className="search-matches-count">
                        Found {filteredSections.length} matching section{filteredSections.length === 1 ? "" : "s"}
                    </span>
                )}
            </div>

            {/* ===================================================
                3. TWO-COLUMN LAYOUT (NAV PANEL + CONTENT PANE)
                =================================================== */}
            <div className="settings-layout-two-column">
                {/* LEFT: Settings Navigation Panel */}
                <aside className="settings-nav-panel">
                    <h3 className="nav-panel-heading">Preferences</h3>
                    <ul className="settings-nav-list">
                        {filteredSections.map((sec) => {
                            const IconComponent = sec.icon;
                            const isActive = activeSection === sec.id;
                            return (
                                <li key={sec.id}>
                                    <button
                                        type="button"
                                        className={`nav-tab-btn ${isActive ? "active" : ""} ${sec.id === "danger" ? "danger-tab" : ""}`}
                                        onClick={() => {
                                            setActiveSection(sec.id);
                                            window.scrollTo({ top: 180, behavior: "smooth" });
                                        }}
                                    >
                                        <IconComponent className="tab-icon" />
                                        <span className="tab-label">{sec.label}</span>
                                        <FaArrowRight className="tab-arrow" />
                                    </button>
                                </li>
                            );
                        })}
                        <li>
                            <button
                                type="button"
                                className="nav-tab-btn logout-tab"
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to log out of FoodExpress?")) {
                                        logout();
                                        navigate("/login");
                                    }
                                }}
                            >
                                <FaSignOutAlt className="tab-icon" />
                                <span className="tab-label">Log Out</span>
                            </button>
                        </li>
                    </ul>
                </aside>

                {/* RIGHT: Selected Settings Content */}
                <main className="settings-content-pane">
                    {/* TAB 1: ACCOUNT SETTINGS */}
                    {activeSection === "account" && (
                        <section className="settings-card-section">
                            <div className="section-card-header">
                                <div>
                                    <h2 className="section-card-title">Personal Information</h2>
                                    <p className="section-card-subtitle">Manage your personal identification, contact details, and display avatar</p>
                                </div>
                            </div>

                            <div className="settings-form-grid">
                                <div className="form-field-group full-width avatar-picker-row">
                                    <label className="field-label">Profile Avatar</label>
                                    <div className="avatar-selection-cluster">
                                        <img
                                            src={activeUser.profileImage || AVATAR_PRESETS[0]}
                                            alt="Current Avatar"
                                            className="current-avatar-preview"
                                        />
                                        <div className="avatar-preset-strip">
                                            {AVATAR_PRESETS.map((pUrl, idx) => (
                                                <img
                                                    key={idx}
                                                    src={pUrl}
                                                    alt={`Preset ${idx + 1}`}
                                                    className={`preset-thumb ${activeUser.profileImage === pUrl ? "selected" : ""}`}
                                                    onClick={() => updateUserField("profileImage", pUrl)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-field-group">
                                    <label className="field-label">Full Name *</label>
                                    <input
                                        type="text"
                                        className="text-input"
                                        value={activeUser.fullName || ""}
                                        onChange={(e) => updateUserField("fullName", e.target.value)}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div className="form-field-group">
                                    <label className="field-label">Email Address (Account ID)</label>
                                    <input
                                        type="email"
                                        className="text-input readonly"
                                        value={activeUser.email || ""}
                                        disabled
                                        title="Email cannot be changed directly for security reasons."
                                    />
                                </div>

                                <div className="form-field-group">
                                    <label className="field-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="text-input"
                                        value={activeUser.phone || ""}
                                        onChange={(e) => updateUserField("phone", e.target.value)}
                                        placeholder="e.g. +91 9876543210"
                                    />
                                </div>

                                <div className="form-field-group">
                                    <label className="field-label">Primary City</label>
                                    <select
                                        className="select-input"
                                        value={activeUser.city || selectedArea || "Hyderabad"}
                                        onChange={(e) => {
                                            updateUserField("city", e.target.value);
                                            setSelectedArea(e.target.value);
                                        }}
                                    >
                                        {availableAreas.map((city) => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-field-group">
                                    <label className="field-label">Date of Birth</label>
                                    <input
                                        type="date"
                                        className="text-input"
                                        value={activeUser.dateOfBirth || ""}
                                        onChange={(e) => updateUserField("dateOfBirth", e.target.value)}
                                    />
                                </div>

                                <div className="form-field-group">
                                    <label className="field-label">Gender</label>
                                    <select
                                        className="select-input"
                                        value={activeUser.gender || ""}
                                        onChange={(e) => updateUserField("gender", e.target.value)}
                                    >
                                        <option value="">Prefer not to say</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="form-field-group full-width">
                                    <label className="field-label">Default Delivery Street Address</label>
                                    <input
                                        type="text"
                                        className="text-input"
                                        value={activeUser.address || ""}
                                        onChange={(e) => updateUserField("address", e.target.value)}
                                        placeholder="House / Flat No., Street, Landmark"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* TAB 2: SECURITY SETTINGS */}
                    {activeSection === "security" && (
                        <div className="settings-tab-stack">
                            <section className="settings-card-section">
                                <div className="section-card-header">
                                    <div>
                                        <h2 className="section-card-title">Change Password</h2>
                                        <p className="section-card-subtitle">Ensure your FoodExpress account is secured with a strong alphanumeric password</p>
                                    </div>
                                </div>

                                <form onSubmit={handleChangePasswordSubmit} className="settings-form-grid">
                                    <div className="form-field-group full-width">
                                        <label className="field-label">Current Password</label>
                                        <div className="pw-input-wrapper">
                                            <input
                                                type={showCurrentPw ? "text" : "password"}
                                                className="text-input"
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                className="pw-toggle-btn"
                                                onClick={() => setShowCurrentPw(!showCurrentPw)}
                                            >
                                                {showCurrentPw ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-field-group">
                                        <label className="field-label">New Password</label>
                                        <div className="pw-input-wrapper">
                                            <input
                                                type={showNewPw ? "text" : "password"}
                                                className="text-input"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                placeholder="Minimum 6 characters"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="pw-toggle-btn"
                                                onClick={() => setShowNewPw(!showNewPw)}
                                            >
                                                {showNewPw ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-field-group">
                                        <label className="field-label">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="text-input"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            placeholder="Re-type new password"
                                            required
                                        />
                                    </div>

                                    <div className="form-field-group full-width form-actions-row">
                                        <button
                                            type="submit"
                                            className="btn-primary-action"
                                            disabled={isChangingPassword || !passwordForm.newPassword}
                                        >
                                            <FaLock /> {isChangingPassword ? "Updating..." : "Update Password"}
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <section className="settings-card-section">
                                <div className="section-card-header">
                                    <div>
                                        <h2 className="section-card-title">Two-Factor Authentication (2FA)</h2>
                                        <p className="section-card-subtitle">Add an extra verification shield during sign-in to protect orders and wallet</p>
                                    </div>
                                    <label className="toggle-switch-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(prefs.security?.twoFactorEnabled)}
                                            onChange={handleToggle2FA}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>
                                <div className="info-callout-box">
                                    <FaShieldAlt className="callout-icon" />
                                    <p>
                                        {prefs.security?.twoFactorEnabled
                                            ? "Two-Factor Authentication is currently ACTIVE. Verification OTPs are sent to your registered email when logging in from new devices."
                                            : "Two-Factor Authentication is currently DISABLED. Toggle to require OTP codes upon sign in for enhanced protection."}
                                    </p>
                                </div>
                            </section>

                            <section className="settings-card-section">
                                <div className="section-card-header">
                                    <div>
                                        <h2 className="section-card-title">Active Login Sessions</h2>
                                        <p className="section-card-subtitle">Manage devices currently logged into your FoodExpress account</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-secondary-action"
                                        onClick={handleLogoutOtherDevices}
                                    >
                                        Log Out Other Devices
                                    </button>
                                </div>

                                <div className="sessions-list">
                                    {(settingsState?.sessions || []).map((sess) => (
                                        <div key={sess.id} className="session-item-row">
                                            <div className="session-device-icon">
                                                <FaLaptop />
                                            </div>
                                            <div className="session-meta-info">
                                                <strong>{sess.device}</strong>
                                                <span className="session-sub">
                                                    IP: {sess.ip} • Last active: {new Date(sess.lastActive).toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <span className="session-status-pill active">
                                                Current Device
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* TAB 3: PRIVACY SETTINGS */}
                    {activeSection === "privacy" && (
                        <section className="settings-card-section">
                            <div className="section-card-header">
                                <div>
                                    <h2 className="section-card-title">Privacy & Personalization</h2>
                                    <p className="section-card-subtitle">Control your profile discoverability, recommendations, and activity tracking</p>
                                </div>
                            </div>

                            <div className="preference-toggle-list">
                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Profile Visibility</h4>
                                        <p>Choose whether your public reviews and recommendations can display your full name</p>
                                    </div>
                                    <select
                                        className="select-input compact"
                                        value={prefs.privacy?.profileVisibility || "public"}
                                        onChange={(e) => updatePref("privacy", "profileVisibility", e.target.value)}
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>

                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Personalized Food Recommendations</h4>
                                        <p>Use your dish browsing history and preferences to curate tailored restaurant dishes on your home feed</p>
                                    </div>
                                    <label className="toggle-switch-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={prefs.privacy?.personalizedRecommendations !== false}
                                            onChange={(e) => updatePref("privacy", "personalizedRecommendations", e.target.checked)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>

                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Order History Personalization</h4>
                                        <p>Allow FoodExpress to offer one-click re-orders and favorite combination offers based on previous meals</p>
                                    </div>
                                    <label className="toggle-switch-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={prefs.privacy?.orderHistoryPersonalization !== false}
                                            onChange={(e) => updatePref("privacy", "orderHistoryPersonalization", e.target.checked)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>

                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Location Access & Precision Tracking</h4>
                                        <p>Use GPS location to calculate accurate delivery ETA and display restaurants delivering to your exact doorstep</p>
                                    </div>
                                    <label className="toggle-switch-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={prefs.privacy?.locationTracking !== false}
                                            onChange={(e) => updatePref("privacy", "locationTracking", e.target.checked)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>

                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Search History Storage</h4>
                                        <p>Save recent queries to speed up searches for your favorite biryanis, pizzas, and cuisines</p>
                                    </div>
                                    <div className="dual-action-wrap">
                                        <button type="button" className="btn-small-clear" onClick={handleClearSearchHistory}>
                                            Clear History
                                        </button>
                                        <label className="toggle-switch-wrapper">
                                            <input
                                                type="checkbox"
                                                checked={prefs.privacy?.searchHistoryEnabled !== false}
                                                onChange={(e) => updatePref("privacy", "searchHistoryEnabled", e.target.checked)}
                                            />
                                            <span className="toggle-slider" />
                                        </label>
                                    </div>
                                </div>

                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Recently Viewed Tracking</h4>
                                        <p>Keep track of dishes you viewed recently to help you decide what to order next</p>
                                    </div>
                                    <div className="dual-action-wrap">
                                        <button type="button" className="btn-small-clear" onClick={handleClearRecentlyViewed}>
                                            Clear Viewed
                                        </button>
                                        <label className="toggle-switch-wrapper">
                                            <input
                                                type="checkbox"
                                                checked={prefs.privacy?.recentlyViewedEnabled !== false}
                                                onChange={(e) => updatePref("privacy", "recentlyViewedEnabled", e.target.checked)}
                                            />
                                            <span className="toggle-slider" />
                                        </label>
                                    </div>
                                </div>

                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Favorites & Wishlist Privacy</h4>
                                        <p>Hide your liked dishes and saved restaurants from any social or collaborative lists</p>
                                    </div>
                                    <label className="toggle-switch-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(prefs.privacy?.favoritesPrivate)}
                                            onChange={(e) => updatePref("privacy", "favoritesPrivate", e.target.checked)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* TAB 4: NOTIFICATION SETTINGS */}
                    {activeSection === "notifications" && (
                        <section className="settings-card-section">
                            <div className="section-card-header">
                                <div>
                                    <h2 className="section-card-title">Notification Channels</h2>
                                    <p className="section-card-subtitle">Configure how and when you receive order updates, flash deals, and wallet alerts</p>
                                </div>
                                <div className="bulk-notif-btns">
                                    <button
                                        type="button"
                                        className="btn-pill-small"
                                        onClick={() => {
                                            const notifs = prefs.notifications || {};
                                            const enabled = {};
                                            Object.keys(notifs).forEach((k) => {
                                                enabled[k] = { email: true, push: true, sms: true };
                                            });
                                            updatePref("notifications", enabled);
                                            showToast("All notifications enabled", "info");
                                        }}
                                    >
                                        Enable All
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-pill-small outline"
                                        onClick={() => {
                                            const notifs = prefs.notifications || {};
                                            const disabled = {};
                                            Object.keys(notifs).forEach((k) => {
                                                disabled[k] = { email: false, push: false, sms: false };
                                            });
                                            updatePref("notifications", disabled);
                                            showToast("All notifications muted", "info");
                                        }}
                                    >
                                        Mute All
                                    </button>
                                </div>
                            </div>

                            <div className="notifications-table-card">
                                <div className="notif-table-header">
                                    <span className="col-cat">Category</span>
                                    <span className="col-channel">Email</span>
                                    <span className="col-channel">Push</span>
                                    <span className="col-channel">SMS</span>
                                </div>

                                {[
                                    { key: "orderUpdates", title: "Order Status Updates", desc: "Live meal confirmation, chef prep, and delivery milestones" },
                                    { key: "deliveryUpdates", title: "Rider & Delivery Alerts", desc: "Rider assignment, arrival alerts, and live tracking" },
                                    { key: "offersPromotions", title: "Offers & Discounts", desc: "Weekend flash sales, restaurant coupons, and promo codes" },
                                    { key: "walletAlerts", title: "Wallet & Transactions", desc: "Cashbacks, top-up receipts, and balance deductions" },
                                    { key: "rewardsAlerts", title: "Rewards & Tier Points", desc: "Milestone points, tier upgrades, and voucher expiry warnings" },
                                    { key: "accountSecurity", title: "Security & Logins", desc: "New device logins, password resets, and verification codes" },
                                    { key: "supportAlerts", title: "Customer Care & Tickets", desc: "Support replies, ticket resolutions, and satisfaction checks" }
                                ].map((row) => {
                                    const catVal = prefs.notifications?.[row.key] || { email: true, push: true, sms: false };
                                    return (
                                        <div key={row.key} className="notif-table-row">
                                            <div className="notif-row-meta">
                                                <h4>{row.title}</h4>
                                                <p>{row.desc}</p>
                                            </div>
                                            <div className="notif-row-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(catVal.email)}
                                                    onChange={(e) =>
                                                        updatePref("notifications", row.key, { ...catVal, email: e.target.checked })
                                                    }
                                                />
                                            </div>
                                            <div className="notif-row-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(catVal.push)}
                                                    onChange={(e) =>
                                                        updatePref("notifications", row.key, { ...catVal, push: e.target.checked })
                                                    }
                                                />
                                            </div>
                                            <div className="notif-row-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(catVal.sms)}
                                                    onChange={(e) =>
                                                        updatePref("notifications", row.key, { ...catVal, sms: e.target.checked })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* TAB 5: APPEARANCE SETTINGS */}
                    {activeSection === "appearance" && (
                        <section className="settings-card-section">
                            <div className="section-card-header">
                                <div>
                                    <h2 className="section-card-title">Appearance & Theme</h2>
                                    <p className="section-card-subtitle">Personalize your visual experience across FoodExpress</p>
                                </div>
                            </div>

                            <div className="appearance-theme-cards-grid">
                                {[
                                    { id: "light", label: "Light Mode", icon: FaSun, desc: "Crisp, clean white cards with vibrant orange accents" },
                                    { id: "dark", label: "Dark Mode", icon: FaMoon, desc: "Sleek slate dark interface, easier on the eyes at night" },
                                    { id: "system", label: "System Default", icon: FaDesktop, desc: "Automatically sync with your operating system preference" }
                                ].map((thm) => {
                                    const IconC = thm.icon;
                                    const isSel = (prefs.appearance?.theme || "light") === thm.id;
                                    return (
                                        <div
                                            key={thm.id}
                                            className={`theme-selection-card ${isSel ? "selected" : ""}`}
                                            onClick={() => updatePref("appearance", "theme", thm.id)}
                                        >
                                            <div className="theme-card-icon"><IconC /></div>
                                            <h3 className="theme-name">{thm.label}</h3>
                                            <p className="theme-desc">{thm.desc}</p>
                                            {isSel && <span className="active-check"><FaCheck /></span>}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="preference-toggle-list" style={{ marginTop: 24 }}>
                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Compact Listing Mode</h4>
                                        <p>Display food items and restaurant cards with reduced padding to fit more dishes per row</p>
                                    </div>
                                    <label className="toggle-switch-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(prefs.appearance?.compactMode)}
                                            onChange={(e) => updatePref("appearance", "compactMode", e.target.checked)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>

                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Reduced Motion & Animations</h4>
                                        <p>Disable transitions, floating effects, and banner zooms for an ultra-smooth, lightweight performance</p>
                                    </div>
                                    <label className="toggle-switch-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(prefs.appearance?.reducedMotion)}
                                            onChange={(e) => updatePref("appearance", "reducedMotion", e.target.checked)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>

                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Font Size</h4>
                                        <p>Scale overall typography for improved readability across pages</p>
                                    </div>
                                    <div className="font-size-button-group">
                                        {["small", "medium", "large"].map((sz) => (
                                            <button
                                                key={sz}
                                                type="button"
                                                className={`btn-font-size ${(prefs.appearance?.fontSize || "medium") === sz ? "active" : ""}`}
                                                onClick={() => updatePref("appearance", "fontSize", sz)}
                                            >
                                                {sz.charAt(0).toUpperCase() + sz.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* TAB 6: LOCATION & ADDRESSES */}
                    {activeSection === "location" && (
                        <section className="settings-card-section">
                            <div className="section-card-header">
                                <div>
                                    <h2 className="section-card-title">Saved Delivery Addresses</h2>
                                    <p className="section-card-subtitle">Manage your home, office, and other locations for fast checkout</p>
                                </div>
                                <button type="button" className="btn-primary-action" onClick={handleOpenAddAddress}>
                                    <FaPlus /> Add New Address
                                </button>
                            </div>

                            <div className="addresses-card-grid">
                                {(settingsState?.user?.savedAddresses || []).length === 0 ? (
                                    <div className="empty-addresses-box">
                                        <FaMapMarkerAlt className="empty-icon" />
                                        <h3>No saved addresses found</h3>
                                        <p>Add a delivery address to easily order food without retyping details each time.</p>
                                        <button type="button" className="btn-primary-action" onClick={handleOpenAddAddress}>
                                            <FaPlus /> Add First Address
                                        </button>
                                    </div>
                                ) : (
                                    settingsState.user.savedAddresses.map((addr) => (
                                        <div key={addr._id} className={`address-item-card ${addr.isDefault ? "default" : ""}`}>
                                            <div className="address-card-header">
                                                <span className="addr-tag">{addr.title || "Home"}</span>
                                                {addr.isDefault && <span className="default-pill">Default</span>}
                                            </div>
                                            <h4 className="addr-name">{addr.fullName || activeUser.fullName}</h4>
                                            <p className="addr-street">{addr.address || `${addr.houseNo} ${addr.street}`}</p>
                                            <p className="addr-city">{addr.city || selectedArea} {addr.pincode ? `- ${addr.pincode}` : ""}</p>
                                            {addr.phone && <p className="addr-phone">📞 {addr.phone}</p>}

                                            <div className="address-actions-bar">
                                                {!addr.isDefault && (
                                                    <button
                                                        type="button"
                                                        className="btn-set-default"
                                                        onClick={() => handleSetDefaultAddress(addr._id)}
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    className="btn-icon-action"
                                                    title="Edit Address"
                                                    onClick={() => handleOpenEditAddress(addr)}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-icon-action delete"
                                                    title="Delete Address"
                                                    onClick={() => handleDeleteAddress(addr._id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    )}

                    {/* TAB 7: PAYMENT SETTINGS */}
                    {activeSection === "payments" && (
                        <div className="settings-tab-stack">
                            <section className="settings-card-section">
                                <div className="section-card-header">
                                    <div>
                                        <h2 className="section-card-title">Payment Preferences</h2>
                                        <p className="section-card-subtitle">Manage your preferred payment options for quick and secure checkout</p>
                                    </div>
                                </div>

                                <div className="settings-form-grid">
                                    <div className="form-field-group">
                                        <label className="field-label">Default Checkout Payment Method</label>
                                        <select
                                            className="select-input"
                                            value={prefs.payments?.defaultMethod || "UPI"}
                                            onChange={(e) => updatePref("payments", "defaultMethod", e.target.value)}
                                        >
                                            <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                                            <option value="Card">Credit / Debit Card</option>
                                            <option value="Wallet">FoodExpress Wallet Balance</option>
                                            <option value="NetBanking">Net Banking</option>
                                            <option value="COD">Cash on Delivery</option>
                                        </select>
                                    </div>

                                    <div className="form-field-group">
                                        <label className="field-label">Preferred UPI ID (VPA)</label>
                                        <input
                                            type="text"
                                            className="text-input"
                                            placeholder="e.g. yourname@okhdfcbank"
                                            value={prefs.payments?.savedUPIId || ""}
                                            onChange={(e) => updatePref("payments", "savedUPIId", e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="settings-card-section">
                                <div className="section-card-header">
                                    <div>
                                        <h2 className="section-card-title">Saved Cards (Safe Tokenized)</h2>
                                        <p className="section-card-subtitle">We never store full card numbers or CVV. Only safe display tokens are retained.</p>
                                    </div>
                                    <button type="button" className="btn-primary-action" onClick={() => setShowCardModal(true)}>
                                        <FaPlus /> Add Saved Card
                                    </button>
                                </div>

                                <div className="saved-cards-cluster">
                                    {(prefs.payments?.savedCards || []).length === 0 ? (
                                        <p className="no-cards-text">No payment cards currently saved. Click above to add a safe tokenized card.</p>
                                    ) : (
                                        prefs.payments.savedCards.map((card, idx) => (
                                            <div key={card._id || idx} className="saved-card-pill">
                                                <FaCreditCard className="card-brand-icon" />
                                                <div className="card-pill-meta">
                                                    <strong>{card.brand} •••• {card.last4}</strong>
                                                    <span>Exp: {card.expMonth}/{card.expYear} • {card.cardHolder}</span>
                                                </div>
                                                {card.isDefault && <span className="card-default-badge">Default</span>}
                                                <button
                                                    type="button"
                                                    className="card-remove-btn"
                                                    title="Remove card"
                                                    onClick={() => handleRemoveCard(card._id || card.last4)}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* TAB 8: ORDER PREFERENCES */}
                    {activeSection === "orders" && (
                        <section className="settings-card-section">
                            <div className="section-card-header">
                                <div>
                                    <h2 className="section-card-title">Order & Delivery Preferences</h2>
                                    <p className="section-card-subtitle">Set your favorite default delivery instructions and dietary requirements</p>
                                </div>
                            </div>

                            <div className="settings-form-grid">
                                <div className="form-field-group">
                                    <label className="field-label">Dietary & Food Preference</label>
                                    <select
                                        className="select-input"
                                        value={prefs.orders?.foodPreference || "all"}
                                        onChange={(e) => updatePref("orders", "foodPreference", e.target.value)}
                                    >
                                        <option value="all">All Dishes (Veg & Non-Veg)</option>
                                        <option value="veg">Pure Vegetarian Only (🌱 Green badge)</option>
                                        <option value="non-veg">Non-Vegetarian Focused (🍗)</option>
                                    </select>
                                </div>

                                <div className="form-field-group">
                                    <label className="field-label">Default Delivery Instructions</label>
                                    <select
                                        className="select-input"
                                        value={prefs.orders?.deliveryInstructions || ""}
                                        onChange={(e) => updatePref("orders", "deliveryInstructions", e.target.value)}
                                    >
                                        <option value="">-- None --</option>
                                        <option value="Leave at door">Leave package at doorstep</option>
                                        <option value="Do not ring bell">Do not ring bell (Baby sleeping / pets)</option>
                                        <option value="Call upon arrival">Call me upon arriving</option>
                                        <option value="Leave with security">Leave package with building security guard</option>
                                    </select>
                                </div>

                                <div className="form-field-group full-width">
                                    <div className="pref-toggle-item" style={{ border: "none", padding: 0 }}>
                                        <div className="pref-text">
                                            <h4>Contactless Delivery by Default</h4>
                                            <p>Our delivery partner will drop off your package at your doorstep and notify you via message</p>
                                        </div>
                                        <label className="toggle-switch-wrapper">
                                            <input
                                                type="checkbox"
                                                checked={Boolean(prefs.orders?.contactlessDelivery)}
                                                onChange={(e) => updatePref("orders", "contactlessDelivery", e.target.checked)}
                                            />
                                            <span className="toggle-slider" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* TAB 9: WALLET PREFERENCES */}
                    {activeSection === "wallet" && (
                        <section className="settings-card-section">
                            <div className="section-card-header">
                                <div>
                                    <h2 className="section-card-title">FoodExpress Wallet Preferences</h2>
                                    <p className="section-card-subtitle">Control automated wallet balance usage and top-ups</p>
                                </div>
                            </div>

                            <div className="wallet-balance-highlight-banner">
                                <div>
                                    <span className="banner-label">Current Balance</span>
                                    <h3 className="banner-amount">₹{activeUser.wallet || 0}</h3>
                                </div>
                                <div className="banner-actions">
                                    <Link to="/profile" className="btn-wallet-cta">
                                        View Transactions
                                    </Link>
                                </div>
                            </div>

                            <div className="preference-toggle-list" style={{ marginTop: 24 }}>
                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Auto-Use Wallet Balance at Checkout</h4>
                                        <p>Automatically apply any available FoodExpress Wallet credits before charging secondary payment methods</p>
                                    </div>
                                    <label className="toggle-switch-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(prefs.wallet?.autoUseWallet)}
                                            onChange={(e) => updatePref("wallet", "autoUseWallet", e.target.checked)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>

                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Instant Refund Destination</h4>
                                        <p>Route order cancellations and refund amounts directly to your instant FoodExpress Wallet</p>
                                    </div>
                                    <span className="badge-active-feature">Always Active (Instant)</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* TAB 10: REWARDS PREFERENCES */}
                    {activeSection === "rewards" && (
                        <section className="settings-card-section">
                            <div className="section-card-header">
                                <div>
                                    <h2 className="section-card-title">Rewards & Tier Preferences</h2>
                                    <p className="section-card-subtitle">Manage FoodExpress Star Points and automated coupon redemptions</p>
                                </div>
                            </div>

                            <div className="rewards-balance-highlight-banner">
                                <div>
                                    <span className="banner-label">Rewards Points Available</span>
                                    <h3 className="banner-amount">⭐ {activeUser.rewardPoints || 0} Points</h3>
                                    <div style={{ marginTop: "8px" }}>
                                        <Link to="/membership" style={{ textDecoration: "none" }} title="Manage Membership">
                                            <PremiumMembershipBadge plan={activeUser?.membership?.plan || activeUser?.membership} size="sm" />
                                        </Link>
                                    </div>
                                </div>
                                <div className="banner-actions">
                                    <Link to="/rewards" className="btn-rewards-cta">
                                        Open Rewards Catalog
                                    </Link>
                                </div>
                            </div>

                            <div className="preference-toggle-list" style={{ marginTop: 24 }}>
                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Auto-Apply Best Eligible Rewards</h4>
                                        <p>Automatically discover and apply the highest discount voucher or coupon code in your cart</p>
                                    </div>
                                    <label className="toggle-switch-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={prefs.rewards?.autoApplyEligibleRewards !== false}
                                            onChange={(e) => updatePref("rewards", "autoApplyEligibleRewards", e.target.checked)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* TAB 11: LANGUAGE & REGION */}
                    {activeSection === "language" && (
                        <section className="settings-card-section">
                            <div className="section-card-header">
                                <div>
                                    <h2 className="section-card-title">Language & Regional Formats</h2>
                                    <p className="section-card-subtitle">Configure application language, regional currency, and datetime displays</p>
                                </div>
                            </div>

                            <div className="settings-form-grid">
                                <div className="form-field-group">
                                    <label className="field-label">Interface Language</label>
                                    <select
                                        className="select-input"
                                        value={prefs.languageRegion?.language || "English"}
                                        onChange={(e) => updatePref("languageRegion", "language", e.target.value)}
                                    >
                                        <option value="English">English (Indian English)</option>
                                        <option value="Hindi" disabled>Hindi (हिंदी) - Coming Soon</option>
                                        <option value="Telugu" disabled>Telugu (తెలుగు) - Coming Soon</option>
                                        <option value="Tamil" disabled>Tamil (தமிழ்) - Coming Soon</option>
                                    </select>
                                </div>

                                <div className="form-field-group">
                                    <label className="field-label">Currency Display</label>
                                    <input
                                        type="text"
                                        className="text-input readonly"
                                        value="INR (₹) - Indian Rupee"
                                        disabled
                                    />
                                </div>

                                <div className="form-field-group">
                                    <label className="field-label">Date Format</label>
                                    <select
                                        className="select-input"
                                        value={prefs.languageRegion?.dateFormat || "DD/MM/YYYY"}
                                        onChange={(e) => updatePref("languageRegion", "dateFormat", e.target.value)}
                                    >
                                        <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 12/09/2026)</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/12/2026)</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-12)</option>
                                    </select>
                                </div>

                                <div className="form-field-group">
                                    <label className="field-label">Time Format</label>
                                    <select
                                        className="select-input"
                                        value={prefs.languageRegion?.timeFormat || "12-hour (AM/PM)"}
                                        onChange={(e) => updatePref("languageRegion", "timeFormat", e.target.value)}
                                    >
                                        <option value="12-hour (AM/PM)">12-hour (e.g. 09:45 PM)</option>
                                        <option value="24-hour">24-hour (e.g. 21:45)</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* TAB 12: ACCESSIBILITY */}
                    {activeSection === "accessibility" && (
                        <section className="settings-card-section">
                            <div className="section-card-header">
                                <div>
                                    <h2 className="section-card-title">Accessibility Options</h2>
                                    <p className="section-card-subtitle">Tools to ensure an inclusive, accessible ordering experience for all users</p>
                                </div>
                            </div>

                            <div className="preference-toggle-list">
                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>High Contrast Mode</h4>
                                        <p>Increases text contrast and borders to assist users with visual sensitivities</p>
                                    </div>
                                    <label className="toggle-switch-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(prefs.accessibility?.highContrast)}
                                            onChange={(e) => updatePref("accessibility", "highContrast", e.target.checked)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>

                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Screen Reader Optimized Semantics</h4>
                                        <p>Enriches headings, order tracker nodes, and buttons with detailed ARIA announcements</p>
                                    </div>
                                    <label className="toggle-switch-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={prefs.accessibility?.screenReaderFriendly !== false}
                                            onChange={(e) => updatePref("accessibility", "screenReaderFriendly", e.target.checked)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>

                                <div className="pref-toggle-item">
                                    <div className="pref-text">
                                        <h4>Enhanced Keyboard Focus Outlines</h4>
                                        <p>Displays clear, high-visibility orange rings when navigating via Tab and arrow keys</p>
                                    </div>
                                    <label className="toggle-switch-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={prefs.accessibility?.keyboardNavigation !== false}
                                            onChange={(e) => updatePref("accessibility", "keyboardNavigation", e.target.checked)}
                                        />
                                        <span className="toggle-slider" />
                                    </label>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* TAB 13: DATA MANAGEMENT */}
                    {activeSection === "data" && (
                        <section className="settings-card-section">
                            <div className="section-card-header">
                                <div>
                                    <h2 className="section-card-title">Data & Privacy Management</h2>
                                    <p className="section-card-subtitle">Download a portable copy of your account data or clear search and browsing footprints</p>
                                </div>
                            </div>

                            <div className="data-management-actions-grid">
                                <div className="data-action-card">
                                    <div className="action-card-icon"><FaDownload /></div>
                                    <div className="action-card-body">
                                        <h3>Download My Data</h3>
                                        <p>Export your full profile, order logs, wallet ledger, and preferences as a structured JSON file</p>
                                        <button type="button" className="btn-primary-action" onClick={handleDownloadUserData}>
                                            <FaDownload /> Download JSON Archive
                                        </button>
                                    </div>
                                </div>

                                <div className="data-action-card">
                                    <div className="action-card-icon"><FaTrash /></div>
                                    <div className="action-card-body">
                                        <h3>Clear Search History</h3>
                                        <p>Erase cached food searches, query autocomplete records, and recent searches</p>
                                        <button type="button" className="btn-secondary-action" onClick={handleClearSearchHistory}>
                                            Clear Search Footprint
                                        </button>
                                    </div>
                                </div>

                                <div className="data-action-card">
                                    <div className="action-card-icon"><FaUndo /></div>
                                    <div className="action-card-body">
                                        <h3>Clear Recently Viewed Dishes</h3>
                                        <p>Remove the trail of menu items you recently opened from your browsing cache</p>
                                        <button type="button" className="btn-secondary-action" onClick={handleClearRecentlyViewed}>
                                            Clear Viewed Cache
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* TAB 14: DANGER ZONE */}
                    {activeSection === "danger" && (
                        <section className="settings-card-section danger-zone-section">
                            <div className="section-card-header">
                                <div>
                                    <h2 className="section-card-title danger">Danger Zone</h2>
                                    <p className="section-card-subtitle">Irreversible and destructive account operations. Please proceed with caution.</p>
                                </div>
                            </div>

                            <div className="danger-zone-card-item">
                                <div>
                                    <h4>Deactivate Account</h4>
                                    <p>Temporarily disable your profile and hide your information. You can reactivate anytime by simply logging back in.</p>
                                </div>
                                <button
                                    type="button"
                                    className="btn-danger-outline"
                                    onClick={() => setShowDeactivateModal(true)}
                                >
                                    Deactivate Account
                                </button>
                            </div>

                            <div className="danger-zone-card-item delete-item">
                                <div>
                                    <h4>Permanently Delete Account</h4>
                                    <p>Permanently remove your account, saved delivery addresses, favorites, and profile data from our databases.</p>
                                </div>
                                <button
                                    type="button"
                                    className="btn-danger-solid"
                                    onClick={() => {
                                        setDeleteConfirmationText("");
                                        setShowDeleteModal(true);
                                    }}
                                >
                                    Delete Account
                                </button>
                            </div>
                        </section>
                    )}

                    {/* TAB 15: SUPPORT & HELP */}
                    {activeSection === "support" && (
                        <section className="settings-card-section">
                            <div className="section-card-header">
                                <div>
                                    <h2 className="section-card-title">Help & Customer Care</h2>
                                    <p className="section-card-subtitle">Need assistance with your orders, payment turnaround, or FoodExpress features?</p>
                                </div>
                            </div>

                            <div className="support-shortcuts-grid">
                                <Link to="/support" className="support-shortcut-card">
                                    <FaHeadset className="sc-icon" />
                                    <h3>Care Center Home</h3>
                                    <p>Browse FAQs, search help guides, and report problems</p>
                                    <span className="sc-link">Open Support <FaArrowRight /></span>
                                </Link>

                                <Link to="/my-orders" className="support-shortcut-card">
                                    <FaShoppingBag className="sc-icon" />
                                    <h3>Recent Order Help</h3>
                                    <p>Track live delivery status or request cancellations</p>
                                    <span className="sc-link">Track Orders <FaArrowRight /></span>
                                </Link>

                                <Link to="/rewards" className="support-shortcut-card">
                                    <FaGift className="sc-icon" />
                                    <h3>Rewards & Benefits</h3>
                                    <p>Redeem coupons, discover vouchers, and check points</p>
                                    <span className="sc-link">View Rewards <FaArrowRight /></span>
                                </Link>
                            </div>
                        </section>
                    )}
                </main>
            </div>

            {/* 4. STICKY UNSAVED CHANGES FLOATING BAR */}
            {isDirty && (
                <aside className="unsaved-changes-floating-bar" aria-live="polite">
                    <div className="unsaved-meta">
                        <FaInfoCircle className="info-icon" />
                        <span>You have unsaved changes in your settings.</span>
                    </div>
                    <div className="unsaved-buttons">
                        <button
                            type="button"
                            className="btn-discard"
                            onClick={handleDiscardChanges}
                            disabled={isSaving}
                        >
                            <FaUndo /> Discard
                        </button>
                        <button
                            type="button"
                            className="btn-save-floating"
                            onClick={handleSaveAllSettings}
                            disabled={isSaving}
                        >
                            <FaSave /> {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </aside>
            )}

            {/* MODAL 1: ADD/EDIT SAVED ADDRESS */}
            {showAddressModal && (
                <div className="settings-modal-backdrop" onClick={() => setShowAddressModal(false)}>
                    <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowAddressModal(false)}>
                            <FaTimes />
                        </button>
                        <h3 className="modal-title">{editingAddressId ? "Edit Address" : "Add Delivery Address"}</h3>

                        <form onSubmit={handleSaveAddress} className="modal-form-grid">
                            <div className="form-field-group">
                                <label className="field-label">Address Title</label>
                                <select
                                    className="select-input"
                                    value={addressForm.title}
                                    onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                                >
                                    <option value="Home">Home</option>
                                    <option value="Work">Work / Office</option>
                                    <option value="Other">Other Location</option>
                                </select>
                            </div>

                            <div className="form-field-group">
                                <label className="field-label">Contact Person</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={addressForm.fullName}
                                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                                    placeholder="Full name"
                                    required
                                />
                            </div>

                            <div className="form-field-group">
                                <label className="field-label">Contact Phone</label>
                                <input
                                    type="tel"
                                    className="text-input"
                                    value={addressForm.phone}
                                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                    placeholder="Phone number"
                                    required
                                />
                            </div>

                            <div className="form-field-group">
                                <label className="field-label">House / Flat / Block No.</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={addressForm.houseNo}
                                    onChange={(e) => setAddressForm({ ...addressForm, houseNo: e.target.value })}
                                    placeholder="e.g. Flat 402, Tower B"
                                />
                            </div>

                            <div className="form-field-group full-width">
                                <label className="field-label">Street / Area / Landmark</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={addressForm.street}
                                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                    placeholder="Road, colony, or landmark"
                                    required
                                />
                            </div>

                            <div className="form-field-group">
                                <label className="field-label">City</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={addressForm.city}
                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-field-group">
                                <label className="field-label">Pincode</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={addressForm.pincode}
                                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                    placeholder="6-digit postal code"
                                    required
                                />
                            </div>

                            <div className="form-field-group full-width">
                                <label className="checkbox-label-inline">
                                    <input
                                        type="checkbox"
                                        checked={addressForm.isDefault}
                                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                    />
                                    <span>Set as my default delivery address</span>
                                </label>
                            </div>

                            <div className="modal-actions-bar">
                                <button type="button" className="btn-secondary-action" onClick={() => setShowAddressModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary-action">
                                    Save Address
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: ADD SAFE PAYMENT CARD */}
            {showCardModal && (
                <div className="settings-modal-backdrop" onClick={() => setShowCardModal(false)}>
                    <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowCardModal(false)}>
                            <FaTimes />
                        </button>
                        <h3 className="modal-title">Add Safe Card Token</h3>
                        <p className="modal-subtitle">We securely store only the cardholder name and last 4 digits for payment reference.</p>

                        <form onSubmit={handleSaveCard} className="modal-form-grid">
                            <div className="form-field-group full-width">
                                <label className="field-label">Name on Card</label>
                                <input
                                    type="text"
                                    className="text-input"
                                    value={cardForm.cardHolder}
                                    onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                                    placeholder="Cardholder Name"
                                    required
                                />
                            </div>

                            <div className="form-field-group">
                                <label className="field-label">Card Brand</label>
                                <select
                                    className="select-input"
                                    value={cardForm.brand}
                                    onChange={(e) => setCardForm({ ...cardForm, brand: e.target.value })}
                                >
                                    <option value="Visa">Visa</option>
                                    <option value="Mastercard">Mastercard</option>
                                    <option value="RuPay">RuPay</option>
                                    <option value="Amex">American Express</option>
                                </select>
                            </div>

                            <div className="form-field-group">
                                <label className="field-label">Last 4 Digits</label>
                                <input
                                    type="text"
                                    maxLength="4"
                                    className="text-input"
                                    value={cardForm.last4}
                                    onChange={(e) => setCardForm({ ...cardForm, last4: e.target.value.replace(/\D/g, "") })}
                                    placeholder="e.g. 4242"
                                    required
                                />
                            </div>

                            <div className="form-field-group">
                                <label className="field-label">Expiry Month</label>
                                <input
                                    type="text"
                                    maxLength="2"
                                    className="text-input"
                                    value={cardForm.expMonth}
                                    onChange={(e) => setCardForm({ ...cardForm, expMonth: e.target.value })}
                                    placeholder="MM (e.g. 12)"
                                    required
                                />
                            </div>

                            <div className="form-field-group">
                                <label className="field-label">Expiry Year</label>
                                <input
                                    type="text"
                                    maxLength="4"
                                    className="text-input"
                                    value={cardForm.expYear}
                                    onChange={(e) => setCardForm({ ...cardForm, expYear: e.target.value })}
                                    placeholder="YYYY (e.g. 2028)"
                                    required
                                />
                            </div>

                            <div className="modal-actions-bar">
                                <button type="button" className="btn-secondary-action" onClick={() => setShowCardModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary-action">
                                    Add Card
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: DEACTIVATE ACCOUNT CONFIRMATION */}
            {showDeactivateModal && (
                <div className="settings-modal-backdrop" onClick={() => setShowDeactivateModal(false)}>
                    <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowDeactivateModal(false)}>
                            <FaTimes />
                        </button>
                        <div className="danger-modal-icon-center">
                            <FaExclamationTriangle />
                        </div>
                        <h3 className="modal-title text-center">Deactivate FoodExpress Account?</h3>
                        <p className="modal-subtitle text-center">
                            Your account and reviews will be temporarily disabled. You can reactivate your profile anytime by signing back in with your credentials.
                        </p>
                        <div className="modal-actions-bar center">
                            <button type="button" className="btn-secondary-action" onClick={() => setShowDeactivateModal(false)}>
                                Keep My Account
                            </button>
                            <button type="button" className="btn-danger-solid" onClick={handleDeactivateAccount}>
                                Yes, Deactivate Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 4: DELETE ACCOUNT PERMANENT CONFIRMATION */}
            {showDeleteModal && (
                <div className="settings-modal-backdrop" onClick={() => setShowDeleteModal(false)}>
                    <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                            <FaTimes />
                        </button>
                        <div className="danger-modal-icon-center red">
                            <FaTrash />
                        </div>
                        <h3 className="modal-title text-center">Permanently Delete Account?</h3>
                        <p className="modal-subtitle text-center">
                            This action cannot be undone. All saved delivery addresses, favorites, and account credentials will be permanently erased.
                        </p>
                        <div className="delete-confirm-input-wrap">
                            <label>Type <strong>DELETE</strong> to confirm:</label>
                            <input
                                type="text"
                                className="text-input"
                                placeholder="DELETE"
                                value={deleteConfirmationText}
                                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                            />
                        </div>
                        <div className="modal-actions-bar center">
                            <button type="button" className="btn-secondary-action" onClick={() => setShowDeleteModal(false)}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn-danger-solid"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmationText !== "DELETE" || isDeletingAccount}
                            >
                                {isDeletingAccount ? "Deleting..." : "Permanently Delete Account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
