import React from "react";
import {
    FaHeart,
    FaStar,
    FaClock,
    FaShoppingCart
} from "react-icons/fa";

import "./TrendingFoods.css";


const trending = [

    {
        name:"Cheese Burst Pizza",
        price:349,
        oldPrice:449,
        rating:"4.9",
        reviews:"2450",
        time:"25 min",
        offer:"20% OFF",
        badge:"🔥 Trending",
        image:"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900"
    },

    {
        name:"Chicken Burger",
        price:199,
        oldPrice:249,
        rating:"4.8",
        reviews:"1980",
        time:"20 min",
        offer:"10% OFF",
        badge:"🔥 Popular",
        image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900"
    },

    {
        name:"Paneer Biryani",
        price:299,
        oldPrice:399,
        rating:"4.7",
        reviews:"3100",
        time:"35 min",
        offer:"30% OFF",
        badge:"⭐ Top Rated",
        image:"https://images.unsplash.com/photo-1701579231347-3f84a3e1d99d?w=900"
    },

    {
        name:"Chicken Noodles",
        price:249,
        oldPrice:329,
        rating:"4.8",
        reviews:"1450",
        time:"22 min",
        offer:"20% OFF",
        badge:"🔥 Trending",
        image:"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=900"
    }

];


export default function TrendingFoods(){

    return(

        <section className="trendingFoods">


            {/* HEADER */}

            <div className="sectionTitle">

                <div>

                    <h2>
                        🔥 Trending Foods
                    </h2>

                    <p>
                        Most loved dishes right now
                    </p>

                </div>


                <button>
                    View All
                </button>

            </div>


            {/* GRID */}

            <div className="trendingGrid">

                {trending.map((food,index)=>(

                    <div
                        className="trendingCard"
                        key={index}
                    >


                        {/* IMAGE */}

                        <div className="trendingImage">

                            <img
                                src={food.image}
                                alt={food.name}
                            />


                            {/* BADGE */}

                            <span className="badge">
                                {food.badge}
                            </span>


                            {/* WISHLIST */}

                            <button className="wishlist">
                                <FaHeart />
                            </button>

                        </div>


                        {/* CONTENT */}

                        <div className="trendingContent">


                            <h3>
                                {food.name}
                            </h3>


                            {/* RATING */}

                            <div className="rating">

                                <FaStar />

                                <span>
                                    {food.rating}
                                </span>

                                <span>
                                    ({food.reviews})
                                </span>

                            </div>


                            {/* DELIVERY */}

                            <div className="delivery">

                                <FaClock />

                                <span>
                                    {food.time}
                                </span>

                            </div>


                            {/* PRICE */}

                            <div className="price">

                                <h2>
                                    ₹{food.price}
                                </h2>

                                <del>
                                    ₹{food.oldPrice}
                                </del>

                            </div>


                            {/* CART */}

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