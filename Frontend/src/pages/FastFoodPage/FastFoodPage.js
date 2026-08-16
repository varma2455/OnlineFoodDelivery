import React, { useMemo, useState } from "react";
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
    FaPlus
} from "react-icons/fa";

import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";

import "./FastFoodPage.css";


/* =====================================================
   FAST FOOD DATA
===================================================== */

const fastFoods = [

    {
        id: 1,
        name: "Chicken Fried Rice",
        restaurant: "Chinese Wok",
        restaurantId: 1,
        category: "Fried Rice",
        rating: "4.8",
        reviews: "3.2k",
        price: 229,
        oldPrice: 279,
        time: "25 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900",
        description:
            "Fragrant basmati rice tossed with tender chicken, fresh vegetables, spring onions and aromatic Chinese sauces."
    },

    {
        id: 2,
        name: "Schezwan Chicken Fried Rice",
        restaurant: "Wok This Way",
        restaurantId: 2,
        category: "Fried Rice",
        rating: "4.7",
        reviews: "2.8k",
        price: 249,
        oldPrice: 299,
        time: "25 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900",
        description:
            "Spicy Schezwan fried rice prepared with chicken, vegetables and fiery Schezwan sauce."
    },

    {
        id: 3,
        name: "Veg Fried Rice",
        restaurant: "The Chinese Kitchen",
        restaurantId: 3,
        category: "Fried Rice",
        rating: "4.6",
        reviews: "2.1k",
        price: 179,
        oldPrice: 219,
        time: "20 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900",
        description:
            "Classic vegetable fried rice with fresh carrots, beans, cabbage, spring onions and Chinese seasoning."
    },

    {
        id: 4,
        name: "Egg Fried Rice",
        restaurant: "Noodle Bar",
        restaurantId: 4,
        category: "Fried Rice",
        rating: "4.7",
        reviews: "1.9k",
        price: 199,
        oldPrice: 239,
        time: "20 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900",
        description:
            "Fluffy scrambled eggs tossed with fragrant rice, vegetables and signature sauces."
    },

    {
        id: 5,
        name: "Chicken Hakka Noodles",
        restaurant: "Chinese Wok",
        restaurantId: 1,
        category: "Noodles",
        rating: "4.8",
        reviews: "3.5k",
        price: 239,
        oldPrice: 289,
        time: "25 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1552611052-33e04de081de?w=900",
        description:
            "Classic Hakka noodles tossed with tender chicken, crunchy vegetables and flavorful sauces."
    },

    {
        id: 6,
        name: "Schezwan Veg Noodles",
        restaurant: "Wok This Way",
        restaurantId: 2,
        category: "Noodles",
        rating: "4.6",
        reviews: "2.2k",
        price: 189,
        oldPrice: 229,
        time: "20 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900",
        description:
            "Spicy Schezwan noodles loaded with fresh vegetables and authentic Chinese flavors."
    },

    {
        id: 7,
        name: "Chicken Manchurian",
        restaurant: "The Chinese Kitchen",
        restaurantId: 3,
        category: "Starters",
        rating: "4.8",
        reviews: "3.1k",
        price: 269,
        oldPrice: 319,
        time: "25 min",
        badge: "Top Rated",
        image:
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900",
        description:
            "Crispy chicken pieces tossed in a rich Manchurian sauce with garlic, ginger and spring onions."
    },

    {
        id: 8,
        name: "Gobi Manchurian",
        restaurant: "Spice Hub",
        restaurantId: 5,
        category: "Starters",
        rating: "4.6",
        reviews: "1.8k",
        price: 199,
        oldPrice: 249,
        time: "20 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=900",
        description:
            "Crispy cauliflower florets coated in spicy Manchurian sauce with fresh spring onions."
    },

    {
        id: 9,
        name: "Chilli Chicken",
        restaurant: "Chinese Wok",
        restaurantId: 1,
        category: "Chicken",
        rating: "4.8",
        reviews: "2.9k",
        price: 289,
        oldPrice: 349,
        time: "30 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900",
        description:
            "Tender chicken pieces tossed with green chillies, onions, capsicum and spicy Chinese sauce."
    },

    {
        id: 10,
        name: "Paneer Chilli",
        restaurant: "Spice Hub",
        restaurantId: 5,
        category: "Paneer",
        rating: "4.7",
        reviews: "2.4k",
        price: 249,
        oldPrice: 299,
        time: "25 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=900",
        description:
            "Soft paneer cubes tossed with capsicum, onions, green chillies and flavorful chilli sauce."
    },

    {
        id: 11,
        name: "Chicken 65",
        restaurant: "Mainland China",
        restaurantId: 6,
        category: "Starters",
        rating: "4.9",
        reviews: "4.1k",
        price: 279,
        oldPrice: 329,
        time: "25 min",
        badge: "Top Rated",
        image:
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900",
        description:
            "Crispy South Indian style Chicken 65 marinated with spices and deep fried to perfection."
    },

    {
        id: 12,
        name: "Crispy Corn",
        restaurant: "Wok This Way",
        restaurantId: 2,
        category: "Starters",
        rating: "4.5",
        reviews: "1.5k",
        price: 189,
        oldPrice: 229,
        time: "20 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=900",
        description:
            "Crispy golden corn tossed with herbs, spices, onions and a delicious seasoning."
    },

    {
        id: 13,
        name: "Chicken Spring Rolls",
        restaurant: "Noodle Bar",
        restaurantId: 4,
        category: "Starters",
        rating: "4.6",
        reviews: "1.7k",
        price: 219,
        oldPrice: 269,
        time: "20 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1548507200-5f6b8e8a7c0e?w=900",
        description:
            "Crispy spring rolls filled with seasoned chicken and fresh vegetables."
    },

    {
        id: 14,
        name: "Veg Spring Rolls",
        restaurant: "The Chinese Kitchen",
        restaurantId: 3,
        category: "Starters",
        rating: "4.5",
        reviews: "1.4k",
        price: 169,
        oldPrice: 199,
        time: "20 min",
        badge: "20% OFF",
        image:
            "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=900",
        description:
            "Crispy vegetable spring rolls packed with cabbage, carrots and aromatic seasoning."
    },

    {
        id: 15,
        name: "Dragon Chicken",
        restaurant: "Mainland China",
        restaurantId: 6,
        category: "Chicken",
        rating: "4.8",
        reviews: "2.7k",
        price: 299,
        oldPrice: 359,
        time: "30 min",
        badge: "Chef Special",
        image:
            "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900",
        description:
            "Crispy chicken tossed in spicy dragon sauce with cashews, chillies and spring onions."
    },

    {
        id: 16,
        name: "Paneer 65",
        restaurant: "Spice Hub",
        restaurantId: 5,
        category: "Paneer",
        rating: "4.6",
        reviews: "1.6k",
        price: 229,
        oldPrice: 269,
        time: "25 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=900",
        description:
            "Crispy paneer cubes marinated with South Indian spices and fried until golden."
    }

];


