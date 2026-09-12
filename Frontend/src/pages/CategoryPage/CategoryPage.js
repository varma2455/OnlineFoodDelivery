import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { foodAPI } from "../../services/api";
import FoodCard from "../../components/FoodCard/FoodCard";
import {
    slugToCategory,
    categoryToSlug,
    getCategoryMeta,
    categoryMeta
} from "../../utils/categoryUtils";
import "./CategoryPage.css";

import {
    FaMapMarkerAlt,
    FaSearch,
    FaFilter,
    FaSortAmountDown,
    FaTimes,
    FaUndo,
    FaStore,
    FaChevronDown,
    FaExclamationCircle,
    FaCheck,
    FaArrowLeft,
    FaLeaf,
    FaDrumstickBite
} from "react-icons/fa";

export default function CategoryPage() {
    const { categoryName } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const {
        selectedArea,
        setSelectedArea,
        availableAreas
    } = useContext(StoreContext);

    const currentArea = selectedArea || "Hyderabad";

    // Map URL slug to display/database category name
    const effectiveSlug = useMemo(() => {
        if (categoryName) return categoryName;
        // Fallback for legacy routes like /pizza, /biryani
        const pathPart = location.pathname.replace(/^\/(category\/)?/, "").replace(/^\//, "");
        return pathPart || "biryani";
    }, [categoryName, location.pathname]);

    const categoryTitle = useMemo(() => {
        return slugToCategory(effectiveSlug);
    }, [effectiveSlug]);

    const meta = useMemo(() => {
        return getCategoryMeta(categoryTitle);
    }, [categoryTitle]);

    // Page state
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter and Sort states
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState("popularity");
    const [vegFilter, setVegFilter] = useState("all"); // 'all' | 'veg' | 'nonveg'
    const [selectedRestaurant, setSelectedRestaurant] = useState("All");
    const [priceFilter, setPriceFilter] = useState("all"); // 'all' | 'under200' | '200to350' | 'above350'

    // UI states
    const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const locationPickerRef = useRef(null);

    // List of cities
    const cities = availableAreas || [
        "Hyderabad",
        "Bhimavaram",
        "Bengaluru",
        "Mumbai",
        "Delhi NCR",
        "Pune",
        "Chennai",
        "Kolkata"
    ];

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close location dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                locationPickerRef.current &&
                !locationPickerRef.current.contains(e.target)
            ) {
                setLocationDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Reset filters when category changes
    useEffect(() => {
        setSearchQuery("");
        setDebouncedSearch("");
        setVegFilter("all");
        setSelectedRestaurant("All");
        setPriceFilter("all");
        setSortBy("popularity");
    }, [categoryTitle]);

    // Fetch foods from backend API
    const fetchFoods = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                category: categoryTitle,
                area: currentArea,
                sort: sortBy,
                limit: 60
            };

            if (debouncedSearch.trim()) {
                params.search = debouncedSearch.trim();
            }

            if (vegFilter === "veg") {
                params.isVeg = true;
            } else if (vegFilter === "nonveg") {
                params.isVeg = false;
            }

            if (selectedRestaurant && selectedRestaurant !== "All") {
                params.restaurant = selectedRestaurant;
            }

            if (priceFilter === "under200") {
                params.maxPrice = 200;
            } else if (priceFilter === "200to350") {
                params.minPrice = 200;
                params.maxPrice = 350;
            } else if (priceFilter === "above350") {
                params.minPrice = 350;
            }

            const res = await foodAPI.getAllFoods(params);
            setFoods(res.data.foods || []);
        } catch (err) {
            console.error("Failed to fetch category foods:", err);
            setError(err.message || "Failed to load foods. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoods();
    }, [
        categoryTitle,
        currentArea,
        sortBy,
        debouncedSearch,
        vegFilter,
        selectedRestaurant,
        priceFilter
    ]);

    // Extract available restaurants dynamically from the category data
    const [allCategoryRestaurants, setAllCategoryRestaurants] = useState([]);
    useEffect(() => {
        // Fetch all unfiltered restaurants in this category + area for the sidebar filter
        foodAPI
            .getAllFoods({ category: categoryTitle, area: currentArea, limit: 100 })
            .then((res) => {
                const list = (res.data.foods || []).map((f) => f.restaurant).filter(Boolean);
                const unique = Array.from(new Set(list));
                setAllCategoryRestaurants(unique);
            })
            .catch(() => {});
    }, [categoryTitle, currentArea]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (vegFilter !== "all") count++;
        if (selectedRestaurant !== "All") count++;
        if (priceFilter !== "all") count++;
        if (debouncedSearch.trim()) count++;
        return count;
    }, [vegFilter, selectedRestaurant, priceFilter, debouncedSearch]);

    const handleResetFilters = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setVegFilter("all");
        setSelectedRestaurant("All");
        setPriceFilter("all");
        setSortBy("popularity");
    };

    return (
        <div className="category-page-container">
            {/* TOP BAR / BREADCRUMB & AREA SELECTOR */}
            <section className="category-topbar">
                <div className="category-topbar-inner">
                    <nav className="category-breadcrumbs">
                        <Link to="/" className="breadcrumb-link">
                            Home
                        </Link>
                        <span className="breadcrumb-separator">/</span>
                        <Link to="/menu" className="breadcrumb-link">
                            Categories
                        </Link>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-current">{categoryTitle}</span>
                    </nav>

                    {/* LOCATION SELECTOR PILL */}
                    <div className="area-selector-wrapper" ref={locationPickerRef}>
                        <div
                            className="area-selector-pill"
                            onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                            role="button"
                            tabIndex={0}
                            title="Click to change your delivery location"
                        >
                            <FaMapMarkerAlt className="area-pin-icon" />
                            <div className="area-text-box">
                                <span className="area-label">Delivering to</span>
                                <span className="area-value">
                                    📍 {currentArea}
                                </span>
                            </div>
                            <FaChevronDown
                                className={`area-chevron ${locationDropdownOpen ? "open" : ""}`}
                            />
                        </div>

                        {locationDropdownOpen && (
                            <div className="area-dropdown-menu">
                                <div className="area-dropdown-header">
                                    <span>Select Location</span>
                                    <button
                                        type="button"
                                        className="area-dropdown-close"
                                        onClick={() => setLocationDropdownOpen(false)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="area-dropdown-list">
                                    {cities.map((city) => (
                                        <button
                                            key={city}
                                            type="button"
                                            className={`area-item-btn ${city.toLowerCase() === currentArea.toLowerCase() ? "selected" : ""}`}
                                            onClick={() => {
                                                setSelectedArea(city);
                                                setLocationDropdownOpen(false);
                                            }}
                                        >
                                            <span className="city-name">
                                                <FaMapMarkerAlt /> {city}
                                            </span>
                                            {city.toLowerCase() === currentArea.toLowerCase() && (
                                                <FaCheck className="check-icon" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* DYNAMIC CATEGORY HERO HEADER */}
            <section
                className="category-hero-banner"
                style={{
                    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.78), rgba(15, 23, 42, 0.88)), url(${meta.bannerImage})`
                }}
            >
                <div className="category-hero-content">
                    <div className="category-hero-badge">
                        <span>{meta.badge || `${meta.icon} SPECIALS`}</span>
                    </div>

                    <h1 className="category-hero-title">
                        <span className="category-hero-icon">{meta.icon}</span> {categoryTitle}
                    </h1>

                    <p className="category-hero-description">{meta.description}</p>

                    <div className="category-hero-stats">
                        <div className="hero-stat-item">
                            <span className="hero-stat-value">
                                {loading ? "..." : foods.length}
                            </span>
                            <span className="hero-stat-label">Dishes Available</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat-item">
                            <span className="hero-stat-value">📍 {currentArea}</span>
                            <span className="hero-stat-label">Current Zone</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat-item">
                            <span className="hero-stat-value">⚡ 30 min</span>
                            <span className="hero-stat-label">Avg. Delivery</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* QUICK CATEGORY SWITCHER TABS */}
            <section className="category-tabs-bar">
                <div className="category-tabs-scroll">
                    {Object.keys(categoryMeta).map((catKey) => {
                        const itemMeta = categoryMeta[catKey];
                        const isActive =
                            catKey.toLowerCase() === categoryTitle.toLowerCase();
                        return (
                            <Link
                                key={catKey}
                                to={`/category/${itemMeta.slug}`}
                                className={`category-tab-item ${isActive ? "active" : ""}`}
                            >
                                <span className="tab-icon">{itemMeta.icon}</span>
                                <span className="tab-name">{itemMeta.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* SEARCH AND SORT BAR */}
            <section className="category-controls-bar">
                <div className="category-controls-inner">
                    {/* Search Within Current Category */}
                    <div className="category-search-box">
                        <FaSearch className="search-box-icon" />
                        <input
                            type="text"
                            placeholder={`Search within ${categoryTitle} (e.g. spicy, tandoori, cheese)...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="search-clear-btn"
                                onClick={() => setSearchQuery("")}
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Mobile Filters Toggle Button */}
                    <button
                        type="button"
                        className="mobile-filter-trigger-btn"
                        onClick={() => setMobileFiltersOpen(true)}
                    >
                        <FaFilter /> Filters
                        {activeFilterCount > 0 && (
                            <span className="filter-badge-count">{activeFilterCount}</span>
                        )}
                    </button>

                    {/* Sort Selector */}
                    <div className="category-sort-box">
                        <FaSortAmountDown className="sort-box-icon" />
                        <label htmlFor="category-sort-select" className="sort-label">
                            Sort By:
                        </label>
                        <select
                            id="category-sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="popularity">🔥 Most Popular</option>
                            <option value="rating">⭐ Highest Rated (4.5+)</option>
                            <option value="priceLow">💰 Price: Low to High</option>
                            <option value="priceHigh">💎 Price: High to Low</option>
                            <option value="latest">✨ Latest Added</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT: FILTERS SIDEBAR + FOOD GRID */}
            <main className="category-main-content">
                <div className="category-layout">
                    {/* FILTERS SIDEBAR (DESKTOP) */}
                    <aside
                        className={`category-sidebar ${mobileFiltersOpen ? "mobile-open" : ""}`}
                    >
                        <div className="sidebar-header">
                            <div className="sidebar-header-title">
                                <FaFilter /> Filters
                                {activeFilterCount > 0 && (
                                    <span className="filter-count-badge">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </div>
                            <div className="sidebar-header-actions">
                                {activeFilterCount > 0 && (
                                    <button
                                        type="button"
                                        className="btn-reset-filters"
                                        onClick={handleResetFilters}
                                        title="Reset all filters"
                                    >
                                        <FaUndo /> Reset
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="btn-close-mobile-filters"
                                    onClick={() => setMobileFiltersOpen(false)}
                                    aria-label="Close filters"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        </div>

                        <div className="sidebar-body">
                            {/* Filter 1: Dietary Preference */}
                            <div className="filter-group">
                                <h4 className="filter-group-title">Dietary Preference</h4>
                                <div className="dietary-filter-options">
                                    <button
                                        type="button"
                                        className={`dietary-chip ${vegFilter === "all" ? "active" : ""}`}
                                        onClick={() => setVegFilter("all")}
                                    >
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        className={`dietary-chip veg ${vegFilter === "veg" ? "active" : ""}`}
                                        onClick={() => setVegFilter("veg")}
                                    >
                                        <FaLeaf /> Pure Veg
                                    </button>
                                    <button
                                        type="button"
                                        className={`dietary-chip nonveg ${vegFilter === "nonveg" ? "active" : ""}`}
                                        onClick={() => setVegFilter("nonveg")}
                                    >
                                        <FaDrumstickBite /> Non-Veg
                                    </button>
                                </div>
                            </div>

                            {/* Filter 2: Price Range */}
                            <div className="filter-group">
                                <h4 className="filter-group-title">Price Range</h4>
                                <div className="radio-filter-list">
                                    <label className="filter-radio-item">
                                        <input
                                            type="radio"
                                            name="priceFilter"
                                            checked={priceFilter === "all"}
                                            onChange={() => setPriceFilter("all")}
                                        />
                                        <span>Any Price</span>
                                    </label>
                                    <label className="filter-radio-item">
                                        <input
                                            type="radio"
                                            name="priceFilter"
                                            checked={priceFilter === "under200"}
                                            onChange={() => setPriceFilter("under200")}
                                        />
                                        <span>Under ₹200</span>
                                    </label>
                                    <label className="filter-radio-item">
                                        <input
                                            type="radio"
                                            name="priceFilter"
                                            checked={priceFilter === "200to350"}
                                            onChange={() => setPriceFilter("200to350")}
                                        />
                                        <span>₹200 - ₹350</span>
                                    </label>
                                    <label className="filter-radio-item">
                                        <input
                                            type="radio"
                                            name="priceFilter"
                                            checked={priceFilter === "above350"}
                                            onChange={() => setPriceFilter("above350")}
                                        />
                                        <span>₹350 & Above</span>
                                    </label>
                                </div>
                            </div>

                            {/* Filter 3: Filter by Restaurant */}
                            {allCategoryRestaurants.length > 0 && (
                                <div className="filter-group">
                                    <h4 className="filter-group-title">Available Restaurants</h4>
                                    <div className="restaurant-filter-list">
                                        <button
                                            type="button"
                                            className={`restaurant-filter-btn ${selectedRestaurant === "All" ? "active" : ""}`}
                                            onClick={() => setSelectedRestaurant("All")}
                                        >
                                            <FaStore /> All Restaurants
                                        </button>
                                        {allCategoryRestaurants.map((resto) => (
                                            <button
                                                key={resto}
                                                type="button"
                                                className={`restaurant-filter-btn ${selectedRestaurant === resto ? "active" : ""}`}
                                                onClick={() => setSelectedRestaurant(resto)}
                                            >
                                                <FaStore /> {resto}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Apply Button */}
                        <div className="sidebar-footer-mobile">
                            <button
                                type="button"
                                className="btn-apply-filters"
                                onClick={() => setMobileFiltersOpen(false)}
                            >
                                View {foods.length} Dishes
                            </button>
                        </div>
                    </aside>

                    {/* Backdrop for mobile drawer */}
                    {mobileFiltersOpen && (
                        <div
                            className="mobile-filters-overlay"
                            onClick={() => setMobileFiltersOpen(false)}
                        />
                    )}

                    {/* FOOD ITEMS SECTION */}
                    <section className="category-foods-section">
                        {/* Status bar */}
                        <div className="results-header-bar">
                            <div className="results-count-text">
                                Showing <strong>{foods.length}</strong> {categoryTitle} dishes in{" "}
                                <span className="area-highlight">📍 {currentArea}</span>
                            </div>

                            {activeFilterCount > 0 && (
                                <div className="active-filters-pills">
                                    {vegFilter !== "all" && (
                                        <span className="active-pill">
                                            {vegFilter === "veg" ? "Pure Veg" : "Non-Veg"}
                                            <button onClick={() => setVegFilter("all")}>✕</button>
                                        </span>
                                    )}
                                    {selectedRestaurant !== "All" && (
                                        <span className="active-pill">
                                            {selectedRestaurant}
                                            <button onClick={() => setSelectedRestaurant("All")}>
                                                ✕
                                            </button>
                                        </span>
                                    )}
                                    {priceFilter !== "all" && (
                                        <span className="active-pill">
                                            {priceFilter === "under200"
                                                ? "Under ₹200"
                                                : priceFilter === "200to350"
                                                  ? "₹200 - ₹350"
                                                  : "₹350+"}
                                            <button onClick={() => setPriceFilter("all")}>✕</button>
                                        </span>
                                    )}
                                    {debouncedSearch && (
                                        <span className="active-pill">
                                            "{debouncedSearch}"
                                            <button onClick={() => setSearchQuery("")}>✕</button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* LOADING SKELETON */}
                        {loading && (
                            <div className="category-food-grid">
                                {[...Array(8)].map((_, index) => (
                                    <div key={index} className="category-skeleton-card">
                                        <div className="skeleton-img pulse" />
                                        <div className="skeleton-body">
                                            <div className="skeleton-line short pulse" />
                                            <div className="skeleton-line title pulse" />
                                            <div className="skeleton-line desc pulse" />
                                            <div className="skeleton-footer">
                                                <div className="skeleton-line price pulse" />
                                                <div className="skeleton-btn pulse" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ERROR STATE */}
                        {!loading && error && (
                            <div className="category-error-state">
                                <FaExclamationCircle className="error-icon" />
                                <h3>Unable to load {categoryTitle} dishes</h3>
                                <p>{error}</p>
                                <button
                                    type="button"
                                    className="btn-retry-fetch"
                                    onClick={fetchFoods}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {!loading && !error && foods.length === 0 && (
                            <div className="category-empty-state">
                                <div className="empty-state-illustration">🍲</div>
                                <h3 className="empty-state-headline">
                                    No {categoryTitle} available in {currentArea} right now.
                                </h3>
                                <p className="empty-state-message">
                                    Try changing your location or exploring another category.
                                </p>

                                <div className="empty-state-actions">
                                    <button
                                        type="button"
                                        className="empty-btn-change-area"
                                        onClick={() => setLocationDropdownOpen(true)}
                                    >
                                        <FaMapMarkerAlt /> Change Area
                                    </button>
                                    <Link to="/menu" className="empty-btn-browse-all">
                                        Browse All Foods
                                    </Link>
                                    {activeFilterCount > 0 && (
                                        <button
                                            type="button"
                                            className="empty-btn-reset-filters"
                                            onClick={handleResetFilters}
                                        >
                                            Clear Filters ({activeFilterCount})
                                        </button>
                                    )}
                                </div>

                                <div className="empty-other-categories-block">
                                    <span className="other-categories-label">
                                        Popular categories available now:
                                    </span>
                                    <div className="other-categories-chips">
                                        {Object.keys(categoryMeta)
                                            .filter(
                                                (k) =>
                                                    k.toLowerCase() !== categoryTitle.toLowerCase()
                                            )
                                            .slice(0, 6)
                                            .map((catKey) => {
                                                const catMeta = categoryMeta[catKey];
                                                return (
                                                    <Link
                                                        key={catKey}
                                                        to={`/category/${catMeta.slug}`}
                                                        className="other-category-pill"
                                                    >
                                                        <span>{catMeta.icon}</span> {catMeta.name}
                                                    </Link>
                                                );
                                            })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FOOD ITEMS GRID */}
                        {!loading && !error && foods.length > 0 && (
                            <div className="category-food-grid">
                                {foods.map((food) => (
                                    <FoodCard key={food._id} food={food} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
