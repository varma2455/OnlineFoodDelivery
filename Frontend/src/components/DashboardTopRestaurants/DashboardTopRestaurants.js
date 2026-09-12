import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL, getFoodImageUrl } from "../../config/api";
import { StoreContext } from "../../context/StoreContext";
import "./DashboardTopRestaurants.css";

import {
  FaStar,
  FaClock,
  FaHeart,
  FaRegHeart,
  FaTag,
  FaArrowRight,
  FaMapMarkerAlt
} from "react-icons/fa";

const sampleRestaurants = [
  {
    id: "rest-1",
    name: "Paradise Biryani House",
    cuisine: "Hyderabadi, Biryani, Mughlai",
    rating: "4.8",
    deliveryTime: "25-30 min",
    distance: "1.8 km",
    priceForTwo: "₹350 for two",
    offer: "40% OFF up to ₹80",
    image: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=500"
  },
  {
    id: "rest-2",
    name: "La Pino'z Pizza",
    cuisine: "Italian, Pizzas, Pasta",
    rating: "4.7",
    deliveryTime: "20-25 min",
    distance: "2.4 km",
    priceForTwo: "₹400 for two",
    offer: "Buy 1 Get 1 Free",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500"
  },
  {
    id: "rest-3",
    name: "Burger King & Co.",
    cuisine: "American, Fast Food, Shakes",
    rating: "4.6",
    deliveryTime: "15-20 min",
    distance: "1.2 km",
    priceForTwo: "₹250 for two",
    offer: "Flat ₹50 OFF",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500"
  },
  {
    id: "rest-4",
    name: "Green Leaf Salads & Bowls",
    cuisine: "Healthy, Bowls, Mediterranean",
    rating: "4.9",
    deliveryTime: "20-25 min",
    distance: "3.1 km",
    priceForTwo: "₹300 for two",
    offer: "20% OFF with PRO",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500"
  }
];

const DashboardTopRestaurants = () => {
  const navigate = useNavigate();
  const { showToast } = useContext(StoreContext);
  const [restaurants, setRestaurants] = useState(sampleRestaurants);
  const [favRestaurants, setFavRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_BASE = API_BASE_URL;
        const { data } = await axios.get(`${API_BASE}/api/dashboard/restaurants`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (data.success && data.restaurants && data.restaurants.length > 0) {
          setRestaurants(data.restaurants);
        }
      } catch (err) {
        console.warn("Restaurants fetch note:", err.message);
      }
    };

    fetchRestaurants();
  }, []);

  const toggleFav = (id, name) => {
    setFavRestaurants((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast(`Removed ${name} from favorites`, "info");
        return prev.filter((x) => x !== id);
      } else {
        showToast(`Added ${name} to favorites ❤️`, "success");
        return [...prev, id];
      }
    });
  };

  return (
    <section className="foodexpress-top-restaurants-section">
      <div className="restaurants-header-bar">
        <div>
          <h2>Top Restaurants Near You</h2>
          <p>Featured kitchens with highest cleanliness & ratings in your neighborhood</p>
        </div>
        <button
          className="btn-view-all-restaurants"
          onClick={() => navigate("/browse-food")}
        >
          View All Restaurants <FaArrowRight />
        </button>
      </div>

      <div className="restaurants-grid">
        {restaurants.map((rest) => {
          const isFav = favRestaurants.includes(rest.id || rest.name);

          return (
            <div
              key={rest.id || rest.name}
              className="restaurant-card"
              onClick={() => navigate("/browse-food")}
              title={`Explore ${rest.name}`}
            >
              <div className="restaurant-media">
                <img
                  src={getFoodImageUrl(rest.image)}
                  alt={rest.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600";
                  }}
                />

                {/* Offer Tag */}
                {rest.offer && (
                  <span className="restaurant-offer-badge">
                    <FaTag className="tag-icon" /> {rest.offer}
                  </span>
                )}

                {/* Favorite Toggle */}
                <button
                  className={`btn-fav-restaurant ${isFav ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(rest.id || rest.name, rest.name);
                  }}
                  title="Favorite Restaurant"
                >
                  {isFav ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>

              <div className="restaurant-content">
                <div className="rest-title-row">
                  <h4>{rest.name}</h4>
                  <span className="rest-rating-pill">
                    <FaStar /> {rest.rating}
                  </span>
                </div>

                <p className="rest-cuisine">{rest.cuisine}</p>

                <div className="rest-meta-row">
                  <span className="meta-item">
                    <FaClock /> {rest.deliveryTime}
                  </span>
                  <span className="meta-dot">•</span>
                  <span className="meta-item">
                    <FaMapMarkerAlt /> {rest.distance}
                  </span>
                  <span className="meta-dot">•</span>
                  <span className="meta-item">{rest.priceForTwo}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DashboardTopRestaurants;
