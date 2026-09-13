import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import AdminNav from "../../../components/AdminNav/AdminNav";
import { StoreContext } from "../../../context/StoreContext";
import { adminAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./RestaurantManagement.css";
import {
    FaStore,
    FaCheck,
    FaTimes,
    FaBan,
    FaEye,
    FaSearch,
    FaSyncAlt,
    FaStar,
    FaCheckCircle,
    FaExclamationCircle
} from "react-icons/fa";

const TABS = ["All", "Pending", "Approved", "Rejected", "Suspended", "Closed"];

const RestaurantManagement = () => {
    const { showToast } = useContext(StoreContext);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state for Rejection / Suspension
    const [modalConfig, setModalConfig] = useState(null); // { type: "reject"|"suspend", restaurantId, restaurantName }
    const [modalReason, setModalReason] = useState("");
    const [modalLoading, setModalLoading] = useState(false);

    const fetchRestaurants = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await adminAPI.getRestaurants({
                status: activeTab === "All" ? undefined : activeTab,
                search: searchTerm.trim() || undefined
            });
            setRestaurants(data.restaurants || []);
        } catch (err) {
            console.error("Failed to load restaurants:", err);
            showToast(err.message || "Failed to load restaurants list", "error");
        } finally {
            setLoading(false);
        }
    }, [activeTab, searchTerm, showToast]);

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    // Action handlers
    const handleApprove = async (id, name) => {
        if (!window.confirm(`Are you sure you want to approve "${name}"? It will become live on FoodExpress.`)) return;
        try {
            await adminAPI.approveRestaurant(id);
            showToast(`"${name}" has been approved! 🎉`, "success");
            fetchRestaurants();
        } catch (err) {
            showToast(err.message || "Approval failed", "error");
        }
    };

    const handleActivate = async (id, name) => {
        try {
            await adminAPI.activateRestaurant(id);
            showToast(`"${name}" has been reactivated!`, "success");
            fetchRestaurants();
        } catch (err) {
            showToast(err.message || "Activation failed", "error");
        }
    };

    const handleModalConfirm = async (e) => {
        e.preventDefault();
        if (!modalConfig) return;

        try {
            setModalLoading(true);
            if (modalConfig.type === "reject") {
                await adminAPI.rejectRestaurant(modalConfig.restaurantId, modalReason.trim() || "Application does not meet criteria.");
                showToast(`"${modalConfig.restaurantName}" has been rejected.`, "info");
            } else if (modalConfig.type === "suspend") {
                await adminAPI.suspendRestaurant(modalConfig.restaurantId, modalReason.trim() || "Suspended by admin.");
                showToast(`"${modalConfig.restaurantName}" has been suspended.`, "info");
            }

            setModalConfig(null);
            setModalReason("");
            fetchRestaurants();
        } catch (err) {
            showToast(err.message || "Action failed", "error");
        } finally {
            setModalLoading(false);
        }
    };

    // Quick Counters
    const totalCount = restaurants.length;
    const pendingCount = restaurants.filter((r) => r.status === "pending").length;
    const approvedCount = restaurants.filter((r) => r.status === "approved").length;
    const suspendedCount = restaurants.filter((r) => r.status === "suspended").length;

    return (
        <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
            <AdminNav />

            <div className="arm-container">
                {/* Header */}
                <div className="arm-header">
                    <div>
                        <h1 className="arm-title">
                            <FaStore color="#ff5200" /> Restaurant Partner Management
                        </h1>
                        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                            Review applications, approve new kitchens, manage suspensions, and verify operational compliance.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchRestaurants}
                        style={{
                            padding: "9px 18px",
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
                        <FaSyncAlt /> Refresh List
                    </button>
                </div>

                {/* Metric Cards */}
                <div className="arm-stats-row">
                    <div className="arm-stat-card" onClick={() => setActiveTab("All")}>
                        <span className="arm-stat-label">TOTAL RESTAURANTS</span>
                        <span className="arm-stat-value">{totalCount}</span>
                    </div>

                    <div className="arm-stat-card" onClick={() => setActiveTab("Pending")} style={{ borderLeft: "4px solid #eab308" }}>
                        <span className="arm-stat-label" style={{ color: "#ca8a04" }}>PENDING REVIEW</span>
                        <span className="arm-stat-value" style={{ color: "#ca8a04" }}>{pendingCount}</span>
                    </div>

                    <div className="arm-stat-card" onClick={() => setActiveTab("Approved")} style={{ borderLeft: "4px solid #10b981" }}>
                        <span className="arm-stat-label" style={{ color: "#166534" }}>APPROVED / LIVE</span>
                        <span className="arm-stat-value" style={{ color: "#166534" }}>{approvedCount}</span>
                    </div>

                    <div className="arm-stat-card" onClick={() => setActiveTab("Suspended")} style={{ borderLeft: "4px solid #ea580c" }}>
                        <span className="arm-stat-label" style={{ color: "#ea580c" }}>SUSPENDED</span>
                        <span className="arm-stat-value" style={{ color: "#ea580c" }}>{suspendedCount}</span>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="arm-controls">
                    <div className="arm-tabs">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                className={`arm-tab-btn ${activeTab === tab ? "active" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="arm-search-box">
                        <FaSearch className="arm-search-icon" />
                        <input
                            type="text"
                            className="arm-search-input"
                            placeholder="Search by restaurant or city..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <Loader />
                ) : restaurants.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "18px", border: "1px solid #f1f5f9" }}>
                        <FaStore size={40} color="#cbd5e1" style={{ marginBottom: "12px" }} />
                        <h3 style={{ margin: "0 0 6px", color: "#0f172a" }}>No Restaurants Found</h3>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                            No restaurant matches the selected "{activeTab}" filter.
                        </p>
                    </div>
                ) : (
                    <div className="arm-table-card">
                        <table className="arm-table">
                            <thead>
                                <tr>
                                    <th>Restaurant</th>
                                    <th>Owner</th>
                                    <th>Email / Phone</th>
                                    <th>City</th>
                                    <th>Cuisine</th>
                                    <th>Status</th>
                                    <th>Rating</th>
                                    <th>Created Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {restaurants.map((rest) => {
                                    const statusClass = (rest.status || "").toLowerCase();
                                    const createdDate = rest.createdAt
                                        ? new Date(rest.createdAt).toLocaleDateString()
                                        : "Recent";

                                    return (
                                        <tr key={rest._id}>
                                            <td>
                                                <strong style={{ fontSize: "14px", color: "#0f172a" }}>{rest.name}</strong>
                                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                                                    <code>#REST-{rest._id.slice(-6).toUpperCase()}</code>
                                                </div>
                                            </td>
                                            <td>
                                                <strong>{rest.ownerId?.fullName || "Partner Owner"}</strong>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: "13px", color: "#1e293b" }}>{rest.email}</div>
                                                <div style={{ fontSize: "12px", color: "#64748b" }}>{rest.phone}</div>
                                            </td>
                                            <td>
                                                <strong>{rest.address?.city || "Hyderabad"}</strong>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: "12px", color: "#475569" }}>
                                                    {rest.cuisineTypes?.slice(0, 2).join(", ") || "Indian"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`app-status-badge ${statusClass}`}>
                                                    {rest.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: "700", color: "#f59e0b" }}>
                                                    <FaStar size={12} /> {rest.rating || "5.0"}
                                                </span>
                                            </td>
                                            <td>{createdDate}</td>
                                            <td>
                                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                    <Link
                                                        to={`/admin/restaurants/${rest._id}`}
                                                        className="btn-arm-action view"
                                                        title="View Details"
                                                    >
                                                        <FaEye /> View
                                                    </Link>

                                                    {rest.status === "pending" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="btn-arm-action approve"
                                                                onClick={() => handleApprove(rest._id, rest.name)}
                                                                title="Approve Restaurant"
                                                            >
                                                                <FaCheck /> Approve
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn-arm-action reject"
                                                                onClick={() => {
                                                                    setModalConfig({
                                                                        type: "reject",
                                                                        restaurantId: rest._id,
                                                                        restaurantName: rest.name
                                                                    });
                                                                    setModalReason("");
                                                                }}
                                                                title="Reject Application"
                                                            >
                                                                <FaTimes /> Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    {rest.status === "approved" && (
                                                        <button
                                                            type="button"
                                                            className="btn-arm-action suspend"
                                                            onClick={() => {
                                                                setModalConfig({
                                                                    type: "suspend",
                                                                    restaurantId: rest._id,
                                                                    restaurantName: rest.name
                                                                });
                                                                setModalReason("");
                                                            }}
                                                            title="Suspend Restaurant"
                                                        >
                                                            <FaBan /> Suspend
                                                        </button>
                                                    )}

                                                    {(rest.status === "suspended" || rest.status === "rejected") && (
                                                        <button
                                                            type="button"
                                                            className="btn-arm-action activate"
                                                            onClick={() => handleActivate(rest._id, rest.name)}
                                                            title="Reactivate Restaurant"
                                                        >
                                                            <FaCheck /> Activate
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Rejection / Suspension Modal */}
            {modalConfig && (
                <div className="rm-modal-backdrop" onClick={() => setModalConfig(null)}>
                    <div className="rm-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="rm-modal-header">
                            <h2 className="rm-modal-title">
                                {modalConfig.type === "reject" ? "Reject Application" : "Suspend Restaurant"}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setModalConfig(null)}
                                style={{ background: "none", border: "none", fontSize: "18px", color: "#64748b", cursor: "pointer" }}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#475569" }}>
                            Please provide the operational reason for {modalConfig.type === "reject" ? "rejecting" : "suspending"}{" "}
                            <strong>{modalConfig.restaurantName}</strong>. This feedback will be displayed to the partner owner.
                        </p>

                        <form onSubmit={handleModalConfirm}>
                            <textarea
                                className="rest-textarea"
                                placeholder={
                                    modalConfig.type === "reject"
                                        ? "e.g. Incomplete restaurant address or menu license verification required."
                                        : "e.g. Policy violation or food safety compliance audit pending."
                                }
                                value={modalReason}
                                onChange={(e) => setModalReason(e.target.value)}
                                required
                            />

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
                                <button
                                    type="button"
                                    onClick={() => setModalConfig(null)}
                                    style={{
                                        padding: "10px 18px",
                                        borderRadius: "10px",
                                        border: "1.5px solid #cbd5e1",
                                        background: "#fff",
                                        cursor: "pointer",
                                        fontWeight: "600"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-add-food"
                                    style={{
                                        background: modalConfig.type === "reject" ? "#ef4444" : "#ea580c"
                                    }}
                                    disabled={modalLoading}
                                >
                                    {modalLoading
                                        ? "Submitting..."
                                        : modalConfig.type === "reject"
                                        ? "Confirm Rejection"
                                        : "Confirm Suspension"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantManagement;
