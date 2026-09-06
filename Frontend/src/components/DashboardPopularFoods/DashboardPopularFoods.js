import React from "react";
import "./DashboardPopularFoods.css";

import {
    FaStar,
    FaClock,
    FaShoppingCart
} from "react-icons/fa";

const foods = [

    {
        id:1,
        name:"Chicken Burger",
        category:"Fast Food",
        price:199,
        rating:4.8,
        time:"20 min",
        image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800"
    },

    {
        id:2,
        name:"Veg Pizza",
        category:"Italian",
        price:299,
        rating:4.9,
        time:"25 min",
        image:"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800"
    },

    {
        id:3,
        name:"Chicken Biryani",
        category:"Indian",
        price:249,
        rating:4.7,
        time:"30 min",
        image:"https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800"
    },

    {
        id:4,
        name:"Pasta Alfredo",
        category:"Italian",
        price:279,
        rating:4.6,
        time:"22 min",
        image:"https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800"
    }

];

const DashboardPopularFoods = () => {

    return (

        <section className="popular-foods">

            <div className="popular-header">

                <div>

                    <h2>Popular Foods</h2>

                    <p>
                        Most ordered dishes today
                    </p>

                </div>

                <button>

                    View All

                </button>

            </div>

            <div className="food-grid">

                {

                    foods.map((food)=>(

                        <div
                            className="food-card"
                            key={food.id}
                        >

                            <div className="food-image">

                                <img
                                    src={food.image}
                                    alt={food.name}
                                />

                            </div>

                            <div className="food-details">

                                <span className="food-category">

                                    {food.category}

                                </span>

                                <h3>

                                    {food.name}

                                </h3>

                                <div className="food-rating">

                                    <span>

                                        <FaStar />

                                        {food.rating}

                                    </span>

                                    <span>

                                        <FaClock />

                                        {food.time}

                                    </span>

                                </div>

                                <div className="food-bottom">

                                    <h2>

                                        ₹{food.price}

                                    </h2>

                                    <button>

                                        <FaShoppingCart />

                                    </button>

                                </div>

                            </div>

                        </div>

                    ))

                }

            </div>

        </section>

    );

};

export default DashboardPopularFoods;