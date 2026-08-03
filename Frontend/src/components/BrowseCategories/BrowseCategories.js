import "./BrowseCategories.css";
import {
  FaPizzaSlice,
  FaHamburger,
  FaDrumstickBite,
  FaIceCream,
  FaGlassWhiskey,
  FaLeaf,
} from "react-icons/fa";
import { GiNoodles } from "react-icons/gi";

import CategoryCard from "./CategoryCard";

const categories = [
  {
    id: 1,
    title: "Pizza",
    icon: <FaPizzaSlice />,
    items: "120 Items",
    color: "#FF6B35",
  },
  {
    id: 2,
    title: "Burger",
    icon: <FaHamburger />,
    items: "98 Items",
    color: "#FFC107",
  },
  {
    id: 3,
    title: "Biryani",
    icon: <FaDrumstickBite />,
    items: "82 Items",
    color: "#EF4444",
  },
  {
    id: 4,
    title: "Noodles",
    icon: <GiNoodles />,
    items: "60 Items",
    color: "#F97316",
  },
  {
    id: 5,
    title: "Drinks",
    icon: <FaGlassWhiskey />,
    items: "50 Items",
    color: "#06B6D4",
  },
  {
    id: 6,
    title: "Desserts",
    icon: <FaIceCream />,
    items: "40 Items",
    color: "#EC4899",
  },
  {
    id: 7,
    title: "Salads",
    icon: <FaLeaf />,
    items: "25 Items",
    color: "#22C55E",
  },
];

export default function BrowseCategories() {
  return (
    <section className="browseCategories">

      <div className="sectionHeading">

        <div>
          <h2>Browse Categories</h2>
          <p>Choose your favourite food</p>
        </div>

        <button className="viewAllBtn">
          View All
        </button>

      </div>

      <div className="categoryContainer">

        {categories.map((category) => (

          <CategoryCard
            key={category.id}
            title={category.title}
            icon={category.icon}
            items={category.items}
            color={category.color}
            active={category.id === 1}
            onClick={() => console.log(category.title)}
          />

        ))}

      </div>

    </section>
  );
}