import "./Hero.css";
import { Link } from "react-router-dom";

const Hero = () => {

    return (

        <section className="hero1">

            <div className="hero-overlay1">

                <div className="hero-content1">

                    <h1>
                        Delicious Food,
                        Delivered To Your Doorstep
                    </h1>

                    <p>

                        Order from your favourite restaurants
                        and enjoy fresh, hot, and tasty meals
                        delivered quickly anywhere in your city.

                    </p>

                    <div className="hero-buttons1">

                        <Link
                            to="/menu"
                            className="order-btn1"
                        >
                            Order Now
                        </Link>

                        <Link
                            to="/register"
                            className="signup-btn1"
                        >
                            Join Now
                        </Link>

                    </div>

                    <div className="hero-features1">

                        <div className="feature-card1">
                            🍔
                            <h3>100+</h3>
                            <span>Food Items</span>
                        </div>

                        <div className="feature-card1">
                            🚚
                            <h3>30 Min</h3>
                            <span>Fast Delivery</span>
                        </div>

                        <div className="feature-card1">
                            ⭐
                            <h3>4.9</h3>
                            <span>Customer Rating</span>
                        </div>

                        <div className="feature-card1">
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