import "./BrowseTrending.css";

import {
  FaStar,
  FaClock,
  FaHeart,
  FaShoppingCart,
} from "react-icons/fa";

export default function TrendingCard({ food }) {
  return (
    <div className="trendingCard">

      <span className="offer">

        {food.offer}

      </span>

      <button className="heart">

        <FaHeart />

      </button>

      <img
        src={food.image}
        alt={food.title}
      />

      <div className="trendingContent">

        <h3>{food.title}</h3>

        <div className="rating">

          <FaStar />

          {food.rating}

        </div>

        <div className="delivery">

          <FaClock />

          {food.time}

        </div>

        <div className="bottom">

          <h2>

            ₹{food.price}

          </h2>

          <button>

            <FaShoppingCart />

          </button>

        </div>

      </div>

    </div>
  );
}