import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { getFoodImageUrl } from "../../config/api";
import "./DashboardFavorites.css";
import {
  FaHeart,
  FaStar,
  FaPlus,
  FaMinus,
  FaUtensils,
  FaTrashAlt
} from "react-icons/fa";

export default function DashboardFavorites() {
  const navigate = useNavigate();
  const {
    foodList = [],
    wishlist = [],
    toggleWishlist,
    cartItems = {},
    addToCart,
    removeFromCart,
    showToast
  } = useContext(StoreContext);

  // Find food items in wishlist
  const favoriteFoods = foodList.filter((f) => wishlist.includes(f._id));

  const handleRemove = (foodId, foodName, e) => {
    e.stopPropagation();
    toggleWishlist(foodId);
    if (showToast) {
      showToast(`Removed "${foodName}" from favorites`, "info");
    }
  };

  return (
    <section className="dashboard-favorites-section">
      <div className="favorites-header-row">
        <div>
          <div className="fav-title-with-badge">
            <span className="heart-pill">❤️ SAVED</span>
            <h2>Your Favorites</h2>
          </div>
          <p className="fav-subtitle">
            Dishes and flavors you've handpicked for quick ordering
          </p>
        </div>
        {favoriteFoods.length > 0 && (
          <span className="fav-count-pill">{favoriteFoods.length} saved</span>
        )}
      </div>

      {favoriteFoods.length === 0 ? (
        <div className="fav-smart-empty-card">
          <div className="empty-heart-circle">💔</div>
          <h3>No favorites saved yet</h3>
          <p>
            Tap the heart icon on any mouthwatering dish or restaurant to keep it right here for instant access!
          </p>
          <button
            type="button"
            className="btn-explore-favs"
            onClick={() => {
              const el = document.getElementById("popular-dishes-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              else navigate("/browse-food");
            }}
          >
            <FaUtensils /> Explore Top Dishes
          </button>
        </div>
      ) : (
        <div className="favorites-grid">
          {favoriteFoods.map((food) => {
            const qty = cartItems[food._id] || 0;
            const hasDiscount = food.discountPrice && food.discountPrice > 0 && food.discountPrice < food.price;
            const imgSrc = getFoodImageUrl(food.image);

            return (
              <div key={food._id} className="fav-dish-card">
                <div className="fav-media-wrap">
                  <img
                    src={imgSrc}
                    alt={food.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600";
                    }}
                  />
                  <button
                    type="button"
                    className="btn-remove-fav"
                    onClick={(e) => handleRemove(food._id, food.name, e)}
                    title="Remove from favorites"
                  >
                    <FaTrashAlt />
                  </button>
                  {hasDiscount && (
                    <span className="fav-discount-tag">DEAL</span>
                  )}
                </div>

                <div className="fav-card-body">
                  <div className="fav-meta-top">
                    <span className="fav-restaurant">{food.restaurant || "FoodExpress Special"}</span>
                    <span className="fav-rating">
                      <FaStar /> {food.rating || "4.8"}
                    </span>
                  </div>

                  <h4 className="fav-dish-name">{food.name}</h4>

                  <div className="fav-action-footer">
                    <div className="fav-price">
                      <strong>₹{hasDiscount ? food.discountPrice : food.price}</strong>
                      {hasDiscount && <span className="orig-price">₹{food.price}</span>}
                    </div>

                    {qty > 0 ? (
                      <div className="fav-stepper">
                        <button type="button" onClick={() => removeFromCart(food._id)}>
                          <FaMinus />
                        </button>
                        <span>{qty}</span>
                        <button type="button" onClick={() => addToCart(food._id)}>
                          <FaPlus />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="btn-add-fav-to-cart"
                        onClick={() => {
                          addToCart(food._id);
                          if (showToast) showToast(`Added ${food.name} to cart! 🛒`, "success");
                        }}
                      >
                        <FaPlus /> ADD
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
