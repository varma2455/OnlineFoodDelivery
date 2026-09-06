import React from "react";
import "./DashboardFooterFeatures.css";

import {
    FaMotorcycle,
    FaShieldAlt,
    FaHamburger,
    FaHeadset,
    FaArrowRight
} from "react-icons/fa";

const features = [

    {
        id:1,
        title:"Fast Delivery",
        description:"Hot and fresh food delivered within 30 minutes.",
        icon:<FaMotorcycle />,
        color:"#6C63FF"
    },

    {
        id:2,
        title:"Secure Payment",
        description:"100% secure online payment with trusted gateways.",
        icon:<FaShieldAlt />,
        color:"#00C896"
    },

    {
        id:3,
        title:"Fresh Food",
        description:"Prepared using premium quality ingredients every day.",
        icon:<FaHamburger />,
        color:"#FF8A00"
    },

    {
        id:4,
        title:"24/7 Support",
        description:"Our support team is available anytime to help you.",
        icon:<FaHeadset />,
        color:"#FF5C8A"
    }

];

const DashboardFooterFeatures = () => {

    return (

        <section className="footer-features">

            <div className="footer-header">

                <div>

                    <h2>
                        Why Choose FoodExpress?
                    </h2>

                    <p>
                        Premium food delivery experience built for everyone.
                    </p>

                </div>

            </div>

            <div className="features-grid">

                {

                    features.map((feature)=>(

                        <div
                            className="feature-card"
                            key={feature.id}
                        >

                            <div
                                className="feature-icon"
                                style={{
                                    background:feature.color
                                }}
                            >

                                {feature.icon}

                            </div>

                            <h3>

                                {feature.title}

                            </h3>

                            <p>

                                {feature.description}

                            </p>

                            <button>

                                Learn More

                                <FaArrowRight/>

                            </button>

                        </div>

                    ))

                }

            </div>

        </section>

    );

};

export default DashboardFooterFeatures;