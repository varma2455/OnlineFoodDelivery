import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { foodAPI } from "../../services/api";
import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
import FoodPreview from "./components/FoodPreview";
import CustomizationSection from "./components/CustomizationSection";
import RadioOption from "./components/RadioOption";
import CheckboxOption from "./components/CheckboxOption";
import QuantitySelector from "./components/QuantitySelector";
import PriceSummary from "./components/PriceSummary";
import "./FoodCustomizationPage.css";

import {
    FaArrowLeft,
    FaHeart,
    FaRegHeart,
    FaExclamationCircle,
    FaRedo,
    FaUtensils,
    FaCheck,
    FaStore
} from "react-icons/fa";

export default function FoodCustomizationPage() {
    const params = useParams();
    const foodId = params.foodId || params.id;
    const navigate = useNavigate();
    const location = useLocation();

    const {
        foodList = [],
        wishlist = [],
        toggleWishlist,
        addToCart,
        token,
        showToast
    } = useContext(StoreContext);

    // Food & Loading States
    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const [addedSuccess, setAddedSuccess] = useState(false);

    // Exact 15-field customization state requirement
    const [customization, setCustomization] = useState({
        size: null,
        quantity: 1,
        crust: null,
        toppings: [],
        bun: null,
        rice: null,
        spice: null,
        noodlesType: null,
        dressing: null,
        iceLevel: null,
        sugarLevel: null,
        milkOption: null,
        portion: null,
        topping: null,
        extras: []
    });

    // Check favorite status
    const isFavorite = useMemo(() => {
        return food?._id ? wishlist.includes(food._id) : false;
    }, [food, wishlist]);

    // Fetch Food from MongoDB backend API
    const loadFoodItem = useCallback(async () => {
        if (!foodId) {
            setError("No food item ID provided.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setValidationError(null);

            // 1. Try to fetch from backend API
            let fetchedFood = null;
            try {
                const res = await foodAPI.getFoodById(foodId);
                if (res?.data?.food) {
                    fetchedFood = res.data.food;
                }
            } catch (apiErr) {
                // If ID is numeric or fallback needed, look up in StoreContext.foodList
                console.warn("Backend getFoodById fallback:", apiErr.message);
            }

            // 2. Fallback to StoreContext.foodList
            if (!fetchedFood && foodList.length > 0) {
                fetchedFood = foodList.find(
                    (f) => f._id === foodId || String(f.id) === String(foodId)
                );
            }

            // 3. Fallback from router location state if available
            if (!fetchedFood && location.state?.food) {
                fetchedFood = location.state.food;
            }

            if (!fetchedFood) {
                setError("Food item not found. It may have been discontinued or removed.");
                setLoading(false);
                return;
            }

            setFood(fetchedFood);

            // Initialize default customization values from configuration
            const config = fetchedFood.customizationOptions || {};
            const initialObj = {
                size: null,
                quantity: 1,
                crust: null,
                toppings: [],
                bun: null,
                rice: null,
                spice: null,
                noodlesType: null,
                dressing: null,
                iceLevel: null,
                sugarLevel: null,
                milkOption: null,
                portion: null,
                topping: null,
                extras: []
            };

            // Pre-select defaults for radio sections
            if (Array.isArray(config.sections)) {
                config.sections.forEach((sec) => {
                    const field = sec.field;
                    if (sec.type === "radio" && Array.isArray(sec.options)) {
                        const defaultOpt = sec.options.find((o) => o.isDefault) || (sec.required ? sec.options[0] : null);
                        if (defaultOpt) {
                            initialObj[field] = defaultOpt.name;
                        }
                    }
                });
            }

            setCustomization(initialObj);
        } catch (err) {
            console.error("Error loading food for customization:", err);
            setError("Unable to load customization options. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }, [foodId, foodList, location.state]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        loadFoodItem();
    }, [loadFoodItem]);

    // Handle single-select radio options
    const handleSelectRadioOption = (field, optionName) => {
        setValidationError(null);
        setAddedSuccess(false);
        setCustomization((prev) => ({
            ...prev,
            [field]: optionName
        }));
    };

    // Handle multi-select checkbox options (toppings, extras)
    const handleToggleCheckboxOption = (field, optionName) => {
        setValidationError(null);
        setAddedSuccess(false);
        setCustomization((prev) => {
            const currentList = Array.isArray(prev[field]) ? prev[field] : [];
            const exists = currentList.includes(optionName);
            const updated = exists
                ? currentList.filter((item) => item !== optionName)
                : [...currentList, optionName];
            return {
                ...prev,
                [field]: updated
            };
        });
    };

    // Handle Quantity Changes
    const handleQuantityChange = (newQty) => {
        const qty = Math.max(1, Math.min(20, Number(newQty) || 1));
        setCustomization((prev) => ({
            ...prev,
            quantity: qty
        }));
    };

    // Effective Base Price
    const basePrice = useMemo(() => {
        if (!food) return 0;
        return food.discountPrice && food.discountPrice > 0 ? food.discountPrice : food.price;
    }, [food]);

    // Real-Time Total Price Calculation
    const { unitPrice, totalPrice, selectedBreakdown } = useMemo(() => {
        if (!food) return { unitPrice: 0, totalPrice: 0, selectedBreakdown: [] };

        let extraCharges = 0;
        const breakdown = [];
        const sections = food.customizationOptions?.sections || [];

        sections.forEach((sec) => {
            const field = sec.field;
            const val = customization[field];

            if (sec.type === "radio" && val) {
                const match = sec.options?.find(
                    (opt) => opt.name.toLowerCase() === val.toLowerCase()
                );
                if (match) {
                    const priceDiff = Number(match.price) || 0;
                    extraCharges += priceDiff;
                    breakdown.push({
                        label: sec.title,
                        choice: match.name,
                        price: priceDiff
                    });
                }
            } else if (sec.type === "checkbox" && Array.isArray(val) && val.length > 0) {
                val.forEach((itemName) => {
                    const match = sec.options?.find(
                        (opt) => opt.name.toLowerCase() === itemName.toLowerCase()
                    );
                    if (match) {
                        const priceDiff = Number(match.price) || 0;
                        extraCharges += priceDiff;
                        breakdown.push({
                            label: sec.title,
                            choice: match.name,
                            price: priceDiff
                        });
                    }
                });
            }
        });

        const calculatedUnitPrice = Math.max(1, basePrice + extraCharges);
        const calculatedTotalPrice = calculatedUnitPrice * (customization.quantity || 1);

        return {
            unitPrice: calculatedUnitPrice,
            totalPrice: calculatedTotalPrice,
            selectedBreakdown: breakdown
        };
    }, [food, basePrice, customization]);

    // Validate Required Options Before Adding to Cart
    const validateSelections = () => {
        const sections = food?.customizationOptions?.sections || [];
        for (const sec of sections) {
            const field = sec.field;
            const val = customization[field];

            if (sec.type === "radio" && sec.required && !val) {
                return `Please choose an option for "${sec.title}".`;
            }

            if (sec.type === "checkbox" && sec.required && (!Array.isArray(val) || val.length === 0)) {
                return `Please choose at least one option for "${sec.title}".`;
            }
        }
        return null;
    };

    // Add Customized Item to Cart
    const handleAddToCart = async () => {
        setValidationError(null);

        // 1. Validation check
        const errorMsg = validateSelections();
        if (errorMsg) {
            setValidationError(errorMsg);
            if (showToast) showToast(errorMsg, "warning");
            return;
        }

        // 2. Authentication check
        if (!token) {
            if (showToast) showToast("Please log in to add customized food to your cart.", "info");
            navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
            return;
        }

        try {
            setIsSubmitting(true);

            // Normalized payload with exact 15 fields
            const payloadCustomization = {
                size: customization.size || null,
                quantity: customization.quantity || 1,
                crust: customization.crust || null,
                toppings: Array.isArray(customization.toppings) ? customization.toppings : [],
                bun: customization.bun || null,
                rice: customization.rice || null,
                spice: customization.spice || null,
                noodlesType: customization.noodlesType || null,
                dressing: customization.dressing || null,
                iceLevel: customization.iceLevel || null,
                sugarLevel: customization.sugarLevel || null,
                milkOption: customization.milkOption || null,
                portion: customization.portion || null,
                topping: customization.topping || null,
                extras: Array.isArray(customization.extras) ? customization.extras : []
            };

            await addToCart(
                food._id,
                customization.quantity || 1,
                payloadCustomization,
                unitPrice
            );

            setAddedSuccess(true);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Failed to add item to cart.";
            setValidationError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Navigation Back
    const handleBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate("/browse-food");
        }
    };

    return (
        <div className="customization-page-shell">
            {/* Left 250px Persistent Dashboard Sidebar */}
            <DashboardSidebar />

            <main className="customization-main-viewport">
                {/* Sticky Header Bar */}
                <header className="customization-top-header">
                    <button
                        type="button"
                        className="header-circle-btn back-btn"
                        onClick={handleBack}
                        aria-label="Go back to previous page"
                    >
                        <FaArrowLeft />
                    </button>

                    <div className="header-breadcrumbs-cluster">
                        <div className="header-meta-crumbs">
                            <Link to="/browse-food">Browse Food</Link>
                            {food?.category && (
                                <>
                                    <span className="crumb-sep">/</span>
                                    <Link to={`/category/${food.category.toLowerCase().replace(/\s+/g, "-")}`}>
                                        {food.category}
                                    </Link>
                                </>
                            )}
                            <span className="crumb-sep">/</span>
                            <span className="crumb-current">Customize</span>
                        </div>
                        <h2 className="header-food-name">
                            {loading ? "Loading Food Item..." : food?.name || "Customize Food"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        className={`header-circle-btn favorite-btn ${isFavorite ? "active" : ""}`}
                        onClick={() => food?._id && toggleWishlist(food._id)}
                        aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        {isFavorite ? <FaHeart className="heart-filled" /> : <FaRegHeart />}
                    </button>
                </header>

                {/* SKELETON LOADING STATE */}
                {loading && (
                    <div className="customization-grid-container skeleton-layout">
                        <div className="preview-column">
                            <div className="skeleton-box skeleton-img shimmer" />
                            <div className="skeleton-box skeleton-card shimmer" />
                        </div>
                        <div className="options-column">
                            <div className="skeleton-line shimmer title" />
                            <div className="skeleton-line shimmer desc" />
                            <div className="skeleton-line shimmer price" />
                            <div className="skeleton-box skeleton-section shimmer" />
                            <div className="skeleton-box skeleton-section shimmer" />
                            <div className="skeleton-box skeleton-bar shimmer" />
                        </div>
                    </div>
                )}

                {/* ERROR STATE */}
                {!loading && error && (
                    <div className="customization-error-state">
                        <div className="error-glyph">
                            <FaExclamationCircle />
                        </div>
                        <h2>{error}</h2>
                        <p>We couldn't retrieve the food customization options for this item.</p>
                        <div className="error-actions">
                            <button
                                type="button"
                                className="btn-retry"
                                onClick={loadFoodItem}
                            >
                                <FaRedo /> Retry
                            </button>
                            <button
                                type="button"
                                className="btn-back-browse"
                                onClick={() => navigate("/browse-food")}
                            >
                                Back to Browse Food
                            </button>
                        </div>
                    </div>
                )}

                {/* MAIN LOADED CONTENT */}
                {!loading && !error && food && (
                    <div className="customization-grid-container">
                        {/* LEFT COLUMN: Food Image Card, Rating, Delivery & Info */}
                        <div className="preview-column sticky-preview">
                            <FoodPreview food={food} />
                        </div>

                        {/* RIGHT COLUMN: Customization Panel */}
                        <div className="options-column">
                            {/* Food Title & Restaurant Information */}
                            <div className="food-title-banner">
                                <div className="restaurant-tag">
                                    <FaStore /> {food.restaurant || "FoodExpress Cloud Kitchen"}
                                    <span className="verified-glyph" title="Verified Restaurant">✓</span>
                                </div>
                                <h1 className="food-main-heading">{food.name}</h1>
                                <p className="food-main-description">{food.description}</p>

                                <div className="base-price-display">
                                    <span className="base-price-label">Base Price:</span>
                                    <strong className="base-price-value">₹{basePrice}</strong>
                                    {food.discountPrice > 0 && food.price > food.discountPrice && (
                                        <span className="original-price-strike">₹{food.price}</span>
                                    )}
                                </div>
                            </div>

                            {/* DYNAMIC CUSTOMIZATION SECTIONS */}
                            <div className="dynamic-sections-container">
                                {food.customizationOptions?.sections?.map((section) => {
                                    const field = section.field;
                                    const isRadio = section.type === "radio";
                                    const isCheckbox = section.type === "checkbox";

                                    return (
                                        <CustomizationSection
                                            key={section.id || field}
                                            title={section.title}
                                            required={section.required}
                                            subtitle={
                                                isRadio
                                                    ? "Please choose one option"
                                                    : "Select as many as you like"
                                            }
                                        >
                                            {isRadio && (
                                                <div className="radio-options-wrapper">
                                                    {section.options?.map((opt) => (
                                                        <RadioOption
                                                            key={opt.name}
                                                            name={opt.name}
                                                            description={opt.description}
                                                            price={opt.price}
                                                            isSelected={
                                                                customization[field]?.toLowerCase() === opt.name.toLowerCase()
                                                            }
                                                            onSelect={() => handleSelectRadioOption(field, opt.name)}
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {isCheckbox && (
                                                <div className="checkbox-options-grid">
                                                    {section.options?.map((opt) => (
                                                        <CheckboxOption
                                                            key={opt.name}
                                                            name={opt.name}
                                                            description={opt.description}
                                                            price={opt.price}
                                                            isSelected={
                                                                Array.isArray(customization[field]) &&
                                                                customization[field].some(
                                                                    (i) => i.toLowerCase() === opt.name.toLowerCase()
                                                                )
                                                            }
                                                            onToggle={() => handleToggleCheckboxOption(field, opt.name)}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </CustomizationSection>
                                    );
                                })}

                                {/* Fallback if no sections exist */}
                                {(!food.customizationOptions?.sections || food.customizationOptions.sections.length === 0) && (
                                    <div className="no-customization-notice">
                                        <FaUtensils />
                                        <p>This delicious item is prepared fresh as per chef's signature recipe.</p>
                                    </div>
                                )}
                            </div>

                            {/* QUANTITY SELECTOR */}
                            <div className="quantity-wrapper-card">
                                <QuantitySelector
                                    quantity={customization.quantity}
                                    onChange={handleQuantityChange}
                                />
                            </div>

                            {/* PRICE SUMMARY & ADD TO CART BAR */}
                            <PriceSummary
                                basePrice={basePrice}
                                unitPrice={unitPrice}
                                quantity={customization.quantity}
                                totalPrice={totalPrice}
                                onAddToCart={handleAddToCart}
                                isSubmitting={isSubmitting}
                                validationError={validationError}
                                addedSuccess={addedSuccess}
                                onViewCart={() => navigate("/cart")}
                                onContinueShopping={() => navigate("/browse-food")}
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
