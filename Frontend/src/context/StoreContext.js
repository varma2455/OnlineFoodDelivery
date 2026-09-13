import React, { createContext, useEffect, useState, useCallback, useMemo } from "react";
import { API_BASE_URL, authAPI, foodAPI, cartAPI, offerAPI } from "../services/api";
import Toast from "../components/Toast/Toast";
import { auth } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile as updateFirebaseProfile
} from "firebase/auth";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
    const url = API_BASE_URL;

    // Authentication State
    const [token, setToken] = useState(() => localStorage.getItem("token") || "");
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("user");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    // Foods & Categories
    const [foodList, setFoodList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingFoods, setLoadingFoods] = useState(true);

    // Cart State: { [foodId]: quantity }
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem("foodexpress_cart");
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });
    const [serverCart, setServerCart] = useState([]);
    const [loadingCart, setLoadingCart] = useState(false);

    // Coupon & Discount
    const [couponCode, setCouponCode] = useState(() => localStorage.getItem("foodexpress_coupon") || "");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedOffer, setAppliedOffer] = useState(() => {
        try {
            const saved = localStorage.getItem("foodexpress_applied_offer");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    // Wishlist
    const [wishlist, setWishlist] = useState(() => {
        try {
            const saved = localStorage.getItem("foodexpress_wishlist");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Area / Location State
    const availableAreas = useMemo(() => [
        "Hyderabad",
        "Bhimavaram",
        "Bengaluru",
        "Mumbai",
        "Delhi NCR",
        "Pune",
        "Chennai",
        "Kolkata"
    ], []);

    const [selectedArea, setSelectedAreaState] = useState(() => {
        return localStorage.getItem("foodexpress_area") || "Hyderabad";
    });

    const setSelectedArea = useCallback((area) => {
        setSelectedAreaState(area);
        localStorage.setItem("foodexpress_area", area);
    }, []);

    // Responsive Mobile Sidebar Drawer State
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const toggleMobileSidebar = useCallback(() => {
        setMobileSidebarOpen((prev) => !prev);
    }, []);
    const closeMobileSidebar = useCallback(() => {
        setMobileSidebarOpen(false);
    }, []);

    // Toast Notifications
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Fetch Foods
    const fetchFoodList = useCallback(async () => {
        try {
            setLoadingFoods(true);
            const { data } = await foodAPI.getAllFoods({ limit: 100 });
            setFoodList(data.foods || []);
        } catch (error) {
            console.error("Failed to fetch foods:", error.message);
        } finally {
            setLoadingFoods(false);
        }
    }, []);

    // Fetch Categories
    const fetchCategories = useCallback(async () => {
        try {
            const { data } = await foodAPI.getCategories();
            setCategories(data.categories || []);
        } catch (error) {
            console.error("Failed to fetch categories:", error.message);
        }
    }, []);

    // Fetch User Profile
    const fetchUserProfile = useCallback(async () => {
        if (!token) return;
        try {
            const { data } = await authAPI.getProfile();
            if (data.user) {
                setUser(data.user);
                localStorage.setItem("user", JSON.stringify(data.user));
                if (data.user.favorites && Array.isArray(data.user.favorites)) {
                    setWishlist(data.user.favorites.map((f) => (typeof f === "object" ? f._id : f)));
                }
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error.message);
            // If token expired / invalid, log out
            if (error.message.includes("jwt") || error.message.includes("401") || error.message.includes("Unauthorized")) {
                logout();
            }
        }
    }, [token]);

    // Initial Data Fetch
    useEffect(() => {
        fetchFoodList();
        fetchCategories();
    }, [fetchFoodList, fetchCategories]);

    // Fetch Server Cart (MongoDB)
    const fetchCart = useCallback(async () => {
        if (!token) {
            setServerCart([]);
            return;
        }
        try {
            setLoadingCart(true);
            const { data } = await cartAPI.getCart();
            if (data && data.success && Array.isArray(data.cart || data.cartItems || data.items)) {
                const items = data.cart || data.cartItems || data.items || [];
                setServerCart(items);
                // Synchronize into cartItems state so components using cartItems remain in sync
                setCartItems(() => {
                    const updated = {};
                    items.forEach((item) => {
                        const id = (item.food?._id || item.food)?.toString();
                        if (id) {
                            updated[id] = (updated[id] || 0) + (Number(item.quantity) || 1);
                        }
                    });
                    return updated;
                });
            }
        } catch (err) {
            console.warn("Could not sync server cart:", err.message);
        } finally {
            setLoadingCart(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchUserProfile();
            fetchCart();
        } else {
            setServerCart([]);
        }
    }, [token, fetchUserProfile, fetchCart]);

    // Persist Cart to localStorage
    useEffect(() => {
        localStorage.setItem("foodexpress_cart", JSON.stringify(cartItems));
    }, [cartItems]);

    // Persist Wishlist to localStorage
    useEffect(() => {
        localStorage.setItem("foodexpress_wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    // Persist Coupon & Applied Offer
    useEffect(() => {
        if (couponCode) {
            localStorage.setItem("foodexpress_coupon", couponCode);
        } else {
            localStorage.removeItem("foodexpress_coupon");
        }
        if (appliedOffer) {
            localStorage.setItem("foodexpress_applied_offer", JSON.stringify(appliedOffer));
        } else {
            localStorage.removeItem("foodexpress_applied_offer");
        }
    }, [couponCode, appliedOffer]);

    // Add To Cart
    const addToCart = useCallback(
        async (foodId, quantity = 1, customization = {}, customPrice = null) => {
            setCartItems((prev) => {
                const currentQty = prev[foodId] || 0;
                return {
                    ...prev,
                    [foodId]: currentQty + quantity
                };
            });

            const food = foodList.find((f) => f._id === foodId);

            // Sync with backend if authenticated
            if (token) {
                try {
                    const response = await cartAPI.addToCart({
                        foodId,
                        quantity,
                        customization,
                        price: customPrice !== null ? customPrice : (food?.discountPrice > 0 ? food.discountPrice : food?.price)
                    });
                    await fetchCart();
                    showToast(`Added ${food?.name || "item"} to cart! 🛒`, "success");
                    return { success: true, data: response.data };
                } catch (e) {
                    const errMsg = e.response?.data?.message || e.message || "Could not add to cart.";
                    showToast(errMsg, "error");
                    throw e;
                }
            } else {
                showToast(`Added ${food?.name || "item"} to cart! 🛒`, "success");
                return { success: true };
            }
        },
        [foodList, token, showToast, fetchCart]
    );

    // Remove / Decrement From Cart
    const removeFromCart = useCallback(
        async (foodId) => {
            const current = cartItems[foodId] || 1;
            setCartItems((prev) => {
                const cur = prev[foodId];
                if (!cur) return prev;
                const updated = { ...prev };
                if (cur <= 1) {
                    delete updated[foodId];
                } else {
                    updated[foodId] = cur - 1;
                }
                return updated;
            });

            if (token) {
                try {
                    if (current <= 1) {
                        await cartAPI.removeCartItem(foodId);
                    } else {
                        await cartAPI.updateCartItem(foodId, current - 1);
                    }
                    fetchCart();
                } catch (e) {}
            }
        },
        [token, cartItems, fetchCart]
    );

    // Set Exact Quantity
    const updateCartQuantity = useCallback(
        async (foodId, quantity) => {
            setCartItems((prev) => {
                const updated = { ...prev };
                if (quantity <= 0) {
                    delete updated[foodId];
                } else {
                    updated[foodId] = quantity;
                }
                return updated;
            });

            if (token) {
                try {
                    if (quantity <= 0) {
                        await cartAPI.removeCartItem(foodId);
                    } else {
                        await cartAPI.updateCartItem(foodId, quantity);
                    }
                    fetchCart();
                } catch (e) {}
            }
        },
        [token, fetchCart]
    );

    // Delete item completely from cart
    const deleteFromCart = useCallback(
        async (foodId) => {
            setCartItems((prev) => {
                const updated = { ...prev };
                delete updated[foodId];
                return updated;
            });
            showToast("Item removed from cart.", "info");

            if (token) {
                try {
                    await cartAPI.removeCartItem(foodId);
                    fetchCart();
                } catch (e) {}
            }
        },
        [token, showToast, fetchCart]
    );

    // Clear Cart
    const clearCart = useCallback(async () => {
        setCartItems({});
        setServerCart([]);
        setCouponCode("");
        setDiscountAmount(0);
        localStorage.removeItem("foodexpress_cart");
        localStorage.removeItem("foodexpress_coupon");
        if (token) {
            try {
                await cartAPI.clearCart();
            } catch (e) {}
        }
        showToast("Cart cleared.", "info");
    }, [token, showToast]);

    // Total Cart Count for Badge
    const getCartCount = useCallback(() => {
        if (token && serverCart.length > 0) {
            return serverCart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
        }
        return Object.values(cartItems).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
    }, [token, serverCart, cartItems]);

    // Items Subtotal Amount
    const getTotalCartAmount = useCallback(() => {
        if (token && serverCart.length > 0) {
            return serverCart.reduce((sum, item) => {
                const unitPrice =
                    item.price !== undefined && Number(item.price) > 0
                        ? Number(item.price)
                        : item.food?.discountPrice && item.food.discountPrice > 0
                        ? item.food.discountPrice
                        : item.food?.price || 0;
                const qty = Number(item.quantity) || 1;
                return sum + unitPrice * qty;
            }, 0);
        }
        let total = 0;
        for (const [id, qty] of Object.entries(cartItems)) {
            const food = foodList.find((f) => f._id === id);
            if (food && qty > 0) {
                const effectivePrice =
                    food.discountPrice && food.discountPrice > 0 ? food.discountPrice : food.price;
                total += effectivePrice * qty;
            }
        }
        return total;
    }, [token, serverCart, cartItems, foodList]);

    // Member Benefit Computations
    const memberObj = user?.membership || {};
    const memberPlan = (typeof memberObj === "string" ? memberObj : (memberObj.plan || "free")).toLowerCase();
    const isMemberActive = memberObj.status === "active" || ["silver", "gold", "platinum"].includes(memberPlan);

    const memberDiscountPercent = useMemo(() => {
        if (!isMemberActive) return 0;
        if (memberPlan === "platinum") return 15;
        if (memberPlan === "gold") return 10;
        if (memberPlan === "silver") return 5;
        return 0;
    }, [isMemberActive, memberPlan]);

    const isMemberFreeDelivery = useMemo(() => {
        if (!isMemberActive) return false;
        return memberPlan === "gold" || memberPlan === "platinum" || memberPlan === "silver";
    }, [isMemberActive, memberPlan]);

    const memberPlanName = useMemo(() => {
        if (!isMemberActive || memberPlan === "free" || memberPlan === "basic") return "";
        return memberPlan.charAt(0).toUpperCase() + memberPlan.slice(1);
    }, [isMemberActive, memberPlan]);

    // Member Discount Amount (calculated on items subtotal)
    const memberDiscountAmount = useMemo(() => {
        if (memberDiscountPercent <= 0) return 0;
        const subtotal = getTotalCartAmount();
        return Math.round((subtotal * memberDiscountPercent) / 100);
    }, [getTotalCartAmount, memberDiscountPercent]);

    // Delivery Fee: ₹40, or Free for orders >= ₹500, or FREE for VIP members
    const deliveryFee = useMemo(() => {
        const subtotal = getTotalCartAmount();
        if (subtotal === 0) return 0;
        if (isMemberFreeDelivery) return 0;
        return subtotal >= 500 ? 0 : 40;
    }, [getTotalCartAmount, isMemberFreeDelivery]);

    // Taxes (5% GST standard on restaurant food)
    const taxes = useMemo(() => {
        const subtotal = getTotalCartAmount();
        return Math.round(subtotal * 0.05);
    }, [getTotalCartAmount]);

    // Calculate Discount based on coupon
    const calculateDiscount = useCallback(
        (code) => {
            const subtotal = getTotalCartAmount();
            const normalized = (code || "").trim().toUpperCase();
            if (normalized === "FIRST30") {
                return Math.min(Math.round(subtotal * 0.3), 200);
            }
            if (normalized === "WELCOME40") {
                return Math.min(Math.round(subtotal * 0.4), 160);
            }
            if (normalized === "FOOD20") {
                return Math.min(Math.round(subtotal * 0.2), 150);
            }
            if (normalized === "FREEDEL") {
                return 40;
            }
            if (subtotal >= 1000) {
                return Math.floor(subtotal * 0.1);
            }
            return 0;
        },
        [getTotalCartAmount]
    );

    // Apply Coupon / Offer
    const applyCoupon = useCallback(
        async (code, options = {}) => {
            const clean = (code || "").trim().toUpperCase();
            if (!clean) {
                showToast("Please enter a promo code.", "error");
                return { success: false, message: "Code required" };
            }

            const subtotal = options.subtotal !== undefined ? options.subtotal : getTotalCartAmount();
            const items = options.cartItems || Object.entries(cartItems).map(([id, qty]) => {
                const food = foodList.find((f) => f._id === id);
                return { food, quantity: qty };
            });

            try {
                const res = await offerAPI.validateOffer({
                    code: clean,
                    cartSubtotal: subtotal,
                    cartItems: items,
                    restaurant: options.restaurant || ""
                });

                if (res.data?.valid) {
                    const disc = Number(res.data.discount) || 0;
                    setCouponCode(clean);
                    setDiscountAmount(disc);
                    setAppliedOffer(res.data.offer || { code: clean, discount: disc });
                    showToast(res.data.message || `Offer "${clean}" applied successfully! 🎉`, "success");
                    return { success: true, discount: disc, offer: res.data.offer };
                } else {
                    showToast(res.data?.message || "Coupon cannot be applied.", "error");
                    return { success: false, message: res.data?.message };
                }
            } catch (err) {
                const errMsg = err.message || "Invalid promo code.";
                const fallbackDisc = calculateDiscount(clean);
                if (fallbackDisc > 0) {
                    setCouponCode(clean);
                    setDiscountAmount(fallbackDisc);
                    setAppliedOffer({ code: clean, discount: fallbackDisc });
                    showToast(`Offer "${clean}" applied successfully! 🎉`, "success");
                    return { success: true, discount: fallbackDisc };
                }
                showToast(errMsg, "error");
                return { success: false, message: errMsg };
            }
        },
        [getTotalCartAmount, cartItems, foodList, calculateDiscount, showToast]
    );

    // Remove Coupon / Offer
    const removeCoupon = useCallback(() => {
        setCouponCode("");
        setDiscountAmount(0);
        setAppliedOffer(null);
        localStorage.removeItem("foodexpress_coupon");
        localStorage.removeItem("foodexpress_applied_offer");
        showToast("Coupon removed.", "info");
    }, [showToast]);

    // Recalculate discount whenever subtotal or coupon changes
    useEffect(() => {
        if (couponCode) {
            setDiscountAmount(calculateDiscount(couponCode));
        } else {
            setDiscountAmount(0);
        }
    }, [cartItems, couponCode, calculateDiscount]);

    // Grand Total (Items + Delivery + Taxes - Coupon Discount - VIP Member Discount)
    const grandTotal = useMemo(() => {
        const subtotal = getTotalCartAmount();
        if (subtotal === 0) return 0;
        return Math.max(0, subtotal + deliveryFee + taxes - discountAmount - memberDiscountAmount);
    }, [getTotalCartAmount, deliveryFee, taxes, discountAmount, memberDiscountAmount]);

    // Wishlist Toggle
    const toggleWishlist = useCallback(
        async (foodId) => {
            let isNowWishlisted = false;
            setWishlist((prev) => {
                const exists = prev.includes(foodId);
                if (exists) {
                    isNowWishlisted = false;
                    return prev.filter((id) => id !== foodId);
                } else {
                    isNowWishlisted = true;
                    return [...prev, foodId];
                }
            });

            if (isNowWishlisted) {
                showToast("Added to Wishlist ❤️", "success");
            } else {
                showToast("Removed from Wishlist", "info");
            }

            if (token) {
                try {
                    await authAPI.toggleFavorite(foodId);
                } catch (e) {}
            }
        },
        [token, showToast]
    );

    const isWishlisted = useCallback((foodId) => wishlist.includes(foodId), [wishlist]);

    // Direct / Local Login Handler
    const login = useCallback(
        (newToken, newUserData) => {
            setToken(newToken);
            setUser(newUserData);
            localStorage.setItem("token", newToken);
            localStorage.setItem("user", JSON.stringify(newUserData));
            showToast(`Welcome back, ${newUserData.fullName}! 👋`, "success");
        },
        [showToast]
    );

    // Firebase Email & Password Login
    const firebaseLogin = useCallback(
        async (email, password) => {
            try {
                // 1. Authenticate with Firebase Client SDK
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const idToken = await userCredential.user.getIdToken();

                // 2. Exchange with backend for MongoDB profile and verified role
                const { data } = await authAPI.firebaseLogin(idToken);
                login(data.token, data.user);
                return data;
            } catch (fbErr) {
                // Seamless fallback to direct backend authentication
                const { data } = await authAPI.login({ email, password });
                login(data.token, data.user);
                return data;
            }
        },
        [login]
    );

    // Firebase Google Sign-In
    const firebaseGoogleLogin = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const idToken = await userCredential.user.getIdToken();
        const { data } = await authAPI.firebaseLogin(idToken);
        login(data.token, data.user);
        return data;
    }, [login]);

    // Firebase Register
    const firebaseRegister = useCallback(
        async (fullName, email, password, phone = "") => {
            let idToken = null;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateFirebaseProfile(userCredential.user, { displayName: fullName });
                idToken = await userCredential.user.getIdToken();
            } catch (fbErr) {
                console.warn("Firebase client registration fallback:", fbErr.message);
            }

            const { data } = await authAPI.register({
                fullName,
                email,
                password,
                phone,
                idToken
            });

            login(data.token, data.user);
            return data;
        },
        [login]
    );

    // Firebase Password Reset
    const firebaseResetPassword = useCallback(async (email) => {
        await sendPasswordResetEmail(auth, email);
    }, []);

    // Logout Handler (Clears Backend Session + Firebase Client + App State)
    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch (e) {}
        try {
            await signOut(auth);
        } catch (e) {}
        setToken("");
        setUser(null);
        setCartItems({});
        setServerCart([]);
        setCouponCode("");
        setDiscountAmount(0);
        setAppliedOffer(null);
        setWishlist([]);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("foodexpress_cart");
        localStorage.removeItem("foodexpress_coupon");
        localStorage.removeItem("foodexpress_applied_offer");
        localStorage.removeItem("foodexpress_wishlist");
        showToast("Logged out successfully.", "info");
    }, [showToast]);

    // Role Check Helper
    const hasRole = useCallback(
        (targetRole) => {
            if (!user) return false;
            if (Array.isArray(targetRole)) return targetRole.includes(user.role);
            return user.role === targetRole;
        },
        [user]
    );

    const contextValue = {
        url,
        API_BASE_URL,
        token,
        setToken,
        user,
        setUser,
        refreshUser: fetchUserProfile,
        login,
        logout,
        firebaseLogin,
        firebaseGoogleLogin,
        firebaseRegister,
        firebaseResetPassword,
        hasRole,
        foodList,
        setFoodList,
        fetchFoodList,
        categories,
        loadingFoods,
        cartItems,
        setCartItems,
        serverCart,
        setServerCart,
        loadingCart,
        fetchCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        deleteFromCart,
        clearCart,
        getCartCount,
        getTotalCartAmount,
        deliveryFee,
        taxes,
        couponCode,
        discountAmount,
        appliedOffer,
        setAppliedOffer,
        applyCoupon,
        removeCoupon,
        grandTotal,
        memberDiscountAmount,
        isMemberActive,
        memberPlanName,
        memberDiscountPercent,
        isMemberFreeDelivery,
        wishlist,
        toggleWishlist,
        isWishlisted,
        selectedArea,
        setSelectedArea,
        availableAreas,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        showToast
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {children}
            <Toast toasts={toasts} removeToast={removeToast} />
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;