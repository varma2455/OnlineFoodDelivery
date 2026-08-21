import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaArrowLeft,
    FaSearch,
    FaHeart,
    FaStar,
    FaClock,
    FaMotorcycle,
    FaFire,
    FaFilter,
    FaChevronDown,
    FaPlus,
    FaShoppingCart
} from "react-icons/fa";

import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";

import "./SaladsPage.css";


const filters = [
    "All",
    "Veg Salads",
    "Chicken Salads",
    "Fruit Salads",
    "Caesar Salads",
    "Greek Salads",
    "Protein Salads",
    "Healthy Bowls"
];


const restaurants = [
    {
        id: 1,
        name: "Fresh Bowl",
        cuisine: "Healthy • Salads",
        image:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600"
    },
    {
        id: 2,
        name: "Green Leaf",
        cuisine: "Healthy • Vegetarian",
        image:
            "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600"
    },
    {
        id: 3,
        name: "Salad Story",
        cuisine: "Salads • Healthy",
        image:
            "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600"
    },
    {
        id: 4,
        name: "Healthy Hub",
        cuisine: "Healthy • Bowls",
        image:
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600"
    },
    {
        id: 5,
        name: "Fit Kitchen",
        cuisine: "Protein • Healthy",
        image:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600"
    }
];


const salads = [

    {
        id: 1,
        name: "Fresh Garden Salad",
        restaurant: "Fresh Bowl",
        category: "Veg Salads",
        price: 149,
        oldPrice: 179,
        rating: 4.7,
        time: "15 min",
        description:
            "Fresh lettuce, cucumber, tomato, carrots and sweet corn with a light dressing.",
        image:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700",
        badge: "BESTSELLER"
    },

    {
        id: 2,
        name: "Chicken Caesar Salad",
        restaurant: "Fresh Bowl",
        category: "Chicken Salads",
        price: 229,
        oldPrice: 259,
        rating: 4.8,
        time: "20 min",
        description:
            "Crispy lettuce with grilled chicken, parmesan and creamy Caesar dressing.",
        image:
            "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=700",
        badge: "POPULAR"
    },

    {
        id: 3,
        name: "Greek Salad",
        restaurant: "Green Leaf",
        category: "Greek Salads",
        price: 179,
        oldPrice: 209,
        rating: 4.6,
        time: "15 min",
        description:
            "Classic Greek salad with cucumber, tomato, olives, onions and feta cheese.",
        image:
            "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700",
        badge: "FRESH"
    },

    {
        id: 4,
        name: "Fruit Salad Bowl",
        restaurant: "Salad Story",
        category: "Fruit Salads",
        price: 159,
        oldPrice: 189,
        rating: 4.7,
        time: "10 min",
        description:
            "A refreshing mix of seasonal fruits served fresh with a light honey dressing.",
        image:
            "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=700",
        badge: "HEALTHY"
    },

    {
        id: 5,
        name: "Protein Power Salad",
        restaurant: "Fit Kitchen",
        category: "Protein Salads",
        price: 249,
        oldPrice: 289,
        rating: 4.9,
        time: "20 min",
        description:
            "Protein-rich salad with grilled chicken, chickpeas, vegetables and seeds.",
        image:
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=700",
        badge: "CHEF'S PICK"
    },

    {
        id: 6,
        name: "Paneer Tikka Salad",
        restaurant: "Healthy Hub",
        category: "Veg Salads",
        price: 199,
        oldPrice: 229,
        rating: 4.8,
        time: "20 min",
        description:
            "Grilled paneer tikka served with crisp vegetables and fresh herbs.",
        image:
            "https://images.unsplash.com/photo-1547592180-85f173990554?w=700",
        badge: "POPULAR"
    },

    {
        id: 7,
        name: "Avocado Healthy Bowl",
        restaurant: "Green Leaf",
        category: "Healthy Bowls",
        price: 219,
        oldPrice: 249,
        rating: 4.7,
        time: "15 min",
        description:
            "Creamy avocado with fresh greens, tomato, corn and nutritious seeds.",
        image:
            "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700",
        badge: "VEG"
    },

    {
        id: 8,
        name: "Chicken Protein Bowl",
        restaurant: "Fit Kitchen",
        category: "Protein Salads",
        price: 269,
        oldPrice: 299,
        rating: 4.9,
        time: "25 min",
        description:
            "Grilled chicken, fresh greens, beans, vegetables and a healthy dressing.",
        image:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700",
        badge: "FAVOURITE"
    }

];


