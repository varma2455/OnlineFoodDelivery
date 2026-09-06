import React, { useState } from "react";
import "./Burger.css";
import { burgerData } from "./burgerData";

import { useNavigate } from "react-router-dom";

const Burger = () => {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const filteredBurger = burgerData.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = () => {

        alert("Please login first.");
        // User is logged in
        navigate("/login"); // or do nothing if you haven't implemented the cart yet
    };


    return (

        <div className="burger-page">

            <section className="burger-hero">

                <div className="hero-content">

                    <h1>🍔 Burger House</h1>

                    <p>
                        Enjoy juicy burgers made with fresh ingredients and premium cheese.
                    </p>

                    <button className="hero-btn" onClick={() => navigate("/login")}>
                        Order Now
                    </button>

                </div>

            </section>

            <section className="search-section">

                <input
                    type="text"
                    placeholder="Search Burgers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

            </section>

            <section className="burger-container">

                <div className="title">

                    <h2>Popular Burgers</h2>

                    <p>Freshly grilled burgers near you</p>

                </div>

                <div className="burger-grid">

                    {filteredBurger.map((item) => (

                        <div className="burger-card" key={item.id}>

                            <img
                                src={item.image}
                                alt={item.name}
                            />

                            <div className="burger-info">

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

                                    <button onClick={() => addToCart(item.id)}>Add to Cart</button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </section>

        </div>

    );

};

export default Burger;