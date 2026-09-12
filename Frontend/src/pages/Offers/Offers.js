import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { offerAPI } from "../../services/api";
import "./Offers.css";
import {
    FaPercent,
    FaTag,
    FaClock,
    FaFire,
    FaStar,
    FaCheck,
    FaCopy,
    FaHeart,
    FaRegHeart,
    FaSearch,
    FaFilter,
    FaArrowRight,
    FaUtensils,
    FaMotorcycle,
    FaWallet,
    FaGift,
    FaTimes,
    FaInfoCircle,
    FaChevronRight,
    FaExclamationTriangle,
    FaSyncAlt,
    FaStore,
    FaPizzaSlice,
    FaShoppingBag
} from "react-icons/fa";

const CATEGORY_TABS = [
    { key: "all", label: "All", icon: <FaTag /> },
    { key: "food", label: "Food", icon: <FaUtensils /> },
    { key: "restaurants", label: "Restaurants", icon: <FaStore /> },
    { key: "delivery", label: "Delivery", icon: <FaMotorcycle /> },
    { key: "new_user", label: "New User", icon: <FaStar /> },
    { key: "wallet", label: "Wallet", icon: <FaWallet /> },
    { key: "rewards", label: "Rewards", icon: <FaGift /> },
    { key: "limited_time", label: "Limited Time", icon: <FaClock /> },
    { key: "saved", label: "Saved Offers", icon: <FaHeart /> }
];

