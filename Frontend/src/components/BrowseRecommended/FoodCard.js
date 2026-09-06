import "./BrowseRecommended.css";
import {
  FaHeart,
  FaStar,
  FaShoppingCart,
  FaClock,
} from "react-icons/fa";

export default function FoodCard({ food }) {

  return (

    <div className="foodCard">

      <span className="badge">{food.badge}</span>

      <button className="wishlist">
        <FaHeart />
      </button>

      <img src={food.image} alt={food.name} />

      <div className="foodContent">

        <h3>{food.name}</h3>

        <div className="rating">

          <FaStar />

          <span>{food.rating}</span>

          <small>({food.reviews})</small>

        </div>

        <div className="delivery">

          <FaClock />

          {food.time}

        </div>

        <div className="price">

          <h2>₹{food.price}</h2>

          <del>₹{food.oldPrice}</del>

        </div>

        <button className="cartButton">

          <FaShoppingCart />

          Add To Cart

        </button>

      </div>

    </div>

  );

}