/* =====================================================
   RESTAURANTS
===================================================== */

const restaurants = [

    {
        id: 1,
        name: "Chinese Wok",
        rating: "4.8",
        time: "20-25 min",
        image:
            "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=900"
    },

    {
        id: 2,
        name: "Wok This Way",
        rating: "4.7",
        time: "20-25 min",
        image:
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900"
    },

    {
        id: 3,
        name: "The Chinese Kitchen",
        rating: "4.6",
        time: "25-30 min",
        image:
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900"
    },

    {
        id: 4,
        name: "Noodle Bar",
        rating: "4.7",
        time: "20-25 min",
        image:
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900"
    },

    {
        id: 5,
        name: "Spice Hub",
        rating: "4.6",
        time: "25-30 min",
        image:
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900"
    },

    {
        id: 6,
        name: "Mainland China",
        rating: "4.8",
        time: "25-30 min",
        image:
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900"
    }

];


/* =====================================================
   FILTERS
===================================================== */

const filters = [

    "All",
    "Fried Rice",
    "Noodles",
    "Starters",
    "Chicken",
    "Paneer",
    "Manchurian",
    "Combos",
    "Offers",
    "Top Rated"

];


/* =====================================================
   COMPONENT
===================================================== */

export default function FastFoodPage() {

    const navigate = useNavigate();


    const [activeFilter, setActiveFilter] =
        useState("All");


    const [search, setSearch] =
        useState("");


    const [selectedRestaurant, setSelectedRestaurant] =
        useState("All");


    const [wishlist, setWishlist] =
        useState([]);


    /* =================================================
       FILTER PRODUCTS
    ================================================= */

    const filteredFastFoods = useMemo(() => {

        return fastFoods.filter((food) => {

            const searchText =
                `${food.name} ${food.restaurant} ${food.category}`
                    .toLowerCase();


            const matchesSearch =
                searchText.includes(
                    search.toLowerCase()
                );


            let matchesFilter = true;


            if (
                activeFilter !== "All" &&
                activeFilter !== "Offers" &&
                activeFilter !== "Top Rated" &&
                activeFilter !== "Combos"
            ) {

                matchesFilter =
                    food.category === activeFilter;

            }


            if (activeFilter === "Offers") {

                matchesFilter =
                    food.oldPrice > food.price;

            }


            if (activeFilter === "Top Rated") {

                matchesFilter =
                    Number(food.rating) >= 4.8;

            }


            if (activeFilter === "Combos") {

                matchesFilter =
                    food.name.toLowerCase()
                        .includes("combo");

            }


            const matchesRestaurant =
                selectedRestaurant === "All" ||
                food.restaurantId ===
                    Number(selectedRestaurant);


            return (
                matchesSearch &&
                matchesFilter &&
                matchesRestaurant
            );

        });

    }, [
        activeFilter,
        search,
        selectedRestaurant
    ]);


    /* =================================================
       WISHLIST
    ================================================= */

    const toggleWishlist = (id) => {

        setWishlist((previous) => {

            if (previous.includes(id)) {

                return previous.filter(
                    item => item !== id
                );

            }

            return [
                ...previous,
                id
            ];

        });

    };


    /* =================================================
       PAGE
    ================================================= */

    return (

        <div className="fastFoodPageLayout">


            {/* =========================================
                SIDEBAR
            ========================================= */}

            <DashboardSidebar />



            {/* =========================================
                MAIN CONTENT
            ========================================= */}

            <div className="fastFoodMarketplace">


                {/* =====================================
                    HEADER
                ===================================== */}

                <header className="fastFoodTopHeader">


                    <button
                        className="fastFoodBackButton"
                        onClick={() => navigate(-1)}
                    >

                        <FaArrowLeft />

                    </button>


                    <div className="fastFoodHeaderTitle">

                        <h2>
                            Fast Food
                        </h2>

                        <p>
                            Fried rice, noodles, starters
                            &amp; more
                        </p>

                    </div>


                    <div className="fastFoodHeaderLocation">

                        <span>
                            📍
                        </span>

                        <div>

                            <small>
                                Delivering to
                            </small>

                            <strong>
                                Your Location
                            </strong>

                        </div>

                    </div>

                </header>



                {/* =====================================
                    HERO
                ===================================== */}

                <section className="fastFoodHero">


                    <div className="fastFoodHeroContent">


                        <span className="fastFoodHeroBadge">

                            <FaFire />

                            HOT &amp; FRESH

                        </span>


                        <h1>

                            Craving
                            <span> Fast Food?</span>

                        </h1>


                        <p>

                            Enjoy delicious fried rice,
                            noodles, crispy starters,
                            Manchurian, chilli chicken
                            and more from your favorite
                            restaurants.

                        </p>


                        <div className="fastFoodSearchBox">

                            <FaSearch />

                            <input
                                type="text"
                                placeholder="Search fried rice, noodles, starters..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                        </div>


                        <div className="fastFoodHeroStats">


                            <div>

                                <strong>
                                    50+
                                </strong>

                                <span>
                                    Fast Food Items
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



                    <div className="fastFoodHeroImage">

                        <img
                            src="https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1400"
                            alt="Fried Rice and Fast Food"
                        />

                    </div>


                </section>



                {/* =====================================
                    CATEGORY HEADER
                ===================================== */}

                <section className="fastFoodFilterHeader">


                    <div>

                        <h2>
                            What are you craving?
                        </h2>

                        <p>
                            Choose your favorite fast food category
                        </p>

                    </div>


                    <div className="fastFoodSort">

                        <FaFilter />

                        <span>
                            Filter
                        </span>

                        <FaChevronDown />

                    </div>


                </section>



                {/* =====================================
                    FILTERS
                ===================================== */}

                <div className="fastFoodFilters">


                    {filters.map(filter => (

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



                {/* =====================================
                    RESTAURANTS
                ===================================== */}

                <section className="fastFoodRestaurants">


                    <div className="fastFoodSectionHeader">

                        <div>

                            <h2>
                                Popular Fast Food Restaurants
                            </h2>

                            <p>
                                Delicious food from restaurants
                                near you
                            </p>

                        </div>

                    </div>



                    <div className="fastFoodRestaurantGrid">


                        <button
                            className={
                                selectedRestaurant === "All"
                                    ? "fastFoodRestaurantCard active"
                                    : "fastFoodRestaurantCard"
                            }
                            onClick={() =>
                                setSelectedRestaurant("All")
                            }
                        >

                            <div className="fastFoodRestaurantImage">

                                <img
                                    src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=900"
                                    alt="All Restaurants"
                                />

                            </div>


                            <div className="fastFoodRestaurantInfo">

                                <strong>
                                    All Restaurants
                                </strong>

                                <span>
                                    All Fast Food
                                </span>

                            </div>

                        </button>



                        {restaurants.map(
                            restaurant => (

                                <button
                                    key={restaurant.id}
                                    className={
                                        selectedRestaurant ===
                                        String(restaurant.id)
                                            ? "fastFoodRestaurantCard active"
                                            : "fastFoodRestaurantCard"
                                    }
                                    onClick={() =>
                                        setSelectedRestaurant(
                                            String(
                                                restaurant.id
                                            )
                                        )
                                    }
                                >

                                    <div className="fastFoodRestaurantImage">

                                        <img
                                            src={restaurant.image}
                                            alt={
                                                restaurant.name
                                            }
                                        />

                                    </div>


                                    <div className="fastFoodRestaurantInfo">

                                        <strong>
                                            {restaurant.name}
                                        </strong>

                                        <span>

                                            ⭐ {restaurant.rating}

                                            {" • "}

                                            {restaurant.time}

                                        </span>

                                    </div>

                                </button>

                            )
                        )}


                    </div>


                </section>



                {/* =====================================
                    FOOD PRODUCTS
                ===================================== */}

                <section className="fastFoodProducts">


                    <div className="fastFoodProductHeader">

                        <div>

                            <h2>
                                Popular Fast Food
                            </h2>

                            <p>

                                {filteredFastFoods.length}

                                {" "}

                                delicious items available

                            </p>

                        </div>

                    </div>



                    {filteredFastFoods.length === 0 ? (

                        <div className="fastFoodEmpty">

                            <span>
                                🍜
                            </span>

                            <h3>
                                No food found
                            </h3>

                            <p>
                                Try another category or search.
                            </p>

                        </div>

                    ) : (


                        <div className="fastFoodProductGrid">


                            {filteredFastFoods.map(
                                food => (


                                    <article
                                        className="fastFoodCard"
                                        key={food.id}
                                    >


                                        <div className="fastFoodCardImage">


                                            <img
                                                src={food.image}
                                                alt={food.name}
                                            />


                                            <span className="fastFoodBadge">

                                                {food.badge}

                                            </span>


                                            <button
                                                className={
                                                    wishlist.includes(
                                                        food.id
                                                    )
                                                        ? "fastFoodHeart active"
                                                        : "fastFoodHeart"
                                                }
                                                onClick={() =>
                                                    toggleWishlist(
                                                        food.id
                                                    )
                                                }
                                            >

                                                <FaHeart />

                                            </button>


                                        </div>



                                        <div className="fastFoodCardContent">


                                            <span className="fastFoodRestaurantName">

                                                {food.restaurant}

                                            </span>


                                            <h3>
                                                {food.name}
                                            </h3>


                                            <p>
                                                {food.description}
                                            </p>



                                            <div className="fastFoodInfo">


                                                <span>

                                                    <FaStar />

                                                    {food.rating}

                                                </span>


                                                <span>

                                                    {food.reviews}

                                                    {" reviews"}

                                                </span>


                                                <span>

                                                    <FaClock />

                                                    {food.time}

                                                </span>


                                            </div>



                                            <div className="fastFoodPriceRow">


                                                <div>

                                                    <strong>
                                                        ₹{food.price}
                                                    </strong>

                                                    <del>
                                                        ₹{food.oldPrice}
                                                    </del>

                                                </div>


                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/order-fastfood/${food.id}`,
                                                            {
                                                                state: {
                                                                    fastFood:
                                                                        food
                                                                }
                                                            }
                                                        )
                                                    }
                                                >

                                                    <FaPlus />

                                                    Add

                                                </button>


                                            </div>


                                        </div>


                                    </article>


                                )
                            )}


                        </div>


                    )}


                </section>



                {/* =====================================
                    DELIVERY BANNER
                ===================================== */}

                <section className="fastFoodDeliveryBanner">


                    <div>

                        <FaMotorcycle />

                    </div>


                    <div>

                        <h3>
                            Hot food delivered fast!
                        </h3>

                        <p>
                            Enjoy freshly prepared fried rice,
                            noodles and starters delivered
                            straight to your doorstep.
                        </p>

                    </div>


                </section>


            </div>


        </div>

    );

}