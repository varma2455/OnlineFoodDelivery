import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { orderAPI, getFoodImageUrl } from "../../services/api";
import "./Checkout.css";
import {
    FaShoppingBag,
    FaArrowLeft,
    FaShieldAlt,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaCreditCard,
    FaMobileAlt,
    FaUniversity,
    FaCheckCircle,
    FaTag,
    FaWallet
} from "react-icons/fa";

const Checkout = () => {
    const {
        cartItems,
        serverCart,
        foodList,
        getTotalCartAmount,
        deliveryFee,
        taxes,
        discountAmount,
        couponCode,
        applyCoupon,
        removeCoupon,
        grandTotal,
        memberDiscountAmount,
        isMemberActive,
        memberPlanName,
        memberDiscountPercent,
        isMemberFreeDelivery,
        clearCart,
        user,
        refreshUser,
        showToast
    } = useContext(StoreContext);

    const navigate = useNavigate();

    // Form fields
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        addressLine1: user?.address || "",
        city: user?.city || "Hyderabad",
        state: "Telangana",
        postalCode: "500001",
        deliveryInstructions: ""
    });

    const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
    const [couponInput, setCouponInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Build active cart items (supporting both serverCart with customizations & local items)
    const activeCartItems = React.useMemo(() => {
        const list = [];
        const seen = new Set();

        if (Array.isArray(serverCart) && serverCart.length > 0) {
            serverCart.forEach((item) => {
                const foodDoc = item.food;
                if (!foodDoc) return;
                const fid = (foodDoc._id || foodDoc).toString();
                seen.add(fid);
                const unitPrice =
                    item.price !== undefined && Number(item.price) > 0
                        ? Number(item.price)
                        : foodDoc.discountPrice && foodDoc.discountPrice > 0
                        ? foodDoc.discountPrice
                        : foodDoc.price || 0;
                const qty = Math.max(1, Number(item.quantity) || 1);
                list.push({
                    food: foodDoc._id || fid,
                    name: foodDoc.name,
                    image: foodDoc.image,
                    price: unitPrice,
                    quantity: qty,
                    subtotal: unitPrice * qty,
                    category: item.foodType || foodDoc.category,
                    customization: item.customization || {}
                });
            });
        }

        Object.entries(cartItems || {}).forEach(([foodId, qty]) => {
            if (qty <= 0 || seen.has(foodId)) return;
            const food = (foodList || []).find((f) => f._id === foodId);
            if (!food) return;
            const price = food.discountPrice > 0 ? food.discountPrice : food.price;
            list.push({
                food: food._id,
                name: food.name,
                image: food.image,
                price,
                quantity: qty,
                subtotal: price * qty,
                category: food.category,
                customization: {}
            });
        });

        return list;
    }, [serverCart, cartItems, foodList]);

    const subtotal = getTotalCartAmount();

    // Guard: redirect if cart is empty
    useEffect(() => {
        if (activeCartItems.length === 0 && !isSubmitting) {
            showToast("Your cart is empty. Please add items to checkout.", "info");
            navigate("/cart");
        }
    }, [activeCartItems.length, navigate, isSubmitting, showToast]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSelectSavedAddress = (saved) => {
        setFormData((prev) => ({
            ...prev,
            addressLine1: saved.address,
            city: prev.city || "Hyderabad"
        }));
        showToast(`Selected "${saved.title || "Saved"}" address`, "info");
    };

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        if (couponInput.trim()) {
            applyCoupon(couponInput.trim());
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!formData.fullName || !formData.phone || !formData.addressLine1 || !formData.city) {
            showToast("Please fill in all required delivery fields.", "error");
            return;
        }

        if (activeCartItems.length === 0) {
            showToast("Your cart is empty!", "error");
            return;
        }

        if (paymentMethod === "Wallet") {
            const currentWallet = Number(user?.wallet) || 0;
            if (currentWallet < grandTotal) {
                showToast(`Insufficient wallet balance (₹${currentWallet}). Order total is ₹${grandTotal}.`, "error");
                return;
            }
        }

        try {
            setIsSubmitting(true);

            const orderPayload = {
                deliveryAddress: {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    addressLine1: formData.addressLine1,
                    addressLine2: formData.deliveryInstructions,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    country: "India"
                },
                paymentMethod,
                couponCode,
                items: activeCartItems
            };

            const { data } = await orderAPI.placeOrder(orderPayload);

            if (data?.success || data?.order) {
                showToast("🎉 Order placed successfully! Thank you.", "success");
                await clearCart();
                if (refreshUser) refreshUser();
                navigate("/my-orders");
            } else {
                showToast(data?.message || "Failed to place order. Please try again.", "error");
            }
        } catch (error) {
            console.error("Order placement error:", error);
            const errMsg = error.response?.data?.message || error.message || "Failed to place order. Please try again.";
            showToast(errMsg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="checkout-header">
                <h1>Complete Your Order</h1>
                <p>Provide your delivery address and choose your payment method.</p>
            </div>

            <div className="checkout-container">
                {/* LEFT: FORM */}
                <form id="checkoutForm" className="checkout-form" onSubmit={handlePlaceOrder}>
                    <h2>1. Delivery Details</h2>

                    {/* Saved Addresses Shortcut */}
                    {user?.savedAddresses && user.savedAddresses.length > 0 && (
                        <div className="saved-addresses-box">
                            <label className="saved-label">Quick Select Saved Address:</label>
                            <div className="saved-pills-row">
                                {user.savedAddresses.map((addr, i) => (
                                    <button
                                        type="button"
                                        key={addr._id || i}
                                        className="saved-addr-btn"
                                        onClick={() => handleSelectSavedAddress(addr)}
                                    >
                                        <FaMapMarkerAlt /> {addr.title || "Address"}: {addr.address.substring(0, 30)}...
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label>Full Name *</label>
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Your Name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label>Mobile Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="10-digit mobile number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Street Address / Flat / Building *</label>
                        <textarea
                            name="addressLine1"
                            rows="3"
                            placeholder="Flat / House No., Floor, Landmark, Street"
                            value={formData.addressLine1}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label>City *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>State *</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>PIN Code *</label>
                            <input
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Delivery Instructions (Optional)</label>
                        <input
                            type="text"
                            name="deliveryInstructions"
                            placeholder="E.g. Leave package with security guard, don't ring the bell"
                            value={formData.deliveryInstructions}
                            onChange={handleChange}
                        />
                    </div>

                    {/* PAYMENT METHOD SELECTION */}
                    <h2 style={{ marginTop: "40px" }}>2. Payment Method</h2>

                    <div className="payment-options-grid">
                        <label className={`payment-card ${paymentMethod === "Wallet" ? "selected" : ""}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="Wallet"
                                checked={paymentMethod === "Wallet"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="pay-card-content">
                                <FaWallet className="pay-icon wallet" style={{ color: "#ff5200" }} />
                                <div>
                                    <strong>FoodExpress Wallet (Balance: ₹{user?.wallet || 0})</strong>
                                    <small>
                                        {(user?.wallet || 0) >= grandTotal
                                            ? `Order: ₹${grandTotal} • Remaining balance: ₹${(user?.wallet || 0) - grandTotal}`
                                            : `⚠️ Low balance! Need ₹${grandTotal - (user?.wallet || 0)} more to pay via wallet`}
                                    </small>
                                </div>
                            </div>
                        </label>

                        <label className={`payment-card ${paymentMethod === "Cash on Delivery" ? "selected" : ""}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="Cash on Delivery"
                                checked={paymentMethod === "Cash on Delivery"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="pay-card-content">
                                <FaMoneyBillWave className="pay-icon cod" />
                                <div>
                                    <strong>Cash on Delivery</strong>
                                    <small>Pay with cash or UPI on food arrival</small>
                                </div>
                            </div>
                        </label>

                        <label className={`payment-card ${paymentMethod === "UPI" ? "selected" : ""}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="UPI"
                                checked={paymentMethod === "UPI"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="pay-card-content">
                                <FaMobileAlt className="pay-icon upi" />
                                <div>
                                    <strong>UPI (Instant Pay)</strong>
                                    <small>Google Pay, PhonePe, Paytm, BHIM</small>
                                </div>
                            </div>
                        </label>

                        <label className={`payment-card ${paymentMethod === "Card" ? "selected" : ""}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="Card"
                                checked={paymentMethod === "Card"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="pay-card-content">
                                <FaCreditCard className="pay-icon card" />
                                <div>
                                    <strong>Credit / Debit Card</strong>
                                    <small>Visa, MasterCard, RuPay, Amex</small>
                                </div>
                            </div>
                        </label>

                        <label className={`payment-card ${paymentMethod === "Net Banking" ? "selected" : ""}`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="Net Banking"
                                checked={paymentMethod === "Net Banking"}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="pay-card-content">
                                <FaUniversity className="pay-icon net" />
                                <div>
                                    <strong>Net Banking</strong>
                                    <small>All major Indian banks supported</small>
                                </div>
                            </div>
                        </label>
                    </div>
                </form>

                {/* RIGHT: ORDER SUMMARY */}
                <div className="checkout-summary">
                    <h2>Order Summary</h2>

                    {/* Ordered Items Snippet */}
                    <div className="checkout-items-list">
                        {activeCartItems.map((item, idx) => {
                            const c = item.customization || {};
                            const details = [];
                            if (c.size) details.push(c.size);
                            if (c.crust) details.push(c.crust);
                            if (c.bun) details.push(c.bun);
                            if (c.rice) details.push(c.rice);
                            if (c.spice) details.push(`${c.spice} Spice`);
                            if (c.noodlesType) details.push(c.noodlesType);
                            if (c.dressing) details.push(c.dressing);
                            if (c.portion) details.push(c.portion);
                            if (c.iceLevel) details.push(c.iceLevel);
                            if (c.sugarLevel) details.push(c.sugarLevel);
                            if (c.topping) details.push(c.topping);
                            if (Array.isArray(c.toppings) && c.toppings.length > 0) details.push(c.toppings.join(", "));
                            if (Array.isArray(c.extras) && c.extras.length > 0) details.push(c.extras.join(", "));

                            return (
                                <div key={item.cartDocId || `${item.food}_${idx}`} className="checkout-item-row" style={{ alignItems: "flex-start" }}>
                                    <span className="checkout-item-qty">{item.quantity}x</span>
                                    <div style={{ flex: 1, minWidth: 0, paddingRight: "8px" }}>
                                        <span className="checkout-item-name" style={{ display: "block" }}>{item.name}</span>
                                        {details.length > 0 && (
                                            <small style={{ display: "block", fontSize: "11px", color: "#ff6b35", marginTop: "2px" }}>
                                                {details.join(" • ")}
                                            </small>
                                        )}
                                    </div>
                                    <span className="checkout-item-price">₹{item.subtotal}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="summary-row">
                        <span>Items Subtotal</span>
                        <span>₹{subtotal}</span>
                    </div>

                    <div className="summary-row">
                        <span>Delivery Fee</span>
                        <span style={{ color: deliveryFee === 0 ? "#2ed573" : "inherit", fontWeight: deliveryFee === 0 ? "700" : "normal" }}>
                            {isMemberFreeDelivery ? (
                                <>
                                    <span style={{ textDecoration: "line-through", color: "#95a5a6", marginRight: "6px" }}>₹40</span>
                                    <span>FREE</span>
                                    <small style={{ color: "#ff6b35", fontWeight: "600", marginLeft: "6px", display: "inline-block" }}>
                                        ({memberPlanName} Benefit)
                                    </small>
                                </>
                            ) : deliveryFee === 0 ? (
                                "FREE"
                            ) : (
                                `₹${deliveryFee}`
                            )}
                        </span>
                    </div>

                    <div className="summary-row">
                        <span>Govt Taxes & GST (5%)</span>
                        <span>₹{taxes}</span>
                    </div>

                    {discountAmount > 0 && (
                        <div className="summary-row" style={{ color: "#2ed573", fontWeight: "600" }}>
                            <span>Coupon Discount ({couponCode})</span>
                            <span>- ₹{discountAmount}</span>
                        </div>
                    )}

                    {memberDiscountAmount > 0 && (
                        <div className="summary-row" style={{ color: "#ff6b35", fontWeight: "700" }}>
                            <span>FoodExpress {memberPlanName} Benefit ({memberDiscountPercent}% member discount)</span>
                            <span>- ₹{memberDiscountAmount}</span>
                        </div>
                    )}

                    <div className="summary-row total">
                        <span>Grand Total</span>
                        <span>₹{grandTotal}</span>
                    </div>

                    {/* COUPON INPUT */}
                    <form className="coupon-box" onSubmit={handleApplyCoupon}>
                        <input
                            type="text"
                            placeholder="Coupon (FIRST30, FOOD20)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        />
                        <button type="submit">
                            <FaTag /> Apply
                        </button>
                    </form>

                    {couponCode && (
                        <div className="applied-coupon-pill">
                            <span>🎉 <strong>{couponCode}</strong> applied</span>
                            <button type="button" onClick={removeCoupon}>
                                Remove
                            </button>
                        </div>
                    )}

                    {/* SUBMIT BUTTON - links to form */}
                    <button
                        type="submit"
                        form="checkoutForm"
                        className="place-order-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Placing Order..." : `Place Order (₹${grandTotal})`}
                    </button>

                    <Link to="/cart" className="back-cart-btn">
                        <FaArrowLeft /> Edit Cart
                    </Link>

                    <div className="secure-checkout-notice">
                        <FaShieldAlt /> Safe, Encrypted & Secure Checkout
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;