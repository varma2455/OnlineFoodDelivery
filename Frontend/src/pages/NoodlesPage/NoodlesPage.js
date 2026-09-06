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

import "./NoodlesPage.css";


const filters = [
    "All",
    "Veg Noodles",
    "Chicken Noodles",
    "Schezwan Noodles",
    "Hakka Noodles",
    "Chilli Garlic",
    "Singapore Noodles",
    "Egg Noodles"
];


const restaurants = [
    {
        id: 1,
        name: "Chinese Wok",
        cuisine: "Chinese • Fast Food",
        image:
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600"
    },

    {
        id: 2,
        name: "Mainland China",
        cuisine: "Chinese • Asian",
        image:
            "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600"
    },

    {
        id: 3,
        name: "Wok This Way",
        cuisine: "Chinese • Noodles",
        image:
            "https://images.unsplash.com/photo-1552611052-33e04de081de?w=600"
    },

    {
        id: 4,
        name: "Noodle Bar",
        cuisine: "Noodles • Chinese",
        image:
            "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600"
    },

    {
        id: 5,
        name: "Wow! China",
        cuisine: "Chinese • Asian",
        image:
            "https://images.unsplash.com/photo-1547592180-85f173990554?w=600"
    }
];


const noodles = [

    {
        id: 1,
        name: "Veg Hakka Noodles",
        restaurant: "Chinese Wok",
        category: "Veg Noodles",
        price: 169,
        oldPrice: 199,
        rating: 4.7,
        time: "20 min",
        description:
            "Freshly prepared Hakka noodles tossed with vegetables and delicious Chinese sauces.",
        image:
            "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=700",
        badge: "BESTSELLER"
    },

    {
        id: 2,
        name: "Chicken Hakka Noodles",
        restaurant: "Wok This Way",
        category: "Chicken Noodles",
        price: 219,
        oldPrice: 249,
        rating: 4.8,
        time: "25 min",
        description:
            "Wok-tossed noodles with tender chicken, fresh vegetables and flavorful sauces.",
        image:
            "https://images.unsplash.com/photo-1552611052-33e04de081de?w=700",
        badge: "POPULAR"
    },

    {
        id: 3,
        name: "Schezwan Noodles",
        restaurant: "Chinese Wok",
        category: "Schezwan Noodles",
        price: 189,
        oldPrice: 219,
        rating: 4.6,
        time: "20 min",
        description:
            "Spicy Schezwan noodles prepared with fresh vegetables and bold Chinese flavors.",
        image:
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700",
        badge: "SPICY"
    },

    {
        id: 4,
        name: "Chilli Garlic Noodles",
        restaurant: "Noodle Bar",
        category: "Chilli Garlic",
        price: 199,
        oldPrice: 229,
        rating: 4.7,
        time: "22 min",
        description:
            "Aromatic noodles tossed with chilli, garlic and fresh vegetables.",
        image:
            "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=700",
        badge: "HOT"
    },

    {
        id: 5,
        name: "Singapore Noodles",
        restaurant: "Mainland China",
        category: "Singapore Noodles",
        price: 229,
        oldPrice: 259,
        rating: 4.8,
        time: "25 min",
        description:
            "Delicious Singapore-style noodles with vegetables and aromatic spices.",
        image:
            "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=700",
        badge: "CHEF'S PICK"
    },

    {
        id: 6,
        name: "Chicken Schezwan Noodles",
        restaurant: "Wok This Way",
        category: "Chicken Noodles",
        price: 239,
        oldPrice: 279,
        rating: 4.8,
        time: "25 min",
        description:
            "Tender chicken combined with spicy Schezwan sauce and wok-fried noodles.",
        image:
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700",
        badge: "POPULAR"
    },

    {
        id: 7,
        name: "Veg Chilli Garlic Noodles",
        restaurant: "Noodle Bar",
        category: "Chilli Garlic",
        price: 179,
        oldPrice: 209,
        rating: 4.5,
        time: "20 min",
        description:
            "Fresh vegetables and noodles tossed with chilli and roasted garlic.",
        image:
            "https://images.unsplash.com/photo-1547592180-85f173990554?w=700",
        badge: "VEG"
    },

    {
        id: 8,
        name: "Egg Noodles",
        restaurant: "Wow! China",
        category: "Egg Noodles",
        price: 179,
        oldPrice: 209,
        rating: 4.6,
        time: "20 min",
        description:
            "Classic wok-fried noodles prepared with egg, vegetables and Chinese sauces.",
        image:
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700",
        badge: "FAVOURITE"
    }

];


