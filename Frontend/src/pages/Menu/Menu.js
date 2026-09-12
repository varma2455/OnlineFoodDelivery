import React, { useContext, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import FoodCard from "../../components/FoodCard/FoodCard";
import Loader from "../../components/Loader/Loader";
import "./Menu.css";
import {
    FaSearch,
    FaFilter,
    FaSortAmountDown,
    FaTimes,
    FaStar,
    FaLeaf,
    FaDrumstickBite
} from "react-icons/fa";

const ITEMS_PER_PAGE = 12;

const Menu = () => {
    const { foodList, categories, loadingFoods, wishlist } = useContext(StoreContext);
    const [searchParams, setSearchParams] = useSearchParams();

    // Query params or defaults
    const paramCategory = searchParams.get("category") || "All";
    const paramSearch = searchParams.get("search") || "";
    const paramFilter = searchParams.get("filter") || "";

    const [selectedCategory, setSelectedCategory] = useState(paramCategory);
    const [searchQuery, setSearchQuery] = useState(paramSearch);
    const [dietFilter, setDietFilter] = useState("all"); // 'all', 'veg', 'non-veg'
    const [minRating, setMinRating] = useState(0); // 0, 4.0, 4.5
    const [maxPrice, setMaxPrice] = useState(1000);
    const [sortBy, setSortBy] = useState("default"); // 'default', 'priceLow', 'priceHigh', 'rating', 'name'
    const [currentPage, setCurrentPage] = useState(1);
    const [showWishlistOnly, setShowWishlistOnly] = useState(paramFilter === "wishlist");

    // Sync with URL params
    useEffect(() => {
        if (paramCategory) setSelectedCategory(paramCategory);
        if (paramSearch) setSearchQuery(paramSearch);
        if (paramFilter === "wishlist") setShowWishlistOnly(true);
    }, [paramCategory, paramSearch, paramFilter]);

    // Update URL when category or search changes
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
        const params = new URLSearchParams(searchParams);
        if (category === "All") {
            params.delete("category");
        } else {
            params.set("category", category);
        }
        setSearchParams(params);
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        setCurrentPage(1);
        const params = new URLSearchParams(searchParams);
        if (val.trim()) {
            params.set("search", val);
        } else {
            params.delete("search");
        }
        setSearchParams(params);
    };

    // Filter and Sort Logic
    const filteredFoods = useMemo(() => {
        let result = [...foodList];

        // Wishlist only
        if (showWishlistOnly) {
            result = result.filter((f) => wishlist.includes(f._id));
        }

        // Category filter
        if (selectedCategory && selectedCategory !== "All") {
            result = result.filter(
                (f) => f.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Search query
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(
                (f) =>
                    f.name.toLowerCase().includes(q) ||
                    f.description?.toLowerCase().includes(q) ||
                    f.restaurant?.toLowerCase().includes(q) ||
                    f.category?.toLowerCase().includes(q)
            );
        }

        // Diet filter (Veg / Non-veg)
        if (dietFilter === "veg") {
            result = result.filter((f) => f.isVeg === true);
        } else if (dietFilter === "non-veg") {
            result = result.filter((f) => f.isVeg === false);
        }

        // Rating filter
        if (minRating > 0) {
            result = result.filter((f) => (f.rating || 0) >= minRating);
        }

        // Max price filter
        result = result.filter((f) => {
            const price = f.discountPrice > 0 ? f.discountPrice : f.price;
            return price <= maxPrice;
        });

        // Sorting
        switch (sortBy) {
            case "priceLow":
                result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
                break;
            case "priceHigh":
                result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
                break;
            case "rating":
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case "name":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Default: featured first, then latest
                result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        }

        return result;
    }, [
        foodList,
        showWishlistOnly,
        wishlist,
        selectedCategory,
        searchQuery,
        dietFilter,
        minRating,
        maxPrice,
        sortBy
    ]);

    // Pagination
    const totalPages = Math.ceil(filteredFoods.length / ITEMS_PER_PAGE) || 1;
    const paginatedFoods = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredFoods.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredFoods, currentPage]);

    const resetAllFilters = () => {
        setSelectedCategory("All");
        setSearchQuery("");
        setDietFilter("all");
        setMinRating(0);
        setMaxPrice(1000);
        setSortBy("default");
        setShowWishlistOnly(false);
        setCurrentPage(1);
        setSearchParams({});
    };

    if (loadingFoods && foodList.length === 0) {
        return <Loader />;
    }

    const categoryNames = [
        "All",
        ...Array.from(new Set(categories.map((c) => c.name).concat(foodList.map((f) => f.category))))
    ].filter(Boolean);

    return (
        <div className="menu-page-wrapper">
            {/* MENU HERO HEADER */}
            <div className="menu-banner">
                <div className="menu-banner-content">
                    <h1>
                        {showWishlistOnly
                            ? "❤️ My Saved Foods"
                            : selectedCategory !== "All"
                            ? `${selectedCategory} Menu`
                            : "Explore All Dishes & Cuisines"}
                    </h1>
                    <p>
                        {showWishlistOnly
                            ? `You have ${wishlist.length} saved favorites ready to order.`
                            : "Discover delicious handcrafted meals from top rated cloud kitchens and restaurants."}
                    </p>
                </div>
            </div>

            <div className="menu-container">
                {/* SEARCH & FILTER CONTROLS BAR */}
                <div className="menu-controls-bar">
                    <div className="menu-search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search dishes, ingredients, restaurants..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        {searchQuery && (
                            <button
                                className="search-clear-btn"
                                onClick={() => {
                                    setSearchQuery("");
                                    const params = new URLSearchParams(searchParams);
                                    params.delete("search");
                                    setSearchParams(params);
                                }}
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>

                    <div className="menu-sort-box">
                        <FaSortAmountDown className="sort-icon" />
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="default">Sort by: Featured</option>
                            <option value="priceLow">Price: Low to High</option>
                            <option value="priceHigh">Price: High to Low</option>
                            <option value="rating">Top Customer Rated</option>
                            <option value="name">Alphabetical (A-Z)</option>
                        </select>
                    </div>
                </div>

                {/* CATEGORY PILLS */}
                <div className="category-pills-row">
                    {categoryNames.map((catName) => (
                        <button
                            key={catName}
                            className={`cat-pill ${selectedCategory === catName ? "active" : ""}`}
                            onClick={() => handleCategorySelect(catName)}
                        >
                            {catName}
                        </button>
                    ))}
                </div>

                {/* FILTER CHIPS (Veg/Non-Veg, Rating, Price, Wishlist) */}
                <div className="filter-chips-row">
                    {/* Diet Toggle */}
                    <div className="diet-toggle-group">
                        <button
                            className={`diet-btn ${dietFilter === "all" ? "active" : ""}`}
                            onClick={() => {
                                setDietFilter("all");
                                setCurrentPage(1);
                            }}
                        >
                            All
                        </button>
                        <button
                            className={`diet-btn veg ${dietFilter === "veg" ? "active" : ""}`}
                            onClick={() => {
                                setDietFilter(dietFilter === "veg" ? "all" : "veg");
                                setCurrentPage(1);
                            }}
                        >
                            <FaLeaf /> Pure Veg
                        </button>
                        <button
                            className={`diet-btn non-veg ${dietFilter === "non-veg" ? "active" : ""}`}
                            onClick={() => {
                                setDietFilter(dietFilter === "non-veg" ? "all" : "non-veg");
                                setCurrentPage(1);
                            }}
                        >
                            <FaDrumstickBite /> Non-Veg
                        </button>
                    </div>

                    {/* Rating Filter */}
                    <div className="rating-filter-group">
                        <button
                            className={`filter-chip ${minRating === 4.0 ? "active" : ""}`}
                            onClick={() => {
                                setMinRating(minRating === 4.0 ? 0 : 4.0);
                                setCurrentPage(1);
                            }}
                        >
                            <FaStar className="star" /> 4.0+
                        </button>
                        <button
                            className={`filter-chip ${minRating === 4.5 ? "active" : ""}`}
                            onClick={() => {
                                setMinRating(minRating === 4.5 ? 0 : 4.5);
                                setCurrentPage(1);
                            }}
                        >
                            <FaStar className="star" /> 4.5+
                        </button>
                    </div>

                    {/* Max Price Slider */}
                    <div className="price-slider-group">
                        <label>Max: ₹{maxPrice}</label>
                        <input
                            type="range"
                            min="100"
                            max="1000"
                            step="50"
                            value={maxPrice}
                            onChange={(e) => {
                                setMaxPrice(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Wishlist toggle */}
                    <button
                        className={`filter-chip ${showWishlistOnly ? "active" : ""}`}
                        onClick={() => {
                            setShowWishlistOnly(!showWishlistOnly);
                            setCurrentPage(1);
                        }}
                    >
                        ❤️ Wishlist ({wishlist.length})
                    </button>

                    {(selectedCategory !== "All" ||
                        searchQuery ||
                        dietFilter !== "all" ||
                        minRating > 0 ||
                        maxPrice < 1000 ||
                        showWishlistOnly) && (
                        <button className="reset-all-chip" onClick={resetAllFilters}>
                            <FaTimes /> Clear All
                        </button>
                    )}
                </div>

                {/* RESULTS SUMMARY */}
                <div className="results-summary-row">
                    <span>
                        Showing <strong>{filteredFoods.length}</strong> items
                    </span>
                </div>

                {/* FOODS GRID */}
                {paginatedFoods.length > 0 ? (
                    <div className="menu-food-grid">
                        {paginatedFoods.map((food) => (
                            <FoodCard key={food._id} food={food} />
                        ))}
                    </div>
                ) : (
                    <div className="menu-empty-state">
                        <div className="empty-icon">🍽️</div>
                        <h3>No matching foods found</h3>
                        <p>We couldn't find any dishes matching your current filter criteria.</p>
                        <button className="btn-reset-filters" onClick={resetAllFilters}>
                            Reset All Filters
                        </button>
                    </div>
                )}

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                    <div className="menu-pagination">
                        <button
                            className="page-btn"
                            disabled={currentPage === 1}
                            onClick={() => {
                                setCurrentPage((p) => Math.max(1, p - 1));
                                window.scrollTo({ top: 200, behavior: "smooth" });
                            }}
                        >
                            ← Previous
                        </button>

                        <div className="page-numbers">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`page-num ${page === currentPage ? "active" : ""}`}
                                    onClick={() => {
                                        setCurrentPage(page);
                                        window.scrollTo({ top: 200, behavior: "smooth" });
                                    }}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            className="page-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => {
                                setCurrentPage((p) => Math.min(totalPages, p + 1));
                                window.scrollTo({ top: 200, behavior: "smooth" });
                            }}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Menu;