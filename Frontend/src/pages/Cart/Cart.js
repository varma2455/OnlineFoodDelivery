import React, { useContext, useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { cartAPI, getFoodImageUrl } from "../../services/api";
import "./Cart.css";
import {
    FaPlus,
    FaMinus,
    FaTrash,
    FaShoppingBag,
    FaArrowLeft,
    FaArrowRight,
    FaTag,
    FaShieldAlt,
    FaMapMarkerAlt,
    FaStore,
    FaStar,
    FaWallet,
    FaGift,
    FaUtensils,
    FaExclamationTriangle,
    FaCheck,
    FaSyncAlt
} from "react-icons/fa";

const QUICK_COUPONS = [
    { code: "FIRST30", desc: "30% OFF up to ₹200 on your first orders" },
    { code: "FOOD20", desc: "20% OFF up to ₹150 on any order" },
    { code: "WELCOME40", desc: "40% OFF up to ₹160 welcome delight" }
];

const Cart = () => {
    const {
        cartItems,
        serverCart,
        loadingCart,
        fetchCart,
        foodList,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        deleteFromCart,
        clearCart,
        getTotalCartAmount,
        deliveryFee: contextDeliveryFee,
        taxes: contextTaxes,
        discountAmount: contextDiscount,
        couponCode,
        applyCoupon,
        removeCoupon,
        grandTotal: contextGrandTotal,
        user,
        selectedArea,
        showToast
    } = useContext(StoreContext);

    const navigate = useNavigate();
    const [couponInput, setCouponInput] = useState("");
    const [fetchError, setFetchError] = useState(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [actionInProgress, setActionInProgress] = useState(false);

    // Initial cart synchronization from backend
    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                setFetchError(null);
                if (fetchCart) {
                    await fetchCart();
                }
            } catch (err) {
                if (isMounted) {
                    setFetchError(err.message || "Failed to load cart items.");
                }
            }
        };
        load();
        return () => {
            isMounted = false;
        };
    }, [fetchCart]);

    // Build complete list of ALL carted items (server populated + local items)
    const unifiedCartItems = useMemo(() => {
        const list = [];
        const seenFoodIds = new Set();

        // 1. Items from MongoDB Cart (populated with food & customizations)
        if (Array.isArray(serverCart) && serverCart.length > 0) {
            serverCart.forEach((item) => {
                const foodDoc = item.food;
                if (!foodDoc) return;
                const foodId = (foodDoc._id || foodDoc).toString();
                seenFoodIds.add(foodId);

                const unitPrice =
                    item.price !== undefined && Number(item.price) > 0
                        ? Number(item.price)
                        : foodDoc.discountPrice && foodDoc.discountPrice > 0
                        ? foodDoc.discountPrice
                        : foodDoc.price || 0;

                const qty = Math.max(1, Number(item.quantity) || 1);

                list.push({
                    id: item._id || foodId,
                    cartDocId: item._id,
                    foodId,
                    name: foodDoc.name || "Food Item",
                    image: foodDoc.image,
                    restaurant: foodDoc.restaurant || "FoodExpress Cloud Kitchen",
                    rating: foodDoc.rating || 4.6,
                    isVeg: foodDoc.isVeg !== undefined ? foodDoc.isVeg : true,
                    category: item.foodType || foodDoc.category || "General",
                    price: unitPrice,
                    quantity: qty,
                    subtotal: item.subtotal || unitPrice * qty,
                    customization: item.customization || {},
                    isServerItem: true
                });
            });
        }

        // 2. Items from local StoreContext / localStorage (for guests or local adds)
        Object.entries(cartItems || {}).forEach(([foodId, qty]) => {
            if (qty <= 0) return;
            if (seenFoodIds.has(foodId)) return; // Already included from server

            const food = (foodList || []).find((f) => f._id === foodId);
            if (!food) return;

            const unitPrice =
                food.discountPrice && food.discountPrice > 0 ? food.discountPrice : food.price;

            list.push({
                id: food._id,
                cartDocId: null,
                foodId: food._id,
                name: food.name,
                image: food.image,
                restaurant: food.restaurant || "FoodExpress Cloud Kitchen",
                rating: food.rating || 4.5,
                isVeg: food.isVeg !== undefined ? food.isVeg : true,
                category: food.category || "General",
                price: unitPrice,
                quantity: qty,
                subtotal: unitPrice * qty,
                customization: {},
                isServerItem: false
            });
        });

        return list;
    }, [serverCart, cartItems, foodList]);

    // Group items by restaurant
    const itemsByRestaurant = useMemo(() => {
        const groups = {};
        unifiedCartItems.forEach((item) => {
            const rest = item.restaurant || "FoodExpress Cloud Kitchen";
            if (!groups[rest]) {
                groups[rest] = [];
            }
            groups[rest].push(item);
        });
        return groups;
    }, [unifiedCartItems]);

    // Financial calculations
    const subtotal = useMemo(() => {
        return unifiedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, [unifiedCartItems]);

    const deliveryFee = useMemo(() => {
        if (subtotal === 0) return 0;
        return subtotal >= 500 ? 0 : 40;
    }, [subtotal]);

    const taxes = useMemo(() => {
        return Math.round(subtotal * 0.05); // 5% GST standard
    }, [subtotal]);

    const discountAmount = useMemo(() => {
        if (!couponCode) return 0;
        if (contextDiscount > 0) return contextDiscount;
        const code = couponCode.toUpperCase().trim();
        if (code === "FIRST30") return Math.min(Math.round(subtotal * 0.3), 200);
        if (code === "WELCOME40") return Math.min(Math.round(subtotal * 0.4), 160);
        if (code === "FOOD20") return Math.min(Math.round(subtotal * 0.2), 150);
        if (code === "FREEDEL") return deliveryFee;
        if (subtotal >= 1000) return Math.floor(subtotal * 0.1);
        return 0;
    }, [couponCode, subtotal, deliveryFee, contextDiscount]);

    const grandTotal = useMemo(() => {
        if (subtotal === 0) return 0;
        return Math.max(0, subtotal + deliveryFee + taxes - discountAmount);
    }, [subtotal, deliveryFee, taxes, discountAmount]);

    const totalItemCount = useMemo(() => {
        return unifiedCartItems.reduce((acc, item) => acc + item.quantity, 0);
    }, [unifiedCartItems]);

    // Handlers for quantity
    const handleIncreaseQuantity = async (item) => {
        const nextQty = item.quantity + 1;
        try {
            if (item.cartDocId) {
                await cartAPI.updateCartItem(item.cartDocId, nextQty);
            } else {
                updateCartQuantity(item.foodId, nextQty);
            }
            if (fetchCart) fetchCart();
        } catch (err) {
            updateCartQuantity(item.foodId, nextQty);
        }
    };

    const handleDecreaseQuantity = async (item) => {
        const nextQty = item.quantity - 1;
        if (nextQty <= 0) {
            handleDeleteItem(item);
            return;
        }
        try {
            if (item.cartDocId) {
                await cartAPI.updateCartItem(item.cartDocId, nextQty);
            } else {
                updateCartQuantity(item.foodId, nextQty);
            }
            if (fetchCart) fetchCart();
        } catch (err) {
            updateCartQuantity(item.foodId, nextQty);
        }
    };

    const handleDeleteItem = async (item) => {
        try {
            if (item.cartDocId) {
                await cartAPI.removeCartItem(item.cartDocId);
            } else {
                deleteFromCart(item.foodId);
            }
            if (fetchCart) fetchCart();
        } catch (err) {
            deleteFromCart(item.foodId);
        }
    };

    const handleClearEntireCart = async () => {
        if (window.confirm("Are you sure you want to remove all items from your cart?")) {
            await clearCart();
            if (fetchCart) fetchCart();
        }
    };

    const handleApplyCoupon = (e) => {
        e?.preventDefault();
        const code = (couponInput || "").trim().toUpperCase();
        if (!code) return;
        setIsApplyingCoupon(true);
        applyCoupon(code);
        setCouponInput("");
        setIsApplyingCoupon(false);
    };

    const handleQuickApplyCoupon = (code) => {
        applyCoupon(code);
    };

    const handleProceedToCheckout = () => {
        if (unifiedCartItems.length === 0) {
            showToast("Your cart is empty. Please add delicious food to checkout.", "warning");
            return;
        }
        if (!user) {
            showToast("Please log in to proceed with checkout.", "info");
            navigate("/login?redirect=checkout");
        } else {
            navigate("/checkout");
        }
    };

    // Render customizations neatly
    const renderCustomizationDetails = (customization = {}) => {
        if (!customization || typeof customization !== "object") return null;

        const badges = [];
        if (customization.size) badges.push({ label: "Size", value: customization.size });
        if (customization.crust) badges.push({ label: "Crust", value: customization.crust });
        if (Array.isArray(customization.toppings) && customization.toppings.length > 0) {
            badges.push({ label: "Toppings", value: customization.toppings.join(", ") });
        }
        if (customization.bun) badges.push({ label: "Bun", value: customization.bun });
        if (customization.spice) badges.push({ label: "Spice", value: customization.spice });
        if (customization.rice) badges.push({ label: "Rice", value: customization.rice });
        if (customization.noodlesType) badges.push({ label: "Noodles", value: customization.noodlesType });
        if (customization.dressing) badges.push({ label: "Dressing", value: customization.dressing });
        if (customization.sugarLevel) badges.push({ label: "Sugar", value: customization.sugarLevel });
        if (customization.iceLevel) badges.push({ label: "Ice", value: customization.iceLevel });
        if (customization.milkOption) badges.push({ label: "Milk", value: customization.milkOption });
        if (customization.portion) badges.push({ label: "Portion", value: customization.portion });
        if (customization.topping) badges.push({ label: "Topping", value: customization.topping });
        if (Array.isArray(customization.extras) && customization.extras.length > 0) {
            badges.push({ label: "Extras", value: customization.extras.join(", ") });
        }

        // Generic check for any other customization key
        Object.entries(customization).forEach(([k, v]) => {
            if (
                !["size", "crust", "toppings", "bun", "spice", "rice", "noodlesType", "dressing", "sugarLevel", "iceLevel", "milkOption", "portion", "topping", "extras", "quantity"].includes(k) &&
                v &&
                typeof v !== "object"
            ) {
                badges.push({ label: k.charAt(0).toUpperCase() + k.slice(1), value: String(v) });
            }
        });

        if (badges.length === 0) return null;

        return (
            <div className="cart-item-customizations">
                {badges.map((b, idx) => (
                    <span key={idx} className="customization-tag">
                        <strong>{b.label}:</strong> {b.value}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="cart-page-wrapper">
            <div className="cart-page-container">
                {/* 1. Header Section */}
                <header className="cart-page-header">
                    <div className="header-text-cluster">
                        <div className="header-badge">
                            <FaShoppingBag /> FoodExpress Cart
                        </div>
                        <h1 className="cart-main-title">My Cart</h1>
                        <p className="cart-main-subtitle">
                            Review your selected food items before checkout.
                        </p>
                    </div>

                    <div className="header-meta-cluster">
                        <div className="cart-count-pill">
                            <span className="count-number">{totalItemCount}</span>
                            <span className="count-label">
                                {totalItemCount === 1 ? "Item" : "Items"}
                            </span>
                        </div>
                        {unifiedCartItems.length > 0 && (
                            <button
                                type="button"
                                className="btn-clear-cart"
                                onClick={handleClearEntireCart}
                                title="Clear all items from cart"
                            >
                                <FaTrash /> Clear Cart
                            </button>
                        )}
                    </div>
                </header>

                {/* 2. Loading State */}
                {loadingCart && unifiedCartItems.length === 0 ? (
                    <div className="cart-loading-state">
                        <div className="skeleton-item-card">
                            <div className="skeleton-thumb shimmer" />
                            <div className="skeleton-info">
                                <div className="skeleton-line long shimmer" />
                                <div className="skeleton-line mid shimmer" />
                                <div className="skeleton-line short shimmer" />
                            </div>
                        </div>
                        <div className="skeleton-item-card">
                            <div className="skeleton-thumb shimmer" />
                            <div className="skeleton-info">
                                <div className="skeleton-line long shimmer" />
                                <div className="skeleton-line mid shimmer" />
                                <div className="skeleton-line short shimmer" />
                            </div>
                        </div>
                    </div>
                ) : fetchError ? (
                    /* 3. Error State */
                    <div className="cart-error-card">
                        <FaExclamationTriangle className="error-icon" />
                        <h3>Unable to load your cart.</h3>
                        <p>{fetchError}</p>
                        <button
                            type="button"
                            className="btn-retry-cart"
                            onClick={() => {
                                setFetchError(null);
                                if (fetchCart) fetchCart();
                            }}
                        >
                            <FaSyncAlt /> Try Again
                        </button>
                    </div>
                ) : unifiedCartItems.length === 0 ? (
                    /* 4. Empty Cart State */
                    <div className="cart-empty-card">
                        <div className="empty-cart-icon">🛒</div>
                        <h2 className="empty-cart-title">Your cart is empty</h2>
                        <p className="empty-cart-subtitle">
                            Add delicious food to get started
                        </p>
                        <Link to="/browse-food" className="btn-browse-food-cta">
                            <FaUtensils /> Browse Food
                        </Link>
                    </div>
                ) : (
                    /* 5. Main Cart Workspace */
                    <div className="cart-workspace">
                        {/* LEFT COLUMN: LIST OF ALL CARTED ITEMS */}
                        <section className="cart-items-feed" aria-label="Cart Items">
                            {Object.entries(itemsByRestaurant).map(([restaurantName, items]) => (
                                <div key={restaurantName} className="restaurant-group-card">
                                    <div className="restaurant-card-header">
                                        <div className="rest-icon-wrap">
                                            <FaStore />
                                        </div>
                                        <div className="rest-details">
                                            <h3 className="rest-title">{restaurantName}</h3>
                                            <span className="rest-badge">
                                                {items.length} {items.length === 1 ? "dish" : "dishes"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="restaurant-dishes-list">
                                        {items.map((item) => (
                                            <article key={item.id} className="cart-item-card">
                                                {/* Dish Image */}
                                                <div className="cart-item-thumb-wrap">
                                                    <img
                                                        src={getFoodImageUrl(item.image)}
                                                        alt={item.name}
                                                        className="cart-item-thumb"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src =
                                                                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600";
                                                        }}
                                                    />
                                                    <div className={`diet-marker ${item.isVeg ? "veg" : "non-veg"}`} title={item.isVeg ? "Vegetarian" : "Non-Vegetarian"}>
                                                        <span className="diet-dot" />
                                                    </div>
                                                </div>

                                                {/* Dish Information */}
                                                <div className="cart-item-info">
                                                    <div className="cart-item-title-row">
                                                        <Link to={`/food/${item.foodId}`} className="cart-item-name-link">
                                                            <h4 className="cart-item-name">{item.name}</h4>
                                                        </Link>
                                                        {item.rating && (
                                                            <span className="dish-rating-pill">
                                                                <FaStar /> {Number(item.rating).toFixed(1)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="cart-item-meta-row">
                                                        <span className="cart-item-category-tag">
                                                            {item.category}
                                                        </span>
                                                        <span className="cart-item-unit-price">
                                                            ₹{item.price} each
                                                        </span>
                                                    </div>

                                                    {/* Customization Badges */}
                                                    {renderCustomizationDetails(item.customization)}

                                                    {/* Bottom Action Controls Row */}
                                                    <div className="cart-item-controls-row">
                                                        {/* Quantity stepper [-] QTY [+] */}
                                                        <div className="quantity-stepper" role="group" aria-label="Change quantity">
                                                            <button
                                                                type="button"
                                                                className="btn-step dec"
                                                                onClick={() => handleDecreaseQuantity(item)}
                                                                aria-label="Decrease quantity"
                                                                title="Decrease quantity"
                                                            >
                                                                <FaMinus />
                                                            </button>
                                                            <span className="qty-number" aria-live="polite">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                className="btn-step inc"
                                                                onClick={() => handleIncreaseQuantity(item)}
                                                                aria-label="Increase quantity"
                                                                title="Increase quantity"
                                                            >
                                                                <FaPlus />
                                                            </button>
                                                        </div>

                                                        {/* Total price & Delete Button */}
                                                        <div className="cart-item-subtotal-cluster">
                                                            <div className="cart-item-total-price">
                                                                <span className="total-curr">₹</span>
                                                                <span className="total-val">{item.price * item.quantity}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="btn-trash-item"
                                                                onClick={() => handleDeleteItem(item)}
                                                                aria-label={`Remove ${item.name} from cart`}
                                                                title="Remove item"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Additional Cart Bottom Actions */}
                            <div className="cart-feed-footer-actions">
                                <Link to="/browse-food" className="btn-continue-shopping">
                                    <FaArrowLeft /> Add More Items
                                </Link>
                            </div>
                        </section>

                        {/* RIGHT COLUMN: ORDER SUMMARY */}
                        <aside className="cart-summary-sidebar" aria-label="Order Summary">
                            <div className="order-summary-card">
                                <h3 className="summary-title">Order Summary</h3>

                                {/* Delivery Location Card */}
                                <div className="summary-location-box">
                                    <div className="location-pin-wrap">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div className="location-info">
                                        <span className="loc-label">Deliver to</span>
                                        <strong className="loc-address-text">
                                            {user?.address || selectedArea || "Hyderabad"}
                                        </strong>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-change-location"
                                        onClick={() => navigate("/profile")}
                                        title="Change delivery location"
                                    >
                                        Change
                                    </button>
                                </div>

                                {/* Price Breakdown */}
                                <div className="summary-line-items">
                                    <div className="summary-row">
                                        <span className="row-label">Subtotal</span>
                                        <span className="row-value">₹{subtotal}</span>
                                    </div>

                                    <div className="summary-row">
                                        <span className="row-label">Delivery Fee</span>
                                        <span className={`row-value ${deliveryFee === 0 ? "free-tag" : ""}`}>
                                            {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                                        </span>
                                    </div>
                                    {deliveryFee > 0 && (
                                        <div className="free-delivery-tip">
                                            💡 Add ₹{500 - subtotal} more to unlock <strong>FREE Delivery!</strong>
                                        </div>
                                    )}

                                    <div className="summary-row">
                                        <span className="row-label">Taxes & Packaging (5% GST)</span>
                                        <span className="row-value">₹{taxes}</span>
                                    </div>

                                    {discountAmount > 0 && (
                                        <div className="summary-row discount-row">
                                            <span className="row-label">Discount ({couponCode})</span>
                                            <span className="row-value">- ₹{discountAmount}</span>
                                        </div>
                                    )}

                                    <div className="summary-divider" />

                                    <div className="summary-row grand-total-row">
                                        <span className="row-label">Total Amount</span>
                                        <span className="row-value grand-total-val">₹{grandTotal}</span>
                                    </div>
                                </div>

                                {/* Wallet and Rewards Section */}
                                {user && (
                                    <div className="summary-wallet-rewards-box">
                                        <div className="wallet-card-item">
                                            <div className="item-icon-wrap wallet">
                                                <FaWallet />
                                            </div>
                                            <div className="item-info">
                                                <span className="item-title">FoodExpress Wallet</span>
                                                <small className="item-sub">Available Balance</small>
                                            </div>
                                            <strong className="item-balance">
                                                ₹{Number(user.wallet || 0).toLocaleString("en-IN")}
                                            </strong>
                                        </div>

                                        <div className="wallet-card-item">
                                            <div className="item-icon-wrap rewards">
                                                <FaGift />
                                            </div>
                                            <div className="item-info">
                                                <span className="item-title">Rewards</span>
                                                <small className="item-sub">Available Points</small>
                                            </div>
                                            <strong className="item-points">
                                                {Number(user.rewardPoints || 0).toLocaleString("en-IN")} pts
                                            </strong>
                                        </div>
                                    </div>
                                )}

                                {/* Coupon Code Form */}
                                <div className="summary-coupon-section">
                                    <form onSubmit={handleApplyCoupon} className="coupon-input-wrap">
                                        <input
                                            type="text"
                                            placeholder="Enter promo code"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                            aria-label="Enter promo code"
                                        />
                                        <button
                                            type="submit"
                                            className="btn-apply-coupon"
                                            disabled={isApplyingCoupon || !couponInput.trim()}
                                        >
                                            <FaTag /> Apply
                                        </button>
                                    </form>

                                    {/* Currently applied coupon */}
                                    {couponCode && (
                                        <div className="applied-coupon-banner">
                                            <div className="coupon-pill-content">
                                                <FaCheck className="check-icon" />
                                                <span>Coupon <strong>{couponCode}</strong> applied!</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-remove-coupon"
                                                onClick={removeCoupon}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}

                                    {/* Quick Coupon Suggestions */}
                                    {!couponCode && (
                                        <div className="quick-coupons-cluster">
                                            <span className="quick-title">Available Offers:</span>
                                            <div className="quick-chips-row">
                                                {QUICK_COUPONS.map((c) => (
                                                    <button
                                                        key={c.code}
                                                        type="button"
                                                        className="quick-coupon-chip"
                                                        onClick={() => handleQuickApplyCoupon(c.code)}
                                                        title={c.desc}
                                                    >
                                                        <strong>{c.code}</strong>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Main Checkout CTA Button */}
                                <button
                                    type="button"
                                    className="btn-checkout-cta"
                                    onClick={handleProceedToCheckout}
                                    disabled={unifiedCartItems.length === 0}
                                >
                                    <span>Proceed to Checkout</span>
                                    <FaArrowRight />
                                </button>

                                {/* Security & Trust Badge */}
                                <div className="summary-trust-notice">
                                    <FaShieldAlt className="trust-icon" />
                                    <span>100% Safe & Secure Express Checkout</span>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
