import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { categoryToSlug } from "../../utils/categoryUtils";
import "./Category.css";

const defaultCategoryIcons = {
    Pizza: "🍕",
    Burger: "🍔",
    Biryani: "🍗",
    Drinks: "🥤",
    Desserts: "🍰",
    "Fast Food": "🌮",
    Salads: "🥗",
    Noodles: "🍜",
    Chinese: "🥟",
    "South Indian": "🥘",
    "North Indian": "🍲",
    Beverages: "🧋",
    Snacks: "🍟"
};

const Category = ({ selectedCategory, onSelectCategory, navigateOnClick = true }) => {
    const { categories: dynamicCategories } = useContext(StoreContext);
    const navigate = useNavigate();

    // Combine dynamic categories with defaults
    const categoryList =
        dynamicCategories && dynamicCategories.length > 0
            ? dynamicCategories.map((cat, index) => ({
                  id: index + 1,
                  name: cat.name,
                  icon: defaultCategoryIcons[cat.name] || "🍽️",
                  count: cat.count
              }))
            : [
                  { id: 1, name: "Biryani", icon: "🍗" },
                  { id: 2, name: "Pizza", icon: "🍕" },
                  { id: 3, name: "Burger", icon: "🍔" },
                  { id: 4, name: "Fast Food", icon: "🌮" },
                  { id: 5, name: "Drinks", icon: "🥤" },
                  { id: 6, name: "Desserts", icon: "🍰" },
                  { id: 7, name: "Noodles", icon: "🍜" },
                  { id: 8, name: "Salads", icon: "🥗" }
              ];

    const handleClick = (categoryName) => {
        if (categoryName === "All") {
            if (onSelectCategory) {
                onSelectCategory("All");
            } else {
                navigate("/menu");
            }
            return;
        }

        if (navigateOnClick) {
            navigate(`/category/${categoryToSlug(categoryName)}`);
        } else if (onSelectCategory) {
            onSelectCategory(selectedCategory === categoryName ? "All" : categoryName);
        } else {
            navigate(`/category/${categoryToSlug(categoryName)}`);
        }
    };

    return (
        <section className="category-section">
            <div className="category-header">
                <div className="category-badge">EXPLORE CUISINES</div>
                <h2>Inspiration for Your First Order</h2>
                <p>Top categories with handcrafted recipes and instant delivery</p>
            </div>

            <div className="category-scroll-container">
                <div
                    className={`category-card ${!selectedCategory || selectedCategory === "All" ? "active" : ""}`}
                    onClick={() => handleClick("All")}
                >
                    <div className="category-icon-wrapper">
                        <span className="category-icon">✨</span>
                    </div>
                    <span className="category-name">All Foods</span>
                </div>

                {categoryList.map((cat) => (
                    <div
                        key={cat.id}
                        className={`category-card ${selectedCategory === cat.name ? "active" : ""}`}
                        onClick={() => handleClick(cat.name)}
                    >
                        <div className="category-icon-wrapper">
                            <span className="category-icon">{cat.icon}</span>
                        </div>
                        <span className="category-name">{cat.name}</span>
                        {cat.count !== undefined && (
                            <small className="category-count">{cat.count} items</small>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Category;