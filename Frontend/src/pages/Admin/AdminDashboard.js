import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { adminAPI } from "../../services/api";
import AdminNav from "../../components/AdminNav/AdminNav";
import Loader from "../../components/Loader/Loader";
import "./AdminDashboard.css";
import {
    FaUsers,
    FaHamburger,
    FaClipboardList,
    FaRupeeSign,
    FaClock,
    FaCheckCircle,
    FaPlus,
    FaArrowRight,
    FaSyncAlt
} from "react-icons/fa";

const AdminDashboard = () => {
    const { showToast } = useContext(StoreContext);
    const [stats, setStats] = useState({
        users: 0,
        foods: 0,
        orders: 0,
        revenue: 0,
        pendingOrders: 0,
        completedOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const { data } = await adminAPI.getDashboard();
            setStats(data.stats || {});
            setRecentOrders(data.recentOrders || []);
        } catch (error) {
            console.error("Dashboard fetch error:", error);
            showToast(error.message || "Failed to load dashboard metrics", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    return (
        <div className="admin-page-layout">
            <AdminNav />

            <div className="admin-page-container">
                <div className="admin-page-header">
                    <div>
                        <h1>Platform Overview 📊</h1>
                        <p>Real-time telemetry and management controls for FoodExpress.</p>
                    </div>
                    <button className="btn-admin-refresh" onClick={fetchDashboard}>
                        <FaSyncAlt /> Refresh Data
                    </button>
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <>
                        {/* STATS CARDS */}
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card users">
                                <div className="stat-icon-wrap">
                                    <FaUsers />
                                </div>
                                <div className="stat-text-wrap">
                                    <span>Registered Users</span>
                                    <h2>{stats.users || 0}</h2>
                                </div>
                            </div>

                            <div className="admin-stat-card foods">
                                <div className="stat-icon-wrap">
                                    <FaHamburger />
                                </div>
                                <div className="stat-text-wrap">
                                    <span>Active Dishes</span>
                                    <h2>{stats.foods || 0}</h2>
                                </div>
                            </div>

                            <div className="admin-stat-card orders">
                                <div className="stat-icon-wrap">
                                    <FaClipboardList />
                                </div>
                                <div className="stat-text-wrap">
                                    <span>Total Orders</span>
                                    <h2>{stats.orders || 0}</h2>
                                </div>
                            </div>

                            <div className="admin-stat-card revenue">
                                <div className="stat-icon-wrap">
                                    <FaRupeeSign />
                                </div>
                                <div className="stat-text-wrap">
                                    <span>Total Revenue</span>
                                    <h2>₹{stats.revenue || 0}</h2>
                                </div>
                            </div>

                            <div className="admin-stat-card pending">
                                <div className="stat-icon-wrap">
                                    <FaClock />
                                </div>
                                <div className="stat-text-wrap">
                                    <span>Pending Orders</span>
                                    <h2>{stats.pendingOrders || 0}</h2>
                                </div>
                            </div>

                            <div className="admin-stat-card completed">
                                <div className="stat-icon-wrap">
                                    <FaCheckCircle />
                                </div>
                                <div className="stat-text-wrap">
                                    <span>Completed Orders</span>
                                    <h2>{stats.completedOrders || 0}</h2>
                                </div>
                            </div>
                        </div>

                        {/* QUICK ACTIONS ROW */}
                        <div className="admin-quick-actions">
                            <Link to="/admin/foods" className="action-pill-card">
                                <FaPlus />
                                <div>
                                    <strong>Manage Menu Items</strong>
                                    <small>Add, edit, change pricing and stock</small>
                                </div>
                            </Link>
                            <Link to="/admin/orders" className="action-pill-card">
                                <FaClipboardList />
                                <div>
                                    <strong>Process Orders</strong>
                                    <small>Change order statuses in real-time</small>
                                </div>
                            </Link>
                            <Link to="/admin/users" className="action-pill-card">
                                <FaUsers />
                                <div>
                                    <strong>User Roles & Accounts</strong>
                                    <small>Manage privileges and active status</small>
                                </div>
                            </Link>
                        </div>

                        {/* RECENT ORDERS TABLE */}
                        <div className="admin-table-card">
                            <div className="table-card-header">
                                <h3>Recent Customer Orders</h3>
                                <Link to="/admin/orders" className="view-all-orders-link">
                                    View All Orders <FaArrowRight />
                                </Link>
                            </div>

                            {recentOrders.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="admin-data-table">
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Customer</th>
                                                <th>Contact</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Placed At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentOrders.map((ord) => (
                                                <tr key={ord._id}>
                                                    <td>
                                                        <strong>#{ord._id.slice(-6).toUpperCase()}</strong>
                                                    </td>
                                                    <td>{ord.user?.name || "Customer"}</td>
                                                    <td>{ord.user?.email || ord.user?.phone || "N/A"}</td>
                                                    <td>
                                                        <strong style={{ color: "#2ed573" }}>
                                                            ₹{ord.totalAmount}
                                                        </strong>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge status-${(ord.status || "placed").toLowerCase().replace(/\s+/g, "-")}`}>
                                                            {ord.status || "Placed"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {ord.createdAt
                                                            ? new Date(ord.createdAt).toLocaleDateString()
                                                            : "Recently"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-table-placeholder">
                                    <p>No orders recorded in the system yet.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;