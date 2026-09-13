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
    FaGoogle
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
                showToast("No restaurant registered under this account yet. Please register your restaurant.", "info");
                navigate("/restaurant/register");
                return;
            }

            const status = restaurant.status;

            if (status === "approved") {
                showToast(`Welcome to ${restaurant.name} dashboard! 🍳`, "success");
                navigate("/restaurant/dashboard");
            } else {
                // Pending, rejected, suspended, or closed
                navigate("/restaurant/application-status");
            }
        } catch (err) {
            console.warn("Could not check restaurant status:", err.message);
            // Default safe redirection
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
                {/* Header */}
                <div className="rest-login-header">
                    <div className="rest-login-badge">
                        <FaStore /> FOOD EXPRESS PARTNER
                    </div>
                    <h1 className="rest-login-title">Restaurant Partner Login</h1>
                    <p className="rest-login-subtitle">
                        Access your kitchen orders, menu management, and sales analytics.
                    </p>
                </div>

                {/* Google Sign-in */}
                <button
                    type="button"
                    className="btn-google-login"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <FaGoogle color="#ea4335" /> Sign in with Google
                </button>

                <div className="rest-divider">
                    <span>OR LOGIN WITH EMAIL</span>
                </div>

                {/* Email/Password Form */}
                <form className="rest-login-form" onSubmit={handleEmailLogin}>
                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                            Registered Email Address
                        </label>
                        <div style={{ position: "relative" }}>
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

                    <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                            Password
                        </label>
                        <div className="rest-password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="rest-input"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="rest-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="rest-login-options">
                        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                            <input type="checkbox" defaultChecked style={{ accentColor: "#ff5200" }} />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="rest-forgot-link">
                            Forgot Password?
                        </Link>
                    </div>

                    <button type="submit" className="btn-rest-submit" disabled={loading}>
                        {loading ? "Signing in..." : "Log In to Restaurant Portal"}
                    </button>
                </form>

                {/* New Partner Callout */}
                <div className="rest-register-banner">
                    Don't have a restaurant on FoodExpress yet?
                    <br />
                    <Link to="/restaurant/register">
                        Become a Restaurant Partner 🚀
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RestaurantLogin;
