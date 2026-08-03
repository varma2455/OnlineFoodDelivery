import "./ChefSpecial.css";
import ChefDishCard from "./ChefDishCard";
// import chef from "../../assets/chef.png";

const dishes = [
  {
    id: 1,
    name: "Truffle Mushroom Pizza",
    image: "/images/truffle-pizza.jpg",
    price: 499,
    rating: 4.9,
  },
  {
    id: 2,
    name: "Creamy Alfredo Pasta",
    image: "/images/pasta.jpg",
    price: 399,
    rating: 4.8,
  },
  {
    id: 3,
    name: "Smoked Chicken Steak",
    image: "/images/steak.jpg",
    price: 599,
    rating: 5.0,
  },
];

export default function ChefSpecial() {
  return (
    <section className="chefSpecial">

      <div className="chefLeft">

        <span className="chefBadge">
          👨‍🍳 Chef's Choice
        </span>

        <h2>
          Signature Dishes
          <span> Crafted With Passion</span>
        </h2>

        <p>
          Every recipe is carefully prepared by our award-winning chefs
          using premium ingredients and authentic flavours.
        </p>

        <button>
          Explore Menu →
        </button>

      </div>

      <div className="chefCenter">

        {/* <img src={chef} alt="Chef" /> */}

      </div>

      <div className="chefRight">

        {dishes.map((dish) => (

          <ChefDishCard
            key={dish.id}
            dish={dish}
          />

        ))}

      </div>

    </section>
  );
}