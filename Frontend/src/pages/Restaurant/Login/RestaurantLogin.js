import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantAPI, authAPI } from "../../../services/api";
import { auth } from "../../../firebase";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth";
import "./RestaurantLogin.css";
import {
    FaStore,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaGoogle,
    FaArrowRight
} from "react-icons/fa";

const RestaurantLogin = () => {
    const navigate = useNavigate();
    const { login, showToast } = useContext(StoreContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Route redirection based on restaurant status
    const handlePostLoginRouting = async (token, userData) => {
        try {
            // Check restaurant application status
            const res = await restaurantAPI.getMyRestaurant();
            const { hasRestaurant, restaurant } = res.data;

            if (!hasRestaurant || !restaurant) {
                showToast(
                    "Restaurant partner account has not been activated. Please check your application status.",
                    "info"
                );
                navigate("/restaurant/application-status");
                return;
            }

            const status = restaurant.status;

            if (status === "approved") {
                showToast(`Welcome back, ${restaurant.name}! 🍳`, "success");
                navigate("/restaurant/dashboard");
            } else if (status === "pending") {
                showToast("Your restaurant application is still under review.", "info");
                navigate("/restaurant/application-status");
            } else if (status === "rejected" || status === "changes_requested") {
                showToast("Your restaurant application requires attention.", "warning");
                navigate("/restaurant/application-status");
            } else if (status === "suspended") {
                showToast("This restaurant account has been suspended.", "error");
                navigate("/restaurant/application-status");
            } else {
                navigate("/restaurant/application-status");
            }
        } catch (err) {
            console.warn("Could not check restaurant status:", err.message);
            navigate("/restaurant/application-status");
        }
    };

    // Firebase Email + Password Login
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
                // Fallback for pre-seeded database accounts
                const { data } = await authAPI.login({ email: email.trim(), password });
                token = data.token;
                loggedUser = data.user;
            }

            if (token && loggedUser) {
                // If user role is customer, they shouldn't access restaurant portal
                if (loggedUser.role !== "restaurant" && loggedUser.role !== "admin") {
                    showToast(
                        "This account is registered as a customer. Please activate a Restaurant Partner account or submit a request.",
                        "error"
                    );
                    return;
                }

                login(token, loggedUser);
                await handlePostLoginRouting(token, loggedUser);
            }
        } catch (err) {
            console.error("Login failed:", err);
            showToast(err.message || "Invalid credentials. Please try again.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Google Sign-In
    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            const { data } = await authAPI.firebaseLogin(idToken);

            if (data.token && data.user) {
                if (data.user.role !== "restaurant" && data.user.role !== "admin") {
                    showToast(
                        "This Google account is registered as a customer. Please request a partnership or activate your partner invitation.",
                        "error"
                    );
                    return;
                }

                login(data.token, data.user);
                await handlePostLoginRouting(data.token, data.user);
            }
        } catch (err) {
            console.error("Google login failed:", err);
            showToast(err.message || "Google sign-in failed", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rest-login-page">
            <div className="rest-login-card">
                {/* Brand Logo & Header */}
                <div className="rest-login-header">
                    <Link to="/" className="rest-login-logo">
                        <span className="rest-logo-icon">🍔</span>
                        <span className="rest-logo-text">FoodExpress</span>
                    </Link>

                    <div className="rest-login-badge">
                        <FaStore /> RESTAURANT PARTNER PORTAL
                    </div>

                    <h1 className="rest-login-title">Restaurant Partner Login</h1>
                    <p className="rest-login-subtitle">
                        Login to manage your restaurant, menu and orders.
                    </p>
                </div>

                {/* Email/Password Form */}
                <form className="rest-login-form" onSubmit={handleEmailLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <div className="input-with-icon">
                            <FaEnvelope className="field-icon" />
                            <input
                                type="email"
                                className="rest-input"
                                placeholder="name@restaurant.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="rest-password-wrapper">
                            <FaLock className="field-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="rest-input has-icon"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="rest-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex="-1"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="rest-login-options">
                        <label className="remember-label">
                            <input type="checkbox" defaultChecked />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="rest-forgot-link">
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className="btn-rest-submit" disabled={loading}>
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
                <div className="rest-divider">
                    <span>OR</span>
                </div>

                {/* Not a Partner Section */}
                <div className="rest-register-banner">
                    <p className="not-partner-text">Not a FoodExpress Partner yet?</p>
                    <Link to="/restaurant/partner-request" className="btn-request-partnership">
                        Request Restaurant Partnership <FaArrowRight />
                    </Link>

                    <div className="status-tracker-link-wrap">
                        <Link to="/restaurant/application-status" className="link-check-app">
                            Already applied? Track Application Status
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantLogin;
