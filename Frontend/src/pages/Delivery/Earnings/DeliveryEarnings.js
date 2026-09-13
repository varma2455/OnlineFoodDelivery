import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { deliveryPartnerAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./DeliveryEarnings.css";
import {
    FaCoins,
    FaCalendarDay,
    FaCalendarWeek,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaWallet,
    FaCheckCircle,
    FaArrowRight,
    FaSyncAlt
} from "react-icons/fa";

const DeliveryEarnings = () => {
    const { showToast } = useContext(StoreContext);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        todayEarnings: 0,
        weekEarnings: 0,
        monthEarnings: 0,
        totalEarnings: 0,
        completedDeliveries: 0,
        averagePerDelivery: 0
    });
    const [recentTransactions, setRecentTransactions] = useState([]);

    const fetchEarnings = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await deliveryPartnerAPI.getEarnings();
            if (data.summary) {
                setSummary(data.summary);
            }
            setRecentTransactions(data.recentTransactions || []);
        } catch (err) {
            console.error("Failed to fetch earnings:", err);
            showToast(err.message || "Failed to load earnings records", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchEarnings();
    }, [fetchEarnings]);

    if (loading) {
        return (
            <div className="dp-earnings-loader">
                <Loader />
            </div>
        );
    }

    return (
        <div className="dp-earnings-page">
            {/* Header */}
            <div className="dp-earnings-header">
                <div>
                    <h2>Earnings & Payouts</h2>
                    <p>Real-time calculation of your delivery fees and completed trip earnings</p>
                </div>
                <div className="header-actions">
                    <button className="btn-earnings-refresh" onClick={fetchEarnings}>
                        <FaSyncAlt /> Refresh
                    </button>
                    <Link to="/delivery/wallet" className="btn-earnings-wallet">
                        <FaWallet /> View Wallet
                    </Link>
                </div>
            </div>

            {/* Earnings Cards Grid */}
            <div className="earnings-summary-grid">
                <div className="earnings-kpi-card today">
                    <div className="kpi-icon-bubble">
                        <FaCalendarDay />
                    </div>
                    <div className="kpi-data">
                        <span className="kpi-title">Today's Earnings</span>
                        <h3 className="kpi-num">₹{summary.todayEarnings || 0}</h3>
                        <span className="kpi-subtitle">Completed shifts today</span>
                    </div>
                </div>

                <div className="earnings-kpi-card week">
                    <div className="kpi-icon-bubble">
                        <FaCalendarWeek />
                    </div>
                    <div className="kpi-data">
                        <span className="kpi-title">This Week</span>
                        <h3 className="kpi-num">₹{summary.weekEarnings || 0}</h3>
                        <span className="kpi-subtitle">Last 7 rolling days</span>
                    </div>
                </div>

                <div className="earnings-kpi-card month">
                    <div className="kpi-icon-bubble">
                        <FaCalendarAlt />
                    </div>
                    <div className="kpi-data">
                        <span className="kpi-title">This Month</span>
                        <h3 className="kpi-num">₹{summary.monthEarnings || 0}</h3>
                        <span className="kpi-subtitle">Current calendar month</span>
                    </div>
                </div>

                <div className="earnings-kpi-card lifetime">
                    <div className="kpi-icon-bubble">
                        <FaCoins />
                    </div>
                    <div className="kpi-data">
                        <span className="kpi-title">Total Lifetime Earnings</span>
                        <h3 className="kpi-num">₹{summary.totalEarnings || 0}</h3>
                        <span className="kpi-subtitle">{summary.completedDeliveries || 0} Total Trips Completed</span>
                    </div>
                </div>
            </div>

            {/* Performance Metrics Row */}
            <div className="earnings-perf-row">
                <div className="perf-item">
                    <span className="perf-label">Completed Deliveries</span>
                    <span className="perf-val">{summary.completedDeliveries || 0}</span>
                </div>
                <div className="perf-divider"></div>
                <div className="perf-item">
                    <span className="perf-label">Avg. Payout per Delivery</span>
                    <span className="perf-val">₹{summary.averagePerDelivery || 50}</span>
                </div>
                <div className="perf-divider"></div>
                <div className="perf-item">
                    <span className="perf-label">Base Delivery Pay</span>
                    <span className="perf-val">₹50 / order</span>
                </div>
                <div className="perf-divider"></div>
                <div className="perf-item">
                    <span className="perf-label">Payment Schedule</span>
                    <span className="perf-val highlight">Direct Wallet Instant Credit</span>
                </div>
            </div>

            {/* Recent Earnings Table */}
            <div className="dp-recent-earnings-card">
                <div className="card-header">
                    <h3>Recent Earning Transactions</h3>
                    <span className="record-count">{recentTransactions.length} records</span>
                </div>

                {recentTransactions.length === 0 ? (
                    <div className="no-earnings-yet">
                        <FaMoneyBillWave className="empty-icon" />
                        <h4>No Delivery Earnings Recorded Yet</h4>
                        <p>Deliver your first order to start receiving instant earnings credited to your wallet balance.</p>
                        <Link to="/delivery/orders" className="btn-get-delivering">
                            Browse Orders <FaArrowRight />
                        </Link>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="earnings-table">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Description / Order</th>
                                    <th>Date & Time</th>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map((tx) => (
                                    <tr key={tx._id}>
                                        <td className="tx-id">#{tx._id.slice(-8).toUpperCase()}</td>
                                        <td>{tx.description || "Delivery Commission"}</td>
                                        <td className="tx-date">
                                            {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </td>
                                        <td>
                                            <span className="badge-credit">Credit</span>
                                        </td>
                                        <td className="tx-amount">+ ₹{tx.amount}</td>
                                        <td>
                                            <span className="status-badge-success">
                                                <FaCheckCircle /> Settled
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryEarnings;
