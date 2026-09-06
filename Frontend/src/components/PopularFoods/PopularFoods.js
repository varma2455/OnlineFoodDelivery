import "./PopularFoods.css";
import PopularFoodCard from "./PopularFoodCard";

const foods = [
  {
    id: 1,
    name: "Pepperoni Pizza",
    image: "/images/pizza.jpg",
    price: 299,
    rating: 4.9,
    time: "20 min",
    offer: "30% OFF",
    size: "large",
  },
  {
    id: 2,
    name: "Chicken Burger",
    image: "/images/burger.jpg",
    price: 199,
    rating: 4.8,
    time: "15 min",
    offer: "HOT",
    size: "small",
  },
  {
    id: 3,
    name: "Hyderabadi Biryani",
    image: "/images/biryani.jpg",
    price: 349,
    rating: 5.0,
    time: "25 min",
    offer: "BEST",
    size: "medium",
  },
  {
    id: 4,
    name: "Noodles",
    image: "/images/noodles.jpg",
    price: 179,
    rating: 4.7,
    time: "18 min",
    offer: "NEW",
    size: "large",
  },
  {
    id: 5,
    name: "Chocolate Cake",
    image: "/images/cake.jpg",
    price: 149,
    rating: 4.9,
    time: "12 min",
    offer: "20% OFF",
    size: "medium",
  },
  {
    id: 6,
    name: "Cold Coffee",
    image: "/images/drink.jpg",
    price: 129,
    rating: 4.8,
    time: "10 min",
    offer: "TRENDING",
    size: "small",
  },
];

export default function PopularFoods() {
  return (
    <section className="popularFoods">

      <div className="popularHeader">

        <div>
          <h2>🍽 Popular Foods</h2>
          <p>Most Loved Dishes Near You</p>
        </div>

        <button>Explore More</button>

      </div>

      <div className="masonryGrid">

        {foods.map((food) => (
          <PopularFoodCard
            key={food.id}
            food={food}
          />
        ))}

      </div>

    </section>
  );
}