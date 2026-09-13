import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantAPI } from "../../../services/api";
import { auth } from "../../../firebase";
import {
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile as updateFirebaseProfile
} from "firebase/auth";
import "./RestaurantRegister.css";
import {
    FaStore,
    FaUserTie,
    FaMapMarkerAlt,
    FaBriefcase,
    FaUtensils,
    FaEye,
    FaCheckCircle,
    FaArrowRight,
    FaArrowLeft,
    FaPlus,
    FaTrash,
    FaGoogle
} from "react-icons/fa";

const ALL_CUISINES = [
    "North Indian",
    "South Indian",
    "Biryani",
    "Pizza",
    "Burger",
    "Chinese",
    "Fast Food",
    "Desserts",
    "Beverages",
    "Street Food",
    "Mughlai",
    "Healthy Food"
];

const STEPS = [
    { number: 1, title: "Owner Account", icon: FaUserTie },
    { number: 2, title: "Restaurant Details", icon: FaStore },
    { number: 3, title: "Location", icon: FaMapMarkerAlt },
    { number: 4, title: "Business Details", icon: FaBriefcase },
    { number: 5, title: "Menu Setup", icon: FaUtensils },
    { number: 6, title: "Preview", icon: FaEye },
    { number: 7, title: "Submit", icon: FaCheckCircle }
];

