import React, { useState, useEffect, useCallback, useContext } from "react";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantAPI, getFoodImageUrl } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./RestaurantAnalytics.css";
import {
    FaChartBar,
    FaMoneyBillWave,
    FaShoppingBag,
    FaCheckCircle,
    FaTimesCircle,
    FaStar,
    FaSyncAlt
} from "react-icons/fa";

const RestaurantAnalytics = () => {
    const { showToast } = useContext(StoreContext);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await restaurantAPI.getAnalytics();
            setAnalytics(data.analytics);
        } catch (err) {
            console.error("Analytics fetch error:", err);
            showToast(err.message || "Failed to load analytics", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading && !analytics) {
        return <Loader />;
    }

    const data = analytics || {
        todaySales: 0,
        weeklySales: 0,
        monthlySales: 0,
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        averageOrderValue: 0,
        weeklyBreakdown: [],
        topFoods: []
    };

    const maxSale = Math.max(
        ...data.weeklyBreakdown.map((b) => b.sales),
        100
    );

    return (
        <div className="ra-container">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                        <FaChartBar color="#ff5200" /> Sales & Performance Analytics
                    </h1>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                        Real-time revenue metrics, order completions, and sales trends.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchAnalytics}
                    style={{
                        padding: "9px 16px",
                        borderRadius: "10px",
                        border: "1.5px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#334155",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >
                    <FaSyncAlt /> Refresh
                </button>
            </div>

            {/* Sales Stats Grid */}
            <div className="rd-metrics-grid">
                <div className="rd-metric-card orange">
                    <span className="rd-metric-label">TODAY'S SALES</span>
                    <span className="rd-metric-value">₹{data.todaySales}</span>
                </div>

                <div className="rd-metric-card blue">
                    <span className="rd-metric-label">LAST 7 DAYS SALES</span>
                    <span className="rd-metric-value">₹{data.weeklySales}</span>
                </div>

                <div className="rd-metric-card purple">
                    <span className="rd-metric-label">THIS MONTH'S SALES</span>
                    <span className="rd-metric-value">₹{data.monthlySales}</span>
                </div>

                <div className="rd-metric-card green">
                    <span className="rd-metric-label">COMPLETED ORDERS</span>
                    <span className="rd-metric-value">{data.completedOrders}</span>
                </div>

                <div className="rd-metric-card yellow">
                    <span className="rd-metric-label">AVERAGE ORDER VALUE</span>
                    <span className="rd-metric-value">₹{data.averageOrderValue}</span>
                </div>
            </div>

            {/* Weekly Sales Chart */}
            <div className="ra-chart-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>Weekly Sales Distribution</h3>
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#64748b" }}>
                            Daily revenue trend for the past 7 days
                        </p>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#ff5200" }}>
                        Total: ₹{data.weeklySales}
                    </span>
                </div>

                <div className="ra-chart-bars">
                    {data.weeklyBreakdown.map((dayItem, idx) => {
                        const heightPct = Math.max(
                            8,
                            Math.round((dayItem.sales / maxSale) * 100)
                        );
                        return (
                            <div key={idx} className="ra-chart-col">
                                <span className="ra-bar-value">₹{dayItem.sales}</span>
                                <div className="ra-bar" style={{ height: `${heightPct}%` }} />
                                <span className="ra-bar-label">{dayItem.day}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top Foods Breakdown */}
            <div className="rd-section-card">
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: "#0f172a" }}>
                    Top Performing Dishes
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                    {data.topFoods.map((f) => (
                        <div key={f._id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#f8fafc", borderRadius: "12px" }}>
                            <img
                                src={getFoodImageUrl(f.image)}
                                alt={f.name}
                                style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }}
                            />
                            <div>
                                <strong style={{ display: "block", fontSize: "14px", color: "#0f172a" }}>{f.name}</strong>
                                <div style={{ fontSize: "12px", color: "#64748b" }}>₹{f.price} • {f.category}</div>
                                <div style={{ fontSize: "11px", color: "#f59e0b", fontWeight: "700", marginTop: "2px" }}>
                                    ★ {f.rating || "5.0"} ({f.totalReviews || 0} reviews)
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RestaurantAnalytics;
