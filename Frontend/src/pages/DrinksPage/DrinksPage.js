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

import "./DrinksPage.css";

import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";


/* =========================================
   DRINK RESTAURANTS
========================================= */

const restaurants = [

    {
        id: 1,
        name: "Starbucks",
        rating: "4.6",
        time: "15-20 min",
        image:
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900"
    },

    {
        id: 2,
        name: "Cafe Coffee Day",
        rating: "4.5",
        time: "15-25 min",
        image:
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900"
    },

    {
        id: 3,
        name: "The Coffee Bean",
        rating: "4.7",
        time: "15-20 min",
        image:
            "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=900"
    },

    {
        id: 4,
        name: "Juice World",
        rating: "4.8",
        time: "10-15 min",
        image:
            "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=900"
    },

    {
        id: 5,
        name: "Fruit & Juice Bar",
        rating: "4.6",
        time: "10-20 min",
        image:
            "https://images.unsplash.com/photo-1546173159-315724a31696?w=900"
    },

    {
        id: 6,
        name: "Chaayos",
        rating: "4.7",
        time: "15-20 min",
        image:
            "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=900"
    },

    {
        id: 7,
        name: "The Tea House",
        rating: "4.5",
        time: "15-20 min",
        image:
            "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=900"
    },

    {
        id: 8,
        name: "Shake Factory",
        rating: "4.8",
        time: "15-20 min",
        image:
            "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=900"
    }

];


/* =========================================
   DRINK DATA
========================================= */

