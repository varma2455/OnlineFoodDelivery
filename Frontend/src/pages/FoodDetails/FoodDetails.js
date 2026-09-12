import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { foodAPI, getFoodImageUrl } from "../../services/api";
import FoodCard from "../../components/FoodCard/FoodCard";
import Loader from "../../components/Loader/Loader";
import "./FoodDetails.css";
import {
    FaStar,
    FaHeart,
    FaRegHeart,
    FaMinus,
    FaPlus,
    FaStore,
    FaClock,
    FaLeaf,
    FaDrumstickBite,
    FaShoppingBag,
    FaArrowLeft,
    FaCheckCircle,
    FaUser
} from "react-icons/fa";

const FoodDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        cartItems,
        addToCart,
        updateCartQuantity,
        wishlist,
        toggleWishlist,
        user,
        showToast
    } = useContext(StoreContext);

    const [food, setFood] = useState(null);
    const [relatedFoods, setRelatedFoods] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    // Add review form state
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                // 1. Fetch food
                const { data } = await foodAPI.getFoodById(id);
                setFood(data.food);

                // 2. Fetch related foods
                try {
                    const relatedRes = await foodAPI.getRelatedFoods(id);
                    setRelatedFoods(relatedRes.data.foods || []);
                } catch (e) {}

                // 3. Fetch reviews
                try {
                    const reviewsRes = await foodAPI.getReviews(id);
                    setReviews(reviewsRes.data.reviews || []);
                } catch (e) {}
            } catch (error) {
                console.error("Error fetching food details:", error);
                showToast(error.message || "Food not found", "error");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetails();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [id, showToast]);

    if (loading) {
        return <Loader />;
    }

    if (!food) {
        return (
            <div className="food-not-found">
                <h2>Dish Not Found</h2>
                <p>The food item you are looking for does not exist or has been removed.</p>
                <Link to="/menu" className="btn-back-menu">
                    <FaArrowLeft /> Back to Menu
                </Link>
            </div>
        );
    }

    const isFavorite = wishlist.includes(food._id);
    const currentCartQty = cartItems[food._id] || 0;
    const hasDiscount = food.discountPrice && food.discountPrice > 0 && food.discountPrice < food.price;
    const effectivePrice = hasDiscount ? food.discountPrice : food.price;

    const handleAddToCart = () => {
        navigate(`/food/${food._id}/customize`, { state: { food } });
    };

    const handleBuyNow = () => {
        if (currentCartQty === 0) {
            addToCart(food._id, quantity);
        }
        navigate("/checkout");
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            showToast("Please login to write a review!", "info");
            navigate("/login");
            return;
        }

        if (!newComment.trim()) {
            showToast("Please write a short review comment.", "error");
            return;
        }

        try {
            setSubmittingReview(true);
            const { data } = await foodAPI.addReview(food._id, {
                rating: newRating,
                comment: newComment
            });

            showToast(data.message || "Review added!", "success");
            setReviews([data.review, ...reviews]);
            setFood((prev) => ({
                ...prev,
                rating: data.foodRating,
                totalReviews: data.totalReviews
            }));
            setNewComment("");
            setNewRating(5);
        } catch (error) {
            showToast(error.message || "Failed to submit review", "error");
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="food-details-page">
            <div className="food-details-container">
                {/* Back navigation */}
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Back
                </button>

                {/* Main Food Showcase */}
                <div className="food-showcase-card">
                    {/* Left: Media */}
                    <div className="food-showcase-media">
                        <img
                            src={getFoodImageUrl(food.image)}
                            alt={food.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900";
                            }}
                        />
                        <button
                            className={`wishlist-pill-btn ${isFavorite ? "active" : ""}`}
                            onClick={() => toggleWishlist(food._id)}
                        >
                            {isFavorite ? <FaHeart /> : <FaRegHeart />}{" "}
                            {isFavorite ? "Saved to Wishlist" : "Add to Wishlist"}
                        </button>
                    </div>

                    {/* Right: Info & Actions */}
                    <div className="food-showcase-info">
                        <div className="food-tags-row">
                            <span className={`veg-tag ${food.isVeg ? "veg" : "non-veg"}`}>
                                {food.isVeg ? <FaLeaf /> : <FaDrumstickBite />}{" "}
                                {food.isVeg ? "Pure Veg" : "Non-Veg"}
                            </span>
                            <span className="category-tag">{food.category}</span>
                            {food.featured && <span className="featured-tag">★ Featured</span>}
                        </div>

                        <h1 className="food-details-name">{food.name}</h1>

                        <div className="food-meta-row">
                            <span className="restaurant-name">
                                <FaStore /> {food.restaurant || "FoodExpress Cloud Kitchen"}
                            </span>
                            <span className="rating-pill">
                                <FaStar /> {food.rating || "4.5"}{" "}
                                <small>({food.totalReviews || 0} reviews)</small>
                            </span>
                            <span className="prep-time">
                                <FaClock /> {food.preparationTime || 20} mins prep
                            </span>
                        </div>

                        <p className="food-description">{food.description}</p>

                        <div className="pricing-box">
                            <div className="price-main">
                                <span className="current-price">₹{effectivePrice}</span>
                                {hasDiscount && <span className="original-price">₹{food.price}</span>}
                            </div>
                            {hasDiscount && (
                                <span className="save-badge">
                                    Save ₹{food.price - food.discountPrice} (
                                    {Math.round(((food.price - food.discountPrice) / food.price) * 100)}% OFF)
                                </span>
                            )}
                        </div>

                        {/* Quantity Selector & Action Buttons */}
                        <div className="order-actions-box">
                            <div className="detail-qty-control">
                                <button
                                    className="btn-qty"
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                >
                                    <FaMinus />
                                </button>
                                <span className="qty-number">{quantity}</span>
                                <button
                                    className="btn-qty"
                                    onClick={() => setQuantity((q) => q + 1)}
                                >
                                    <FaPlus />
                                </button>
                            </div>

                            <button className="btn-add-cart" onClick={handleAddToCart}>
                                <FaShoppingBag /> Add to Cart (₹{effectivePrice * quantity})
                            </button>

                            <button className="btn-buy-now" onClick={handleBuyNow}>
                                Buy Now
                            </button>
                        </div>

                        {currentCartQty > 0 && (
                            <div className="in-cart-indicator">
                                <FaCheckCircle /> {currentCartQty} already in your cart.{" "}
                                <Link to="/cart">View Cart →</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* REVIEWS & RATINGS SECTION */}
                <div className="reviews-section">
                    <div className="reviews-header">
                        <h2>Ratings & Customer Reviews</h2>
                        <span className="overall-score">
                            <FaStar className="star" /> {food.rating || "4.5"} / 5.0
                        </span>
                    </div>

                    <div className="reviews-layout">
                        {/* Review Form */}
                        <div className="add-review-card">
                            <h3>Rate this Dish</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="rating-select-group">
                                    <label>Your Rating:</label>
                                    <div className="stars-picker">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                type="button"
                                                key={star}
                                                className={`star-pick-btn ${newRating >= star ? "selected" : ""}`}
                                                onClick={() => setNewRating(star)}
                                            >
                                                <FaStar />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="comment-group">
                                    <label>Your Feedback:</label>
                                    <textarea
                                        placeholder="How was the taste, portion, and presentation?"
                                        rows="3"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-submit-review"
                                    disabled={submittingReview}
                                >
                                    {submittingReview ? "Submitting..." : "Post Review"}
                                </button>
                            </form>
                        </div>

                        {/* Reviews List */}
                        <div className="reviews-list">
                            {reviews.length > 0 ? (
                                reviews.map((rev) => (
                                    <div key={rev._id} className="review-card">
                                        <div className="review-card-top">
                                            <div className="reviewer-info">
                                                <div className="reviewer-avatar">
                                                    <FaUser />
                                                </div>
                                                <div>
                                                    <strong>{rev.userName || "Verified Foodie"}</strong>
                                                    <small>
                                                        {rev.createdAt
                                                            ? new Date(rev.createdAt).toLocaleDateString()
                                                            : "Recently"}
                                                    </small>
                                                </div>
                                            </div>
                                            <div className="review-stars">
                                                {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                                                    <FaStar key={i} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="review-text">{rev.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="no-reviews-box">
                                    <p>No reviews yet for this dish. Be the first to share your thoughts!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RELATED DISHES */}
                {relatedFoods.length > 0 && (
                    <div className="related-foods-section">
                        <h2>More Delicious {food.category} Options</h2>
                        <div className="related-grid">
                            {relatedFoods.map((item) => (
                                <FoodCard key={item._id} food={item} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoodDetails;