const Offers = () => {
    const {
        token,
        user,
        cartItems,
        getTotalCartAmount,
        couponCode,
        applyCoupon,
        removeCoupon,
        discountAmount,
        appliedOffer,
        selectedArea,
        showToast
    } = useContext(StoreContext);

    const navigate = useNavigate();

    // Data States
    const [offers, setOffers] = useState([]);
    const [recommendedOffers, setRecommendedOffers] = useState([]);
    const [expiringSoonOffers, setExpiringSoonOffers] = useState([]);
    const [categoryCounts, setCategoryCounts] = useState({});
    const [totalAvailableCount, setTotalAvailableCount] = useState(0);

    // Filter & Search States
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState("best");

    // UI States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOfferModal, setSelectedOfferModal] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);
    const [applyingCode, setApplyingCode] = useState(null);
    const [savedOfferIds, setSavedOfferIds] = useState([]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch Offers from Backend
    const fetchOffers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                category: activeCategory,
                sort: sortBy,
                city: selectedArea || "Hyderabad"
            };
            if (debouncedSearch.trim()) {
                params.search = debouncedSearch.trim();
            }

            const res = await offerAPI.getOffers(params);
            const data = res.data;

            if (data.success) {
                setOffers(data.offers || []);
                setRecommendedOffers(data.recommended || []);
                setExpiringSoonOffers(data.expiringSoon || []);
                setCategoryCounts(data.counts || {});
                setTotalAvailableCount(data.totalAvailable || data.count || 0);

                // Collect saved offers
                const saved = (data.offers || []).filter((o) => o.isSaved).map((o) => o._id);
                setSavedOfferIds(saved);
            } else {
                setError(data.message || "Failed to load offers.");
            }
        } catch (err) {
            setError(err.message || "Unable to connect to offers server.");
        } finally {
            setLoading(false);
        }
    }, [activeCategory, debouncedSearch, sortBy, selectedArea]);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    // Current Cart Subtotal
    const cartSubtotal = useMemo(() => {
        return getTotalCartAmount();
    }, [getTotalCartAmount]);

    // Copy Promo Code to Clipboard
    const handleCopyCode = (code, e) => {
        if (e) e.stopPropagation();
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        showToast(`Promo code "${code}" copied to clipboard! 📋`, "success");
        setTimeout(() => setCopiedCode(null), 2500);
    };

    // Apply Offer to Cart / Checkout
    const handleApplyOffer = async (offer, e) => {
        if (e) e.stopPropagation();
        if (!offer || !offer.code) return;

        // Check if already applied
        if (couponCode === offer.code) {
            showToast(`Offer "${offer.code}" is already active in your cart!`, "info");
            navigate("/cart");
            return;
        }

        // Pre-check eligibility
        if (!offer.isEligible) {
            showToast(offer.ineligibilityReason || "You are not eligible for this offer.", "error");
            return;
        }

        setApplyingCode(offer.code);
        try {
            const res = await applyCoupon(offer.code, {
                subtotal: cartSubtotal,
                restaurant: ""
            });

            if (res.success) {
                if (cartSubtotal >= (offer.minimumOrderValue || 0) && cartSubtotal > 0) {
                    showToast(`Offer "${offer.code}" applied! You saved ₹${res.discount}. 🛍️`, "success");
                } else if (cartSubtotal === 0) {
                    showToast(`Promo code "${offer.code}" activated! Add food items to your cart to enjoy the discount.`, "info");
                }
            }
        } catch (err) {
            showToast(err.message || "Could not apply offer.", "error");
        } finally {
            setApplyingCode(null);
        }
    };

    // Toggle Bookmark / Save Offer
    const handleToggleSave = async (offer, e) => {
        if (e) e.stopPropagation();
        if (!token) {
            showToast("Please sign in to save your favorite offers.", "info");
            return;
        }

        try {
            const res = await offerAPI.toggleSaveOffer(offer._id);
            if (res.data?.success) {
                const isNowSaved = res.data.isSaved;
                setSavedOfferIds((prev) =>
                    isNowSaved ? [...prev, offer._id] : prev.filter((id) => id !== offer._id)
                );
                // Update local offer state
                setOffers((prev) =>
                    prev.map((o) => (o._id === offer._id ? { ...o, isSaved: isNowSaved } : o))
                );
                showToast(res.data.message || (isNowSaved ? "Offer saved! 🔖" : "Offer unsaved."), "success");
            }
        } catch (err) {
            showToast("Could not save offer.", "error");
        }
    };

    // Format Helpers
    const formatDate = (dateStr) => {
        if (!dateStr) return "Limited Period";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="offers-page-shell">
            <div className="offers-page-container">
                {/* 1. BREADCRUMBS */}
                <div className="offers-breadcrumbs">
                    <Link to="/dashboard">Dashboard</Link>
                    <span className="crumb-sep">/</span>
                    <span className="crumb-current">Offers & Deals</span>
                </div>

                {/* 2. HEADER SECTION */}
                <header className="offers-header-hero">
                    <div className="header-text-cluster">
                        <div className="header-eyebrow">
                            <FaPercent /> EXCLUSIVE FOODEXPRESS DISCOUNTS
                        </div>
                        <h1 className="offers-main-title">Offers & Deals</h1>
                        <p className="offers-main-subtitle">
                            Save more on your favorite food from top restaurants
                        </p>
                    </div>

                    <div className="header-meta-cluster">
                        <div className="available-deals-pill">
                            <span className="fire-icon">🔥</span>
                            <span className="deals-count">
                                {totalAvailableCount || offers.length}{" "}
                                {totalAvailableCount === 1 ? "offer" : "offers"} available in{" "}
                                <strong className="location-name">{selectedArea || "Hyderabad"}</strong>
                            </span>
                        </div>
                    </div>
                </header>

                {/* 3. SEARCH & SORT BAR */}
                <div className="offers-controls-bar">
                    <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            className="offers-search-input"
                            placeholder="Search by offer title, promo code, restaurant or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="btn-clear-search"
                                onClick={() => setSearchQuery("")}
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    <div className="sort-dropdown-wrapper">
                        <label htmlFor="offers-sort-select" className="sort-label">
                            <FaFilter className="filter-icon" /> Sort by:
                        </label>
                        <select
                            id="offers-sort-select"
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="best">Best Offers (Recommended)</option>
                            <option value="highest_discount">Highest Discount</option>
                            <option value="lowest_min_order">Lowest Minimum Order</option>
                            <option value="expiring_soon">Expiring Soon</option>
                            <option value="newest">Newest</option>
                        </select>
                    </div>
                </div>

                {/* 4. OFFER CATEGORY TABS */}
                <div className="category-tabs-container">
                    <div className="category-tabs-scroll">
                        {CATEGORY_TABS.map((tab) => {
                            const count = categoryCounts[tab.key];
                            const isActive = activeCategory === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    className={`category-tab-btn ${isActive ? "active" : ""}`}
                                    onClick={() => setActiveCategory(tab.key)}
                                >
                                    <span className="tab-btn-icon">{tab.icon}</span>
                                    <span className="tab-btn-label">{tab.label}</span>
                                    {count !== undefined && count > 0 && (
                                        <span className={`tab-badge ${isActive ? "badge-active" : ""}`}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 5. APPLIED OFFER FLOATING NOTICE IF COUPON IS CURRENTLY ACTIVE */}
                {couponCode && (
                    <div className="active-coupon-banner">
                        <div className="acb-left">
                            <FaTag className="acb-tag-icon" />
                            <div>
                                <span className="acb-title">Active Offer Applied: </span>
                                <strong className="acb-code">{couponCode}</strong>
                                <span className="acb-discount">
                                    {discountAmount > 0
                                        ? ` (Saving ₹${discountAmount})`
                                        : " (Ready for checkout)"}
                                </span>
                            </div>
                        </div>
                        <div className="acb-right">
                            <Link to="/cart" className="btn-acb-cart">
                                <FaShoppingBag /> View in Cart
                            </Link>
                            <button
                                type="button"
                                className="btn-acb-remove"
                                onClick={removeCoupon}
                                title="Remove applied coupon"
                            >
                                <FaTimes /> Remove
                            </button>
                        </div>
                    </div>
                )}

                {/* 6. RECOMMENDED FOR YOU (PERSONALIZED SECTION) */}
                {activeCategory === "all" && !debouncedSearch && recommendedOffers.length > 0 && (
                    <section className="personalized-section">
                        <div className="section-heading-row">
                            <div className="heading-title-group">
                                <h2 className="section-title">
                                    <span className="sparkle-icon">✨</span> Recommended For You
                                </h2>
                                <p className="section-desc">
                                    Handpicked discounts tailored for your food cravings and ordering history
                                </p>
                            </div>
                        </div>

                        <div className="offers-grid-container">
                            {recommendedOffers.map((offer) => (
                                <OfferCard
                                    key={`rec-${offer._id}`}
                                    offer={offer}
                                    cartSubtotal={cartSubtotal}
                                    activeCoupon={couponCode}
                                    copiedCode={copiedCode}
                                    applyingCode={applyingCode}
                                    isSaved={savedOfferIds.includes(offer._id)}
                                    onCopy={handleCopyCode}
                                    onApply={handleApplyOffer}
                                    onToggleSave={handleToggleSave}
                                    onViewDetails={(o) => setSelectedOfferModal(o)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* 7. ENDING SOON HIGHLIGHT SECTION */}
                {activeCategory === "all" && !debouncedSearch && expiringSoonOffers.length > 0 && (
                    <section className="expiring-soon-section">
                        <div className="section-heading-row">
                            <div className="heading-title-group">
                                <h2 className="section-title text-red">
                                    <span className="fire-icon">🔥</span> Ending Soon
                                </h2>
                                <p className="section-desc">
                                    Flash sales and limited-time deals expiring in the next 72 hours
                                </p>
                            </div>
                        </div>

                        <div className="offers-grid-container">
                            {expiringSoonOffers.map((offer) => (
                                <OfferCard
                                    key={`exp-${offer._id}`}
                                    offer={offer}
                                    cartSubtotal={cartSubtotal}
                                    activeCoupon={couponCode}
                                    copiedCode={copiedCode}
                                    applyingCode={applyingCode}
                                    isSaved={savedOfferIds.includes(offer._id)}
                                    onCopy={handleCopyCode}
                                    onApply={handleApplyOffer}
                                    onToggleSave={handleToggleSave}
                                    onViewDetails={(o) => setSelectedOfferModal(o)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* 8. FEATURED QUICK CATEGORY PROMOS BANNER */}
                {activeCategory === "all" && !debouncedSearch && (
                    <div className="specialty-promos-row">
                        <div className="specialty-promo-card promo-biryani">
                            <div className="spc-content">
                                <span className="spc-badge">🍲 BIRYANI FEST</span>
                                <h3>30% OFF Royal Biryani</h3>
                                <p>Authentic Dum, Zafrani & Handi Biryani</p>
                                <Link to="/category/biryani" className="btn-spc-link">
                                    Order Biryani Now <FaArrowRight />
                                </Link>
                            </div>
                        </div>

                        <div className="specialty-promo-card promo-pizza">
                            <div className="spc-content">
                                <span className="spc-badge">🍕 PIZZA CRAZE</span>
                                <h3>40% OFF Gourmet Pizza</h3>
                                <p>Wood-fired crusts & double cheese burst</p>
                                <Link to="/category/pizza" className="btn-spc-link">
                                    Order Pizza Now <FaArrowRight />
                                </Link>
                            </div>
                        </div>

                        <div className="specialty-promo-card promo-wallet">
                            <div className="spc-content">
                                <span className="spc-badge">💳 WALLET CASHBACK</span>
                                <h3>Add ₹500, Get ₹50 Free</h3>
                                <p>1-click payment with instant cashback</p>
                                <Link to="/profile" className="btn-spc-link">
                                    Top Up Wallet <FaArrowRight />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* 9. MAIN OFFERS GRID SECTION */}
                <section className="main-offers-section">
                    <div className="section-heading-row">
                        <div className="heading-title-group">
                            <h2 className="section-title">
                                {activeCategory === "all"
                                    ? "All Available Offers"
                                    : CATEGORY_TABS.find((t) => t.key === activeCategory)?.label + " Offers"}
                            </h2>
                            <p className="section-desc">
                                Showing {offers.length} {offers.length === 1 ? "offer" : "offers"}
                                {debouncedSearch ? ` matching "${debouncedSearch}"` : ""}
                            </p>
                        </div>
                    </div>

                    {/* SKELETON LOADING STATE */}
                    {loading ? (
                        <div className="offers-skeleton-grid">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <div key={n} className="offer-skeleton-card">
                                    <div className="sk-ribbon shimmer" />
                                    <div className="sk-line title shimmer" />
                                    <div className="sk-line subtitle shimmer" />
                                    <div className="sk-box meta shimmer" />
                                    <div className="sk-line code shimmer" />
                                    <div className="sk-button shimmer" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        /* ERROR STATE */
                        <div className="offers-error-card">
                            <FaExclamationTriangle className="error-icon" />
                            <h3>Unable to load offers.</h3>
                            <p>{error}</p>
                            <button
                                type="button"
                                className="btn-retry-offers"
                                onClick={fetchOffers}
                            >
                                <FaSyncAlt /> Try Again
                            </button>
                        </div>
                    ) : offers.length > 0 ? (
                        /* OFFERS GRID */
                        <div className="offers-grid-container">
                            {offers.map((offer) => (
                                <OfferCard
                                    key={offer._id}
                                    offer={offer}
                                    cartSubtotal={cartSubtotal}
                                    activeCoupon={couponCode}
                                    copiedCode={copiedCode}
                                    applyingCode={applyingCode}
                                    isSaved={savedOfferIds.includes(offer._id)}
                                    onCopy={handleCopyCode}
                                    onApply={handleApplyOffer}
                                    onToggleSave={handleToggleSave}
                                    onViewDetails={(o) => setSelectedOfferModal(o)}
                                />
                            ))}
                        </div>
                    ) : (
                        /* EMPTY STATE */
                        <div className="offers-empty-state">
                            <div className="empty-icon-wrap">
                                <FaGift />
                            </div>
                            <h3>No offers available right now</h3>
                            <p>
                                {activeCategory === "saved"
                                    ? "You haven't bookmarked any offers yet. Click the heart icon on any card to save it here!"
                                    : debouncedSearch
                                    ? `No offers matched "${debouncedSearch}". Try a different search term or category.`
                                    : "Check back soon for exciting FoodExpress deals and seasonal coupons."}
                            </p>
                            <div className="empty-actions">
                                {activeCategory !== "all" || debouncedSearch ? (
                                    <button
                                        type="button"
                                        className="btn-empty-reset"
                                        onClick={() => {
                                            setActiveCategory("all");
                                            setSearchQuery("");
                                        }}
                                    >
                                        View All Offers
                                    </button>
                                ) : null}
                                <Link to="/browse-food" className="btn-empty-browse">
                                    <FaUtensils /> Browse Food
                                </Link>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* 10. TERMS & CONDITIONS MODAL */}
            {selectedOfferModal && (
                <div
                    className="offer-modal-backdrop"
                    onClick={() => setSelectedOfferModal(null)}
                >
                    <div
                        className="offer-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div className="modal-title-wrap">
                                <span
                                    className="modal-badge-pill"
                                    style={{
                                        backgroundColor: selectedOfferModal.badgeColor || "#ff5200"
                                    }}
                                >
                                    {selectedOfferModal.highlightTag ||
                                        `${selectedOfferModal.discountValue}% OFF`}
                                </span>
                                <h3>{selectedOfferModal.title}</h3>
                            </div>
                            <button
                                type="button"
                                className="btn-close-modal"
                                onClick={() => setSelectedOfferModal(null)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-body">
                            <p className="modal-subtitle">{selectedOfferModal.subtitle}</p>

                            {/* Offer Details Grid */}
                            <div className="modal-details-grid">
                                <div className="md-cell">
                                    <span className="md-label">Discount</span>
                                    <strong className="md-value">
                                        {selectedOfferModal.discountType === "percentage"
                                            ? `${selectedOfferModal.discountValue}% OFF`
                                            : selectedOfferModal.discountType === "free_delivery"
                                            ? "FREE DELIVERY"
                                            : `₹${selectedOfferModal.discountValue} FLAT`}
                                    </strong>
                                </div>

                                <div className="md-cell">
                                    <span className="md-label">Minimum Order</span>
                                    <strong className="md-value">
                                        {selectedOfferModal.minimumOrderValue > 0
                                            ? `₹${selectedOfferModal.minimumOrderValue}`
                                            : "No Minimum"}
                                    </strong>
                                </div>

                                <div className="md-cell">
                                    <span className="md-label">Max Discount</span>
                                    <strong className="md-value">
                                        {selectedOfferModal.maximumDiscount > 0
                                            ? `₹${selectedOfferModal.maximumDiscount}`
                                            : "Unlimited"}
                                    </strong>
                                </div>

                                <div className="md-cell">
                                    <span className="md-label">Valid Until</span>
                                    <strong className="md-value">
                                        {formatDate(selectedOfferModal.expiryDate)}
                                    </strong>
                                </div>
                            </div>

                            {/* Applicability */}
                            <div className="modal-applicability-box">
                                <h4 className="mab-title">Applicability & Eligibility</h4>
                                <ul className="mab-list">
                                    <li>
                                        <strong>Target Users: </strong>
                                        {selectedOfferModal.isNewUserOnly
                                            ? "New FoodExpress customers on first order"
                                            : "All registered users"}
                                    </li>
                                    {selectedOfferModal.applicableCategories?.length > 0 && (
                                        <li>
                                            <strong>Applicable Categories: </strong>
                                            {selectedOfferModal.applicableCategories.join(", ")}
                                        </li>
                                    )}
                                    {selectedOfferModal.applicableRestaurants?.length > 0 && (
                                        <li>
                                            <strong>Applicable Restaurants: </strong>
                                            {selectedOfferModal.applicableRestaurants.join(", ")}
                                        </li>
                                    )}
                                    <li>
                                        <strong>Redemption Limit: </strong>
                                        Up to {selectedOfferModal.perUserLimit || 1} time(s) per user
                                    </li>
                                </ul>
                            </div>

                            {/* Terms and Conditions */}
                            <div className="modal-tc-box">
                                <h4 className="tc-title">Terms & Conditions</h4>
                                <ul className="tc-list">
                                    {(selectedOfferModal.termsAndConditions || [
                                        "Offer valid for a limited period only.",
                                        "Cannot be clubbed with any other ongoing voucher or coupon.",
                                        "FoodExpress reserves the right to modify or terminate this offer at any time."
                                    ]).map((term, i) => (
                                        <li key={i}>{term}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Code Box */}
                            <div className="modal-code-cluster">
                                <div className="mcc-code">
                                    <span className="mcc-label">PROMO CODE:</span>
                                    <strong className="mcc-code-text">
                                        {selectedOfferModal.code}
                                    </strong>
                                </div>
                                <button
                                    type="button"
                                    className="btn-mcc-copy"
                                    onClick={(e) => handleCopyCode(selectedOfferModal.code, e)}
                                >
                                    {copiedCode === selectedOfferModal.code ? (
                                        <>
                                            <FaCheck /> Copied
                                        </>
                                    ) : (
                                        <>
                                            <FaCopy /> Copy Code
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-modal-apply"
                                onClick={(e) => {
                                    handleApplyOffer(selectedOfferModal, e);
                                    setSelectedOfferModal(null);
                                }}
                                disabled={!selectedOfferModal.isEligible}
                            >
                                {couponCode === selectedOfferModal.code
                                    ? "✓ Offer Already Applied"
                                    : "Apply Offer to Cart"}
                            </button>
                            <button
                                type="button"
                                className="btn-modal-cancel"
                                onClick={() => setSelectedOfferModal(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Modern Production Offer Card Component
 */
const OfferCard = ({
    offer,
    cartSubtotal,
    activeCoupon,
    copiedCode,
    applyingCode,
    isSaved,
    onCopy,
    onApply,
    onToggleSave,
    onViewDetails
}) => {
    const isApplied = activeCoupon === offer.code;
    const isCopying = copiedCode === offer.code;
    const isApplying = applyingCode === offer.code;

    const formatDate = (dateStr) => {
        if (!dateStr) return "Limited Time";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    // Calculate discount display
    const discountBadgeText = useMemo(() => {
        if (offer.discountType === "free_delivery") return "FREE DELIVERY";
        if (offer.discountType === "flat") return `₹${offer.discountValue} OFF`;
        if (offer.discountType === "wallet_bonus") return `₹${offer.discountValue} BONUS`;
        if (offer.discountType === "reward_multiplier") return `${offer.discountValue}X REWARDS`;
        return `${offer.discountValue}% OFF`;
    }, [offer]);

    return (
        <div
            className={`modern-offer-card ${isApplied ? "applied-border" : ""} ${
                !offer.isEligible ? "ineligible-card" : ""
            }`}
            onClick={() => onViewDetails(offer)}
        >
            {/* Card Header Strip */}
            <div className="card-top-strip">
                <div
                    className="offer-discount-ribbon"
                    style={{ backgroundColor: offer.badgeColor || "#ff5200" }}
                >
                    <span className="ribbon-fire">🔥</span>
                    <span className="ribbon-text">{discountBadgeText}</span>
                </div>

                <div className="card-top-actions">
                    <button
                        type="button"
                        className={`btn-save-offer ${isSaved ? "saved" : ""}`}
                        title={isSaved ? "Remove from saved" : "Save offer"}
                        onClick={(e) => onToggleSave(offer, e)}
                    >
                        {isSaved ? <FaHeart className="heart-filled" /> : <FaRegHeart />}
                    </button>
                </div>
            </div>

            {/* Card Main Info */}
            <div className="card-body-content">
                <h3 className="card-offer-title">{offer.title}</h3>
                <p className="card-offer-subtitle">{offer.subtitle}</p>

                {/* Offer Threshold Conditions */}
                <div className="card-conditions-row">
                    {offer.maximumDiscount > 0 && (
                        <div className="condition-pill">
                            <span className="cp-label">Max discount:</span>
                            <strong className="cp-val">₹{offer.maximumDiscount}</strong>
                        </div>
                    )}
                    <div className="condition-pill">
                        <span className="cp-label">Min order:</span>
                        <strong className="cp-val">
                            {offer.minimumOrderValue > 0
                                ? `₹${offer.minimumOrderValue}`
                                : "None"}
                        </strong>
                    </div>
                </div>

                {/* Applicability & Expiry Tags */}
                <div className="card-meta-tags">
                    {offer.isNewUserOnly && (
                        <span className="meta-tag tag-new-user">
                            <FaStar /> New Users Only
                        </span>
                    )}

                    {offer.applicableCategories?.length > 0 && (
                        <span className="meta-tag tag-category">
                            <FaUtensils /> On {offer.applicableCategories.join(", ")}
                        </span>
                    )}

                    <span className={`meta-tag tag-expiry ${offer.isExpiringSoon ? "expiring" : ""}`}>
                        <FaClock />{" "}
                        {offer.isExpiringSoon
                            ? `Expires in ${offer.daysLeft}d`
                            : `Valid till ${formatDate(offer.expiryDate)}`}
                    </span>
                </div>

                {/* Ineligible Warning Note if applicable */}
                {!offer.isEligible && offer.ineligibilityReason && (
                    <div className="ineligible-notice">
                        <FaInfoCircle /> {offer.ineligibilityReason}
                    </div>
                )}
            </div>

            {/* Card Footer: Code Box + Apply Action */}
            <div className="card-footer-cluster" onClick={(e) => e.stopPropagation()}>
                <div className="promo-code-container">
                    <span className="code-prefix">CODE:</span>
                    <span className="code-text">{offer.code}</span>
                    <button
                        type="button"
                        className="btn-copy-code"
                        onClick={(e) => onCopy(offer.code, e)}
                        title="Copy promo code"
                    >
                        {isCopying ? <FaCheck className="copied-chk" /> : <FaCopy />}
                        <span>{isCopying ? "Copied" : "Copy"}</span>
                    </button>
                </div>

                <div className="card-action-row">
                    <button
                        type="button"
                        className={`btn-apply-offer ${isApplied ? "applied" : ""}`}
                        onClick={(e) => onApply(offer, e)}
                        disabled={!offer.isEligible || isApplying}
                    >
                        {isApplying ? (
                            <FaSyncAlt className="spin-icon" />
                        ) : isApplied ? (
                            <>
                                <FaCheck /> Applied
                            </>
                        ) : (
                            "Apply Offer"
                        )}
                    </button>

                    <button
                        type="button"
                        className="btn-view-terms"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(offer);
                        }}
                    >
                        Details <FaChevronRight className="mini-arrow" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Offers;
