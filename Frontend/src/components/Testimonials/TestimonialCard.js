import "./Testimonials.css";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

export default function TestimonialCard({ review }) {
  return (
    <div className="testimonialCard">

      <FaQuoteLeft className="quoteIcon" />

      <p className="reviewText">
        {review.review}
      </p>

      <div className="reviewStars">

        {[...Array(review.rating)].map((_, i) => (
          <FaStar key={i} />
        ))}

      </div>

      <div className="customer">

        <img
          src={review.image}
          alt={review.name}
        />

        <div>

          <h3>{review.name}</h3>

          <span>{review.location}</span>

        </div>

      </div>

    </div>
  );
}