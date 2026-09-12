import React, { useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./DashboardHeroBanner.css";

import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaFire,
  FaTimes,
  FaHistory,
  FaUtensils,
  FaStore
} from "react-icons/fa";

const categories = [
  {
    id: "pizza",
    name: "Pizza",
    path: "/pizza",
    emoji: "🍕",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300",
    badge: "Cheesy"
  },
  {
    id: "burger",
    name: "Burgers",
    path: "/burger",
    emoji: "🍔",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300",
    badge: "Trending"
  },
  {
    id: "biryani",
    name: "Biryani",
    path: "/biryani",
    emoji: "🍛",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300",
    badge: "Bestseller"
  },
  {
    id: "noodles",
    name: "Noodles",
    path: "/noodles",
    emoji: "🍜",
    image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300",
    badge: "Hot"
  },
  {
    id: "fastfood",
    name: "Fast Food",
    path: "/fastfood",
    emoji: "🍟",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=300",
    badge: "Crispy"
  },
  {
    id: "salads",
    name: "Salads",
    path: "/salads",
    emoji: "🥗",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300",
    badge: "Healthy"
  },
  {
    id: "drinks",
    name: "Drinks",
    path: "/drinks",
    emoji: "🥤",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300",
    badge: "Chilled"
  },
  {
    id: "desserts",
    name: "Desserts",
    path: "/desserts",
    emoji: "🍰",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=300",
    badge: "Sweet"
  },
  {
    id: "north-indian",
    name: "North Indian",
    path: "/browse-food?category=North+Indian",
    emoji: "🍱",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300",
    badge: "Rich Curries"
  },
  {
    id: "south-indian",
    name: "South Indian",
    path: "/browse-food?category=South+Indian",
    emoji: "🌶️",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300",
    badge: "Spicy & Crisp"
  }
];

const popularSearches = [
  "Biryani",
  "Pizza",
  "Burger",
  "Chicken Biryani",
  "Paneer Pizza",
  "Desserts"
];

const defaultRecentSearches = ["Chicken Biryani", "Farmhouse Pizza", "Crispy Burger"];

export default function DashboardHeroBanner({ onSearchSubmit, onCategorySelect }) {
  const navigate = useNavigate();
  const { foodList = [] } = useContext(StoreContext);
  const carouselRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem("foodexpress_recent_searches");
      return saved ? JSON.parse(saved) : defaultRecentSearches;
    } catch {
      return defaultRecentSearches;
    }
  });

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const handleCategoryClick = (cat) => {
    if (onCategorySelect) {
      onCategorySelect(cat.name);
    } else {
      navigate(cat.path);
    }
  };

  const handleSearchExecute = (query) => {
    const q = (query || searchTerm).trim();
    if (!q) return;

    // Save to recent searches
    const updated = [q, ...recentSearches.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem("foodexpress_recent_searches", JSON.stringify(updated));
    } catch {}

    setIsFocused(false);
    if (onSearchSubmit) {
      onSearchSubmit(q);
    } else {
      navigate(`/browse-food?search=${encodeURIComponent(q)}`);
    }
  };

  // Instant Suggestions from real food database
  const suggestions = searchTerm.trim().length > 0
    ? foodList
        .filter((f) => {
          const q = searchTerm.toLowerCase();
          return (
            f.name?.toLowerCase().includes(q) ||
            f.category?.toLowerCase().includes(q) ||
            f.restaurant?.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  return (
    <section className="foodexpress-mind-hero-section">
      {/* 1. HERO SEARCH DISCOVERY BAR */}
      <div className="hero-search-discovery-box">
        <div className="search-input-wrapper">
          <FaSearch className="search-lead-icon" />
          <input
            type="text"
            className="hero-search-input"
            placeholder="Search for dishes, cuisines or restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchExecute();
            }}
          />
          {searchTerm && (
            <button
              type="button"
              className="btn-clear-hero-search"
              onClick={() => setSearchTerm("")}
              title="Clear search"
            >
              <FaTimes />
            </button>
          )}
          <button
            type="button"
            className="btn-hero-search-submit"
            onClick={() => handleSearchExecute()}
          >
            Search
          </button>

          {/* Real-time Suggestions Dropdown */}
          {isFocused && (suggestions.length > 0 || !searchTerm) && (
            <div
              className="hero-suggestions-dropdown"
              onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
            >
              {searchTerm && suggestions.length > 0 ? (
                <div className="suggestions-list">
                  <span className="dropdown-section-title">Matching Dishes</span>
                  {suggestions.map((item) => (
                    <div
                      key={item._id}
                      className="suggestion-row"
                      onClick={() => handleSearchExecute(item.name)}
                    >
                      <div className="sugg-left">
                        <FaUtensils className="sugg-icon" />
                        <div>
                          <strong>{item.name}</strong>
                          <span className="sugg-sub">in {item.category} • {item.restaurant || "FoodExpress"}</span>
                        </div>
                      </div>
                      <span className="sugg-price">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dropdown-quick-links">
                  <div className="quick-tags-block">
                    <span className="dropdown-section-title">
                      <FaHistory /> Recent Searches
                    </span>
                    <div className="chips-strip">
                      {recentSearches.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="hero-chip-tag recent"
                          onClick={() => handleSearchExecute(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="quick-tags-block">
                    <span className="dropdown-section-title">
                      <FaFire /> Popular Searches
                    </span>
                    <div className="chips-strip">
                      {popularSearches.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="hero-chip-tag popular"
                          onClick={() => handleSearchExecute(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Popular Tags Row Below Search Bar */}
        <div className="hero-popular-chips-bar">
          <span className="chips-lead-label">Popular:</span>
          {popularSearches.slice(0, 5).map((tag, idx) => (
            <button
              key={idx}
              type="button"
              className="inline-popular-chip"
              onClick={() => handleSearchExecute(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. CATEGORY CAROUSEL HEADER */}
      <div className="mind-section-header">
        <div>
          <div className="section-title-with-badge">
            <h2>What's on your mind today?</h2>
            <span className="curated-badge">
              <FaFire /> HANDPICKED
            </span>
          </div>
          <p className="section-subtitle">
            Explore diverse flavors, artisan breads, and savory curries from top kitchens
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="carousel-nav-arrows">
          <button className="arrow-btn" onClick={scrollLeft} title="Scroll Left">
            <FaChevronLeft />
          </button>
          <button className="arrow-btn" onClick={scrollRight} title="Scroll Right">
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* 3. HORIZONTALLY SCROLLABLE CATEGORIES */}
      <div className="category-scroll-track" ref={carouselRef}>
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="category-circle-card"
            onClick={() => handleCategoryClick(cat)}
            title={`Browse ${cat.name}`}
          >
            <div className="circle-image-wrap">
              <img src={cat.image} alt={cat.name} loading="lazy" />
              {cat.badge && <span className="cat-floating-pill">{cat.badge}</span>}
            </div>
            <span className="category-label">{cat.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
