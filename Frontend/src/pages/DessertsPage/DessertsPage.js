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

import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";

import "./DessertsPage.css";


/* =========================================
   DESSERT RESTAURANTS
========================================= */

const restaurants = [

    {
        id: 1,
        name: "Cake World",
        rating: "4.8",
        time: "15-20 min",
        image:
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900"
    },

    {
        id: 2,
        name: "Brownie House",
        rating: "4.7",
        time: "15-20 min",
        image:
            "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900"
    },

    {
        id: 3,
        name: "Sweet Cheesecake",
        rating: "4.9",
        time: "20-25 min",
        image:
            "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900"
    },

    {
        id: 4,
        name: "Sweet Bakery",
        rating: "4.7",
        time: "15-20 min",
        image:
            "https://images.unsplash.com/photo-1519869325930-281384150729?w=900"
    },

    {
        id: 5,
        name: "Indian Sweets",
        rating: "4.8",
        time: "15-20 min",
        image:
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900"
    },

    {
        id: 6,
        name: "Waffle Factory",
        rating: "4.9",
        time: "15-20 min",
        image:
            "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=900"
    },

    {
        id: 7,
        name: "Donut House",
        rating: "4.7",
        time: "10-15 min",
        image:
            "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=900"
    },

    {
        id: 8,
        name: "Ice Cream Corner",
        rating: "4.8",
        time: "10-15 min",
        image:
            "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900"
    }

];


/* =========================================
   DESSERT ITEMS
========================================= */