export default function SaladsPage() {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const [activeFilter, setActiveFilter] =
        useState("All");

    const [selectedRestaurant, setSelectedRestaurant] =
        useState("All");

    const [favorites, setFavorites] =
        useState([]);


    const toggleFavorite = (id) => {

        setFavorites((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );

    };


    const filteredSalads = salads.filter((item) => {

        const matchesSearch =
            item.name
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            item.restaurant
                .toLowerCase()
                .includes(search.toLowerCase());


        const matchesFilter =
            activeFilter === "All" ||
            item.category === activeFilter;


        const matchesRestaurant =
            selectedRestaurant === "All" ||
            item.restaurant === selectedRestaurant;


        return (
            matchesSearch &&
            matchesFilter &&
            matchesRestaurant
        );

    });


    const orderSalad = (item) => {

        navigate("/order-salads", {
            state: {
                salad: item
            }
        });

    };


    return (

        <div className="saladsPageLayout">

            <DashboardSidebar />

            <div className="saladsMarketplace">

                <header className="saladsTopHeader">

                    <button
                        className="saladsBackButton"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft />
                    </button>

                    <div className="saladsHeaderTitle">

                        <h2>
                            Salads
                        </h2>

                        <p>
                            Fresh, healthy & delicious salads
                        </p>

                    </div>

                    
                                    <div className="pizzaHeaderRight">
                    
                                        <button className="headerLocation">
                    
                                            <span className="locationDot">
                                                ●
                                            </span>
                    
                                            <div>
                    
                                                <small>
                                                    Delivering to
                                                </small>
                    
                                                <strong>
                                                    Your Location
                                                </strong>
                    
                                            </div>
                    
                                            <FaChevronDown />
                    
                                        </button>
                    
                    
                                        <button className="headerCart">
                    
                                            <FaShoppingCart />
                    
                                            <span>
                                                Cart
                                            </span>
                    
                                        </button>
                                        </div>                    

                </header>


                {/* HERO */}

                <section className="saladsHero">

                    <div className="saladsHeroContent">

                        <span className="saladsHeroBadge">
                            🥗 FRESH & HEALTHY
                        </span>

                        <h2>
                            Find your perfect
                            <span> salad.</span>
                        </h2>

                        <p>
                            Freshly prepared salads, healthy bowls
                            and nutritious meals from your favorite restaurants.
                        </p>

                        <div className="saladsSearchBox">

                            <FaSearch />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search salads or restaurants..."
                            />

                        </div>

                        <div className="saladsHeroStats">

                            <div>
                                <strong>40+</strong>
                                <span>Salad Items</span>
                            </div>

                            <div>
                                <strong>15 min</strong>
                                <span>Average Delivery</span>
                            </div>

                            <div>
                                <strong>4.8★</strong>
                                <span>Top Rating</span>
                            </div>

                        </div>

                    </div>


                    <div className="saladsHeroImage">

                        <img
                            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700"
                            alt="Fresh Salad"
                        />

                    </div>

                </section>


                {/* FILTER HEADER */}

                <section className="saladsFilterHeader">

                    <div>

                        <h2>
                            What are you craving?
                        </h2>

                        <p>
                            Choose your favorite healthy meal
                        </p>

                    </div>

                    <div className="saladsSort">

                        <FaFilter />

                        <span>
                            Sort
                        </span>

                        <FaChevronDown />

                    </div>

                </section>


                {/* FILTERS */}

                <div className="saladsFilters">

                    {filters.map((filter) => (

                        <button
                            key={filter}
                            className={
                                activeFilter === filter
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveFilter(filter)
                            }
                        >
                            {filter}
                        </button>

                    ))}

                </div>


                {/* RESTAURANTS */}

                <section className="saladsRestaurants">

                    <div className="saladsSectionHeader">

                        <div>

                            <h2>
                                Popular Salad Restaurants
                            </h2>

                            <p>
                                Top restaurants serving fresh healthy meals
                            </p>

                        </div>

                    </div>


                    <div className="saladsRestaurantGrid">

                        <button
                            className={
                                selectedRestaurant === "All"
                                    ? "saladsRestaurantCard active"
                                    : "saladsRestaurantCard"
                            }
                            onClick={() =>
                                setSelectedRestaurant("All")
                            }
                        >

                            <div className="saladsRestaurantImage">

                                <img
                                    src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500"
                                    alt="All Restaurants"
                                />

                            </div>

                            <div className="saladsRestaurantInfo">

                                <strong>
                                    All Restaurants
                                </strong>

                                <span>
                                    All salad varieties
                                </span>

                            </div>

                        </button>


                        {restaurants.map((restaurant) => (

                            <button
                                key={restaurant.id}
                                className={
                                    selectedRestaurant === restaurant.name
                                        ? "saladsRestaurantCard active"
                                        : "saladsRestaurantCard"
                                }
                                onClick={() =>
                                    setSelectedRestaurant(
                                        restaurant.name
                                    )
                                }
                            >

                                <div className="saladsRestaurantImage">

                                    <img
                                        src={restaurant.image}
                                        alt={restaurant.name}
                                    />

                                </div>

                                <div className="saladsRestaurantInfo">

                                    <strong>
                                        {restaurant.name}
                                    </strong>

                                    <span>
                                        {restaurant.cuisine}
                                    </span>

                                </div>

                            </button>

                        ))}

                    </div>

                </section>


                {/* PRODUCTS */}

                <section className="saladsProducts">

                    <div className="saladsProductHeader">

                        <div>

                            <h2>
                                Popular Salads
                            </h2>

                            <p>
                                Fresh and healthy meals available
                            </p>

                        </div>

                    </div>


                    {filteredSalads.length === 0 ? (

                        <div className="saladsEmpty">

                            <span>
                                🥗
                            </span>

                            <h3>
                                No salads found
                            </h3>

                            <p>
                                Try another search or category.
                            </p>

                        </div>

                    ) : (

                        <div className="saladsProductGrid">

                            {filteredSalads.map((item) => (

                                <article
                                    className="saladsCard"
                                    key={item.id}
                                >

                                    <div className="saladsCardImage">

                                        <img
                                            src={item.image}
                                            alt={item.name}
                                        />

                                        <span className="saladsBadge">
                                            {item.badge}
                                        </span>

                                        <button
                                            className={
                                                favorites.includes(item.id)
                                                    ? "saladsHeart active"
                                                    : "saladsHeart"
                                            }
                                            onClick={() =>
                                                toggleFavorite(item.id)
                                            }
                                        >
                                            <FaHeart />
                                        </button>

                                    </div>


                                    <div className="saladsCardContent">

                                        <span className="saladsRestaurantName">
                                            {item.restaurant}
                                        </span>

                                        <h3>
                                            {item.name}
                                        </h3>

                                        <p>
                                            {item.description}
                                        </p>

                                        <div className="saladsInfo">

                                            <span>
                                                <FaStar />
                                                {item.rating}
                                            </span>

                                            <span>
                                                <FaClock />
                                                {item.time}
                                            </span>

                                        </div>


                                        <div className="saladsPriceRow">

                                            <div>

                                                <strong>
                                                    ₹{item.price}
                                                </strong>

                                                <del>
                                                    ₹{item.oldPrice}
                                                </del>

                                            </div>

                                            <button
                                                onClick={() =>
                                                    orderSalad(item)
                                                }
                                            >

                                                <FaPlus />

                                                Add

                                            </button>

                                        </div>

                                    </div>

                                </article>

                            ))}

                        </div>

                    )}

                </section>


                <div className="saladsDeliveryBanner">

                    <div>
                        🚴
                    </div>

                    <div>

                        <h3>
                            Fresh salads, delivered fast
                        </h3>

                        <p>
                            Healthy and freshly prepared meals delivered
                            straight to your door.
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );

}