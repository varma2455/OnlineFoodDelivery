import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { deliveryPartnerAPI, authAPI } from "../../../services/api";
import { auth } from "../../../firebase";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth";
import "./DeliveryLogin.css";
import {
    FaMotorcycle,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaGoogle,
    FaArrowRight
} from "react-icons/fa";

const DeliveryLogin = () => {
    const navigate = useNavigate();
    const { login, showToast } = useContext(StoreContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handlePostLoginRouting = async () => {
        try {
            const res = await deliveryPartnerAPI.getMe();
            const { deliveryPartner } = res.data;

            if (!deliveryPartner) {
                showToast(
                    "Delivery partner account has not been activated. Please check your application status.",
                    "info"
                );
                navigate("/delivery/application-status");
                return;
            }

            const status = deliveryPartner.status;

            if (status === "approved") {
                showToast(`Welcome back, ${deliveryPartner.name}! 🚴`, "success");
                navigate("/delivery/dashboard");
            } else if (status === "suspended") {
                showToast("Your delivery partner account has been suspended by administrator.", "error");
                navigate("/delivery/application-status");
            } else {
                navigate("/delivery/application-status");
            }
        } catch (err) {
            console.warn("Could not check delivery partner status:", err.message);
            navigate("/delivery/application-status");
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password) {
            showToast("Please enter both email and password.", "error");
            return;
        }

        try {
            setLoading(true);
            let token = null;
            let loggedUser = null;

            // 1. Firebase Authentication
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
                const idToken = await userCredential.user.getIdToken();

                const { data } = await authAPI.firebaseLogin(idToken);
                token = data.token;
                loggedUser = data.user;
            } catch (fbErr) {
                console.warn("Firebase email login fallback:", fbErr.message);
                const { data } = await authAPI.login({ email: email.trim(), password });
                token = data.token;
                loggedUser = data.user;
            }

            if (token && loggedUser) {
                if (loggedUser.role !== "delivery" && loggedUser.role !== "admin") {
                    showToast(
                        "This account is not registered as a delivery partner. Please apply for delivery partnership or activate your invitation.",
                        "error"
                    );
                    return;
                }

                login(token, loggedUser);
                await handlePostLoginRouting();
            }
        } catch (err) {
            console.error("Delivery login failed:", err);
            showToast(err.message || "Invalid credentials. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            const { data } = await authAPI.firebaseLogin(idToken);

            if (data.token && data.user) {
                if (data.user.role !== "delivery" && data.user.role !== "admin") {
                    showToast(
                        "This Google account is not registered as a delivery partner. Please apply to join the fleet.",
                        "error"
                    );
                    return;
                }

                login(data.token, data.user);
                await handlePostLoginRouting();
            }
        } catch (err) {
            console.error("Google login failed:", err);
            showToast(err.message || "Google sign-in failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dp-login-page">
            <div className="dp-login-card">
                {/* Brand Logo & Header */}
                <div className="dp-login-header">
                    <Link to="/" className="dp-login-logo">
                        <span className="dp-logo-icon">🍔</span>
                        <span className="dp-logo-text">FoodExpress</span>
                    </Link>

                    <div className="dp-login-badge">
                        <FaMotorcycle /> DELIVERY PARTNER PORTAL
                    </div>

                    <h1 className="dp-login-title">Delivery Partner Login</h1>
                    <p className="dp-login-subtitle">
                        Sign in to manage your deliveries, earnings, and availability.
                    </p>
                </div>

                {/* Email/Password Form */}
                <form className="dp-login-form" onSubmit={handleEmailLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-with-icon">
                            <FaEnvelope className="field-icon" />
                            <input
                                type="email"
                                className="dp-input"
                                placeholder="rider@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="dp-password-wrapper">
                            <FaLock className="field-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="dp-input has-icon"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="dp-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="dp-login-options">
                        <label className="remember-label">
                            <input type="checkbox" defaultChecked />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="dp-forgot-link">
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className="btn-dp-submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Google Sign-in */}
                <button
                    type="button"
                    className="btn-google-login"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <FaGoogle color="#ea4335" /> Sign in with Google
                </button>

                {/* Divider */}
                <div className="dp-divider">
                    <span>OR</span>
                </div>

                {/* Not a Partner Banner */}
                <div className="dp-register-banner">
                    <p className="not-partner-text">Not a delivery partner?</p>
                    <Link to="/delivery/partner-application" className="btn-apply-now">
                        Apply Now <FaArrowRight />
                    </Link>

                    <div className="status-tracker-link-wrap">
                        <Link to="/delivery/application-status" className="link-check-app">
                            Already applied? Track Application Status
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryLogin;