const desserts = [

    {
        id: 1,
        name: "Chocolate Cake",
        restaurant: "Cake World",
        restaurantId: 1,
        category: "Cakes",
        rating: "4.8",
        reviews: "3.2k",
        price: 199,
        oldPrice: 249,
        time: "20 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900",
        description:
            "Rich chocolate cake with soft sponge and creamy chocolate frosting."
    },

    {
        id: 2,
        name: "Red Velvet Cake",
        restaurant: "Cake World",
        restaurantId: 1,
        category: "Cakes",
        rating: "4.7",
        reviews: "2.6k",
        price: 229,
        oldPrice: 279,
        time: "20 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1586788224331-947f68671cf1?w=900",
        description:
            "Soft red velvet cake layered with smooth cream cheese frosting."
    },

    {
        id: 3,
        name: "Chocolate Fudge Cake",
        restaurant: "Cake World",
        restaurantId: 1,
        category: "Cakes",
        rating: "4.9",
        reviews: "3.9k",
        price: 249,
        oldPrice: 299,
        time: "20 min",
        badge: "Top Rated",
        image:
            "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=900",
        description:
            "Decadent chocolate fudge cake with rich chocolate layers."
    },


    {
        id: 4,
        name: "Chocolate Brownie",
        restaurant: "Brownie House",
        restaurantId: 2,
        category: "Brownies",
        rating: "4.8",
        reviews: "2.9k",
        price: 149,
        oldPrice: 189,
        time: "15 min",
        badge: "Top Rated",
        image:
            "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=900",
        description:
            "Warm, fudgy chocolate brownie with a soft center."
    },

    {
        id: 5,
        name: "Walnut Brownie",
        restaurant: "Brownie House",
        restaurantId: 2,
        category: "Brownies",
        rating: "4.7",
        reviews: "2.1k",
        price: 169,
        oldPrice: 209,
        time: "15 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900",
        description:
            "Classic chocolate brownie loaded with crunchy walnuts."
    },

    {
        id: 6,
        name: "Double Chocolate Brownie",
        restaurant: "Brownie House",
        restaurantId: 2,
        category: "Brownies",
        rating: "4.8",
        reviews: "2.5k",
        price: 179,
        oldPrice: 219,
        time: "15 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900",
        description:
            "Extra rich brownie made for serious chocolate lovers."
    },


    {
        id: 7,
        name: "New York Cheesecake",
        restaurant: "Sweet Cheesecake",
        restaurantId: 3,
        category: "Cheesecake",
        rating: "4.9",
        reviews: "3.4k",
        price: 249,
        oldPrice: 299,
        time: "20 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900",
        description:
            "Classic creamy New York cheesecake with a buttery crust."
    },

    {
        id: 8,
        name: "Strawberry Cheesecake",
        restaurant: "Sweet Cheesecake",
        restaurantId: 3,
        category: "Cheesecake",
        rating: "4.8",
        reviews: "2.8k",
        price: 269,
        oldPrice: 319,
        time: "20 min",
        badge: "Top Rated",
        image:
            "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=900",
        description:
            "Creamy cheesecake topped with fresh strawberry flavor."
    },

    {
        id: 9,
        name: "Biscoff Cheesecake",
        restaurant: "Sweet Cheesecake",
        restaurantId: 3,
        category: "Cheesecake",
        rating: "4.9",
        reviews: "3.7k",
        price: 279,
        oldPrice: 329,
        time: "20 min",
        badge: "Premium",
        image:
            "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=900",
        description:
            "Premium cheesecake with caramelized biscuit flavor."
    },


    {
        id: 10,
        name: "Chocolate Pastry",
        restaurant: "Sweet Bakery",
        restaurantId: 4,
        category: "Pastries",
        rating: "4.6",
        reviews: "1.9k",
        price: 99,
        oldPrice: 129,
        time: "15 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1519869325930-281384150729?w=900",
        description:
            "Soft chocolate pastry with creamy chocolate layers."
    },

    {
        id: 11,
        name: "Black Forest Pastry",
        restaurant: "Sweet Bakery",
        restaurantId: 4,
        category: "Pastries",
        rating: "4.7",
        reviews: "2.3k",
        price: 119,
        oldPrice: 149,
        time: "15 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=900",
        description:
            "Classic black forest pastry with chocolate and cream."
    },

    {
        id: 12,
        name: "Red Velvet Pastry",
        restaurant: "Sweet Bakery",
        restaurantId: 4,
        category: "Pastries",
        rating: "4.8",
        reviews: "2.6k",
        price: 129,
        oldPrice: 159,
        time: "15 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1586788224331-947f68671cf1?w=900",
        description:
            "Moist red velvet pastry with smooth cream topping."
    },


    {
        id: 13,
        name: "Gulab Jamun",
        restaurant: "Indian Sweets",
        restaurantId: 5,
        category: "Indian Sweets",
        rating: "4.8",
        reviews: "3.1k",
        price: 89,
        oldPrice: 119,
        time: "15 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900",
        description:
            "Soft gulab jamuns soaked in fragrant sugar syrup."
    },

    {
        id: 14,
        name: "Rasmalai",
        restaurant: "Indian Sweets",
        restaurantId: 5,
        category: "Indian Sweets",
        rating: "4.7",
        reviews: "2.5k",
        price: 119,
        oldPrice: 149,
        time: "15 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=900",
        description:
            "Soft cheese dumplings served in creamy saffron milk."
    },

    {
        id: 15,
        name: "Kaju Katli",
        restaurant: "Indian Sweets",
        restaurantId: 5,
        category: "Indian Sweets",
        rating: "4.8",
        reviews: "2.7k",
        price: 149,
        oldPrice: 179,
        time: "15 min",
        badge: "Premium",
        image:
            "https://images.unsplash.com/photo-1666190094760-1f1c3c6b7b8b?w=900",
        description:
            "Premium cashew sweet with a delicate melt-in-mouth texture."
    },


    {
        id: 16,
        name: "Belgian Chocolate Waffle",
        restaurant: "Waffle Factory",
        restaurantId: 6,
        category: "Waffles",
        rating: "4.9",
        reviews: "3.6k",
        price: 199,
        oldPrice: 249,
        time: "20 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=900",
        description:
            "Crispy Belgian waffle topped with rich chocolate."
    },

    {
        id: 17,
        name: "Strawberry Waffle",
        restaurant: "Waffle Factory",
        restaurantId: 6,
        category: "Waffles",
        rating: "4.7",
        reviews: "2.4k",
        price: 219,
        oldPrice: 269,
        time: "20 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1558584724-0e4d32ca55a4?w=900",
        description:
            "Fresh waffle served with strawberry topping."
    },


    {
        id: 18,
        name: "Chocolate Donut",
        restaurant: "Donut House",
        restaurantId: 7,
        category: "Donuts",
        rating: "4.6",
        reviews: "1.8k",
        price: 79,
        oldPrice: 99,
        time: "15 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=900",
        description:
            "Soft donut coated with rich chocolate glaze."
    },

    {
        id: 19,
        name: "Glazed Donut",
        restaurant: "Donut House",
        restaurantId: 7,
        category: "Donuts",
        rating: "4.7",
        reviews: "2.2k",
        price: 69,
        oldPrice: 89,
        time: "15 min",
        badge: "Trending",
        image:
            "https://images.unsplash.com/photo-1527515545081-5db817172677?w=900",
        description:
            "Soft and fluffy donut covered with sweet glaze."
    },


    {
        id: 20,
        name: "Chocolate Ice Cream",
        restaurant: "Ice Cream Corner",
        restaurantId: 8,
        category: "Ice Cream",
        rating: "4.8",
        reviews: "3.5k",
        price: 129,
        oldPrice: 159,
        time: "15 min",
        badge: "Bestseller",
        image:
            "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900",
        description:
            "Creamy chocolate ice cream with rich cocoa flavor."
    },

    {
        id: 21,
        name: "Strawberry Ice Cream",
        restaurant: "Ice Cream Corner",
        restaurantId: 8,
        category: "Ice Cream",
        rating: "4.7",
        reviews: "2.7k",
        price: 129,
        oldPrice: 159,
        time: "15 min",
        badge: "Popular",
        image:
            "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=900",
        description:
            "Smooth strawberry ice cream made with fruity flavor."
    },

    {
        id: 22,
        name: "Butterscotch Ice Cream",
        restaurant: "Ice Cream Corner",
        restaurantId: 8,
        category: "Ice Cream",
        rating: "4.8",
        reviews: "2.9k",
        price: 139,
        oldPrice: 169,
        time: "15 min",
        badge: "Top Rated",
        image:
            "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=900",
        description:
            "Creamy butterscotch ice cream with crunchy caramel pieces."
    }

];


