import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { walletAPI } from "../../services/api";
import "./BrowseRightSidebar.css";

import {
  FaFilter,
  FaRedo,
  FaStar,
  FaWallet,
  FaGift,
  FaMapMarkerAlt,
  FaPlus,
  FaCopy,
  FaCheck,
  FaPercent,
  FaTag,
  FaHeart,
  FaMotorcycle,
  FaCoins,
  FaBriefcase,
  FaHome,
  FaTimes,
  FaCheckCircle,
  FaCreditCard,
  FaMobileAlt,
  FaUniversity
} from "react-icons/fa";

const CATEGORIES = [
  { id: "Pizza", label: "Pizza" },
  { id: "Burger", label: "Burger" },
  { id: "Biryani", label: "Biryani" },
  { id: "Noodles", label: "Noodles" },
  { id: "Fast Food", label: "Fast Food" },
  { id: "Drinks", label: "Drinks" },
  { id: "Desserts", label: "Desserts" },
  { id: "Salads", label: "Salads" }
];

const OFFERS = [
  {
    code: "FIRST30",
    discount: "30% OFF",
    title: "New Customer Special",
    desc: "First order offer",
    minOrder: "₹199",
    color: "#ff5200"
  },
  {
    code: "WELCOME40",
    discount: "40% OFF",
    title: "Welcome Feast Special",
    desc: "Welcome offer",
    minOrder: "₹299",
    color: "#e63946"
  }
];