export default function NoodlesPage() {

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


    const filteredNoodles = noodles.filter((item) => {

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


    const orderNoodles = (item) => {

        navigate(`/order-noodles/${item.id}`, {
    
            state: {
                noodles: item
            }
    
        });
    
    };


    return (

        <div className="noodlesPageLayout">

            <DashboardSidebar />


            <div className="noodlesMarketplace">


                {/* =========================
                    HEADER
                ========================= */}

                <header className="noodlesTopHeader">

                    <button
                        className="noodlesBackButton"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft />
                    </button>


                    <div className="noodlesHeaderTitle">

                        <h2>
                            Noodles
                        </h2>

                        <p>
                            Hakka, Schezwan, Chinese & more
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



                {/* =========================
                    HERO
                ========================= */}

                <section className="noodlesHero">


                    <div className="noodlesHeroContent">

                        <span className="noodlesHeroBadge">

                            🍜

                            FRESH & HOT

                        </span>


                        <h2>

                            Find your perfect

                            <span>
                                noodles.
                            </span>

                        </h2>


                        <p>

                            Delicious, freshly prepared noodles
                            from your favorite restaurants.

                        </p>


                        <div className="noodlesSearchBox">

                            <FaSearch />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search noodles or restaurants..."
                            />

                        </div>


                        <div className="noodlesHeroStats">

                            <div>

                                <strong>
                                    40+
                                </strong>

                                <span>
                                    Noodle Items
                                </span>

                            </div>


                            <div>

                                <strong>
                                    20 min
                                </strong>

                                <span>
                                    Average Delivery
                                </span>

                            </div>


                            <div>

                                <strong>
                                    4.8★
                                </strong>

                                <span>
                                    Top Rating
                                </span>

                            </div>

                        </div>

                    </div>


                    <div className="noodlesHeroImage">

                        <img
                            src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500"
                            alt="Noodles"
                        />

                    </div>

                </section>



                {/* =========================
                    FILTER HEADER
                ========================= */}

                <section className="noodlesFilterHeader">

                    <div>

                        <h2>
                            What are you craving?
                        </h2>

                        <p>
                            Choose your favorite noodles
                        </p>

                    </div>


                    <div className="noodlesSort">

                        <FaFilter />

                        <span>
                            Sort
                        </span>

                        <FaChevronDown />

                    </div>

                </section>



                {/* =========================
                    FILTERS
                ========================= */}

                <div className="noodlesFilters">

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



                {/* =========================
                    RESTAURANTS
                ========================= */}

                <section className="noodlesRestaurants">

                    <div className="noodlesSectionHeader">

                        <h2>
                            Popular Noodle Restaurants
                        </h2>

                        <p>
                            Top restaurants serving delicious noodles
                        </p>

                    </div>


                    <div className="noodlesRestaurantGrid">


                        <button
                            className={
                                selectedRestaurant === "All"
                                    ? "noodlesRestaurantCard active"
                                    : "noodlesRestaurantCard"
                            }
                            onClick={() =>
                                setSelectedRestaurant("All")
                            }
                        >

                            <div className="noodlesRestaurantImage">

                                <img
                                    src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500"
                                    alt="All Noodles"
                                />

                            </div>


                            <div className="noodlesRestaurantInfo">

                                <strong>
                                    All Restaurants
                                </strong>

                                <span>
                                    All noodle varieties
                                </span>

                            </div>

                        </button>


                        {restaurants.map((restaurant) => (

                            <button
                                key={restaurant.id}
                                className={
                                    selectedRestaurant === restaurant.name
                                        ? "noodlesRestaurantCard active"
                                        : "noodlesRestaurantCard"
                                }
                                onClick={() =>
                                    setSelectedRestaurant(
                                        restaurant.name
                                    )
                                }
                            >

                                <div className="noodlesRestaurantImage">

                                    <img
                                        src={restaurant.image}
                                        alt={restaurant.name}
                                    />

                                </div>


                                <div className="noodlesRestaurantInfo">

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



                {/* =========================
                    PRODUCTS
                ========================= */}

                <section className="noodlesProducts">

                    <div className="noodlesProductHeader">

                        <h2>
                            Popular Noodles
                        </h2>

                        <p>
                            Delicious noodles available
                        </p>

                    </div>


                    {filteredNoodles.length === 0 ? (

                        <div className="noodlesEmpty">

                            <span>
                                🍜
                            </span>

                            <h3>
                                No noodles found
                            </h3>

                            <p>
                                Try another search or category.
                            </p>

                        </div>

                    ) : (

                        <div className="noodlesProductGrid">

                            {filteredNoodles.map((item) => (

                                <article
                                    className="noodlesCard"
                                    key={item.id}
                                >


                                    <div className="noodlesCardImage">

                                        <img
                                            src={item.image}
                                            alt={item.name}
                                        />


                                        <span className="noodlesBadge">

                                            {item.badge}

                                        </span>


                                        <button
                                            className={
                                                favorites.includes(item.id)
                                                    ? "noodlesHeart active"
                                                    : "noodlesHeart"
                                            }
                                            onClick={() =>
                                                toggleFavorite(item.id)
                                            }
                                        >

                                            <FaHeart />

                                        </button>

                                    </div>



                                    <div className="noodlesCardContent">

                                        <span className="noodlesRestaurantName">

                                            {item.restaurant}

                                        </span>


                                        <h3>
                                            {item.name}
                                        </h3>


                                        <p className="noodlesDescription">
    {item.description}
</p>


                                        <div className="noodlesInfo">

                                            <span>

                                                <FaStar />

                                                {item.rating}

                                            </span>


                                            <span>

                                                <FaClock />

                                                {item.time}

                                            </span>

                                        </div>



                                        <div className="noodlesPriceRow">

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
                                                    orderNoodles(item)
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



                {/* =========================
                    DELIVERY BANNER
                ========================= */}

                <div className="noodlesDeliveryBanner">

                    <div>
                        🚴
                    </div>

                    <div>

                        <h3>
                            Hot noodles, delivered fast
                        </h3>

                        <p>
                            Freshly prepared noodles delivered
                            straight to your door.
                        </p>

                    </div>

                </div>


            </div>

        </div>

    );

}