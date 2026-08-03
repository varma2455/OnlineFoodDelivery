import "./FlashSale.css";
import FlashCard from "./FlashCard";
import { FaBolt } from "react-icons/fa";

const deals = [
  {
    id: 1,
    name: "Cheese Pizza",
    image: "/images/pizza.jpg",
    price: 199,
    oldPrice: 349,
    discount: "43% OFF",
  },
  {
    id: 2,
    name: "Chicken Burger",
    image: "/images/burger.jpg",
    price: 149,
    oldPrice: 249,
    discount: "40% OFF",
  },
  {
    id: 3,
    name: "Biryani Combo",
    image: "/images/biryani.jpg",
    price: 299,
    oldPrice: 499,
    discount: "50% OFF",
  },
  {
    id: 4,
    name: "Cold Coffee",
    image: "/images/drink.jpg",
    price: 99,
    oldPrice: 179,
    discount: "45% OFF",
  },
];

export default function FlashSale() {
  return (
    <section className="flashSale">

      <div className="flashHeader">

        <div>

          <span className="flashBadge">

            <FaBolt/>

            FLASH SALE

          </span>

          <h2>

            Limited Time Deals

          </h2>

          <p>

            Hurry! Offers expire soon.

          </p>

        </div>

        <div className="timer">

          <div>02 <span>Hrs</span></div>

          <div>45 <span>Min</span></div>

          <div>19 <span>Sec</span></div>

        </div>

      </div>

      <div className="flashGrid">

        {deals.map(item=>(
          <FlashCard
            key={item.id}
            item={item}
          />
        ))}

      </div>

    </section>
  );
}