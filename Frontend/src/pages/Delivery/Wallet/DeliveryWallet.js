import React, { useState, useEffect, useCallback, useContext } from "react";
import { StoreContext } from "../../../context/StoreContext";
import { deliveryPartnerAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./DeliveryWallet.css";
import {
    FaWallet,
    FaArrowDown,
    FaArrowUp,
    FaShieldAlt,
    FaHistory,
    FaSyncAlt,
    FaCheckCircle,
    FaInfoCircle
} from "react-icons/fa";

const DeliveryWallet = () => {
    const { showToast } = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const [walletData, setWalletData] = useState({
        walletBalance: 0,
        totalEarnings: 0,
        transactions: []
    });
    const [filterCategory, setFilterCategory] = useState("all");

    const fetchWallet = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await deliveryPartnerAPI.getWallet();
            setWalletData({
                walletBalance: data.walletBalance ?? 0,
                totalEarnings: data.totalEarnings ?? 0,
                transactions: data.transactions || []
            });
        } catch (err) {
            console.error("Failed to load wallet data:", err);
            showToast(err.message || "Failed to load wallet ledger", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchWallet();
    }, [fetchWallet]);

    const filteredTransactions = (walletData.transactions || []).filter((tx) => {
        if (filterCategory === "all") return true;
        return tx.category === filterCategory;
    });

    if (loading) {
        return (
            <div className="dp-wallet-loader">
                <Loader />
            </div>
        );
    }

    return (
        <div className="dp-wallet-page">
            {/* Header */}
            <div className="dp-wallet-header">
                <div>
                    <h2>Rider Partner Wallet</h2>
                    <p>FoodExpress unified ledger for automated delivery commissions and earnings</p>
                </div>
                <button className="btn-wallet-refresh" onClick={fetchWallet}>
                    <FaSyncAlt /> Refresh
                </button>
            </div>

            {/* Wallet Overview Hero Cards */}
            <div className="wallet-hero-grid">
                <div className="wallet-balance-card">
                    <div className="balance-head">
                        <span className="balance-label">AVAILABLE WALLET BALANCE</span>
                        <FaShieldAlt className="shield-icon" />
                    </div>
                    <div className="balance-amount">₹{walletData.walletBalance.toLocaleString("en-IN")}</div>
                    <div className="balance-footer">
                        <span className="auto-payout-pill">
                            <FaCheckCircle /> Daily Auto-Settlement Active
                        </span>
                        <span className="balance-note">Instant credit upon delivery</span>
                    </div>
                </div>

                <div className="wallet-lifetime-card">
                    <div className="lifetime-item">
                        <span className="lifetime-label">Total Lifetime Earnings</span>
                        <span className="lifetime-value">₹{walletData.totalEarnings.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="lifetime-divider"></div>
                    <div className="lifetime-item">
                        <span className="lifetime-label">Ledger Transactions</span>
                        <span className="lifetime-value">{walletData.transactions.length} Records</span>
                    </div>
                </div>
            </div>

            {/* Settlement Policy Banner */}
            <div className="wallet-policy-banner">
                <FaInfoCircle className="info-icon" />
                <div className="policy-text">
                    <strong>Direct Bank & UPI Settlement Policy:</strong> Earnings accumulated in your FoodExpress partner wallet are automatically transferred to your registered bank account/UPI at midnight daily with zero withdrawal commission.
                </div>
            </div>

            {/* Transactions History */}
            <div className="wallet-history-card">
                <div className="history-header">
                    <div className="header-left">
                        <FaHistory />
                        <h3>Transaction History & Statements</h3>
                    </div>

                    <div className="history-filters">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="tx-filter-select"
                        >
                            <option value="all">All Categories</option>
                            <option value="delivery_earning">Delivery Earnings</option>
                            <option value="tip">Customer Tips</option>
                            <option value="bonus">Incentives & Bonuses</option>
                            <option value="withdrawal">Payouts / Transfers</option>
                        </select>
                    </div>
                </div>

                {filteredTransactions.length === 0 ? (
                    <div className="no-transactions-box">
                        <FaWallet className="empty-wallet-icon" />
                        <h4>No Transactions Found</h4>
                        <p>No financial ledger records match the selected filter category.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="wallet-tx-table">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((tx) => {
                                    const isCredit = tx.type === "credit";
                                    return (
                                        <tr key={tx._id}>
                                            <td className="tx-code">#{tx._id.slice(-8).toUpperCase()}</td>
                                            <td>
                                                <span className={`direction-pill ${isCredit ? "credit" : "debit"}`}>
                                                    {isCredit ? <FaArrowDown /> : <FaArrowUp />} {tx.type}
                                                </span>
                                            </td>
                                            <td className="tx-desc">{tx.description || "Delivery Order Credit"}</td>
                                            <td>
                                                <span className="category-tag">
                                                    {tx.category ? tx.category.replace(/_/g, " ") : "Earning"}
                                                </span>
                                            </td>
                                            <td className="tx-time">
                                                {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </td>
                                            <td className={`tx-amt ${isCredit ? "green" : "red"}`}>
                                                {isCredit ? "+" : "-"} ₹{tx.amount}
                                            </td>
                                            <td>
                                                <span className="badge-settled">
                                                    {tx.status || "Completed"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryWallet;
