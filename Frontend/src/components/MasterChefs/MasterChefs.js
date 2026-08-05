import "./MasterChefs.css";
import ChefCard from "./ChefCard";

const chefs = [
  {
    id: 1,
    name: "Marco Rossi",
    image: "/images/chefs/chef1.jpg",
    specialty: "Italian Cuisine",
    experience: "18 Years",
    dishes: "240 Recipes",
    rating: "4.9",
    color: "#FF6B35"
  },
  {
    id: 2,
    name: "Ahmed Khan",
    image: "/images/chefs/chef2.jpg",
    specialty: "Indian Cuisine",
    experience: "15 Years",
    dishes: "180 Recipes",
    rating: "5.0",
    color: "#6C63FF"
  },
  {
    id: 3,
    name: "Sakura Ito",
    image: "/images/chefs/chef3.jpg",
    specialty: "Japanese Cuisine",
    experience: "20 Years",
    dishes: "300 Recipes",
    rating: "4.8",
    color: "#EC4899"
  },
  {
    id: 4,
    name: "John Williams",
    image: "/images/chefs/chef4.jpg",
    specialty: "American Grill",
    experience: "12 Years",
    dishes: "150 Recipes",
    rating: "4.9",
    color: "#10B981"
  }
];

export default function MasterChefs() {
  return (
    <section className="masterChefs">

      <div className="chefHeader">

        <span>👨‍🍳 OUR EXPERTS</span>

        <h2>
          Meet Our Master Chefs
        </h2>

        <p>
          Passionate chefs crafting unforgettable dining experiences.
        </p>

      </div>

      <div className="chefGrid">

        {chefs.map(chef => (
          <ChefCard
            key={chef.id}
            chef={chef}
          />
        ))}

      </div>

    </section>
  );
}