import React, { useState, useEffect, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { membershipAPI } from "../../services/api";
import "./Membership.css";
import PremiumMembershipBadge from "../../components/PremiumMembershipBadge/PremiumMembershipBadge";
import {
    FaCheck,
    FaTimes,
    FaBolt,
    FaShieldAlt,
    FaPercent,
    FaHeadset,
    FaWallet,
    FaGift,
    FaTruck,
    FaCalendarAlt,
    FaCalculator,
    FaCheckCircle,
    FaArrowRight,
    FaCreditCard,
    FaMobileAlt,
    FaUniversity,
    FaAward,
    FaStar,
    FaSyncAlt,
    FaHistory
} from "react-icons/fa";

const PLANS_CONFIG = [
    {
        id: "silver",
        title: "FOOD EXPRESS SILVER",
        tier: "silver",
        badge: "GOOD START",
        badgeType: "starter",
        monthlyPrice: 99,
        yearlyPrice: 999,
        yearlySavingsText: "Save ₹189 / year",
        discountPercent: 5,
        cashback: 50,
        points: 100,
        cta: "START SILVER",
        accentColor: "#747d8c",
        features: [
            "5% discount on eligible food orders",
            "2 free deliveries every month",
            "₹50 monthly FoodExpress Wallet cashback",
            "100 bonus reward points every month",
            "Member-only offers",
            "Priority access to selected deals",
            "Birthday reward",
            "Saved favorite restaurants",
            "Basic order priority"
        ]
    },
    {
        id: "gold",
        title: "FOOD EXPRESS GOLD",
        tier: "gold",
        badge: "MOST POPULAR",
        badgeType: "popular",
        isPopular: true,
        monthlyPrice: 199,
        yearlyPrice: 1999,
        yearlySavingsText: "Save ₹389 / year",
        discountPercent: 10,
        cashback: 150,
        points: 300,
        cta: "GO GOLD",
        accentColor: "#ffa502",
        features: [
            "10% discount on eligible food orders",
            "Unlimited free delivery on eligible orders",
            "₹150 monthly FoodExpress Wallet cashback",
            "300 bonus reward points every month",
            "Gold-only exclusive offers",
            "Priority delivery",
            "Early access to flash deals",
            "Birthday special reward",
            "Restaurant-specific member discounts",
            "Priority customer support",
            "Free cancellation on eligible orders",
            "Double reward points on selected restaurants"
        ]
    },
    {
        id: "platinum",
        title: "FOOD EXPRESS PLATINUM",
        tier: "platinum",
        badge: "ULTIMATE MEMBER",
        badgeType: "ultimate",
        monthlyPrice: 399,
        yearlyPrice: 3999,
        yearlySavingsText: "Save ₹789 / year",
        discountPercent: 15,
        cashback: 300,
        points: 750,
        cta: "GO PLATINUM",
        accentColor: "#9b59b6",
        features: [
            "15% discount on eligible food orders",
            "Unlimited free delivery",
            "₹300 monthly FoodExpress Wallet cashback",
            "750 bonus reward points every month",
            "Platinum-exclusive offers",
            "Priority restaurant access",
            "Priority delivery",
            "Early access to new restaurants",
            "Early access to flash sales",
            "3× reward points on selected orders",
            "Birthday premium reward",
            "Priority customer support",
            "Dedicated membership support",
            "Free cancellation on eligible orders",
            "Exclusive restaurant experiences",
            "Personalized offers based on order history",
            "Surprise member rewards",
            "Special festival offers"
        ]
    }
];

const COMPARISON_ROWS = [
    { name: "Monthly discount", silver: "5%", gold: "10%", platinum: "15%" },
    { name: "Free delivery", silver: "2 orders / mo", gold: "Unlimited", platinum: "Unlimited" },
    { name: "Monthly wallet cashback", silver: "₹50", gold: "₹150", platinum: "₹300" },
    { name: "Monthly reward points", silver: "100 pts", gold: "300 pts", platinum: "750 pts" },
    { name: "Priority delivery", silver: false, gold: true, platinum: true },
    { name: "Exclusive offers", silver: true, gold: true, platinum: true },
    { name: "Flash deal access", silver: "Selected", gold: "Early access", platinum: "Early access" },
    { name: "Restaurant discounts", silver: false, gold: true, platinum: true },
    { name: "Birthday rewards", silver: "Standard", gold: "Special reward", platinum: "Premium reward" },
    { name: "Reward multiplier", silver: "1x", gold: "2x on select", platinum: "3x on select" },
    { name: "Priority support", silver: false, gold: true, platinum: "Dedicated 24/7" },
    { name: "Personalized offers", silver: false, gold: false, platinum: true },
    { name: "Festival offers", silver: false, gold: false, platinum: true },
    { name: "Cancellation benefits", silver: false, gold: "Free cancellation", platinum: "Free cancellation" }
];

export default function Membership() {
    const { user, refreshUser, showToast } = useContext(StoreContext);
    const navigate = useNavigate();

    // Billing Cycle Toggle
    const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "yearly"

    // Membership Telemetry from Backend
    const [membershipData, setMembershipData] = useState(null);
    const [metrics, setMetrics] = useState({
        monthlySavings: 0,
        ordersThisMonth: 0,
        rewardsEarned: 0,
        walletCashback: 0
    });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [checkoutPlan, setCheckoutPlan] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("Wallet");
    const [processingPayment, setProcessingPayment] = useState(false);
    const [activationSuccess, setActivationSuccess] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // Savings Calculator State
    const [calcOrders, setCalcOrders] = useState(8);
    const [calcAvgValue, setCalcAvgValue] = useState(450);
    const [calcSelectedTier, setCalcSelectedTier] = useState("gold");

    // Fetch backend membership status
    const loadMembership = async () => {
        try {
            setLoading(true);
            const { data } = await membershipAPI.getStatus();
            if (data?.success) {
                setMembershipData(data.membership);
                if (data.metrics) setMetrics(data.metrics);
                if (data.history) setHistory(data.history);
            }
        } catch (err) {
            console.warn("Could not load backend membership status:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMembership();
    }, []);

    // Current active plan info
    const currentPlan = (membershipData?.plan || (typeof user?.membership === "object" ? user?.membership?.plan : user?.membership) || "free").toLowerCase();
    const isMemberActive = membershipData?.isActive || (membershipData?.status === "active");

    // Interactive Savings Calculation
    const calculatedSavings = useMemo(() => {
        const annualSpend = calcOrders * calcAvgValue * 12;
        let discountPct = 0;
        let deliverySavings = 0;
        let cashbackTotal = 0;
        let rewardPointsTotal = 0;

        if (calcSelectedTier === "silver") {
            discountPct = 0.05;
            deliverySavings = Math.min(calcOrders, 2) * 40 * 12;
            cashbackTotal = 50 * 12;
            rewardPointsTotal = 100 * 12;
        } else if (calcSelectedTier === "gold") {
            discountPct = 0.10;
            deliverySavings = calcOrders * 40 * 12;
            cashbackTotal = 150 * 12;
            rewardPointsTotal = 300 * 12;
        } else if (calcSelectedTier === "platinum") {
            discountPct = 0.15;
            deliverySavings = calcOrders * 40 * 12;
            cashbackTotal = 300 * 12;
            rewardPointsTotal = 750 * 12;
        }

        const foodDiscountSavings = Math.round(annualSpend * discountPct);
        const rewardPointsValue = Math.round(rewardPointsTotal * 0.25);
        const totalEstimatedSavings = foodDiscountSavings + deliverySavings + cashbackTotal + rewardPointsValue;

        return {
            totalEstimatedSavings,
            foodDiscountSavings,
            deliverySavings,
            cashbackTotal,
            rewardPointsValue
        };
    }, [calcOrders, calcAvgValue, calcSelectedTier]);

    // Handle Open Upgrade Modal
    const handleSelectPlan = (plan) => {
        if (!user) {
            showToast("Please log in to upgrade your membership.", "info");
            navigate("/login");
            return;
        }
        setCheckoutPlan(plan);
        setActivationSuccess(null);
    };

    // Handle Subscribe / Payment
    const handleConfirmPayment = async () => {
        if (!checkoutPlan) return;

        try {
            setProcessingPayment(true);
            const payload = {
                plan: checkoutPlan.id,
                billingCycle,
                paymentMethod
            };

            const { data } = await membershipAPI.subscribe(payload);

            if (data?.success) {
                setActivationSuccess({
                    planTitle: checkoutPlan.title,
                    expiryDate: data.membership?.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                });
                showToast(`🎉 Welcome to ${checkoutPlan.title}! Membership activated.`, "success");
                if (refreshUser) await refreshUser();
                await loadMembership();
            } else {
                showToast(data?.message || "Failed to process membership subscription.", "error");
            }
        } catch (error) {
            console.error("Membership payment error:", error);
            const msg = error.response?.data?.message || error.message || "Failed to activate membership.";
            showToast(msg, "error");
        } finally {
            setProcessingPayment(false);
        }
    };

    // Handle Auto Renew Toggle
    const handleToggleAutoRenew = async () => {
        try {
            const nextVal = !membershipData?.autoRenew;
            const { data } = await membershipAPI.toggleAutoRenew(nextVal);
            if (data?.success) {
                setMembershipData((prev) => ({ ...prev, autoRenew: data.autoRenew }));
                showToast(`Auto-renewal turned ${data.autoRenew ? "ON" : "OFF"}.`, "info");
            }
        } catch (err) {
            showToast("Failed to update auto-renewal setting.", "error");
        }
    };

    // Handle Cancel Membership
    const handleCancelMembership = async () => {
        try {
            setCancelling(true);
            const { data } = await membershipAPI.cancelMembership();
            if (data?.success) {
                showToast(data.message, "info");
                setShowCancelModal(false);
                if (refreshUser) await refreshUser();
                await loadMembership();
            }
        } catch (err) {
            showToast("Failed to cancel membership.", "error");
        } finally {
            setCancelling(false);
        }
    };

    const formatDisplayDate = (d) => {
        if (!d) return "Recently";
        return new Date(d).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <div className="membership-page">
            {/* HERO / TOP SECTION */}
            <section className="membership-hero-banner">
                <div className="hero-floating-elements">
                    <span className="float-icon float-1">🍔</span>
                    <span className="float-icon float-2">✨</span>
                    <span className="float-icon float-3">🍕</span>
                    <span className="float-icon float-4">⚡</span>
                    <span className="float-icon float-5">🎁</span>
                </div>
                <div className="membership-hero-content">
                    <div className="vip-crest-pill">
                        <FaStar className="crown-shimmer" /> FOODEXPRESS VIP CLUB
                    </div>
                    <h1 className="hero-main-title">Upgrade Your FoodExpress Experience</h1>
                    <p className="hero-subtitle">More savings. Faster delivery. Bigger rewards.</p>
                    <p className="hero-choice-text">Choose the membership that fits your food journey.</p>

                    {/* SECTION 3: BILLING TOGGLE */}
                    <div className="billing-toggle-container">
                        <div className="billing-toggle-wrapper">
                            <button
                                type="button"
                                className={`billing-btn ${billingCycle === "monthly" ? "active" : ""}`}
                                onClick={() => setBillingCycle("monthly")}
                            >
                                MONTHLY
                            </button>
                            <button
                                type="button"
                                className={`billing-btn ${billingCycle === "yearly" ? "active" : ""}`}
                                onClick={() => setBillingCycle("yearly")}
                            >
                                YEARLY
                                <span className="save-more-tag">SAVE MORE</span>
                            </button>
                        </div>
                        {billingCycle === "yearly" && (
                            <div className="yearly-savings-callout animate-fade-in">
                                <span>🎉 Enjoy up to <strong>₹789 savings / year</strong> with annual billing!</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="membership-container">
                {/* SECTION 5: CURRENT MEMBERSHIP */}
                <section className="current-membership-section">
                    {isMemberActive && currentPlan !== "free" ? (
                        <div className={`active-membership-card tier-${currentPlan}`}>
                            <div className="active-card-top">
                                <div className="active-tier-meta">
                                    <span className="active-plan-kicker">YOUR CURRENT MEMBERSHIP</span>
                                    <div style={{ margin: "10px 0 12px" }}>
                                        <PremiumMembershipBadge plan={currentPlan} size="lg" />
                                    </div>
                                    <p className="active-expiry-row">
                                        <FaCalendarAlt /> Active until: <strong>{formatDisplayDate(membershipData?.expiryDate)}</strong>
                                    </p>
                                </div>
                                <div className="active-status-badge-wrap">
                                    <span className="live-status-pill">
                                        <FaCheckCircle /> ACTIVE
                                    </span>
                                    <div className="auto-renew-control">
                                        <label className="renew-toggle-label">
                                            <span>Auto Renewal:</span>
                                            <button
                                                type="button"
                                                className={`toggle-switch-btn ${membershipData?.autoRenew ? "on" : "off"}`}
                                                onClick={handleToggleAutoRenew}
                                                title="Toggle auto renewal"
                                            >
                                                {membershipData?.autoRenew ? "ON" : "OFF"}
                                            </button>
                                        </label>
                                        <small className="renewal-disclaimer">
                                            Renewal will require payment confirmation on your next billing date.
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Live Metrics Grid */}
                            <div className="active-metrics-grid">
                                <div className="metric-box">
                                    <span className="metric-label">Monthly savings</span>
                                    <strong className="metric-value savings">₹{metrics.monthlySavings || 0}</strong>
                                    <small className="metric-hint">Calculated from this month's orders</small>
                                </div>
                                <div className="metric-box">
                                    <span className="metric-label">Orders this month</span>
                                    <strong className="metric-value">{metrics.ordersThisMonth || 0}</strong>
                                    <small className="metric-hint">Member orders placed</small>
                                </div>
                                <div className="metric-box">
                                    <span className="metric-label">Rewards earned</span>
                                    <strong className="metric-value rewards">{metrics.rewardsEarned || 0} pts</strong>
                                    <small className="metric-hint">From member bonuses & orders</small>
                                </div>
                                <div className="metric-box">
                                    <span className="metric-label">Wallet cashback</span>
                                    <strong className="metric-value wallet">₹{metrics.walletCashback || 0}</strong>
                                    <small className="metric-hint">Direct monthly cash reward</small>
                                </div>
                            </div>

                            {/* Manage Membership Bar */}
                            <div className="active-card-actions">
                                <div className="actions-left">
                                    <span className="manage-badge">Manage Membership</span>
                                </div>
                                <div className="actions-right">
                                    <a href="#plans-section" className="btn-manage secondary">
                                        Upgrade / Change Plan
                                    </a>
                                    <a href="#history-section" className="btn-manage secondary">
                                        <FaHistory /> Payment History
                                    </a>
                                    <button
                                        type="button"
                                        className="btn-manage danger"
                                        onClick={() => setShowCancelModal(true)}
                                    >
                                        Cancel Membership
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="free-plan-card">
                            <div className="free-card-left">
                                <span className="free-tag">YOUR CURRENT PLAN</span>
                                <div style={{ margin: "8px 0 12px" }}>
                                    <PremiumMembershipBadge plan="free" size="lg" />
                                </div>
                                <p>You are currently on the Free plan. Upgrade today and unlock exclusive FoodExpress benefits.</p>
                                <div className="free-features-pill-row">
                                    <span>✓ Standard delivery</span>
                                    <span>✓ Standard offers</span>
                                    <span>✓ Normal reward points</span>
                                    <span>✓ Standard support</span>
                                    <span>✓ Access to all restaurants</span>
                                </div>
                            </div>
                            <div className="free-card-right">
                                <a href="#plans-section" className="btn-free-upgrade">
                                    <FaArrowRight /> Explore Premium Plans
                                </a>
                            </div>
                        </div>
                    )}
                </section>

                {/* SECTION 1: THREE MEMBERSHIP PLANS */}
                <section id="plans-section" className="membership-plans-section">
                    <div className="section-title-wrap">
                        <h2>Select Your FoodExpress Membership Tier</h2>
                        <p>Unlock unmatched dining perks, prioritized delivery, and massive monthly cashback.</p>
                    </div>

                    <div className="membership-cards-grid">
                        {PLANS_CONFIG.map((plan) => {
                            const isCurrent = isMemberActive && currentPlan === plan.id;
                            const displayPrice = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
                            const cycleLabel = billingCycle === "yearly" ? "/ year" : "/ month";

                            return (
                                <div
                                    key={plan.id}
                                    className={`pricing-card tier-${plan.id} ${plan.isPopular ? "featured-popular" : ""}`}
                                >
                                    {plan.isPopular && <div className="popular-glow-fx" />}

                                    <div className="card-top-header">
                                        <span className={`plan-badge badge-${plan.badgeType}`}>{plan.badge}</span>
                                        {plan.isPopular && <span className="recommended-label">RECOMMENDED</span>}
                                        <h3 className="plan-title">{plan.title}</h3>

                                        <div className="price-display-box">
                                            <span className="currency-symbol">₹</span>
                                            <span className="price-number">{displayPrice}</span>
                                            <span className="price-duration">{cycleLabel}</span>
                                        </div>

                                        <div className="alternate-price-note">
                                            {billingCycle === "monthly" ? (
                                                <span>Also available: <strong>₹{plan.yearlyPrice} / year</strong></span>
                                            ) : (
                                                <span className="yearly-save-highlight">{plan.yearlySavingsText}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card-features-list">
                                        <h4>Included Perks & Benefits:</h4>
                                        <ul>
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx}>
                                                    <FaCheck className="check-icon" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="card-cta-footer">
                                        {isCurrent ? (
                                            <button type="button" className="plan-cta-btn current" disabled>
                                                <FaCheckCircle /> CURRENT PLAN
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className={`plan-cta-btn ${plan.id}`}
                                                onClick={() => handleSelectPlan(plan)}
                                            >
                                                {plan.cta}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* SECTION 4: PLAN COMPARISON TABLE */}
                <section className="plan-comparison-section">
                    <div className="section-title-wrap">
                        <h2>Compare Memberships</h2>
                        <p>See a detailed side-by-side breakdown of all member privileges.</p>
                    </div>

                    <div className="comparison-table-wrapper">
                        <table className="comparison-table">
                            <thead>
                                <tr>
                                    <th className="feature-col">Feature</th>
                                    <th className="tier-col silver-col">
                                        <span className="th-tier-title">Silver</span>
                                        <span className="th-tier-price">₹99/mo</span>
                                    </th>
                                    <th className="tier-col gold-col popular-th">
                                        <span className="table-popular-tag">MOST POPULAR</span>
                                        <span className="th-tier-title">Gold</span>
                                        <span className="th-tier-price">₹199/mo</span>
                                    </th>
                                    <th className="tier-col platinum-col">
                                        <span className="th-tier-title">Platinum</span>
                                        <span className="th-tier-price">₹399/mo</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARISON_ROWS.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? "row-even" : "row-odd"}>
                                        <td className="row-name">{row.name}</td>
                                        <td className="val-silver">
                                            {typeof row.silver === "boolean" ? (
                                                row.silver ? <FaCheck className="c-check" /> : <span className="c-dash">—</span>
                                            ) : (
                                                row.silver
                                            )}
                                        </td>
                                        <td className="val-gold popular-td">
                                            {typeof row.gold === "boolean" ? (
                                                row.gold ? <FaCheck className="c-check gold" /> : <span className="c-dash">—</span>
                                            ) : (
                                                <strong>{row.gold}</strong>
                                            )}
                                        </td>
                                        <td className="val-platinum">
                                            {typeof row.platinum === "boolean" ? (
                                                row.platinum ? <FaCheck className="c-check platinum" /> : <span className="c-dash">—</span>
                                            ) : (
                                                <strong>{row.platinum}</strong>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* SECTION 7: INTERACTIVE SAVINGS CALCULATOR */}
                <section className="savings-calculator-section">
                    <div className="section-title-wrap">
                        <h2>See How Much You Can Save</h2>
                        <p>Calculate estimated yearly savings based on your food ordering habits.</p>
                    </div>

                    <div className="calculator-container-card">
                        <div className="calc-inputs-column">
                            <div className="calc-tier-picker">
                                <label>Choose plan to calculate:</label>
                                <div className="calc-tier-buttons">
                                    {["silver", "gold", "platinum"].map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            className={`calc-tier-btn ${calcSelectedTier === t ? "active " + t : ""}`}
                                            onClick={() => setCalcSelectedTier(t)}
                                        >
                                            {t.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="calc-slider-group">
                                <div className="slider-header">
                                    <span>Average orders per month:</span>
                                    <strong>{calcOrders} orders</strong>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="30"
                                    value={calcOrders}
                                    onChange={(e) => setCalcOrders(Number(e.target.value))}
                                    className="custom-range-slider"
                                />
                                <div className="slider-ticks">
                                    <span>1 order</span>
                                    <span>15 orders</span>
                                    <span>30 orders</span>
                                </div>
                            </div>

                            <div className="calc-slider-group">
                                <div className="slider-header">
                                    <span>Average order value:</span>
                                    <strong>₹{calcAvgValue}</strong>
                                </div>
                                <input
                                    type="range"
                                    min="150"
                                    max="2500"
                                    step="50"
                                    value={calcAvgValue}
                                    onChange={(e) => setCalcAvgValue(Number(e.target.value))}
                                    className="custom-range-slider"
                                />
                                <div className="slider-ticks">
                                    <span>₹150</span>
                                    <span>₹1,200</span>
                                    <span>₹2,500</span>
                                </div>
                            </div>
                        </div>

                        <div className="calc-results-column">
                            <div className="savings-result-card">
                                <span className="calc-kicker">YOUR ESTIMATED YEARLY SAVINGS</span>
                                <div className="big-savings-number">
                                    ₹{calculatedSavings.totalEstimatedSavings.toLocaleString("en-IN")}
                                </div>
                                <span className="calc-plan-note">
                                    with FoodExpress {calcSelectedTier.charAt(0).toUpperCase() + calcSelectedTier.slice(1)}
                                </span>

                                <div className="savings-breakdown-list">
                                    <div className="breakdown-item">
                                        <span>Delivery savings</span>
                                        <strong>₹{calculatedSavings.deliverySavings.toLocaleString("en-IN")}</strong>
                                    </div>
                                    <div className="breakdown-item">
                                        <span>Food discount savings</span>
                                        <strong>₹{calculatedSavings.foodDiscountSavings.toLocaleString("en-IN")}</strong>
                                    </div>
                                    <div className="breakdown-item">
                                        <span>Wallet cashback</span>
                                        <strong>₹{calculatedSavings.cashbackTotal.toLocaleString("en-IN")}</strong>
                                    </div>
                                    <div className="breakdown-item">
                                        <span>Reward points value</span>
                                        <strong>₹{calculatedSavings.rewardPointsValue.toLocaleString("en-IN")}</strong>
                                    </div>
                                </div>

                                <p className="calc-disclaimer">
                                    * Estimated savings based on average member ordering patterns. Actual savings depend on order values, store eligibility, and delivery locations.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 6: WHY FOODEXPRESS MEMBERSHIP? */}
                <section className="why-membership-section">
                    <div className="section-title-wrap">
                        <h2>Why FoodExpress Membership?</h2>
                        <p>Enjoy curated VIP treatment with every single order.</p>
                    </div>

                    <div className="why-cards-grid">
                        <div className="why-card">
                            <div className="why-icon-bubble delivery">
                                <FaTruck />
                            </div>
                            <h3>FREE DELIVERY</h3>
                            <p>Save on delivery fees with eligible orders across top local restaurants and fine diners.</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon-bubble savings">
                                <FaPercent />
                            </div>
                            <h3>EXTRA SAVINGS</h3>
                            <p>Get exclusive discounts available only to members on every eligible meal and feast.</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon-bubble rewards">
                                <FaGift />
                            </div>
                            <h3>BIGGER REWARDS</h3>
                            <p>Earn more FoodExpress reward points with every bite and redeem them for delicious vouchers.</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon-bubble support">
                                <FaHeadset />
                            </div>
                            <h3>PREMIUM SUPPORT</h3>
                            <p>Get priority assistance with dedicated customer care and rapid resolution whenever you need help.</p>
                        </div>
                    </div>
                </section>

                {/* SECTION 15: MEMBERSHIP HISTORY */}
                <section id="history-section" className="membership-history-section">
                    <div className="section-title-wrap">
                        <h2>Membership History</h2>
                        <p>Your record of past membership subscriptions and renewals.</p>
                    </div>

                    {history && history.length > 0 ? (
                        <div className="history-table-container">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Plan & Cycle</th>
                                        <th>Amount</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Payment Method</th>
                                        <th>Transaction ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((item, idx) => (
                                        <tr key={item._id || idx}>
                                            <td className="hist-plan">
                                                <strong>{item.planTitle || `FoodExpress ${item.plan?.toUpperCase()}`}</strong>
                                                <small>({item.billingCycle})</small>
                                            </td>
                                            <td className="hist-amount">₹{item.amount}</td>
                                            <td className="hist-date">{formatDisplayDate(item.createdAt || item.startDate)}</td>
                                            <td>
                                                <span className={`hist-status-pill ${item.paymentStatus?.toLowerCase()}`}>
                                                    <FaCheck /> {item.paymentStatus || "Successful"}
                                                </span>
                                            </td>
                                            <td className="hist-method">{item.paymentMethod || "Card"}</td>
                                            <td className="hist-txn">
                                                <code>{item.transactionId || `#TXN${idx + 1}`}</code>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-history-box">
                            <FaHistory className="empty-hist-icon" />
                            <h4>No Membership Transactions Yet</h4>
                            <p>When you subscribe to a VIP membership plan, your official invoices and payment records will appear here.</p>
                        </div>
                    )}
                </section>
            </div>

            {/* UPGRADE / PAYMENT MODAL */}
            {checkoutPlan && (
                <div className="modal-overlay animate-fade-in" onClick={() => !processingPayment && setCheckoutPlan(null)}>
                    <div className="membership-checkout-modal" onClick={(e) => e.stopPropagation()}>
                        {!activationSuccess ? (
                            <>
                                <div className="modal-header">
                                    <div className="modal-title-group">
                                        <span className="modal-kicker">MEMBERSHIP CHECKOUT</span>
                                        <h3>{checkoutPlan.title}</h3>
                                    </div>
                                    <button
                                        type="button"
                                        className="modal-close-btn"
                                        onClick={() => setCheckoutPlan(null)}
                                        disabled={processingPayment}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>

                                <div className="modal-body">
                                    <div className="plan-summary-banner">
                                        <div className="plan-sum-left">
                                            <h4>{checkoutPlan.title}</h4>
                                            <p className="plan-cycle-tag">
                                                Billing cycle: <strong>{billingCycle.toUpperCase()}</strong>
                                            </p>
                                        </div>
                                        <div className="plan-sum-right">
                                            <span className="sum-price">
                                                ₹{billingCycle === "yearly" ? checkoutPlan.yearlyPrice : checkoutPlan.monthlyPrice}
                                            </span>
                                            <small>{billingCycle === "yearly" ? "/ year" : "/ month"}</small>
                                        </div>
                                    </div>

                                    <div className="modal-benefits-preview">
                                        <h5>Key Benefits You Unlock Today:</h5>
                                        <ul>
                                            <li>✓ {checkoutPlan.discountPercent}% eligible order discount</li>
                                            <li>
                                                ✓ {checkoutPlan.id === "silver" ? "2 Free deliveries / month" : "Unlimited eligible free delivery"}
                                            </li>
                                            <li>✓ ₹{checkoutPlan.cashback} monthly wallet cashback</li>
                                            <li>✓ {checkoutPlan.points} monthly bonus reward points</li>
                                            <li>✓ Priority VIP customer support & dispatch</li>
                                        </ul>
                                    </div>

                                    {/* Payment Method Selector */}
                                    <div className="payment-select-section">
                                        <h5>Select Payment Method:</h5>
                                        <div className="payment-options-grid">
                                            <label className={`pay-option ${paymentMethod === "Wallet" ? "active" : ""}`}>
                                                <input
                                                    type="radio"
                                                    name="membershipPay"
                                                    value="Wallet"
                                                    checked={paymentMethod === "Wallet"}
                                                    onChange={() => setPaymentMethod("Wallet")}
                                                />
                                                <div className="pay-option-content">
                                                    <FaWallet className="pay-icon wallet" />
                                                    <div>
                                                        <strong>FoodExpress Wallet</strong>
                                                        <small>Balance: ₹{user?.wallet || 0}</small>
                                                    </div>
                                                </div>
                                            </label>

                                            <label className={`pay-option ${paymentMethod === "UPI" ? "active" : ""}`}>
                                                <input
                                                    type="radio"
                                                    name="membershipPay"
                                                    value="UPI"
                                                    checked={paymentMethod === "UPI"}
                                                    onChange={() => setPaymentMethod("UPI")}
                                                />
                                                <div className="pay-option-content">
                                                    <FaMobileAlt className="pay-icon upi" />
                                                    <div>
                                                        <strong>UPI / QR</strong>
                                                        <small>Google Pay, PhonePe, Paytm</small>
                                                    </div>
                                                </div>
                                            </label>

                                            <label className={`pay-option ${paymentMethod === "Card" ? "active" : ""}`}>
                                                <input
                                                    type="radio"
                                                    name="membershipPay"
                                                    value="Card"
                                                    checked={paymentMethod === "Card"}
                                                    onChange={() => setPaymentMethod("Card")}
                                                />
                                                <div className="pay-option-content">
                                                    <FaCreditCard className="pay-icon card" />
                                                    <div>
                                                        <strong>Credit / Debit Card</strong>
                                                        <small>Visa, MasterCard, RuPay</small>
                                                    </div>
                                                </div>
                                            </label>

                                            <label className={`pay-option ${paymentMethod === "Net Banking" ? "active" : ""}`}>
                                                <input
                                                    type="radio"
                                                    name="membershipPay"
                                                    value="Net Banking"
                                                    checked={paymentMethod === "Net Banking"}
                                                    onChange={() => setPaymentMethod("Net Banking")}
                                                />
                                                <div className="pay-option-content">
                                                    <FaUniversity className="pay-icon netbanking" />
                                                    <div>
                                                        <strong>Net Banking</strong>
                                                        <small>All Indian Major Banks</small>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>

                                        {paymentMethod === "Wallet" && (Number(user?.wallet) || 0) < (billingCycle === "yearly" ? checkoutPlan.yearlyPrice : checkoutPlan.monthlyPrice) && (
                                            <div className="wallet-warning-box animate-fade-in">
                                                <span>⚠️ Wallet balance (₹{user?.wallet || 0}) is insufficient. Choose another method or top up.</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="modal-total-summary">
                                        <span>Total Amount Due:</span>
                                        <strong>₹{billingCycle === "yearly" ? checkoutPlan.yearlyPrice : checkoutPlan.monthlyPrice}</strong>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn-modal-cancel"
                                        onClick={() => setCheckoutPlan(null)}
                                        disabled={processingPayment}
                                    >
                                        CANCEL
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-modal-confirm"
                                        onClick={handleConfirmPayment}
                                        disabled={processingPayment}
                                    >
                                        {processingPayment ? "Processing Payment..." : "CONTINUE TO PAYMENT"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="activation-success-screen animate-fade-in">
                                <div className="success-icon-burst">
                                    <FaCheckCircle />
                                </div>
                                <h2>Membership Activated!</h2>
                                <h3>Welcome to {activationSuccess.planTitle} 🎉</h3>
                                <p className="success-tagline">Your membership is now active.</p>

                                <div className="success-detail-box">
                                    <span>Valid until:</span>
                                    <strong>{formatDisplayDate(activationSuccess.expiryDate)}</strong>
                                </div>

                                <div className="success-actions-row">
                                    <button
                                        type="button"
                                        className="btn-success-action primary"
                                        onClick={() => {
                                            setCheckoutPlan(null);
                                            navigate("/browse-food");
                                        }}
                                    >
                                        START ORDERING
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-success-action secondary"
                                        onClick={() => {
                                            setCheckoutPlan(null);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                    >
                                        VIEW MEMBERSHIP
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CANCEL MEMBERSHIP CONFIRMATION MODAL */}
            {showCancelModal && (
                <div className="modal-overlay animate-fade-in" onClick={() => !cancelling && setShowCancelModal(false)}>
                    <div className="membership-cancel-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cancel-modal-header">
                            <h3>Are you sure?</h3>
                            <button type="button" onClick={() => setShowCancelModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="cancel-modal-body">
                            <p>
                                Cancelling auto-renewal will prevent your plan from renewing in the future.
                            </p>
                            <div className="cancel-notice-callout">
                                <strong>Important:</strong> Your current benefits will remain available until:{" "}
                                <u>{formatDisplayDate(membershipData?.expiryDate)}</u>.
                            </div>
                        </div>
                        <div className="cancel-modal-footer">
                            <button
                                type="button"
                                className="btn-cancel-back"
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                            >
                                Keep Membership
                            </button>
                            <button
                                type="button"
                                className="btn-cancel-confirm"
                                onClick={handleCancelMembership}
                                disabled={cancelling}
                            >
                                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
