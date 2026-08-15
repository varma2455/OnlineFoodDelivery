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
    FaPlus,
    FaShoppingCart
} from "react-icons/fa";

import "./BurgerPage.css";


/* =========================================
   BURGER RESTAURANTS
========================================= */

const restaurants = [

    {
        id: 1,
        name: "Burger King",
        rating: "4.6",
        time: "25-30 min",
        image:
            "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=900"
    },

    {
        id: 2,
        name: "McDonald's",
        rating: "4.5",
        time: "20-25 min",
        image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900"
    },

    {
        id: 3,
        name: "KFC",
        rating: "4.7",
        time: "25-30 min",
        image:
            "https://images.unsplash.com/photo-1550547660-d9450f859349?w=900"
    },

    {
        id: 4,
        name: "Burger Singh",
        rating: "4.4",
        time: "30-35 min",
        image:
            "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=900"
    }

];


/* =========================================
   BURGER DATA
========================================= */

const burgers = [

    {
        id: 1,
        name: "Classic Veg Burger",
        restaurant: "Burger King",
        restaurantId: 1,
        category: "Veg",
        rating: "4.7",
        reviews: "2.4k",
        price: 149,
        oldPrice: 199,
        time: "25 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=900"
    },

    {
        id: 2,
        name: "Whopper Burger",
        restaurant: "Burger King",
        restaurantId: 1,
        category: "Non-Veg",
        rating: "4.8",
        reviews: "3.1k",
        price: 249,
        oldPrice: 299,
        time: "25 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=900"
    },

    {
        id: 3,
        name: "McVeggie Burger",
        restaurant: "McDonald's",
        restaurantId: 2,
        category: "Veg",
        rating: "4.6",
        reviews: "2.8k",
        price: 129,
        oldPrice: 169,
        time: "20 min",
        badge: "Top Rated",
        image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900"
    },

    {
        id: 4,
        name: "McChicken Burger",
        restaurant: "McDonald's",
        restaurantId: 2,
        category: "Non-Veg",
        rating: "4.7",
        reviews: "2.5k",
        price: 189,
        oldPrice: 229,
        time: "22 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=900"
    },

    {
        id: 5,
        name: "Zinger Burger",
        restaurant: "KFC",
        restaurantId: 3,
        category: "Non-Veg",
        rating: "4.8",
        reviews: "3.4k",
        price: 229,
        oldPrice: 279,
        time: "27 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1550547660-d9450f859349?w=900"
    },

    {
        id: 6,
        name: "Veg Zinger Burger",
        restaurant: "KFC",
        restaurantId: 3,
        category: "Veg",
        rating: "4.5",
        reviews: "1.5k",
        price: 179,
        oldPrice: 219,
        time: "28 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=900"
    },

    {
        id: 7,
        name: "Crispy Chicken Burger",
        restaurant: "Burger Singh",
        restaurantId: 4,
        category: "Non-Veg",
        rating: "4.8",
        reviews: "2.2k",
        price: 219,
        oldPrice: 269,
        time: "30 min",
        badge: "Top Rated",
        image:
            "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=900"
    },

    {
        id: 8,
        name: "Paneer Burger",
        restaurant: "Burger Singh",
        restaurantId: 4,
        category: "Veg",
        rating: "4.6",
        reviews: "1.3k",
        price: 169,
        oldPrice: 219,
        time: "30 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=900"
    },

    {
        id: 9,
        name: "Double Cheese Burger",
        restaurant: "Burger King",
        restaurantId: 1,
        category: "Veg",
        rating: "4.9",
        reviews: "3.8k",
        price: 299,
        oldPrice: 369,
        time: "26 min",
        badge: "Top Rated",
        image:
            "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=900"
    },

    {
        id: 10,
        name: "Chicken Cheese Burger",
        restaurant: "McDonald's",
        restaurantId: 2,
        category: "Non-Veg",
        rating: "4.7",
        reviews: "2.1k",
        price: 229,
        oldPrice: 279,
        time: "23 min",
        badge: "20% OFF",
        image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900"
    },

    {
        id: 11,
        name: "Spicy Paneer Burger",
        restaurant: "Burger Singh",
        restaurantId: 4,
        category: "Veg",
        rating: "4.7",
        reviews: "1.8k",
        price: 189,
        oldPrice: 239,
        time: "29 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=900"
    },

    {
        id: 12,
        name: "Hot & Crispy Chicken",
        restaurant: "KFC",
        restaurantId: 3,
        category: "Non-Veg",
        rating: "4.8",
        reviews: "2.9k",
        price: 259,
        oldPrice: 319,
        time: "27 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1550547660-d9450f859349?w=900"
    }

];


