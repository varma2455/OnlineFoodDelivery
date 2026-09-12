// Category slug and metadata utilities for FoodExpress

export const categoryToSlug = (name) => {
    if (!name) return "";
    const clean = name.trim().toLowerCase();
    if (clean === "burger") return "burgers";
    if (clean === "fast food" || clean === "fastfood") return "fast-food";
    return clean.replace(/\s+/g, "-");
};

export const slugToCategory = (slug) => {
    if (!slug) return "";
    const clean = slug.trim().toLowerCase();
    const map = {
        "biryani": "Biryani",
        "pizza": "Pizza",
        "burger": "Burger",
        "burgers": "Burger",
        "fast-food": "Fast Food",
        "fastfood": "Fast Food",
        "drinks": "Drinks",
        "drink": "Drinks",
        "desserts": "Desserts",
        "dessert": "Desserts",
        "noodles": "Noodles",
        "noodle": "Noodles",
        "salads": "Salads",
        "salad": "Salads",
        "chinese": "Chinese",
        "south-indian": "South Indian",
        "north-indian": "North Indian",
        "beverages": "Beverages",
        "snacks": "Snacks",
        "sea-food": "Sea Food",
        "seafood": "Sea Food"
    };

    if (map[clean]) return map[clean];
    return clean
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
};

export const categoryMeta = {
    Biryani: {
        name: "Biryani",
        slug: "biryani",
        tagline: "Royal Dum & Fragrant Spices",
        description: "Discover the best biryani available in your area. Tender, slow-cooked dum biryani with fragrant saffron rice and rich spices.",
        badge: "👑 ROYAL CUISINE",
        bannerImage: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1600",
        icon: "🍗",
        stats: "Slow-Cooked Dum • Saffron Infused • 100% Authentic"
    },
    Pizza: {
        name: "Pizza",
        slug: "pizza",
        tagline: "Woodfired & Extra Cheesy",
        description: "Popular pizza choices from restaurants available in your area. Handcrafted artisanal crusts loaded with fresh toppings and melted cheese.",
        badge: "🍕 WOODFIRED DELIGHTS",
        bannerImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1600",
        icon: "🍕",
        stats: "Hand-Tossed Dough • Mozzarella Loaded • Freshly Baked"
    },
    Burger: {
        name: "Burger",
        slug: "burgers",
        tagline: "Juicy Patties & Gourmet Buns",
        description: "Juicy gourmet burgers, crispy chicken patties, and fresh toasted brioche buns available near you.",
        badge: "🍔 GOURMET CRAFTED",
        bannerImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1600",
        icon: "🍔",
        stats: "Grilled & Crispy • Brioche Buns • Secret Sauces"
    },
    "Fast Food": {
        name: "Fast Food",
        slug: "fast-food",
        tagline: "Quick Bites & Street Favorites",
        description: "Quick bites, crispy fries, loaded nachos, and savory street favorites delivered hot in your area.",
        badge: "🌮 EXPRESS MUNCHIES",
        bannerImage: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=1600",
        icon: "🌮",
        stats: "Super Crispy • Hot & Fresh • 20-Min Prep"
    },
    Drinks: {
        name: "Drinks",
        slug: "drinks",
        tagline: "Chilled Sips & Craft Brews",
        description: "Refreshing iced brews, fresh fruit smoothies, and signature coolers available in your area.",
        badge: "🥤 ICED REFRESHMENT",
        bannerImage: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=1600",
        icon: "🥤",
        stats: "Real Fruit • Artisan Brewed • Ice Chilled"
    },
    Desserts: {
        name: "Desserts",
        slug: "desserts",
        tagline: "Decadent Delights & Sweet Cravings",
        description: "Sweet treats and desserts available near you. Decadent cheesecakes, warm brownies, and gourmet confectionery.",
        badge: "🍰 SWEET TEMPTATION",
        bannerImage: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1600",
        icon: "🍰",
        stats: "Artisan Bakery • 100% Eggless Choices • Fresh Cream"
    },
    Noodles: {
        name: "Noodles",
        slug: "noodles",
        tagline: "Wok-Tossed Flavors & Asian Bowls",
        description: "Fiery Schezwan, wok-tossed garlic Hakka, and authentic Asian noodle dishes available near you.",
        badge: "🍜 WOK TOSSED",
        bannerImage: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=1600",
        icon: "🍜",
        stats: "High Flame Wok • Rich Aromatics • Steaming Hot"
    },
    Salads: {
        name: "Salads",
        slug: "salads",
        tagline: "Farm Fresh & Organic Greens",
        description: "Crisp, farm-fresh nutrient-packed bowls and organic garden salads available in your area.",
        badge: "🥗 CLEAN & GREEN",
        bannerImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600",
        icon: "🥗",
        stats: "Farm-to-Table • Organic Dressing • Nutrient Packed"
    }
};

export const getCategoryMeta = (categoryName) => {
    if (!categoryName) {
        return {
            name: "Category",
            slug: "all",
            tagline: "Delicious Cuisines",
            description: "Discover delicious dishes freshly prepared and available in your area.",
            badge: "🍽️ FOODEXPRESS",
            bannerImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600",
            icon: "🍽️",
            stats: "Fast Delivery • Fresh Ingredients • Top Rated"
        };
    }

    const matched = categoryMeta[categoryName];
    if (matched) return matched;

    return {
        name: categoryName,
        slug: categoryToSlug(categoryName),
        tagline: `${categoryName} Specials`,
        description: `Discover the best ${categoryName.toLowerCase()} available in your area.`,
        badge: `🍽️ ${categoryName.toUpperCase()}`,
        bannerImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600",
        icon: "🍽️",
        stats: "Fast Delivery • Handcrafted Recipes • Top Rated"
    };
};
