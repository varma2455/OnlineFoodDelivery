import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { rewardAPI } from "../../services/api";
import "./Rewards.css";
import {
    FaStar,
    FaGift,
    FaCoins,
    FaMedal,
    FaCrown,
    FaCheck,
    FaCopy,
    FaSearch,
    FaFilter,
    FaArrowRight,
    FaUtensils,
    FaMotorcycle,
    FaWallet,
    FaTimes,
    FaInfoCircle,
    FaChevronRight,
    FaFire,
    FaShareAlt,
    FaHistory,
    FaShoppingBag,
    FaAward,
    FaCalendarAlt,
    FaShieldAlt,
    FaExternalLinkAlt,
    FaClock,
    FaCheckCircle,
    FaExclamationCircle,
    FaSyncAlt
} from "react-icons/fa";

const CATALOG_CATEGORIES = [
    { key: "all", label: "All Rewards" },
    { key: "discount_flat", label: "Flat Discounts" },
    { key: "free_delivery", label: "Free Delivery" },
    { key: "discount_percent", label: "Percentage OFF" },
    { key: "wallet_cashback", label: "Wallet Cash" }
];

const HISTORY_FILTERS = [
    { key: "all", label: "All Activity" },
    { key: "earned", label: "Earned" },
    { key: "redeemed", label: "Redeemed" },
    { key: "bonus", label: "Bonus Points" }
];

const TIERS_LIST = [
    {
        name: "Bronze",
        badge: "🥉",
        minPoints: 0,
        maxPoints: 499,
        rate: "10% back in points",
        perk: "Earn 10 points for every ₹100 spent",
        color: "#cd7f32"
    },
    {
        name: "Silver",
        badge: "🥈",
        minPoints: 500,
        maxPoints: 999,
        rate: "1.2X points",
        perk: "Earn 12 points per ₹100 + early flash deal access",
        color: "#64748b"
    },
    {
        name: "Gold",
        badge: "🥇",
        minPoints: 1000,
        maxPoints: 2499,
        rate: "1.5X points",
        perk: "Earn 15 points per ₹100 + exclusive weekend boosts",
        color: "#f59e0b"
    },
    {
        name: "Platinum",
        badge: "💎",
        minPoints: 2500,
        maxPoints: null,
        rate: "2X points",
        perk: "Earn 20 points per ₹100 + zero delivery fees & VIP priority",
        color: "#8b5cf6"
    }
];

