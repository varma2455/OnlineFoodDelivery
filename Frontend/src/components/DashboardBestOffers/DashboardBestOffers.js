import React from "react";
import "./DashboardBestOffers.css";

import {
    FaGift,
    FaTag,
    FaMotorcycle,
    FaArrowRight
} from "react-icons/fa";

const offers = [
    {
        id: 1,
        title: "40% OFF",
        subtitle: "On Your First Order",
        coupon: "WELCOME40",
        color: "#6C63FF",
        icon: <FaGift />,
        details: [
            "Valid on first order",
            "Minimum order ₹299",
            "Applicable on all restaurants",
            "Expires in 3 days"
        ]
    },
    {
        id: 2,
        title: "Free Delivery",
        subtitle: "Above ₹499",
        coupon: "FREEDEL",
        color: "#00C896",
        icon: <FaMotorcycle />,
        details: [
            "Free delivery",
            "Orders above ₹499",
            "Unlimited usage",
            "Valid this week"
        ]
    },
    {
        id: 3,
        title: "Buy 1 Get 1",
        subtitle: "Selected Restaurants",
        coupon: "BOGO",
        color: "#FF8A00",
        icon: <FaTag />,
        details: [
            "Selected restaurants",
            "Weekend only",
            "One free item",
            "Limited period offer"
        ]
    }
];

const DashboardBestOffers = () => {

    return (

        <section className="best-offers">

            <div className="offers-header">
                <h2>Best Offers</h2>
                <p>Save more with exclusive coupons</p>
            </div>

            <div className="offers-list">

                {offers.map((offer) => (

                    <div
                        className="offer-card"
                        key={offer.id}
                    >

                        <div className="offer-preview">

                            <div
                                className="offer-icon"
                                style={{
                                    background: offer.color
                                }}
                            >
                                {offer.icon}
                            </div>

                            <div className="offer-info">

                                <h4>{offer.title}</h4>

                                <span>{offer.coupon}</span>

                            </div>

                            <button>

                                Apply

                                <FaArrowRight />

                            </button>

                        </div>

                        <div className="offer-details">

                            <h5>{offer.subtitle}</h5>

                            <ul>

                                {offer.details.map((item, index) => (

                                    <li key={index}>
                                        ✓ {item}
                                    </li>

                                ))}

                            </ul>

                        </div>

                    </div>

                ))}

            </div>

        </section>

    );

};

export default DashboardBestOffers;