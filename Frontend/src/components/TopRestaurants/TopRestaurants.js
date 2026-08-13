import React from "react";
import { FaHeart, FaStar, FaClock, FaShoppingCart } from "react-icons/fa";
import "./TopRestaurants.css";

const restaurants = [

    {
        name: "Domino's Pizza",
        cuisine: "Pizza • Italian",
        rating: "4.8",
        reviews: "2450",
        time: "25 min",
        offer: "50% OFF",
        price: "₹399",
        oldPrice: "₹499",
        badge: "🔥 Bestseller",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900"
    },

    {
        name: "Burger King",
        cuisine: "Burger • Fast Food",
        rating: "4.6",
        reviews: "1980",
        time: "20 min",
        offer: "40% OFF",
        price: "₹249",
        oldPrice: "₹349",
        badge: "20% OFF",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900"
    },

    {
        name: "Paradise Biryani",
        cuisine: "Biryani • Indian",
        rating: "4.9",
        reviews: "3100",
        time: "35 min",
        offer: "30% OFF",
        price: "₹299",
        oldPrice: "₹399",
        badge: "⭐ Top Rated",
        image: "https://images.unsplash.com/photo-1701579231347-3f84a3e1d99d?w=900"
    },

    {
        name: "Chinese Bowl",
        cuisine: "Noodles • Asian",
        rating: "4.7",
        reviews: "1200",
        time: "22 min",
        offer: "20% OFF",
        price: "₹199",
        oldPrice: "₹279",
        badge: "🔥 Trending",
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900"
    }

];


export default function TopRestaurants() {

    return (

        <section className="topRestaurants">

            {/* HEADER */}

            <div className="titleRow">

                <div>

                    <h2>
                        🏆 Top Restaurants
                    </h2>

                    <p>
                        Hand-picked restaurants you'll love
                    </p>

                </div>

                <button>
                    View All
                </button>

            </div>


            {/* GRID */}

            <div className="restaurantGrid">

                {restaurants.map((restaurant, index) => (

                    <div
                        className="restaurantCard"
                        key={index}
                    >

                        {/* IMAGE */}

                        <div className="restaurantImage">

                            <img
                                src={restaurant.image}
                                alt={restaurant.name}
                            />


                            {/* BADGE */}

                            <span className="badge">
                                {restaurant.badge}
                            </span>


                            {/* WISHLIST */}

                            <button className="wishlist">
                                <FaHeart />
                            </button>

                        </div>


                        {/* CONTENT */}

                        <div className="restaurantContent">

                            <h3>
                                {restaurant.name}
                            </h3>

                            <p className="cuisine">
                                {restaurant.cuisine}
                            </p>


                            {/* RATING */}

                            <div className="rating">

                                <FaStar />

                                <span>
                                    {restaurant.rating}
                                </span>

                                <span>
                                    ({restaurant.reviews})
                                </span>

                            </div>


                            {/* DELIVERY */}

                            <div className="delivery">

                                <FaClock />

                                <span>
                                    {restaurant.time}
                                </span>

                            </div>


                            {/* PRICE */}

                            <div className="price">

                                <h2>
                                    {restaurant.price}
                                </h2>

                                <del>
                                    {restaurant.oldPrice}
                                </del>

                            </div>


                            {/* ADD TO CART */}

                            <button className="cartButton">

                                <FaShoppingCart />

                                Add To Cart

                            </button>

                        </div>

                    </div>

                ))}

            </div>

        </section>

    );

}