import React, { useEffect, useState, useContext, useCallback } from "react";
import { StoreContext } from "../../context/StoreContext";
import { adminAPI } from "../../services/api";
import AdminNav from "../../components/AdminNav/AdminNav";
import Loader from "../../components/Loader/Loader";
import "./UserManagement.css";
import {
    FaSearch,
    FaSyncAlt,
    FaBan,
    FaCheckCircle,
    FaTrash,
    FaShieldAlt,
    FaFire,
    FaUserCheck,
    FaLock,
    FaKey
} from "react-icons/fa";

const ROLES = ["customer", "restaurant", "delivery", "admin"];

const UserManagement = () => {
    const { user: currentUser, showToast } = useContext(StoreContext);

    const [activeTab, setActiveTab] = useState("users"); // "users" | "firebase"
    const [users, setUsers] = useState([]);
    const [firebaseUsers, setFirebaseUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await adminAPI.getUsers();
            setUsers(data.users || []);
        } catch (error) {
            console.error("Failed to load users:", error);
            showToast(error.message || "Failed to load users", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    const fetchFirebaseUsers = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await adminAPI.getFirebaseUsers();
            setFirebaseUsers(data.users || []);
        } catch (error) {
            console.error("Failed to load Firebase users:", error);
            showToast(error.message || "Failed to load Firebase users", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (activeTab === "users") {
            fetchUsers();
        } else {
            fetchFirebaseUsers();
        }
    }, [activeTab, fetchUsers, fetchFirebaseUsers]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminAPI.changeUserRole(userId, newRole);
            showToast(`Role updated to "${newRole}" and synced with Firebase claims!`, "success");
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
            );
            if (activeTab === "firebase") fetchFirebaseUsers();
        } catch (error) {
            showToast(error.message || "Failed to change role", "error");
        }
    };

    const handleToggleBlock = async (userToToggle) => {
        if (userToToggle._id === currentUser?._id) {
            showToast("You cannot block your own admin account!", "error");
            return;
        }

        try {
            const { data } = await adminAPI.toggleBlockUser(userToToggle._id);
            showToast(data.message || "User status updated and synced with Firebase Auth.", "success");
            setUsers((prev) =>
                prev.map((u) =>
                    u._id === userToToggle._id
                        ? { ...u, isBlocked: !u.isBlocked }
                        : u
                )
            );
            if (activeTab === "firebase") fetchFirebaseUsers();
        } catch (error) {
            showToast(error.message || "Failed to update block status", "error");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (userId === currentUser?._id) {
            showToast("You cannot delete your own admin account!", "error");
            return;
        }

        if (!window.confirm("Are you sure you want to delete this user from MongoDB and Firebase Auth? This cannot be undone.")) return;

        try {
            await adminAPI.deleteUser(userId);
            showToast("User account deleted from database and Firebase.", "info");
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            setFirebaseUsers((prev) => prev.filter((u) => u._id !== userId));
        } catch (error) {
            showToast(error.message || "Failed to delete user", "error");
        }
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.phone?.toLowerCase().includes(search.toLowerCase()) ||
            u.firebaseUid?.toLowerCase().includes(search.toLowerCase());

        const matchesRole =
            roleFilter === "All" ||
            u.role?.toLowerCase() === roleFilter.toLowerCase();

        return matchesSearch && matchesRole;
    });

    const filteredFirebaseUsers = firebaseUsers.filter((u) => {
        return (
            u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase()) ||
            u.firebaseUid?.toLowerCase().includes(search.toLowerCase()) ||
            u.role?.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <div className="admin-page-layout">
            <AdminNav />

            <div className="admin-page-container">
                <div className="admin-page-header">
                    <div>
                        <h1>User Accounts & Firebase Administration 👥</h1>
                        <p>Manage user roles, Firebase UID linkage, verification status, and account blocking.</p>
                    </div>

                    <button
                        className="btn-admin-refresh"
                        onClick={activeTab === "users" ? fetchUsers : fetchFirebaseUsers}
                    >
                        <FaSyncAlt /> Refresh {activeTab === "users" ? "Users" : "Firebase Auth"}
                    </button>
                </div>

                {/* TAB SELECTOR */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                    <button
                        type="button"
                        onClick={() => setActiveTab("users")}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "none",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: activeTab === "users" ? "#e23744" : "#f1f5f9",
                            color: activeTab === "users" ? "#fff" : "#475569"
                        }}
                    >
                        <FaUserCheck /> All Registered Users ({users.length})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("firebase")}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "none",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: activeTab === "firebase" ? "#ff9800" : "#f1f5f9",
                            color: activeTab === "firebase" ? "#fff" : "#475569"
                        }}
                    >
                        <FaFire /> Firebase Auth Management ({firebaseUsers.length || users.length})
                    </button>
                </div>

                {/* TOOLBAR */}
                <div className="admin-toolbar-card">
                    <div className="admin-search-input">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, or Firebase UID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {activeTab === "users" && (
                        <div className="admin-filter-select">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="All">All Roles ({users.length})</option>
                                {ROLES.map((r) => (
                                    <option key={r} value={r}>
                                        {r.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* TAB 1: USERS TABLE */}
                {activeTab === "users" && (
                    loading ? (
                        <Loader />
                    ) : (
                        <div className="admin-table-card">
                            <div className="table-card-header">
                                <h3>Active Directory ({filteredUsers.length})</h3>
                            </div>

                            {filteredUsers.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="admin-data-table">
                                        <thead>
                                            <tr>
                                                <th>User Name</th>
                                                <th>Email & Phone</th>
                                                <th>Firebase UID</th>
                                                <th>Role (Authoritative)</th>
                                                <th>Verification</th>
                                                <th>Status</th>
                                                <th>Registered</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((u) => {
                                                const isSelf = u._id === currentUser?._id;

                                                return (
                                                    <tr key={u._id}>
                                                        <td>
                                                            <div className="table-user-name">
                                                                <div className="table-user-avatar">
                                                                    {u.fullName ? u.fullName.charAt(0).toUpperCase() : "U"}
                                                                </div>
                                                                <div>
                                                                    <strong>{u.fullName || u.name}</strong>
                                                                    {isSelf && <small className="self-badge">You</small>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>{u.email}</div>
                                                            <small style={{ color: "#64748b" }}>{u.phone || "No phone"}</small>
                                                        </td>
                                                        <td>
                                                            <code style={{ fontSize: "11px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                                                                {u.firebaseUid ? u.firebaseUid.substring(0, 16) + "..." : "Local / Seed"}
                                                            </code>
                                                        </td>
                                                        <td>
                                                            <select
                                                                className="role-select"
                                                                value={u.role || "customer"}
                                                                disabled={isSelf}
                                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                            >
                                                                {ROLES.map((r) => (
                                                                    <option key={r} value={r}>
                                                                        {r}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <span className={`status-pill ${u.isVerified ? "active" : "pending"}`}>
                                                                {u.isVerified ? "Verified" : "Unverified"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-pill ${u.isBlocked ? "blocked" : "active"}`}>
                                                                {u.isBlocked ? "Blocked" : "Active"}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {u.createdAt
                                                                ? new Date(u.createdAt).toLocaleDateString()
                                                                : "Recently"}
                                                        </td>
                                                        <td>
                                                            <div className="table-actions-cell">
                                                                <button
                                                                    type="button"
                                                                    className={`btn-toggle-block ${u.isBlocked ? "unblock" : "block"}`}
                                                                    disabled={isSelf}
                                                                    onClick={() => handleToggleBlock(u)}
                                                                    title={u.isBlocked ? "Unblock User" : "Block User"}
                                                                >
                                                                    {u.isBlocked ? <FaCheckCircle /> : <FaBan />}
                                                                    {u.isBlocked ? " Unblock" : " Block"}
                                                                </button>

                                                                {!isSelf && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn-action-delete"
                                                                        onClick={() => handleDeleteUser(u._id)}
                                                                        title="Delete User"
                                                                    >
                                                                        <FaTrash />
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
                            ) : (
                                <div className="empty-table-placeholder">
                                    <p>No users match the search or role filter.</p>
                                </div>
                            )}
                        </div>
                    )
                )}

                {/* TAB 2: FIREBASE AUTH MANAGEMENT */}
                {activeTab === "firebase" && (
                    loading ? (
                        <Loader />
                    ) : (
                        <div className="admin-table-card">
                            <div className="table-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <h3>Firebase User Identity Records ({filteredFirebaseUsers.length})</h3>
                                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                                        Cross-referenced records between Firebase Authentication and MongoDB User collection.
                                    </p>
                                </div>
                                <span style={{ fontSize: "12px", background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "12px", fontWeight: "600" }}>
                                    <FaLock style={{ marginRight: "4px" }} /> Admin-Only Firebase Operations
                                </span>
                            </div>

                            {filteredFirebaseUsers.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="admin-data-table">
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Firebase UID</th>
                                                <th>Email Verified</th>
                                                <th>Firebase Claims (Role)</th>
                                                <th>Firebase Status</th>
                                                <th>MongoDB Sync</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredFirebaseUsers.map((fu) => (
                                                <tr key={fu._id || fu.firebaseUid}>
                                                    <td>
                                                        <strong>{fu.fullName}</strong>
                                                        <div style={{ fontSize: "12px", color: "#64748b" }}>{fu.email}</div>
                                                    </td>
                                                    <td>
                                                        <code style={{ fontSize: "11px", background: "#e2e8f0", padding: "3px 6px", borderRadius: "4px" }}>
                                                            {fu.firebaseUid || "None"}
                                                        </code>
                                                    </td>
                                                    <td>
                                                        <span className={`status-pill ${fu.isVerified ? "active" : "pending"}`}>
                                                            {fu.isVerified ? "Yes" : "No"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ background: "#ede9fe", color: "#6b21a8", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
                                                            <FaKey style={{ marginRight: "4px", fontSize: "10px" }} />
                                                            {fu.customClaims?.role || fu.role || "customer"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-pill ${fu.firebaseDisabled ? "blocked" : "active"}`}>
                                                            {fu.firebaseDisabled ? "Disabled" : "Enabled"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-pill ${fu.isSyncedWithFirebase ? "active" : "info"}`}>
                                                            {fu.isSyncedWithFirebase ? "Synchronized" : "Local Record"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="table-actions-cell">
                                                            <button
                                                                type="button"
                                                                className={`btn-toggle-block ${fu.isBlocked ? "unblock" : "block"}`}
                                                                onClick={() => handleToggleBlock(fu)}
                                                                title="Synchronize Block / Unblock"
                                                            >
                                                                {fu.isBlocked ? "Enable in Firebase" : "Disable in Firebase"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-table-placeholder">
                                    <p>No Firebase users found.</p>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default UserManagement;