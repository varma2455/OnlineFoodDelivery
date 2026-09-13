import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { getFoodImageUrl } from "../../services/api";
import "./FoodCard.css";
import {
    FaStar,
    FaHeart,
    FaRegHeart,
    FaPlus,
    FaMinus,
    FaClock,
    FaStore,
    FaSlidersH
} from "react-icons/fa";

export default function FoodCard({ food, compact = false }) {
    const navigate = useNavigate();
    const { cartItems, addToCart, removeFromCart, wishlist, toggleWishlist, showToast } = useContext(StoreContext);

    if (!food) return null;

    // Rule #37: Customer-facing food cards must obey: stock > 0 visible, stock <= 0 hidden
    if (food.stock !== undefined && food.stock !== null && Number(food.stock) <= 0) {
        return null;
    }

    const quantity = cartItems[food._id] || 0;
    const isFavorite = wishlist?.includes(food._id);

    const hasDiscount = food.discountPrice && food.discountPrice > 0 && food.discountPrice < food.price;
    const discountPercent = hasDiscount
        ? Math.round(((food.price - food.discountPrice) / food.price) * 100)
        : 0;

    const handleAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/food/${food._id}/customize`, { state: { food } });
    };

    const handleRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        removeFromCart(food._id);
    };

    return (
        <div className={`food-card ${compact ? "compact" : ""} all-dishes-card`}>
            {/* Image Container */}
            <div className="food-card-media">
                <Link to={`/food/${food._id}`} className="food-card-img-link">
                    <img
                        className="food-image"
                        src={getFoodImageUrl(food.image)}
                        alt={food.name}
                        loading="eager"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900";
                        }}
                    />
                </Link>

                {/* Veg / Non-Veg Indicator */}
                <div className={`veg-indicator ${food.isVeg ? "veg" : "non-veg"}`} title={food.isVeg ? "Vegetarian" : "Non-Vegetarian"}>
                    <span className="dot" />
                </div>

                {/* Wishlist Button */}
                <button
                    type="button"
                    className={`wishlist-toggle-btn ${isFavorite ? "active" : ""}`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(food._id);
                    }}
                    aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                >
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                </button>

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="discount-tag">
                        {discountPercent}% OFF
                    </div>
                )}

                {/* Customizable Badge */}
                <div className="customizable-badge" title="Customizable item">
                    <FaSlidersH /> Customize
                </div>
            </div>

            {/* Food Content Details */}
            <div className="food-card-body all-dishes-card-content">
                <div className="food-card-meta">
                    <span className="food-restaurant" title={food.restaurant || "FoodExpress Kitchen"}>
                        <FaStore className="meta-icon" /> {food.restaurant || "FoodExpress Kitchen"}
                    </span>
                    <span className="food-rating">
                        <FaStar className="star-icon" /> {food.rating || "4.7"}{food.totalReviews ? ` (${food.totalReviews})` : ""} • {food.deliveryTime || food.time || 25} min
                    </span>
                </div>

                <h3 className="food-title" title={food.name}>
                    <Link to={`/food/${food._id}`} className="food-title-link">
                        {food.name}
                    </Link>
                </h3>

                {!compact && (
                    <p className="food-desc">
                        {food.description?.length > 70
                            ? `${food.description.substring(0, 70)}...`
                            : food.description}
                    </p>
                )}

                <div className="food-footer">
                    <div className="price-block">
                        <span className="current-price">
                            ₹{hasDiscount ? food.discountPrice : food.price}
                        </span>
                        {hasDiscount && (
                            <span className="original-price">
                                ₹{food.price}
                            </span>
                        )}
                    </div>

                    {/* Cart Action: Add Button or +/- Counter */}
                    <div className="cart-action-wrapper">
                        {quantity > 0 ? (
                            <div className="qty-selector">
                                <button
                                    type="button"
                                    className="qty-btn"
                                    onClick={handleRemove}
                                    aria-label="Decrease quantity"
                                >
                                    <FaMinus />
                                </button>
                                <span className="qty-count">{quantity}</span>
                                <button
                                    type="button"
                                    className="qty-btn"
                                    onClick={handleAdd}
                                    aria-label="Increase quantity"
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="add-to-cart-btn"
                                onClick={handleAdd}
                            >
                                <FaPlus /> Add
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}