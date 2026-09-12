import React, { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL, getFoodImageUrl } from "../../config/api";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./DashboardPopularFoods.css";

import {
  FaStar,
  FaClock,
  FaPlus,
  FaMinus,
  FaHeart,
  FaRegHeart,
  FaFilter,
  FaSlidersH
} from "react-icons/fa";

const sampleFoods = [
  {
    _id: "pop-1",
    name: "Crispy Chicken Zinger Burger",
    category: "Burgers",
    price: 199,
    rating: 4.8,
    preparationTime: 20,
    isVeg: false,
    description: "Extra crunchy spiced fried chicken fillet topped with fresh lettuce and secret spicy mayo.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800"
  },
  {
    _id: "pop-2",
    name: "Farmhouse Cheesy Burst Pizza",
    category: "Pizza",
    price: 329,
    rating: 4.9,
    preparationTime: 25,
    isVeg: true,
    description: "Loaded with crispy capsicum, golden sweet corn, ripe tomatoes, and melted mozzarella.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800"
  },
  {
    _id: "pop-3",
    name: "Dum Handi Chicken Biryani",
    category: "Biryani",
    price: 269,
    rating: 4.9,
    preparationTime: 30,
    isVeg: false,
    description: "Fragrant aged Basmati rice layered with slow-cooked succulent chicken & saffron ghee.",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800"
  },
  {
    _id: "pop-4",
    name: "Creamy Alfredo Pasta",
    category: "Noodles & Pasta",
    price: 249,
    rating: 4.7,
    preparationTime: 22,
    isVeg: true,
    description: "Rich parmesan cream sauce, garlic sautéed mushrooms and buttered broccoli florets.",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800"
  },
  {
    _id: "pop-5",
    name: "Paneer Butter Masala & Naan",
    category: "North Indian",
    price: 239,
    rating: 4.8,
    preparationTime: 25,
    isVeg: true,
    description: "Soft cottage cheese cubes in silky tomato-cashew gravy served with butter naan.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800"
  },
  {
    _id: "pop-6",
    name: "Spicy Schezwan Chicken Noodles",
    category: "Noodles & Pasta",
    price: 219,
    rating: 4.6,
    preparationTime: 20,
    isVeg: false,
    description: "Wok-tossed noodles tossed with red schezwan chili sauce, shredded chicken, and veggies.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800"
  },
  {
    _id: "pop-7",
    name: "Avocado Greek Salad Bowl",
    category: "Salads",
    price: 229,
    rating: 4.7,
    preparationTime: 15,
    isVeg: true,
    description: "Hass avocado, crisp cucumber, kalamata olives, and crumbled feta cheese with herb vinaigrette.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800"
  },
  {
    _id: "pop-8",
    name: "Belgian Chocolate Lava Cake",
    category: "Desserts",
    price: 149,
    rating: 4.9,
    preparationTime: 15,
    isVeg: true,
    description: "Warm molten dark chocolate center oozing out of soft cocoa sponge.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800"
  }
];

