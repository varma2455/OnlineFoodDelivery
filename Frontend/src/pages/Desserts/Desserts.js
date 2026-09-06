import React, { useState } from "react";
import "./Desserts.css";
import { dessertsData } from "./dessertsData";

import { useNavigate } from "react-router-dom";

const Desserts = () => {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const filteredDesserts = dessertsData.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = () => {

        alert("Please login first.");
        // User is logged in
        navigate("/login"); // or do nothing if you haven't implemented the cart yet
    };

    return (

        <div className="desserts-page">

            <section className="desserts-hero">

                <div className="hero-content">

                    <h1>🍰 Sweet Desserts</h1>

                    <p>
                        Fresh cakes, pastries, ice creams and delicious desserts
                        delivered to your doorstep.
                    </p>

                    <button className="hero-btn" onClick={() => navigate("/login")}>
                        Order Now
                    </button>

                </div>

            </section>

            <section className="search-section">

                <input
                    type="text"
                    placeholder="Search Desserts..."
                    value={search}
                    onChange={(e)=>setSearch(e.target.value)}
                />

            </section>

            <section className="desserts-container">

                <div className="title">

                    <h2>Popular Desserts</h2>

                    <p>Sweet treats everyone loves</p>

                </div>

                <div className="desserts-grid">

                    {filteredDesserts.map((item)=>(

                        <div
                            className="desserts-card"
                            key={item.id}
                        >

                            <img
                                src={item.image}
                                alt={item.name}
                            />

                            <div className="desserts-info">

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

export default Desserts;