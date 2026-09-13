import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantPartnerAPI, restaurantAPI } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import "./ApplicationStatus.css";
import {
    FaStore,
    FaSyncAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaBan,
    FaArrowRight,
    FaSearch,
    FaClock,
    FaUser,
    FaEnvelope,
    FaKey,
    FaMapMarkerAlt
} from "react-icons/fa";

const ApplicationStatus = () => {
    const navigate = useNavigate();
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
                const savedId = localStorage.getItem("foodexpress_partner_app_id");

                const targetQuery = queryId || (queryEmail ? null : savedId);

                // 1. Try fetching via restaurantPartnerAPI
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

                        const { data } = await restaurantPartnerAPI.getApplicationStatus(params);

                        if (data.success && data.application) {
                            setApplication(data.application);
                            setTimeline(data.timeline || []);
                            return;
                        }
                    } catch (apiErr) {
                        console.warn("restaurantPartnerAPI query error:", apiErr.message);
                    }
                }

                // 2. Fallback: If logged in, check restaurantAPI.getMyRestaurant()
                if (token) {
                    try {
                        const { data } = await restaurantAPI.getMyRestaurant();
                        if (data.hasRestaurant && data.restaurant) {
                            const r = data.restaurant;
                            setApplication({
                                applicationId: `RP-${r._id ? r._id.slice(-6).toUpperCase() : "1001"}`,
                                restaurantName: r.name,
                                ownerName: user?.fullName || "Restaurant Partner",
                                email: r.email || user?.email,
                                status: r.status || "pending",
                                createdAt: r.createdAt,
                                address: r.address,
                                rejectionReason: r.rejectionReason,
                                changesRequestedReason: r.changesRequestedReason
                            });
                            return;
                        }
                    } catch (mErr) {
                        console.warn("getMyRestaurant fallback error:", mErr.message);
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
        [location.search, token, user]
    );

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const queryId = queryParams.get("id") || queryParams.get("applicationId") || queryParams.get("email");
        if (queryId) {
            setSearchQuery(queryId);
        } else {
            const saved = localStorage.getItem("foodexpress_partner_app_id");
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
    const appId = application?.applicationId || "RP-PENDING";
    const submittedDate = application?.createdAt
        ? new Date(application.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
          })
        : "Recent";

    // 5-Step timeline definition from user prompt
    const defaultTimeline = [
        {
            key: "submitted",
            title: "Application Submitted",
            status: "completed",
            note: `Submitted on ${submittedDate}`
        },
        {
            key: "review",
            title: "Admin Verification",
            status:
                status === "pending"
                    ? "current"
                    : status === "changes_requested"
                    ? "warning"
                    : "completed",
            note:
                status === "pending"
                    ? "Under review by operations team"
                    : status === "changes_requested"
                    ? "Changes requested by Admin"
                    : "Verified"
        },
        {
            key: "approved",
            title: status === "rejected" ? "Application Rejected" : "Approved",
            status: status === "approved" ? "completed" : status === "rejected" ? "failed" : "pending",
            note: status === "approved" ? "Approved by FoodExpress Admin" : status === "rejected" ? "Application rejected" : "Pending approval"
        },
        {
            key: "invitation",
            title: "Partner Invitation",
            status:
                application?.isAccountActivated
                    ? "completed"
                    : application?.hasActiveInvitation
                    ? "current"
                    : status === "approved"
                    ? "current"
                    : "pending",
            note: application?.isAccountActivated
                ? "Invitation accepted"
                : application?.hasActiveInvitation
                ? "Invitation issued"
                : "Awaiting approval"
        },
        {
            key: "activated",
            title: "Account Activated",
            status: application?.isAccountActivated ? "completed" : "pending",
            note: application?.isAccountActivated ? "Ready to accept orders" : "Pending activation"
        }
    ];

    const displayTimeline = timeline && timeline.length > 0 ? timeline : defaultTimeline;

    return (
        <div className="app-status-page">
            {/* Standalone Partner Top Bar */}
            <header className="status-top-bar">
                <div className="status-top-inner">
                    <Link to="/" className="status-brand">
                        <span className="brand-icon">🍔</span>
                        <span className="brand-text">FoodExpress</span>
                        <span className="partner-tag">PARTNER</span>
                    </Link>

                    <div className="status-header-links">
                        <Link to="/restaurant/partner-request" className="link-partner-action">
                            + Request Partnership
                        </Link>
                        <Link to="/restaurant/login" className="btn-partner-login-link">
                            Partner Login
                        </Link>
                    </div>
                </div>
            </header>

            <main className="status-main-wrapper">
                {/* Search Bar Widget */}
                <div className="status-search-card">
                    <form className="status-search-form" onSubmit={handleSearchSubmit}>
                        <div className="search-input-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Enter Application ID (e.g. RP-1024) or Registered Email"
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
                        <p style={{ marginTop: "12px", color: "#64748b" }}>Loading application details...</p>
                    </div>
                ) : notFound || !application ? (
                    <div className="status-empty-card">
                        <div className="empty-icon-wrap">
                            <FaStore />
                        </div>
                        <h2>No Application Found</h2>
                        <p>
                            We could not locate an active partnership request matching your search query.
                            Please verify your Application ID (e.g. <code>RP-1024</code>) or registered email address.
                        </p>
                        <div className="empty-actions">
                            <Link to="/restaurant/partner-request" className="btn-empty-apply">
                                Submit New Partnership Request <FaArrowRight />
                            </Link>
                            <Link to="/restaurant/login" className="btn-empty-login">
                                Log In to Existing Account
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="app-status-card">
                        {/* Header */}
                        <div className="app-status-header">
                            <div>
                                <div className="app-sub-heading">Restaurant Partner Application</div>
                                <div className="app-badge-id">
                                    Application ID: <code>{appId}</code>
                                </div>
                                <h1 className="app-restaurant-title">{application.restaurantName}</h1>
                                <div className="app-owner-sub">
                                    <FaUser /> Owner: <strong>{application.ownerName}</strong>
                                    {application.email && <span> • {application.email}</span>}
                                    {application.address?.city && <span> • {application.address.city}</span>}
                                </div>
                            </div>

                            <div className={`app-status-badge ${status}`}>
                                {status === "pending" && "🟡 UNDER REVIEW"}
                                {status === "approved" && "🟢 APPROVED"}
                                {status === "changes_requested" && "🟠 CHANGES REQUESTED"}
                                {status === "rejected" && "🔴 REJECTED"}
                                {status === "suspended" && "⚪ SUSPENDED"}
                            </div>
                        </div>

                        {/* Status Notice Alerts */}
                        {status === "pending" && (
                            <div className="app-notice-box pending">
                                <div className="notice-title">
                                    <FaClock /> Application Under Operations Review
                                </div>
                                <p>
                                    Your restaurant partnership request is currently being reviewed by the FoodExpress
                                    admin team. Once approved, you will receive a secure activation link to set up your
                                    credentials and access your restaurant dashboard.
                                </p>
                            </div>
                        )}

                        {status === "approved" && (
                            <div className="app-notice-box approved">
                                <div className="notice-title">
                                    <FaCheckCircle /> Partnership Approved! 🎉
                                </div>
                                <p>
                                    Congratulations! Your restaurant has been officially approved. If you have not
                                    yet activated your account, use the invitation link sent to your registered email,
                                    or proceed to the Partner Login.
                                </p>
                            </div>
                        )}

                        {status === "changes_requested" && (
                            <div className="app-notice-box changes">
                                <div className="notice-title">
                                    <FaExclamationTriangle /> Additional Information Required
                                </div>
                                <div className="admin-reason-text">
                                    <strong>Admin Feedback:</strong>{" "}
                                    {application.changesRequestedReason ||
                                        "Please verify your restaurant address, contact number, and menu details."}
                                </div>
                                <p style={{ marginTop: "8px", fontSize: "12.5px" }}>
                                    Please reply with updated documents or contact <strong>partners@foodexpress.com</strong>.
                                </p>
                            </div>
                        )}

                        {status === "rejected" && (
                            <div className="app-notice-box rejected">
                                <div className="notice-title">
                                    <FaExclamationTriangle /> Application Not Approved
                                </div>
                                <div className="admin-reason-text">
                                    <strong>Admin Reason:</strong>{" "}
                                    {application.rejectionReason ||
                                        "Application did not meet our current partner onboarding guidelines."}
                                </div>
                                <p style={{ marginTop: "8px", fontSize: "12.5px" }}>
                                    You may submit a new request once the requirements are addressed.
                                </p>
                            </div>
                        )}

                        {/* Timeline Header */}
                        <h3 className="timeline-section-title">Timeline</h3>

                        {/* Visual Stepper Timeline */}
                        <div className="app-timeline">
                            {displayTimeline.map((step, idx) => {
                                const stepStatus = step.status;
                                return (
                                    <div key={idx} className={`app-timeline-item ${stepStatus}`}>
                                        <div className="app-timeline-dot">
                                            {stepStatus === "completed" && "✓"}
                                            {stepStatus === "current" && "●"}
                                            {stepStatus === "warning" && "!"}
                                            {stepStatus === "failed" && "✕"}
                                            {stepStatus === "pending" && "○"}
                                        </div>
                                        <div className="timeline-content">
                                            <div className="app-timeline-title">{step.title}</div>
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
                        <div className="app-actions-footer">
                            <button
                                type="button"
                                onClick={() => fetchStatus(appId)}
                                className="btn-refresh-status"
                            >
                                <FaSyncAlt /> Refresh Status
                            </button>

                            <div className="footer-right-actions">
                                {status === "approved" && (
                                    <Link to="/restaurant/login" className="btn-action-primary">
                                        <FaKey /> Partner Login <FaArrowRight />
                                    </Link>
                                )}

                                {status === "rejected" && (
                                    <Link to="/restaurant/partner-request" className="btn-action-primary">
                                        Submit New Request <FaArrowRight />
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

export default ApplicationStatus;
