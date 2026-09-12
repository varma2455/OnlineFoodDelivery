import React, { useState, useEffect, useContext, useMemo, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { supportAPI } from "../../services/api";
import "./Support.css";
import {
    FaSearch,
    FaQuestionCircle,
    FaHeadset,
    FaTicketAlt,
    FaShoppingBag,
    FaMotorcycle,
    FaCreditCard,
    FaUndo,
    FaWallet,
    FaStar,
    FaUser,
    FaStore,
    FaChevronDown,
    FaChevronUp,
    FaChevronRight,
    FaPaperclip,
    FaPaperPlane,
    FaTimes,
    FaCheck,
    FaCheckCircle,
    FaExclamationTriangle,
    FaInfoCircle,
    FaClock,
    FaPhoneAlt,
    FaEnvelope,
    FaExternalLinkAlt,
    FaSyncAlt,
    FaArrowRight,
    FaShieldAlt
} from "react-icons/fa";

const QUICK_CATEGORIES = [
    { id: "Orders", label: "Orders", icon: "🍔", hint: "Missing items, wrong dish, or meal quality" },
    { id: "Delivery", label: "Delivery", icon: "🚚", hint: "Track order, driver contact, or delays" },
    { id: "Payments", label: "Payments", icon: "💳", hint: "Failed charge, UPI issue, or charges" },
    { id: "Refunds", label: "Refunds", icon: "💰", hint: "Refund status, bank turnaround, or credit" },
    { id: "Wallet", label: "Wallet", icon: "👛", hint: "Wallet balance, top-up, or cashbacks" },
    { id: "Rewards", label: "Rewards", icon: "⭐", hint: "Points ledger, vouchers, or tier perks" },
    { id: "Account", label: "Account", icon: "👤", hint: "Address, login, phone, or password" },
    { id: "Restaurant", label: "Restaurant", icon: "🏪", hint: "Packaging, food safety, or temperature" }
];

const ORDER_ISSUE_OPTIONS = [
    "Food missing from package",
    "Wrong food item received",
    "Food quality / taste issue",
    "Food damaged / spilled packaging",
    "Late delivery beyond estimate",
    "Order marked delivered but not received",
    "Double charged or payment issue",
    "Cancel order request",
    "Other order issue"
];

const TICKET_STATUS_FILTERS = [
    { key: "all", label: "All Tickets" },
    { key: "Open", label: "Open" },
    { key: "In Progress", label: "In Progress" },
    { key: "Resolved", label: "Resolved" },
    { key: "Closed", label: "Closed" }
];

const Support = () => {
    const { token, user, showToast } = useContext(StoreContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Data States
    const [overview, setOverview] = useState(null);
    const [faqs, setFaqs] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Search & Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [expandedFaqId, setExpandedFaqId] = useState(null);
    const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
    const [ticketSearchQuery, setTicketSearchQuery] = useState("");

    // Modal & Action States
    const [showNewTicketModal, setShowNewTicketModal] = useState(false);
    const [selectedOrderForHelp, setSelectedOrderForHelp] = useState(null);
    const [showOrderIssueSelector, setShowOrderIssueSelector] = useState(false);
    const [activeTicketDetails, setActiveTicketDetails] = useState(null);
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    // New Ticket Form State
    const [ticketForm, setTicketForm] = useState({
        category: "Orders",
        orderId: "",
        issueType: "General Inquiry",
        subject: "",
        description: "",
        priority: "Medium"
    });
    const [ticketFile, setTicketFile] = useState(null);

    // Ticket Conversation State
    const [replyText, setReplyText] = useState("");
    const [replyFile, setReplyFile] = useState(null);
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackComment, setFeedbackComment] = useState("");
    const chatEndRef = useRef(null);

    // Fetch Overview and FAQs
    const fetchSupportData = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);

        try {
            const [ovRes, faqRes, tktRes] = await Promise.allSettled([
                supportAPI.getOverview(),
                supportAPI.getFAQs(),
                token ? supportAPI.getTickets() : Promise.resolve({ data: { tickets: [] } })
            ]);

            if (ovRes.status === "fulfilled" && ovRes.value.data?.success) {
                setOverview(ovRes.value.data);
            }

            if (faqRes.status === "fulfilled" && faqRes.value.data?.success) {
                setFaqs(faqRes.value.data.faqs || []);
            }

            if (tktRes.status === "fulfilled" && tktRes.value.data?.success) {
                setTickets(tktRes.value.data.tickets || []);
            }
        } catch (err) {
            console.error("Support fetch error:", err);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchSupportData();
    }, [fetchSupportData]);

    // Scroll chat to bottom when messages update
    useEffect(() => {
        if (activeTicketDetails && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeTicketDetails?.messages]);

    // Handle Quick Help Category Click
    const handleCategoryClick = (catId) => {
        setSelectedCategory(catId);
        // Scroll smoothly to FAQs
        const el = document.getElementById("faq-section-anchor");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Filter FAQs by Category and Search
    const filteredFaqs = useMemo(() => {
        return faqs.filter((item) => {
            const matchCat = selectedCategory === "All" || item.category === selectedCategory;
            if (!matchCat) return false;

            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase().trim();
            const qMatch = (item.question || "").toLowerCase().includes(q);
            const aMatch = (item.answer || "").toLowerCase().includes(q);
            const tagMatch = (item.tags || []).some((t) => t.toLowerCase().includes(q));
            return qMatch || aMatch || tagMatch;
        });
    }, [faqs, selectedCategory, searchQuery]);

    // Filtered Tickets
    const filteredTickets = useMemo(() => {
        return tickets.filter((t) => {
            const matchStatus =
                ticketStatusFilter === "all" ||
                t.status?.toLowerCase() === ticketStatusFilter.toLowerCase();

            if (!matchStatus) return false;

            if (!ticketSearchQuery.trim()) return true;
            const q = ticketSearchQuery.toLowerCase().trim();
            const idMatch = (t.ticketId || "").toLowerCase().includes(q);
            const subMatch = (t.subject || "").toLowerCase().includes(q);
            const descMatch = (t.description || "").toLowerCase().includes(q);
            const ordMatch = (t.orderIdText || "").toLowerCase().includes(q);
            return idMatch || subMatch || descMatch || ordMatch;
        });
    }, [tickets, ticketStatusFilter, ticketSearchQuery]);

    // Initiate Order Help
    const handleStartOrderHelp = (order) => {
        setSelectedOrderForHelp(order);
        setShowOrderIssueSelector(true);
    };

    // Select specific issue for an order
    const handleSelectOrderIssue = (issue) => {
        setShowOrderIssueSelector(false);
        setTicketForm({
            category: "Orders",
            orderId: selectedOrderForHelp?._id || "",
            issueType: issue,
            subject: `${issue} (Order #${selectedOrderForHelp?._id?.slice(-6)?.toUpperCase()})`,
            description: `I am reporting an issue regarding my order #${selectedOrderForHelp?._id?.slice(-6)?.toUpperCase()}: ${issue}. `,
            priority: issue.includes("missing") || issue.includes("damaged") || issue.includes("delivered") ? "High" : "Medium"
        });
        setShowNewTicketModal(true);
    };

    // Handle File Attachment Selection
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast("Image size must be under 5MB.", "error");
                return;
            }
            setTicketFile(file);
        }
    };

    // Submit New Support Ticket
    const handleCreateTicketSubmit = async (e) => {
        e.preventDefault();
        if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
            showToast("Please provide both a subject and issue description.", "error");
            return;
        }

        setIsSubmittingTicket(true);
        try {
            const formData = new FormData();
            formData.append("category", ticketForm.category);
            if (ticketForm.orderId) formData.append("orderId", ticketForm.orderId);
            formData.append("issueType", ticketForm.issueType);
            formData.append("subject", ticketForm.subject);
            formData.append("description", ticketForm.description);
            formData.append("priority", ticketForm.priority);
            if (ticketFile) formData.append("attachment", ticketFile);

            const res = await supportAPI.createTicket(formData);
            if (res.data?.success) {
                showToast(res.data.message || "Support ticket created successfully!", "success");
                setShowNewTicketModal(false);
                setTicketFile(null);
                setTicketForm({
                    category: "Orders",
                    orderId: "",
                    issueType: "General Inquiry",
                    subject: "",
                    description: "",
                    priority: "Medium"
                });

                // Refresh tickets
                const tRes = await supportAPI.getTickets();
                if (tRes.data?.success) setTickets(tRes.data.tickets);

                // Open ticket thread directly
                if (res.data.ticket) {
                    setActiveTicketDetails(res.data.ticket);
                }
            } else {
                showToast(res.data?.message || "Failed to create ticket.", "error");
            }
        } catch (err) {
            console.error("Ticket create error:", err);
            showToast(err.response?.data?.message || err.message || "Could not create ticket.", "error");
        } finally {
            setIsSubmittingTicket(false);
        }
    };

    // Open Existing Ticket Details & Thread
    const handleOpenTicketDetails = async (tkt) => {
        try {
            const res = await supportAPI.getTicketDetails(tkt.ticketId || tkt._id);
            if (res.data?.success) {
                setActiveTicketDetails(res.data.ticket);
            } else {
                setActiveTicketDetails(tkt);
            }
        } catch (e) {
            setActiveTicketDetails(tkt);
        }
    };

    // Send Reply to Active Ticket
    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || isSendingReply || !activeTicketDetails) return;

        setIsSendingReply(true);
        try {
            const formData = new FormData();
            formData.append("message", replyText.trim());
            if (replyFile) formData.append("attachment", replyFile);

            const res = await supportAPI.replyToTicket(activeTicketDetails.ticketId || activeTicketDetails._id, formData);
            if (res.data?.success) {
                setActiveTicketDetails(res.data.ticket);
                setReplyText("");
                setReplyFile(null);

                // Update ticket in main list
                setTickets((prev) =>
                    prev.map((t) => (t.ticketId === res.data.ticket.ticketId ? res.data.ticket : t))
                );
            }
        } catch (err) {
            console.error("Reply error:", err);
            showToast(err.response?.data?.message || "Failed to send message.", "error");
        } finally {
            setIsSendingReply(false);
        }
    };

    // Submit Satisfaction Feedback
    const handleSubmitFeedback = async () => {
        if (!activeTicketDetails || isSubmittingFeedback) return;
        setIsSubmittingFeedback(true);

        try {
            const res = await supportAPI.submitFeedback(activeTicketDetails.ticketId, {
                rating: feedbackRating,
                comment: feedbackComment
            });
            if (res.data?.success) {
                showToast("Thank you for your rating & feedback! ⭐", "success");
                setActiveTicketDetails(res.data.ticket);
                setTickets((prev) =>
                    prev.map((t) => (t.ticketId === res.data.ticket.ticketId ? res.data.ticket : t))
                );
            }
        } catch (err) {
            showToast(err.response?.data?.message || "Could not submit feedback.", "error");
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    // Cancel Order Handler
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            const res = await supportAPI.cancelOrder(orderId);
            if (res.data?.success) {
                showToast("Order cancelled successfully. Full refund initiated. 💰", "success");
                fetchSupportData();
            }
        } catch (err) {
            showToast(err.response?.data?.message || "Cancellation failed.", "error");
        }
    };

    const recentOrders = overview?.recentOrders || [];
    const openTicketsCount = overview?.openTicketsCount || 0;
    const supportHours = overview?.supportHours || {
        days: "Monday – Sunday",
        hours: "9:00 AM – 11:00 PM IST",
        status: "Available Now"
    };

    return (
        <div className="support-page-container">
            {/* ===================================================
                1. SUPPORT HERO HEADER & SEARCH
                =================================================== */}
            <header className="support-hero-header">
                <div className="hero-content-wrap">
                    <div className="support-badge-pill">
                        <FaHeadset className="headset-icon" />
                        <span>FoodExpress 24/7 Care Center</span>
                    </div>
                    <h1 className="support-main-title">How can we help you?</h1>
                    <p className="support-sub-title">
                        We are here to help with your orders, refunds, delivery inquiries, wallet, account, and more.
                    </p>

                    {/* Prominent Search Box */}
                    <div className="support-search-wrapper">
                        <FaSearch className="search-glass-icon" />
                        <input
                            type="text"
                            placeholder="Search for help (e.g. 'Where is my order?', 'Refund status', 'Payment failed')..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    {/* Example Quick Searches */}
                    <div className="search-suggestions-row">
                        <span className="suggestions-label">Popular Searches:</span>
                        <button className="suggestion-chip" onClick={() => setSearchQuery("Where is my order")}>
                            "Where is my order?"
                        </button>
                        <button className="suggestion-chip" onClick={() => setSearchQuery("refund")}>
                            "How do I get a refund?"
                        </button>
                        <button className="suggestion-chip" onClick={() => setSearchQuery("payment failed")}>
                            "Payment failed"
                        </button>
                        <button className="suggestion-chip" onClick={() => setSearchQuery("reward points")}>
                            "How do I use rewards?"
                        </button>
                    </div>
                </div>

                {/* Operating Hours Card */}
                <div className="support-hours-badge-card">
                    <div className="hours-status-dot pulse" />
                    <div>
                        <span className="hours-label">Support Operating Hours</span>
                        <strong className="hours-val">{supportHours.days}</strong>
                        <span className="hours-time">{supportHours.hours}</span>
                    </div>
                </div>
            </header>

            {/* Error Banner */}
            {hasError && (
                <div className="support-error-banner">
                    <FaExclamationTriangle className="err-icon" />
                    <div>
                        <h4>Unable to load support information</h4>
                        <p>Please check your network connection and try again.</p>
                    </div>
                    <button className="btn-retry" onClick={fetchSupportData}>
                        <FaSyncAlt /> Try Again
                    </button>
                </div>
            )}

            <div className="support-content-body">
                {/* ===================================================
                    2. QUICK HELP CATEGORIES GRID
                    =================================================== */}
                <section className="quick-categories-section">
                    <div className="section-title-row">
                        <div>
                            <h2 className="section-title">Quick Help Categories</h2>
                            <p className="section-subtitle">Select a topic to quickly resolve questions and explore actions</p>
                        </div>
                    </div>

                    <div className="categories-card-grid">
                        {QUICK_CATEGORIES.map((cat) => (
                            <div
                                key={cat.id}
                                className={`category-interactive-card ${selectedCategory === cat.id ? "active" : ""}`}
                                onClick={() => handleCategoryClick(cat.id)}
                            >
                                <span className="cat-icon">{cat.icon}</span>
                                <h3 className="cat-name">{cat.label}</h3>
                                <p className="cat-hint">{cat.hint}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ===================================================
                    3. ORDER HELP (RECENT ORDERS)
                    =================================================== */}
                <section className="order-help-section">
                    <div className="section-title-row">
                        <div>
                            <h2 className="section-title">Order Help</h2>
                            <p className="section-subtitle">Need assistance with a recent dish, delivery, or cancellation?</p>
                        </div>
                        <Link to="/my-orders" className="view-all-orders-link">
                            <span>View All Orders</span>
                            <FaArrowRight />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="orders-skeleton-row">
                            {[1, 2].map((s) => (
                                <div key={s} className="order-help-card skeleton" />
                            ))}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="empty-orders-help-card">
                            <FaShoppingBag className="empty-bag-icon" />
                            <h3>No recent orders found</h3>
                            <p>Once you place an order on FoodExpress, you can track it or request instant help right here.</p>
                            <Link to="/menu" className="btn-browse-food">
                                Browse Menu
                            </Link>
                        </div>
                    ) : (
                        <div className="recent-orders-help-grid">
                            {recentOrders.map((ord) => {
                                const ordIdShort = ord._id?.slice(-6)?.toUpperCase();
                                const firstItem = ord.items?.[0];
                                const isPlaced = ord.orderStatus === "Placed";
                                const isDelivered = ord.orderStatus === "Delivered";
                                const isCancelled = ord.orderStatus === "Cancelled";

                                return (
                                    <div key={ord._id} className="order-help-card">
                                        <div className="order-card-header">
                                            <div className="order-id-meta">
                                                <span className="order-num">Order #{ordIdShort}</span>
                                                <span className="order-date">
                                                    {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </span>
                                            </div>
                                            <span className={`status-pill ${ord.orderStatus?.toLowerCase().replace(/\s+/g, "-")}`}>
                                                {ord.orderStatus}
                                            </span>
                                        </div>

                                        <div className="order-card-body">
                                            <div className="dish-preview">
                                                <strong>{firstItem?.name || "Delicious Food"}</strong>
                                                {ord.items?.length > 1 && (
                                                    <span className="extra-count"> +{ord.items.length - 1} more</span>
                                                )}
                                            </div>
                                            <div className="order-amount-line">
                                                <span>Final Amount: <strong>₹{ord.finalAmount || ord.totalAmount}</strong></span>
                                                <span className="pay-method">({ord.paymentMethod})</span>
                                            </div>
                                        </div>

                                        <div className="order-card-actions">
                                            {isPlaced && (
                                                <button
                                                    className="btn-action-cancel"
                                                    onClick={() => handleCancelOrder(ord._id)}
                                                >
                                                    Cancel Order
                                                </button>
                                            )}

                                            {!isDelivered && !isCancelled && (
                                                <Link to={`/my-orders`} className="btn-action-track">
                                                    <FaMotorcycle /> Track Order
                                                </Link>
                                            )}

                                            <button
                                                className="btn-action-get-help"
                                                onClick={() => handleStartOrderHelp(ord)}
                                            >
                                                <FaQuestionCircle /> Get Help
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ===================================================
                    4. MY SUPPORT TICKETS SECTION
                    =================================================== */}
                <section className="my-tickets-section">
                    <div className="section-title-row">
                        <div>
                            <h2 className="section-title">My Support Tickets</h2>
                            <p className="section-subtitle">Track your open inquiries, support replies, and resolutions</p>
                        </div>
                        <button
                            className="btn-new-ticket-cta"
                            onClick={() => {
                                setSelectedOrderForHelp(null);
                                setTicketForm({
                                    category: "Orders",
                                    orderId: "",
                                    issueType: "General Inquiry",
                                    subject: "",
                                    description: "",
                                    priority: "Medium"
                                });
                                setShowNewTicketModal(true);
                            }}
                        >
                            <FaTicketAlt /> Create Support Ticket
                        </button>
                    </div>

                    {/* Toolbar & Filters */}
                    <div className="tickets-control-toolbar">
                        <div className="ticket-search-box">
                            <FaSearch className="icon" />
                            <input
                                type="text"
                                placeholder="Search tickets by ID, subject, or order..."
                                value={ticketSearchQuery}
                                onChange={(e) => setTicketSearchQuery(e.target.value)}
                            />
                            {ticketSearchQuery && (
                                <button className="clear-btn" onClick={() => setTicketSearchQuery("")}>
                                    <FaTimes />
                                </button>
                            )}
                        </div>

                        <div className="status-filter-pills">
                            {TICKET_STATUS_FILTERS.map((f) => (
                                <button
                                    key={f.key}
                                    className={`pill-btn ${ticketStatusFilter === f.key ? "active" : ""}`}
                                    onClick={() => setTicketStatusFilter(f.key)}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredTickets.length === 0 ? (
                        <div className="empty-tickets-box">
                            <FaHeadset className="empty-tkt-icon" />
                            <h3>No support tickets found</h3>
                            <p>
                                {ticketSearchQuery
                                    ? "No tickets match your search filters."
                                    : "You don't have any open inquiries. If you ever experience an issue, our care team is ready to assist!"}
                            </p>
                            <button
                                className="btn-create-first-tkt"
                                onClick={() => setShowNewTicketModal(true)}
                            >
                                <FaTicketAlt /> Create New Ticket
                            </button>
                        </div>
                    ) : (
                        <div className="tickets-card-grid">
                            {filteredTickets.map((tkt) => {
                                const statusClass = (tkt.status || "Open").toLowerCase().replace(/\s+/g, "-");
                                return (
                                    <div
                                        key={tkt._id || tkt.ticketId}
                                        className="ticket-summary-card"
                                        onClick={() => handleOpenTicketDetails(tkt)}
                                    >
                                        <div className="ticket-card-top">
                                            <span className="tkt-id-badge">#{tkt.ticketId}</span>
                                            <span className={`tkt-status-badge ${statusClass}`}>
                                                {tkt.status}
                                            </span>
                                        </div>

                                        <h3 className="tkt-subject">{tkt.subject}</h3>

                                        <div className="tkt-meta-row">
                                            <span className="tkt-category">
                                                <strong>Category:</strong> {tkt.category}
                                            </span>
                                            {tkt.orderIdText && (
                                                <span className="tkt-order-ref">
                                                    <strong>Order:</strong> #{tkt.orderIdText}
                                                </span>
                                            )}
                                        </div>

                                        <p className="tkt-desc-snippet">{tkt.description}</p>

                                        <div className="ticket-card-footer">
                                            <span className="tkt-date">
                                                <FaClock className="clock-icon" />
                                                {new Date(tkt.createdAt).toLocaleDateString("en-IN", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </span>
                                            <button className="btn-view-thread">
                                                <span>View Thread</span>
                                                <FaArrowRight />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ===================================================
                    5. FREQUENTLY ASKED QUESTIONS (ACCORDION)
                    =================================================== */}
                <section className="faq-accordion-section" id="faq-section-anchor">
                    <div className="section-title-row">
                        <div>
                            <h2 className="section-title">Frequently Asked Questions</h2>
                            <p className="section-subtitle">
                                {selectedCategory !== "All"
                                    ? `Showing helpful articles for: ${selectedCategory}`
                                    : "Instant answers across common topics, orders, payments, and refunds"}
                            </p>
                        </div>
                        {selectedCategory !== "All" && (
                            <button className="btn-reset-cat" onClick={() => setSelectedCategory("All")}>
                                View All Topics
                            </button>
                        )}
                    </div>

                    <div className="faq-items-wrapper">
                        {filteredFaqs.length === 0 ? (
                            <div className="no-faqs-found">
                                <FaQuestionCircle className="question-icon" />
                                <h4>No answers found matching "{searchQuery}"</h4>
                                <p>Can't find what you are looking for? Create a support ticket and our team will assist you directly.</p>
                                <button className="btn-ask-support" onClick={() => setShowNewTicketModal(true)}>
                                    <FaTicketAlt /> Ask Support Team
                                </button>
                            </div>
                        ) : (
                            filteredFaqs.map((faq) => {
                                const isExpanded = expandedFaqId === faq._id;
                                return (
                                    <div
                                        key={faq._id}
                                        className={`faq-accordion-card ${isExpanded ? "expanded" : ""}`}
                                    >
                                        <div
                                            className="faq-question-header"
                                            onClick={() => setExpandedFaqId(isExpanded ? null : faq._id)}
                                        >
                                            <div className="faq-q-text-wrap">
                                                <span className="faq-category-tag">{faq.category}</span>
                                                <h3 className="faq-question-title">{faq.question}</h3>
                                            </div>
                                            <div className="faq-chevron-icon">
                                                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="faq-answer-body">
                                                <p>{faq.answer}</p>
                                                {faq.tags?.length > 0 && (
                                                    <div className="faq-tags-cluster">
                                                        {faq.tags.map((t, idx) => (
                                                            <span key={idx} className="faq-tag">#{t}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* ===================================================
                    6. SAFETY & CONTACT ESCALATION BANNER
                    =================================================== */}
                <section className="support-escalation-dual-grid">
                    <div className="escalation-card safety-card">
                        <div className="card-icon-bubble safety">
                            <FaShieldAlt />
                        </div>
                        <div className="card-meta">
                            <span className="alert-tag">High Priority Compliance</span>
                            <h3>Food Safety or Hygiene Concern?</h3>
                            <p>
                                If you experienced an allergic reaction, foreign substance, or severe food safety issue, please notify FoodExpress Support immediately.
                            </p>
                            <button
                                className="btn-escalate-safety"
                                onClick={() => {
                                    setTicketForm({
                                        category: "Safety",
                                        orderId: "",
                                        issueType: "Food Safety / Allergy Issue",
                                        subject: "URGENT: Food Safety Concern Reported",
                                        description: "I am reporting an urgent hygiene / health / safety concern regarding my food delivery: ",
                                        priority: "Urgent"
                                    });
                                    setShowNewTicketModal(true);
                                }}
                            >
                                Report Food Safety Issue
                            </button>
                        </div>
                    </div>

                    <div className="escalation-card contact-card">
                        <div className="card-icon-bubble contact">
                            <FaHeadset />
                        </div>
                        <div className="card-meta">
                            <span className="alert-tag blue">Dedicated Care Team</span>
                            <h3>Still need personalized help?</h3>
                            <p>
                                Our care specialists are available 7 days a week from 9:00 AM to 11:00 PM IST to answer any questions.
                            </p>
                            <div className="contact-direct-links">
                                <a href="tel:+9118002004567" className="direct-link">
                                    <FaPhoneAlt /> +91 1800 200 4567
                                </a>
                                <a href="mailto:care@foodexpress.in" className="direct-link">
                                    <FaEnvelope /> care@foodexpress.in
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* ===================================================
                7. ORDER ISSUE SELECTOR MODAL ("What went wrong?")
                =================================================== */}
            {showOrderIssueSelector && selectedOrderForHelp && (
                <div className="support-modal-backdrop" onClick={() => setShowOrderIssueSelector(false)}>
                    <div className="support-modal-card issue-selector" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowOrderIssueSelector(false)}>
                            <FaTimes />
                        </button>

                        <div className="issue-header-wrap">
                            <span className="issue-badge-icon">🛍️</span>
                            <h3>What went wrong with Order #{selectedOrderForHelp._id?.slice(-6)?.toUpperCase()}?</h3>
                            <p>Select the option that best describes your experience:</p>
                        </div>

                        <div className="issues-options-list">
                            {ORDER_ISSUE_OPTIONS.map((opt, idx) => (
                                <button
                                    key={idx}
                                    className="issue-option-btn"
                                    onClick={() => handleSelectOrderIssue(opt)}
                                >
                                    <span className="radio-bullet" />
                                    <span className="opt-text">{opt}</span>
                                    <FaChevronRight className="arrow-icon" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ===================================================
                8. NEW SUPPORT TICKET MODAL
                =================================================== */}
            {showNewTicketModal && (
                <div className="support-modal-backdrop" onClick={() => setShowNewTicketModal(false)}>
                    <div className="support-modal-card ticket-form-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowNewTicketModal(false)}>
                            <FaTimes />
                        </button>

                        <div className="modal-header-icon-center">
                            <FaTicketAlt />
                        </div>
                        <h2 className="modal-form-title">Create Support Ticket</h2>
                        <p className="modal-form-subtitle">
                            Provide details below and our team will review your inquiry immediately.
                        </p>

                        <form onSubmit={handleCreateTicketSubmit} className="new-ticket-form">
                            <div className="form-row-dual">
                                <div className="form-group">
                                    <label>Issue Category</label>
                                    <select
                                        value={ticketForm.category}
                                        onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                                        required
                                    >
                                        <option value="Orders">Orders</option>
                                        <option value="Delivery">Delivery</option>
                                        <option value="Payments">Payments</option>
                                        <option value="Refunds">Refunds</option>
                                        <option value="Wallet">Wallet</option>
                                        <option value="Rewards">Rewards</option>
                                        <option value="Account">Account</option>
                                        <option value="Restaurant">Restaurant</option>
                                        <option value="Safety">Food Safety</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Related Order (Optional)</label>
                                    <select
                                        value={ticketForm.orderId}
                                        onChange={(e) => setTicketForm({ ...ticketForm, orderId: e.target.value })}
                                    >
                                        <option value="">-- No specific order --</option>
                                        {recentOrders.map((ord) => (
                                            <option key={ord._id} value={ord._id}>
                                                Order #{ord._id?.slice(-6)?.toUpperCase()} (₹{ord.finalAmount})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    placeholder="Brief summary of the issue..."
                                    value={ticketForm.subject}
                                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    rows="4"
                                    placeholder="Please describe what happened in detail..."
                                    value={ticketForm.description}
                                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-row-dual">
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select
                                        value={ticketForm.priority}
                                        onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Attach Photo / Receipt (Optional)</label>
                                    <label className="custom-file-upload">
                                        <FaPaperclip />
                                        <span>{ticketFile ? ticketFile.name : "Choose File (JPG, PNG, max 5MB)"}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: "none" }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="modal-actions-bar">
                                <button
                                    type="button"
                                    className="btn-form-cancel"
                                    onClick={() => setShowNewTicketModal(false)}
                                    disabled={isSubmittingTicket}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-form-submit"
                                    disabled={isSubmittingTicket}
                                >
                                    {isSubmittingTicket ? "Submitting..." : "Submit Ticket"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===================================================
                9. TICKET DETAILS & CONVERSATION THREAD DRAWER
                =================================================== */}
            {activeTicketDetails && (
                <div className="support-modal-backdrop" onClick={() => setActiveTicketDetails(null)}>
                    <div className="support-modal-card thread-drawer-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setActiveTicketDetails(null)}>
                            <FaTimes />
                        </button>

                        {/* Thread Header */}
                        <div className="thread-header-bar">
                            <div className="thread-id-title-wrap">
                                <span className="tkt-code-badge">#{activeTicketDetails.ticketId}</span>
                                <h2 className="tkt-thread-subject">{activeTicketDetails.subject}</h2>
                            </div>
                            <div className="thread-badges-strip">
                                <span className={`status-tag ${activeTicketDetails.status?.toLowerCase().replace(/\s+/g, "-")}`}>
                                    {activeTicketDetails.status}
                                </span>
                                <span className={`priority-tag ${activeTicketDetails.priority?.toLowerCase()}`}>
                                    {activeTicketDetails.priority} Priority
                                </span>
                            </div>
                        </div>

                        {/* Order info banner if linked */}
                        {activeTicketDetails.orderIdText && (
                            <div className="linked-order-banner">
                                <FaShoppingBag className="bag-icon" />
                                <span>Linked to <strong>Order #{activeTicketDetails.orderIdText}</strong></span>
                                <Link to={`/my-orders`} className="order-deep-link">
                                    View Order <FaExternalLinkAlt />
                                </Link>
                            </div>
                        )}

                        {/* Conversation Thread History */}
                        <div className="conversation-stream">
                            {activeTicketDetails.messages?.map((msg, idx) => {
                                const isUser = msg.sender === "user";
                                const isSystem = msg.sender === "system";

                                return (
                                    <div
                                        key={msg._id || idx}
                                        className={`chat-bubble-row ${isUser ? "user-row" : isSystem ? "system-row" : "support-row"}`}
                                    >
                                        <div className={`chat-bubble ${isUser ? "user-bubble" : isSystem ? "system-bubble" : "support-bubble"}`}>
                                            <div className="bubble-sender-meta">
                                                <strong>{msg.senderName}</strong>
                                                <span className="bubble-time">
                                                    {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </span>
                                            </div>
                                            <p className="bubble-text">{msg.message}</p>
                                            {msg.attachment && (
                                                <div className="bubble-attachment">
                                                    <a href={msg.attachment} target="_blank" rel="noopener noreferrer">
                                                        <img src={msg.attachment} alt="Attachment" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Reply Form (if ticket not closed) */}
                        {activeTicketDetails.status !== "Closed" ? (
                            <form onSubmit={handleSendReply} className="thread-reply-form">
                                {replyFile && (
                                    <div className="reply-attachment-chip">
                                        <FaPaperclip />
                                        <span>{replyFile.name}</span>
                                        <button type="button" onClick={() => setReplyFile(null)}><FaTimes /></button>
                                    </div>
                                )}
                                <div className="reply-input-row">
                                    <label className="reply-file-btn" title="Attach an image">
                                        <FaPaperclip />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setReplyFile(e.target.files?.[0] || null)}
                                            style={{ display: "none" }}
                                        />
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Type your message to support..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="btn-send-reply"
                                        disabled={!replyText.trim() || isSendingReply}
                                    >
                                        <FaPaperPlane />
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="ticket-closed-notice">
                                <FaCheckCircle />
                                <span>This support ticket has been closed. If you need further assistance, please open a new ticket.</span>
                            </div>
                        )}

                        {/* Feedback Rating Box for Resolved / Closed Tickets */}
                        {(activeTicketDetails.status === "Resolved" || activeTicketDetails.status === "Closed") && (
                            <div className="ticket-feedback-container">
                                <h4>How was your support experience?</h4>
                                {activeTicketDetails.feedback?.rating ? (
                                    <div className="existing-feedback-display">
                                        <div className="stars-row">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <FaStar
                                                    key={s}
                                                    className={s <= activeTicketDetails.feedback.rating ? "star filled" : "star"}
                                                />
                                            ))}
                                        </div>
                                        {activeTicketDetails.feedback.comment && (
                                            <p className="feedback-comment">"{activeTicketDetails.feedback.comment}"</p>
                                        )}
                                        <span className="submitted-note">Feedback submitted. Thank you!</span>
                                    </div>
                                ) : (
                                    <div className="submit-feedback-form">
                                        <div className="stars-picker-row">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <FaStar
                                                    key={s}
                                                    className={`star-pick ${s <= feedbackRating ? "active" : ""}`}
                                                    onClick={() => setFeedbackRating(s)}
                                                />
                                            ))}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Optional comment about your experience..."
                                            value={feedbackComment}
                                            onChange={(e) => setFeedbackComment(e.target.value)}
                                        />
                                        <button
                                            className="btn-submit-feedback"
                                            onClick={handleSubmitFeedback}
                                            disabled={isSubmittingFeedback}
                                        >
                                            {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Support;