export default function BurgerPage() {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const [activeFilter, setActiveFilter] =
        useState("All");

    const [selectedRestaurant, setSelectedRestaurant] =
        useState("All");


    const filters = [
        "All",
        "Veg",
        "Non-Veg",
        "Offers",
        "Top Rated"
    ];


    /* =========================================
       FILTER BURGERS
    ========================================= */

    const filteredBurgers = useMemo(() => {

        return burgers.filter((burger) => {

            const searchValue =
                search.toLowerCase().trim();


            const matchesSearch =
                burger.name
                    .toLowerCase()
                    .includes(searchValue) ||

                burger.restaurant
                    .toLowerCase()
                    .includes(searchValue);


            const matchesRestaurant =
                selectedRestaurant === "All" ||
                burger.restaurantId === selectedRestaurant;


            let matchesFilter = true;


            if (activeFilter === "Veg") {

                matchesFilter =
                    burger.category === "Veg";

            }


            if (activeFilter === "Non-Veg") {

                matchesFilter =
                    burger.category === "Non-Veg";

            }


            if (activeFilter === "Offers") {

                matchesFilter =
                    burger.oldPrice > burger.price;

            }


            if (activeFilter === "Top Rated") {

                matchesFilter =
                    Number(burger.rating) >= 4.8;

            }


            return (
                matchesSearch &&
                matchesRestaurant &&
                matchesFilter
            );

        });

    }, [
        search,
        activeFilter,
        selectedRestaurant
    ]);


    /* =========================================
       RESTAURANT FILTER
    ========================================= */

    const handleRestaurantClick = (id) => {

        if (selectedRestaurant === id) {

            setSelectedRestaurant("All");

        } else {

            setSelectedRestaurant(id);

        }

    };


    return (

        <div className="burgerMarketplace">


            {/* =====================================
                HEADER
            ===================================== */}

            <header className="burgerTopHeader">

                <button
                    className="burgerBackButton"
                    onClick={() => navigate(-1)}
                >

                    <FaArrowLeft />

                </button>


                <div className="burgerHeaderText">

                    <span>
                        FoodExpress
                    </span>

                    <h1>
                        Burgers
                    </h1>

                </div>


                <div className="burgerHeaderRight">

                    <button className="burgerLocation">

                        <span className="burgerLocationDot">
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


                    <button className="burgerCart">

                        <FaShoppingCart />

                        <span>
                            Cart
                        </span>

                    </button>

                </div>

            </header>



            {/* =====================================
                HERO
            ===================================== */}

            <section className="burgerHero">

                <div className="burgerHeroContent">

                    <div className="burgerHeroTag">

                        <FaFire />

                        Trending now

                    </div>


                    <h2>
                        Find your perfect
                        <span> burger.</span>
                    </h2>


                    <p>
                        Juicy, crispy and freshly prepared
                        burgers from your favorite restaurants.
                    </p>


                    <div className="burgerSearchBox">

                        <FaSearch />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search burgers or restaurants..."
                        />

                    </div>

                </div>


                <div className="burgerHeroImage">

                    <img
                        src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200"
                        alt="Delicious Burger"
                    />

                </div>

            </section>



            {/* =====================================
                FILTERS
            ===================================== */}

            <section className="burgerFiltersSection">

                <div className="burgerFilterLeft">

                    <FaFilter />

                    {filters.map(filter => (

                        <button
                            key={filter}
                            className={
                                activeFilter === filter
                                    ? "burgerFilter active"
                                    : "burgerFilter"
                            }
                            onClick={() =>
                                setActiveFilter(filter)
                            }
                        >

                            {filter}

                        </button>

                    ))}

                </div>


                <button className="burgerSortButton">

                    Sort by

                    <FaChevronDown />

                </button>

            </section>



            {/* =====================================
                RESTAURANTS
            ===================================== */}

            <section className="burgerRestaurants">

                <div className="burgerSectionHeading">

                    <div>

                        <span>
                            DISCOVER
                        </span>

                        <h2>
                            Popular Burger Restaurants
                        </h2>

                    </div>


                    <button
                        onClick={() =>
                            setSelectedRestaurant("All")
                        }
                    >
                        View all
                    </button>

                </div>


                <div className="burgerRestaurantScroller">

                    {restaurants.map(restaurant => (

                        <button
                            className={
                                selectedRestaurant === restaurant.id
                                    ? "burgerRestaurantCard selected"
                                    : "burgerRestaurantCard"
                            }
                            key={restaurant.id}
                            onClick={() =>
                                handleRestaurantClick(
                                    restaurant.id
                                )
                            }
                        >

                            <div className="burgerRestaurantImage">

                                <img
                                    src={restaurant.image}
                                    alt={restaurant.name}
                                />

                            </div>


                            <div className="burgerRestaurantInfo">

                                <h3>
                                    {restaurant.name}
                                </h3>


                                <div>

                                    <span className="burgerMiniRating">

                                        <FaStar />

                                        {restaurant.rating}

                                    </span>

                                    <span>
                                        •
                                    </span>

                                    <span>
                                        {restaurant.time}
                                    </span>

                                </div>

                            </div>

                        </button>

                    ))}

                </div>

            </section>



            {/* =====================================
                BURGER PRODUCTS
            ===================================== */}

            <section className="burgerProducts">

                <div className="burgerSectionHeading">

                    <div>

                        <span>
                            OUR MENU
                        </span>

                        <h2>
                            Popular Burgers
                        </h2>

                        <p>
                            {filteredBurgers.length}
                            {" "}delicious burgers available
                        </p>

                    </div>


                    <div className="burgerResultCount">

                        {filteredBurgers.length} results

                    </div>

                </div>


                <div className="modernBurgerGrid">

                    {filteredBurgers.map(burger => (

                        <article
                            className="modernBurgerCard"
                            key={burger.id}
                        >


                            {/* IMAGE */}

                            <div className="modernBurgerImage">

                                <img
                                    src={burger.image}
                                    alt={burger.name}
                                />


                                <span className="modernBurgerBadge">

                                    {burger.badge}

                                </span>


                                <button className="modernBurgerHeart">

                                    <FaHeart />

                                </button>


                                <div className="burgerImageGradient"></div>

                            </div>



                            {/* CONTENT */}

                            <div className="modernBurgerContent">

                                <div className="burgerNameRow">

                                    <h3>
                                        {burger.name}
                                    </h3>

                                    <span
                                        className={
                                            burger.category === "Veg"
                                                ? "burgerVegMark"
                                                : "burgerNonVegMark"
                                        }
                                    >
                                        ●
                                    </span>

                                </div>


                                <p className="modernBurgerRestaurant">

                                    {burger.restaurant}

                                </p>


                                <div className="modernBurgerMeta">

                                    <span className="modernBurgerRating">

                                        <FaStar />

                                        {burger.rating}

                                    </span>

                                    <span>
                                        ({burger.reviews})
                                    </span>

                                    <span>
                                        •
                                    </span>

                                    <span>

                                        <FaClock />

                                        {burger.time}

                                    </span>

                                </div>


                                <div className="modernBurgerDivider"></div>


                                <div className="modernBurgerBottom">

                                    <div className="modernBurgerPrice">

                                        <strong>
                                            ₹{burger.price}
                                        </strong>

                                        <del>
                                            ₹{burger.oldPrice}
                                        </del>

                                    </div>


                                    <button
                                        className="addBurgerButton"
                                        onClick={() =>
                                            navigate(
                                                `/order-burger/${burger.id}`,
                                                {
                                                    state: {
                                                        burger: burger
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

                    ))}

                </div>


                {/* NO RESULTS */}

                {filteredBurgers.length === 0 && (

                    <div className="noBurgerResults">

                        <div>
                            🍔
                        </div>

                        <h3>
                            No burgers found
                        </h3>

                        <p>
                            Try another burger or restaurant name.
                        </p>

                        <button
                            onClick={() => {

                                setSearch("");
                                setActiveFilter("All");
                                setSelectedRestaurant("All");

                            }}
                        >
                            Clear filters
                        </button>

                    </div>

                )}

            </section>



            {/* =====================================
                DELIVERY BANNER
            ===================================== */}

            <section className="burgerDeliveryBanner">

                <div className="burgerDeliveryIcon">

                    <FaMotorcycle />

                </div>


                <div>

                    <h3>
                        Fresh burgers, delivered hot.
                    </h3>

                    <p>
                        Order from the best burger restaurants
                        near you and enjoy fast delivery.
                    </p>

                </div>


                <div className="burgerDeliveryTime">

                    <strong>
                        20-35
                    </strong>

                    <span>
                        mins
                    </span>

                </div>

            </section>


        </div>

    );

}