const DashboardPopularFoods = ({
  selectedCategories = [],
  maxPrice = 1000,
  minRating = 0,
  dietaryFilter = "all"
}) => {
  const navigate = useNavigate();
  const {
    foodList = [],
    cartItems = {},
    addToCart,
    removeFromCart,
    wishlist = [],
    toggleWishlist,
    showToast
  } = useContext(StoreContext);

  const [foods, setFoods] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_BASE = API_BASE_URL;
        const { data } = await axios.get(`${API_BASE}/api/dashboard/popular-foods`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (data.success && data.foods && data.foods.length > 0) {
          setFoods(data.foods);
        } else if (foodList && foodList.length > 0) {
          setFoods(foodList);
        } else {
          setFoods(sampleFoods);
        }
      } catch (err) {
        console.warn("Popular foods note:", err.message);
        if (foodList && foodList.length > 0) {
          setFoods(foodList);
        } else {
          setFoods(sampleFoods);
        }
      }
    };

    fetchPopular();
  }, [foodList]);

  // Filtering & Sorting logic
  const filteredFoods = useMemo(() => {
    let result = [...foods];

    // Prop dietary filter or local filter pill
    const effectiveDietary = dietaryFilter !== "all" ? dietaryFilter : activeFilter;
    if (effectiveDietary === "veg") {
      result = result.filter((item) => item.isVeg === true || item.category?.toLowerCase().includes("veg"));
    } else if (effectiveDietary === "non-veg") {
      result = result.filter((item) => item.isVeg === false || item.category?.toLowerCase().includes("chicken") || item.name?.toLowerCase().includes("chicken"));
    } else if (effectiveDietary === "rating") {
      result = result.filter((item) => (item.rating || 4.5) >= 4.7);
    } else if (effectiveDietary === "under250") {
      result = result.filter((item) => item.price <= 250);
    }

    // Category filter from DashboardFilters
    if (selectedCategories.length > 0) {
      result = result.filter((item) => {
        const itemCat = (item.category || "").toLowerCase();
        const itemName = (item.name || "").toLowerCase();
        return selectedCategories.some((cat) => {
          const c = cat.toLowerCase();
          return (
            itemCat.includes(c) ||
            itemName.includes(c) ||
            (c === "burgers" && (itemCat.includes("burger") || itemName.includes("burger"))) ||
            (c === "noodles & pasta" &&
              (itemCat.includes("noodle") ||
                itemCat.includes("pasta") ||
                itemName.includes("noodle") ||
                itemName.includes("pasta")))
          );
        });
      });
    }

    // Max Price filter from DashboardFilters
    if (maxPrice < 1000) {
      result = result.filter((item) => item.price <= maxPrice);
    }

    // Min Rating filter from DashboardFilters
    if (minRating > 0) {
      result = result.filter((item) => (item.rating || 4.5) >= minRating);
    }

    // Sort
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    }

    return result;
  }, [foods, activeFilter, sortBy, selectedCategories, maxPrice, minRating, dietaryFilter]);

  const getImageSrc = (item) => {
    return getFoodImageUrl(item?.image);
  };

  const handleItemClick = (foodId) => {
    navigate(`/customization/${foodId}`);
  };

  return (
    <section className="foodexpress-popular-section">
      {/* Header bar */}
      <div className="popular-header-wrapper">
        <div className="popular-title-group">
          <span className="popular-pill-badge">🔥 Trending Now</span>
          <h2>Popular Dishes Near You</h2>
          <p>Handpicked crowd favorites ordered frequently in your area</p>
        </div>

        <button
          className="btn-popular-view-all"
          onClick={() => navigate("/browse-food")}
        >
          View Full Menu →
        </button>
      </div>

      {/* Filter & Sort Controls Bar */}
      <div className="popular-controls-bar">
        <div className="filter-pills-row">
          <button
            className={`filter-pill ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All Items
          </button>
          <button
            className={`filter-pill ${activeFilter === "veg" ? "active" : ""}`}
            onClick={() => setActiveFilter("veg")}
          >
            <span className="veg-symbol-dot">●</span> Pure Veg
          </button>
          <button
            className={`filter-pill ${activeFilter === "non-veg" ? "active" : ""}`}
            onClick={() => setActiveFilter("non-veg")}
          >
            <span className="nonveg-symbol-dot">▲</span> Non-Veg
          </button>
          <button
            className={`filter-pill ${activeFilter === "rating" ? "active" : ""}`}
            onClick={() => setActiveFilter("rating")}
          >
            ⭐ 4.7+ Rating
          </button>
          <button
            className={`filter-pill ${activeFilter === "under250" ? "active" : ""}`}
            onClick={() => setActiveFilter("under250")}
          >
            ⚡ Under ₹250
          </button>
        </div>

        <div className="sort-dropdown-group">
          <FaSlidersH className="sort-icon" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
            aria-label="Sort dishes"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="rating">Sort: Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Food Cards Grid */}
      {filteredFoods.length === 0 ? (
        <div className="popular-empty-filter-state">
          <p>No delicious dishes match your active filters.</p>
          <button
            type="button"
            className="btn-popular-view-all"
            onClick={() => setActiveFilter("all")}
          >
            Show All Dishes
          </button>
        </div>
      ) : (
        <div className="popular-food-grid">
          {filteredFoods.slice(0, 6).map((food) => {
          const itemId = food._id || food.id;
          const qty = cartItems?.[itemId] || 0;
          const isWish = wishlist?.includes(itemId);
          const isVegItem = food.isVeg !== undefined
            ? food.isVeg
            : !food.name?.toLowerCase().includes("chicken") && !food.category?.toLowerCase().includes("chicken");

          return (
            <div
              key={itemId}
              className="foodexpress-food-card"
              onClick={() => handleItemClick(itemId)}
            >
              {/* Card Image Container */}
              <div className="food-card-media">
                <img
                  src={getImageSrc(food)}
                  alt={food.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
                  }}
                />

                {/* Wishlist Button */}
                <button
                  className={`card-wish-btn ${isWish ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (toggleWishlist) {
                      toggleWishlist(itemId);
                    }
                  }}
                  title={isWish ? "Remove from Favorites" : "Add to Favorites"}
                >
                  {isWish ? <FaHeart /> : <FaRegHeart />}
                </button>

                {/* Veg / Non-Veg Indicator */}
                <div className={`diet-badge-corner ${isVegItem ? "diet-veg" : "diet-nonveg"}`}>
                  <div className="diet-inner-dot"></div>
                </div>
              </div>

              {/* Card Body */}
              <div className="food-card-body">
                <div className="card-top-info">
                  <span className="card-category-tag">{food.category || "Special"}</span>
                  <span className="card-rating-badge">
                    <FaStar /> {food.rating || 4.8}
                  </span>
                </div>

                <h3 className="food-card-title">{food.name}</h3>

                <p className="food-card-desc">
                  {food.description || "Prepared fresh with supreme ingredients and special chefs' spices."}
                </p>

                <div className="card-timing-meta">
                  <FaClock className="clock-icon" />
                  <span>{food.preparationTime || 20} mins delivery</span>
                </div>

                {/* Price & Action Row */}
                <div className="card-action-row" onClick={(e) => e.stopPropagation()}>
                  <div className="price-box">
                    <span className="currency-symbol">₹</span>
                    <span className="price-amount">{food.price}</span>
                  </div>

                  {qty === 0 ? (
                    <button
                      className="btn-add-food"
                      onClick={() => addToCart(itemId)}
                      aria-label={`Add ${food.name} to cart`}
                    >
                      <span>ADD</span>
                      <FaPlus className="plus-icon" />
                    </button>
                  ) : (
                    <div className="cart-stepper-control">
                      <button
                        className="stepper-btn minus"
                        onClick={() => removeFromCart(itemId)}
                        aria-label="Decrease quantity"
                      >
                        <FaMinus />
                      </button>
                      <span className="stepper-count">{qty}</span>
                      <button
                        className="stepper-btn plus"
                        onClick={() => addToCart(itemId)}
                        aria-label="Increase quantity"
                      >
                        <FaPlus />
                      </button>
                    </div>
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
};

export default DashboardPopularFoods;