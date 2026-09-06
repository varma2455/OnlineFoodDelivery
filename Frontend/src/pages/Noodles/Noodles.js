import React, { useState } from "react";
import "./Noodles.css";
import { noodlesData } from "./noodlesData";

import { useNavigate } from "react-router-dom";

const Noodles = () => {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const filteredNoodles = noodlesData.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = () => {

        alert("Please login first.");
        // User is logged in
        navigate("/login"); // or do nothing if you haven't implemented the cart yet
    };

    return (

        <div className="noodles-page">

            <section className="noodles-hero">

                <div className="hero-content">

                    <h1>🍜 Noodles Corner</h1>

                    <p>
                        Enjoy delicious noodles with authentic Asian flavours,
                        prepared fresh and delivered hot to your doorstep.
                    </p>

                    <button className="hero-btn" onClick={() => navigate("/login")}>
                        Order Now
                    </button>

                </div>

            </section>

            <section className="search-section">

                <input
                    type="text"
                    placeholder="Search Noodles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

            </section>

            <section className="noodles-container">

                <div className="title">

                    <h2>Popular Noodles</h2>

                    <p>Freshly prepared noodle dishes</p>

                </div>

                <div className="noodles-grid">

                    {filteredNoodles.map((item) => (

                        <div
                            className="noodles-card"
                            key={item.id}
                        >

                            <img
                                src={item.image}
                                alt={item.name}
                            />

                            <div className="noodles-info">

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

export default Noodles;