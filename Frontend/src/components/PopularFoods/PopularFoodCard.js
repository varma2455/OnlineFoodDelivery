import "./PopularFoods.css";
import {
  FaHeart,
  FaStar,
  FaClock,
  FaShoppingCart,
} from "react-icons/fa";

export default function PopularFoodCard({ food }) {
  return (
    <div className={`popularCard ${food.size}`}>

      <span className="offerTag">
        {food.offer}
      </span>

      <button className="favoriteBtn">
        <FaHeart />
      </button>

      <img
        src={food.image}
        alt={food.name}
      />

      <div className="popularInfo">

        <h3>{food.name}</h3>

        <div className="meta">

          <span>
            <FaStar />
            {food.rating}
          </span>

          <span>
            <FaClock />
            {food.time}
          </span>

        </div>

        <div className="bottomRow">

          <h2>₹{food.price}</h2>

          <button>
            <FaShoppingCart />
          </button>

        </div>

      </div>

    </div>
  );
}