import "./RestaurantExplorer.css";
import RestaurantExplorerCard from "./RestaurantExplorerCard";

const restaurants = [
  {
    id: 1,
    name: "Pizza Palace",
    image: "/images/restaurants/pizza-palace.jpg",
    cuisine: "Italian",
    rating: 4.9,
    delivery: "20-25 min",
    distance: "2.1 km",
    offer: "40% OFF"
  },
  {
    id: 2,
    name: "Royal Biryani",
    image: "/images/restaurants/biryani-house.jpg",
    cuisine: "Indian",
    rating: 4.8,
    delivery: "18-22 min",
    distance: "1.4 km",
    offer: "FREE DELIVERY"
  },
  {
    id: 3,
    name: "Burger Hub",
    image: "/images/restaurants/burger-house.jpg",
    cuisine: "Fast Food",
    rating: 4.7,
    delivery: "15-18 min",
    distance: "1.8 km",
    offer: "BUY 1 GET 1"
  }
];

export default function RestaurantExplorer() {
  return (
    <section className="restaurantExplorer">

      <div className="explorerHeader">

        <span>🍽 Restaurant Explorer</span>

        <h2>Explore Restaurants Near You</h2>

        <p>
          Discover the highest rated restaurants with immersive previews.
        </p>

      </div>

      <div className="restaurantExplorerGrid">

        {restaurants.map((restaurant) => (
          <RestaurantExplorerCard
            key={restaurant.id}
            restaurant={restaurant}
          />
        ))}

      </div>

    </section>
  );
}