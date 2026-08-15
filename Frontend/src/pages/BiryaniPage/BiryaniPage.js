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

import "./BiryaniPage.css";


/* =========================================
   BIRYANI RESTAURANTS
========================================= */

const restaurants = [

    {
        id: 1,
        name: "Paradise Biryani",
        rating: "4.7",
        time: "25-30 min",
        image:
            "https://www.retail4growth.com/public/uploads/editor/2023-02-03/1675404025.jpg"
    },

    {
        id: 2,
        name: "Biryani Blues",
        rating: "4.6",
        time: "20-30 min",
        image:
            "https://www.retail4growth.com/public/uploads/editor/2023-02-03/1675404075.jpg"
    },

    {
        id: 3,
        name: "Behrouz Biryani",
        rating: "4.8",
        time: "30-35 min",
        image:
            "https://dineout-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_600,h_468/DINEOUT_ALL_RESTAURANTS/IMAGES/RESTAURANT_IMAGE_SERVICE/2024/7/18/cbc657bd-fa0e-4ef2-bacf-4d56fb799594_20240718T120135255.jpg"
    },

    {
        id: 4,
        name: "Mehfil",
        rating: "4.5",
        time: "25-35 min",
        image:
            "https://b.zmtcdn.com/data/pictures/0/21725190/3febc8bd063647849088b8aeee1112bc.jpg?crop=750%3A500%3B%2A%2C%2A&fit=around%7C750%3A500"
    }

];
/* =========================================
   BIRYANI DATA
========================================= */

const biryanis = [

    {
        id: 1,
        name: "Hyderabadi Chicken Biryani",
        restaurant: "Paradise Biryani",
        restaurantId: 1,
        category: "Chicken",
        rating: "4.8",
        reviews: "3.2k",
        price: 249,
        oldPrice: 299,
        time: "25 min",
        badge: "Bestseller",

        image:
            "https://file.hstatic.net/1000300839/file/img_4466_4ee01251c8ff4cc9abb7da7bfe856f4c_grande.jpeg",

        description:
            "Authentic Hyderabadi chicken biryani prepared with fragrant basmati rice and traditional spices."
    },


    {
        id: 2,
        name: "Chicken Dum Biryani",
        restaurant: "Paradise Biryani",
        restaurantId: 1,
        category: "Chicken",
        rating: "4.7",
        reviews: "2.8k",
        price: 279,
        oldPrice: 349,
        time: "30 min",
        badge: "Popular",

        image:
            "https://cdn.uengage.io/uploads/10295/image-9785-1770195649.jpg",

        description:
            "Slow-cooked Hyderabadi chicken dum biryani with tender chicken, aromatic basmati rice and rich spices."
    },


    {
        id: 3,
        name: "Mutton Biryani",
        restaurant: "Biryani Blues",
        restaurantId: 2,
        category: "Mutton",
        rating: "4.9",
        reviews: "3.6k",
        price: 349,
        oldPrice: 429,
        time: "30 min",
        badge: "Top Rated",

        image:
            "https://www.clozbii.in/uploads/productpic/1910/315952-mutton-biryani.jpg",

        description:
            "Tender mutton cooked with premium basmati rice, fried onions and aromatic biryani spices."
    },


    {
        id: 4,
        name: "Egg Biryani",
        restaurant: "Biryani Blues",
        restaurantId: 2,
        category: "Egg",
        rating: "4.5",
        reviews: "1.8k",
        price: 199,
        oldPrice: 249,
        time: "25 min",
        badge: "Trending",

        image:
            "https://akash.net.np/uploads/restaurant/food-items-biryani-egg-biryani.jpeg",

        description:
            "Flavourful basmati rice served with perfectly cooked eggs, herbs and aromatic spices."
    },


    {
        id: 5,
        name: "Paneer Biryani",
        restaurant: "Behrouz Biryani",
        restaurantId: 3,
        category: "Veg",
        rating: "4.6",
        reviews: "2.1k",
        price: 229,
        oldPrice: 279,
        time: "25 min",
        badge: "Popular",

        image:
            "https://www.nikaabriyani.com/paneer_biryani.png",

        description:
            "Delicious paneer biryani prepared with soft paneer cubes, fragrant basmati rice and Indian spices."
    },


    {
        id: 6,
        name: "Chicken Tikka Biryani",
        restaurant: "Behrouz Biryani",
        restaurantId: 3,
        category: "Chicken",
        rating: "4.8",
        reviews: "3.9k",
        price: 319,
        oldPrice: 399,
        time: "30 min",
        badge: "Bestseller",

        image:
            "https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/chicken_tikka_biryani.jpg",

        description:
            "Premium chicken tikka pieces layered with aromatic basmati rice and flavorful biryani spices."
    },


    {
        id: 7,
        name: "Mutton Dum Biryani",
        restaurant: "Mehfil",
        restaurantId: 4,
        category: "Mutton",
        rating: "4.8",
        reviews: "2.7k",
        price: 379,
        oldPrice: 449,
        time: "35 min",
        badge: "Top Rated",

        image:
            "https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com/media/food_pics_v2/medium/mutton_biriyani.jpg",

        description:
            "Rich dum-cooked mutton biryani prepared with premium basmati rice and aromatic spices."
    },


    {
        id: 8,
        name: "Veg Biryani",
        restaurant: "Mehfil",
        restaurantId: 4,
        category: "Veg",
        rating: "4.5",
        reviews: "1.6k",
        price: 179,
        oldPrice: 229,
        time: "25 min",
        badge: "20% OFF",

        image:
            "https://nazara.ca/uploads/01KQ9MM60GQY9GJHTR2S9Q8NTK.jpeg",

        description:
            "Aromatic vegetable biryani made with fresh vegetables and fragrant basmati rice."
    }

];


