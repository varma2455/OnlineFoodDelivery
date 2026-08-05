import "./WhyChoose.css";
import FeatureCard from "./FeatureCard";

import {
  FaShippingFast,
  FaShieldAlt,
  FaLeaf,
  FaClock,
  FaHeadset,
  FaWallet
} from "react-icons/fa";

const features = [
  {
    id: 1,
    title: "Fast Delivery",
    description: "Get your order in less than 30 minutes.",
    icon: <FaShippingFast />,
    color: "#6C63FF"
  },
  {
    id: 2,
    title: "100% Secure Payment",
    description: "Protected transactions with trusted gateways.",
    icon: <FaShieldAlt />,
    color: "#10B981"
  },
  {
    id: 3,
    title: "Fresh Ingredients",
    description: "Every meal is prepared using premium ingredients.",
    icon: <FaLeaf />,
    color: "#22C55E"
  },
  {
    id: 4,
    title: "24/7 Support",
    description: "Our support team is always available.",
    icon: <FaHeadset />,
    color: "#EC4899"
  },
  {
    id: 5,
    title: "Save More",
    description: "Daily coupons and cashback rewards.",
    icon: <FaWallet />,
    color: "#F97316"
  },
  {
    id: 6,
    title: "Always On Time",
    description: "Track every order in real-time.",
    icon: <FaClock />,
    color: "#3B82F6"
  }
];

export default function WhyChoose() {
  return (
    <section className="whyChoose">

      <div className="whyHeader">

        <span>⭐ Why FoodExpress</span>

        <h2>
          Why Millions Choose Us
        </h2>

        <p>
          Delivering quality, speed and happiness every day.
        </p>

      </div>

      <div className="statsContainer">

        <div className="statCard">
          <h1>15M+</h1>
          <p>Orders Delivered</p>
        </div>

        <div className="statCard">
          <h1>5000+</h1>
          <p>Restaurants</p>
        </div>

        <div className="statCard">
          <h1>1M+</h1>
          <p>Happy Customers</p>
        </div>

        <div className="statCard">
          <h1>4.9★</h1>
          <p>Average Rating</p>
        </div>

      </div>

      <div className="featureGrid">

        {features.map(feature => (

          <FeatureCard
            key={feature.id}
            feature={feature}
          />

        ))}

      </div>

    </section>
  );
}