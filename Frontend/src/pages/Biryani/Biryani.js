import React, { useState } from "react";
import "./Biryani.css";
import { biryaniData } from "./biryaniData";

import { useNavigate } from "react-router-dom";

const Biryani = () => {

    const navigate = useNavigate();
    
    const [search, setSearch] = useState("");

    const filteredBiryani = biryaniData.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (

        <div className="biryani-page">

            <section className="biryani-hero">

                <div className="hero-content">

                    <h1>🍗 Biryani World</h1>

                    <p>
                        Taste the authentic flavours of Hyderabadi,
                        Dum, Chicken and Mutton Biryani.
                    </p>

                    <button className="hero-btn" onClick={() => navigate("/login")}>
                        Order Now
                    </button>

                    

                </div>

            </section>

            <section className="search-section">

                <input
                    type="text"
                    placeholder="Search Biryani..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

            </section>

            <section className="biryani-container">

                <div className="title">

                    <h2>Popular Biryanis</h2>

                    <p>Best selling biryanis near you</p>

                </div>

                <div className="biryani-grid">

                    {filteredBiryani.map((item) => (

                        <div
                            className="biryani-card"
                            key={item.id}
                        >

                            <img
                                src={item.image}
                                alt={item.name}
                            />

                            <div className="biryani-info">

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

export default Biryani;