export default function BrowseRightSidebar({
  selectedCategories = [],
  onToggleCategory,
  maxPrice = 1000,
  onChangeMaxPrice,
  minRating = 0,
  onChangeMinRating,
  dietaryFilter = "all", // "all", "veg", "non-veg"
  onChangeDietary,
  under30Min = false,
  onChangeUnder30Min,
  onlyOffers = false,
  onChangeOnlyOffers,
  onClearFilters,
  onFilterFavorites,
  isAddMoneyModalOpen = false,
  setIsAddMoneyModalOpen,
  activeOrder = null
}) {
  const navigate = useNavigate();
  const { user, setUser, couponCode, applyCoupon, removeCoupon, showToast, refreshUser } =
    useContext(StoreContext);

  const [copiedCode, setCopiedCode] = useState("");
  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [addAmount, setAddAmount] = useState(500);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isProcessingAdd, setIsProcessingAdd] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  // Sync external & internal modal state
  const modalOpen = setIsAddMoneyModalOpen ? isAddMoneyModalOpen : internalModalOpen;
  const setModalOpen = setIsAddMoneyModalOpen ? setIsAddMoneyModalOpen : setInternalModalOpen;

  // Active filters count
  const activeCount =
    (selectedCategories.length > 0 ? selectedCategories.length : 0) +
    (maxPrice < 1000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (dietaryFilter !== "all" ? 1 : 0) +
    (under30Min ? 1 : 0) +
    (onlyOffers ? 1 : 0);

  // Fetch recent transactions from backend
  useEffect(() => {
    const fetchTx = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        setLoadingTx(true);
        const { data } = await walletAPI.getTransactions();
        if (data && data.transactions) {
          setTransactions(data.transactions.slice(0, 4));
        }
      } catch (err) {
        // Fallback default sample transactions if empty
      } finally {
        setLoadingTx(false);
      }
    };
    fetchTx();
  }, [user?.wallet]);

  const handleCopy = (code, e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    if (showToast) showToast(`Coupon "${code}" copied!`, "info");
    setTimeout(() => setCopiedCode(""), 2200);
  };

  const handleApply = (code) => {
    if (couponCode === code) {
      removeCoupon();
    } else {
      applyCoupon(code);
    }
  };

  // Backend Add Money Execution
  const handleConfirmAddMoney = async (e) => {
    if (e) e.preventDefault();
    const num = Number(addAmount);
    if (!num || num < 10 || num > 50000) {
      if (showToast) showToast("Please enter an amount between ₹10 and ₹50,000", "error");
      return;
    }

    try {
      setIsProcessingAdd(true);
      const token = localStorage.getItem("token");
      if (!token) {
        if (showToast) showToast("Please sign in to add money to wallet", "error");
        navigate("/login");
        return;
      }

      const { data } = await walletAPI.addMoney(num, paymentMethod);
      if (data.success) {
        const updatedUser = { ...user, wallet: data.wallet };
        if (setUser) setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        if (refreshUser) refreshUser();

        // Add to local transactions list
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev.slice(0, 3)]);
        }

        if (showToast) showToast(`₹${num} added to FoodExpress Wallet! 💰`, "success");
        setModalOpen(false);
      }
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to add money. Please try again.", "error");
    } finally {
      setIsProcessingAdd(false);
    }
  };

  return (
    <>
      <aside className="browse-control-panel browse-sidebar-left browse-sidebar-right browse-right-sidebar browse-sidebar-container" aria-label="Browse Filters and Control Center">
        {/* ===================================================
            0. ACTIVE ORDER (If present)
            =================================================== */}
        {activeOrder && (
          <div className="sidebar-card active-order-sidebar-card">
            <div className="sidebar-card-header">
              <div className="header-title-row">
                <span className="sidebar-card-icon orange"><FaMotorcycle /></span>
                <h3>ACTIVE ORDER</h3>
              </div>
              <span className="order-status-pill">{activeOrder.orderStatus || "Preparing"}</span>
            </div>
            <div className="active-order-sidebar-body">
              <div className="active-order-sidebar-info">
                <span className="active-order-icon">🍛</span>
                <div className="active-order-sidebar-dish">
                  <h4>{activeOrder.items?.[0]?.name || "Delicious Food Order"}</h4>
                  <p>
                    {activeOrder.items?.[0]?.restaurant || "FoodExpress Kitchen"}
                    {activeOrder.items?.length > 1 && ` • +${activeOrder.items.length - 1} items`}
                  </p>
                </div>
              </div>
              <div className="active-order-sidebar-footer">
                <span className="eta-text">ETA: 25–30 min</span>
                <button
                  type="button"
                  className="btn-track-order-sidebar"
                  onClick={() => navigate("/my-orders")}
                >
                  <FaMotorcycle /> Track Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            1. FILTERS (Single unified filter control)
            =================================================== */}
        <div className="sidebar-card filter-card">
          <div className="sidebar-card-header">
            <div className="header-title-row">
              <span className="sidebar-card-icon orange"><FaFilter /></span>
              <h3>FILTERS</h3>
              {activeCount > 0 && (
                <span className="active-filter-badge">{activeCount}</span>
              )}
            </div>
            {activeCount > 0 && (
              <button
                type="button"
                className="btn-sidebar-clear"
                onClick={onClearFilters}
                title="Clear all filters"
              >
                <FaRedo className="clear-spin" /> Clear All
              </button>
            )}
          </div>

          {/* Category Checkboxes */}
          <div className="filter-block">
            <label className="filter-block-title">Category</label>
            <div className="filter-checklist">
              {CATEGORIES.map((cat) => {
                const checked = selectedCategories.includes(cat.id);
                return (
                  <label key={cat.id} className="checklist-row">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleCategory && onToggleCategory(cat.id)}
                    />
                    <span className="styled-box"></span>
                    <span className="checklist-label">{cat.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* Price Range Slider */}
          <div className="filter-block">
            <div className="filter-label-row">
              <label className="filter-block-title">Price Range</label>
              <span className="filter-range-val">Up to ₹{maxPrice}</span>
            </div>
            <div className="range-slider-wrap">
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={maxPrice}
                onChange={(e) =>
                  onChangeMaxPrice && onChangeMaxPrice(Number(e.target.value))
                }
                className="sidebar-price-slider"
                aria-label="Filter dishes by maximum price"
              />
              <div className="slider-limits">
                <span>₹100</span>
                <span>₹1000</span>
              </div>
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* Rating */}
          <div className="filter-block">
            <label className="filter-block-title">Rating</label>
            <div className="filter-checklist">
              <label className="checklist-row">
                <input
                  type="checkbox"
                  checked={minRating === 4.5}
                  onChange={() =>
                    onChangeMinRating && onChangeMinRating(minRating === 4.5 ? 0 : 4.5)
                  }
                />
                <span className="styled-box"></span>
                <span className="checklist-label">
                  4.5+ <FaStar className="gold-star" /> (Top Rated)
                </span>
              </label>
              <label className="checklist-row">
                <input
                  type="checkbox"
                  checked={minRating === 4.0}
                  onChange={() =>
                    onChangeMinRating && onChangeMinRating(minRating === 4.0 ? 0 : 4.0)
                  }
                />
                <span className="styled-box"></span>
                <span className="checklist-label">
                  4.0+ <FaStar className="gold-star" /> (Very Good)
                </span>
              </label>
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* Dietary Checkboxes */}
          <div className="filter-block">
            <label className="filter-block-title">Dietary</label>
            <div className="filter-checklist">
              <label className="checklist-row">
                <input
                  type="checkbox"
                  checked={dietaryFilter === "veg"}
                  onChange={() =>
                    onChangeDietary &&
                    onChangeDietary(dietaryFilter === "veg" ? "all" : "veg")
                  }
                />
                <span className="styled-box"></span>
                <span className="checklist-label">
                  <span className="diet-dot veg">●</span> Veg Only
                </span>
              </label>
              <label className="checklist-row">
                <input
                  type="checkbox"
                  checked={dietaryFilter === "non-veg"}
                  onChange={() =>
                    onChangeDietary &&
                    onChangeDietary(dietaryFilter === "non-veg" ? "all" : "non-veg")
                  }
                />
                <span className="styled-box"></span>
                <span className="checklist-label">
                  <span className="diet-dot nonveg">●</span> Non-Veg
                </span>
              </label>
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* Delivery & Offers Checkboxes */}
          <div className="filter-block">
            <label className="filter-block-title">Delivery & Deals</label>
            <div className="filter-checklist">
              <label className="checklist-row">
                <input
                  type="checkbox"
                  checked={under30Min}
                  onChange={() =>
                    onChangeUnder30Min && onChangeUnder30Min(!under30Min)
                  }
                />
                <span className="styled-box"></span>
                <span className="checklist-label">⚡ Under 30 mins</span>
              </label>
              <label className="checklist-row">
                <input
                  type="checkbox"
                  checked={onlyOffers}
                  onChange={() =>
                    onChangeOnlyOffers && onChangeOnlyOffers(!onlyOffers)
                  }
                />
                <span className="styled-box"></span>
                <span className="checklist-label">🏷️ Offers only</span>
              </label>
            </div>
          </div>
        </div>

        {/* ===================================================
            2. QUICK ACTIONS (Compact rows)
            =================================================== */}
        <div className="sidebar-card quick-actions-card">
          <div className="sidebar-card-header">
            <div className="header-title-row">
              <span className="sidebar-card-icon orange"><FaTag /></span>
              <h3>QUICK ACTIONS</h3>
            </div>
          </div>

          <div className="quick-actions-rows">
            <button
              type="button"
              className="quick-action-row"
              onClick={() => {
                const reorderEl = document.getElementById("browse-reorder-section");
                if (reorderEl) reorderEl.scrollIntoView({ behavior: "smooth" });
                else navigate("/my-orders");
              }}
            >
              <span className="action-row-icon redo"><FaRedo /></span>
              <span className="action-row-label">↻ Reorder</span>
            </button>

            <button
              type="button"
              className="quick-action-row"
              onClick={() => {
                if (onFilterFavorites) onFilterFavorites();
                else navigate("/dashboard");
              }}
            >
              <span className="action-row-icon heart"><FaHeart /></span>
              <span className="action-row-label">♡ Favorites</span>
            </button>

            <button
              type="button"
              className="quick-action-row"
              onClick={() => navigate("/my-orders")}
            >
              <span className="action-row-icon motor"><FaMotorcycle /></span>
              <span className="action-row-label">📦 Track Order</span>
            </button>

            <button
              type="button"
              className="quick-action-row"
              onClick={() => {
                const offerEl = document.getElementById("special-offers-card");
                if (offerEl) offerEl.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span className="action-row-icon tag"><FaPercent /></span>
              <span className="action-row-label">🎟 Offers</span>
            </button>

            <button
              type="button"
              className="quick-action-row"
              onClick={() => setModalOpen(true)}
            >
              <span className="action-row-icon wallet"><FaWallet /></span>
              <span className="action-row-label">💰 Wallet</span>
            </button>

            <button
              type="button"
              className="quick-action-row"
              onClick={() => {
                const rewardEl = document.getElementById("rewards-sidebar-card");
                if (rewardEl) rewardEl.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span className="action-row-icon gift"><FaCoins /></span>
              <span className="action-row-label">⭐ Rewards</span>
            </button>
          </div>
        </div>

        {/* ===================================================
            3. SPECIAL OFFERS (Compact vouchers, contained buttons)
            =================================================== */}
        <div className="sidebar-card offers-card" id="special-offers-card">
          <div className="sidebar-card-header">
            <div className="header-title-row">
              <span className="sidebar-card-icon red"><FaGift /></span>
              <h3>SPECIAL OFFERS</h3>
            </div>
          </div>

          <div className="sidebar-offers-list">
            {OFFERS.map((offer) => {
              const isApplied = couponCode === offer.code;
              const isCopied = copiedCode === offer.code;

              return (
                <div
                  key={offer.code}
                  className={`special-offer-box ${isApplied ? "applied" : ""}`}
                >
                  <div className="offer-box-header">
                    <span className="offer-gift-badge">🎁 {offer.discount}</span>
                    <span className="offer-min-text">Min {offer.minOrder}</span>
                  </div>

                  <div className="offer-code-banner">
                    <span className="offer-code-tag">{offer.code}</span>
                    <button
                      type="button"
                      className="btn-copy-code"
                      onClick={(e) => handleCopy(offer.code, e)}
                      title="Copy code"
                    >
                      {isCopied ? <FaCheck className="copied" /> : <FaCopy />}
                    </button>
                  </div>

                  <p className="offer-subtext">{offer.desc}</p>

                  <button
                    type="button"
                    className={`btn-apply-offer ${isApplied ? "active" : ""}`}
                    onClick={() => handleApply(offer.code)}
                  >
                    {isApplied ? "APPLIED ✓" : "[ APPLY ]"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================================
            4. FOOD EXPRESS WALLET
            =================================================== */}
        <div className="sidebar-card wallet-card" id="wallet-sidebar-card">
          <div className="sidebar-card-header">
            <div className="header-title-row">
              <span className="sidebar-card-icon amber"><FaWallet /></span>
              <h3>FOOD EXPRESS WALLET</h3>
            </div>
          </div>

          <div className="wallet-card-body">
            <div className="wallet-balance-box">
              <span className="wallet-amt">₹{user?.wallet ?? 850}</span>
              <span className="wallet-sub">Available Balance</span>
            </div>

            <button
              type="button"
              className="btn-add-money-cta"
              onClick={() => setModalOpen(true)}
            >
              <FaPlus /> Add Money
            </button>

            {/* Transaction History */}
            <div className="wallet-tx-section">
              <span className="tx-section-title">Recent Transactions</span>
              <div className="tx-list">
                {transactions.length > 0 ? (
                  transactions.map((tx, idx) => (
                    <div key={tx._id || idx} className="tx-item-row">
                      <div className="tx-info">
                        <span className={`tx-type-dot ${tx.type}`}></span>
                        <span className="tx-desc-text">{tx.description || (tx.type === "credit" ? "Wallet Top-up" : "Food Order")}</span>
                      </div>
                      <span className={`tx-amount-badge ${tx.type}`}>
                        {tx.type === "credit" ? "+" : "-"} ₹{tx.amount}
                      </span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="tx-item-row">
                      <div className="tx-info">
                        <span className="tx-type-dot credit"></span>
                        <span className="tx-desc-text">Wallet Top-up</span>
                      </div>
                      <span className="tx-amount-badge credit">+ ₹500</span>
                    </div>
                    <div className="tx-item-row">
                      <div className="tx-info">
                        <span className="tx-type-dot debit"></span>
                        <span className="tx-desc-text">Food Order</span>
                      </div>
                      <span className="tx-amount-badge debit">- ₹299</span>
                    </div>
                    <div className="tx-item-row">
                      <div className="tx-info">
                        <span className="tx-type-dot debit"></span>
                        <span className="tx-desc-text">Food Order</span>
                      </div>
                      <span className="tx-amount-badge debit">- ₹450</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            5. REWARDS
            =================================================== */}
        <div className="sidebar-card rewards-card" id="rewards-sidebar-card">
          <div className="sidebar-card-header">
            <div className="header-title-row">
              <span className="sidebar-card-icon pink"><FaCoins /></span>
              <h3>REWARDS</h3>
            </div>
          </div>

          <div className="rewards-card-body">
            <div className="rewards-hero-row">
              <span className="gold-star-icon">⭐</span>
              <span className="rewards-points-val">
                {(user?.rewardPoints ?? 1240).toLocaleString()} Points
              </span>
            </div>

            <div className="rewards-bar-wrap">
              <div className="progress-bar-ascii">
                <span className="bar-filled">████████████</span>
                <span className="bar-empty">░░░</span>
              </div>
              <p className="rewards-next-hint">260 points to next reward</p>
            </div>

            <button
              type="button"
              className="btn-view-rewards-cta"
              onClick={() => navigate("/dashboard")}
            >
              [ View Rewards ]
            </button>
          </div>
        </div>

        {/* ===================================================
            6. DELIVERY ADDRESSES
            =================================================== */}
        <div className="sidebar-card address-card">
          <div className="sidebar-card-header">
            <div className="header-title-row">
              <span className="sidebar-card-icon purple"><FaMapMarkerAlt /></span>
              <h3>DELIVERY ADDRESSES</h3>
            </div>
          </div>

          <div className="addresses-stack">
            <div className="address-entry">
              <div className="address-badge-icon home"><FaHome /></div>
              <div className="address-details">
                <strong>🏠 Home</strong>
                <p>{user?.city || "Bhimavaram"}, Andhra Pradesh</p>
              </div>
            </div>

            <div className="address-entry">
              <div className="address-badge-icon work"><FaBriefcase /></div>
              <div className="address-details">
                <strong>💼 Work</strong>
                <p>{user?.address || "Tech Park, Main Road"}</p>
              </div>
            </div>

            <button
              type="button"
              className="btn-add-address-cta"
              onClick={() => navigate("/profile")}
            >
              <FaPlus /> Add Address
            </button>
          </div>
        </div>
      </aside>

      {/* ===================================================
          INTERACTIVE WALLET ADD MONEY MODAL
          =================================================== */}
      {modalOpen && (
        <div className="wallet-modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="wallet-modal-window"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-top-bar">
              <div className="modal-title-cluster">
                <div className="modal-icon-wrap"><FaWallet /></div>
                <div>
                  <h3 id="modal-title">Add Money to Wallet</h3>
                  <p>Current Balance: <strong>₹{user?.wallet ?? 850}</strong></p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close-modal"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleConfirmAddMoney} className="modal-content-form">
              <div className="form-group-field">
                <label>Enter Amount</label>
                <div className="amount-input-box">
                  <span className="currency-prefix">₹</span>
                  <input
                    type="number"
                    min="10"
                    max="50000"
                    step="10"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Amount Presets */}
              <div className="preset-chips-row">
                {[100, 200, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`preset-amt-chip ${Number(addAmount) === amt ? "active" : ""}`}
                    onClick={() => setAddAmount(amt)}
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              {/* Payment Method Selector */}
              <div className="form-group-field">
                <label>Select Payment Method</label>
                <div className="modal-payment-methods">
                  <label className={`modal-pay-card ${paymentMethod === "UPI" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="walletMethod"
                      value="UPI"
                      checked={paymentMethod === "UPI"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <FaMobileAlt className="pay-method-icon upi" />
                    <div className="pay-method-text">
                      <strong>UPI (Instant)</strong>
                      <small>Google Pay, PhonePe, Paytm</small>
                    </div>
                  </label>

                  <label className={`modal-pay-card ${paymentMethod === "Card" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="walletMethod"
                      value="Card"
                      checked={paymentMethod === "Card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <FaCreditCard className="pay-method-icon card" />
                    <div className="pay-method-text">
                      <strong>Credit / Debit Card</strong>
                      <small>Visa, MasterCard, RuPay</small>
                    </div>
                  </label>

                  <label className={`modal-pay-card ${paymentMethod === "Net Banking" ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="walletMethod"
                      value="Net Banking"
                      checked={paymentMethod === "Net Banking"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <FaUniversity className="pay-method-icon net" />
                    <div className="pay-method-text">
                      <strong>Net Banking</strong>
                      <small>All Indian Banks Supported</small>
                    </div>
                  </label>
                </div>
              </div>

              <div className="modal-cta-row">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={isProcessingAdd}
                >
                  {isProcessingAdd ? "Processing..." : `Add ₹${addAmount} to Wallet`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
