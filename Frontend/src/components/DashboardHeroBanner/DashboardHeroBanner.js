import React from "react";
import "./DashboardHeroBanner.css";

import { FaArrowRight } from "react-icons/fa";

const DashboardHeroBanner = () => {

    return (

        <section className="dashboard-hero">

            {/* Left Content */}

            <div className="hero-content">

                <span className="hero-tag">
                    🔥 Today's Special
                </span>

                <h1>
                    Delicious Food <br />
                    Delivered To <br />
                    Your Doorstep
                </h1>

                <p>
                    Order from your favourite restaurants and enjoy
                    fresh meals delivered in just a few minutes.
                    Fast, safe and affordable.
                </p>

                <div className="hero-buttons">

                    <button className="order-btn">

                        Order Now

                        <FaArrowRight />

                    </button>

                    <button className="menu-btn">

                        Explore Menu

                    </button>

                </div>

                <div className="hero-stats">

                    <div>

                        <h3>500+</h3>

                        <span>Restaurants</span>

                    </div>

                    <div>

                        <h3>25K+</h3>

                        <span>Customers</span>

                    </div>

                    <div>

                        <h3>4.9 ★</h3>

                        <span>Ratings</span>

                    </div>

                </div>

            </div>

            {/* Right Content */}

            <div className="hero-image">

                <img
                    src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900"
                    alt="Pizza"
                />

                <div className="floating-card card-one">

                    <h4>🍕 Pizza</h4>

                    <p>₹299</p>

                </div>

                <div className="floating-card card-two">

                    <h4>🚚 Delivery</h4>

                    <p>15 Minutes</p>

                </div>

                <div className="floating-card card-three">

                    <h4>⭐ Rating</h4>

                    <p>4.9/5</p>

                </div>

            </div>

        </section>

    );

};

export default DashboardHeroBanner;