const Rewards = () => {
    const { token, user, applyCoupon, showToast, refreshUser } = useContext(StoreContext);
    const navigate = useNavigate();

    // Data States
    const [profile, setProfile] = useState(null);
    const [catalog, setCatalog] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [history, setHistory] = useState([]);

    // UI & Filter States
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedCatalogCat, setSelectedCatalogCat] = useState("all");
    const [selectedHistoryFilter, setSelectedHistoryFilter] = useState("all");
    const [historySearchQuery, setHistorySearchQuery] = useState("");
    const [copiedCode, setCopiedCode] = useState(null);
    const [isRedeeming, setIsRedeeming] = useState(false);

    // Modal States
    const [redeemConfirmItem, setRedeemConfirmItem] = useState(null);
    const [insufficientItem, setInsufficientItem] = useState(null);
    const [termsModalItem, setTermsModalItem] = useState(null);
    const [voucherSuccessModal, setVoucherSuccessModal] = useState(null);

    // Fetch All Reward Data
    const fetchAllRewardData = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);
        setErrorMessage("");

        try {
            const [profRes, catRes, vouchRes, histRes] = await Promise.allSettled([
                rewardAPI.getProfile(),
                rewardAPI.getCatalog(),
                rewardAPI.getRedeemedRewards(),
                rewardAPI.getHistory({ type: "all" })
            ]);

            if (profRes.status === "fulfilled" && profRes.value.data?.success) {
                setProfile(profRes.value.data.profile);
            } else if (profRes.status === "rejected") {
                console.warn("Could not fetch reward profile:", profRes.reason?.message);
            }

            if (catRes.status === "fulfilled" && catRes.value.data?.success) {
                setCatalog(catRes.value.data.catalog || []);
            }

            if (vouchRes.status === "fulfilled" && vouchRes.value.data?.success) {
                setVouchers(vouchRes.value.data.vouchers || []);
            }

            if (histRes.status === "fulfilled" && histRes.value.data?.success) {
                setHistory(histRes.value.data.transactions || []);
            }

            // If profile failed and user is present
            if (profRes.status === "rejected" && catRes.status === "rejected") {
                setHasError(true);
                setErrorMessage("Unable to load rewards data right now. Please check your connection.");
            }
        } catch (err) {
            console.error("Reward fetch error:", err);
            setHasError(true);
            setErrorMessage(err.message || "Failed to load rewards. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllRewardData();
    }, [fetchAllRewardData]);

    // Copy Code Handler
    const handleCopyCode = useCallback((code, e) => {
        if (e) e.stopPropagation();
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
            setCopiedCode(code);
            showToast(`Voucher code "${code}" copied to clipboard! 📋`, "success");
            setTimeout(() => setCopiedCode(null), 3000);
        });
    }, [showToast]);

    // Use Voucher in Cart Handler
    const handleUseVoucher = useCallback(async (voucher) => {
        if (!voucher || !voucher.code) return;
        try {
            const res = await applyCoupon(voucher.code);
            if (res.success) {
                showToast(`Voucher "${voucher.code}" applied to cart! Saved ₹${res.discount}. 🛍️`, "success");
                navigate("/cart");
            } else {
                navigate("/cart");
            }
        } catch (e) {
            navigate("/cart");
        }
    }, [applyCoupon, showToast, navigate]);

    // Filtered Catalog
    const filteredCatalog = useMemo(() => {
        if (selectedCatalogCat === "all") return catalog;
        return catalog.filter((item) => item.rewardType === selectedCatalogCat);
    }, [catalog, selectedCatalogCat]);

    // Filtered History
    const filteredHistory = useMemo(() => {
        return history.filter((item) => {
            const matchFilter =
                selectedHistoryFilter === "all" ||
                item.type?.toLowerCase() === selectedHistoryFilter.toLowerCase();

            if (!matchFilter) return false;

            if (!historySearchQuery.trim()) return true;
            const q = historySearchQuery.toLowerCase().trim();
            const titleMatch = (item.title || "").toLowerCase().includes(q);
            const descMatch = (item.description || "").toLowerCase().includes(q);
            const orderMatch = (item.orderIdText || "").toLowerCase().includes(q);
            const codeMatch = (item.voucherCode || "").toLowerCase().includes(q);
            return titleMatch || descMatch || orderMatch || codeMatch;
        });
    }, [history, selectedHistoryFilter, historySearchQuery]);

    // Redeem Click Handler
    const handleRedeemClick = (reward) => {
        const userPoints = profile?.points ?? user?.rewardPoints ?? 0;
        if (userPoints < reward.pointsCost) {
            setInsufficientItem(reward);
        } else {
            setRedeemConfirmItem(reward);
        }
    };

    // Confirm Redemption
    const handleConfirmRedeem = async () => {
        if (!redeemConfirmItem || isRedeeming) return;
        setIsRedeeming(true);

        try {
            const res = await rewardAPI.redeemReward(redeemConfirmItem._id);
            if (res.data?.success) {
                showToast(res.data.message || "Reward redeemed successfully! 🎉", "success");

                // Update local profile points
                setProfile((prev) => {
                    if (!prev) return prev;
                    const newPts = res.data.newBalance ?? (prev.points - redeemConfirmItem.pointsCost);
                    return {
                        ...prev,
                        points: newPts,
                        stats: {
                            ...prev.stats,
                            availablePoints: newPts,
                            redeemedTotal: (prev.stats?.redeemedTotal || 0) + redeemConfirmItem.pointsCost
                        }
                    };
                });

                if (refreshUser) refreshUser();

                // If food/delivery voucher created, open success voucher modal
                if (res.data.voucher) {
                    setVoucherSuccessModal(res.data.voucher);
                    setVouchers((prev) => [res.data.voucher, ...prev]);
                }

                // Close confirm modal
                setRedeemConfirmItem(null);

                // Re-fetch transactions & catalog affordabilities
                const [newCat, newHist] = await Promise.allSettled([
                    rewardAPI.getCatalog(),
                    rewardAPI.getHistory({ type: "all" })
                ]);
                if (newCat.status === "fulfilled" && newCat.value.data?.success) {
                    setCatalog(newCat.value.data.catalog);
                }
                if (newHist.status === "fulfilled" && newHist.value.data?.success) {
                    setHistory(newHist.value.data.transactions);
                }
            } else {
                showToast(res.data?.message || "Could not redeem reward.", "error");
            }
        } catch (err) {
            console.error("Redeem error:", err);
            const msg = err.response?.data?.message || err.message || "Failed to redeem reward.";
            showToast(msg, "error");
        } finally {
            setIsRedeeming(false);
        }
    };

    // Share Referral
    const handleShareReferral = (code) => {
        if (!code) return;
        const text = `Join me on FoodExpress! Order delicious meals with quick delivery and earn reward points on every order. Use my referral code: ${code}`;
        if (navigator.share) {
            navigator.share({
                title: "Join FoodExpress",
                text,
                url: window.location.origin
            }).catch(() => {});
        } else {
            handleCopyCode(code);
        }
    };

    // User points helper
    const currentPoints = profile?.points ?? user?.rewardPoints ?? 0;
    const currentTier = profile?.tier || {
        name: currentPoints >= 1000 ? "Gold" : currentPoints >= 500 ? "Silver" : "Bronze",
        badge: currentPoints >= 1000 ? "🥇" : currentPoints >= 500 ? "🥈" : "🥉",
        pointsToNext: Math.max(0, 500 - currentPoints),
        progressPct: Math.min(100, Math.round((currentPoints / 500) * 100))
    };

    return (
        <div className="rewards-page-container">
            {/* ===================================================
                1. REWARDS HERO HEADER
                =================================================== */}
            <header className="rewards-hero-header">
                <div className="hero-header-content">
                    <div className="hero-title-group">
                        <div className="hero-pill-badge">
                            <FaStar className="star-icon" />
                            <span>FoodExpress Loyalty Club</span>
                        </div>
                        <h1 className="rewards-main-title">Rewards & Benefits</h1>
                        <p className="rewards-sub-title">
                            Earn points with every order and unlock exciting discount vouchers, free delivery, and instant wallet rewards.
                        </p>
                    </div>

                    <div className="hero-points-highlight">
                        <div className="hero-points-card">
                            <div className="points-sparkle-icon">⭐</div>
                            <div className="points-info">
                                <span className="points-label">Your Reward Balance</span>
                                <h2 className="points-count">
                                    {isLoading ? (
                                        <span className="skeleton-pill short" />
                                    ) : (
                                        `${currentPoints.toLocaleString()} Points`
                                    )}
                                </h2>
                                <span className="tier-tag">
                                    {currentTier.badge} {currentTier.name} Member
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Error State */}
            {hasError && (
                <div className="rewards-error-banner">
                    <div className="error-icon"><FaExclamationCircle /></div>
                    <div className="error-text">
                        <h3>Unable to load your rewards</h3>
                        <p>{errorMessage || "Please check your network and try again."}</p>
                    </div>
                    <button className="btn-retry" onClick={fetchAllRewardData}>
                        <FaSyncAlt /> Try Again
                    </button>
                </div>
            )}

            {/* Main Rewards Grid Shell */}
            <div className="rewards-content-body">
                {/* ===================================================
                    2. REWARDS SUMMARY CARD & PROGRESS
                    =================================================== */}
                <section className="rewards-summary-section">
                    <div className="rewards-summary-card">
                        <div className="summary-card-header">
                            <div className="summary-title-wrap">
                                <span className="summary-icon">⭐</span>
                                <div>
                                    <h3 className="summary-title">Your Rewards</h3>
                                    <p className="summary-caption">Active loyalty progression</p>
                                </div>
                            </div>
                            <div className="summary-tier-badge" style={{ borderColor: currentTier.color || "#ff5200" }}>
                                <span className="tier-medal">{currentTier.badge}</span>
                                <span className="tier-text">Level: {currentTier.name}</span>
                            </div>
                        </div>

                        <div className="summary-points-display">
                            {isLoading ? (
                                <div className="skeleton-block header-skel" />
                            ) : (
                                <>
                                    <div className="big-points-num">
                                        {currentPoints.toLocaleString()}
                                        <span className="big-points-unit">Points</span>
                                    </div>
                                    <div className="next-reward-notice">
                                        {currentTier.nextTier ? (
                                            <>
                                                <strong>{currentTier.pointsToNext} points</strong> until your next tier (
                                                <span className="next-tier-name">{currentTier.nextTier}</span>)
                                            </>
                                        ) : (
                                            <span>You have achieved the highest <strong>Platinum VIP</strong> tier! 🎉</span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className="summary-progress-wrapper">
                            <div className="progress-labels">
                                <span className="level-start">{currentTier.name}</span>
                                <span className="level-percentage">{currentTier.progressPct || 0}% Completed</span>
                                <span className="level-end">{currentTier.nextTier || "Max Tier"}</span>
                            </div>
                            <div className="custom-progress-track">
                                <div
                                    className="custom-progress-fill"
                                    style={{ width: `${Math.max(6, Math.min(100, currentTier.progressPct || 0))}%` }}
                                />
                            </div>
                        </div>

                        {/* Tier Perk Footnote */}
                        <div className="tier-perk-footnote">
                            <FaAward className="perk-icon" />
                            <span>
                                <strong>Active Tier Perk:</strong> {currentTier.perk || "10% points on every order"}
                            </span>
                        </div>
                    </div>

                    {/* ===================================================
                        3. ACCURATE REWARD BALANCE METRICS
                        =================================================== */}
                    <div className="reward-stats-quad">
                        <div className="stat-card available">
                            <div className="stat-card-icon"><FaCoins /></div>
                            <div className="stat-card-meta">
                                <span className="stat-name">Available Points</span>
                                <span className="stat-value">
                                    {isLoading ? "..." : currentPoints.toLocaleString()}
                                </span>
                                <span className="stat-note">Ready to redeem</span>
                            </div>
                        </div>

                        <div className="stat-card earned">
                            <div className="stat-card-icon"><FaStar /></div>
                            <div className="stat-card-meta">
                                <span className="stat-name">Earned This Month</span>
                                <span className="stat-value">
                                    {isLoading ? "..." : (profile?.stats?.earnedThisMonth || 0).toLocaleString()}
                                </span>
                                <span className="stat-note">From food orders & bonuses</span>
                            </div>
                        </div>

                        <div className="stat-card redeemed">
                            <div className="stat-card-icon"><FaGift /></div>
                            <div className="stat-card-meta">
                                <span className="stat-name">Redeemed Total</span>
                                <span className="stat-value">
                                    {isLoading ? "..." : (profile?.stats?.redeemedTotal || 0).toLocaleString()}
                                </span>
                                <span className="stat-note">Points converted to savings</span>
                            </div>
                        </div>

                        <div className="stat-card expiring">
                            <div className="stat-card-icon"><FaClock /></div>
                            <div className="stat-card-meta">
                                <span className="stat-name">Expiring Soon</span>
                                <span className="stat-value">
                                    {isLoading ? "..." : (profile?.stats?.expiringSoon || 0).toLocaleString()}
                                </span>
                                <span className="stat-note">Next 30 days</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===================================================
                    4. WAYS TO EARN SECTION
                    =================================================== */}
                <section className="ways-to-earn-section">
                    <div className="section-header-row">
                        <div>
                            <h2 className="section-title">Ways to Earn</h2>
                            <p className="section-subtitle">Collect points effortlessly across every FoodExpress interaction</p>
                        </div>
                        <div className="points-rule-tag">
                            <span>₹100 order = <strong>+10 points</strong></span>
                        </div>
                    </div>

                    <div className="ways-to-earn-grid">
                        <div className="earn-action-card">
                            <div className="earn-card-top">
                                <span className="earn-emoji">🛍️</span>
                                <span className="earn-badge">10% Points</span>
                            </div>
                            <h3 className="earn-title">Order Food</h3>
                            <p className="earn-desc">
                                Earn 10 reward points for every ₹100 spent automatically credited when your feast arrives.
                            </p>
                            <div className="earn-calc-rule">
                                <FaCoins className="calc-icon" />
                                <span>₹100 order &rarr; <strong>+10 points</strong></span>
                            </div>
                            <Link to="/menu" className="btn-earn-action">
                                <span>Order Now</span>
                                <FaArrowRight />
                            </Link>
                        </div>

                        <div className="earn-action-card">
                            <div className="earn-card-top">
                                <span className="earn-emoji">⭐</span>
                                <span className="earn-badge highlight">+25 Pts Each</span>
                            </div>
                            <h3 className="earn-title">Rate an Order</h3>
                            <p className="earn-desc">
                                Rate delivered dishes and leave honest reviews to earn 25 bonus reward points every time.
                            </p>
                            <div className="earn-calc-rule">
                                <FaAward className="calc-icon" />
                                <span>Review &rarr; <strong>+25 bonus points</strong></span>
                            </div>
                            <Link to="/my-orders" className="btn-earn-action">
                                <span>Rate Orders</span>
                                <FaArrowRight />
                            </Link>
                        </div>

                        <div className="earn-action-card">
                            <div className="earn-card-top">
                                <span className="earn-emoji">🎉</span>
                                <span className="earn-badge bonus">2X Points</span>
                            </div>
                            <h3 className="earn-title">Special Offers</h3>
                            <p className="earn-desc">
                                Unlock lightning deals and double points boosts on exclusive partner restaurants and weekends.
                            </p>
                            <div className="earn-calc-rule">
                                <FaFire className="calc-icon fire" />
                                <span>Promo Deals &rarr; <strong>Up to 2X points</strong></span>
                            </div>
                            <Link to="/offers" className="btn-earn-action">
                                <span>View Offers</span>
                                <FaArrowRight />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ===================================================
                    5. REDEEM YOUR POINTS (CATALOG)
                    =================================================== */}
                <section className="redeem-catalog-section">
                    <div className="section-header-row">
                        <div>
                            <h2 className="section-title">Redeem Your Points</h2>
                            <p className="section-subtitle">
                                Exchange your hard-earned points for food discounts, free deliveries, and wallet cashback
                            </p>
                        </div>
                        <div className="catalog-balance-indicator">
                            <span>Your balance: <strong>{currentPoints.toLocaleString()} pts</strong></span>
                        </div>
                    </div>

                    {/* Catalog Tabs */}
                    <div className="catalog-tabs-bar">
                        {CATALOG_CATEGORIES.map((tab) => (
                            <button
                                key={tab.key}
                                className={`cat-tab-btn ${selectedCatalogCat === tab.key ? "active" : ""}`}
                                onClick={() => setSelectedCatalogCat(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Catalog Grid */}
                    {isLoading ? (
                        <div className="catalog-cards-grid">
                            {[1, 2, 3, 4, 5, 6].map((sk) => (
                                <div key={sk} className="reward-item-card skeleton">
                                    <div className="skeleton-icon" />
                                    <div className="skeleton-line full" />
                                    <div className="skeleton-line half" />
                                    <div className="skeleton-btn" />
                                </div>
                            ))}
                        </div>
                    ) : filteredCatalog.length === 0 ? (
                        <div className="empty-catalog-box">
                            <span className="empty-icon">🎁</span>
                            <h3>No rewards found in this category</h3>
                            <p>Try selecting another category tab to view available items.</p>
                            <button className="btn-tab-reset" onClick={() => setSelectedCatalogCat("all")}>
                                View All Rewards
                            </button>
                        </div>
                    ) : (
                        <div className="catalog-cards-grid">
                            {filteredCatalog.map((item) => {
                                const cost = Number(item.pointsCost);
                                const canAfford = currentPoints >= cost;
                                const pointsNeeded = Math.max(0, cost - currentPoints);
                                const percentProgress = Math.min(100, Math.round((currentPoints / cost) * 100));

                                return (
                                    <div
                                        key={item._id}
                                        className={`reward-item-card ${canAfford ? "affordable" : "locked"}`}
                                    >
                                        {item.badge && (
                                            <div
                                                className="reward-card-badge"
                                                style={{ backgroundColor: item.badgeColor || "#ff5200" }}
                                            >
                                                {item.badge}
                                            </div>
                                        )}

                                        <div className="reward-card-icon-wrap">
                                            <span className="reward-icon">{item.icon || "🎁"}</span>
                                        </div>

                                        <div className="reward-card-header">
                                            <h3 className="reward-title">{item.title}</h3>
                                            {item.subtitle && <p className="reward-subtitle">{item.subtitle}</p>}
                                        </div>

                                        <div className="reward-cost-tag">
                                            <FaStar className="star-point" />
                                            <span className="cost-num">{cost.toLocaleString()}</span>
                                            <span className="cost-label">Points</span>
                                        </div>

                                        <div className="reward-meta-requirements">
                                            {item.minimumOrderValue > 0 ? (
                                                <div className="meta-pill">
                                                    <span>Min Order: ₹{item.minimumOrderValue}</span>
                                                </div>
                                            ) : (
                                                <div className="meta-pill green">
                                                    <span>No Min. Order</span>
                                                </div>
                                            )}
                                            <div className="meta-pill">
                                                <span>Valid: {item.validityDays || 30} Days</span>
                                            </div>
                                        </div>

                                        {/* Point Progress Bar to Unlock */}
                                        <div className="item-progress-wrap">
                                            <div className="item-progress-track">
                                                <div
                                                    className={`item-progress-fill ${canAfford ? "ready" : ""}`}
                                                    style={{ width: `${percentProgress}%` }}
                                                />
                                            </div>
                                            <span className="item-progress-text">
                                                {canAfford
                                                    ? "Ready to redeem 🎉"
                                                    : `${pointsNeeded} more points needed`}
                                            </span>
                                        </div>

                                        <div className="reward-card-actions">
                                            <button
                                                className={`btn-redeem-action ${canAfford ? "btn-primary-redeem" : "btn-disabled-redeem"}`}
                                                onClick={() => handleRedeemClick(item)}
                                            >
                                                {canAfford ? (
                                                    <>
                                                        <FaGift />
                                                        <span>Redeem Now</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaCoins />
                                                        <span>Need {pointsNeeded} Pts</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                className="btn-details-link"
                                                onClick={() => setTermsModalItem(item)}
                                                title="View Terms & Conditions"
                                            >
                                                <FaInfoCircle /> Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ===================================================
                    6. MY REDEEMED REWARDS / VOUCHERS
                    =================================================== */}
                <section className="my-vouchers-section">
                    <div className="section-header-row">
                        <div>
                            <h2 className="section-title">My Redeemed Rewards</h2>
                            <p className="section-subtitle">Your active vouchers and redemption records ready for checkout</p>
                        </div>
                        <span className="vouchers-count-badge">{vouchers.length} Vouchers</span>
                    </div>

                    {vouchers.length === 0 ? (
                        <div className="empty-vouchers-card">
                            <span className="empty-gift-icon">🎟️</span>
                            <h3>No redeemed vouchers yet</h3>
                            <p>Redeem your points from the catalog above to generate instant food discount codes.</p>
                        </div>
                    ) : (
                        <div className="vouchers-cards-grid">
                            {vouchers.map((v) => {
                                const isAvailable = v.status === "Available";
                                const isExpired = v.status === "Expired" || new Date(v.expiryDate) < new Date();
                                const isUsed = v.status === "Used";

                                return (
                                    <div
                                        key={v._id || v.code}
                                        className={`voucher-card ${isAvailable ? "available" : isUsed ? "used" : "expired"}`}
                                    >
                                        <div className="voucher-left-stub">
                                            <span className="stub-icon">🎟️</span>
                                            <span className="stub-type">
                                                {v.rewardType === "free_delivery"
                                                    ? "Free Del"
                                                    : v.rewardType === "discount_percent"
                                                    ? `${v.discountValue}%`
                                                    : `₹${v.discountValue}`}
                                            </span>
                                        </div>

                                        <div className="voucher-details">
                                            <div className="voucher-header-info">
                                                <h4 className="voucher-title">{v.title}</h4>
                                                <span className={`voucher-status-pill ${v.status.toLowerCase()}`}>
                                                    {v.status}
                                                </span>
                                            </div>

                                            {v.minimumOrderValue > 0 && (
                                                <p className="voucher-min-order">
                                                    Valid on orders above ₹{v.minimumOrderValue}
                                                </p>
                                            )}

                                            <div className="voucher-code-strip">
                                                <span className="code-text">{v.code}</span>
                                                <button
                                                    className="btn-copy-voucher"
                                                    onClick={(e) => handleCopyCode(v.code, e)}
                                                    title="Copy voucher code"
                                                >
                                                    {copiedCode === v.code ? <FaCheck className="copied" /> : <FaCopy />}
                                                </button>
                                            </div>

                                            <div className="voucher-footer-row">
                                                <span className="voucher-expiry-date">
                                                    <FaCalendarAlt className="date-icon" />
                                                    {isExpired
                                                        ? "Expired"
                                                        : `Valid till ${new Date(v.expiryDate).toLocaleDateString("en-IN", {
                                                              day: "numeric",
                                                              month: "short",
                                                              year: "numeric"
                                                          })}`}
                                                </span>

                                                {isAvailable && (
                                                    <button
                                                        className="btn-use-now-cart"
                                                        onClick={() => handleUseVoucher(v)}
                                                    >
                                                        <span>Use Now</span>
                                                        <FaShoppingBag />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ===================================================
                    7. REWARDS HISTORY (TRANSACTIONS)
                    =================================================== */}
                <section className="rewards-history-section">
                    <div className="section-header-row">
                        <div>
                            <h2 className="section-title">Points History</h2>
                            <p className="section-subtitle">Real-time ledger of earned and redeemed points</p>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="history-control-toolbar">
                        <div className="history-search-input-wrap">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by order ID, reward name, or voucher..."
                                value={historySearchQuery}
                                onChange={(e) => setHistorySearchQuery(e.target.value)}
                            />
                            {historySearchQuery && (
                                <button className="clear-search-btn" onClick={() => setHistorySearchQuery("")}>
                                    <FaTimes />
                                </button>
                            )}
                        </div>

                        <div className="history-filter-pills">
                            {HISTORY_FILTERS.map((f) => (
                                <button
                                    key={f.key}
                                    className={`filter-pill ${selectedHistoryFilter === f.key ? "active" : ""}`}
                                    onClick={() => setSelectedHistoryFilter(f.key)}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* History Table / List */}
                    {isLoading ? (
                        <div className="history-skeleton-list">
                            {[1, 2, 3, 4].map((sk) => (
                                <div key={sk} className="history-skeleton-row" />
                            ))}
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="empty-history-box">
                            <FaHistory className="empty-hist-icon" />
                            <h4>No reward activity found</h4>
                            <p>
                                {historySearchQuery
                                    ? "No activity matches your search query."
                                    : "Place an order to record your first points activity!"}
                            </p>
                            {!historySearchQuery && (
                                <Link to="/menu" className="btn-browse-food-link">
                                    <FaShoppingBag /> Browse Food
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="history-items-list">
                            {filteredHistory.map((tx) => {
                                const isPositive = tx.points > 0;
                                return (
                                    <div key={tx._id} className="history-row-item">
                                        <div className={`history-icon-badge ${tx.type || "earned"}`}>
                                            {tx.type === "redeemed" ? (
                                                <FaGift />
                                            ) : tx.type === "bonus" ? (
                                                <FaAward />
                                            ) : (
                                                <FaShoppingBag />
                                            )}
                                        </div>

                                        <div className="history-details-col">
                                            <div className="history-title-row">
                                                <h4 className="tx-title">{tx.title}</h4>
                                                {tx.orderIdText && (
                                                    <Link to={`/my-orders`} className="order-link-chip" title="View Order">
                                                        Order #{tx.orderIdText} <FaExternalLinkAlt className="ext-icon" />
                                                    </Link>
                                                )}
                                                {tx.voucherCode && (
                                                    <span className="voucher-chip">
                                                        Code: {tx.voucherCode}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="tx-desc">{tx.description}</p>
                                            <span className="tx-date">
                                                {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })}
                                            </span>
                                        </div>

                                        <div className="history-points-col">
                                            <span className={`points-delta ${isPositive ? "plus" : "minus"}`}>
                                                {isPositive ? `+${tx.points}` : tx.points}
                                                <small> pts</small>
                                            </span>
                                            {tx.balanceAfter !== undefined && (
                                                <span className="tx-balance-after">
                                                    Balance: {tx.balanceAfter.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ===================================================
                    8. REWARD TIERS & BENEFITS BREAKDOWN
                    =================================================== */}
                <section className="rewards-tiers-section">
                    <div className="section-header-row">
                        <div>
                            <h2 className="section-title">Membership Tiers</h2>
                            <p className="section-subtitle">Level up your status to earn higher point multipliers & perks</p>
                        </div>
                    </div>

                    <div className="tiers-cards-grid">
                        {TIERS_LIST.map((t) => {
                            const isUserCurrent = currentTier.name.toLowerCase() === t.name.toLowerCase();
                            return (
                                <div
                                    key={t.name}
                                    className={`tier-info-card ${isUserCurrent ? "current-tier" : ""}`}
                                    style={{ borderColor: isUserCurrent ? t.color : "#e2e8f0" }}
                                >
                                    {isUserCurrent && <div className="current-badge">Your Current Level</div>}
                                    <div className="tier-header-wrap">
                                        <span className="tier-icon">{t.badge}</span>
                                        <h3 className="tier-card-title">{t.name}</h3>
                                        <span className="tier-points-range">
                                            {t.maxPoints ? `${t.minPoints} - ${t.maxPoints} pts` : `${t.minPoints}+ pts`}
                                        </span>
                                    </div>

                                    <div className="tier-rate-badge" style={{ color: t.color }}>
                                        {t.rate}
                                    </div>

                                    <p className="tier-card-perk">{t.perk}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ===================================================
                    9. BONUS REWARDS & REFERRAL INVITATION
                    =================================================== */}
                <section className="rewards-dual-promo-section">
                    {/* Bonus Card */}
                    <div className="promo-banner-card bonus-card">
                        <div className="promo-card-icon">🔥</div>
                        <div className="promo-card-body">
                            <span className="promo-tag">Special Weekend Boost</span>
                            <h3>Earn 2X Reward Points</h3>
                            <p>
                                Apply coupon <strong>REWARD2X</strong> at checkout to earn double points (20% of order value) on all orders!
                            </p>
                            <Link to="/offers" className="btn-promo-action">
                                <span>Explore Offers</span>
                                <FaChevronRight />
                            </Link>
                        </div>
                    </div>

                    {/* Referral Invite Card */}
                    <div className="promo-banner-card referral-card">
                        <div className="promo-card-icon">🎉</div>
                        <div className="promo-card-body">
                            <span className="promo-tag">Invite & Earn</span>
                            <h3>Invite Friends, Get 50 Points</h3>
                            <p>
                                Share your personal referral code with friends. When they place their first order, both of you earn 50 bonus reward points!
                            </p>

                            <div className="referral-code-box">
                                <span className="ref-code">{profile?.referralCode || "FE-YESWANTH"}</span>
                                <button
                                    className="btn-copy-ref"
                                    onClick={() => handleCopyCode(profile?.referralCode || "FE-YESWANTH")}
                                >
                                    {copiedCode === (profile?.referralCode || "FE-YESWANTH") ? <FaCheck /> : <FaCopy />}
                                </button>
                                <button
                                    className="btn-share-ref"
                                    onClick={() => handleShareReferral(profile?.referralCode || "FE-YESWANTH")}
                                    title="Share invite"
                                >
                                    <FaShareAlt />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* ===================================================
                10. REDEEM CONFIRMATION MODAL
                =================================================== */}
            {redeemConfirmItem && (
                <div className="reward-modal-backdrop" onClick={() => setRedeemConfirmItem(null)}>
                    <div className="reward-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setRedeemConfirmItem(null)}>
                            <FaTimes />
                        </button>

                        <div className="modal-header-icon">
                            <span>{redeemConfirmItem.icon || "🎁"}</span>
                        </div>

                        <h3 className="modal-title">Confirm Reward Redemption</h3>
                        <p className="modal-description">
                            You are about to redeem <strong>{redeemConfirmItem.pointsCost} points</strong> for{" "}
                            <strong>{redeemConfirmItem.title}</strong>.
                        </p>

                        <div className="modal-balance-math">
                            <div className="math-row">
                                <span>Current Points</span>
                                <strong>{currentPoints.toLocaleString()}</strong>
                            </div>
                            <div className="math-row deduct">
                                <span>Points to Deduct</span>
                                <strong>- {redeemConfirmItem.pointsCost.toLocaleString()}</strong>
                            </div>
                            <div className="math-divider" />
                            <div className="math-row total">
                                <span>Remaining Balance</span>
                                <strong>{(currentPoints - redeemConfirmItem.pointsCost).toLocaleString()}</strong>
                            </div>
                        </div>

                        {redeemConfirmItem.termsAndConditions?.length > 0 && (
                            <div className="modal-terms-preview">
                                <h4>Key Terms:</h4>
                                <ul>
                                    {redeemConfirmItem.termsAndConditions.slice(0, 2).map((t, idx) => (
                                        <li key={idx}>{t}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button
                                className="btn-modal-cancel"
                                onClick={() => setRedeemConfirmItem(null)}
                                disabled={isRedeeming}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-modal-confirm"
                                onClick={handleConfirmRedeem}
                                disabled={isRedeeming}
                            >
                                {isRedeeming ? "Processing..." : "Confirm & Redeem"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================================================
                11. INSUFFICIENT POINTS MODAL
                =================================================== */}
            {insufficientItem && (
                <div className="reward-modal-backdrop" onClick={() => setInsufficientItem(null)}>
                    <div className="reward-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setInsufficientItem(null)}>
                            <FaTimes />
                        </button>

                        <div className="modal-header-icon lock">
                            <span>🔒</span>
                        </div>

                        <h3 className="modal-title">Not Enough Points</h3>
                        <p className="modal-description">
                            You need <strong>{insufficientItem.pointsCost} points</strong> to redeem{" "}
                            <em>{insufficientItem.title}</em>.
                        </p>

                        <div className="insufficient-comparison-box">
                            <div className="insufficient-col">
                                <span className="label">You Have</span>
                                <span className="val user-val">{currentPoints} pts</span>
                            </div>
                            <div className="insufficient-divider">&rarr;</div>
                            <div className="insufficient-col">
                                <span className="label">Required</span>
                                <span className="val req-val">{insufficientItem.pointsCost} pts</span>
                            </div>
                        </div>

                        <div className="points-deficit-alert">
                            <FaExclamationCircle />
                            <span>
                                You need <strong>{insufficientItem.pointsCost - currentPoints} more points</strong> to unlock this reward.
                            </span>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setInsufficientItem(null)}>
                                Close
                            </button>
                            <Link to="/menu" className="btn-modal-confirm" onClick={() => setInsufficientItem(null)}>
                                <FaShoppingBag /> Earn More Points
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================================================
                12. REWARD TERMS & CONDITIONS MODAL
                =================================================== */}
            {termsModalItem && (
                <div className="reward-modal-backdrop" onClick={() => setTermsModalItem(null)}>
                    <div className="reward-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setTermsModalItem(null)}>
                            <FaTimes />
                        </button>

                        <div className="modal-header-icon info">
                            <span>{termsModalItem.icon || "ℹ️"}</span>
                        </div>

                        <h3 className="modal-title">{termsModalItem.title}</h3>
                        <p className="modal-description">{termsModalItem.description}</p>

                        <div className="terms-specs-table">
                            <div className="spec-row">
                                <span className="spec-label">Reward Cost</span>
                                <span className="spec-val">⭐ {termsModalItem.pointsCost} Points</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Minimum Order Value</span>
                                <span className="spec-val">
                                    {termsModalItem.minimumOrderValue > 0
                                        ? `₹${termsModalItem.minimumOrderValue}`
                                        : "No minimum required"}
                                </span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Validity Window</span>
                                <span className="spec-val">{termsModalItem.validityDays || 30} Days</span>
                            </div>
                            <div className="spec-row">
                                <span className="spec-label">Applicable Categories</span>
                                <span className="spec-val">
                                    {termsModalItem.applicableCategories?.join(", ") || "All Categories"}
                                </span>
                            </div>
                        </div>

                        <div className="modal-terms-content">
                            <h4>Terms & Conditions:</h4>
                            <ul>
                                {termsModalItem.termsAndConditions?.length > 0 ? (
                                    termsModalItem.termsAndConditions.map((term, idx) => (
                                        <li key={idx}>{term}</li>
                                    ))
                                ) : (
                                    <>
                                        <li>Single use reward voucher valid across all participating kitchens.</li>
                                        <li>Cannot be combined with another promotional coupon code.</li>
                                        <li>Redeemed points are non-refundable once voucher is generated.</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setTermsModalItem(null)}>
                                Close
                            </button>
                            <button
                                className="btn-modal-confirm"
                                onClick={() => {
                                    setTermsModalItem(null);
                                    handleRedeemClick(termsModalItem);
                                }}
                            >
                                Redeem This
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================================================
                13. VOUCHER SUCCESS MODAL
                =================================================== */}
            {voucherSuccessModal && (
                <div className="reward-modal-backdrop" onClick={() => setVoucherSuccessModal(null)}>
                    <div className="reward-modal-card success-voucher" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setVoucherSuccessModal(null)}>
                            <FaTimes />
                        </button>

                        <div className="modal-header-icon success">
                            <span>🎉</span>
                        </div>

                        <h3 className="modal-title">Reward Voucher Unlocked!</h3>
                        <p className="modal-description">
                            Your reward has been activated and is ready to apply at Cart and Checkout.
                        </p>

                        <div className="generated-voucher-box">
                            <div className="gen-vouch-header">
                                <span className="gen-vouch-name">{voucherSuccessModal.title}</span>
                                <span className="gen-vouch-val">
                                    {voucherSuccessModal.rewardType === "free_delivery"
                                        ? "FREE DELIVERY"
                                        : `₹${voucherSuccessModal.discountValue} OFF`}
                                </span>
                            </div>

                            <div className="gen-code-row">
                                <span className="code-display">{voucherSuccessModal.code}</span>
                                <button
                                    className="btn-copy-gen-code"
                                    onClick={() => handleCopyCode(voucherSuccessModal.code)}
                                >
                                    {copiedCode === voucherSuccessModal.code ? <FaCheck /> : <FaCopy />}
                                </button>
                            </div>

                            <div className="gen-vouch-footer">
                                <span>
                                    Valid until{" "}
                                    {new Date(voucherSuccessModal.expiryDate).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric"
                                    })}
                                </span>
                                {voucherSuccessModal.minimumOrderValue > 0 && (
                                    <span>Min order: ₹{voucherSuccessModal.minimumOrderValue}</span>
                                )}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setVoucherSuccessModal(null)}>
                                Close
                            </button>
                            <button
                                className="btn-modal-confirm"
                                onClick={() => {
                                    setVoucherSuccessModal(null);
                                    handleUseVoucher(voucherSuccessModal);
                                }}
                            >
                                <FaShoppingBag /> Apply & Go to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rewards;
