import React, { useState } from "react";
import "./Drinks.css";
import { drinksData } from "./drinksData";

import { useNavigate } from "react-router-dom";

const Drinks = () => {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const filteredDrinks = drinksData.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <div className="drinks-page">

            <section className="drinks-hero">

                <div className="hero-content">

                    <h1>🥤 Cool Drinks</h1>

                    <p>
                        Refresh yourself with chilled juices, shakes,
                        smoothies and soft drinks.
                    </p>

                    <button className="hero-btn" onClick={() => navigate("/login")}>
                        Order Now
                    </button>

                </div>

            </section>

            <section className="search-section">

                <input
                    type="text"
                    placeholder="Search Drinks..."
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                />

            </section>

            <section className="drinks-container">

                <div className="title">

                    <h2>Popular Drinks</h2>

                    <p>Fresh beverages delivered instantly</p>

                </div>

                <div className="drinks-grid">

                    {filteredDrinks.map((item)=>(

                        <div
                            className="drinks-card"
                            key={item.id}
                        >

                            <img
                                src={item.image}
                                alt={item.name}
                            />

                            <div className="drinks-info">

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

export default Drinks;