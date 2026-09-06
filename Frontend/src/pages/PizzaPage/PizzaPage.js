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

import "./PizzaPage.css";

import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";


const restaurants = [
    {
        id: 1,
        name: "Domino's Pizza",
        rating: "4.6",
        time: "25-30 min",
        image:
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900"
    },

    {
        id: 2,
        name: "Pizza Hut",
        rating: "4.5",
        time: "30-35 min",
        image:
            "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=900"
    },

    {
        id: 3,
        name: "La Pino'z Pizza",
        rating: "4.7",
        time: "25-30 min",
        image:
            "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=900"
    },

    {
        id: 4,
        name: "Oven Story",
        rating: "4.4",
        time: "30-35 min",
        image:
            "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?w=900"
    }
];


const pizzas = [

    {
        id: 1,
        name: "Farmhouse Pizza",
        restaurant: "Pizza Hut",
        restaurantId: 2,
        category: "Veg",
        rating: "4.8",
        reviews: "2.4k",
        price: 299,
        oldPrice: 399,
        time: "30 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=900"
    },

    {
        id: 2,
        name: "Margherita Pizza",
        restaurant: "Domino's Pizza",
        restaurantId: 1,
        category: "Veg",
        rating: "4.7",
        reviews: "2.1k",
        price: 199,
        oldPrice: 249,
        time: "25 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900"
    },

    {
        id: 3,
        name: "Peppy Paneer",
        restaurant: "La Pino'z Pizza",
        restaurantId: 3,
        category: "Veg",
        rating: "4.9",
        reviews: "3.2k",
        price: 349,
        oldPrice: 449,
        time: "28 min",
        badge: "Top Rated",
        image:
            "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=900"
    },

    {
        id: 4,
        name: "Chicken Tikka Pizza",
        restaurant: "Pizza Hut",
        restaurantId: 2,
        category: "Non-Veg",
        rating: "4.6",
        reviews: "1.7k",
        price: 399,
        oldPrice: 499,
        time: "32 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?w=900"
    },

    {
        id: 5,
        name: "Cheese Burst Pizza",
        restaurant: "Domino's Pizza",
        restaurantId: 1,
        category: "Veg",
        rating: "4.8",
        reviews: "2.8k",
        price: 449,
        oldPrice: 549,
        time: "27 min",
        badge: "20% OFF",
        image:
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900"
    },

    {
        id: 6,
        name: "Veggie Delight",
        restaurant: "Oven Story",
        restaurantId: 4,
        category: "Veg",
        rating: "4.7",
        reviews: "1.2k",
        price: 249,
        oldPrice: 329,
        time: "25 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=900"
    },

    {
        id: 7,
        name: "Pepperoni Pizza",
        restaurant: "Domino's Pizza",
        restaurantId: 1,
        category: "Non-Veg",
        rating: "4.8",
        reviews: "2.5k",
        price: 399,
        oldPrice: 499,
        time: "29 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=900"
    },

    {
        id: 8,
        name: "Mexican Green Wave",
        restaurant: "La Pino'z Pizza",
        restaurantId: 3,
        category: "Veg",
        rating: "4.6",
        reviews: "980",
        price: 299,
        oldPrice: 379,
        time: "26 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=900"
    },

    {
        id: 9,
        name: "Chicken Dominator",
        restaurant: "Domino's Pizza",
        restaurantId: 1,
        category: "Non-Veg",
        rating: "4.9",
        reviews: "3.6k",
        price: 449,
        oldPrice: 599,
        time: "30 min",
        badge: "Top Rated",
        image:
            "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?w=900"
    },

    {
        id: 10,
        name: "Cheese Lovers",
        restaurant: "Pizza Hut",
        restaurantId: 2,
        category: "Veg",
        rating: "4.7",
        reviews: "1.9k",
        price: 369,
        oldPrice: 449,
        time: "28 min",
        badge: "20% OFF",
        image:
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900"
    },

    {
        id: 11,
        name: "Paneer Tikka Pizza",
        restaurant: "Oven Story",
        restaurantId: 4,
        category: "Veg",
        rating: "4.8",
        reviews: "2.2k",
        price: 329,
        oldPrice: 429,
        time: "27 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=900"
    },

    {
        id: 12,
        name: "Chicken Pepper Pizza",
        restaurant: "La Pino'z Pizza",
        restaurantId: 3,
        category: "Non-Veg",
        rating: "4.7",
        reviews: "1.7k",
        price: 419,
        oldPrice: 499,
        time: "31 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?w=900"
    }

];


