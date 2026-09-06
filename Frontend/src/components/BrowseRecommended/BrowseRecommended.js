import "./BrowseRecommended.css";
import FoodCard from "./FoodCard";

const foods = [
  {
    id: 1,
    name: "Chicken Cheese Burger",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
    rating: 4.9,
    reviews: 2450,
    time: "20 min",
    price: 249,
    oldPrice: 349,
    badge: "🔥 Bestseller",
  },
  {
    id: 2,
    name: "Italian Pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    rating: 4.8,
    reviews: 1980,
    time: "25 min",
    price: 399,
    oldPrice: 499,
    badge: "20% OFF",
  },
  {
    id: 3,
    name: "Hyderabadi Biryani",
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a",
    rating: 4.9,
    reviews: 3100,
    time: "18 min",
    price: 299,
    oldPrice: 399,
    badge: "⭐ Top Rated",
  },
  {
    id: 4,
    name: "Chinese Noodles",
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d",
    rating: 4.7,
    reviews: 1200,
    time: "22 min",
    price: 199,
    oldPrice: 279,
    badge: "🔥 Trending",
  },
];

export default function BrowseRecommended() {
  return (
    <section className="browseRecommended">

      <div className="recommendHeader">

        <div>
          <h2>✨ Recommended For You</h2>
          <p>Hand-picked meals you'll love</p>
        </div>

        <button>View All</button>

      </div>

      <div className="foodGrid">

        {foods.map(food => (
          <FoodCard key={food.id} food={food} />
        ))}

      </div>

    </section>
  );
}