import React from "react";
import { getFoodImageUrl } from "../../../services/api";
import {
    FaStar,
    FaClock,
    FaMotorcycle,
    FaStore,
    FaShieldAlt,
    FaLeaf,
    FaDrumstickBite
} from "react-icons/fa";

export default function FoodPreview({ food }) {
    if (!food) return null;

    const rating = food.rating || 4.7;
    const reviews = food.totalReviews ? `${food.totalReviews}+ reviews` : "2.4k ratings";
    const prepTime = food.preparationTime || food.deliveryTime || 25;

    return (
        <div className="customization-preview-card">
            {/* Main Image with Badges */}
            <div className="preview-image-wrapper">
                <img
                    src={getFoodImageUrl(food.image)}
                    alt={food.name}
                    className="preview-food-img"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900";
                    }}
                />

                {/* Veg / Non-Veg Badge */}
                <div className={`diet-pill ${food.isVeg ? "veg" : "non-veg"}`}>
                    {food.isVeg ? <FaLeaf /> : <FaDrumstickBite />}
                    <span>{food.isVeg ? "Pure Veg" : "Non-Veg"}</span>
                </div>

                {/* Category Badge */}
                {food.category && (
                    <div className="category-pill">
                        {food.category}
                    </div>
                )}
            </div>

            {/* Rating Bar */}
            <div className="preview-rating-row">
                <div className="rating-pill">
                    <FaStar className="star-icon" />
                    <strong>{rating}</strong>
                    <span>({reviews})</span>
                </div>
                <div className="area-pill">
                    <FaStore /> {food.restaurant || "FoodExpress Cloud Kitchen"}
                </div>
            </div>

            {/* Delivery Details Cards */}
            <div className="preview-delivery-cards">
                <div className="delivery-card-item">
                    <div className="delivery-icon-box">
                        <FaClock />
                    </div>
                    <div className="delivery-meta">
                        <strong>Delivery Time</strong>
                        <span>{prepTime} - {Number(prepTime) + 10} Mins</span>
                    </div>
                </div>

                <div className="delivery-card-item">
                    <div className="delivery-icon-box delivery-motor">
                        <FaMotorcycle />
                    </div>
                    <div className="delivery-meta">
                        <strong>Free Delivery</strong>
                        <span>On orders above ₹500</span>
                    </div>
                </div>
            </div>

            {/* Hygiene & Safety Badge */}
            <div className="safety-guarantee-note">
                <FaShieldAlt />
                <span>100% Contactless Delivery & Kitchen Safety Verified</span>
            </div>
        </div>
    );
}
