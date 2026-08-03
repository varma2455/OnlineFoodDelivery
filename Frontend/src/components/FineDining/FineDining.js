import "./FineDining.css";
import DiningCard from "./DiningCard";

const experiences = [
  {
    id: 1,
    title: "Rooftop Candle Light",
    image: "/images/dining/rooftop.jpg",
    price: "₹2,499",
    guests: "2 Guests",
    rating: "5.0",
    badge: "Most Romantic"
  },
  {
    id: 2,
    title: "Luxury Family Dinner",
    image: "/images/dining/family.jpg",
    price: "₹4,999",
    guests: "6 Guests",
    rating: "4.9",
    badge: "Popular"
  },
  {
    id: 3,
    title: "Private Chef Experience",
    image: "/images/dining/private-chef.jpg",
    price: "₹8,999",
    guests: "4 Guests",
    rating: "5.0",
    badge: "Premium"
  }
];

export default function FineDining(){

return(

<section className="fineDining">

<div className="fineHeader">

<span>

🍷 Luxury Experience

</span>

<h1>

Fine Dining

Experiences

</h1>

<p>

Book unforgettable dining moments curated by our master chefs.

</p>

</div>

<div className="diningGrid">

{

experiences.map(item=>

<DiningCard

key={item.id}

item={item}

/>

)

}

</div>

</section>

);

}