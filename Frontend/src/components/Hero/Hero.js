import "./Hero.css";
import { Link } from "react-router-dom";

const Hero = () => {

    return (

        <section className="hero">

            <div className="hero-overlay">

                <div className="hero-content">

                    <h1>
                        Delicious Food,
                        Delivered To Your Doorstep
                    </h1>

                    <p>

                        Order from your favourite restaurants
                        and enjoy fresh, hot, and tasty meals
                        delivered quickly anywhere in your city.

                    </p>

                    <div className="hero-buttons">

                        <Link
                            to="/menu"
                            className="order-btn"
                        >
                            Order Now
                        </Link>

                        <Link
                            to="/register"
                            className="signup-btn"
                        >
                            Join Now
                        </Link>

                    </div>

                    <div className="hero-features">

                        <div className="feature-card">
                            🍔
                            <h3>100+</h3>
                            <span>Food Items</span>
                        </div>

                        <div className="feature-card">
                            🚚
                            <h3>30 Min</h3>
                            <span>Fast Delivery</span>
                        </div>

                        <div className="feature-card">
                            ⭐
                            <h3>4.9</h3>
                            <span>Customer Rating</span>
                        </div>

                        <div className="feature-card">
                            👨‍🍳
                            <h3>50+</h3>
                            <span>Top Restaurants</span>
                        </div>

                    </div>

                </div>

            </div>

        </section>

    );

};

export default Hero;