import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { API_BASE_URL, getFoodImageUrl } from "../../config/api";
import { StoreContext } from "../../context/StoreContext";
import "./DashboardRecommendations.css";

import {
  FaStar,
  FaClock,
  FaPlus,
  FaMinus,
  FaHeart,
  FaRegHeart,
  FaRedo,
  FaFire,
  FaUtensils
} from "react-icons/fa";

const DashboardRecommendations = () => {
  const {
    cartItems,
    addToCart,
    removeFromCart,
    wishlist,
    toggleWishlist,
    foodList
  } = useContext(StoreContext);

  const [recommendedFoods, setRecommendedFoods] = useState([]);
  const [contextReason, setContextReason] = useState("Chef's Handpicked Specials");
  const [recentOrderItems, setRecentOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_BASE = API_BASE_URL;

        // 1. Fetch Recommendations
        if (token) {
          const recRes = await axios.get(`${API_BASE}/api/dashboard/recommendations`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (recRes.data.success && recRes.data.recommended?.length > 0) {
            setRecommendedFoods(recRes.data.recommended);
            if (recRes.data.contextReason) setContextReason(recRes.data.contextReason);
          }
        }

        // Fallback to top-rated foods from foodList if needed
        if (recommendedFoods.length === 0 && foodList.length > 0) {
          const topRated = [...foodList]
            .filter((f) => f.isAvailable !== false)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 6);
          setRecommendedFoods(topRated);
        }

        // 2. Fetch Recent Orders for "Order Again" Section
        if (token) {
          const orderRes = await axios.get(`${API_BASE}/api/dashboard/orders`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (orderRes.data.success && orderRes.data.orders?.length > 0) {
            // Flatten items
            const items = [];
            orderRes.data.orders.slice(0, 3).forEach((ord) => {
              ord.items?.forEach((itm) => {
                if (!items.some((x) => x.name === itm.name)) {
                  items.push({
                    ...itm,
                    orderDate: new Date(ord.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    }),
                    restaurant: ord.items?.[0]?.restaurant || "FoodExpress Kitchen"
                  });
                }
              });
            });
            setRecentOrderItems(items.slice(0, 4));
          }
        }
      } catch (err) {
        console.warn("Recommendations note:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [foodList]);

  const activeRecs =
    recommendedFoods.length > 0
      ? recommendedFoods
      : foodList.slice(0, 4);

  return (
    <div className="recommendations-container">
      {/* 1. ORDER AGAIN SECTION (If past orders exist) */}
      {recentOrderItems.length > 0 && (
        <section className="order-again-section animate-fade-in">
          <div className="section-head-bar">
            <div>
              <h3>
                <FaRedo className="icon-redo" /> Order Again
              </h3>
              <p>Quick reorder from your recent delicious meals</p>
            </div>
          </div>

          <div className="order-again-grid">
            {recentOrderItems.map((item, idx) => {
              const matchedFood = foodList.find((f) => f.name === item.name || f._id === item.food);
              const targetId = matchedFood?._id || item.food || `reorder-${idx}`;
              const qty = cartItems[targetId] || 0;

              return (
                <div key={idx} className="reorder-card">
                  <div className="reorder-img-wrap">
                    <img
                      src={getFoodImageUrl(item.image)}
                      alt={item.name}
                    />
                    <span className="order-date-tag">Ordered {item.orderDate}</span>
                  </div>

                  <div className="reorder-info">
                    <h4>{item.name}</h4>
                    <span className="reorder-restaurant">{item.restaurant}</span>
                    <div className="reorder-price-row">
                      <span className="reorder-price">₹{item.price}</span>
                      {qty > 0 ? (
                        <div className="qty-control-pill">
                          <button onClick={() => removeFromCart(targetId)}>
                            <FaMinus />
                          </button>
                          <span>{qty}</span>
                          <button onClick={() => addToCart(targetId)}>
                            <FaPlus />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-add-again"
                          onClick={() => addToCart(targetId)}
                        >
                          ADD AGAIN
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. RECOMMENDED FOR YOU */}
      <section className="recommended-for-you-section">
        <div className="section-head-bar">
          <div>
            <div className="rec-title-group">
              <h3>Recommended for You</h3>
              <span className="sparkle-pill">
                <FaFire /> {contextReason}
              </span>
            </div>
            <p>Dishes tailored to your taste profile & high ratings</p>
          </div>
        </div>

        <div className="recommended-cards-grid">
          {activeRecs.map((food) => {
            const foodId = food._id || food.id;
            const qty = cartItems[foodId] || 0;
            const isFav = wishlist.includes(foodId);
            const isVeg = food.isVeg !== false && food.category !== "Chicken" && !food.name?.toLowerCase().includes("chicken");

            return (
              <div key={foodId} className="rec-food-card">
                <div className="card-media-wrapper">
                  <img
                    src={getFoodImageUrl(food.image)}
                    alt={food.name}
                    loading="lazy"
                  />

                  {/* Veg / Non-Veg Indicator */}
                  <span className={`diet-indicator-badge ${isVeg ? "veg" : "non-veg"}`} title={isVeg ? "Pure Veg" : "Non-Veg"}>
                    <span className="diet-dot"></span>
                  </span>

                  {/* Favorite Heart Button */}
                  <button
                    className={`btn-fav-heart ${isFav ? "active" : ""}`}
                    onClick={() => toggleWishlist(foodId)}
                    title={isFav ? "Remove Favorite" : "Save Favorite"}
                  >
                    {isFav ? <FaHeart /> : <FaRegHeart />}
                  </button>

                  {/* Prep Time Tag */}
                  <div className="prep-time-tag">
                    <FaClock /> {food.preparationTime || 25} min
                  </div>
                </div>

                <div className="card-content-body">
                  <div className="card-title-rating">
                    <h4>{food.name}</h4>
                    <span className="rating-pill">
                      <FaStar /> {food.rating || 4.8}
                    </span>
                  </div>

                  <p className="food-desc-clamp">
                    {food.description || "Freshly cooked with authentic chef ingredients & aromatic spices."}
                  </p>

                  <div className="card-price-action-row">
                    <div className="price-display-wrap">
                      <span className="price-current">
                        ₹{food.discountPrice > 0 ? food.discountPrice : food.price}
                      </span>
                      {food.discountPrice > 0 && (
                        <span className="price-original">₹{food.price}</span>
                      )}
                    </div>

                    {qty > 0 ? (
                      <div className="rec-qty-stepper">
                        <button onClick={() => removeFromCart(foodId)}>
                          <FaMinus />
                        </button>
                        <span className="qty-val">{qty}</span>
                        <button onClick={() => addToCart(foodId)}>
                          <FaPlus />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-add-food-cart"
                        onClick={() => addToCart(foodId)}
                      >
                        ADD <FaPlus />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DashboardRecommendations;
