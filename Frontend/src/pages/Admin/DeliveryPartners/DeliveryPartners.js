import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminNav from "../../../components/AdminNav/AdminNav";
import { StoreContext } from "../../../context/StoreContext";
import { deliveryPartnerAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./DeliveryPartners.css";
import {
    FaMotorcycle,
    FaSyncAlt,
    FaSearch,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaEye,
    FaExclamationTriangle,
    FaUserCheck,
    FaBan,
    FaFilter
} from "react-icons/fa";

const TABS = [
    { key: "All", label: "All Applicants" },
    { key: "pending", label: "Pending Review" },
    { key: "approved", label: "Approved" },
    { key: "changes_requested", label: "Changes Requested" },
    { key: "rejected", label: "Rejected" }
];

const DeliveryPartners = () => {
    const navigate = useNavigate();
    const { showToast } = useContext(StoreContext);

    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({
        totalRequests: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        changesRequested: 0,
        activePartners: 0,
        suspendedPartners: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [cityFilter, setCityFilter] = useState("All");

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await deliveryPartnerAPI.getAdminDeliveryPartners({
                status: activeTab === "All" ? undefined : activeTab,
                search: searchTerm.trim() || undefined,
                city: cityFilter === "All" ? undefined : cityFilter
            });

            if (data.success) {
                setApplications(data.applications || []);
                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (err) {
            console.error("Failed to load delivery partner applications:", err);
            showToast(err.message || "Failed to load partner applications", "error");
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchTerm, cityFilter, showToast]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    return (
        <div className="admin-delivery-page">
            <AdminNav />

            <main className="admin-delivery-container">
                {/* Header */}
                <div className="admin-delivery-header">
                    <div>
                        <h1>
                            <FaMotorcycle style={{ color: "#ff5200" }} /> Delivery Partners Management
                        </h1>
                        <p>Verify rider credentials, review background checks, and manage invitations & onboarding.</p>
                    </div>

                    <div className="admin-header-actions">
                        <button
                            type="button"
                            className="btn-refresh-data"
                            onClick={fetchApplications}
                            title="Refresh real-time data"
                        >
                            <FaSyncAlt /> Refresh
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="admin-stats-strip">
                    <div className="stat-metric-card total">
                        <div className="stat-metric-icon">
                            <FaMotorcycle />
                        </div>
                        <div className="stat-metric-info">
                            <span>Total Applicants</span>
                            <h2>{stats.totalRequests}</h2>
                        </div>
                    </div>

                    <div className="stat-metric-card pending">
                        <div className="stat-metric-icon">
                            <FaClock />
                        </div>
                        <div className="stat-metric-info">
                            <span>Pending Review</span>
                            <h2>{stats.pending}</h2>
                        </div>
                    </div>

                    <div className="stat-metric-card approved">
                        <div className="stat-metric-icon">
                            <FaCheckCircle />
                        </div>
                        <div className="stat-metric-info">
                            <span>Approved</span>
                            <h2>{stats.approved}</h2>
                        </div>
                    </div>

                    <div className="stat-metric-card changes">
                        <div className="stat-metric-icon">
                            <FaExclamationTriangle />
                        </div>
                        <div className="stat-metric-info">
                            <span>Changes Req.</span>
                            <h2>{stats.changesRequested}</h2>
                        </div>
                    </div>

                    <div className="stat-metric-card rejected">
                        <div className="stat-metric-icon">
                            <FaTimesCircle />
                        </div>
                        <div className="stat-metric-info">
                            <span>Rejected</span>
                            <h2>{stats.rejected}</h2>
                        </div>
                    </div>

                    <div className="stat-metric-card active">
                        <div className="stat-metric-icon">
                            <FaUserCheck />
                        </div>
                        <div className="stat-metric-info">
                            <span>Active Riders</span>
                            <h2>{stats.activePartners}</h2>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="admin-filter-bar">
                    <div className="filter-tabs">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                className={`filter-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="filter-inputs">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name, DP-ID, email, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Applications Table */}
                <div className="admin-table-container">
                    {loading ? (
                        <div className="table-loader-wrap">
                            <Loader />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="table-empty-state">
                            <FaMotorcycle className="empty-icon" />
                            <h3>No Delivery Partner Applications Found</h3>
                            <p>No rider registrations match the selected filter criteria.</p>
                        </div>
                    ) : (
                        <table className="admin-partners-table">
                            <thead>
                                <tr>
                                    <th>Applicant ID</th>
                                    <th>Rider Details</th>
                                    <th>Vehicle & DL</th>
                                    <th>City / Hub</th>
                                    <th>Applied On</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => {
                                    const statusClass = app.status || "pending";
                                    return (
                                        <tr key={app._id}>
                                            <td className="col-id">
                                                <span className="app-id-pill">
                                                    {app.applicationId || `DP-${app._id.slice(-4).toUpperCase()}`}
                                                </span>
                                            </td>

                                            <td className="col-user">
                                                <div className="rider-cell">
                                                    <span className="rider-name">{app.ownerName || app.fullName}</span>
                                                    <span className="rider-sub">{app.email}</span>
                                                    <span className="rider-phone">{app.phone}</span>
                                                </div>
                                            </td>

                                            <td className="col-vehicle">
                                                <div className="vehicle-cell">
                                                    <span className="veh-type">{app.vehicleType || "Bike"}</span>
                                                    <span className="veh-num">{app.vehicleNumber}</span>
                                                    <span className="veh-dl">DL: {app.licenseNumber}</span>
                                                </div>
                                            </td>

                                            <td className="col-city">
                                                <span className="city-tag">{app.address?.city || app.city || "Hyderabad"}</span>
                                            </td>

                                            <td className="col-date">
                                                {new Date(app.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </td>

                                            <td className="col-status">
                                                <span className={`status-tag status-${statusClass}`}>
                                                    {statusClass.replace(/_/g, " ")}
                                                </span>
                                            </td>

                                            <td className="col-actions">
                                                <button
                                                    type="button"
                                                    className="btn-view-details"
                                                    onClick={() => navigate(`/admin/delivery-partners/${app._id}`)}
                                                >
                                                    <FaEye /> Review
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DeliveryPartners;
