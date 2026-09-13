import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { deliveryPartnerAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./DeliveryApplicationStatus.css";
import {
    FaMotorcycle,
    FaSyncAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaArrowRight,
    FaSearch,
    FaClock,
    FaUser,
    FaKey,
    FaEdit
} from "react-icons/fa";

const DeliveryApplicationStatus = () => {
    const location = useLocation();
    const { token, user, showToast } = useContext(StoreContext);

    const [searchQuery, setSearchQuery] = useState("");
    const [application, setApplication] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const fetchStatus = useCallback(
        async (explicitQuery) => {
            try {
                setLoading(true);
                setNotFound(false);

                const queryParams = new URLSearchParams(location.search);
                const queryId = explicitQuery || queryParams.get("id") || queryParams.get("applicationId");
                const queryEmail = queryParams.get("email");
                const savedId = localStorage.getItem("foodexpress_delivery_app_id");

                const targetQuery = queryId || (queryEmail ? null : savedId);

                if (targetQuery || queryEmail || token) {
                    try {
                        const params = {};
                        if (targetQuery) {
                            if (targetQuery.includes("@")) {
                                params.email = targetQuery.trim();
                            } else {
                                params.applicationId = targetQuery.trim().toUpperCase();
                            }
                        } else if (queryEmail) {
                            params.email = queryEmail.trim();
                        }

                        const { data } = await deliveryPartnerAPI.getApplicationStatus(params);

                        if (data.success && data.application) {
                            setApplication(data.application);
                            setTimeline(data.timeline || []);
                            return;
                        }
                    } catch (apiErr) {
                        console.warn("deliveryPartnerAPI getStatus error:", apiErr.message);
                    }
                }

                setNotFound(true);
            } catch (err) {
                console.error("Failed to load application status:", err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        },
        [location.search, token]
    );

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const queryId = queryParams.get("id") || queryParams.get("applicationId") || queryParams.get("email");
        if (queryId) {
            setSearchQuery(queryId);
        } else {
            const saved = localStorage.getItem("foodexpress_delivery_app_id");
            if (saved) setSearchQuery(saved);
        }
        fetchStatus();
    }, [fetchStatus, location.search]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            showToast("Please enter an Application ID or email address.", "info");
            return;
        }
        fetchStatus(searchQuery.trim());
    };

    const status = application?.status || "pending";
    const appId = application?.applicationId || "DP-PENDING";
    const submittedDate = application?.createdAt
        ? new Date(application.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
          })
        : "Recent";

    // 5-Step timeline definition matching prompt Phase 6
    const defaultTimeline = [
        {
            key: "submitted",
            title: "1. Application Submitted",
            status: "completed",
            note: `Submitted on ${submittedDate}`
        },
        {
            key: "documents",
            title: "2. Documents Received",
            status: "completed",
            note: `Vehicle & license details verified`
        },
        {
            key: "verification",
            title: "3. Admin Verification",
            status:
                status === "pending" || status === "under_review"
                    ? "current"
                    : status === "changes_requested"
                    ? "warning"
                    : "completed",
            note:
                status === "pending" || status === "under_review"
                    ? "Under review by onboarding operations"
                    : status === "changes_requested"
                    ? "Changes requested by Admin"
                    : "Verified by Admin"
        },
        {
            key: "approved",
            title: status === "rejected" ? "Application Rejected" : "4. Approved",
            status: status === "approved" ? "completed" : status === "rejected" ? "failed" : "pending",
            note: status === "approved" ? "Approved by FoodExpress Admin" : status === "rejected" ? "Application rejected" : "Pending approval"
        },
        {
            key: "activation",
            title: "5. Account Activation",
            status:
                application?.isAccountActivated
                    ? "completed"
                    : application?.hasActiveInvitation
                    ? "current"
                    : status === "approved"
                    ? "current"
                    : "pending",
            note: application?.isAccountActivated
                ? "Account activated and ready"
                : application?.hasActiveInvitation
                ? "Invitation link sent to email"
                : "Awaiting activation link"
        }
    ];

    const displayTimeline = timeline && timeline.length > 0 ? timeline : defaultTimeline;

    return (
        <div className="dp-status-page">
            {/* Top Navigation */}
            <header className="dp-status-top">
                <div className="dp-status-top-inner">
                    <Link to="/" className="dp-status-brand">
                        <span className="brand-icon">🍔</span>
                        <span className="brand-text">FoodExpress</span>
                        <span className="dp-tag">DELIVERY PARTNER</span>
                    </Link>

                    <div className="dp-header-links">
                        <Link to="/delivery/partner-application" className="link-action">
                            + New Application
                        </Link>
                        <Link to="/delivery/login" className="btn-login-link">
                            Rider Login
                        </Link>
                    </div>
                </div>
            </header>

            <main className="dp-status-main">
                {/* Search Bar Widget */}
                <div className="dp-search-card">
                    <form className="dp-search-form" onSubmit={handleSearchSubmit}>
                        <div className="search-input-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Enter Application ID (e.g. DP-4821) or Registered Email"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-search-status" disabled={loading}>
                            {loading ? "Checking..." : "Track Status"}
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="status-loader-wrap">
                        <Loader />
                        <p style={{ marginTop: "14px", color: "#64748b" }}>Loading application status...</p>
                    </div>
                ) : notFound || !application ? (
                    <div className="status-empty-card">
                        <div className="empty-icon-wrap">
                            <FaMotorcycle />
                        </div>
                        <h2>No Application Found</h2>
                        <p>
                            We could not locate an active delivery partner request matching your search.
                            Please check your Application ID (e.g. <code>DP-4821</code>) or email address.
                        </p>
                        <div className="empty-actions">
                            <Link to="/delivery/partner-application" className="btn-empty-apply">
                                Submit Delivery Application <FaArrowRight />
                            </Link>
                            <Link to="/delivery/login" className="btn-empty-login">
                                Go to Rider Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="dp-status-card">
                        {/* Header */}
                        <div className="dp-status-header">
                            <div>
                                <div className="dp-sub-heading">FoodExpress Delivery Partner Application</div>
                                <div className="dp-badge-id">
                                    Application ID: <code>{appId}</code>
                                </div>
                                <h1 className="dp-applicant-name">{application.ownerName}</h1>
                                <div className="dp-meta-sub">
                                    <FaMotorcycle /> Vehicle: <strong>{application.vehicleType}</strong>
                                    {application.vehicleNumber && <span> ({application.vehicleNumber})</span>}
                                    {application.address?.city && <span> • {application.address.city}</span>}
                                    {application.email && <span> • {application.email}</span>}
                                </div>
                            </div>

                            <div className={`dp-status-badge ${status}`}>
                                {status === "pending" && "🟡 PENDING"}
                                {status === "under_review" && "🟡 UNDER REVIEW"}
                                {status === "changes_requested" && "🟠 CHANGES REQUESTED"}
                                {status === "approved" && "🟢 APPROVED"}
                                {status === "rejected" && "🔴 REJECTED"}
                                {status === "cancelled" && "⚪ CANCELLED"}
                            </div>
                        </div>

                        {/* Status Notice Alerts */}
                        {(status === "pending" || status === "under_review") && (
                            <div className="dp-notice-box pending">
                                <div className="notice-title">
                                    <FaClock /> Application Under Verification
                                </div>
                                <p>
                                    Your delivery partner application has been received and is undergoing internal
                                    admin verification. Once approved, you will receive a secure 72-hour invitation link
                                    to activate your delivery account.
                                </p>
                            </div>
                        )}

                        {status === "approved" && (
                            <div className="dp-notice-box approved">
                                <div className="notice-title">
                                    <FaCheckCircle /> Congratulations! Application Approved 🎉
                                </div>
                                <p>
                                    Your delivery partner application has been approved. If you have not yet activated
                                    your rider account, please click below or check the invitation link sent to your email.
                                </p>
                            </div>
                        )}

                        {status === "changes_requested" && (
                            <div className="dp-notice-box changes">
                                <div className="notice-title">
                                    <FaExclamationTriangle /> Additional Information Required
                                </div>
                                <div className="admin-reason-text">
                                    <strong>Admin Feedback:</strong>{" "}
                                    {application.changesRequestedReason ||
                                        "Please upload a clearer copy of your driving license or vehicle RC."}
                                </div>
                                <div style={{ marginTop: "12px" }}>
                                    <Link to="/delivery/partner-application" className="btn-update-app">
                                        <FaEdit /> Update Application
                                    </Link>
                                </div>
                            </div>
                        )}

                        {status === "rejected" && (
                            <div className="dp-notice-box rejected">
                                <div className="notice-title">
                                    <FaExclamationTriangle /> Application Rejected
                                </div>
                                <div className="admin-reason-text">
                                    <strong>Reason:</strong>{" "}
                                    {application.rejectionReason ||
                                        "Application did not meet our onboarding criteria."}
                                </div>
                            </div>
                        )}

                        {/* 5-Step Timeline */}
                        <h3 className="timeline-title">Application Timeline</h3>

                        <div className="dp-timeline">
                            {displayTimeline.map((step, idx) => {
                                const stepStatus = step.status;
                                return (
                                    <div key={idx} className={`dp-timeline-item ${stepStatus}`}>
                                        <div className="dp-timeline-dot">
                                            {stepStatus === "completed" && "✓"}
                                            {stepStatus === "current" && "●"}
                                            {stepStatus === "warning" && "!"}
                                            {stepStatus === "failed" && "✕"}
                                            {stepStatus === "pending" && "○"}
                                        </div>
                                        <div className="timeline-content">
                                            <div className="dp-timeline-title">{step.title}</div>
                                            {step.note && <div className="timeline-note">{step.note}</div>}
                                            {step.reason && (
                                                <div className="timeline-reason">{step.reason}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer Actions */}
                        <div className="dp-actions-footer">
                            <button
                                type="button"
                                onClick={() => fetchStatus(appId)}
                                className="btn-refresh-status"
                            >
                                <FaSyncAlt /> Refresh Status
                            </button>

                            <div className="footer-right-actions">
                                {status === "approved" && (
                                    <Link to="/delivery/login" className="btn-action-primary">
                                        <FaKey /> Go to Rider Login <FaArrowRight />
                                    </Link>
                                )}

                                {status === "rejected" && (
                                    <Link to="/delivery/partner-application" className="btn-action-primary">
                                        Submit New Application <FaArrowRight />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DeliveryApplicationStatus;
