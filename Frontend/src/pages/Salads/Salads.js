import React, { useState } from "react";
import "./Salads.css";
import { saladsData } from "./saladsData";

import { useNavigate } from "react-router-dom";

const Salads = () => {

    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    const filteredSalads = saladsData.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <div className="salads-page">

            <section className="salads-hero">

                <div className="hero-content">

                    <h1>🥗 Fresh Salads</h1>

                    <p>
                        Healthy, nutritious, and freshly prepared salads
                        made with premium vegetables and ingredients.
                    </p>

                    <button className="hero-btn" onClick={() => navigate("/login")}>
                        Order Now
                    </button>

                </div>

            </section>

            <section className="search-section">

                <input
                    type="text"
                    placeholder="Search Salads..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

            </section>

            <section className="salads-container">

                <div className="title">

                    <h2>Popular Salads</h2>

                    <p>Healthy meals for a better lifestyle</p>

                </div>

                <div className="salads-grid">

                    {filteredSalads.map((item) => (

                        <div
                            className="salads-card"
                            key={item.id}
                        >

                            <img
                                src={item.image}
                                alt={item.name}
                            />

                            <div className="salads-info">

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

export default Salads;