export default function PizzaPage() {

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


    const filteredPizzas = useMemo(() => {

        return pizzas.filter((pizza) => {

            const searchValue =
                search.toLowerCase().trim();

            const matchesSearch =
                pizza.name
                    .toLowerCase()
                    .includes(searchValue) ||

                pizza.restaurant
                    .toLowerCase()
                    .includes(searchValue);


            const matchesRestaurant =
                selectedRestaurant === "All" ||
                pizza.restaurantId === selectedRestaurant;


            let matchesFilter = true;


            if (activeFilter === "Veg") {

                matchesFilter =
                    pizza.category === "Veg";

            }


            if (activeFilter === "Non-Veg") {

                matchesFilter =
                    pizza.category === "Non-Veg";

            }


            if (activeFilter === "Offers") {

                matchesFilter =
                    pizza.oldPrice > pizza.price;

            }


            if (activeFilter === "Top Rated") {

                matchesFilter =
                    Number(pizza.rating) >= 4.8;

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


    const handleRestaurantClick = (id) => {

        if (selectedRestaurant === id) {

            setSelectedRestaurant("All");

        } else {

            setSelectedRestaurant(id);

        }

    };


    return (

        <div className="pizzaPageLayout">

            <DashboardSidebar />

        <div className="pizzaMarketplace">


            {/* =====================================
                TOP HEADER
            ===================================== */}

            <header className="pizzaTopHeader">

                <button
                    className="pizzaBackButton"
                    onClick={() => navigate(-1)}
                >

                    <FaArrowLeft />

                </button>


                <div className="pizzaHeaderText">

                    {/* <span>
                        FoodExpress
                    </span> */}

                    <h1>
                        Pizza
                    </h1>

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



            {/* =====================================
                HERO
            ===================================== */}

            <section className="pizzaHero">

                <div className="pizzaHeroContent">

                    <div className="heroTag">

                        <FaFire />

                        Trending now

                    </div>


                    <h2>
                        Find your perfect
                        <span> pizza.</span>
                    </h2>


                    <p>
                        Hot, cheesy and freshly baked pizzas
                        from your favorite restaurants.
                    </p>


                    {/* SEARCH */}

                    <div className="pizzaSearchBox">

                        <FaSearch />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search pizza or restaurant..."
                        />

                    </div>

                </div>


                <div className="pizzaHeroImage">

                    <img
                        src="https://mir-s3-cdn-cf.behance.net/project_modules/1400/f1cdc1130511451.6181b4b5b2326.jpg"
                        alt="Delicious Pizza"
                    />

                </div>

            </section>



            {/* =====================================
                FILTERS
            ===================================== */}

            <section className="pizzaFiltersSection">

                <div className="pizzaFilterLeft">

                    <FaFilter />

                    {filters.map(filter => (

                        <button
                            key={filter}
                            className={
                                activeFilter === filter
                                    ? "pizzaFilter active"
                                    : "pizzaFilter"
                            }
                            onClick={() =>
                                setActiveFilter(filter)
                            }
                        >

                            {filter}

                        </button>

                    ))}

                </div>


                <button className="sortButton">

                    Sort by
                    <FaChevronDown />

                </button>

            </section>



            {/* =====================================
                RESTAURANTS
            ===================================== */}

            <section className="pizzaRestaurants">

                <div className="sectionHeading">

                    <div>

                        <span>
                            DISCOVER
                        </span>

                        <h2>
                            Popular Pizza Restaurants
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


                <div className="restaurantScroller">

                    {restaurants.map(restaurant => (

                        <button
                            className={
                                selectedRestaurant === restaurant.id
                                    ? "restaurantMiniCard selected"
                                    : "restaurantMiniCard"
                            }
                            key={restaurant.id}
                            onClick={() =>
                                handleRestaurantClick(
                                    restaurant.id
                                )
                            }
                        >

                            <div className="restaurantMiniImage">

                                <img
                                    src={restaurant.image}
                                    alt={restaurant.name}
                                />

                            </div>


                            <div className="restaurantMiniInfo">

                                <h3>
                                    {restaurant.name}
                                </h3>


                                <div>

                                    <span className="miniRating">

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
                PIZZA SECTION
            ===================================== */}

            <section className="pizzaProducts">

                <div className="sectionHeading">

                    <div>

                        <span>
                            OUR MENU
                        </span>

                        <h2>
                            Popular Pizzas
                        </h2>

                        <p>
                            {filteredPizzas.length}
                            {" "}delicious pizzas available
                        </p>

                    </div>


                    <div className="resultCount">

                        {filteredPizzas.length} results

                    </div>

                </div>



                <div className="modernPizzaGrid">

                    {filteredPizzas.map(pizza => (

                        <article
                            className="modernPizzaCard"
                            key={pizza.id}
                        >


                            {/* IMAGE */}

                            <div className="modernPizzaImage">

                                <img
                                    src={pizza.image}
                                    alt={pizza.name}
                                />


                                <span className="modernBadge">

                                    {pizza.badge}

                                </span>


                                <button className="modernHeart">

                                    <FaHeart />

                                </button>


                                <div className="imageGradient"></div>

                            </div>



                            {/* CONTENT */}

                            <div className="modernPizzaContent">

                                <div className="pizzaNameRow">

                                    <h3>
                                        {pizza.name}
                                    </h3>

                                    <span
                                        className={
                                            pizza.category === "Veg"
                                                ? "vegMark"
                                                : "nonVegMark"
                                        }
                                    >
                                        ●
                                    </span>

                                </div>


                                <p className="modernRestaurant">

                                    {pizza.restaurant}

                                </p>


                                <div className="modernMeta">

                                    <span className="modernRating">

                                        <FaStar />

                                        {pizza.rating}

                                    </span>

                                    <span>
                                        ({pizza.reviews})
                                    </span>

                                    <span>
                                        •
                                    </span>

                                    <span>

                                        <FaClock />

                                        {pizza.time}

                                    </span>

                                </div>


                                <div className="modernDivider"></div>


                                <div className="modernBottom">

                                    <div className="modernPrice">

                                        <strong>
                                            ₹{pizza.price}
                                        </strong>

                                        <del>
                                            ₹{pizza.oldPrice}
                                        </del>

                                    </div>


                                    <button className="addPizzaButton" onClick={() =>navigate(`/order-pizza/${pizza.id}`, {state: {pizza: pizza}})}>
                                        <FaPlus />Add
                                    </button>

                                </div>

                            </div>

                        </article>

                    ))}

                </div>


                {/* NO RESULTS */}

                {filteredPizzas.length === 0 && (

                    <div className="noPizzaResults">

                        <div>
                            🍕
                        </div>

                        <h3>
                            No pizzas found
                        </h3>

                        <p>
                            Try another pizza or restaurant name.
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
                FOOTER INFO
            ===================================== */}

            <section className="pizzaDeliveryBanner">

                <div className="deliveryIcon">

                    <FaMotorcycle />

                </div>


                <div>

                    <h3>
                        Fresh pizza, delivered hot.
                    </h3>

                    <p>
                        Order from the best pizza restaurants
                        near you and enjoy fast delivery.
                    </p>

                </div>


                <div className="deliveryTime">

                    <strong>
                        25-35
                    </strong>

                    <span>
                        mins
                    </span>

                </div>

            </section>


        </div>

        </div>

    );

}