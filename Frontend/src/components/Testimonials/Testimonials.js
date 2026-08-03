import "./Testimonials.css";
import TestimonialCard from "./TestimonialCard";
import { FaStar } from "react-icons/fa";

const reviews = [
  {
    id: 1,
    name: "Rahul Kumar",
    image: "/images/users/user1.jpg",
    rating: 5,
    review:
      "The food was delicious and delivery was super fast. Highly recommended!",
    location: "Hyderabad",
  },
  {
    id: 2,
    name: "Priya Sharma",
    image: "/images/users/user2.jpg",
    rating: 5,
    review:
      "Amazing app! The UI is smooth, and the offers are fantastic.",
    location: "Bangalore",
  },
  {
    id: 3,
    name: "Arjun Patel",
    image: "/images/users/user3.jpg",
    rating: 4,
    review:
      "Great customer service and premium food quality.",
    location: "Mumbai",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials">

      <div className="testimonialHeader">

        <div>

          <span className="smallTitle">

            ❤️ Happy Customers

          </span>

          <h2>

            Loved by Thousands

          </h2>

          <p>

            Trusted by food lovers across India.

          </p>

        </div>

        <div className="ratingSummary">

          <h1>4.9</h1>

          <div className="stars">

            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />
            <FaStar />

          </div>

          <span>

            18,000+ Reviews

          </span>

        </div>

      </div>

      <div className="testimonialGrid">

        {reviews.map((review) => (

          <TestimonialCard
            key={review.id}
            review={review}
          />

        ))}

      </div>

    </section>
  );
}