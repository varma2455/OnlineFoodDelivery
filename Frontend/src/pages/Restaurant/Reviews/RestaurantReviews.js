import React, { useState, useEffect, useCallback, useContext } from "react";
import { StoreContext } from "../../../context/StoreContext";
import { restaurantAPI, getFoodImageUrl } from "../../../services/api";
import Loader from "../../../components/Loader/Loader";
import {
    FaStar,
    FaSyncAlt,
    FaUtensils,
    FaCommentAlt
} from "react-icons/fa";

const RestaurantReviews = () => {
    const { showToast } = useContext(StoreContext);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(5.0);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await restaurantAPI.getReviews();
            setReviews(data.reviews || []);
            if (data.averageRating) setAverageRating(data.averageRating);
        } catch (err) {
            console.error("Reviews fetch error:", err);
            showToast(err.message || "Failed to load reviews", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                        <FaStar color="#f59e0b" /> Customer Dish Reviews & Feedback
                    </h1>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                        Hear what customers love about your dishes and recipes.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchReviews}
                    style={{
                        padding: "9px 16px",
                        borderRadius: "10px",
                        border: "1.5px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#334155",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >
                    <FaSyncAlt /> Refresh
                </button>
            </div>

            {/* Overall Rating Card */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px 24px", border: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a" }}>
                        {averageRating}
                    </div>
                    <div>
                        <div style={{ color: "#f59e0b", display: "flex", gap: "2px", fontSize: "16px" }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <FaStar key={i} color={i <= Math.round(averageRating) ? "#f59e0b" : "#cbd5e1"} />
                            ))}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                            Total {reviews.length} customer reviews
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            {loading ? (
                <Loader />
            ) : reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "#ffffff", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                    <FaCommentAlt size={38} color="#cbd5e1" style={{ marginBottom: "12px" }} />
                    <h3 style={{ margin: "0 0 6px", color: "#0f172a" }}>No Customer Reviews Yet</h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                        Reviews left by customers on your dishes will be shown here.
                    </p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                    {reviews.map((rev) => (
                        <div key={rev._id} style={{ background: "#ffffff", borderRadius: "14px", padding: "18px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <img
                                        src={getFoodImageUrl(rev.foodImage)}
                                        alt={rev.foodName}
                                        style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }}
                                    />
                                    <div>
                                        <strong style={{ fontSize: "14px", color: "#0f172a" }}>{rev.foodName}</strong>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>By {rev.userName}</div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#fef9c3", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", color: "#854d0e" }}>
                                    <FaStar color="#f59e0b" size={12} /> {rev.rating}.0
                                </div>
                            </div>

                            <p style={{ margin: 0, fontSize: "13px", color: "#334155", fontStyle: "italic", lineHeight: "1.5" }}>
                                "{rev.comment}"
                            </p>

                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "auto" }}>
                                {new Date(rev.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RestaurantReviews;
