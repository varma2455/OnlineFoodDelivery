import React, { useState } from "react";
import "./FastFood.css";
import { fastFoodData } from "./fastFoodData";

import { useNavigate } from "react-router-dom";


const FastFood = () => {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const filteredFood = fastFoodData.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <div className="fastfood-page">

            <section className="fastfood-hero">

                <div className="hero-content">

                    <h1>🌮 Fast Food Corner</h1>

                    <p>
                        Crispy, cheesy and delicious fast food delivered
                        hot and fresh to your doorstep.
                    </p>

                    <button className="hero-btn" onClick={() => navigate("/login")}>
                        Order Now
                    </button>

                </div>

            </section>

            <section className="search-section">

                <input
                    type="text"
                    placeholder="Search Fast Food..."
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                />

            </section>

            <section className="fastfood-container">

                <div className="title">

                    <h2>Popular Fast Foods</h2>

                    <p>Your favourite snacks are here</p>

                </div>

                <div className="fastfood-grid">

                    {filteredFood.map((item)=>(

                        <div
                            className="fastfood-card"
                            key={item.id}
                        >

                            <img
                                src={item.image}
                                alt={item.name}
                            />

                            <div className="fastfood-info">

                                <h3>{item.name}</h3>

                                <p className="restaurant">
                                    {item.restaurant}
                                </p>

                                <div className="rating-time">

                                    <span>⭐ {item.rating}</span>

                                    <span>🕒 {item.time}</span>

                                </div>

                                <div className="price-cart">

                                    <h4>₹{item.price}</h4>

                                    <button>
                                        Add Cart
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </section>

        </div>

    );

};

export default FastFood;