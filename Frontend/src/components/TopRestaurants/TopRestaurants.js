import React, { useContext, useMemo, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import FoodCard from "../FoodCard/FoodCard";
import "./TopRestaurants.css";

// Comprehensive dishes dataset for All Dishes browsing
const defaultAllDishes = [
  {
    _id: "ad-1",
    name: "Dum Handi Chicken Biryani",
    restaurant: "Paradise Biryani",
    category: "Biryani",
    price: 299,
    discountPrice: 249,
    rating: 4.8,
    totalReviews: 2450,
    deliveryTime: 25,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800",
    description: "Fragrant aged Basmati rice layered with slow-cooked succulent chicken & saffron ghee."
  },
  {
    _id: "ad-2",
    name: "Farmhouse Cheesy Burst Pizza",
    restaurant: "Domino's Pizza",
    category: "Pizza",
    price: 349,
    discountPrice: 299,
    rating: 4.7,
    totalReviews: 1980,
    deliveryTime: 25,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    description: "Loaded with crunchy bell peppers, golden corn, juicy tomatoes, and melted mozzarella."
  },
  {
    _id: "ad-3",
    name: "Crispy Chicken Zinger Burger",
    restaurant: "Burger King",
    category: "Burger",
    price: 199,
    discountPrice: 169,
    rating: 4.8,
    totalReviews: 2150,
    deliveryTime: 20,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
    description: "Extra crunchy spiced fried chicken fillet with fresh lettuce and signature spicy mayo."
  },
  {
    _id: "ad-4",
    name: "Spicy Schezwan Chicken Noodles",
    restaurant: "Chinese Bowl",
    category: "Noodles",
    price: 229,
    discountPrice: 189,
    rating: 4.6,
    totalReviews: 1420,
    deliveryTime: 22,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800",
    description: "Wok-tossed noodles tossed with red schezwan chili sauce, shredded chicken, and veggies."
  },
  {
    _id: "ad-5",
    name: "Butter Masala Dosa",
    restaurant: "Sri Sai Tiffins",
    category: "Fast Food",
    price: 149,
    discountPrice: 129,
    rating: 4.8,
    totalReviews: 1850,
    deliveryTime: 18,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
    description: "Crisp golden fermented crepe filled with spiced potato masala and served with chutneys."
  },
  {
    _id: "ad-6",
    name: "Hot & Crispy Fried Chicken",
    restaurant: "KFC",
    category: "Fast Food",
    price: 249,
    discountPrice: 199,
    rating: 4.7,
    totalReviews: 3100,
    deliveryTime: 25,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800",
    description: "Secret blend of 11 herbs and spices coating tender juicy fried chicken drumettes."
  },
  {
    _id: "ad-7",
    name: "Creamy Alfredo Pasta Bowl",
    restaurant: "Italiano Bistro",
    category: "Noodles",
    price: 279,
    discountPrice: 229,
    rating: 4.6,
    totalReviews: 1120,
    deliveryTime: 20,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",
    description: "Rich parmesan cream sauce, garlic sautéed mushrooms and buttered broccoli florets."
  },
  {
    _id: "ad-8",
    name: "Belgian Chocolate Lava Cake",
    restaurant: "Sweet Indulgence",
    category: "Desserts",
    price: 159,
    discountPrice: 129,
    rating: 4.9,
    totalReviews: 2890,
    deliveryTime: 15,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800",
    description: "Warm molten dark chocolate center oozing out of soft cocoa sponge."
  },
  {
    _id: "ad-9",
    name: "Hyderabadi Mutton Dum Biryani",
    restaurant: "Biryani House",
    category: "Biryani",
    price: 349,
    discountPrice: 299,
    rating: 4.9,
    totalReviews: 3400,
    deliveryTime: 30,
    isVeg: false,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
    description: "Tender goat meat infused with shahi spices, mint and saffron layered with basmati."
  },
  {
    _id: "ad-10",
    name: "Classic Margherita Pizza",
    restaurant: "Pizza Hut",
    category: "Pizza",
    price: 249,
    discountPrice: 199,
    rating: 4.7,
    totalReviews: 1780,
    deliveryTime: 25,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
    description: "Classic pizza with rich tomato marinara, fresh mozzarella cheese and basil leaves."
  },
  {
    _id: "ad-11",
    name: "Grilled Paneer Protein Sub",
    restaurant: "Subway",
    category: "Fast Food",
    price: 189,
    discountPrice: 159,
    rating: 4.6,
    totalReviews: 1650,
    deliveryTime: 15,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800",
    description: "Toasted multigrain bread with herb grilled paneer cubes, fresh salad and honey mustard."
  },
  {
    _id: "ad-12",
    name: "Signature Roasted Cold Coffee",
    restaurant: "Cafe Coffee Day",
    category: "Drinks",
    price: 139,
    discountPrice: 109,
    rating: 4.7,
    totalReviews: 1240,
    deliveryTime: 15,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
    description: "Slow-brewed dark roast espresso shaken with chilled milk and chocolate drizzle."
  },
  {
    _id: "ad-13",
    name: "Classic Veg Hakka Noodles",
    restaurant: "Chinese Wok",
    category: "Noodles",
    price: 199,
    discountPrice: 169,
    rating: 4.6,
    totalReviews: 950,
    deliveryTime: 20,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800",
    description: "Traditional wok-tossed noodles with shredded cabbage, carrots, bell peppers & spring onion."
  },
  {
    _id: "ad-14",
    name: "Paneer Tikka Butter Masala",
    restaurant: "Punjab Grill",
    category: "Fast Food",
    price: 259,
    discountPrice: 229,
    rating: 4.8,
    totalReviews: 2100,
    deliveryTime: 25,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
    description: "Charcoal-grilled cottage cheese in velvety tomato-cashew gravy served hot."
  },
  {
    _id: "ad-15",
    name: "Avocado Greek Salad Bowl",
    restaurant: "Green Leaf Cafe",
    category: "Salads",
    price: 229,
    discountPrice: 199,
    rating: 4.7,
    totalReviews: 890,
    deliveryTime: 15,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800",
    description: "Hass avocado, crisp cucumber, kalamata olives, and crumbled feta cheese with herb vinaigrette."
  },
  {
    _id: "ad-16",
    name: "Steamed Veg Himalayan Momos",
    restaurant: "The Momo Co.",
    category: "Fast Food",
    price: 159,
    discountPrice: 129,
    rating: 4.7,
    totalReviews: 1450,
    deliveryTime: 18,
    isVeg: true,
    image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800",
    description: "Handcrafted thin flour dumplings packed with spiced vegetables, served with red chilli dip."
  }
];

export default function TopRestaurants({
  foods,
  selectedCategory = "All",
  searchTerm = "",
  sortBy = "recommended",
  onViewAll
}) {
  const { foodList = [] } = useContext(StoreContext);
  const [visibleCount, setVisibleCount] = useState(12);

  const processedDishes = useMemo(() => {
    let source =
      foods && foods.length > 0
        ? foods
        : foodList && foodList.length > 0
        ? foodList
        : defaultAllDishes;

    // Apply filtering only if foods prop was not pre-filtered
    if (!foods) {
      if (selectedCategory && selectedCategory !== "All") {
        const cat = selectedCategory.toLowerCase();
        source = source.filter(
          (f) =>
            f.category?.toLowerCase().includes(cat) ||
            f.name?.toLowerCase().includes(cat)
        );
      }

      if (searchTerm && searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        source = source.filter(
          (f) =>
            f.name?.toLowerCase().includes(q) ||
            f.restaurant?.toLowerCase().includes(q) ||
            f.category?.toLowerCase().includes(q)
        );
      }

      if (sortBy === "price-low") {
        source = [...source].sort(
          (a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price)
        );
      } else if (sortBy === "price-high") {
        source = [...source].sort(
          (a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price)
        );
      } else if (sortBy === "rating") {
        source = [...source].sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
      } else if (sortBy === "fastest") {
        source = [...source].sort(
          (a, b) => (a.deliveryTime || 25) - (b.deliveryTime || 25)
        );
      }
    }

    return source;
  }, [foods, foodList, selectedCategory, searchTerm, sortBy]);

  const displayedDishes = processedDishes.slice(0, visibleCount);

  const handleViewAllClick = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      if (visibleCount < processedDishes.length) {
        setVisibleCount(processedDishes.length);
      }
      const el = document.getElementById("all-dishes-catalog");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  return (
    <section
      className="all-dishes-section allDishesSection topRestaurants top-restaurants-section"
      id="all-dishes-catalog"
    >
      {/* SECTION HEADER */}
      <div className="titleRow all-dishes-header top-restaurants-header">
        <div className="titleCluster">
          <h2>🍽️ All Dishes</h2>
          <p>Explore delicious dishes from nearby restaurants</p>
        </div>

        <button
          type="button"
          className="view-all viewAllBtn"
          onClick={handleViewAllClick}
        >
          View All →
        </button>
      </div>

      {/* 4 CARDS PER ROW DENSE PRODUCT GRID */}
      <div className="all-dishes-grid restaurantGrid top-restaurants-grid">
        {displayedDishes.map((food) => (
          <div className="all-dishes-card-wrapper" key={food._id || food.id}>
            <FoodCard food={food} compact={true} />
          </div>
        ))}
      </div>

      {/* LOAD MORE IF DISHES REMAIN */}
      {processedDishes.length > visibleCount && (
        <div className="load-more-cluster">
          <button
            type="button"
            className="btn-load-more-dishes"
            onClick={handleLoadMore}
          >
            LOAD MORE DISHES ({processedDishes.length - visibleCount} REMAINING)
          </button>
        </div>
      )}
    </section>
  );
}