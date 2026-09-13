import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { deliveryPartnerAPI } from "../../../services/api";
import { auth } from "../../../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth";
import Loader from "../../../components/Loader/Loader";
import "./DeliveryActivate.css";
import {
    FaMotorcycle,
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

const DeliveryActivate = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { login, showToast } = useContext(StoreContext);

    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState(false);
    const [errorState, setErrorState] = useState(null);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const fetchInvitation = useCallback(async () => {
        try {
            setLoading(true);
            setErrorState(null);

            const { data } = await deliveryPartnerAPI.getInvitation(token);
            if (data.success && data.invitation) {
                setInvitation(data.invitation);
            }
        } catch (err) {
            console.error("Failed to load delivery invitation:", err);
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
                        console.warn("Existing Firebase login attempt:", signInErr.message);
                    }
                } else {
                    console.warn("Firebase client creation note:", fbErr.message);
                }
            }

            // 2. Call backend activation
            const payload = {
                token,
                password,
                idToken,
                fullName: invitation.ownerName
            };

            const { data } = await deliveryPartnerAPI.activate(payload);

            if (data.success) {
                showToast(
                    data.message || "Account activated successfully! Welcome to FoodExpress Delivery Fleet! 🚴",
                    "success"
                );

                if (data.token && data.user) {
                    login(data.token, data.user);
                }

                navigate("/delivery/dashboard");
            }
        } catch (err) {
            console.error("Delivery activation failed:", err);
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

            if (googleEmail !== targetEmail) {
                await auth.signOut();
                showToast(
                    `This invitation was issued to "${targetEmail}", but you signed in with "${googleEmail}". Please choose the matching Google account.`,
                    "error"
                );
                return;
            }

            const idToken = await result.user.getIdToken();

            const payload = {
                token,
                idToken,
                fullName: result.user.displayName || invitation.ownerName
            };

            const { data } = await deliveryPartnerAPI.activate(payload);

            if (data.success) {
                showToast(
                    data.message || "Google account activated! Welcome to FoodExpress Delivery Fleet! 🚴",
                    "success"
                );

                if (data.token && data.user) {
                    login(data.token, data.user);
                }

                navigate("/delivery/dashboard");
            }
        } catch (err) {
            console.error("Google activation failed:", err);
            showToast(err.message || "Google activation failed", "error");
        } finally {
            setActivating(false);
        }
    };

    return (
        <div className="dp-activate-page">
            <header className="dp-activate-top">
                <Link to="/" className="dp-activate-brand">
                    <span className="brand-icon">🍔</span>
                    <span className="brand-name">FoodExpress</span>
                    <span className="dp-badge">DELIVERY PARTNER</span>
                </Link>
            </header>

            <main className="dp-activate-container">
                {loading ? (
                    <div className="dp-activate-card loading-card">
                        <Loader />
                        <p style={{ marginTop: "16px", color: "#64748b" }}>Verifying delivery invitation link...</p>
                    </div>
                ) : errorState ? (
                    <div className="dp-activate-card error-card">
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
                            {errorState === "expired" && "Delivery Invitation Expired"}
                            {errorState === "revoked" && "Invitation Revoked"}
                            {errorState === "used" && "Account Already Activated"}
                            {errorState !== "expired" && errorState !== "revoked" && errorState !== "used" && "Invalid Invitation Link"}
                        </h2>

                        <p className="error-desc">
                            {errorState === "expired" &&
                                "This secure 72-hour invitation link has expired. Please contact FoodExpress operations or your administrator to issue a new activation link."}
                            {errorState === "revoked" &&
                                "This delivery invitation has been cancelled by an administrator. Please reach out to partner support."}
                            {errorState === "used" &&
                                "This invitation has already been used to activate your rider account. Please log in directly."}
                            {errorState !== "expired" &&
                                errorState !== "revoked" &&
                                errorState !== "used" &&
                                (typeof errorState === "string" ? errorState : "We could not verify this invitation token.")}
                        </p>

                        <div className="error-actions">
                            {errorState === "used" ? (
                                <Link to="/delivery/login" className="btn-act-login">
                                    Go to Rider Login <FaArrowRight />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/delivery/login" className="btn-act-login">
                                        Rider Login
                                    </Link>
                                    <Link to="/delivery/application-status" className="btn-act-status">
                                        Check Application Status
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="dp-activate-card">
                        {/* Header Badge */}
                        <div className="dp-activate-header">
                            <div className="dp-status-badge">
                                <FaUserCheck /> DELIVERY PARTNER ACTIVATION
                            </div>
                            <h1 className="dp-activate-title">Welcome, {invitation?.ownerName}!</h1>
                            <p className="dp-activate-subtitle">
                                Your FoodExpress Delivery Partner application has been approved. Create your secure
                                login password to complete activation and start receiving orders.
                            </p>
                        </div>

                        {/* Approved Rider Details Box */}
                        <div className="dp-details-box">
                            <div className="detail-row">
                                <span className="label">Application ID:</span>
                                <strong className="value">{invitation?.applicationId}</strong>
                            </div>
                            <div className="detail-row">
                                <span className="label">Full Name:</span>
                                <strong className="value">{invitation?.ownerName}</strong>
                            </div>
                            <div className="detail-row">
                                <span className="label">Email:</span>
                                <strong className="value highlight-email">{invitation?.email}</strong>
                            </div>
                            {invitation?.vehicleType && (
                                <div className="detail-row">
                                    <span className="label">Vehicle:</span>
                                    <span className="value">{invitation.vehicleType}</span>
                                </div>
                            )}
                        </div>

                        {/* Google Quick Activation */}
                        <button
                            type="button"
                            className="btn-google-act"
                            onClick={handleGoogleActivation}
                            disabled={activating}
                        >
                            <FaGoogle color="#ea4335" /> Activate with Google ({invitation?.email})
                        </button>

                        <div className="dp-divider">
                            <span>OR CREATE PASSWORD</span>
                        </div>

                        {/* Password Form */}
                        <form className="dp-activate-form" onSubmit={handlePasswordActivation}>
                            <div className="dp-form-group">
                                <label>Create Password</label>
                                <div className="pass-wrap">
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
                                        className="pass-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex="-1"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="dp-form-group">
                                <label>Confirm Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="dp-security-box">
                                <FaShieldAlt />
                                <span>
                                    Credentials are cryptographically verified via Firebase Authentication.
                                    Plain-text passwords are never stored in the database.
                                </span>
                            </div>

                            <button type="submit" className="btn-act-submit" disabled={activating}>
                                {activating ? "Activating Rider Account..." : "Activate Delivery Account"}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DeliveryActivate;