const filters = [
    "All",
    "Cakes",
    "Ice Cream",
    "Brownies",
    "Cheesecake",
    "Pastries",
    "Indian Sweets",
    "Waffles",
    "Donuts"
];


export default function DessertsPage() {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const [activeFilter, setActiveFilter] =
        useState("All");

    const [selectedRestaurant, setSelectedRestaurant] =
        useState("All");


    const filteredDesserts = useMemo(() => {

        return desserts.filter((dessert) => {

            const searchValue =
                search.toLowerCase().trim();


            const matchesSearch =
                dessert.name
                    .toLowerCase()
                    .includes(searchValue) ||

                dessert.restaurant
                    .toLowerCase()
                    .includes(searchValue);


            const matchesRestaurant =
                selectedRestaurant === "All" ||
                dessert.restaurantId === selectedRestaurant;


            const matchesFilter =
                activeFilter === "All" ||
                dessert.category === activeFilter;


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

        setSelectedRestaurant(
            selectedRestaurant === id
                ? "All"
                : id
        );

    };


    return (

        <div className="dessertsPageLayout">

            <DashboardSidebar />


            <div className="dessertsMarketplace">


                {/* HEADER */}

                <header className="dessertsTopHeader">

                    <button
                        className="dessertsBackButton"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft />
                    </button>


                    <div className="dessertsHeaderText">

                        {/* <span>
                            SWEET COLLECTION
                        </span> */}

                        <h1>
                            Desserts
                        </h1>

                    </div>


                    <div className="dessertsHeaderRight">

                        <button className="dessertsLocation">

                            <span className="dessertsLocationDot">
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
                            className="dessertsCart"
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

                <section className="dessertsHero">

                    <div className="dessertsHeroContent">

                        <div className="dessertsHeroTag">

                            <FaFire />

                            Sweet treats

                        </div>


                        <h2>

                            Treat yourself to
                            <span> something sweet.</span>

                        </h2>


                        <p>

                            Cakes, brownies, ice creams,
                            waffles and delicious desserts
                            from your favorite restaurants.

                        </p>


                        <div className="dessertsSearchBox">

                            <FaSearch />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search desserts or restaurants..."
                            />

                        </div>

                    </div>


                    <div className="dessertsHeroImage">

                        <img
                            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200"
                            alt="Desserts"
                        />

                    </div>

                </section>



                {/* FILTERS */}

                <section className="dessertsFiltersSection">

                    <div className="dessertsFilterLeft">

                        <FaFilter />

                        {filters.map((filter) => (

                            <button
                                key={filter}
                                className={
                                    activeFilter === filter
                                        ? "dessertsFilter active"
                                        : "dessertsFilter"
                                }
                                onClick={() =>
                                    setActiveFilter(filter)
                                }
                            >

                                {filter}

                            </button>

                        ))}

                    </div>


                    <button className="dessertsSortButton">

                        Sort by

                        <FaChevronDown />

                    </button>

                </section>



                {/* RESTAURANTS */}

                <section className="dessertsRestaurants">

                    <div className="dessertsSectionHeading">

                        <div>

                            <span>
                                DISCOVER
                            </span>

                            <h2>
                                Popular Dessert Restaurants
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


                    <div className="dessertsRestaurantScroller">

                        {restaurants.map((restaurant) => (

                            <button
                                key={restaurant.id}
                                className={
                                    selectedRestaurant === restaurant.id
                                        ? "dessertsRestaurantCard selected"
                                        : "dessertsRestaurantCard"
                                }
                                onClick={() =>
                                    handleRestaurantClick(
                                        restaurant.id
                                    )
                                }
                            >

                                <div className="dessertsRestaurantImage">

                                    <img
                                        src={restaurant.image}
                                        alt={restaurant.name}
                                    />

                                </div>


                                <div className="dessertsRestaurantInfo">

                                    <h3>
                                        {restaurant.name}
                                    </h3>


                                    <div>

                                        <span className="dessertsMiniRating">

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



                {/* DESSERT PRODUCTS */}

                <section className="dessertsProducts">

                    <div className="dessertsSectionHeading">

                        <div>

                            <span>
                                OUR MENU
                            </span>

                            <h2>
                                Popular Desserts
                            </h2>

                            <p>
                                {filteredDesserts.length}
                                {" "}desserts available
                            </p>

                        </div>


                        <div className="dessertsResultCount">

                            {filteredDesserts.length} results

                        </div>

                    </div>


                    <div className="modernDessertsGrid">

                        {filteredDesserts.map((dessert) => (

                            <article
                                className="modernDessertsCard"
                                key={dessert.id}
                            >

                                <div className="modernDessertsImage">

                                    <img
                                        src={dessert.image}
                                        alt={dessert.name}
                                    />


                                    <span className="modernDessertsBadge">

                                        {dessert.badge}

                                    </span>


                                    <button className="modernDessertsHeart">

                                        <FaHeart />

                                    </button>


                                    <div className="dessertsImageGradient"></div>

                                </div>


                                <div className="modernDessertsContent">

                                    <div className="dessertsNameRow">

                                        <h3>
                                            {dessert.name}
                                        </h3>

                                    </div>


                                    <p className="modernDessertsRestaurant">

                                        {dessert.restaurant}

                                    </p>


                                    <div className="modernDessertsMeta">

                                        <span className="modernDessertsRating">

                                            <FaStar />

                                            {dessert.rating}

                                        </span>

                                        <span>
                                            ({dessert.reviews})
                                        </span>

                                        <span>
                                            •
                                        </span>

                                        <span>

                                            <FaClock />

                                            {dessert.time}

                                        </span>

                                    </div>


                                    <div className="modernDessertsDivider"></div>


                                    <div className="modernDessertsBottom">

                                        <div className="modernDessertsPrice">

                                            <strong>
                                                ₹{dessert.price}
                                            </strong>

                                            <del>
                                                ₹{dessert.oldPrice}
                                            </del>

                                        </div>


                                        <button
                                            className="addDessertsButton"
                                            onClick={() =>
                                                navigate(
                                                    `/order-dessert/${dessert.id}`,
                                                    {
                                                        state: {
                                                            dessert
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


                    {filteredDesserts.length === 0 && (

                        <div className="noDessertsResults">

                            <div>
                                🍰
                            </div>

                            <h3>
                                No desserts found
                            </h3>

                            <p>
                                Try another dessert or restaurant name.
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

                <section className="dessertsDeliveryBanner">

                    <div className="dessertsDeliveryIcon">

                        <FaMotorcycle />

                    </div>


                    <div>

                        <h3>
                            Sweet treats, delivered fresh.
                        </h3>

                        <p>
                            Order delicious desserts from
                            the best bakeries near you.
                        </p>

                    </div>


                    <div className="dessertsDeliveryTime">

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