const RestaurantRegister = () => {
    const navigate = useNavigate();
    const { login, showToast } = useContext(StoreContext);

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Step 1: Owner Account
    const [ownerData, setOwnerData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: ""
    });
    const [firebaseIdToken, setFirebaseIdToken] = useState("");

    // Step 2: Restaurant Details
    const [restData, setRestData] = useState({
        name: "",
        description: "",
        email: "",
        phone: "",
        cuisineTypes: ["North Indian", "Biryani"],
        restaurantType: "Both"
    });

    // Step 3: Location
    const [locData, setLocData] = useState({
        street: "",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001"
    });

    // Step 4: Business Details
    const [bizData, setBizData] = useState({
        openingTime: "09:00 AM",
        closingTime: "11:00 PM",
        deliveryAvailable: true,
        minimumOrderAmount: 150,
        deliveryFee: 40
    });

    // Step 5: Menu Setup (Sample Dishes)
    const [menuItems, setMenuItems] = useState([
        {
            name: "Signature Chicken Biryani",
            category: "Biryani",
            price: 260,
            isVeg: false,
            description: "Fragrant basmati rice slow cooked with tender marinated chicken and special spices."
        },
        {
            name: "Paneer Butter Masala",
            category: "North Indian",
            price: 210,
            isVeg: true,
            description: "Fresh cottage cheese cubes cooked in a rich, velvety tomato butter gravy."
        }
    ]);

    const [newDish, setNewDish] = useState({
        name: "",
        category: "Fast Food",
        price: "",
        isVeg: true,
        description: ""
    });

    // Step 7: Agreement
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Google Sign-In for Owner Account
    const handleGoogleOwnerAuth = async () => {
        try {
            setLoading(true);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();

            setFirebaseIdToken(token);
            setOwnerData((prev) => ({
                ...prev,
                fullName: result.user.displayName || prev.fullName,
                email: result.user.email || prev.email,
                phone: result.user.phoneNumber || prev.phone
            }));

            // Pre-fill restaurant email if blank
            setRestData((prev) => ({
                ...prev,
                email: prev.email || result.user.email
            }));

            showToast("Authenticated with Google! Please continue to restaurant details.", "success");
            setErrors({});
            setCurrentStep(2);
        } catch (err) {
            console.error("Google Auth error:", err);
            showToast(err.message || "Google authentication failed", "error");
        } finally {
            setLoading(false);
        }
    };

    // Client-Side Validation Per Step
    const validateStep = (step) => {
        const errs = {};

        if (step === 1) {
            if (!ownerData.fullName.trim()) errs.fullName = "Full name is required";
            if (!ownerData.email.trim()) {
                errs.email = "Email is required";
            } else if (!/\S+@\S+\.\S+/.test(ownerData.email)) {
                errs.email = "Invalid email format";
            }
            if (!firebaseIdToken) {
                if (!ownerData.password) {
                    errs.password = "Password is required";
                } else if (ownerData.password.length < 6) {
                    errs.password = "Password must be at least 6 characters";
                }
                if (ownerData.password !== ownerData.confirmPassword) {
                    errs.confirmPassword = "Passwords do not match";
                }
            }
            if (!ownerData.phone.trim()) {
                errs.phone = "Phone number is required";
            } else if (ownerData.phone.replace(/\D/g, "").length < 10) {
                errs.phone = "Valid 10-digit phone number is required";
            }
        }

        if (step === 2) {
            if (!restData.name.trim()) errs.name = "Restaurant name is required";
            if (!restData.email.trim()) {
                errs.restEmail = "Restaurant email is required";
            } else if (!/\S+@\S+\.\S+/.test(restData.email)) {
                errs.restEmail = "Invalid email format";
            }
            if (!restData.phone.trim()) {
                errs.restPhone = "Contact phone number is required";
            }
            if (!restData.cuisineTypes || restData.cuisineTypes.length === 0) {
                errs.cuisineTypes = "Please select at least one cuisine";
            }
        }

        if (step === 3) {
            if (!locData.street.trim()) errs.street = "Street address is required";
            if (!locData.city.trim()) errs.city = "City is required";
            if (!locData.state.trim()) errs.state = "State is required";
            if (!locData.pincode.trim()) {
                errs.pincode = "Pincode is required";
            } else if (locData.pincode.replace(/\D/g, "").length < 6) {
                errs.pincode = "Valid 6-digit pincode required";
            }
        }

        if (step === 4) {
            if (!bizData.openingTime.trim()) errs.openingTime = "Opening time required";
            if (!bizData.closingTime.trim()) errs.closingTime = "Closing time required";
            if (Number(bizData.minimumOrderAmount) < 0) errs.minimumOrderAmount = "Cannot be negative";
            if (Number(bizData.deliveryFee) < 0) errs.deliveryFee = "Cannot be negative";
        }

        if (step === 7) {
            if (!agreedToTerms) {
                errs.terms = "You must agree to the partnership terms to submit";
            }
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, 7));
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            showToast("Please fix the highlighted errors.", "error");
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const toggleCuisine = (cuisine) => {
        setRestData((prev) => {
            const exists = prev.cuisineTypes.includes(cuisine);
            const updated = exists
                ? prev.cuisineTypes.filter((c) => c !== cuisine)
                : [...prev.cuisineTypes, cuisine];
            return { ...prev, cuisineTypes: updated };
        });
    };

    const handleAddDish = (e) => {
        e.preventDefault();
        if (!newDish.name.trim() || !newDish.price) {
            showToast("Dish name and price are required", "error");
            return;
        }
        setMenuItems((prev) => [
            ...prev,
            {
                name: newDish.name.trim(),
                category: newDish.category,
                price: Number(newDish.price),
                isVeg: Boolean(newDish.isVeg),
                description: newDish.description.trim()
            }
        ]);
        setNewDish({
            name: "",
            category: "Fast Food",
            price: "",
            isVeg: true,
            description: ""
        });
        showToast("Dish added to initial menu!", "success");
    };

    const handleRemoveDish = (index) => {
        setMenuItems((prev) => prev.filter((_, idx) => idx !== index));
    };

    // Final Application Submission
    const handleSubmitApplication = async () => {
        if (!validateStep(7)) return;

        try {
            setLoading(true);
            let idToken = firebaseIdToken;

            // 1. If not authenticated via Google, create Firebase account using email/password
            if (!idToken) {
                try {
                    const userCredential = await createUserWithEmailAndPassword(
                        auth,
                        ownerData.email,
                        ownerData.password
                    );
                    await updateFirebaseProfile(userCredential.user, {
                        displayName: ownerData.fullName
                    });
                    idToken = await userCredential.user.getIdToken();
                } catch (fbErr) {
                    console.warn("Firebase signup notice:", fbErr.message);
                    // If user already registered in Firebase, attempt login to get token
                    if (fbErr.code === "auth/email-already-in-use") {
                        showToast("Account already exists with this email. Please login or use another email.", "error");
                        setLoading(false);
                        return;
                    }
                }
            }

            // 2. Register restaurant on MongoDB backend
            const payload = {
                idToken,
                fullName: ownerData.fullName,
                email: ownerData.email,
                phone: ownerData.phone,
                restaurantName: restData.name,
                description: restData.description,
                restaurantEmail: restData.email,
                restaurantPhone: restData.phone,
                address: locData,
                cuisineTypes: restData.cuisineTypes,
                restaurantType: restData.restaurantType,
                openingTime: bizData.openingTime,
                closingTime: bizData.closingTime,
                deliveryAvailable: bizData.deliveryAvailable,
                minimumOrderAmount: Number(bizData.minimumOrderAmount),
                deliveryFee: Number(bizData.deliveryFee),
                initialMenuItems: menuItems
            };

            const response = await restaurantAPI.register(payload);
            const data = response.data;

            if (data.token && data.user) {
                login(data.token, data.user);
            }

            showToast("🎉 Restaurant application submitted successfully!", "success");
            navigate("/restaurant/application-status");
        } catch (err) {
            console.error("Submission failed:", err);
            showToast(err.message || "Failed to submit restaurant application", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rest-register-page">
            <div className="rest-register-card">
                {/* Brand Header */}
                <div className="rest-register-header">
                    <div className="rest-logo-badge">
                        <FaStore /> FOOD EXPRESS PARTNER
                    </div>
                    <h1 className="rest-register-title">Become a FoodExpress Restaurant Partner</h1>
                    <p className="rest-register-subtitle">
                        Reach millions of food lovers, grow your sales, and manage orders smoothly.
                    </p>
                </div>

                {/* Progress Stepper */}
                <div className="rest-stepper-container">
                    <div className="rest-stepper-track">
                        {STEPS.map((s) => {
                            const isCompleted = s.number < currentStep;
                            const isActive = s.number === currentStep;
                            const IconComponent = s.icon;
                            return (
                                <button
                                    key={s.number}
                                    type="button"
                                    className={`rest-stepper-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                                    onClick={() => {
                                        if (s.number < currentStep) setCurrentStep(s.number);
                                    }}
                                    disabled={s.number > currentStep}
                                >
                                    <div className="rest-step-circle">
                                        {isCompleted ? "✓" : <IconComponent size={14} />}
                                    </div>
                                    <span className="rest-step-label">{s.title}</span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="rest-progress-bar-bg">
                        <div
                            className="rest-progress-bar-fill"
                            style={{ width: `${((currentStep - 1) / 6) * 100}%` }}
                        />
                    </div>
                </div>

                {/* STEP 1: Owner Account */}
                {currentStep === 1 && (
                    <div className="rest-step-content">
                        <h2 className="rest-step-heading">
                            <FaUserTie style={{ color: "#ff5200" }} /> Step 1: Owner Account
                        </h2>
                        <p className="rest-step-description">
                            Create your restaurant owner credentials. You will use these to log into your partner dashboard.
                        </p>

                        <div style={{ marginBottom: "20px" }}>
                            <button
                                type="button"
                                onClick={handleGoogleOwnerAuth}
                                disabled={loading}
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    borderRadius: "10px",
                                    border: "1.5px solid #cbd5e1",
                                    background: "#ffffff",
                                    color: "#0f172a",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "10px"
                                }}
                            >
                                <FaGoogle color="#ea4335" /> Continue with Google
                            </button>
                            <div style={{ textAlign: "center", margin: "16px 0", color: "#94a3b8", fontSize: "13px" }}>
                                ─── OR REGISTER WITH EMAIL ───
                            </div>
                        </div>

                        <div className="rest-form-grid">
                            <div className="rest-form-group">
                                <label className="rest-label">
                                    Owner Full Name <span className="rest-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    placeholder="e.g. Ramesh Kumar"
                                    value={ownerData.fullName}
                                    onChange={(e) => {
                                        setOwnerData({ ...ownerData, fullName: e.target.value });
                                        if (errors.fullName) setErrors({ ...errors, fullName: "" });
                                    }}
                                />
                                {errors.fullName && <div className="rest-error-text">{errors.fullName}</div>}
                            </div>

                            <div className="rest-form-group">
                                <label className="rest-label">
                                    Owner Email <span className="rest-required">*</span>
                                </label>
                                <input
                                    type="email"
                                    className="rest-input"
                                    placeholder="owner@example.com"
                                    value={ownerData.email}
                                    onChange={(e) => {
                                        setOwnerData({ ...ownerData, email: e.target.value });
                                        if (errors.email) setErrors({ ...errors, email: "" });
                                    }}
                                />
                                {errors.email && <div className="rest-error-text">{errors.email}</div>}
                            </div>

                            <div className="rest-form-group">
                                <label className="rest-label">
                                    Owner Phone Number <span className="rest-required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    className="rest-input"
                                    placeholder="9876543210"
                                    value={ownerData.phone}
                                    onChange={(e) => {
                                        setOwnerData({ ...ownerData, phone: e.target.value });
                                        if (errors.phone) setErrors({ ...errors, phone: "" });
                                    }}
                                />
                                {errors.phone && <div className="rest-error-text">{errors.phone}</div>}
                            </div>

                            {!firebaseIdToken && (
                                <>
                                    <div className="rest-form-group">
                                        <label className="rest-label">
                                            Create Password <span className="rest-required">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            className="rest-input"
                                            placeholder="Min. 6 characters"
                                            value={ownerData.password}
                                            onChange={(e) => {
                                                setOwnerData({ ...ownerData, password: e.target.value });
                                                if (errors.password) setErrors({ ...errors, password: "" });
                                            }}
                                        />
                                        {errors.password && <div className="rest-error-text">{errors.password}</div>}
                                    </div>

                                    <div className="rest-form-group">
                                        <label className="rest-label">
                                            Confirm Password <span className="rest-required">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            className="rest-input"
                                            placeholder="Repeat password"
                                            value={ownerData.confirmPassword}
                                            onChange={(e) => {
                                                setOwnerData({ ...ownerData, confirmPassword: e.target.value });
                                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                                            }}
                                        />
                                        {errors.confirmPassword && (
                                            <div className="rest-error-text">{errors.confirmPassword}</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 2: Restaurant Details */}
                {currentStep === 2 && (
                    <div className="rest-step-content">
                        <h2 className="rest-step-heading">
                            <FaStore style={{ color: "#ff5200" }} /> Step 2: Restaurant Details
                        </h2>
                        <p className="rest-step-description">
                            Tell us about your eatery, cuisines served, and customer contact information.
                        </p>

                        <div className="rest-form-grid">
                            <div className="rest-form-group full-width">
                                <label className="rest-label">
                                    Restaurant Name <span className="rest-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    placeholder="e.g. Royal Spice Kitchen"
                                    value={restData.name}
                                    onChange={(e) => {
                                        setRestData({ ...restData, name: e.target.value });
                                        if (errors.name) setErrors({ ...errors, name: "" });
                                    }}
                                />
                                {errors.name && <div className="rest-error-text">{errors.name}</div>}
                            </div>

                            <div className="rest-form-group full-width">
                                <label className="rest-label">Restaurant Description</label>
                                <textarea
                                    className="rest-textarea"
                                    placeholder="Brief summary of your specialties, signature recipes, and heritage..."
                                    value={restData.description}
                                    onChange={(e) => setRestData({ ...restData, description: e.target.value })}
                                />
                            </div>

                            <div className="rest-form-group">
                                <label className="rest-label">
                                    Restaurant Contact Phone <span className="rest-required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    className="rest-input"
                                    placeholder="Order helpline / desk number"
                                    value={restData.phone}
                                    onChange={(e) => {
                                        setRestData({ ...restData, phone: e.target.value });
                                        if (errors.restPhone) setErrors({ ...errors, restPhone: "" });
                                    }}
                                />
                                {errors.restPhone && <div className="rest-error-text">{errors.restPhone}</div>}
                            </div>

                            <div className="rest-form-group">
                                <label className="rest-label">
                                    Restaurant Official Email <span className="rest-required">*</span>
                                </label>
                                <input
                                    type="email"
                                    className="rest-input"
                                    placeholder="orders@restaurant.com"
                                    value={restData.email}
                                    onChange={(e) => {
                                        setRestData({ ...restData, email: e.target.value });
                                        if (errors.restEmail) setErrors({ ...errors, restEmail: "" });
                                    }}
                                />
                                {errors.restEmail && <div className="rest-error-text">{errors.restEmail}</div>}
                            </div>

                            <div className="rest-form-group">
                                <label className="rest-label">Restaurant Type</label>
                                <select
                                    className="rest-select"
                                    value={restData.restaurantType}
                                    onChange={(e) => setRestData({ ...restData, restaurantType: e.target.value })}
                                >
                                    <option value="Both">Both Veg & Non-Veg</option>
                                    <option value="Veg">Pure Vegetarian 🟢</option>
                                    <option value="Non-Veg">Non-Vegetarian 🔴</option>
                                </select>
                            </div>

                            <div className="rest-form-group full-width">
                                <label className="rest-label">
                                    Cuisine Types <span className="rest-required">*</span>
                                </label>
                                <div className="rest-cuisine-grid">
                                    {ALL_CUISINES.map((c) => {
                                        const isSelected = restData.cuisineTypes.includes(c);
                                        return (
                                            <button
                                                key={c}
                                                type="button"
                                                className={`rest-cuisine-tag ${isSelected ? "selected" : ""}`}
                                                onClick={() => toggleCuisine(c)}
                                            >
                                                {isSelected ? "✓ " : "+ "} {c}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.cuisineTypes && <div className="rest-error-text">{errors.cuisineTypes}</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: Location */}
                {currentStep === 3 && (
                    <div className="rest-step-content">
                        <h2 className="rest-step-heading">
                            <FaMapMarkerAlt style={{ color: "#ff5200" }} /> Step 3: Restaurant Location
                        </h2>
                        <p className="rest-step-description">
                            Where should delivery partners pick up your food orders?
                        </p>

                        <div className="rest-form-grid">
                            <div className="rest-form-group full-width">
                                <label className="rest-label">
                                    Street Address / Door No. <span className="rest-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    placeholder="Shop 12, Road 36, Jubilee Hills"
                                    value={locData.street}
                                    onChange={(e) => {
                                        setLocData({ ...locData, street: e.target.value });
                                        if (errors.street) setErrors({ ...errors, street: "" });
                                    }}
                                />
                                {errors.street && <div className="rest-error-text">{errors.street}</div>}
                            </div>

                            <div className="rest-form-group">
                                <label className="rest-label">
                                    City <span className="rest-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    placeholder="e.g. Hyderabad"
                                    value={locData.city}
                                    onChange={(e) => {
                                        setLocData({ ...locData, city: e.target.value });
                                        if (errors.city) setErrors({ ...errors, city: "" });
                                    }}
                                />
                                {errors.city && <div className="rest-error-text">{errors.city}</div>}
                            </div>

                            <div className="rest-form-group">
                                <label className="rest-label">
                                    State <span className="rest-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    placeholder="e.g. Telangana"
                                    value={locData.state}
                                    onChange={(e) => {
                                        setLocData({ ...locData, state: e.target.value });
                                        if (errors.state) setErrors({ ...errors, state: "" });
                                    }}
                                />
                                {errors.state && <div className="rest-error-text">{errors.state}</div>}
                            </div>

                            <div className="rest-form-group">
                                <label className="rest-label">
                                    Pincode <span className="rest-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    placeholder="500001"
                                    value={locData.pincode}
                                    onChange={(e) => {
                                        setLocData({ ...locData, pincode: e.target.value });
                                        if (errors.pincode) setErrors({ ...errors, pincode: "" });
                                    }}
                                />
                                {errors.pincode && <div className="rest-error-text">{errors.pincode}</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: Business Details */}
                {currentStep === 4 && (
                    <div className="rest-step-content">
                        <h2 className="rest-step-heading">
                            <FaBriefcase style={{ color: "#ff5200" }} /> Step 4: Business Details & Timings
                        </h2>
                        <p className="rest-step-description">
                            Set your daily operating hours and delivery preferences.
                        </p>

                        <div className="rest-form-grid">
                            <div className="rest-form-group">
                                <label className="rest-label">
                                    Opening Time <span className="rest-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    placeholder="09:00 AM"
                                    value={bizData.openingTime}
                                    onChange={(e) => setBizData({ ...bizData, openingTime: e.target.value })}
                                />
                            </div>

                            <div className="rest-form-group">
                                <label className="rest-label">
                                    Closing Time <span className="rest-required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="rest-input"
                                    placeholder="11:00 PM"
                                    value={bizData.closingTime}
                                    onChange={(e) => setBizData({ ...bizData, closingTime: e.target.value })}
                                />
                            </div>

                            <div className="rest-form-group">
                                <label className="rest-label">Minimum Order Amount (₹)</label>
                                <input
                                    type="number"
                                    className="rest-input"
                                    value={bizData.minimumOrderAmount}
                                    onChange={(e) => setBizData({ ...bizData, minimumOrderAmount: e.target.value })}
                                />
                            </div>

                            <div className="rest-form-group">
                                <label className="rest-label">Delivery Fee (₹)</label>
                                <input
                                    type="number"
                                    className="rest-input"
                                    value={bizData.deliveryFee}
                                    onChange={(e) => setBizData({ ...bizData, deliveryFee: e.target.value })}
                                />
                            </div>

                            <div className="rest-form-group full-width">
                                <label className="rest-switch-container">
                                    <input
                                        type="checkbox"
                                        className="rest-switch-input"
                                        checked={bizData.deliveryAvailable}
                                        onChange={(e) => setBizData({ ...bizData, deliveryAvailable: e.target.checked })}
                                    />
                                    <div>
                                        <strong>Enable Online Delivery Orders</strong>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                                            Allow FoodExpress riders to pick up and deliver your orders to nearby customers.
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5: Menu Setup */}
                {currentStep === 5 && (
                    <div className="rest-step-content">
                        <h2 className="rest-step-heading">
                            <FaUtensils style={{ color: "#ff5200" }} /> Step 5: Initial Menu Setup
                        </h2>
                        <p className="rest-step-description">
                            Add a couple of your best-selling dishes to help admin review your menu. (You can add and manage more anytime in the dashboard).
                        </p>

                        {/* List of current dishes */}
                        <div className="rest-menu-list">
                            {menuItems.map((dish, idx) => (
                                <div key={idx} className="rest-menu-card">
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span>{dish.isVeg ? "🟢" : "🔴"}</span>
                                            <strong>{dish.name}</strong>
                                            <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "10px", color: "#475569" }}>
                                                {dish.category}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
                                            ₹{dish.price} • {dish.description}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveDish(idx)}
                                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "8px" }}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add Dish Form */}
                        <div className="rest-menu-item-box">
                            <h4 style={{ margin: "0 0 12px", fontSize: "14px", color: "#0f172a" }}>+ Add Another Dish</h4>
                            <div className="rest-form-grid">
                                <div className="rest-form-group">
                                    <label className="rest-label">Dish Name</label>
                                    <input
                                        type="text"
                                        className="rest-input"
                                        placeholder="e.g. Butter Naan"
                                        value={newDish.name}
                                        onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                                    />
                                </div>
                                <div className="rest-form-group">
                                    <label className="rest-label">Category</label>
                                    <select
                                        className="rest-select"
                                        value={newDish.category}
                                        onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                                    >
                                        <option value="Biryani">Biryani</option>
                                        <option value="Pizza">Pizza</option>
                                        <option value="Burger">Burger</option>
                                        <option value="North Indian">North Indian</option>
                                        <option value="South Indian">South Indian</option>
                                        <option value="Chinese">Chinese</option>
                                        <option value="Fast Food">Fast Food</option>
                                        <option value="Desserts">Desserts</option>
                                        <option value="Beverages">Beverages</option>
                                    </select>
                                </div>
                                <div className="rest-form-group">
                                    <label className="rest-label">Price (₹)</label>
                                    <input
                                        type="number"
                                        className="rest-input"
                                        placeholder="120"
                                        value={newDish.price}
                                        onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                                    />
                                </div>
                                <div className="rest-form-group">
                                    <label className="rest-label">Dietary Type</label>
                                    <select
                                        className="rest-select"
                                        value={newDish.isVeg ? "true" : "false"}
                                        onChange={(e) => setNewDish({ ...newDish, isVeg: e.target.value === "true" })}
                                    >
                                        <option value="true">Veg 🟢</option>
                                        <option value="false">Non-Veg 🔴</option>
                                    </select>
                                </div>
                                <div className="rest-form-group full-width">
                                    <label className="rest-label">Description</label>
                                    <input
                                        type="text"
                                        className="rest-input"
                                        placeholder="Short description of ingredients or taste"
                                        value={newDish.description}
                                        onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddDish}
                                style={{
                                    marginTop: "12px",
                                    padding: "8px 18px",
                                    borderRadius: "8px",
                                    background: "#334155",
                                    color: "#fff",
                                    border: "none",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px"
                                }}
                            >
                                <FaPlus size={12} /> Add to Initial Menu
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 6: Preview */}
                {currentStep === 6 && (
                    <div className="rest-step-content">
                        <h2 className="rest-step-heading">
                            <FaEye style={{ color: "#ff5200" }} /> Step 6: Review Application Details
                        </h2>
                        <p className="rest-step-description">
                            Double check your details before final submission.
                        </p>

                        <div className="rest-preview-section">
                            <h4>Owner Details</h4>
                            <div className="rest-preview-grid">
                                <div><span>Full Name</span><strong>{ownerData.fullName}</strong></div>
                                <div><span>Email</span><strong>{ownerData.email}</strong></div>
                                <div><span>Phone</span><strong>{ownerData.phone}</strong></div>
                            </div>
                        </div>

                        <div className="rest-preview-section">
                            <h4>Restaurant Profile</h4>
                            <div className="rest-preview-grid">
                                <div><span>Restaurant Name</span><strong>{restData.name}</strong></div>
                                <div><span>Contact Phone</span><strong>{restData.phone}</strong></div>
                                <div><span>Official Email</span><strong>{restData.email}</strong></div>
                                <div><span>Restaurant Type</span><strong>{restData.restaurantType}</strong></div>
                                <div><span>Cuisines</span><strong>{restData.cuisineTypes.join(", ")}</strong></div>
                            </div>
                        </div>

                        <div className="rest-preview-section">
                            <h4>Location & Hours</h4>
                            <div className="rest-preview-grid">
                                <div><span>Address</span><strong>{locData.street}, {locData.city}</strong></div>
                                <div><span>State & Pincode</span><strong>{locData.state} - {locData.pincode}</strong></div>
                                <div><span>Timings</span><strong>{bizData.openingTime} - {bizData.closingTime}</strong></div>
                                <div><span>Minimum Order</span><strong>₹{bizData.minimumOrderAmount}</strong></div>
                                <div><span>Delivery Fee</span><strong>₹{bizData.deliveryFee}</strong></div>
                            </div>
                        </div>

                        <div className="rest-preview-section">
                            <h4>Initial Menu Sample ({menuItems.length} Dishes)</h4>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "6px" }}>
                                {menuItems.map((dish, i) => (
                                    <div key={i} style={{ background: "#fff", padding: "4px 10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}>
                                        {dish.isVeg ? "🟢" : "🔴"} {dish.name} (₹{dish.price})
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 7: Submit */}
                {currentStep === 7 && (
                    <div className="rest-step-content">
                        <h2 className="rest-step-heading">
                            <FaCheckCircle style={{ color: "#10b981" }} /> Step 7: Submit Restaurant Application
                        </h2>
                        <p className="rest-step-description">
                            You're almost there! Once submitted, our operations team will review and approve your store.
                        </p>

                        <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                            <h4 style={{ margin: "0 0 10px", color: "#0f172a" }}>FoodExpress Partner Agreement</h4>
                            <ul style={{ margin: 0, paddingLeft: "20px", color: "#475569", fontSize: "13px", lineHeight: "1.7" }}>
                                <li>You agree to keep ingredient quality, cleanliness, and food hygiene standards high.</li>
                                <li>You will fulfill customer orders promptly within promised preparation times.</li>
                                <li>FoodExpress fee structure and regular payment disbursements will apply.</li>
                                <li>Admin approval is required before your store is publicly listed on customer apps.</li>
                            </ul>

                            <div style={{ marginTop: "18px" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px", color: "#0f172a" }}>
                                    <input
                                        type="checkbox"
                                        checked={agreedToTerms}
                                        onChange={(e) => {
                                            setAgreedToTerms(e.target.checked);
                                            if (errors.terms) setErrors({ ...errors, terms: "" });
                                        }}
                                        style={{ width: "18px", height: "18px", accentColor: "#ff5200" }}
                                    />
                                    I agree to the FoodExpress Restaurant Partner Terms & Conditions.
                                </label>
                                {errors.terms && <div className="rest-error-text" style={{ marginTop: "6px" }}>{errors.terms}</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Actions */}
                <div className="rest-actions-row">
                    <button
                        type="button"
                        className="btn-rest-back"
                        onClick={handleBack}
                        disabled={currentStep === 1 || loading}
                    >
                        <FaArrowLeft /> Back
                    </button>

                    {currentStep < 7 ? (
                        <button
                            type="button"
                            className="btn-rest-continue"
                            onClick={handleNext}
                            disabled={loading}
                        >
                            Continue <FaArrowRight />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn-rest-continue"
                            onClick={handleSubmitApplication}
                            disabled={loading || !agreedToTerms}
                            style={{ background: "#10b981" }}
                        >
                            {loading ? "Submitting Application..." : "Submit Restaurant Application ✓"}
                        </button>
                    )}
                </div>

                {/* Login link */}
                <div className="rest-login-prompt">
                    Already a registered Restaurant Partner?{" "}
                    <Link to="/restaurant/login">Log in to Restaurant Portal</Link>
                </div>
            </div>
        </div>
    );
};

export default RestaurantRegister;
