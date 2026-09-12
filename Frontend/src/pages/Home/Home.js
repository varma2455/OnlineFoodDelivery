import React, { useContext, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import Hero from "../../components/Hero/Hero";
import Category from "../../components/Category/Category";
import FoodCard from "../../components/FoodCard/FoodCard";
import Loader from "../../components/Loader/Loader";
import "./Home.css";
import {
    FaSearch,
    FaBolt,
    FaFire,
    FaArrowRight,
    FaMotorcycle,
    FaAward,
    FaShieldAlt,
    FaClock
} from "react-icons/fa";

const Home = () => {
    const { foodList, loadingFoods } = useContext(StoreContext);
    const navigate = useNavigate();

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchKeyword, setSearchKeyword] = useState("");

    // Filter foods based on category and local search
    const filteredFoods = useMemo(() => {
        return foodList.filter((food) => {
            const matchesCat =
                selectedCategory === "All" ||
                food.category?.toLowerCase() === selectedCategory.toLowerCase();
            const matchesSearch =
                !searchKeyword ||
                food.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                food.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                food.restaurant?.toLowerCase().includes(searchKeyword.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }, [foodList, selectedCategory, searchKeyword]);

    const featuredFoods = useMemo(() => {
        return foodList.filter((f) => f.featured || f.rating >= 4.7).slice(0, 8);
    }, [foodList]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchKeyword.trim()) {
            navigate(`/menu?search=${encodeURIComponent(searchKeyword.trim())}`);
        }
    };

    if (loadingFoods && foodList.length === 0) {
        return <Loader />;
    }

    return (
        <div className="home-page">
            {/* HERO SECTION */}
            <Hero />

            {/* QUICK INLINE SEARCH BAR */}
            <div className="home-search-bar-wrap">
                <form className="home-search-form" onSubmit={handleSearchSubmit}>
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Craving something specific? E.g. Margherita, Chicken Biryani, Brownie..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                    {searchKeyword && (
                        <button
                            type="button"
                            className="clear-search-btn"
                            onClick={() => setSearchKeyword("")}
                        >
                            ✕
                        </button>
                    )}
                    <button type="submit" className="home-search-submit">
                        Find Food
                    </button>
                </form>
            </div>

            {/* CATEGORIES */}
            <Category
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            {/* POPULAR FOODS GRID */}
            <section className="food-section">
                <div className="section-header">
                    <div>
                        <div className="section-subheading">
                            <FaFire className="flame-icon" /> BEST PICKS FOR YOU
                        </div>
                        <h2 className="section-main-title">
                            {selectedCategory === "All"
                                ? "Popular Dishes in Your City"
                                : `${selectedCategory} Specials`}
                        </h2>
                    </div>
                    <Link to="/menu" className="view-all-link">
                        View Full Menu <FaArrowRight />
                    </Link>
                </div>

                {filteredFoods.length > 0 ? (
                    <div className="food-grid">
                        {filteredFoods.slice(0, 12).map((food) => (
                            <FoodCard key={food._id} food={food} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-food-state">
                        <div className="empty-emoji">🍲</div>
                        <h3>No dishes match "{searchKeyword || selectedCategory}"</h3>
                        <p>Try clearing your search keyword or explore other tasty cuisines.</p>
                        <button
                            className="reset-filters-btn"
                            onClick={() => {
                                setSelectedCategory("All");
                                setSearchKeyword("");
                            }}
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </section>

            {/* PROMO BANNER */}
            <section className="promo-banner">
                <div className="promo-banner-card">
                    <div className="promo-text-side">
                        <span className="promo-badge">EXCLUSIVE SAVINGS</span>
                        <h2>Flat 30% OFF On Your Orders</h2>
                        <p>
                            Use promo code <span className="code-pill">FIRST30</span> at checkout to
                            unlock instant savings up to ₹200 on all top restaurants.
                        </p>
                        <div className="promo-actions">
                            <Link to="/menu" className="promo-btn">
                                Order Now
                            </Link>
                            <span className="promo-subtext">⚡ Fast 30-min doorstep delivery</span>
                        </div>
                    </div>
                    <div className="promo-image-side">
                        <img
                            src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800"
                            alt="Delicious Pizza Special"
                        />
                    </div>
                </div>
            </section>

            {/* FEATURED CHEF SPECIALS (if any) */}
            {featuredFoods.length > 0 && selectedCategory === "All" && !searchKeyword && (
                <section className="food-section">
                    <div className="section-header">
                        <div>
                            <div className="section-subheading">
                                <FaBolt className="bolt-icon" /> TOP RATED & FEATURED
                            </div>
                            <h2 className="section-main-title">Chef's Recommended Highlights</h2>
                        </div>
                        <Link to="/menu" className="view-all-link">
                            Explore All <FaArrowRight />
                        </Link>
                    </div>

                    <div className="food-grid">
                        {featuredFoods.map((food) => (
                            <FoodCard key={`featured-${food._id}`} food={food} />
                        ))}
                    </div>
                </section>
            )}

            {/* VALUE PROPOSITIONS / WHY CHOOSE US */}
            <section className="why-us-section">
                <div className="why-us-header">
                    <span className="why-badge">WHY CHOOSE FOODEXPRESS</span>
                    <h2>Food Delivery Elevated</h2>
                    <p>Designed for true foodies with taste, hygiene, and lightning speed.</p>
                </div>

                <div className="why-us-grid">
                    <div className="why-card">
                        <div className="why-icon-box">
                            <FaMotorcycle />
                        </div>
                        <h3>30-Min Express Delivery</h3>
                        <p>Hot, fresh meals brought to your doorstep with real-time tracking.</p>
                    </div>

                    <div className="why-card">
                        <div className="why-icon-box">
                            <FaAward />
                        </div>
                        <h3>Top Quality Food</h3>
                        <p>Carefully curated restaurants following the highest quality standards.</p>
                    </div>

                    <div className="why-card">
                        <div className="why-icon-box">
                            <FaShieldAlt />
                        </div>
                        <h3>Safe & Contactless</h3>
                        <p>Hygiene-checked packaging and safe contactless payment options.</p>
                    </div>

                    <div className="why-card">
                        <div className="why-icon-box">
                            <FaClock />
                        </div>
                        <h3>24/7 Live Support</h3>
                        <p>Friendly support always ready to resolve your queries immediately.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;