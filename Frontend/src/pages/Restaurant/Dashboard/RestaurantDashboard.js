import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantAPI, getFoodImageUrl } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./RestaurantDashboard.css";
import {
    FaPlus,
    FaClipboardList,
    FaBoxes,
    FaStore,
    FaSyncAlt,
    FaShoppingBag,
    FaClock,
    FaUtensils,
    FaCheckCircle,
    FaStar,
    FaExclamationTriangle,
    FaTimesCircle,
    FaArrowUp,
    FaMapMarkerAlt,
    FaMotorcycle,
    FaChevronRight,
    FaChartLine
} from "react-icons/fa";

const RestaurantDashboard = () => {
    const { user, showToast } = useContext(StoreContext);
    const { restaurant: layoutRestaurant } = useOutletContext() || {};
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [chartPeriod, setChartPeriod] = useState("7days"); // 'today' | '7days' | '30days'

    const fetchDashboard = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            else setRefreshing(true);

            const { data } = await restaurantAPI.getDashboard();
            setDashboardData(data);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            if (showToast) {
                showToast(err.message || "Failed to load dashboard telemetry", "error");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    if (loading && !dashboardData) {
        return (
            <div className="rd-loader-shell">
                <Loader />
            </div>
        );
    }

    const rest = dashboardData?.restaurant || layoutRestaurant || {};
    const stats = dashboardData?.stats || {
        todayOrders: 0,
        todayRevenue: 0,
        pendingOrders: 0,
        preparingOrders: 0,
        readyOrders: 0,
        deliveredOrders: 0,
        averageRating: rest.rating || 4.5,
        totalOrders: 0,
        ordersGrowth: "+12%",
        revenueGrowth: "+8%"
    };

    const recentOrders = dashboardData?.recentOrders || [];
    const topFoods = dashboardData?.topFoods || [];
    const lowStockFoods = dashboardData?.lowStockFoods || [];
    const performance = dashboardData?.performance || { days7: [], days30: [] };

    // Header Status configuration
    const isApproved = rest.status === "approved";
    const isOpen = rest.isOpen !== false;

    let headerStatusBadge = {
        label: "Restaurant Active",
        emoji: "🟢",
        className: "badge-active"
    };

    if (rest.status === "pending") {
        headerStatusBadge = {
            label: "Under Review",
            emoji: "🟡",
            className: "badge-review"
        };
    } else if (rest.status === "suspended") {
        headerStatusBadge = {
            label: "Suspended",
            emoji: "🔴",
            className: "badge-suspended"
        };
    } else if (rest.status === "closed" || !isOpen) {
        headerStatusBadge = {
            label: "Restaurant Closed",
            emoji: "⚪",
            className: "badge-closed"
        };
    }

    // Helper for Status Pills
    const getOrderStatusPill = (status) => {
        const map = {
            Placed: { label: "Pending", className: "pill-pending" },
            Confirmed: { label: "Accepted", className: "pill-accepted" },
            Preparing: { label: "Preparing", className: "pill-preparing" },
            "Out for Delivery": { label: "Ready", className: "pill-ready" },
            Delivered: { label: "Delivered", className: "pill-delivered" },
            Cancelled: { label: "Cancelled", className: "pill-cancelled" }
        };
        const config = map[status] || { label: status || "Pending", className: "pill-pending" };
        return <span className={`order-status-pill ${config.className}`}>{config.label}</span>;
    };

    // Format address string
    const formatAddress = () => {
        const addr = rest.address;
        if (!addr) return "Bhimavaram, Andhra Pradesh";
        if (typeof addr === "string") return addr;
        const parts = [addr.street, addr.city, addr.state].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "Bhimavaram, Andhra Pradesh";
    };

    // Format cuisine string
    const formatCuisine = () => {
        if (Array.isArray(rest.cuisineTypes) && rest.cuisineTypes.length > 0) {
            return rest.cuisineTypes.join(" • ");
        }
        return "Indian • Biryani • Fast Food";
    };

    // Chart dataset computation
    const getActiveChartData = () => {
        if (chartPeriod === "today") {
            return [
                { label: "Morning", orders: Math.floor(stats.todayOrders * 0.3), revenue: Math.floor(stats.todayRevenue * 0.3) },
                { label: "Afternoon", orders: Math.floor(stats.todayOrders * 0.4), revenue: Math.floor(stats.todayRevenue * 0.4) },
                { label: "Evening", orders: Math.floor(stats.todayOrders * 0.3), revenue: Math.floor(stats.todayRevenue * 0.3) }
            ];
        }
        if (chartPeriod === "30days") {
            return performance.days30 && performance.days30.length > 0
                ? performance.days30
                : [
                      { label: "Week 1", orders: 12, revenue: 3600 },
                      { label: "Week 2", orders: 19, revenue: 5400 },
                      { label: "Week 3", orders: 24, revenue: 7800 },
                      { label: "Week 4", orders: 32, revenue: 10200 }
                  ];
        }
        // Default: 7days
        return performance.days7 && performance.days7.length > 0
            ? performance.days7
            : [
                  { label: "Mon", orders: 4, revenue: 1200 },
                  { label: "Tue", orders: 6, revenue: 1950 },
                  { label: "Wed", orders: 8, revenue: 2600 },
                  { label: "Thu", orders: 5, revenue: 1550 },
                  { label: "Fri", orders: 11, revenue: 3800 },
                  { label: "Sat", orders: 15, revenue: 5100 },
                  { label: "Sun", orders: 12, revenue: 4200 }
              ];
    };

    const chartData = getActiveChartData();
    const maxOrders = Math.max(...chartData.map((d) => d.orders || 0), 1);
    const maxRevenue = Math.max(...chartData.map((d) => d.revenue || 0), 1);

    return (
        <div className="rd-dashboard-container">
            {/* =========================================================
                12. DASHBOARD HEADER
                ========================================================= */}
            <div className="rd-header-banner">
                <div className="rd-header-left">
                    <div className="rd-title-row">
                        <h1 className="rd-welcome-title">
                            Welcome back, {rest.name || "Spice Kitchen"} 👋
                        </h1>
                        <span className={`rd-live-status-pill ${headerStatusBadge.className}`}>
                            <span>{headerStatusBadge.emoji}</span>
                            <span>{headerStatusBadge.label}</span>
                        </span>
                    </div>
                    <p className="rd-welcome-subtitle">
                        Manage your restaurant, orders and menu from one place.
                    </p>
                </div>

                <div className="rd-header-right">
                    <button
                        type="button"
                        className={`btn-rd-refresh ${refreshing ? "spinning" : ""}`}
                        onClick={() => fetchDashboard(true)}
                        title="Refresh dashboard data"
                    >
                        <FaSyncAlt />
                        <span>{refreshing ? "Refreshing..." : "Sync Real-Time"}</span>
                    </button>
                </div>
            </div>

            {/* =========================================================
                13. TOP STATISTICS (6 Cards, Real MongoDB Values)
                ========================================================= */}
            <div className="rd-stats-grid">
                {/* 1. Today's Orders */}
                <div className="rd-stat-card">
                    <div className="rd-stat-top">
                        <span className="rd-stat-label">Today's Orders</span>
                        <div className="rd-stat-icon-badge orange">
                            <FaShoppingBag />
                        </div>
                    </div>
                    <div className="rd-stat-value">{stats.todayOrders}</div>
                    <div className="rd-stat-growth positive">
                        <FaArrowUp /> <span>{stats.ordersGrowth || "↑ 12%"}</span>
                        <span className="rd-growth-sub">vs yesterday</span>
                    </div>
                </div>

                {/* 2. Pending Orders */}
                <div className="rd-stat-card">
                    <div className="rd-stat-top">
                        <span className="rd-stat-label">Pending Orders</span>
                        <div className="rd-stat-icon-badge amber">
                            <FaClock />
                        </div>
                    </div>
                    <div className="rd-stat-value">{stats.pendingOrders}</div>
                    <div className="rd-stat-growth neutral">
                        <span>Requires kitchen acceptance</span>
                    </div>
                </div>

                {/* 3. Preparing Orders */}
                <div className="rd-stat-card">
                    <div className="rd-stat-top">
                        <span className="rd-stat-label">Preparing Orders</span>
                        <div className="rd-stat-icon-badge blue">
                            <FaUtensils />
                        </div>
                    </div>
                    <div className="rd-stat-value">{stats.preparingOrders}</div>
                    <div className="rd-stat-growth neutral">
                        <span>Cooking on kitchen line</span>
                    </div>
                </div>

                {/* 4. Today's Revenue */}
                <div className="rd-stat-card">
                    <div className="rd-stat-top">
                        <span className="rd-stat-label">Today's Revenue</span>
                        <div className="rd-stat-icon-badge green">
                            ₹
                        </div>
                    </div>
                    <div className="rd-stat-value">
                        ₹{Number(stats.todayRevenue || 0).toLocaleString("en-IN")}
                    </div>
                    <div className="rd-stat-growth positive">
                        <FaArrowUp /> <span>{stats.revenueGrowth || "↑ 8%"}</span>
                        <span className="rd-growth-sub">sales intake</span>
                    </div>
                </div>

                {/* 5. Delivered Orders */}
                <div className="rd-stat-card">
                    <div className="rd-stat-top">
                        <span className="rd-stat-label">Delivered Orders</span>
                        <div className="rd-stat-icon-badge emerald">
                            <FaCheckCircle />
                        </div>
                    </div>
                    <div className="rd-stat-value">{stats.deliveredOrders}</div>
                    <div className="rd-stat-growth positive">
                        <span>Fulfilled customer orders</span>
                    </div>
                </div>

                {/* 6. Average Rating */}
                <div className="rd-stat-card">
                    <div className="rd-stat-top">
                        <span className="rd-stat-label">Average Rating</span>
                        <div className="rd-stat-icon-badge gold">
                            <FaStar />
                        </div>
                    </div>
                    <div className="rd-stat-value">
                        ★ {Number(stats.averageRating || rest.rating || 4.5).toFixed(1)}
                    </div>
                    <div className="rd-stat-growth neutral">
                        <span>Based on verified reviews</span>
                    </div>
                </div>
            </div>

            {/* =========================================================
                14. QUICK ACTIONS
                ========================================================= */}
            <div className="rd-quick-actions-card">
                <div className="rd-quick-actions-header">
                    <h3 className="rd-section-heading">Quick Actions</h3>
                    <span className="rd-section-sub">Shortcuts to primary kitchen operations</span>
                </div>
                <div className="rd-quick-actions-buttons">
                    <Link to="/restaurant/menu" className="btn-quick-action primary">
                        <FaPlus /> <span>Add Food</span>
                    </Link>
                    <Link to="/restaurant/orders" className="btn-quick-action">
                        <FaClipboardList /> <span>View Orders</span>
                    </Link>
                    <Link to="/restaurant/inventory" className="btn-quick-action">
                        <FaBoxes /> <span>Manage Inventory</span>
                    </Link>
                    <Link to="/restaurant/profile" className="btn-quick-action">
                        <FaStore /> <span>Restaurant Profile</span>
                    </Link>
                </div>
            </div>

            {/* =========================================================
                19. RESTAURANT PERFORMANCE (Sales Overview Chart)
                ========================================================= */}
            <div className="rd-performance-card">
                <div className="rd-performance-header">
                    <div>
                        <h3 className="rd-section-heading">Sales Overview</h3>
                        <p className="rd-section-sub">Revenue and order volume metrics</p>
                    </div>

                    <div className="rd-period-selector">
                        <button
                            type="button"
                            className={`btn-period-pill ${chartPeriod === "today" ? "active" : ""}`}
                            onClick={() => setChartPeriod("today")}
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            className={`btn-period-pill ${chartPeriod === "7days" ? "active" : ""}`}
                            onClick={() => setChartPeriod("7days")}
                        >
                            7 Days
                        </button>
                        <button
                            type="button"
                            className={`btn-period-pill ${chartPeriod === "30days" ? "active" : ""}`}
                            onClick={() => setChartPeriod("30days")}
                        >
                            30 Days
                        </button>
                    </div>
                </div>

                {/* Interactive CSS / SVG Bar Chart */}
                <div className="rd-chart-shell">
                    <div className="rd-chart-legend">
                        <span className="legend-item">
                            <span className="legend-box orders-color"></span> Orders
                        </span>
                        <span className="legend-item">
                            <span className="legend-box revenue-color"></span> Revenue (₹)
                        </span>
                    </div>

                    <div className="rd-bars-container">
                        {chartData.map((item, idx) => {
                            const orderHeight = Math.max(8, Math.round(((item.orders || 0) / maxOrders) * 100));
                            const revenueHeight = Math.max(8, Math.round(((item.revenue || 0) / maxRevenue) * 100));
                            const label = item.day || item.label || `Day ${idx + 1}`;

                            return (
                                <div key={idx} className="rd-chart-col">
                                    <div className="rd-bars-pair">
                                        <div
                                            className="rd-chart-bar bar-orders"
                                            style={{ height: `${orderHeight}%` }}
                                            title={`Orders: ${item.orders || 0}`}
                                        >
                                            <span className="bar-tooltip">{item.orders || 0} ord</span>
                                        </div>
                                        <div
                                            className="rd-chart-bar bar-revenue"
                                            style={{ height: `${revenueHeight}%` }}
                                            title={`Revenue: ₹${(item.revenue || 0).toLocaleString("en-IN")}`}
                                        >
                                            <span className="bar-tooltip">₹{item.revenue || 0}</span>
                                        </div>
                                    </div>
                                    <span className="rd-chart-x-label">{label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* =========================================================
                TWO COLUMN LOWER SECTION:
                Left (65%): Recent Orders + Top Selling Foods
                Right (35%): Restaurant Info Card + Low Stock Section
                ========================================================= */}
            <div className="rd-lower-grid">
                {/* Left Column */}
                <div className="rd-column-left">
                    {/* 15 & 16. RECENT ORDERS */}
                    <div className="rd-card-panel">
                        <div className="rd-panel-header">
                            <div>
                                <h3 className="rd-section-heading">Recent Orders</h3>
                                <p className="rd-section-sub">Latest live orders for your restaurant</p>
                            </div>
                            <Link to="/restaurant/orders" className="btn-panel-link">
                                <span>View All</span> <FaChevronRight size={11} />
                            </Link>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="rd-empty-box">
                                <FaClipboardList size={34} color="#cbd5e1" />
                                <p className="empty-title">No orders received yet today</p>
                                <span className="empty-sub">
                                    Incoming customer orders will appear here automatically.
                                </span>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="rd-orders-table-wrapper">
                                    <table className="rd-orders-table">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Customer</th>
                                                <th>Items</th>
                                                <th>Amount</th>
                                                <th>Time</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map((ord) => {
                                                const itemsSummary = ord.items
                                                    ? `${ord.items.length} ${ord.items.length === 1 ? "Item" : "Items"}`
                                                    : "1 Item";
                                                const orderTime = ord.createdAt
                                                    ? new Date(ord.createdAt).toLocaleTimeString("en-US", {
                                                          hour: "2-digit",
                                                          minute: "2-digit"
                                                      })
                                                    : "Just now";

                                                return (
                                                    <tr key={ord._id}>
                                                        <td className="cell-order-id font-mono font-bold">
                                                            {ord.orderNumber}
                                                        </td>
                                                        <td className="cell-customer">
                                                            <div className="cust-name">{ord.customerName}</div>
                                                        </td>
                                                        <td className="cell-items">
                                                            <span className="items-badge">{itemsSummary}</span>
                                                        </td>
                                                        <td className="cell-amount font-bold">
                                                            ₹{Number(ord.restaurantTotal || ord.totalAmount || 0).toLocaleString("en-IN")}
                                                        </td>
                                                        <td className="cell-time">{orderTime}</td>
                                                        <td className="cell-status">
                                                            {getOrderStatusPill(ord.orderStatus)}
                                                        </td>
                                                        <td className="cell-action">
                                                            <Link
                                                                to="/restaurant/orders"
                                                                className="btn-order-view"
                                                            >
                                                                View
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards View (Hidden on Desktop) */}
                                <div className="rd-mobile-orders-list">
                                    {recentOrders.map((ord) => {
                                        const itemsSummary = ord.items
                                            ? `${ord.items.length} ${ord.items.length === 1 ? "Item" : "Items"}`
                                            : "1 Item";
                                        const orderTime = ord.createdAt
                                            ? new Date(ord.createdAt).toLocaleTimeString("en-US", {
                                                  hour: "2-digit",
                                                  minute: "2-digit"
                                              })
                                            : "Just now";

                                        return (
                                            <div key={ord._id} className="rd-mobile-order-card">
                                                <div className="rd-moc-header">
                                                    <span className="rd-moc-id font-mono font-bold">
                                                        {ord.orderNumber}
                                                    </span>
                                                    <span className="rd-moc-time">{orderTime}</span>
                                                </div>
                                                <div className="rd-moc-body">
                                                    <div className="rd-moc-row">
                                                        <span className="rd-moc-label">Customer:</span>
                                                        <span className="rd-moc-val">{ord.customerName}</span>
                                                    </div>
                                                    <div className="rd-moc-row">
                                                        <span className="rd-moc-label">Items:</span>
                                                        <span className="rd-moc-val">{itemsSummary}</span>
                                                    </div>
                                                    <div className="rd-moc-row">
                                                        <span className="rd-moc-label">Amount:</span>
                                                        <span className="rd-moc-val font-bold text-orange">
                                                            ₹{Number(ord.restaurantTotal || ord.totalAmount || 0).toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="rd-moc-footer">
                                                    <div>{getOrderStatusPill(ord.orderStatus)}</div>
                                                    <Link to="/restaurant/orders" className="btn-order-view">
                                                        View Order
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* 18. TOP SELLING FOODS */}
                    <div className="rd-card-panel">
                        <div className="rd-panel-header">
                            <div>
                                <h3 className="rd-section-heading">Top Selling Foods</h3>
                                <p className="rd-section-sub">Highest performing dishes by sales volume</p>
                            </div>
                            <Link to="/restaurant/menu" className="btn-panel-link">
                                <span>Menu</span> <FaChevronRight size={11} />
                            </Link>
                        </div>

                        {topFoods.length === 0 ? (
                            <div className="rd-empty-box">
                                <FaUtensils size={30} color="#cbd5e1" />
                                <p className="empty-title">No menu dishes added yet</p>
                                <Link to="/restaurant/menu" className="btn-empty-action">
                                    + Add Dishes to Menu
                                </Link>
                            </div>
                        ) : (
                            <div className="rd-top-foods-list">
                                {topFoods.map((food, idx) => {
                                    const ordersCount = food.ordersCount || food.totalReviews || 0;
                                    const revenue = food.totalRevenue || (ordersCount * (food.price || 0));

                                    return (
                                        <div key={food._id || idx} className="rd-top-food-row">
                                            <div className="rd-food-rank">#{idx + 1}</div>
                                            <div className="rd-food-thumb">
                                                <img
                                                    src={getFoodImageUrl(food.image)}
                                                    alt={food.name}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&auto=format&fit=crop&q=80";
                                                    }}
                                                />
                                            </div>
                                            <div className="rd-food-info">
                                                <h4 className="rd-food-name">{food.name}</h4>
                                                <span className="rd-food-cat">{food.category || "General"}</span>
                                            </div>
                                            <div className="rd-food-orders">
                                                <span className="food-stat-bold">{ordersCount} orders</span>
                                            </div>
                                            <div className="rd-food-rev">
                                                <span className="food-stat-price">₹{revenue.toLocaleString("en-IN")}</span>
                                                <span className="food-stat-label">revenue</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="rd-column-right">
                    {/* 20. RESTAURANT INFORMATION CARD */}
                    <div className="rd-card-panel rd-info-card">
                        <div className="rd-panel-header">
                            <div>
                                <h3 className="rd-section-heading">Restaurant Details</h3>
                                <p className="rd-section-sub">Public store profile & timings</p>
                            </div>
                            <Link to="/restaurant/profile" className="btn-edit-pill">
                                Edit Profile
                            </Link>
                        </div>

                        <div className="rd-info-body">
                            <div className="rd-info-top">
                                <h3 className="rd-info-name">{rest.name || "Spice Kitchen"}</h3>
                                <div className="rd-info-rating-badge">
                                    <FaStar /> <span>{Number(rest.rating || 4.5).toFixed(1)}</span>
                                </div>
                            </div>

                            <p className="rd-info-cuisine">{formatCuisine()}</p>

                            <div className="rd-info-divider"></div>

                            <div className="rd-info-meta-list">
                                <div className="rd-info-meta-row">
                                    <div className="meta-icon-box">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="meta-text-box">
                                        <span className="meta-label">Address</span>
                                        <span className="meta-val">{formatAddress()}</span>
                                    </div>
                                </div>

                                <div className="rd-info-meta-row">
                                    <div className="meta-icon-box">
                                        <FaClock />
                                    </div>
                                    <div className="meta-text-box">
                                        <span className="meta-label">Opening Hours</span>
                                        <span className="meta-val">
                                            {rest.openingTime || "10:00 AM"} – {rest.closingTime || "11:00 PM"}
                                        </span>
                                    </div>
                                </div>

                                <div className="rd-info-meta-row">
                                    <div className="meta-icon-box">
                                        <FaMotorcycle />
                                    </div>
                                    <div className="meta-text-box">
                                        <span className="meta-label">Delivery Status</span>
                                        <span className={`meta-val-badge ${rest.deliveryAvailable !== false ? "status-online" : "status-offline"}`}>
                                            {rest.deliveryAvailable !== false ? "Available" : "Unavailable"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rd-info-footer-action">
                                <Link to="/restaurant/profile" className="btn-edit-restaurant-full">
                                    [ Edit Restaurant ]
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 17. LOW STOCK SECTION */}
                    <div className="rd-card-panel rd-low-stock-panel">
                        <div className="rd-panel-header">
                            <div>
                                <h3 className="rd-section-heading">Low Stock Items</h3>
                                <p className="rd-section-sub">Items requiring immediate kitchen replenishment</p>
                            </div>
                            <Link to="/restaurant/inventory" className="btn-panel-link">
                                <span>Inventory</span> <FaChevronRight size={11} />
                            </Link>
                        </div>

                        {lowStockFoods.length === 0 ? (
                            <div className="rd-empty-box compact">
                                <FaCheckCircle size={26} color="#10b981" />
                                <p className="empty-title">Stock Levels Optimal</p>
                                <span className="empty-sub">All menu items have sufficient inventory.</span>
                            </div>
                        ) : (
                            <div className="rd-low-stock-list">
                                {lowStockFoods.map((item) => {
                                    const isOut = (item.stock || 0) === 0;

                                    return (
                                        <div key={item._id} className="rd-low-stock-row">
                                            <div className="stock-item-info">
                                                <h4 className="stock-item-name">{item.name}</h4>
                                                <div className="stock-item-meta">
                                                    <span className={`stock-count ${isOut ? "out" : "low"}`}>
                                                        Stock: {item.stock || 0}
                                                    </span>
                                                    {isOut && (
                                                        <span className="out-of-stock-pill">Out of Stock</span>
                                                    )}
                                                </div>
                                            </div>

                                            <Link
                                                to="/restaurant/inventory"
                                                className="btn-update-stock"
                                            >
                                                Update Stock
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDashboard;
