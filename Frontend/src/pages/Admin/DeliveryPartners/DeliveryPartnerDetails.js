import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AdminNav from "../../../components/AdminNav/AdminNav";
import { StoreContext } from "../../../context/StoreContext";
import { adminAPI, deliveryPartnerAPI, ui } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./DeliveryPartnerDetails.css";
import {
    FaMotorcycle,
    FaArrowLeft,
    FaCheck,
    FaTimes,
    FaExclamationCircle,
    FaCopy,
    FaSyncAlt,
    FaBan,
    FaUser,
    FaIdCard,
    FaMapMarkerAlt,
    FaEnvelope,
    FaPhoneAlt,
    FaCheckCircle,
    FaHistory
} from "react-icons/fa";

const DeliveryPartnerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useContext(StoreContext);

    const [application, setApplication] = useState(null);
    const [invitation, setInvitation] = useState(null);
    const [deliveryPartner, setDeliveryPartner] = useState(null);
    const [generatedLink, setGeneratedLink] = useState("");
    const [loading, setLoading] = useState(true);

    // Modals
    const [modalAction, setModalAction] = useState(null); // 'reject' | 'changes' | 'suspend'
    const [modalReason, setModalReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    // Verification checklist state
    const [checklist, setChecklist] = useState({
        identity: true,
        phone: true,
        email: true,
        vehicle: true,
        regNumber: true,
        license: true,
        aadhaar: true,
        city: true,
        background: true
    });

    const toggleCheckItem = (key) => {
        setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const fetchDetails = useCallback(async () => {
        try {
            setLoading(true);
            const apiService = adminAPI || deliveryPartnerAPI || ui;
            const fetchFn = (apiService.getAdminDeliveryPartnerById || apiService.getAdminDeliveryPartner || deliveryPartnerAPI.getAdminDeliveryPartnerById).bind(apiService);
            const { data } = await fetchFn(id);
            if (data.success) {
                setApplication(data.application || data.data);
                setInvitation(data.invitation);
                setDeliveryPartner(data.deliveryPartner);
            }
        } catch (err) {
            console.error("Failed to load delivery partner details:", err);
            showToast(err.message || "Failed to load application details", "error");
        } finally {
            setLoading(false);
        }
    }, [id, showToast]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleApprove = async () => {
        const riderDisplayName = application?.ownerName || application?.fullName || "Delivery Partner";
        if (!window.confirm(`Are you sure you want to approve rider "${riderDisplayName}"? A 72-hour secure invitation link will be generated.`)) {
            return;
        }

        try {
            setActionLoading(true);
            const apiService = adminAPI || deliveryPartnerAPI || ui;
            const approveFn = (apiService.approveAdminDeliveryPartner || apiService.adminApproveDeliveryPartner || deliveryPartnerAPI.adminApproveDeliveryPartner).bind(apiService);
            const { data } = await approveFn(id);
            if (data.success) {
                showToast(`Rider "${riderDisplayName}" has been approved! 🎉`, "success");
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
                const { data } = await deliveryPartnerAPI.adminRejectDeliveryPartner(id, modalReason.trim());
                showToast(data.message || "Application rejected.", "info");
            } else if (modalAction === "changes") {
                const { data } = await deliveryPartnerAPI.adminRequestChangesDeliveryPartner(id, modalReason.trim());
                showToast(data.message || "Changes requested from rider.", "info");
            } else if (modalAction === "suspend") {
                const { data } = await deliveryPartnerAPI.adminSuspendDeliveryPartner(id, modalReason.trim());
                showToast(data.message || "Delivery partner suspended.", "warning");
            }

            setModalAction(null);
            setModalReason("");
            fetchDetails();
        } catch (err) {
            showToast(err.message || `Action failed`, "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleResendInvitation = async () => {
        try {
            setActionLoading(true);
            const { data } = await deliveryPartnerAPI.adminResendDeliveryInvitation(id);
            showToast("New 72-hour invitation generated successfully!", "success");
            if (data.invitationLink) {
                setGeneratedLink(data.invitationLink);
            }
            fetchDetails();
        } catch (err) {
            showToast(err.message || "Failed to resend invitation", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevokeInvitation = async () => {
        if (!window.confirm("Are you sure you want to revoke this invitation? The link will be permanently invalidated.")) {
            return;
        }

        try {
            setActionLoading(true);
            await deliveryPartnerAPI.adminRevokeDeliveryInvitation(id);
            showToast("Invitation revoked.", "info");
            setGeneratedLink("");
            fetchDetails();
        } catch (err) {
            showToast(err.message || "Failed to revoke invitation", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReactivate = async () => {
        try {
            setActionLoading(true);
            await deliveryPartnerAPI.adminReactivateDeliveryPartner(id);
            showToast("Delivery partner reactivated to Approved state!", "success");
            fetchDetails();
        } catch (err) {
            showToast(err.message || "Failed to reactivate partner", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast("Invitation URL copied to clipboard! 📋", "success");
    };

    if (loading) {
        return (
            <div className="admin-delivery-page">
                <AdminNav />
                <div className="details-loader-wrap">
                    <Loader />
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="admin-delivery-page">
                <AdminNav />
                <div className="details-not-found">
                    <h2>Application Not Found</h2>
                    <p>The requested delivery partner record does not exist or has been removed.</p>
                    <Link to="/admin/delivery-partners" className="btn-back">
                        <FaArrowLeft /> Back to List
                    </Link>
                </div>
            </div>
        );
    }

    const statusClass = application.status || "pending";
    const isApproved = application.status === "approved";
    const isSuspended = application.status === "suspended";
    const isPending = application.status === "pending" || application.status === "under_review";
    const isChangesRequested = application.status === "changes_requested";

    const riderName = application.ownerName || application.fullName || "Delivery Partner";
    const riderCity = application.address?.city || application.city || "Hyderabad";
    const riderAddress = application.address?.street
        ? `${application.address.street}, ${application.address.city}, ${application.address.state || ""} ${application.address.pincode || ""}`
        : (typeof application.address === "string" ? application.address : "Hyderabad");

    // Build active invite link
    const displayInviteLink = generatedLink || (invitation?.rawUrl || "");

    return (
        <div className="admin-delivery-page">
            <AdminNav />

            <main className="admin-delivery-container">
                {/* Top Action Bar */}
                <div className="details-top-bar">
                    <Link to="/admin/delivery-partners" className="btn-back-link">
                        <FaArrowLeft /> Back to Delivery Partners
                    </Link>

                    <div className="top-action-buttons">
                        {isPending && (
                            <>
                                <button
                                    type="button"
                                    className="btn-action approve"
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                >
                                    <FaCheck /> Approve & Send Invite
                                </button>
                                <button
                                    type="button"
                                    className="btn-action changes"
                                    onClick={() => setModalAction("changes")}
                                    disabled={actionLoading}
                                >
                                    <FaExclamationCircle /> Request Changes
                                </button>
                                <button
                                    type="button"
                                    className="btn-action reject"
                                    onClick={() => setModalAction("reject")}
                                    disabled={actionLoading}
                                >
                                    <FaTimes /> Reject Application
                                </button>
                            </>
                        )}

                        {isChangesRequested && (
                            <>
                                <button
                                    type="button"
                                    className="btn-action approve"
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                >
                                    <FaCheck /> Approve Now
                                </button>
                                <button
                                    type="button"
                                    className="btn-action reject"
                                    onClick={() => setModalAction("reject")}
                                    disabled={actionLoading}
                                >
                                    <FaTimes /> Reject Application
                                </button>
                            </>
                        )}

                        {isApproved && (
                            <>
                                <button
                                    type="button"
                                    className="btn-action resend"
                                    onClick={handleResendInvitation}
                                    disabled={actionLoading}
                                >
                                    <FaSyncAlt /> Resend Invitation
                                </button>
                                {invitation && invitation.status === "pending" && (
                                    <button
                                        type="button"
                                        className="btn-action revoke"
                                        onClick={handleRevokeInvitation}
                                        disabled={actionLoading}
                                    >
                                        <FaBan /> Revoke Invite
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="btn-action suspend"
                                    onClick={() => setModalAction("suspend")}
                                    disabled={actionLoading}
                                >
                                    <FaBan /> Suspend Partner
                                </button>
                            </>
                        )}

                        {isSuspended && (
                            <button
                                type="button"
                                className="btn-action reactivate"
                                onClick={handleReactivate}
                                disabled={actionLoading}
                            >
                                <FaCheckCircle /> Reactivate Partner
                            </button>
                        )}
                    </div>
                </div>

                {/* Generated or Active Invitation Banner */}
                {(displayInviteLink || (invitation && invitation.status === "pending")) && (
                    <div className="invitation-banner-card">
                        <div className="invite-banner-header">
                            <div className="invite-badge">
                                <FaCheckCircle /> ACTIVE SINGLE-USE INVITATION (72 HOURS VALIDITY)
                            </div>
                            <span className="expires-tag">
                                Expires:{" "}
                                {invitation?.expiresAt
                                    ? new Date(invitation.expiresAt).toLocaleString("en-IN")
                                    : "72 Hours from generation"}
                            </span>
                        </div>
                        <p className="invite-instruction">
                            Share this cryptographically secure single-use invitation URL with the rider to activate their portal account:
                        </p>
                        <div className="invite-url-box">
                            <input
                                type="text"
                                readOnly
                                value={displayInviteLink || "Generated raw token link will appear upon approval/re-invitation"}
                            />
                            {displayInviteLink && (
                                <button
                                    type="button"
                                    className="btn-copy-url"
                                    onClick={() => copyToClipboard(displayInviteLink)}
                                >
                                    <FaCopy /> Copy Link
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Header Profile Summary */}
                <div className="partner-detail-header-card">
                    <div className="header-icon-box">
                        <FaMotorcycle />
                    </div>
                    <div className="header-info-box">
                        <div className="header-title-row">
                            <h2>{riderName}</h2>
                            <span className={`status-tag status-${statusClass}`}>
                                {statusClass.replace(/_/g, " ")}
                            </span>
                        </div>
                        <div className="header-sub-row">
                            <span>ID: <strong>{application.applicationId}</strong></span>
                            <span>Applied: <strong>{new Date(application.createdAt).toLocaleDateString("en-IN")}</strong></span>
                            <span>City: <strong>{riderCity}</strong></span>
                            <span>Vehicle: <strong>{application.vehicleType || "Bike"}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Two Columns: Applicant Details & Verification Checklist */}
                <div className="details-grid-columns">
                    {/* Left Column: Full Information */}
                    <div className="details-left-col">
                        {/* Personal & Contact */}
                        <div className="admin-info-card">
                            <div className="card-sec-head">
                                <FaUser />
                                <h3>Personal & Contact Profile</h3>
                            </div>
                            <div className="info-grid-2">
                                <div className="info-field">
                                    <span className="label">Full Legal Name</span>
                                    <span className="val bold">{riderName}</span>
                                </div>
                                <div className="info-field">
                                    <span className="label">Registered Email</span>
                                    <span className="val">{application.email}</span>
                                </div>
                                <div className="info-field">
                                    <span className="label">Primary Phone</span>
                                    <span className="val">{application.phone}</span>
                                </div>
                                <div className="info-field">
                                    <span className="label">Emergency Contact</span>
                                    <span className="val">{application.emergencyContact || "Not Provided"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle & License Specifications */}
                        <div className="admin-info-card">
                            <div className="card-sec-head">
                                <FaMotorcycle />
                                <h3>Vehicle & Road License Information</h3>
                            </div>
                            <div className="info-grid-2">
                                <div className="info-field">
                                    <span className="label">Vehicle Type</span>
                                    <span className="val">{application.vehicleType || "Bike"}</span>
                                </div>
                                <div className="info-field">
                                    <span className="label">Vehicle Model</span>
                                    <span className="val">{application.vehicleModel || "Standard 2-Wheeler"}</span>
                                </div>
                                <div className="info-field">
                                    <span className="label">Registration / Number Plate</span>
                                    <span className="val bold text-blue">{application.vehicleNumber}</span>
                                </div>
                                <div className="info-field">
                                    <span className="label">Driving License Number</span>
                                    <span className="val bold">{application.licenseNumber}</span>
                                </div>
                            </div>
                        </div>

                        {/* National Identity & Location */}
                        <div className="admin-info-card">
                            <div className="card-sec-head">
                                <FaIdCard />
                                <h3>Identity Document & Operational Hub</h3>
                            </div>
                            <div className="info-grid-2">
                                <div className="info-field">
                                    <span className="label">Aadhaar Number</span>
                                    <span className="val">{application.aadhaarNumber || "Verified at Desk"}</span>
                                </div>
                                <div className="info-field">
                                    <span className="label">Operational City / Hub</span>
                                    <span className="val bold">{riderCity}</span>
                                </div>
                                <div className="info-field full-width">
                                    <span className="label">Residential Address</span>
                                    <span className="val">{riderAddress}</span>
                                </div>
                            </div>
                        </div>

                        {/* Rejection / Changes Reason Notice */}
                        {(application.rejectionReason || application.changesRequestedReason) && (
                            <div className="admin-reason-card">
                                <h4>
                                    <FaExclamationCircle /> Notice to Applicant:
                                </h4>
                                <p>{application.rejectionReason || application.changesRequestedReason}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: 9-Point Verification Checklist */}
                    <div className="details-right-col">
                        <div className="admin-info-card checklist-card">
                            <div className="card-sec-head">
                                <FaCheckCircle />
                                <h3>9-Point Verification Checklist</h3>
                            </div>
                            <p className="checklist-sub">
                                Verify all regulatory criteria before approving delivery partner access:
                            </p>

                            <div className="checklist-items">
                                <label className="check-row">
                                    <input
                                        type="checkbox"
                                        checked={checklist.identity}
                                        onChange={() => toggleCheckItem("identity")}
                                    />
                                    <span className="check-text">1. Full Legal Name & Identity Proof Match</span>
                                </label>

                                <label className="check-row">
                                    <input
                                        type="checkbox"
                                        checked={checklist.phone}
                                        onChange={() => toggleCheckItem("phone")}
                                    />
                                    <span className="check-text">2. Active Phone Number & WhatsApp Reachable</span>
                                </label>

                                <label className="check-row">
                                    <input
                                        type="checkbox"
                                        checked={checklist.email}
                                        onChange={() => toggleCheckItem("email")}
                                    />
                                    <span className="check-text">3. Valid Email for Secure Password Setup</span>
                                </label>

                                <label className="check-row">
                                    <input
                                        type="checkbox"
                                        checked={checklist.vehicle}
                                        onChange={() => toggleCheckItem("vehicle")}
                                    />
                                    <span className="check-text">4. Vehicle Model & Delivery Fitness Verified</span>
                                </label>

                                <label className="check-row">
                                    <input
                                        type="checkbox"
                                        checked={checklist.regNumber}
                                        onChange={() => toggleCheckItem("regNumber")}
                                    />
                                    <span className="check-text">5. Vehicle Registration Number (RC Plate) Valid</span>
                                </label>

                                <label className="check-row">
                                    <input
                                        type="checkbox"
                                        checked={checklist.license}
                                        onChange={() => toggleCheckItem("license")}
                                    />
                                    <span className="check-text">6. Commercial / Valid Driving License Active</span>
                                </label>

                                <label className="check-row">
                                    <input
                                        type="checkbox"
                                        checked={checklist.aadhaar}
                                        onChange={() => toggleCheckItem("aadhaar")}
                                    />
                                    <span className="check-text">7. Aadhaar / Govt ID Verified</span>
                                </label>

                                <label className="check-row">
                                    <input
                                        type="checkbox"
                                        checked={checklist.city}
                                        onChange={() => toggleCheckItem("city")}
                                    />
                                    <span className="check-text">8. Operating City & Zone Coverage Confirmed</span>
                                </label>

                                <label className="check-row">
                                    <input
                                        type="checkbox"
                                        checked={checklist.background}
                                        onChange={() => toggleCheckItem("background")}
                                    />
                                    <span className="check-text">9. Clean Background & Safety Disclosures Clear</span>
                                </label>
                            </div>
                        </div>

                        {/* Linked Delivery Partner Entity (if activated) */}
                        {deliveryPartner && (
                            <div className="admin-info-card activated-partner-card">
                                <div className="card-sec-head">
                                    <FaMotorcycle />
                                    <h3>Activated Partner Profile</h3>
                                </div>
                                <div className="info-grid-2">
                                    <div className="info-field">
                                        <span className="label">Portal Status</span>
                                        <span className="val bold text-green">{deliveryPartner.status}</span>
                                    </div>
                                    <div className="info-field">
                                        <span className="label">Live Availability</span>
                                        <span className="val bold">{deliveryPartner.availabilityStatus}</span>
                                    </div>
                                    <div className="info-field">
                                        <span className="label">Completed Deliveries</span>
                                        <span className="val">{deliveryPartner.completedDeliveries || 0}</span>
                                    </div>
                                    <div className="info-field">
                                        <span className="label">Total Earnings</span>
                                        <span className="val">₹{deliveryPartner.totalEarnings || 0}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reason Action Modal */}
                {modalAction && (
                    <div className="admin-modal-overlay">
                        <div className="admin-modal-box">
                            <h3>
                                {modalAction === "reject"
                                    ? "Reject Delivery Partner Application"
                                    : modalAction === "changes"
                                    ? "Request Application Changes"
                                    : "Suspend Delivery Partner"}
                            </h3>
                            <p>
                                {modalAction === "reject"
                                    ? "Specify the reason for rejection. This will be visible on the rider's status tracker."
                                    : modalAction === "changes"
                                    ? "Explain what information or documents the rider needs to correct."
                                    : "Explain the rationale for temporarily suspending this active delivery partner."}
                            </p>

                            <form onSubmit={handleModalSubmit}>
                                <textarea
                                    value={modalReason}
                                    onChange={(e) => setModalReason(e.target.value)}
                                    placeholder="Enter detailed reason here..."
                                    rows={4}
                                    required
                                />

                                <div className="modal-actions-row">
                                    <button
                                        type="button"
                                        className="btn-modal-cancel"
                                        onClick={() => setModalAction(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`btn-modal-confirm ${modalAction}`}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? "Submitting..." : "Confirm Action"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DeliveryPartnerDetails;
