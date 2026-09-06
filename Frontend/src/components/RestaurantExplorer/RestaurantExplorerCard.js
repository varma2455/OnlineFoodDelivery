import "./RestaurantExplorer.css";
import {
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight
} from "react-icons/fa";

export default function RestaurantExplorerCard({ restaurant }) {

  return (

    <div className="restaurantExplorerCard">

      <div className="restaurantImage">

        <img
          src={restaurant.image}
          alt={restaurant.name}
        />

        <span>{restaurant.offer}</span>

      </div>

      <div className="restaurantContent">

        <h3>{restaurant.name}</h3>

        <p>{restaurant.cuisine}</p>

        <div className="restaurantInfo">

          <span>
            <FaStar />
            {restaurant.rating}
          </span>

          <span>
            <FaClock />
            {restaurant.delivery}
          </span>

          <span>
            <FaMapMarkerAlt />
            {restaurant.distance}
          </span>

        </div>

        <button>

          Explore Restaurant

          <FaArrowRight />

        </button>

      </div>

    </div>

  );

}