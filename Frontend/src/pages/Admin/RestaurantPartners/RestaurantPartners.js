import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminNav from "../../../components/AdminNav/AdminNav";
import { StoreContext } from "../../../context/StoreContext";
import { adminAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./RestaurantPartners.css";
import {
    FaHandshake,
    FaPlus,
    FaSyncAlt,
    FaSearch,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaStore,
    FaEye,
    FaExclamationTriangle,
    FaTimes
} from "react-icons/fa";

const TABS = [
    { key: "All", label: "All Requests" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "changes_requested", label: "Changes Requested" },
    { key: "rejected", label: "Rejected" }
];

const RestaurantPartners = () => {
    const navigate = useNavigate();
    const { showToast } = useContext(StoreContext);

    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({
        totalRequests: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        changesRequested: 0,
        activePartners: 0
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    // Create Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createForm, setCreateForm] = useState({
        ownerName: "",
        email: "",
        phone: "",
        restaurantName: "",
        cuisineTypes: "Indian, North Indian",
        street: "",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
        autoApprove: true
    });

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await adminAPI.getRestaurantPartners({
                status: activeTab === "All" ? undefined : activeTab,
                search: searchTerm.trim() || undefined
            });

            if (data.success) {
                setApplications(data.applications || []);
                if (data.stats) {
                    setStats(data.stats);
                }
            }
        } catch (err) {
            console.error("Failed to load restaurant partner applications:", err);
            showToast(err.message || "Failed to load partner applications", "error");
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchTerm, showToast]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!createForm.ownerName || !createForm.email || !createForm.phone || !createForm.restaurantName) {
            showToast("Please fill all required fields.", "error");
            return;
        }

        try {
            setCreateLoading(true);
            const payload = {
                ownerName: createForm.ownerName,
                email: createForm.email,
                phone: createForm.phone,
                restaurantName: createForm.restaurantName,
                cuisineTypes: createForm.cuisineTypes.split(",").map((c) => c.trim()).filter(Boolean),
                address: {
                    street: createForm.street,
                    city: createForm.city,
                    state: createForm.state,
                    pincode: createForm.pincode
                },
                autoApprove: createForm.autoApprove
            };

            const { data } = await adminAPI.createRestaurantPartner(payload);

            if (data.success) {
                showToast(data.message || "Partner application created successfully!", "success");
                setShowCreateModal(false);
                setCreateForm({
                    ownerName: "",
                    email: "",
                    phone: "",
                    restaurantName: "",
                    cuisineTypes: "Indian, North Indian",
                    street: "",
                    city: "Hyderabad",
                    state: "Telangana",
                    pincode: "500001",
                    autoApprove: true
                });

                // If invitation generated, navigate to view the details
                if (data.application?._id) {
                    navigate(`/admin/restaurant-partners/${data.application._id}`);
                } else {
                    fetchApplications();
                }
            }
        } catch (err) {
            showToast(err.message || "Failed to create partner application", "error");
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div className="admin-partners-page">
            <AdminNav />

            <main className="admin-partners-container">
                {/* Header Cluster */}
                <div className="admin-partners-header">
                    <div>
                        <h1>
                            <FaHandshake style={{ color: "#ff5200" }} /> Restaurant Partners
                        </h1>
                        <p>Review and manage restaurant owner partnership requests, invitations & approvals.</p>
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
                        <button
                            type="button"
                            className="btn-primary-create"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <FaPlus /> Create Restaurant Partner
                        </button>
                    </div>
                </div>

                {/* Top Statistics Cards with Real MongoDB Values */}
                <div className="admin-stats-strip">
                    <div className="stat-metric-card total">
                        <div className="stat-metric-icon">
                            <FaHandshake />
                        </div>
                        <div className="stat-metric-info">
                            <span>Total Requests</span>
                            <h2>{stats.totalRequests}</h2>
                        </div>
                    </div>

                    <div className="stat-metric-card pending">
                        <div className="stat-metric-icon">
                            <FaClock />
                        </div>
                        <div className="stat-metric-info">
                            <span>Pending</span>
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
                            <FaStore />
                        </div>
                        <div className="stat-metric-info">
                            <span>Active Partners</span>
                            <h2>{stats.activePartners}</h2>
                        </div>
                    </div>
                </div>

                {/* Control Toolbar */}
                <div className="admin-toolbar-card">
                    <div className="toolbar-tabs">
                        {TABS.map((tab) => {
                            let count = null;
                            if (tab.key === "All") count = stats.totalRequests;
                            else if (tab.key === "pending") count = stats.pending;
                            else if (tab.key === "approved") count = stats.approved;
                            else if (tab.key === "changes_requested") count = stats.changesRequested;
                            else if (tab.key === "rejected") count = stats.rejected;

                            return (
                                <button
                                    key={tab.key}
                                    type="button"
                                    className={`toolbar-tab ${activeTab === tab.key ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.label}
                                    {count !== null && <span className="tab-badge">{count}</span>}
                                </button>
                            );
                        })}
                    </div>

                    <div className="toolbar-search">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search by ID, restaurant, owner, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="admin-table-container">
                    {loading ? (
                        <div style={{ padding: "60px 0" }}>
                            <Loader />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="admin-empty-table">
                            <FaHandshake />
                            <h3>No partner applications found</h3>
                            <p>Try switching filter tabs or clearing the search query.</p>
                        </div>
                    ) : (
                        <table className="admin-partners-table">
                            <thead>
                                <tr>
                                    <th>Application ID</th>
                                    <th>Owner Name</th>
                                    <th>Email</th>
                                    <th>Restaurant</th>
                                    <th>City</th>
                                    <th>Cuisine</th>
                                    <th>Submitted Date</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app._id}>
                                        <td>
                                            <span className="app-code-tag">{app.applicationId}</span>
                                        </td>
                                        <td className="owner-cell">
                                            <strong>{app.ownerName}</strong>
                                            <span>{app.phone}</span>
                                        </td>
                                        <td>
                                            <a
                                                href={`mailto:${app.email}`}
                                                style={{ color: "#0284c7", textDecoration: "none" }}
                                            >
                                                {app.email}
                                            </a>
                                        </td>
                                        <td className="restaurant-cell">
                                            <strong>{app.restaurantName}</strong>
                                            <span>{app.restaurantType}</span>
                                        </td>
                                        <td>{app.address?.city || "Hyderabad"}</td>
                                        <td>
                                            {Array.isArray(app.cuisineTypes)
                                                ? app.cuisineTypes.slice(0, 2).join(", ")
                                                : "Indian"}
                                        </td>
                                        <td>
                                            {new Date(app.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </td>
                                        <td>
                                            <span className={`status-pill ${app.status}`}>
                                                {app.status === "pending" && "🟡 Pending"}
                                                {app.status === "approved" && "🟢 Approved"}
                                                {app.status === "rejected" && "🔴 Rejected"}
                                                {app.status === "changes_requested" && "🟠 Needs Changes"}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <Link
                                                to={`/admin/restaurant-partners/${app._id}`}
                                                className="btn-table-action"
                                            >
                                                <FaEye /> View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            {/* Offline Onboarding "+ Create Restaurant Partner" Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>+ Create Restaurant Partner</h2>
                            <button
                                type="button"
                                className="btn-modal-close"
                                onClick={() => setShowCreateModal(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit}>
                            <div className="form-grid-two">
                                <div className="form-field-group">
                                    <label>Owner Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Ravi Kumar"
                                        value={createForm.ownerName}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, ownerName: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-field-group">
                                    <label>Owner Email *</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="e.g. ravi@foodexpress.com"
                                        value={createForm.email}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, email: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="form-grid-two">
                                <div className="form-field-group">
                                    <label>Contact Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="e.g. 9876543210"
                                        value={createForm.phone}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, phone: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-field-group">
                                    <label>Restaurant Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Spice Kitchen"
                                        value={createForm.restaurantName}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, restaurantName: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="form-field-group">
                                <label>Cuisine Types (Comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Biryani, North Indian, Chinese"
                                    value={createForm.cuisineTypes}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, cuisineTypes: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-grid-two">
                                <div className="form-field-group">
                                    <label>Street Address</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Main Road, Gachibowli"
                                        value={createForm.street}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, street: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-field-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Hyderabad"
                                        value={createForm.city}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, city: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="form-grid-two">
                                <div className="form-field-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Telangana"
                                        value={createForm.state}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, state: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-field-group">
                                    <label>Pincode *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 500032"
                                        value={createForm.pincode}
                                        onChange={(e) =>
                                            setCreateForm({ ...createForm, pincode: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: "10px",
                                    padding: "12px",
                                    background: "#f8fafc",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}
                            >
                                <input
                                    type="checkbox"
                                    id="autoApproveCheck"
                                    checked={createForm.autoApprove}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, autoApprove: e.target.checked })
                                    }
                                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                                />
                                <label
                                    htmlFor="autoApproveCheck"
                                    style={{ fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
                                >
                                    Approve immediately and generate secure invitation link
                                </label>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-modal-secondary"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-modal-primary"
                                    disabled={createLoading}
                                >
                                    {createLoading ? "Creating..." : createForm.autoApprove ? "Create & Approve" : "Create as Pending"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantPartners;
