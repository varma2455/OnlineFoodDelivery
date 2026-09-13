import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantPartnerAPI } from "../../../services/api";
import { auth } from "../../../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth";
import Loader from "../../../components/Loader/Loader";
import "./RestaurantActivate.css";
import {
    FaStore,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaCheckCircle,
    FaExclamationTriangle,
    FaClock,
    FaArrowRight,
    FaGoogle,
    FaUserCheck,
    FaShieldAlt
} from "react-icons/fa";

const RestaurantActivate = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { login, showToast } = useContext(StoreContext);

    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState(false);
    const [errorState, setErrorState] = useState(null); // 'expired' | 'revoked' | 'used' | 'not_found' | message

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const fetchInvitation = useCallback(async () => {
        try {
            setLoading(true);
            setErrorState(null);

            const { data } = await restaurantPartnerAPI.getInvitation(token);
            if (data.success && data.invitation) {
                setInvitation(data.invitation);
            }
        } catch (err) {
            console.error("Failed to load invitation:", err);
            const status = err.response?.data?.status;
            const message = err.response?.data?.message || err.message;
            if (status === "expired") {
                setErrorState("expired");
            } else if (status === "revoked") {
                setErrorState("revoked");
            } else if (status === "used") {
                setErrorState("used");
            } else {
                setErrorState(message || "Invalid invitation token.");
            }
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchInvitation();
    }, [fetchInvitation]);

    const handlePasswordActivation = async (e) => {
        e.preventDefault();

        if (!password || password.length < 6) {
            showToast("Password must be at least 6 characters.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showToast("Passwords do not match.", "error");
            return;
        }

        try {
            setActivating(true);
            const targetEmail = invitation.email;

            // 1. Firebase Authentication: Create or sign in user
            let idToken = null;
            try {
                const userCred = await createUserWithEmailAndPassword(auth, targetEmail, password);
                idToken = await userCred.user.getIdToken();
            } catch (fbErr) {
                if (fbErr.code === "auth/email-already-in-use") {
                    try {
                        const userCred = await signInWithEmailAndPassword(auth, targetEmail, password);
                        idToken = await userCred.user.getIdToken();
                    } catch (signInErr) {
                        console.warn("Existing Firebase sign-in attempt:", signInErr.message);
                    }
                } else {
                    console.warn("Firebase client creation note:", fbErr.message);
                }
            }

            // 2. Call backend activation endpoint
            const payload = {
                token,
                password,
                idToken,
                fullName: invitation.ownerName
            };

            const { data } = await restaurantPartnerAPI.activate(payload);

            if (data.success) {
                showToast(
                    data.message || "Account activated successfully! Welcome to FoodExpress Partner Portal! 🎉",
                    "success"
                );

                if (data.token && data.user) {
                    login(data.token, data.user);
                }

                // Redirect to Restaurant Dashboard
                navigate("/restaurant/dashboard");
            }
        } catch (err) {
            console.error("Activation failed:", err);
            showToast(err.message || "Account activation failed. Please try again.", "error");
        } finally {
            setActivating(false);
        }
    };

    const handleGoogleActivation = async () => {
        try {
            setActivating(true);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const googleEmail = result.user.email?.toLowerCase().trim();
            const targetEmail = invitation.email?.toLowerCase().trim();

            // Email matching check
            if (googleEmail !== targetEmail) {
                await auth.signOut();
                showToast(
                    `This invitation was issued to "${targetEmail}", but you signed in with "${googleEmail}". Please choose the correct Google account.`,
                    "error"
                );
                return;
            }

            const idToken = await result.user.getIdToken();

            // Call backend activation endpoint
            const payload = {
                token,
                idToken,
                fullName: result.user.displayName || invitation.ownerName
            };

            const { data } = await restaurantPartnerAPI.activate(payload);

            if (data.success) {
                showToast(
                    data.message || "Google account activated! Welcome to FoodExpress Partner Portal! 🎉",
                    "success"
                );

                if (data.token && data.user) {
                    login(data.token, data.user);
                }

                navigate("/restaurant/dashboard");
            }
        } catch (err) {
            console.error("Google activation failed:", err);
            showToast(err.message || "Google activation failed", "error");
        } finally {
            setActivating(false);
        }
    };

    return (
        <div className="activate-page">
            <header className="activate-top-bar">
                <Link to="/" className="activate-brand">
                    <span className="brand-logo-icon">🍔</span>
                    <span className="brand-name">FoodExpress</span>
                    <span className="partner-badge-pill">PARTNER</span>
                </Link>
            </header>

            <main className="activate-container">
                {loading ? (
                    <div className="activate-card status-loading-card">
                        <Loader />
                        <p style={{ marginTop: "16px", color: "#64748b" }}>Verifying partner invitation token...</p>
                    </div>
                ) : errorState ? (
                    <div className="activate-card status-error-card">
                        <div className="error-icon-box">
                            {errorState === "expired" ? (
                                <FaClock color="#d97706" />
                            ) : errorState === "used" ? (
                                <FaCheckCircle color="#10b981" />
                            ) : (
                                <FaExclamationTriangle color="#ef4444" />
                            )}
                        </div>

                        <h2>
                            {errorState === "expired" && "Partner Invitation Expired"}
                            {errorState === "revoked" && "Invitation Revoked"}
                            {errorState === "used" && "Account Already Activated"}
                            {errorState !== "expired" && errorState !== "revoked" && errorState !== "used" && "Invalid Invitation Link"}
                        </h2>

                        <p className="error-desc">
                            {errorState === "expired" &&
                                "This secure invitation link has exceeded its 72-hour validity window. Please contact FoodExpress operations or request a new link from the administrator."}
                            {errorState === "revoked" &&
                                "This partner invitation has been cancelled by an administrator. Please reach out to partner support."}
                            {errorState === "used" &&
                                "This invitation has already been used to activate your restaurant account. You can log in directly to your dashboard."}
                            {errorState !== "expired" &&
                                errorState !== "revoked" &&
                                errorState !== "used" &&
                                (typeof errorState === "string" ? errorState : "We could not verify this invitation token.")}
                        </p>

                        <div className="error-actions">
                            {errorState === "used" ? (
                                <Link to="/restaurant/login" className="btn-activate-login">
                                    Go to Partner Login <FaArrowRight />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/restaurant/login" className="btn-activate-login">
                                        Partner Login
                                    </Link>
                                    <Link to="/restaurant/application-status" className="btn-activate-status">
                                        Check Application Status
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="activate-card">
                        {/* Header Badge */}
                        <div className="activate-header">
                            <div className="activate-badge">
                                <FaUserCheck /> RESTAURANT PARTNER ACTIVATION
                            </div>
                            <h1 className="activate-title">Welcome, {invitation?.ownerName}!</h1>
                            <p className="activate-subtitle">
                                Your restaurant partnership has been approved. Set up your secure account password below to activate access to your restaurant dashboard.
                            </p>
                        </div>

                        {/* Approved Partner Details Box */}
                        <div className="invitation-details-box">
                            <div className="detail-item">
                                <span className="detail-label">Restaurant:</span>
                                <strong className="detail-value">{invitation?.restaurantName}</strong>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Email:</span>
                                <strong className="detail-value highlight-email">{invitation?.email}</strong>
                            </div>
                            {invitation?.city && (
                                <div className="detail-item">
                                    <span className="detail-label">City:</span>
                                    <span className="detail-value">{invitation.city}</span>
                                </div>
                            )}
                        </div>

                        {/* Google Quick Activation */}
                        <button
                            type="button"
                            className="btn-google-activate"
                            onClick={handleGoogleActivation}
                            disabled={activating}
                        >
                            <FaGoogle color="#ea4335" /> Activate with Google ({invitation?.email})
                        </button>

                        <div className="activate-divider">
                            <span>OR SET ACCOUNT PASSWORD</span>
                        </div>

                        {/* Password Form */}
                        <form className="activate-form" onSubmit={handlePasswordActivation}>
                            <div className="form-group">
                                <label>Create Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="At least 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="security-notice">
                                <FaShieldAlt />
                                <span>
                                    Your password will be securely managed via Firebase Authentication. Plaintext passwords are never stored.
                                </span>
                            </div>

                            <button type="submit" className="btn-activate-account" disabled={activating}>
                                {activating ? "Activating Partner Account..." : "Activate Restaurant Account"}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RestaurantActivate;
