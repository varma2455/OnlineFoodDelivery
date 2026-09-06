import "./BrowseHero.css";

import {
    FaSearch,
    FaArrowRight,
    FaMotorcycle,
    FaStar,
    FaUtensils,
    FaClock
} from "react-icons/fa";

export default function BrowseHero() {

    return (

        <section className="browseHero">

            <div className="heroLeft">

                <span className="offerBadge">
                    🔥 Flat 50% OFF Today
                </span>

                <h1>
                    Discover the
                    <span> Best Food </span>
                    Around You
                </h1>

                <p>

                    Order delicious food from premium restaurants
                    with lightning fast delivery.

                </p>

                <div className="heroSearch">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search Pizza, Burger, Biryani..."
                    />

                    <button>

                        Explore

                        <FaArrowRight />

                    </button>

                </div>

                <div className="heroStats">

                    <div>

                        <FaUtensils />

                        <div>

                            <h3>10K+</h3>

                            <span>Foods</span>

                        </div>

                    </div>

                    <div>

                        <FaMotorcycle />

                        <div>

                            <h3>250+</h3>

                            <span>Restaurants</span>

                        </div>

                    </div>

                    <div>

                        <FaStar />

                        <div>

                            <h3>4.9</h3>

                            <span>Ratings</span>

                        </div>

                    </div>

                    <div>

                        <FaClock />

                        <div>

                            <h3>20 Min</h3>

                            <span>Delivery</span>

                        </div>

                    </div>

                </div>

            </div>

            <div className="heroRight">

                <img
                    src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900"
                    alt="Pizza"
                />

            </div>

        </section>

    );

}