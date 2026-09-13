import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AdminNav from "../../../components/AdminNav/AdminNav";
import { StoreContext } from "../../../context/StoreContext";
import { adminAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./RestaurantPartnerDetails.css";
import {
    FaHandshake,
    FaArrowLeft,
    FaCheck,
    FaTimes,
    FaExclamationCircle,
    FaCopy,
    FaSyncAlt,
    FaBan,
    FaStore,
    FaUser,
    FaBriefcase,
    FaMapMarkerAlt,
    FaFileAlt,
    FaEnvelope
} from "react-icons/fa";

const RestaurantPartnerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useContext(StoreContext);

    const [application, setApplication] = useState(null);
    const [invitation, setInvitation] = useState(null);
    const [generatedLink, setGeneratedLink] = useState("");
    const [loading, setLoading] = useState(true);

    // Modals
    const [modalAction, setModalAction] = useState(null); // 'reject' | 'changes'
    const [modalReason, setModalReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const fetchDetails = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await adminAPI.getRestaurantPartnerById(id);
            if (data.success) {
                setApplication(data.application);
                setInvitation(data.invitation);
            }
        } catch (err) {
            console.error("Failed to load partner application:", err);
            showToast(err.message || "Failed to load application details", "error");
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleApprove = async () => {
        if (!window.confirm(`Are you sure you want to approve "${application.restaurantName}"? A secure partner invitation link will be generated.`)) {
            return;
        }

        try {
            setActionLoading(true);
            const { data } = await adminAPI.approveRestaurantPartner(id);
            if (data.success) {
                showToast(`"${application.restaurantName}" has been approved! 🎉`, "success");
                if (data.invitationLink) {
                    setGeneratedLink(data.invitationLink);
                }
                fetchDetails();
            }
        } catch (err) {
            showToast(err.message || "Approval failed", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (!modalReason.trim()) {
            showToast("Please provide a reason.", "error");
            return;
        }

        try {
            setActionLoading(true);
            if (modalAction === "reject") {
                const { data } = await adminAPI.rejectRestaurantPartner(id, modalReason.trim());
                showToast(data.message || "Application rejected.", "info");
            } else if (modalAction === "changes") {
                const { data } = await adminAPI.requestChangesRestaurantPartner(id, modalReason.trim());
                showToast(data.message || "Requested changes from partner.", "info");
            }

            setModalAction(null);
            setModalReason("");
            fetchDetails();
        } catch (err) {
            showToast(err.message || "Action failed", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleResendInvitation = async () => {
        try {
            setActionLoading(true);
            const { data } = await adminAPI.resendPartnerInvitation(id);
            if (data.success) {
                showToast("New partner invitation link generated!", "success");
                if (data.invitationLink) {
                    setGeneratedLink(data.invitationLink);
                }
                fetchDetails();
            }
        } catch (err) {
            showToast(err.message || "Failed to resend invitation", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevokeInvitation = async () => {
        if (!window.confirm("Are you sure you want to revoke the pending invitation?")) return;
        try {
            setActionLoading(true);
            await adminAPI.revokePartnerInvitation(id);
            showToast("Invitation revoked.", "info");
            setGeneratedLink("");
            fetchDetails();
        } catch (err) {
            showToast(err.message || "Failed to revoke invitation", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        showToast("Partner invitation link copied to clipboard! 📋", "success");
    };

    if (loading) {
        return (
            <div className="admin-partner-details-page">
                <AdminNav />
                <div style={{ padding: "80px 0" }}>
                    <Loader />
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="admin-partner-details-page">
                <AdminNav />
                <div className="admin-partner-details-container" style={{ textAlign: "center", padding: "60px 0" }}>
                    <h2>Partner Application Not Found</h2>
                    <Link to="/admin/restaurant-partners" className="details-breadcrumb">
                        <FaArrowLeft /> Back to Restaurant Partners
                    </Link>
                </div>
            </div>
        );
    }

    const status = application.status;
    const invUrl = generatedLink || (invitation && invitation.status === "pending" ? `${window.location.origin}/restaurant/activate/[TOKEN_PROTECTED]` : "");

    return (
        <div className="admin-partner-details-page">
            <AdminNav />

            <main className="admin-partner-details-container">
                <Link to="/admin/restaurant-partners" className="details-breadcrumb">
                    <FaArrowLeft /> Back to Restaurant Partners
                </Link>

                {/* Status Notice if Rejected or Changes Requested */}
                {status === "rejected" && (
                    <div className="details-alert-box rejected">
                        <FaTimes style={{ color: "#dc2626" }} />
                        <div>
                            <strong>Application Rejected</strong>
                            <p style={{ margin: "2px 0 0" }}>
                                Reason: {application.rejectionReason || "Criteria not met."}
                            </p>
                        </div>
                    </div>
                )}

                {status === "changes_requested" && (
                    <div className="details-alert-box changes">
                        <FaExclamationCircle style={{ color: "#c2410c" }} />
                        <div>
                            <strong>Changes Requested from Applicant</strong>
                            <p style={{ margin: "2px 0 0" }}>
                                Note: {application.changesRequestedReason || "Additional documentation required."}
                            </p>
                        </div>
                    </div>
                )}

                {/* Header Banner */}
                <div className="details-header-card">
                    <div className="details-header-left">
                        <div className="details-icon-box">
                            <FaStore />
                        </div>
                        <div className="details-titles">
                            <h1>{application.restaurantName}</h1>
                            <div className="details-meta-row">
                                <span>
                                    Application: <strong>{application.applicationId}</strong>
                                </span>
                                <span>•</span>
                                <span>
                                    Owner: <strong>{application.ownerName}</strong>
                                </span>
                                <span>•</span>
                                <span>
                                    Status:{" "}
                                    <span className={`status-pill ${status}`}>
                                        {status === "pending" && "🟡 Pending"}
                                        {status === "approved" && "🟢 Approved"}
                                        {status === "rejected" && "🔴 Rejected"}
                                        {status === "changes_requested" && "🟠 Changes Requested"}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="details-header-right">
                        {status === "pending" && (
                            <>
                                <button
                                    type="button"
                                    className="btn-action-approve"
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                >
                                    <FaCheck /> Approve Partner
                                </button>
                                <button
                                    type="button"
                                    className="btn-action-changes"
                                    onClick={() => {
                                        setModalAction("changes");
                                        setModalReason("");
                                    }}
                                >
                                    Request Changes
                                </button>
                                <button
                                    type="button"
                                    className="btn-action-reject"
                                    onClick={() => {
                                        setModalAction("reject");
                                        setModalReason("");
                                    }}
                                >
                                    <FaTimes /> Reject
                                </button>
                            </>
                        )}

                        {status === "changes_requested" && (
                            <>
                                <button
                                    type="button"
                                    className="btn-action-approve"
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                >
                                    <FaCheck /> Approve Now
                                </button>
                                <button
                                    type="button"
                                    className="btn-action-reject"
                                    onClick={() => {
                                        setModalAction("reject");
                                        setModalReason("");
                                    }}
                                >
                                    <FaTimes /> Reject
                                </button>
                            </>
                        )}

                        {status === "approved" && (
                            <button
                                type="button"
                                className="btn-action-approve"
                                onClick={handleResendInvitation}
                                disabled={actionLoading}
                            >
                                <FaSyncAlt /> Resend Invitation
                            </button>
                        )}
                    </div>
                </div>

                {/* Partner Invitation Card (When Approved) */}
                {status === "approved" && (
                    <div
                        className={`invitation-highlight-card ${
                            invitation?.status === "revoked" ? "revoked" : ""
                        }`}
                    >
                        <div className="invitation-header-row">
                            <h3>
                                <FaHandshake /> Restaurant Partner Invitation
                            </h3>
                            <span className={`status-pill ${invitation?.status || "pending"}`}>
                                {invitation?.status === "used"
                                    ? "🟢 Account Activated"
                                    : invitation?.status === "revoked"
                                    ? "🔴 Revoked"
                                    : invitation?.isExpired
                                    ? "🟠 Expired"
                                    : "🟡 Invitation Pending"}
                            </span>
                        </div>

                        <p style={{ fontSize: "13.5px", color: "#1e293b", margin: "0 0 10px" }}>
                            Send this single-use activation link to <strong>{application.email}</strong>. The owner will set up their credentials via Firebase Authentication and gain access to the Restaurant Partner Portal.
                        </p>

                        {invUrl ? (
                            <div className="invitation-link-cluster">
                                <input
                                    type="text"
                                    readOnly
                                    value={invUrl}
                                    onClick={(e) => e.target.select()}
                                />
                                <button
                                    type="button"
                                    className="btn-copy-link"
                                    onClick={() => copyToClipboard(invUrl)}
                                >
                                    <FaCopy /> Copy Link
                                </button>
                            </div>
                        ) : (
                            <div style={{ marginTop: "10px" }}>
                                <button
                                    type="button"
                                    className="btn-copy-link"
                                    onClick={handleResendInvitation}
                                >
                                    <FaSyncAlt /> Generate New Invitation Link
                                </button>
                            </div>
                        )}

                        <div className="invitation-actions-bar">
                            {invitation?.expiresAt && (
                                <span>
                                    Expires:{" "}
                                    <strong>
                                        {new Date(invitation.expiresAt).toLocaleString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </strong>
                                </span>
                            )}
                            <span>•</span>
                            <button
                                type="button"
                                className="btn-inv-resend"
                                onClick={handleResendInvitation}
                            >
                                Resend Invitation
                            </button>
                            {invitation?.status === "pending" && (
                                <>
                                    <span>•</span>
                                    <button
                                        type="button"
                                        className="btn-inv-revoke"
                                        onClick={handleRevokeInvitation}
                                    >
                                        Revoke Link
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Details Breakdown Grid */}
                <div className="details-grid">
                    {/* Left Column: Owner & Restaurant Data */}
                    <div>
                        {/* 1. Owner Information */}
                        <div className="details-card">
                            <h2>
                                <FaUser style={{ color: "#ff5200" }} /> Owner Information
                            </h2>
                            <div className="data-row">
                                <span className="data-label">Full Name</span>
                                <span className="data-value">{application.ownerName}</span>
                            </div>
                            <div className="data-row">
                                <span className="data-label">Email Address</span>
                                <span className="data-value">
                                    <a
                                        href={`mailto:${application.email}`}
                                        style={{ color: "#0284c7", textDecoration: "none" }}
                                    >
                                        {application.email}
                                    </a>
                                </span>
                            </div>
                            <div className="data-row">
                                <span className="data-label">Contact Number</span>
                                <span className="data-value">{application.phone}</span>
                            </div>
                        </div>

                        {/* 2. Restaurant Profile */}
                        <div className="details-card">
                            <h2>
                                <FaStore style={{ color: "#ff5200" }} /> Restaurant Details
                            </h2>
                            <div className="data-row">
                                <span className="data-label">Restaurant Name</span>
                                <span className="data-value">{application.restaurantName}</span>
                            </div>
                            <div className="data-row">
                                <span className="data-label">Description</span>
                                <span className="data-value">
                                    {application.description || "No description provided."}
                                </span>
                            </div>
                            <div className="data-row">
                                <span className="data-label">Cuisines</span>
                                <span className="data-value">
                                    {Array.isArray(application.cuisineTypes)
                                        ? application.cuisineTypes.join(", ")
                                        : "Indian"}
                                </span>
                            </div>
                            <div className="data-row">
                                <span className="data-label">Restaurant Type</span>
                                <span className="data-value">{application.restaurantType}</span>
                            </div>
                        </div>

                        {/* 3. Business Details */}
                        <div className="details-card">
                            <h2>
                                <FaBriefcase style={{ color: "#ff5200" }} /> Business & Operations
                            </h2>
                            <div className="data-row">
                                <span className="data-label">Business Email</span>
                                <span className="data-value">
                                    {application.businessEmail || application.email}
                                </span>
                            </div>
                            <div className="data-row">
                                <span className="data-label">Operating Hours</span>
                                <span className="data-value">
                                    {application.openingTime} — {application.closingTime}
                                </span>
                            </div>
                            <div className="data-row">
                                <span className="data-label">Minimum Order</span>
                                <span className="data-value">₹{application.minimumOrderAmount}</span>
                            </div>
                            <div className="data-row">
                                <span className="data-label">Delivery Fee</span>
                                <span className="data-value">₹{application.deliveryFee}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Location & Documents */}
                    <div>
                        {/* Location */}
                        <div className="details-card">
                            <h2>
                                <FaMapMarkerAlt style={{ color: "#ff5200" }} /> Location & Address
                            </h2>
                            <div className="data-row">
                                <span className="data-label">Street</span>
                                <span className="data-value">
                                    {application.address?.street || "Not specified"}
                                </span>
                            </div>
                            <div className="data-row">
                                <span className="data-label">City</span>
                                <span className="data-value">
                                    {application.address?.city || "Hyderabad"}
                                </span>
                            </div>
                            <div className="data-row">
                                <span className="data-label">State</span>
                                <span className="data-value">
                                    {application.address?.state || "Telangana"}
                                </span>
                            </div>
                            <div className="data-row">
                                <span className="data-label">Pincode</span>
                                <span className="data-value">
                                    {application.address?.pincode || "500001"}
                                </span>
                            </div>
                        </div>

                        {/* Business Documents */}
                        <div className="details-card">
                            <h2>
                                <FaFileAlt style={{ color: "#ff5200" }} /> Compliance Documents
                            </h2>
                            <div className="data-row">
                                <span className="data-label">FSSAI Number</span>
                                <span className="data-value">
                                    {application.fssaiNumber || "Not provided"}
                                </span>
                            </div>
                            <div className="data-row">
                                <span className="data-label">GST Number</span>
                                <span className="data-value">
                                    {application.gstNumber || "Not provided"}
                                </span>
                            </div>
                            <div className="data-row">
                                <span className="data-label">Business Reg.</span>
                                <span className="data-value">
                                    {application.businessRegistrationNumber || "Not provided"}
                                </span>
                            </div>
                        </div>

                        {/* Reviewer Meta */}
                        <div className="details-card">
                            <h2 style={{ fontSize: "14px" }}>Audit Trail</h2>
                            <div className="data-row">
                                <span className="data-label">Submitted On</span>
                                <span className="data-value">
                                    {new Date(application.createdAt).toLocaleString()}
                                </span>
                            </div>
                            {application.reviewedAt && (
                                <div className="data-row">
                                    <span className="data-label">Reviewed On</span>
                                    <span className="data-value">
                                        {new Date(application.reviewedAt).toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Rejection / Request Changes Modal */}
            {modalAction && (
                <div className="modal-overlay" onClick={() => setModalAction(null)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {modalAction === "reject" ? "Reject Application" : "Request Changes"}
                            </h2>
                            <button
                                type="button"
                                className="btn-modal-close"
                                onClick={() => setModalAction(null)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleModalSubmit}>
                            <div className="form-field-group">
                                <label>
                                    {modalAction === "reject" ? "Reason for Rejection *" : "Details of Required Changes *"}
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder={
                                        modalAction === "reject"
                                            ? "Specify why this application was rejected (e.g. invalid FSSAI, location out of service area)..."
                                            : "Specify what information or documents the applicant must revise..."
                                    }
                                    value={modalReason}
                                    onChange={(e) => setModalReason(e.target.value)}
                                />
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn-modal-secondary"
                                    onClick={() => setModalAction(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-modal-primary"
                                    style={{
                                        background: modalAction === "reject" ? "#dc2626" : "#ff5200"
                                    }}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? "Saving..." : modalAction === "reject" ? "Confirm Rejection" : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestaurantPartnerDetails;
