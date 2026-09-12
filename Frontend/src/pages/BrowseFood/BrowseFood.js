import React, { useState, useContext, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./BrowseFood.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

// Left Control Center (Filters, Actions, Offers, Wallet, Rewards, Addresses)
import BrowseRightSidebar from "../../components/BrowseRightSidebar/BrowseRightSidebar";

// Components
import FoodCard from "../../components/FoodCard/FoodCard";
import TopRestaurants from "../../components/TopRestaurants/TopRestaurants";
import DashboardFloatingCart from "../../components/DashboardFloatingCart/DashboardFloatingCart";
import DashboardMobileNav from "../../components/DashboardMobileNav/DashboardMobileNav";

import {
  FaSearch,
  FaSlidersH,
  FaUtensils,
  FaStore,
  FaLayerGroup,
  FaTimes,
  FaRedo,
  FaPlus,
  FaHeart,
  FaMotorcycle,
  FaStar,
  FaClock,
  FaPercent,
  FaChevronLeft,
  FaChevronRight,
  FaFire,
  FaFilter
} from "react-icons/fa";

// Category items with emojis and styling
const CATEGORIES_DATA = [
  { id: "All", name: "All", emoji: "✨", bg: "#fff4ed" },
  { id: "Pizza", name: "Pizza", emoji: "🍕", bg: "#fee2e2" },
  { id: "Burger", name: "Burger", emoji: "🍔", bg: "#fef3c7" },
  { id: "Biryani", name: "Biryani", emoji: "🍛", bg: "#ffedd5" },
  { id: "Noodles", name: "Noodles", emoji: "🍜", bg: "#f3e8ff" },
  { id: "Fast Food", name: "Fast Food", emoji: "🍟", bg: "#fef9c3" },
  { id: "Drinks", name: "Drinks", emoji: "🥤", bg: "#e0f2fe" },
  { id: "Desserts", name: "Desserts", emoji: "🍰", bg: "#fce7f3" },
  { id: "Salads", name: "Salads", emoji: "🥗", bg: "#dcfce7" }
];

// Fallback sample foods if database list is loading
const sampleFallbackFoods = [
  {
    _id: "bf-1",
    name: "Crispy Chicken Zinger Burger",
    restaurant: "Burger King",
    category: "Burger",
    price: 199,
    discountPrice: 169,
    rating: 4.8,
    isVeg: false,
    deliveryTime: 20,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    description: "Extra crunchy spiced fried chicken fillet with fresh lettuce and signature spicy mayo."
  },
  {
    _id: "bf-2",
    name: "Farmhouse Cheesy Burst Pizza",
    restaurant: "Domino's Style",
    category: "Pizza",
    price: 329,
    discountPrice: 289,
    rating: 4.9,
    isVeg: true,
    deliveryTime: 25,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    description: "Loaded with crunchy bell peppers, golden corn, juicy tomatoes, and melted mozzarella."
  },
  {
    _id: "bf-3",
    name: "Dum Handi Chicken Biryani",
    restaurant: "Paradise Biryani",
    category: "Biryani",
    price: 269,
    discountPrice: 229,
    rating: 4.9,
    isVeg: false,
    deliveryTime: 28,
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800",
    description: "Fragrant aged Basmati rice layered with slow-cooked succulent chicken & saffron ghee."
  },
  {
    _id: "bf-4",
    name: "Spicy Schezwan Chicken Noodles",
    restaurant: "Chinese Bowl",
    category: "Noodles",
    price: 219,
    discountPrice: 189,
    rating: 4.7,
    isVeg: false,
    deliveryTime: 22,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
    description: "Wok-tossed noodles tossed with red schezwan chili sauce, shredded chicken, and veggies."
  },
  {
    _id: "bf-5",
    name: "Creamy Alfredo Pasta Bowl",
    restaurant: "Italiano Bistro",
    category: "Noodles",
    price: 249,
    discountPrice: 219,
    rating: 4.8,
    isVeg: true,
    deliveryTime: 20,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
    description: "Rich parmesan cream sauce, garlic sautéed mushrooms and buttered broccoli florets."
  },
  {
    _id: "bf-6",
    name: "Avocado Greek Salad Bowl",
    restaurant: "Green Leaf Cafe",
    category: "Salads",
    price: 229,
    discountPrice: 199,
    rating: 4.7,
    isVeg: true,
    deliveryTime: 15,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
    description: "Hass avocado, crisp cucumber, kalamata olives, and crumbled feta cheese with herb vinaigrette."
  },
  {
    _id: "bf-7",
    name: "Belgian Chocolate Lava Cake",
    restaurant: "Sweet Indulgence",
    category: "Desserts",
    price: 149,
    discountPrice: 129,
    rating: 4.9,
    isVeg: true,
    deliveryTime: 15,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800",
    description: "Warm molten dark chocolate center oozing out of soft cocoa sponge."
  },
  {
    _id: "bf-8",
    name: "Paneer Tikka Butter Masala",
    restaurant: "Punjab Grill",
    category: "Fast Food",
    price: 259,
    discountPrice: 229,
    rating: 4.8,
    isVeg: true,
    deliveryTime: 25,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
    description: "Charcoal-grilled cottage cheese in velvety tomato-cashew gravy served hot."
  },
  {
    _id: "bf-9",
    name: "Mango Mint Sparkler Cooler",
    restaurant: "Thirst Crush",
    category: "Drinks",
    price: 119,
    discountPrice: 99,
    rating: 4.6,
    totalReviews: 870,
    isVeg: true,
    deliveryTime: 12,
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800",
    description: "Chilled fresh mango pulp infused with fresh mint leaves and sparkling soda."
  },
  {
    _id: "bf-10",
    name: "Classic Margherita Pizza",
    restaurant: "Pizza Hut",
    category: "Pizza",
    price: 249,
    discountPrice: 199,
    rating: 4.7,
    totalReviews: 1780,
    isVeg: true,
    deliveryTime: 25,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
    description: "Classic pizza with rich tomato marinara, fresh mozzarella cheese and basil leaves."
  },
  {
    _id: "bf-11",
    name: "Butter Masala Dosa",
    restaurant: "Sri Sai Tiffins",
    category: "Fast Food",
    price: 149,
    discountPrice: 129,
    rating: 4.8,
    totalReviews: 1850,
    isVeg: true,
    deliveryTime: 18,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
    description: "Crisp golden fermented crepe filled with spiced potato masala and served with chutneys."
  },
  {
    _id: "bf-12",
    name: "Hot & Crispy Fried Chicken",
    restaurant: "KFC",
    category: "Fast Food",
    price: 249,
    discountPrice: 199,
    rating: 4.7,
    totalReviews: 3100,
    isVeg: false,
    deliveryTime: 25,
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800",
    description: "Secret blend of 11 herbs and spices coating tender juicy fried chicken drumettes."
  },
  {
    _id: "bf-13",
    name: "Hyderabadi Mutton Dum Biryani",
    restaurant: "Biryani House",
    category: "Biryani",
    price: 349,
    discountPrice: 299,
    rating: 4.9,
    totalReviews: 3400,
    isVeg: false,
    deliveryTime: 30,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
    description: "Tender goat meat infused with shahi spices, mint and saffron layered with basmati."
  },
  {
    _id: "bf-14",
    name: "Grilled Paneer Protein Sub",
    restaurant: "Subway",
    category: "Fast Food",
    price: 189,
    discountPrice: 159,
    rating: 4.6,
    totalReviews: 1650,
    isVeg: true,
    deliveryTime: 15,
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800",
    description: "Toasted multigrain bread with herb grilled paneer cubes, fresh salad and honey mustard."
  },
  {
    _id: "bf-15",
    name: "Signature Roasted Cold Coffee",
    restaurant: "Cafe Coffee Day",
    category: "Drinks",
    price: 139,
    discountPrice: 109,
    rating: 4.7,
    totalReviews: 1240,
    isVeg: true,
    deliveryTime: 15,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
    description: "Slow-brewed dark roast espresso shaken with chilled milk and chocolate drizzle."
  },
  {
    _id: "bf-16",
    name: "Classic Veg Hakka Noodles",
    restaurant: "Chinese Wok",
    category: "Noodles",
    price: 199,
    discountPrice: 169,
    rating: 4.6,
    totalReviews: 950,
    isVeg: true,
    deliveryTime: 20,
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800",
    description: "Traditional wok-tossed noodles with shredded cabbage, carrots, bell peppers & spring onion."
  },
  {
    _id: "bf-17",
    name: "Steamed Veg Himalayan Momos",
    restaurant: "The Momo Co.",
    category: "Fast Food",
    price: 159,
    discountPrice: 129,
    rating: 4.7,
    totalReviews: 1450,
    isVeg: true,
    deliveryTime: 18,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800",
    description: "Handcrafted thin flour dumplings packed with spiced vegetables, served with red chilli dip."
  },
  {
    _id: "bf-18",
    name: "Pepperoni Feast Pizza",
    restaurant: "La Pino'z Pizza",
    category: "Pizza",
    price: 379,
    discountPrice: 329,
    rating: 4.8,
    totalReviews: 2200,
    isVeg: false,
    deliveryTime: 25,
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800",
    description: "Double pepperoni layers, tangy signature marinara, and double mozzarella blend."
  },
  {
    _id: "bf-19",
    name: "Smoky BBQ Bacon Burger",
    restaurant: "Burger King",
    category: "Burger",
    price: 229,
    discountPrice: 189,
    rating: 4.7,
    totalReviews: 1800,
    isVeg: false,
    deliveryTime: 20,
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
    description: "Juicy flame-grilled patty glazed in sweet smoky barbecue sauce with crisp lettuce."
  },
  {
    _id: "bf-20",
    name: "Strawberry Velvet Sundae",
    restaurant: "Sweet Indulgence",
    category: "Desserts",
    price: 169,
    discountPrice: 139,
    rating: 4.8,
    totalReviews: 1300,
    isVeg: true,
    deliveryTime: 15,
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800",
    description: "Creamy vanilla gelato layered with strawberry compote, whipped cream and wafer roll."
  }
];

export default function BrowseFood() {
  const navigate = useNavigate();
  const location = useLocation();
  const { foodList = [], wishlist = [], addToCart, showToast } = useContext(StoreContext);

  // Search & Navigation States
  const [searchTerm, setSearchTerm] = useState("");

  // Sync search param from URL if navigated from Navbar search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("search");
    if (q) {
      setSearchTerm(q);
    }
  }, [location.search]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("All"); // "All", "Restaurants", "Dishes"
  const [sortBy, setSortBy] = useState("recommended");

  // Pagination / Load More (16 initial cards per Instamart density)
  const [visibleCount, setVisibleCount] = useState(16);

  // Right-Sidebar Filter States
  const [sidebarCategories, setSidebarCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minRating, setMinRating] = useState(0);
  const [dietaryFilter, setDietaryFilter] = useState("all"); // "all", "veg", "non-veg"
  const [under30Min, setUnder30Min] = useState(false);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Mobile Drawer Toggle
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Active Order, Recommendations & Loading
  const [activeOrder, setActiveOrder] = useState(null);
  const [recommendedFoods, setRecommendedFoods] = useState([]);
  const [reorderFoods, setReorderFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const catStripRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Fetch active order & recommendations from backend
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const API_BASE = API_BASE_URL;

      try {
        const [actRes, recRes, ordRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/api/dashboard/active-order`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE}/api/dashboard/recommendations`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_BASE}/api/dashboard/orders`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (actRes.status === "fulfilled" && actRes.value.data?.activeOrder) {
          setActiveOrder(actRes.value.data.activeOrder);
        }

        if (recRes.status === "fulfilled" && recRes.value.data?.recommended) {
          setRecommendedFoods(recRes.value.data.recommended.slice(0, 4));
        }

        if (ordRes.status === "fulfilled" && ordRes.value.data?.orders?.length > 0) {
          const pastOrders = ordRes.value.data.orders;
          const dishes = [];
          pastOrders.forEach((o) => {
            if (o.items && Array.isArray(o.items)) {
              o.items.forEach((it) => {
                if (it && !dishes.some((d) => d.name === it.name)) {
                  dishes.push(it);
                }
              });
            }
          });
          setReorderFoods(dishes.slice(0, 4));
        }
      } catch (e) {
        // Silently continue with fallbacks
      }
    };

    fetchUserData();
  }, []);

  const handleToggleSidebarCategory = (catId) => {
    setSidebarCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSidebarCategories([]);
    setMaxPrice(1000);
    setMinRating(0);
    setDietaryFilter("all");
    setUnder30Min(false);
    setOnlyOffers(false);
    setOnlyFavorites(false);
    setSortBy("recommended");
  };

  // Compute all available items (context foodList or fallback)
  const allFoods = useMemo(() => {
    if (foodList && foodList.length > 0) return foodList;
    return sampleFallbackFoods;
  }, [foodList]);

  // Filtering & Sorting Logic
  const filteredFoods = useMemo(() => {
    let result = [...allFoods];

    // 1. Search Query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          f.category?.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q) ||
          f.restaurant?.toLowerCase().includes(q)
      );
    }

    // 2. Main Category Selection
    if (selectedCategory !== "All") {
      const cat = selectedCategory.toLowerCase();
      result = result.filter(
        (f) =>
          f.category?.toLowerCase().includes(cat) ||
          f.name?.toLowerCase().includes(cat)
      );
    }

    // 3. Right Sidebar Category Checkboxes
    if (sidebarCategories.length > 0) {
      result = result.filter((f) => {
        const itemCat = (f.category || "").toLowerCase();
        const itemName = (f.name || "").toLowerCase();
        return sidebarCategories.some((c) => {
          const lowerC = c.toLowerCase();
          return itemCat.includes(lowerC) || itemName.includes(lowerC);
        });
      });
    }

    // 4. Dietary Filter
    if (dietaryFilter === "veg") {
      result = result.filter(
        (f) => f.isVeg === true || f.category?.toLowerCase().includes("veg")
      );
    } else if (dietaryFilter === "non-veg") {
      result = result.filter(
        (f) =>
          f.isVeg === false ||
          f.category?.toLowerCase().includes("chicken") ||
          f.name?.toLowerCase().includes("chicken")
      );
    }

    // 5. Max Price Slider
    if (maxPrice < 1000) {
      result = result.filter((f) => (f.discountPrice || f.price) <= maxPrice);
    }

    // 6. Rating Filter
    if (minRating > 0) {
      result = result.filter((f) => (f.rating || 4.5) >= minRating);
    }

    // 7. Delivery Time (<30 mins)
    if (under30Min) {
      result = result.filter((f) => (f.deliveryTime || 25) <= 30);
    }

    // 8. Offers Only
    if (onlyOffers) {
      result = result.filter((f) => f.discountPrice && f.discountPrice < f.price);
    }

    // 9. Favorites Only
    if (onlyFavorites) {
      result = result.filter((f) => wishlist.includes(f._id));
    }

    // 10. Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    } else if (sortBy === "popular") {
      result.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    } else if (sortBy === "fastest") {
      result.sort((a, b) => (a.deliveryTime || 25) - (b.deliveryTime || 25));
    } else if (sortBy === "newest") {
      result.reverse();
    }

    return result;
  }, [
    allFoods,
    searchTerm,
    selectedCategory,
    sidebarCategories,
    dietaryFilter,
    maxPrice,
    minRating,
    under30Min,
    onlyOffers,
    onlyFavorites,
    sortBy,
    wishlist
  ]);

  // Active filters count calculation
  const activeFiltersCount =
    (sidebarCategories.length > 0 ? sidebarCategories.length : 0) +
    (maxPrice < 1000 ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (dietaryFilter !== "all" ? 1 : 0) +
    (under30Min ? 1 : 0) +
    (onlyOffers ? 1 : 0) +
    (onlyFavorites ? 1 : 0);

  // Sub-sections for Instamart Multi-Section Discovery (when All category & no search)
  const isDefaultFeed = selectedCategory === "All" && !searchTerm.trim() && activeTab === "All";

  const popularFoods = useMemo(() => {
    return allFoods.filter((f) => (f.rating || 4.5) >= 4.7).slice(0, 4);
  }, [allFoods]);

  const recFoods = useMemo(() => {
    if (recommendedFoods.length >= 4) return recommendedFoods.slice(0, 4);
    return allFoods.slice(2, 6);
  }, [allFoods, recommendedFoods]);

  const trendingFoods = useMemo(() => {
    return allFoods
      .filter((f) => f.category === "Biryani" || f.category === "Burger" || f.category === "Pizza")
      .slice(0, 4);
  }, [allFoods]);

  const bestOfferFoods = useMemo(() => {
    return allFoods.filter((f) => f.discountPrice && f.discountPrice < f.price).slice(0, 4);
  }, [allFoods]);

  // Paginated catalog slice
  const paginatedCatalogFoods = useMemo(() => {
    return filteredFoods.slice(0, visibleCount);
  }, [filteredFoods, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const handleScrollCategories = (direction) => {
    if (catStripRef.current) {
      const amount = direction === "left" ? -220 : 220;
      catStripRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="browse-food-page">
      {/* MAIN CONTENT WRAPPER */}
      <div className="browse-main-wrapper">
        {/* WORKSPACE: MAIN CONTENT + COMPACT RIGHT SIDEBAR */}
        <div className="browse-workspace browse-food-layout">
          {/* ===================================================
              MAIN FOOD DISCOVERY EXPERIENCE (CENTER/LEFT)
              =================================================== */}
          <main className="browse-main-content browse-main browse-main-container" role="main">
            {/* Header Row: Title & Subtitle + Result Count & Sort Dropdown */}
            <div className="browse-header-row">
              <div className="browse-title-cluster">
                <h1 className="browse-main-title">Browse Food</h1>
                <p className="browse-main-subtitle">
                  Discover delicious food near you
                </p>
              </div>

              {/* Sort by Dropdown on the right side of main header */}
              <div className="browse-sort-wrap">
                <span className="items-count-indicator">
                  {filteredFoods.length} items available
                </span>
                <div className="sort-input-cluster">
                  <FaSlidersH className="sort-icon" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="browse-sort-dropdown"
                    aria-label="Sort dishes"
                  >
                    <option value="recommended">Sort: Recommended</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Rating: High to Low</option>
                    <option value="price-low">Price: Low → High</option>
                    <option value="price-high">Price: High → Low</option>
                    <option value="fastest">Delivery: Fastest</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                {/* Mobile Filter Button */}
                <button
                  type="button"
                  className="btn-mobile-filter-trigger"
                  onClick={() => setIsMobileDrawerOpen(true)}
                  aria-label="Open mobile filters"
                >
                  <FaFilter /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </button>
              </div>
            </div>

            {/* Search Input Bar with Focus State & Debounced Suggestions */}
            <div className="browse-search-panel">
              <div className="browse-search-large">
                <FaSearch className="search-icon-lg" />
                <input
                  type="text"
                  placeholder="Search for food, dishes or restaurants..."
                  value={searchTerm}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setVisibleCount(16);
                  }}
                  aria-label="Search for dishes, cuisines or restaurants"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="btn-search-clear"
                    onClick={() => {
                      setSearchTerm("");
                      setVisibleCount(16);
                    }}
                    title="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown on Focus */}
              {isSearchFocused && (
                <div className="search-focus-dropdown" onMouseDown={(e) => e.preventDefault()}>
                  <div className="dropdown-search-row">
                    <div className="dropdown-search-col">
                      <span className="dropdown-search-label">
                        <FaClock /> Recent Searches
                      </span>
                      <div className="dropdown-tags-group">
                        {["Chicken Biryani", "Pizza", "Burger"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className="search-drop-chip"
                            onClick={() => {
                              setSearchTerm(tag);
                              setIsSearchFocused(false);
                            }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="dropdown-search-col">
                      <span className="dropdown-search-label">
                        <FaFire /> Trending Searches
                      </span>
                      <div className="dropdown-tags-group">
                        {["Biryani", "Cheese Burst Pizza", "Burgers", "Desserts"].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className="search-drop-chip trending"
                            onClick={() => {
                              setSearchTerm(tag);
                              setIsSearchFocused(false);
                            }}
                          >
                            🔥 {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Popular Search Chips when not focused */}
              {!isSearchFocused && (
                <div className="search-chips-row">
                  <span className="chips-title">Popular:</span>
                  {["Biryani", "Pizza", "Burger", "Chicken Noodles", "Desserts"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`search-chip ${searchTerm === tag ? "active" : ""}`}
                      onClick={() => {
                        setSearchTerm(tag === searchTerm ? "" : tag);
                        setVisibleCount(16);
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* HORIZONTAL CATEGORY DISCOVERY STRIP (Requirement #10) */}
            <section className="categories-discovery-section">
              <div className="categories-strip-head">
                <span className="categories-label">Categories</span>
                <div className="cat-nav-arrows">
                  <button
                    type="button"
                    className="btn-cat-scroll"
                    onClick={() => handleScrollCategories("left")}
                    aria-label="Scroll categories left"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    type="button"
                    className="btn-cat-scroll"
                    onClick={() => handleScrollCategories("right")}
                    aria-label="Scroll categories right"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>

              <div className="categories-horizontal-strip" ref={catStripRef}>
                {CATEGORIES_DATA.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-discovery-card ${isActive ? "active" : ""}`}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setVisibleCount(16);
                      }}
                    >
                      <span className="cat-chip-emoji">{cat.emoji}</span>
                      <span className="cat-chip-title">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* CONTENT SWITCH TABS ([All] [Restaurants] [Dishes]) */}
            <div className="content-switch-tabs">
              <button
                type="button"
                className={`content-tab-btn ${activeTab === "All" ? "active" : ""}`}
                onClick={() => setActiveTab("All")}
              >
                <FaLayerGroup /> All Items
              </button>
              <button
                type="button"
                className={`content-tab-btn ${activeTab === "Restaurants" ? "active" : ""}`}
                onClick={() => setActiveTab("Restaurants")}
              >
                <FaStore /> Restaurants
              </button>
              <button
                type="button"
                className={`content-tab-btn ${activeTab === "Dishes" ? "active" : ""}`}
                onClick={() => setActiveTab("Dishes")}
              >
                <FaUtensils /> Dishes ({filteredFoods.length})
              </button>
            </div>

            {/* COMPACT QUICK FILTERS BAR (Requirement #13) */}
            <div className="browse-quick-filters-row">
              <button
                type="button"
                className={`quick-filter-pill ${activeFiltersCount > 0 ? "active-filter-highlight" : ""}`}
                onClick={() => setIsMobileDrawerOpen(true)}
              >
                <FaSlidersH /> Filters {activeFiltersCount > 0 && <span className="pill-badge">{activeFiltersCount}</span>}
              </button>
              <button
                type="button"
                className={`quick-filter-pill ${dietaryFilter === "veg" ? "active" : ""}`}
                onClick={() => {
                  setDietaryFilter(dietaryFilter === "veg" ? "all" : "veg");
                  setVisibleCount(16);
                }}
              >
                <span className="quick-dot-veg" /> Pure Veg
              </button>
              <button
                type="button"
                className={`quick-filter-pill ${minRating >= 4.0 ? "active" : ""}`}
                onClick={() => {
                  setMinRating(minRating >= 4.0 ? 0 : 4.0);
                  setVisibleCount(16);
                }}
              >
                <FaStar className="star-gold" /> Rating 4+
              </button>
              <button
                type="button"
                className={`quick-filter-pill ${under30Min ? "active" : ""}`}
                onClick={() => {
                  setUnder30Min(!under30Min);
                  setVisibleCount(16);
                }}
              >
                <FaClock /> Under 30 min
              </button>
              <button
                type="button"
                className={`quick-filter-pill ${onlyOffers ? "active" : ""}`}
                onClick={() => {
                  setOnlyOffers(!onlyOffers);
                  setVisibleCount(16);
                }}
              >
                <FaPercent /> Offers
              </button>
              <button
                type="button"
                className={`quick-filter-pill ${onlyFavorites ? "active" : ""}`}
                onClick={() => {
                  setOnlyFavorites(!onlyFavorites);
                  setVisibleCount(16);
                }}
              >
                <FaHeart className={onlyFavorites ? "heart-filled" : ""} /> Saved
              </button>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  className="btn-quick-clear-all"
                  onClick={handleClearAllFilters}
                >
                  <FaRedo /> Reset
                </button>
              )}
            </div>

            {/* ACTIVE ORDER CARD (Compact status alert when order is active) */}
            {activeOrder && (
              <div className="active-order-card">
                <div className="order-status-row">
                  <span className="order-pulse-dot" />
                  <span className="order-card-tag">YOUR ACTIVE ORDER</span>
                  <span className="order-status-pill">{activeOrder.orderStatus || "Preparing"}</span>
                </div>
                <div className="order-card-main">
                  <div className="order-dish-meta">
                    <span className="dish-icon">🍛</span>
                    <div>
                      <h4>{activeOrder.items?.[0]?.name || "Delicious Food Order"}</h4>
                      <p>{activeOrder.items?.[0]?.restaurant || "Paradise Biryani"}</p>
                    </div>
                  </div>
                  <div className="order-eta-meta">
                    <span className="eta-sub">Estimated arrival</span>
                    <span className="eta-time">25–30 min</span>
                  </div>
                  <button
                    type="button"
                    className="btn-track-order-action"
                    onClick={() => navigate("/my-orders")}
                  >
                    <FaMotorcycle /> Track Order
                  </button>
                </div>
              </div>
            )}

            {/* SKELETON LOADING STATE (Requirement #25) */}
            {isLoading ? (
              <div className="food-catalog-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={`skel-${n}`} className="food-skeleton-card">
                    <div className="skeleton-media shimmer" />
                    <div className="skeleton-body">
                      <div className="skeleton-line shimmer short" />
                      <div className="skeleton-line shimmer" />
                      <div className="skeleton-footer">
                        <div className="skeleton-line shimmer tiny" />
                        <div className="skeleton-btn shimmer" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredFoods.length === 0 ? (
              /* EMPTY STATE (Requirement #26) */
              <div className="empty-catalog-state">
                <div className="empty-glyph">🔍</div>
                <h3>No food found</h3>
                <p>Try changing your filters or search.</p>
                <button
                  type="button"
                  className="btn-clear-filters-cta"
                  onClick={handleClearAllFilters}
                >
                  <FaRedo /> Clear Filters
                </button>
              </div>
            ) : isDefaultFeed ? (
              /* MULTIPLE DISCOVERY SECTIONS (Requirement #16 & #17) */
              <div className="instamart-sections-stream">
                {/* 1. Popular Near You */}
                {popularFoods.length > 0 && (
                  <section className="browse-discovery-section">
                    <div className="section-head-simple">
                      <div className="section-title-cluster-sub">
                        <span className="section-badge-pill">⭐ POPULAR</span>
                        <h2>Popular Near You</h2>
                      </div>
                      <button
                        type="button"
                        className="btn-view-all-link"
                        onClick={() => {
                          const el = document.getElementById("all-dishes-catalog");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        View All →
                      </button>
                    </div>
                    <div className="food-catalog-grid">
                      {popularFoods.map((food) => (
                        <FoodCard key={`pop-${food._id}`} food={food} compact={true} />
                      ))}
                    </div>
                  </section>
                )}

                {/* 2. Recommended For You */}
                {recFoods.length > 0 && (
                  <section className="browse-discovery-section">
                    <div className="section-head-simple">
                      <div className="section-title-cluster-sub">
                        <span className="section-badge-pill">✨ FOR YOU</span>
                        <h2>Recommended For You</h2>
                      </div>
                      <span className="reorder-sub-hint">Hand-picked dishes you'll love</span>
                    </div>
                    <div className="food-catalog-grid">
                      {recFoods.map((food) => (
                        <FoodCard key={`rec-${food._id}`} food={food} compact={true} />
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. Trending Today */}
                {trendingFoods.length > 0 && (
                  <section className="browse-discovery-section">
                    <div className="section-head-simple">
                      <div className="section-title-cluster-sub">
                        <span className="section-badge-pill">🔥 TRENDING</span>
                        <h2>Trending Today</h2>
                      </div>
                      <span className="reorder-sub-hint">Most ordered flavors right now</span>
                    </div>
                    <div className="food-catalog-grid">
                      {trendingFoods.map((food) => (
                        <FoodCard key={`trend-${food._id}`} food={food} compact={true} />
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. Best Offers */}
                {bestOfferFoods.length > 0 && (
                  <section className="browse-discovery-section">
                    <div className="section-head-simple">
                      <div className="section-title-cluster-sub">
                        <span className="section-badge-pill">🏷️ OFFERS</span>
                        <h2>Best Offers</h2>
                      </div>
                      <span className="reorder-sub-hint">Dishes with instant savings</span>
                    </div>
                    <div className="food-catalog-grid">
                      {bestOfferFoods.map((food) => (
                        <FoodCard key={`deal-${food._id}`} food={food} compact={true} />
                      ))}
                    </div>
                  </section>
                )}

                {/* 5. All Dishes Section (Converted from previous Top Restaurants) */}
                <TopRestaurants
                  foods={filteredFoods}
                  selectedCategory={selectedCategory}
                  searchTerm={searchTerm}
                  sortBy={sortBy}
                  onViewAll={() => {
                    const el = document.getElementById("all-dishes-catalog");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                />
              </div>
            ) : (
              /* TARGETED FILTERED ALL DISHES GRID (when category or search is active) */
              <div className="instamart-sections-stream">
                <TopRestaurants
                  foods={filteredFoods}
                  selectedCategory={selectedCategory}
                  searchTerm={searchTerm}
                  sortBy={sortBy}
                  onViewAll={handleClearAllFilters}
                />
              </div>
            )}
          </main>

          {/* ===================================================
              COMPACT RIGHT SIDEBAR (FILTERS, QUICK ACTIONS, OFFERS, WALLET, REWARDS, ADDRESSES)
              =================================================== */}
          <BrowseRightSidebar
            selectedCategories={sidebarCategories}
            onToggleCategory={handleToggleSidebarCategory}
            maxPrice={maxPrice}
            onChangeMaxPrice={setMaxPrice}
            minRating={minRating}
            onChangeMinRating={setMinRating}
            dietaryFilter={dietaryFilter}
            onChangeDietary={setDietaryFilter}
            under30Min={under30Min}
            onChangeUnder30Min={setUnder30Min}
            onlyOffers={onlyOffers}
            onChangeOnlyOffers={setOnlyOffers}
            onClearFilters={handleClearAllFilters}
            onFilterFavorites={() => setOnlyFavorites(!onlyFavorites)}
            activeOrder={activeOrder}
          />
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Panel */}
      {isMobileDrawerOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div
            className="mobile-drawer-window"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-header">
              <h3>Filters & Control Center</h3>
              <button
                type="button"
                className="btn-drawer-close"
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="mobile-drawer-body">
              <BrowseRightSidebar
                selectedCategories={sidebarCategories}
                onToggleCategory={handleToggleSidebarCategory}
                maxPrice={maxPrice}
                onChangeMaxPrice={setMaxPrice}
                minRating={minRating}
                onChangeMinRating={setMinRating}
                dietaryFilter={dietaryFilter}
                onChangeDietary={setDietaryFilter}
                under30Min={under30Min}
                onChangeUnder30Min={setUnder30Min}
                onlyOffers={onlyOffers}
                onChangeOnlyOffers={setOnlyOffers}
                onClearFilters={handleClearAllFilters}
                onFilterFavorites={() => setOnlyFavorites(!onlyFavorites)}
                activeOrder={activeOrder}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      <DashboardFloatingCart />

      {/* Mobile Bottom Navigation Bar */}
      <DashboardMobileNav />
    </div>
  );
}
