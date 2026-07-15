import React from "react";
import "./DashboardBestOffers.css";

import {
    FaTag,
    FaGift,
    FaMotorcycle,
    FaArrowRight
} from "react-icons/fa";

const offers = [

    {
        id:1,
        title:"40% OFF",
        subtitle:"On Your First Order",
        coupon:"WELCOME40",
        color:"#6C63FF",
        icon:<FaGift/>
    },

    {
        id:2,
        title:"Free Delivery",
        subtitle:"Above ₹499 Order",
        coupon:"FREEDEL",
        color:"#00C896",
        icon:<FaMotorcycle/>
    },

    {
        id:3,
        title:"Buy 1 Get 1",
        subtitle:"Selected Restaurants",
        coupon:"BOGO",
        color:"#FF8A00",
        icon:<FaTag/>
    }

];

const DashboardBestOffers = () => {

    return (

        <section className="best-offers">

            <div className="offers-header">

                <div>

                    <h2>Best Offers</h2>

                    <p>Save more with exclusive coupons</p>

                </div>

            </div>

            <div className="offers-container">

                {

                    offers.map((offer)=>(

                        <div
                            className="offer-card"
                            key={offer.id}
                            style={{
                                background:offer.color
                            }}
                        >

                            <div className="offer-icon">

                                {offer.icon}

                            </div>

                            <h3>

                                {offer.title}

                            </h3>

                            <p>

                                {offer.subtitle}

                            </p>

                            <div className="coupon-box">

                                {offer.coupon}

                            </div>

                            <button>

                                Apply Coupon

                                <FaArrowRight/>

                            </button>

                        </div>

                    ))

                }

            </div>

        </section>

    );

};

export default DashboardBestOffers;