export default function BiryaniPage() {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const [activeFilter, setActiveFilter] =
        useState("All");

    const [selectedRestaurant, setSelectedRestaurant] =
        useState("All");


    const filters = [
        "All",
        "Chicken",
        "Mutton",
        "Veg",
        "Offers",
        "Top Rated"
    ];


    /* =========================================
       FILTER BIRYANIS
    ========================================= */

    const filteredBiryanis = useMemo(() => {

        return biryanis.filter((biryani) => {

            const searchValue =
                search.toLowerCase().trim();


            const matchesSearch =
                biryani.name
                    .toLowerCase()
                    .includes(searchValue) ||

                biryani.restaurant
                    .toLowerCase()
                    .includes(searchValue);


            const matchesRestaurant =
                selectedRestaurant === "All" ||
                biryani.restaurantId === selectedRestaurant;


            let matchesFilter = true;


            if (
                activeFilter === "Chicken" ||
                activeFilter === "Mutton" ||
                activeFilter === "Veg"
            ) {

                matchesFilter =
                    biryani.category === activeFilter;

            }


            if (activeFilter === "Offers") {

                matchesFilter =
                    biryani.oldPrice > biryani.price;

            }


            if (activeFilter === "Top Rated") {

                matchesFilter =
                    Number(biryani.rating) >= 4.8;

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

        <div className="biryaniMarketplace">


            {/* HEADER */}

            <header className="biryaniTopHeader">

                <button
                    className="biryaniBackButton"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft />
                </button>


                <div className="biryaniHeaderText">

                    <span>
                        FoodExpress
                    </span>

                    <h1>
                        Biryanis
                    </h1>

                </div>


                <div className="biryaniHeaderRight">

                    <button className="biryaniLocation">

                        <span className="biryaniLocationDot">
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


                    <button
                        className="biryaniCart"
                        onClick={() => navigate("/cart")}
                    >

                        <FaShoppingCart />

                        <span>
                            Cart
                        </span>

                    </button>

                </div>

            </header>


            {/* HERO */}

            <section className="biryaniHero">

                <div className="biryaniHeroContent">

                    <div className="biryaniHeroTag">

                        <FaFire />

                        Trending now

                    </div>


                    <h2>

                        Find your perfect

                        <span>
                            biryani.
                        </span>

                    </h2>


                    <p>

                        Authentic, aromatic and freshly
                        prepared biryanis from your
                        favorite restaurants.

                    </p>


                    <div className="biryaniSearchBox">

                        <FaSearch />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search biryanis or restaurants..."
                        />

                    </div>

                </div>


                <div className="biryaniHeroImage">
    <img
        src="https://www.nikaabriyani.com/hyderabadi_biryani.png"
        alt="Hyderabadi Biryani"
    />
</div>

            </section>


            {/* FILTERS */}

            <section className="biryaniFiltersSection">

                <div className="biryaniFilterLeft">

                    <FaFilter />

                    {filters.map(filter => (

                        <button
                            key={filter}
                            className={
                                activeFilter === filter
                                    ? "biryaniFilter active"
                                    : "biryaniFilter"
                            }
                            onClick={() =>
                                setActiveFilter(filter)
                            }
                        >

                            {filter}

                        </button>

                    ))}

                </div>


                <button className="biryaniSortButton">

                    Sort by

                    <FaChevronDown />

                </button>

            </section>


            {/* RESTAURANTS */}

            <section className="biryaniRestaurants">

                <div className="biryaniSectionHeading">

                    <div>

                        <span>
                            DISCOVER
                        </span>

                        <h2>
                            Popular Biryani Restaurants
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


                <div className="biryaniRestaurantScroller">

                    {restaurants.map(restaurant => (

                        <button
                            className={
                                selectedRestaurant === restaurant.id
                                    ? "biryaniRestaurantCard selected"
                                    : "biryaniRestaurantCard"
                            }
                            key={restaurant.id}
                            onClick={() =>
                                handleRestaurantClick(
                                    restaurant.id
                                )
                            }
                        >

                            <div className="biryaniRestaurantImage">

                                <img
                                    src={restaurant.image}
                                    alt={restaurant.name}
                                />

                            </div>


                            <div className="biryaniRestaurantInfo">

                                <h3>
                                    {restaurant.name}
                                </h3>

                                <div>

                                    <span className="biryaniMiniRating">

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


            {/* PRODUCTS */}

            <section className="biryaniProducts">

                <div className="biryaniSectionHeading">

                    <div>

                        <span>
                            OUR MENU
                        </span>

                        <h2>
                            Popular Biryanis
                        </h2>

                        <p>
                            {filteredBiryanis.length}
                            {" "}delicious biryanis available
                        </p>

                    </div>


                    <div className="biryaniResultCount">

                        {filteredBiryanis.length} results

                    </div>

                </div>


                <div className="modernBiryaniGrid">

                    {filteredBiryanis.map(biryani => (

                        <article
                            className="modernBiryaniCard"
                            key={biryani.id}
                        >

                            <div className="modernBiryaniImage">

                                <img
                                    src={biryani.image}
                                    alt={biryani.name}
                                />


                                <span className="modernBiryaniBadge">

                                    {biryani.badge}

                                </span>


                                <button className="modernBiryaniHeart">

                                    <FaHeart />

                                </button>


                                <div className="biryaniImageGradient"></div>

                            </div>


                            <div className="modernBiryaniContent">

                                <div className="biryaniNameRow">

                                    <h3>
                                        {biryani.name}
                                    </h3>

                                    <span
                                        className={
                                            biryani.category === "Veg"
                                                ? "biryaniVegMark"
                                                : "biryaniNonVegMark"
                                        }
                                    >
                                        ●
                                    </span>

                                </div>


                                <p className="modernBiryaniRestaurant">

                                    {biryani.restaurant}

                                </p>


                                <div className="modernBiryaniMeta">

                                    <span className="modernBiryaniRating">

                                        <FaStar />

                                        {biryani.rating}

                                    </span>

                                    <span>
                                        ({biryani.reviews})
                                    </span>

                                    <span>
                                        •
                                    </span>

                                    <span>

                                        <FaClock />

                                        {biryani.time}

                                    </span>

                                </div>


                                <div className="modernBiryaniDivider"></div>


                                <div className="modernBiryaniBottom">

                                    <div className="modernBiryaniPrice">

                                        <strong>
                                            ₹{biryani.price}
                                        </strong>

                                        <del>
                                            ₹{biryani.oldPrice}
                                        </del>

                                    </div>


                                    <button
                                        className="addBiryaniButton"
                                        onClick={() =>
                                            navigate(
                                                `/order-biryani/${biryani.id}`,
                                                {
                                                    state: {
                                                        biryani: biryani
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


                {filteredBiryanis.length === 0 && (

                    <div className="noBiryaniResults">

                        <div>
                            🍛
                        </div>

                        <h3>
                            No biryanis found
                        </h3>

                        <p>
                            Try another biryani or restaurant name.
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


            {/* DELIVERY BANNER */}

            <section className="biryaniDeliveryBanner">

                <div className="biryaniDeliveryIcon">

                    <FaMotorcycle />

                </div>


                <div>

                    <h3>
                        Fresh biryanis, delivered hot.
                    </h3>

                    <p>
                        Order from the best biryani restaurants
                        near you and enjoy fast delivery.
                    </p>

                </div>


                <div className="biryaniDeliveryTime">

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