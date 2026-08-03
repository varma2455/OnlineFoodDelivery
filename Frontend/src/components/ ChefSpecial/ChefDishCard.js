import "./ChefSpecial.css";
import {
  FaStar,
  FaShoppingCart
} from "react-icons/fa";

export default function ChefDishCard({ dish }) {

  return (

    <div className="chefDishCard">

      <img
        src={dish.image}
        alt={dish.name}
      />

      <div className="dishInfo">

        <h3>{dish.name}</h3>

        <div className="dishRating">

          <FaStar />

          {dish.rating}

        </div>

        <div className="dishBottom">

          <h2>₹{dish.price}</h2>

          <button>

            <FaShoppingCart />

          </button>

        </div>

      </div>

    </div>

  );

}