const drinks = [

    // =====================================================
    // 1. STARBUCKS
    // =====================================================

    {
        id: 1,
        name: "Cold Coffee",
        restaurant: "Starbucks",
        restaurantId: 1,
        category: "Coffee",
        rating: "4.8",
        reviews: "3.2k",
        price: 149,
        oldPrice: 199,
        time: "15 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900"
    },

    {
        id: 2,
        name: "Cappuccino",
        restaurant: "Starbucks",
        restaurantId: 1,
        category: "Coffee",
        rating: "4.7",
        reviews: "2.8k",
        price: 179,
        oldPrice: 219,
        time: "15 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1534778101976-62847782c213?w=900"
    },

    {
        id: 3,
        name: "Iced Coffee",
        restaurant: "Starbucks",
        restaurantId: 1,
        category: "Coffee",
        rating: "4.7",
        reviews: "2.9k",
        price: 159,
        oldPrice: 199,
        time: "15 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=900"
    },


    // =====================================================
    // 2. CAFE COFFEE DAY
    // =====================================================

    {
        id: 4,
        name: "Chocolate Shake",
        restaurant: "Cafe Coffee Day",
        restaurantId: 2,
        category: "Shakes",
        rating: "4.8",
        reviews: "3.1k",
        price: 199,
        oldPrice: 249,
        time: "20 min",
        badge: "Top Rated",
        image:
            "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=900"
    },

    {
        id: 5,
        name: "Strawberry Milkshake",
        restaurant: "Cafe Coffee Day",
        restaurantId: 2,
        category: "Shakes",
        rating: "4.6",
        reviews: "2.3k",
        price: 189,
        oldPrice: 239,
        time: "20 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1553787499-6f8c0f4e9c9d?w=900"
    },

    {
        id: 6,
        name: "Masala Chai",
        restaurant: "Cafe Coffee Day",
        restaurantId: 2,
        category: "Tea",
        rating: "4.7",
        reviews: "2.6k",
        price: 89,
        oldPrice: 119,
        time: "10 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=900"
    },


    // =====================================================
    // 3. THE COFFEE BEAN
    // =====================================================

    {
        id: 7,
        name: "Cafe Latte",
        restaurant: "The Coffee Bean",
        restaurantId: 3,
        category: "Coffee",
        rating: "4.7",
        reviews: "2.4k",
        price: 169,
        oldPrice: 209,
        time: "15 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=900"
    },

    {
        id: 8,
        name: "Mocha",
        restaurant: "The Coffee Bean",
        restaurantId: 3,
        category: "Coffee",
        rating: "4.6",
        reviews: "2.1k",
        price: 189,
        oldPrice: 239,
        time: "15 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=900"
    },

    {
        id: 9,
        name: "Vanilla Latte",
        restaurant: "The Coffee Bean",
        restaurantId: 3,
        category: "Coffee",
        rating: "4.7",
        reviews: "1.9k",
        price: 179,
        oldPrice: 219,
        time: "15 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900"
    },


    // =====================================================
    // 4. JUICE WORLD
    // =====================================================

    {
        id: 10,
        name: "Fresh Orange Juice",
        restaurant: "Juice World",
        restaurantId: 4,
        category: "Juice",
        rating: "4.7",
        reviews: "2.7k",
        price: 129,
        oldPrice: 159,
        time: "15 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=900"
    },

    {
        id: 11,
        name: "Fresh Mango Juice",
        restaurant: "Juice World",
        restaurantId: 4,
        category: "Juice",
        rating: "4.8",
        reviews: "3.4k",
        price: 139,
        oldPrice: 179,
        time: "15 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1546173159-315724a31696?w=900"
    },

    {
        id: 12,
        name: "Pineapple Juice",
        restaurant: "Juice World",
        restaurantId: 4,
        category: "Juice",
        rating: "4.6",
        reviews: "2.1k",
        price: 129,
        oldPrice: 159,
        time: "15 min",
        badge: "Fresh",
        image:
            "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=900"
    },


    // =====================================================
    // 5. FRUIT & JUICE BAR
    // =====================================================

    {
        id: 13,
        name: "Watermelon Juice",
        restaurant: "Fruit & Juice Bar",
        restaurantId: 5,
        category: "Juice",
        rating: "4.7",
        reviews: "2.5k",
        price: 119,
        oldPrice: 149,
        time: "15 min",
        badge: "Refreshing",
        image:
            "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=900"
    },

    {
        id: 14,
        name: "Pomegranate Juice",
        restaurant: "Fruit & Juice Bar",
        restaurantId: 5,
        category: "Juice",
        rating: "4.8",
        reviews: "2.2k",
        price: 149,
        oldPrice: 189,
        time: "15 min",
        badge: "Healthy",
        image:
            "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=900"
    },

    {
        id: 15,
        name: "Mixed Fruit Juice",
        restaurant: "Fruit & Juice Bar",
        restaurantId: 5,
        category: "Juice",
        rating: "4.7",
        reviews: "1.8k",
        price: 159,
        oldPrice: 199,
        time: "15 min",
        badge: "Fresh",
        image:
            "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=900"
    },


    // =====================================================
    // 6. CHAAYOS
    // =====================================================

    {
        id: 16,
        name: "Masala Tea",
        restaurant: "Chaayos",
        restaurantId: 6,
        category: "Tea",
        rating: "4.7",
        reviews: "2.8k",
        price: 79,
        oldPrice: 99,
        time: "10 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=900"
    },

    {
        id: 17,
        name: "Ginger Tea",
        restaurant: "Chaayos",
        restaurantId: 6,
        category: "Tea",
        rating: "4.6",
        reviews: "1.9k",
        price: 89,
        oldPrice: 109,
        time: "10 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=900"
    },

    {
        id: 18,
        name: "Green Tea",
        restaurant: "Chaayos",
        restaurantId: 6,
        category: "Tea",
        rating: "4.5",
        reviews: "1.7k",
        price: 99,
        oldPrice: 129,
        time: "10 min",
        badge: "Healthy",
        image:
            "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900"
    },


    // =====================================================
    // 7. THE TEA HOUSE
    // =====================================================

    {
        id: 19,
        name: "Lemon Tea",
        restaurant: "The Tea House",
        restaurantId: 7,
        category: "Tea",
        rating: "4.6",
        reviews: "1.6k",
        price: 89,
        oldPrice: 119,
        time: "10 min",
        badge: "Refreshing",
        image:
            "https://images.unsplash.com/photo-1597318181409-cf64d0d5a5a8?w=900"
    },

    {
        id: 20,
        name: "Iced Tea",
        restaurant: "The Tea House",
        restaurantId: 7,
        category: "Coolers",
        rating: "4.7",
        reviews: "2.1k",
        price: 109,
        oldPrice: 139,
        time: "15 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=900"
    },

    {
        id: 21,
        name: "Peach Iced Tea",
        restaurant: "The Tea House",
        restaurantId: 7,
        category: "Coolers",
        rating: "4.6",
        reviews: "1.5k",
        price: 119,
        oldPrice: 149,
        time: "15 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=900"
    },


    // =====================================================
    // 8. SHAKE FACTORY
    // =====================================================

    {
        id: 22,
        name: "Oreo Shake",
        restaurant: "Shake Factory",
        restaurantId: 8,
        category: "Shakes",
        rating: "4.8",
        reviews: "3.5k",
        price: 219,
        oldPrice: 269,
        time: "20 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1568901839119-631418a3910d?w=900"
    },

    {
        id: 23,
        name: "Vanilla Milkshake",
        restaurant: "Shake Factory",
        restaurantId: 8,
        category: "Shakes",
        rating: "4.6",
        reviews: "1.9k",
        price: 179,
        oldPrice: 219,
        time: "20 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=900"
    },

    {
        id: 24,
        name: "Chocolate Fudge Shake",
        restaurant: "Shake Factory",
        restaurantId: 8,
        category: "Shakes",
        rating: "4.9",
        reviews: "3.8k",
        price: 229,
        oldPrice: 279,
        time: "20 min",
        badge: "Top Rated",
        image:
            "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=900"
    }

];
export default function DrinksPage() {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const [activeFilter, setActiveFilter] =
        useState("All");

    const [selectedRestaurant, setSelectedRestaurant] =
        useState("All");


    const filters = [
        "All",
        "Coffee",
        "Juice",
        "Shakes",
        "Coolers"
    ];


    /* =========================================
       FILTER DRINKS
    ========================================= */

    const filteredDrinks = useMemo(() => {

        return drinks.filter((drink) => {

            const searchValue =
                search.toLowerCase().trim();


            const matchesSearch =
                drink.name
                    .toLowerCase()
                    .includes(searchValue) ||

                drink.restaurant
                    .toLowerCase()
                    .includes(searchValue);


            const matchesRestaurant =
                selectedRestaurant === "All" ||
                drink.restaurantId === selectedRestaurant;


            let matchesFilter = true;


            if (activeFilter !== "All") {

                matchesFilter =
                    drink.category === activeFilter;

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

        <div className="drinksPageLayout">

            <DashboardSidebar />

            <div className="drinksMarketplace">


                {/* HEADER */}

                <header className="drinksTopHeader">

                    <button
                        className="drinksBackButton"
                        onClick={() => navigate(-1)}
                    >

                        <FaArrowLeft />

                    </button>


                    <div className="drinksHeaderText">

                        <h1>
                            Drinks
                        </h1>

                    </div>


                    <div className="drinksHeaderRight">

                        <button className="drinksLocation">

                            <span className="drinksLocationDot">
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
                            className="drinksCart"
                            onClick={() =>
                                navigate("/cart")
                            }
                        >

                            <FaShoppingCart />

                            <span>
                                Cart
                            </span>

                        </button>

                    </div>

                </header>



                {/* HERO */}

                <section className="drinksHero">

                    <div className="drinksHeroContent">

                        <div className="drinksHeroTag">

                            <FaFire />

                            Trending now

                        </div>


                        <h2>

                            Find your perfect
                            <span> drink.</span>

                        </h2>


                        <p>

                            Refreshing drinks, coffees,
                            juices and shakes from your
                            favorite restaurants.

                        </p>


                        <div className="drinksSearchBox">

                            <FaSearch />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search drinks or restaurants..."
                            />

                        </div>

                    </div>


                    <div className="drinksHeroImage">

    <img
        src="https://images.squarespace-cdn.com/content/v1/634ef0e6992d00397b17f041/b4cc0487-909d-4979-99a3-187652b816a5/Book_Refresh-06.jpg"
        alt="Refreshing Drinks"
    />

</div>

                </section>



                {/* FILTERS */}

                <section className="drinksFiltersSection">

                    <div className="drinksFilterLeft">

                        <FaFilter />

                        {filters.map(filter => (

                            <button
                                key={filter}
                                className={
                                    activeFilter === filter
                                        ? "drinksFilter active"
                                        : "drinksFilter"
                                }
                                onClick={() =>
                                    setActiveFilter(filter)
                                }
                            >

                                {filter}

                            </button>

                        ))}

                    </div>


                    <button className="drinksSortButton">

                        Sort by

                        <FaChevronDown />

                    </button>

                </section>



                {/* RESTAURANTS */}

                <section className="drinksRestaurants">

                    <div className="drinksSectionHeading">

                        <div>

                            <span>
                                DISCOVER
                            </span>

                            <h2>
                                Popular Drink Restaurants
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


                    <div className="drinksRestaurantScroller">

                        {restaurants.map(restaurant => (

                            <button
                                className={
                                    selectedRestaurant === restaurant.id
                                        ? "drinksRestaurantCard selected"
                                        : "drinksRestaurantCard"
                                }
                                key={restaurant.id}
                                onClick={() =>
                                    handleRestaurantClick(
                                        restaurant.id
                                    )
                                }
                            >

                                <div className="drinksRestaurantImage">

                                    <img
                                        src={restaurant.image}
                                        alt={restaurant.name}
                                    />

                                </div>


                                <div className="drinksRestaurantInfo">

                                    <h3>
                                        {restaurant.name}
                                    </h3>


                                    <div>

                                        <span className="drinksMiniRating">

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

                <section className="drinksProducts">

                    <div className="drinksSectionHeading">

                        <div>

                            <span>
                                OUR MENU
                            </span>

                            <h2>
                                Popular Drinks
                            </h2>

                            <p>
                                {filteredDrinks.length}
                                {" "}refreshing drinks available
                            </p>

                        </div>


                        <div className="drinksResultCount">

                            {filteredDrinks.length} results

                        </div>

                    </div>



                    <div className="modernDrinksGrid">

                        {filteredDrinks.map(drink => (

                            <article
                                className="modernDrinksCard"
                                key={drink.id}
                            >


                                <div className="modernDrinksImage">

                                    <img
                                        src={drink.image}
                                        alt={drink.name}
                                    />


                                    <span className="modernDrinksBadge">

                                        {drink.badge}

                                    </span>


                                    <button className="modernDrinksHeart">

                                        <FaHeart />

                                    </button>


                                    <div className="drinksImageGradient"></div>

                                </div>



                                <div className="modernDrinksContent">

                                    <div className="drinksNameRow">

                                        <h3>
                                            {drink.name}
                                        </h3>

                                    </div>


                                    <p className="modernDrinksRestaurant">

                                        {drink.restaurant}

                                    </p>


                                    <div className="modernDrinksMeta">

                                        <span className="modernDrinksRating">

                                            <FaStar />

                                            {drink.rating}

                                        </span>

                                        <span>
                                            ({drink.reviews})
                                        </span>

                                        <span>
                                            •
                                        </span>

                                        <span>

                                            <FaClock />

                                            {drink.time}

                                        </span>

                                    </div>


                                    <div className="modernDrinksDivider"></div>


                                    <div className="modernDrinksBottom">

                                        <div className="modernDrinksPrice">

                                            <strong>
                                                ₹{drink.price}
                                            </strong>

                                            <del>
                                                ₹{drink.oldPrice}
                                            </del>

                                        </div>


                                        <button
                                            className="addDrinksButton"
                                            onClick={() =>
                                                navigate(
                                                    `/order-drink/${drink.id}`,
                                                    {
                                                        state: {
                                                            drink: drink
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



                    {filteredDrinks.length === 0 && (

                        <div className="noDrinksResults">

                            <div>
                                🥤
                            </div>

                            <h3>
                                No drinks found
                            </h3>

                            <p>
                                Try another drink or restaurant name.
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

                <section className="drinksDeliveryBanner">

                    <div className="drinksDeliveryIcon">

                        <FaMotorcycle />

                    </div>


                    <div>

                        <h3>
                            Fresh drinks, delivered chilled.
                        </h3>

                        <p>
                            Order from the best drink restaurants
                            near you and enjoy fast delivery.
                        </p>

                    </div>


                    <div className="drinksDeliveryTime">

                        <strong>
                            15-30
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