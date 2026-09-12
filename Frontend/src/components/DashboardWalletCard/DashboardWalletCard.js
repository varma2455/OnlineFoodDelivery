import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { StoreContext } from "../../context/StoreContext";
import "./DashboardWalletCard.css";

import PremiumMembershipBadge from "../PremiumMembershipBadge/PremiumMembershipBadge";
import {
  FaWallet,
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaCoins,
  FaCheckCircle,
  FaTimes
} from "react-icons/fa";

const sampleTransactions = [
  {
    id: 1,
    title: "Crispy Zinger Meal Order",
    amount: "-₹299",
    date: "Today, 1:20 PM",
    type: "debit"
  },
  {
    id: 2,
    title: "Welcome Cashback Reward",
    amount: "+₹50",
    date: "Yesterday",
    type: "credit"
  },
  {
    id: 3,
    title: "Instant Wallet Topup",
    amount: "+₹500",
    date: "2 days ago",
    type: "credit"
  }
];

const DashboardWalletCard = () => {
  const { user, showToast } = useContext(StoreContext);
  const formatPlan = (m) => {
    const p = typeof m === "object" ? m?.plan : m;
    return (p && p.toLowerCase() !== "free" && p.toLowerCase() !== "basic")
      ? `FoodExpress ${p.charAt(0).toUpperCase() + p.slice(1)}`
      : "FoodExpress Member";
  };

  const [wallet, setWallet] = useState({
    balance: user?.wallet ?? 100,
    rewardPoints: user?.rewardPoints ?? 50,
    membership: formatPlan(user?.membership)
  });
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(200);
  const [transactions, setTransactions] = useState(sampleTransactions);

  useEffect(() => {
    if (user) {
      setWallet((prev) => ({
        ...prev,
        balance: user.wallet ?? prev.balance,
        rewardPoints: user.rewardPoints ?? prev.rewardPoints,
        membership: formatPlan(user.membership)
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const API_BASE = API_BASE_URL;
        const { data } = await axios.get(`${API_BASE}/api/dashboard/wallet`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success && data.wallet) {
          setWallet((prev) => ({
            ...prev,
            balance: data.wallet.balance ?? prev.balance,
            rewardPoints: data.wallet.rewardPoints ?? prev.rewardPoints
          }));
        }
      } catch (err) {
        // Silently preserve current state
      }
    };

    fetchWallet();
  }, []);

  const handleAddMoney = async (amount) => {
    try {
      const token = localStorage.getItem("token");
      const API_BASE = API_BASE_URL;
      const newBal = wallet.balance + Number(amount);

      if (token) {
        await axios.put(
          `${API_BASE}/api/auth/profile`,
          { wallet: newBal },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setWallet((prev) => ({ ...prev, balance: newBal }));
      setTransactions((prev) => [
        {
          id: Date.now(),
          title: "Wallet Top-up",
          amount: `+₹${amount}`,
          date: "Just now",
          type: "credit"
        },
        ...prev
      ]);

      setShowAddMoneyModal(false);
      showToast(`₹${amount} added to FoodExpress Wallet! 💳`, "success");
    } catch (err) {
      showToast("Unable to top up wallet right now", "error");
    }
  };

  return (
    <div className="foodexpress-wallet-widget">
      {/* Wallet Header Card */}
      <div className="wallet-gradient-card">
        <div className="wallet-header-top">
          <div>
            <span className="wallet-label">FoodExpress Wallet</span>
            <h2 className="wallet-amount">₹{wallet.balance.toLocaleString()}</h2>
          </div>
          <div className="wallet-badge-icon">
            <FaWallet />
          </div>
        </div>

        <div className="wallet-card-bottom">
          <PremiumMembershipBadge plan={user?.membership?.plan || user?.membership} size="sm" />
          <span className="secure-badge">🔒 100% Safe & Instant</span>
        </div>
      </div>

      {/* Rewards Bar */}
      <div className="wallet-rewards-bar">
        <div className="reward-icon-bubble">
          <FaCoins />
        </div>
        <div className="reward-text-group">
          <div className="reward-label">FoodExpress Coins</div>
          <div className="reward-value">{wallet.rewardPoints} Points (₹{Math.floor(wallet.rewardPoints / 2)} value)</div>
        </div>
        <button
          className="btn-redeem-coins"
          onClick={() => showToast("Coins will be automatically redeemed at checkout!", "info")}
        >
          Redeem
        </button>
      </div>

      {/* Quick Actions */}
      <div className="wallet-action-row">
        <button
          className="btn-wallet-action add-funds"
          onClick={() => setShowAddMoneyModal(true)}
        >
          <FaPlus /> Add Money
        </button>
        <button
          className="btn-wallet-action pay-bills"
          onClick={() => showToast("FoodExpress Wallet auto-selects during cart checkout!", "info")}
        >
          <FaArrowUp /> Quick Pay
        </button>
      </div>

      {/* Transactions Section */}
      <div className="wallet-history-section">
        <h4 className="history-title">Recent Activity</h4>
        <div className="history-list">
          {transactions.map((item) => (
            <div className="history-item" key={item.id}>
              <div className="history-left">
                <div className={`history-dot ${item.type}`}>
                  {item.type === "credit" ? <FaArrowDown /> : <FaArrowUp />}
                </div>
                <div>
                  <div className="history-name">{item.title}</div>
                  <div className="history-date">{item.date}</div>
                </div>
              </div>
              <div className={`history-amount ${item.type}`}>
                {item.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="modal-backdrop" onClick={() => setShowAddMoneyModal(false)}>
          <div className="topup-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Top Up Wallet</h3>
              <button
                className="btn-close-modal"
                onClick={() => setShowAddMoneyModal(false)}
              >
                <FaTimes />
              </button>
            </div>

            <p className="modal-sub">Add money for faster 1-click checkout & exclusive cashback.</p>

            <div className="quick-amount-buttons">
              {[100, 200, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  className={`amt-pill ${rechargeAmount === amt ? "active" : ""}`}
                  onClick={() => setRechargeAmount(amt)}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="amount-input-box">
              <span className="rupee-sign">₹</span>
              <input
                type="number"
                min="50"
                max="10000"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(Number(e.target.value))}
                placeholder="Enter amount"
              />
            </div>

            <button
              className="btn-confirm-topup"
              onClick={() => handleAddMoney(rechargeAmount)}
            >
              Add ₹{rechargeAmount} to Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardWalletCard;