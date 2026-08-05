import "./NearbyRestaurants.css";
import RestaurantCard from "./RestaurantCard";

const restaurants = [
  {
    id: 1,
    name: "Domino's Pizza",
    image: "/images/dominos.jpg",
    cuisine: "Pizza • Italian",
    rating: 4.8,
    delivery: "20 min",
    distance: "2.3 km",
    offer: "50% OFF",
    status: "Open",
  },
  {
    id: 2,
    name: "KFC",
    image: "/images/kfc.jpg",
    cuisine: "Chicken • Fast Food",
    rating: 4.7,
    delivery: "18 min",
    distance: "1.8 km",
    offer: "Free Delivery",
    status: "Open",
  },
  {
    id: 3,
    name: "Paradise Biryani",
    image: "/images/paradise.jpg",
    cuisine: "Biryani • Indian",
    rating: 4.9,
    delivery: "25 min",
    distance: "3.1 km",
    offer: "20% OFF",
    status: "Open",
  },
  {
    id: 4,
    name: "Subway",
    image: "/images/subway.jpg",
    cuisine: "Healthy • Sandwiches",
    rating: 4.6,
    delivery: "16 min",
    distance: "1.5 km",
    offer: "Buy 1 Get 1",
    status: "Open",
  },
];

export default function NearbyRestaurants() {
  return (
    <section className="nearbyRestaurants">

      <div className="restaurantHeader">

        <div>
          <h2>🏪 Nearby Restaurants</h2>
          <p>Top-rated restaurants around you</p>
        </div>

        <button>View All</button>

      </div>

      <div className="restaurantGrid">

        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
          />
        ))}

      </div>

    </section>
  );
}