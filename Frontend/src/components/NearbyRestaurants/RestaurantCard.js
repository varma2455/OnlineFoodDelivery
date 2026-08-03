import "./NearbyRestaurants.css";
import {
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaHeart,
} from "react-icons/fa";

export default function RestaurantCard({ restaurant }) {
  return (
    <div className="restaurantCard">

      <div className="restaurantImage">

        <img
          src={restaurant.image}
          alt={restaurant.name}
        />

        <span className="restaurantOffer">
          {restaurant.offer}
        </span>

        <button className="favoriteBtn">
          <FaHeart />
        </button>

      </div>

      <div className="restaurantInfo">

        <div className="restaurantTop">

          <h3>{restaurant.name}</h3>

          <span className="status">
            🟢 {restaurant.status}
          </span>

        </div>

        <p>{restaurant.cuisine}</p>

        <div className="restaurantMeta">

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

        <button className="visitRestaurant">
          View Menu →
        </button>

      </div>

    </div>
  );
}