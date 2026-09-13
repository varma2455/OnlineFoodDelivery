import React, { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { orderAPI, foodAPI, getFoodImageUrl } from "../../services/api";
import "./Orders.css";
import {
    FaBox,
    FaCheckCircle,
    FaClock,
    FaMotorcycle,
    FaUtensils,
    FaBan,
    FaRedo,
    FaSyncAlt,
    FaMapMarkerAlt,
    FaCreditCard,
    FaShoppingBag,
    FaTimes,
    FaStar,
    FaCompass,
    FaReceipt,
    FaChevronDown,
    FaChevronUp,
    FaSearch,
    FaFilter,
    FaArrowRight,
    FaWallet,
    FaGift,
    FaPhoneAlt,
    FaExclamationTriangle
} from "react-icons/fa";

const TRACKING_STEPS = [
    { key: "Placed", label: "Order Placed", desc: "Order received & logged", icon: <FaBox /> },
    { key: "Confirmed", label: "Confirmed", desc: "Restaurant accepted", icon: <FaCheckCircle /> },
    { key: "Preparing", label: "Preparing", desc: "Food being prepared", icon: <FaUtensils /> },
    { key: "Out for Delivery", label: "Out for Delivery", desc: "Rider is on the way", icon: <FaMotorcycle /> },
    { key: "Delivered", label: "Delivered", desc: "Enjoy your food!", icon: <FaCheckCircle /> }
];

const formatOrderId = (id) => {
    if (!id) return "#FE0000";
    return `#FE${id.toString().slice(-6).toUpperCase()}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const formatCustomizationSummary = (customization = {}) => {
    if (!customization || typeof customization !== "object") return null;
    const parts = [];
    if (customization.size) parts.push(customization.size);
    if (customization.crust) parts.push(customization.crust);
    if (customization.bun) parts.push(customization.bun);
    if (customization.rice) parts.push(customization.rice);
    if (customization.spice) parts.push(`${customization.spice} Spice`);
    if (customization.noodlesType) parts.push(customization.noodlesType);
    if (customization.dressing) parts.push(customization.dressing);
    if (customization.portion) parts.push(customization.portion);
    if (customization.iceLevel) parts.push(customization.iceLevel);
    if (customization.sugarLevel) parts.push(customization.sugarLevel);
    if (customization.milkOption) parts.push(customization.milkOption);
    if (customization.topping) parts.push(customization.topping);
    if (Array.isArray(customization.toppings) && customization.toppings.length > 0) {
        parts.push(customization.toppings.join(", "));
    }
    if (Array.isArray(customization.extras) && customization.extras.length > 0) {
        parts.push(customization.extras.join(", "));
    }
    return parts.length > 0 ? parts.join(" • ") : null;
};

const Orders = () => {
    const { token, user, foodList, addToCart, showToast } = useContext(StoreContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId: paramOrderId } = useParams();

    // Orders State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    // Filter, Search, Sort, Pagination
    const [activeFilter, setActiveFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

    // Expanded item rows on cards
    const [expandedCards, setExpandedCards] = useState({});

    // Modals
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingModalOrder, setTrackingModalOrder] = useState(null);
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [ratingOrder, setRatingOrder] = useState(null);
    const [ratingFoodId, setRatingFoodId] = useState(null);
    const [ratingStars, setRatingStars] = useState(5);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [ratingComment, setRatingComment] = useState("");
    const [submittingRating, setSubmittingRating] = useState(false);

    // Fetch complete user order history
    const fetchOrders = useCallback(async (isSilent = false) => {
        if (!token) return;
        try {
            if (!isSilent) setLoading(true);
            else setRefreshing(true);
            setFetchError(null);

            const { data } = await orderAPI.getMyOrders();
            const orderList = Array.isArray(data.orders)
                ? data.orders
                : Array.isArray(data.data)
                ? data.data
                : [];
            setOrders(orderList);
        } catch (error) {
            console.error("Error fetching user orders:", error);
            setFetchError(error.message || "Unable to load your orders. Please check your connection.");
            if (!isSilent) {
                showToast(error.message || "Unable to load orders.", "error");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token, showToast]);

    useEffect(() => {
        if (!token) {
            navigate("/login?redirect=/my-orders");
            return;
        }
        fetchOrders();
    }, [token, fetchOrders, navigate]);

    // Handle deep-linked orderId parameter (/my-orders/:orderId)
    useEffect(() => {
        if (paramOrderId && orders.length > 0) {
            const found = orders.find(
                (o) => o._id === paramOrderId || o._id.slice(-6).toUpperCase() === paramOrderId.toUpperCase()
            );
            if (found) setSelectedOrder(found);
        }
    }, [paramOrderId, orders]);

    // Auto-refresh periodically if active orders exist
    useEffect(() => {
        const hasActive = orders.some((o) => {
            const st = (o.orderStatus || "").toLowerCase();
            return ["placed", "confirmed", "preparing", "out for delivery"].includes(st);
        });

        if (!hasActive) return;

        const timer = setInterval(() => {
            fetchOrders(true);
        }, 25000);

        return () => clearInterval(timer);
    }, [orders, fetchOrders]);

    // Reset pagination on filter or search change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, searchQuery, sortBy]);

    // Helper: Step index
    const getStatusIndex = (status) => {
        const s = (status || "").toLowerCase();
        return TRACKING_STEPS.findIndex((step) => step.key.toLowerCase() === s);
    };

    // Toggle card items expansion
    const toggleExpandCard = (orderId) => {
        setExpandedCards((prev) => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    // Cancel Order
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            await orderAPI.cancelOrder(orderId);
            showToast("Order cancelled successfully.", "info");
            fetchOrders(true);
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder((prev) => ({ ...prev, orderStatus: "Cancelled" }));
            }
            if (trackingModalOrder && trackingModalOrder._id === orderId) {
                setTrackingModalOrder((prev) => ({ ...prev, orderStatus: "Cancelled" }));
            }
        } catch (err) {
            showToast(err.message || "Unable to cancel this order.", "error");
        }
    };

    // Reorder items
    const handleReorder = (order) => {
        if (!order?.items || order.items.length === 0) return;
        let addedCount = 0;
        let skippedCount = 0;

        order.items.forEach((item) => {
            const foodId = typeof item.food === "object" ? item.food?._id : item.food;
            if (foodId) {
                const foodInStock = Array.isArray(foodList)
                    ? foodList.find((f) => f._id.toString() === foodId.toString())
                    : null;
                if (foodInStock && foodInStock.stock !== undefined && foodInStock.stock <= 0) {
                    skippedCount++;
                } else {
                    addToCart(foodId, item.quantity || 1);
                    addedCount++;
                }
            } else {
                skippedCount++;
            }
        });

        if (addedCount > 0) {
            if (skippedCount > 0) {
                showToast(`${addedCount} items added to cart (${skippedCount} item unavailable).`, "info");
            } else {
                showToast("Items added back to your cart! 🛒", "success");
            }
            navigate("/cart");
        } else {
            showToast("These items are currently unavailable in your area.", "error");
        }
    };

    // Open Rating Modal
    const openRatingModal = (order) => {
        setRatingOrder(order);
        const firstItem = order.items?.[0];
        const foodId = typeof firstItem?.food === "object" ? firstItem?.food?._id : firstItem?.food;
        setRatingFoodId(foodId || null);
        setRatingStars(5);
        setRatingComment("");
        setRatingModalOpen(true);
    };

    // Submit Rating & Review
    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        if (!ratingFoodId) {
            showToast("Please select a food item to rate.", "error");
            return;
        }
        try {
            setSubmittingRating(true);
            await foodAPI.addReview(ratingFoodId, {
                rating: ratingStars,
                comment: ratingComment.trim() || "Delicious food and fast delivery!",
                userName: user?.fullName || "FoodExpress Customer"
            });
            showToast("Thank you for your review! ⭐", "success");
            setRatingModalOpen(false);
            setRatingOrder(null);
            setRatingComment("");
        } catch (err) {
            showToast(err.message || "Failed to submit rating.", "error");
        } finally {
            setSubmittingRating(false);
        }
    };

    // Filter Counts
    const counts = useMemo(() => {
        let active = 0;
        let delivered = 0;
        let cancelled = 0;
        orders.forEach((o) => {
            const st = (o.orderStatus || "").toLowerCase();
            if (["placed", "confirmed", "preparing", "out for delivery"].includes(st)) active++;
            else if (st === "delivered") delivered++;
            else if (st === "cancelled") cancelled++;
        });
        return {
            all: orders.length,
            active,
            delivered,
            cancelled
        };
    }, [orders]);

    // Filter & Search & Sort pipeline
    const filteredOrders = useMemo(() => {
        let list = [...orders];

        // 1. Status Filter
        if (activeFilter === "Active") {
            list = list.filter((o) => {
                const st = (o.orderStatus || "").toLowerCase();
                return ["placed", "confirmed", "preparing", "out for delivery"].includes(st);
            });
        } else if (activeFilter === "Delivered") {
            list = list.filter((o) => (o.orderStatus || "").toLowerCase() === "delivered");
        } else if (activeFilter === "Cancelled") {
            list = list.filter((o) => (o.orderStatus || "").toLowerCase() === "cancelled");
        }

        // 2. Search Query (order id, items, restaurant, city)
        const q = searchQuery.trim().toLowerCase();
        if (q) {
            list = list.filter((o) => {
                const idMatch =
                    (o._id && o._id.toLowerCase().includes(q)) ||
                    formatOrderId(o._id).toLowerCase().includes(q);
                const cityMatch = o.deliveryAddress?.city?.toLowerCase().includes(q);
                const itemMatch = o.items?.some((it) => (it.name || "").toLowerCase().includes(q));
                return idMatch || cityMatch || itemMatch;
            });
        }

        // 3. Sorting
        list.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            const amountA = Number(a.finalAmount || a.totalAmount || 0);
            const amountB = Number(b.finalAmount || b.totalAmount || 0);

            switch (sortBy) {
                case "oldest":
                    return dateA - dateB;
                case "highest":
                    return amountB - amountA;
                case "lowest":
                    return amountA - amountB;
                case "newest":
                default:
                    return dateB - dateA;
            }
        });

        return list;
    }, [orders, activeFilter, searchQuery, sortBy]);

    // Pagination slice
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ordersPerPage;
        return filteredOrders.slice(start, start + ordersPerPage);
    }, [filteredOrders, currentPage, ordersPerPage]);

    return (
        <div className="my-orders-page-layout">
            {/* MAIN CONTENT AREA */}
            <main className="my-orders-main-content">
                <div className="my-orders-container">
                    {/* Header Banner */}
                    <div className="my-orders-header">
                        <div className="header-title-block">
                            <div className="header-badge">
                                <FaReceipt /> Order Management
                            </div>
                            <h1>My Orders</h1>
                            <p>Track live delivery progress, review past invoices, and reorder favorites.</p>
                        </div>

                        <div className="header-actions-block">
                            <button
                                type="button"
                                className={`btn-refresh-sync ${refreshing ? "spinning" : ""}`}
                                onClick={() => fetchOrders(true)}
                                title="Refresh order status"
                                aria-label="Refresh orders"
                            >
                                <FaSyncAlt />
                                <span>{refreshing ? "Refreshing..." : "Sync Orders"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Toolbar: Filters + Search + Sort */}
                    <div className="my-orders-toolbar">
                        {/* Filter Tabs */}
                        <div className="filter-tabs-row" role="tablist">
                            {[
                                { id: "All", label: "All Orders", count: counts.all },
                                { id: "Active", label: "Active", count: counts.active },
                                { id: "Delivered", label: "Delivered", count: counts.delivered },
                                { id: "Cancelled", label: "Cancelled", count: counts.cancelled }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    className={`filter-tab-pill ${activeFilter === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveFilter(tab.id)}
                                    role="tab"
                                    aria-selected={activeFilter === tab.id}
                                >
                                    <span>{tab.label}</span>
                                    <span className="tab-count-badge">{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Search & Sort Controls */}
                        <div className="toolbar-controls-row">
                            <div className="orders-search-input-wrap">
                                <FaSearch className="search-lead-icon" />
                                <input
                                    type="text"
                                    placeholder="Search orders, restaurants or dishes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label="Search orders"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="search-clear-btn"
                                        onClick={() => setSearchQuery("")}
                                        aria-label="Clear search"
                                    >
                                        <FaTimes />
                                    </button>
                                )}
                            </div>

                            <div className="orders-sort-control">
                                <FaFilter className="sort-lead-icon" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    aria-label="Sort orders"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="highest">Highest Amount</option>
                                    <option value="lowest">Lowest Amount</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Content Section: Skeletons / Error / Empty / Order Cards */}
                    {loading ? (
                        /* Skeleton Loading Cards */
                        <div className="orders-skeleton-feed">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="order-skeleton-card">
                                    <div className="skeleton-row top">
                                        <div className="skeleton-box id" />
                                        <div className="skeleton-box badge" />
                                    </div>
                                    <div className="skeleton-box tracker" />
                                    <div className="skeleton-row item">
                                        <div className="skeleton-box thumb" />
                                        <div className="skeleton-col">
                                            <div className="skeleton-box line-long" />
                                            <div className="skeleton-box line-short" />
                                        </div>
                                    </div>
                                    <div className="skeleton-row bottom">
                                        <div className="skeleton-box total" />
                                        <div className="skeleton-box button" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : fetchError ? (
                        /* Error State */
                        <div className="orders-error-view">
                            <FaExclamationTriangle className="error-icon" />
                            <h3>Unable to load your orders</h3>
                            <p>{fetchError}</p>
                            <button
                                type="button"
                                className="btn-try-again"
                                onClick={() => fetchOrders(false)}
                            >
                                <FaSyncAlt /> Try Again
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        /* Zero Orders Ever Placed */
                        <div className="orders-empty-state">
                            <div className="empty-state-visual">🍽️</div>
                            <h2>No orders yet</h2>
                            <p className="empty-subheading">Your delicious journey starts here.</p>
                            <p className="empty-description">
                                Explore restaurants and discover something you will love.
                            </p>
                            <Link to="/browse-food" className="btn-browse-food">
                                <FaUtensils /> Browse Food
                            </Link>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        /* Zero Search / Filter Matches */
                        <div className="orders-no-matches">
                            <div className="no-matches-visual">🔍</div>
                            <h3>No orders match your criteria</h3>
                            <p>Try searching for a different dish name or reset your filter tabs.</p>
                            <button
                                type="button"
                                className="btn-reset-filters"
                                onClick={() => {
                                    setActiveFilter("All");
                                    setSearchQuery("");
                                }}
                            >
                                Reset All Filters
                            </button>
                        </div>
                    ) : (
                        /* Paginated Order Cards Feed */
                        <div className="orders-cards-feed">
                            {paginatedOrders.map((order) => {
                                const stepIndex = getStatusIndex(order.orderStatus);
                                const isCancelled = (order.orderStatus || "").toLowerCase() === "cancelled";
                                const isDelivered = (order.orderStatus || "").toLowerCase() === "delivered";
                                const isActive = ["placed", "confirmed", "preparing", "out for delivery"].includes(
                                    (order.orderStatus || "").toLowerCase()
                                );
                                const canCancel = (order.orderStatus || "").toLowerCase() === "placed";
                                const isExpanded = Boolean(expandedCards[order._id]);
                                const visibleItems = isExpanded
                                    ? order.items
                                    : (order.items || []).slice(0, 2);
                                const remainingCount = Math.max(0, (order.items?.length || 0) - 2);

                                return (
                                    <article key={order._id} className="order-summary-card">
                                        {/* Card Header */}
                                        <div className="order-card-header">
                                            <div className="order-meta-group">
                                                <div className="order-id-tag">
                                                    <strong>{formatOrderId(order._id)}</strong>
                                                    <span className="order-restaurant-tag">
                                                        🏪 FoodExpress Kitchen
                                                    </span>
                                                </div>
                                                <div className="order-timestamp">
                                                    <FaClock /> Ordered on {formatDate(order.createdAt)}
                                                </div>
                                            </div>

                                            <div className="order-status-pill-group">
                                                <span
                                                    className={`order-status-pill status-${(
                                                        order.orderStatus || "placed"
                                                    )
                                                        .toLowerCase()
                                                        .replace(/\s+/g, "-")}`}
                                                >
                                                    {order.orderStatus || "Placed"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Visual Tracking Progress Bar (for Active Orders) */}
                                        {isActive && !isCancelled && (
                                            <div className="card-inline-tracker">
                                                <div className="tracker-steps-line">
                                                    {TRACKING_STEPS.map((step, idx) => {
                                                        const isCompleted = stepIndex >= idx;
                                                        const isCurrent = stepIndex === idx;

                                                        return (
                                                            <div
                                                                key={step.key}
                                                                className={`tracker-step ${
                                                                    isCompleted ? "completed" : ""
                                                                } ${isCurrent ? "current" : ""}`}
                                                            >
                                                                <div className="step-node-icon">
                                                                    {step.icon}
                                                                </div>
                                                                <span className="step-node-label">
                                                                    {step.label}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="tracker-eta-pill">
                                                    ⚡ Estimated Delivery: ~{order.estimatedDeliveryTime || 30} mins
                                                </div>
                                            </div>
                                        )}

                                        {/* Delivered Banner */}
                                        {isDelivered && (
                                            <div className="delivered-notice-banner">
                                                <FaCheckCircle className="notice-icon" />
                                                <span>Delivered safely to {order.deliveryAddress?.city || "your address"}</span>
                                            </div>
                                        )}

                                        {/* Cancelled Banner */}
                                        {isCancelled && (
                                            <div className="cancelled-notice-banner">
                                                <FaBan className="notice-icon" />
                                                <span>This order was cancelled. Restocked in kitchen.</span>
                                            </div>
                                        )}

                                        {/* Delivery Partner Strip */}
                                        {(() => {
                                            const partner = order.deliveryPartner || order.delivery?.deliveryPartner;
                                            if (partner && partner.name) {
                                                return (
                                                    <div className={`order-rider-strip ${isDelivered ? "delivered" : ""}`}>
                                                        <FaMotorcycle className="rider-strip-icon" />
                                                        <span>
                                                            Delivery Partner: <strong>{partner.name}</strong>
                                                            {partner.vehicleType ? ` (${partner.vehicleType})` : ""}
                                                        </span>
                                                        {partner.phone && !isDelivered && !isCancelled && (
                                                            <a href={`tel:${partner.phone}`} className="rider-strip-call">
                                                                <FaPhoneAlt /> Call Rider
                                                            </a>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            if (isActive && !isCancelled) {
                                                return (
                                                    <div className="order-rider-strip pending">
                                                        <FaMotorcycle className="rider-strip-icon" />
                                                        <span>Delivery Partner: <em>Finding a delivery partner...</em></span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}

                                        {/* Food Items Preview */}
                                        <div className="card-items-section">
                                            {visibleItems?.map((item, idx) => (
                                                <div key={idx} className="card-item-row">
                                                    <div className="item-thumbnail-wrap">
                                                        <img
                                                            src={getFoodImageUrl(item.image)}
                                                            alt={item.name}
                                                            className="item-food-thumb"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src =
                                                                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300";
                                                            }}
                                                        />
                                                    </div>

                                                    <div className="item-details-col">
                                                        <h4 className="item-name">{item.name}</h4>
                                                        <div className="item-subinfo">
                                                            <span className="item-qty-tag">
                                                                Qty: {item.quantity} × ₹{item.price}
                                                            </span>
                                                            {item.foodType && (
                                                                <span className="item-foodtype-tag">
                                                                    {item.foodType}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {formatCustomizationSummary(item.customization) && (
                                                            <div className="item-customization-pill" title={formatCustomizationSummary(item.customization)}>
                                                                {formatCustomizationSummary(item.customization)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="item-subtotal-col">
                                                        ₹{item.subtotal || item.price * item.quantity}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Expand / Collapse More Items */}
                                            {remainingCount > 0 && (
                                                <button
                                                    type="button"
                                                    className="btn-toggle-items"
                                                    onClick={() => toggleExpandCard(order._id)}
                                                >
                                                    {isExpanded ? (
                                                        <>
                                                            Show less items <FaChevronUp />
                                                        </>
                                                    ) : (
                                                        <>
                                                            + {remainingCount} more item
                                                            {remainingCount > 1 ? "s" : ""} <FaChevronDown />
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>

                                        {/* Bottom Action Footer */}
                                        <div className="card-footer-actions-row">
                                            {/* Left: Total & Payment Info */}
                                            <div className="order-price-payment-cluster">
                                                <div className="total-amount-pill">
                                                    <span className="total-label">Total</span>
                                                    <strong className="total-value">
                                                        ₹{order.finalAmount || order.totalAmount}
                                                    </strong>
                                                </div>
                                                <div className="payment-method-chip">
                                                    {order.paymentMethod === "Wallet" ? (
                                                        <FaWallet className="chip-icon" />
                                                    ) : (
                                                        <FaCreditCard className="chip-icon" />
                                                    )}
                                                    <span>{order.paymentMethod || "COD"}</span>
                                                    <span
                                                        className={`payment-badge ${
                                                            order.paymentStatus === "Paid"
                                                                ? "paid"
                                                                : "pending"
                                                        }`}
                                                    >
                                                        {order.paymentStatus || "Pending"}
                                                    </span>
                                                </div>
                                                {order.finalAmount && (
                                                    <div className="reward-chip" title="Reward points earned">
                                                        <FaGift /> +{Math.floor(order.finalAmount * 0.1)} pts
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: Status-Based Action Buttons */}
                                            <div className="card-buttons-cluster">
                                                {/* View Details button (Available for ALL statuses) */}
                                                <button
                                                    type="button"
                                                    className="btn-action-outline"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    View Details
                                                </button>

                                                {/* Pending / Confirmed: Cancel button */}
                                                {canCancel && (
                                                    <button
                                                        type="button"
                                                        className="btn-action-cancel"
                                                        onClick={() => handleCancelOrder(order._id)}
                                                    >
                                                        Cancel Order
                                                    </button>
                                                )}

                                                {/* Preparing / Out for Delivery: Track Order */}
                                                {isActive && !isCancelled && (
                                                    <button
                                                        type="button"
                                                        className="btn-action-track"
                                                        onClick={() => setTrackingModalOrder(order)}
                                                    >
                                                        <FaCompass /> Track Order
                                                    </button>
                                                )}

                                                {/* Delivered: Reorder + Rate Order */}
                                                {isDelivered && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="btn-action-rate"
                                                            onClick={() => openRatingModal(order)}
                                                        >
                                                            <FaStar /> Rate Order
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-action-reorder"
                                                            onClick={() => handleReorder(order)}
                                                        >
                                                            <FaRedo /> Reorder
                                                        </button>
                                                    </>
                                                )}

                                                {/* Cancelled: Order Again */}
                                                {isCancelled && (
                                                    <button
                                                        type="button"
                                                        className="btn-action-reorder"
                                                        onClick={() => handleReorder(order)}
                                                    >
                                                        <FaRedo /> Order Again
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination Bar */}
                    {!loading && filteredOrders.length > ordersPerPage && (
                        <div className="orders-pagination-bar">
                            <div className="pagination-count-label">
                                Showing {(currentPage - 1) * ordersPerPage + 1} to{" "}
                                {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of{" "}
                                {filteredOrders.length} orders
                            </div>

                            <div className="pagination-controls-buttons">
                                <button
                                    type="button"
                                    className="pagination-arrow-btn"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            className={`pagination-num-btn ${
                                                currentPage === pageNum ? "active" : ""
                                            }`}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    type="button"
                                    className="pagination-arrow-btn"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ===================================================
                MODAL A: ADVANCED ORDER DETAILS MODAL
                =================================================== */}
            {selectedOrder && (
                <div
                    className="orders-modal-backdrop"
                    onClick={() => setSelectedOrder(null)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="orders-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="orders-modal-header">
                            <div>
                                <span className="modal-eyebrow">Order Summary</span>
                                <h2>{formatOrderId(selectedOrder._id)}</h2>
                            </div>
                            <button
                                type="button"
                                className="modal-close-icon-btn"
                                onClick={() => setSelectedOrder(null)}
                                aria-label="Close modal"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="orders-modal-body">
                            {/* Tracking Progress */}
                            <div className="modal-detail-card">
                                <h3>
                                    <FaCompass /> Order Status & Progress
                                </h3>
                                <div className="modal-status-overview-row">
                                    <span
                                        className={`order-status-pill status-${(
                                            selectedOrder.orderStatus || "placed"
                                        )
                                            .toLowerCase()
                                            .replace(/\s+/g, "-")}`}
                                    >
                                        {selectedOrder.orderStatus || "Placed"}
                                    </span>
                                    <span className="modal-date-text">
                                        Ordered on {formatDate(selectedOrder.createdAt)}
                                    </span>
                                </div>

                                <div className="modal-tracker-timeline">
                                    {TRACKING_STEPS.map((step, idx) => {
                                        const sIdx = getStatusIndex(selectedOrder.orderStatus);
                                        const isCompleted = sIdx >= idx;
                                        const isCurrent = sIdx === idx;

                                        return (
                                            <div
                                                key={step.key}
                                                className={`modal-step-node ${
                                                    isCompleted ? "completed" : ""
                                                } ${isCurrent ? "current" : ""}`}
                                            >
                                                <div className="step-circle-icon">{step.icon}</div>
                                                <div className="step-desc-text">
                                                    <strong>{step.label}</strong>
                                                    <small>{step.desc}</small>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Ordered Items Table */}
                            <div className="modal-detail-card">
                                <h3>
                                    <FaUtensils /> Items in this Order ({selectedOrder.items?.length || 0})
                                </h3>
                                <div className="modal-items-table">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="modal-item-entry">
                                            <img
                                                src={getFoodImageUrl(item.image)}
                                                alt={item.name}
                                                className="modal-item-thumb"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src =
                                                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200";
                                                }}
                                            />
                                            <div className="modal-item-text">
                                                <h4>{item.name}</h4>
                                                <div className="modal-item-meta">
                                                    <span>Qty: {item.quantity}</span>
                                                    <span>× ₹{item.price}</span>
                                                    {item.foodType && <span>• {item.foodType}</span>}
                                                </div>
                                                {formatCustomizationSummary(item.customization) && (
                                                    <small className="customization-note" style={{ color: "#ff6b35", fontWeight: 600 }}>
                                                        {formatCustomizationSummary(item.customization)}
                                                    </small>
                                                )}
                                            </div>
                                            <div className="modal-item-subtotal">
                                                ₹{item.subtotal || item.price * item.quantity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="modal-detail-card">
                                <h3>
                                    <FaMapMarkerAlt /> Delivery Information
                                </h3>
                                <div className="modal-address-block">
                                    <strong>{selectedOrder.deliveryAddress?.fullName}</strong>
                                    <p>
                                        📞 {selectedOrder.deliveryAddress?.phone}
                                        <br />
                                        {selectedOrder.deliveryAddress?.addressLine1},{" "}
                                        {selectedOrder.deliveryAddress?.city},{" "}
                                        {selectedOrder.deliveryAddress?.state} -{" "}
                                        {selectedOrder.deliveryAddress?.postalCode}
                                        {selectedOrder.deliveryAddress?.addressLine2 && (
                                            <>
                                                <br />
                                                <em>Note: {selectedOrder.deliveryAddress.addressLine2}</em>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Assigned Delivery Partner Card */}
                            <div className="modal-detail-card">
                                <h3>
                                    <FaMotorcycle /> Assigned Delivery Partner
                                </h3>
                                {(() => {
                                    const modalPartner = selectedOrder.deliveryPartner || selectedOrder.delivery?.deliveryPartner;
                                    if (modalPartner && modalPartner.name) {
                                        return (
                                            <div className="modal-rider-card">
                                                <div className="modal-rider-avatar">🛵</div>
                                                <div className="modal-rider-details">
                                                    <strong>{modalPartner.name}</strong>
                                                    <p style={{ margin: "3px 0", fontSize: "13px", color: "#64748b" }}>
                                                        {modalPartner.vehicleType || "Bike"}
                                                        {modalPartner.vehicleNumber ? ` • ${modalPartner.vehicleNumber}` : ""}
                                                        {" • "}⭐ {modalPartner.rating ? Number(modalPartner.rating).toFixed(1) : "5.0"}
                                                    </p>
                                                    {modalPartner.phone && (
                                                        <a href={`tel:${modalPartner.phone}`} className="modal-rider-call-link">
                                                            <FaPhoneAlt /> Call Partner ({modalPartner.phone})
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="modal-rider-pending">
                                            <p style={{ margin: 0, color: "#64748b", fontSize: "13.5px" }}>
                                                {["Delivered", "Cancelled"].includes(selectedOrder.orderStatus)
                                                    ? "No delivery partner recorded for this order."
                                                    : "Finding a delivery partner... Our smart dispatch system will assign an available verified rider shortly."}
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Payment & Bill Breakdown */}
                            <div className="modal-detail-card">
                                <h3>
                                    <FaCreditCard /> Payment & Bill Breakdown
                                </h3>
                                <div className="bill-line-item">
                                    <span>Item Subtotal</span>
                                    <span>₹{selectedOrder.totalAmount}</span>
                                </div>
                                <div className="bill-line-item">
                                    <span>Delivery Charge</span>
                                    <span>
                                        {selectedOrder.deliveryCharge === 0
                                            ? "FREE"
                                            : `₹${selectedOrder.deliveryCharge || 40}`}
                                    </span>
                                </div>
                                {selectedOrder.discount > 0 && (
                                    <div className="bill-line-item discount-item">
                                        <span>Coupon Discount</span>
                                        <span>- ₹{selectedOrder.discount}</span>
                                    </div>
                                )}
                                <div className="bill-line-item grand-total">
                                    <span>Grand Total Paid</span>
                                    <strong>₹{selectedOrder.finalAmount || selectedOrder.totalAmount}</strong>
                                </div>

                                <div className="modal-payment-footer-note">
                                    <div>
                                        Payment Method: <strong>{selectedOrder.paymentMethod || "Cash on Delivery"}</strong>
                                    </div>
                                    <div>
                                        Payment Status: <strong>{selectedOrder.paymentStatus || "Pending"}</strong>
                                    </div>
                                    <div>
                                        Reward Points Earned:{" "}
                                        <strong style={{ color: "#ff5200" }}>
                                            +{Math.floor((selectedOrder.finalAmount || selectedOrder.totalAmount) * 0.1)} pts
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="orders-modal-footer">
                            <button
                                type="button"
                                className="btn-modal-dismiss"
                                onClick={() => setSelectedOrder(null)}
                            >
                                Close
                            </button>

                            {(selectedOrder.orderStatus || "").toLowerCase() === "delivered" && (
                                <>
                                    <button
                                        type="button"
                                        className="btn-modal-rate"
                                        onClick={() => {
                                            openRatingModal(selectedOrder);
                                            setSelectedOrder(null);
                                        }}
                                    >
                                        <FaStar /> Rate Order
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-modal-reorder-main"
                                        onClick={() => {
                                            handleReorder(selectedOrder);
                                            setSelectedOrder(null);
                                        }}
                                    >
                                        <FaRedo /> Reorder Items
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===================================================
                MODAL B: LIVE ORDER TRACKING MODAL
                =================================================== */}
            {trackingModalOrder && (
                <div
                    className="orders-modal-backdrop"
                    onClick={() => setTrackingModalOrder(null)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="orders-modal-card tracking-card-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="orders-modal-header">
                            <div>
                                <span className="modal-eyebrow">Real-Time Delivery</span>
                                <h2>Live Order Tracking</h2>
                            </div>
                            <button
                                type="button"
                                className="modal-close-icon-btn"
                                onClick={() => setTrackingModalOrder(null)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="orders-modal-body">
                            <div className="live-delivery-hero">
                                <div className="live-rider-avatar">
                                    <FaMotorcycle />
                                </div>
                                <h3>Delivery in Progress</h3>
                                <p className="eta-highlight">
                                    Estimated arrival: ~{trackingModalOrder.estimatedDeliveryTime || 30} mins
                                </p>
                            </div>

                            <div className="tracking-timeline-detailed">
                                {TRACKING_STEPS.map((step, idx) => {
                                    const sIdx = getStatusIndex(trackingModalOrder.orderStatus);
                                    const isDone = sIdx >= idx;
                                    const isNow = sIdx === idx;

                                    return (
                                        <div
                                            key={step.key}
                                            className={`tracking-timeline-row ${
                                                isDone ? "is-done" : ""
                                            } ${isNow ? "is-now" : ""}`}
                                        >
                                            <div className="timeline-node-circle">{step.icon}</div>
                                            <div className="timeline-content">
                                                <h4>{step.label}</h4>
                                                <p>{step.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {(() => {
                                const trackingPartner = trackingModalOrder.deliveryPartner || trackingModalOrder.delivery?.deliveryPartner;
                                if (trackingPartner && trackingPartner.name) {
                                    return (
                                        <div className="rider-contact-banner">
                                            <div className="rider-avatar-small">🛵</div>
                                            <div className="rider-info">
                                                <strong>{trackingPartner.name}</strong>
                                                <small>
                                                    {trackingPartner.vehicleType || "Verified Rider"}
                                                    {trackingPartner.vehicleNumber ? ` • ${trackingPartner.vehicleNumber}` : ""}
                                                    {" • "}⭐ {trackingPartner.rating ? Number(trackingPartner.rating).toFixed(1) : "5.0"}
                                                </small>
                                            </div>
                                            {trackingPartner.phone ? (
                                                <a href={`tel:${trackingPartner.phone}`} className="btn-call-rider">
                                                    <FaPhoneAlt /> Call Rider
                                                </a>
                                            ) : (
                                                <span className="btn-call-rider" style={{ opacity: 0.8, cursor: "default" }}>
                                                    <FaMotorcycle /> Dispatched
                                                </span>
                                            )}
                                        </div>
                                    );
                                }
                                return (
                                    <div className="rider-contact-banner" style={{ background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
                                        <div className="rider-avatar-small">🛵</div>
                                        <div className="rider-info">
                                            <strong style={{ color: "#64748b" }}>Finding a delivery partner...</strong>
                                            <small>Dispatching the nearest verified delivery partner</small>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="orders-modal-footer">
                            <button
                                type="button"
                                className="btn-modal-dismiss"
                                onClick={() => setTrackingModalOrder(null)}
                            >
                                Close Tracker
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===================================================
                MODAL C: RATING & REVIEW MODAL
                =================================================== */}
            {ratingModalOpen && ratingOrder && (
                <div
                    className="orders-modal-backdrop"
                    onClick={() => setRatingModalOpen(false)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="orders-modal-card rating-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="orders-modal-header">
                            <div>
                                <span className="modal-eyebrow">Rate Your Experience</span>
                                <h2>Rate & Review Order</h2>
                            </div>
                            <button
                                type="button"
                                className="modal-close-icon-btn"
                                onClick={() => setRatingModalOpen(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleRatingSubmit} className="orders-modal-body">
                            {/* Food Item Selection */}
                            <div className="rating-food-selector">
                                <label>Select food item to review:</label>
                                <div className="rating-items-options">
                                    {ratingOrder.items?.map((it, idx) => {
                                        const fId = typeof it.food === "object" ? it.food?._id : it.food;
                                        const isSelected = ratingFoodId === fId;

                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                className={`rating-item-pill ${isSelected ? "selected" : ""}`}
                                                onClick={() => setRatingFoodId(fId)}
                                            >
                                                <img
                                                    src={getFoodImageUrl(it.image)}
                                                    alt={it.name}
                                                    className="rating-item-thumb"
                                                />
                                                <span>{it.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Stars selector */}
                            <div className="rating-stars-cluster">
                                <label>Your Rating:</label>
                                <div className="stars-interactive-row">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`star-btn ${
                                                (hoveredStar || ratingStars) >= star ? "active" : ""
                                            }`}
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            onClick={() => setRatingStars(star)}
                                        >
                                            <FaStar />
                                        </button>
                                    ))}
                                    <span className="rating-score-label">
                                        {ratingStars} / 5 Stars
                                    </span>
                                </div>
                            </div>

                            {/* Comment textarea */}
                            <div className="rating-comment-cluster">
                                <label>Tell us what you liked (or what could be improved):</label>
                                <textarea
                                    rows="4"
                                    placeholder="Write your honest review here (taste, portion size, packaging, etc.)..."
                                    value={ratingComment}
                                    onChange={(e) => setRatingComment(e.target.value)}
                                    maxLength="500"
                                />
                            </div>

                            <div className="orders-modal-footer">
                                <button
                                    type="button"
                                    className="btn-modal-dismiss"
                                    onClick={() => setRatingModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-modal-submit-rating"
                                    disabled={submittingRating}
                                >
                                    {submittingRating ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
