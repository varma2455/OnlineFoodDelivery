import "./WorldCuisine.css";
import CountryCard from "./CountryCard";

const countries = [
  {
    id: 1,
    name: "Italy",
    food: "Pizza • Pasta",
    image: "/images/world/italy.jpg",
    flag: "🇮🇹",
    restaurants: "320 Restaurants",
    color: "#16A34A",
  },
  {
    id: 2,
    name: "India",
    food: "Biryani • Curry",
    image: "/images/world/india.jpg",
    flag: "🇮🇳",
    restaurants: "870 Restaurants",
    color: "#F97316",
  },
  {
    id: 3,
    name: "Japan",
    food: "Sushi • Ramen",
    image: "/images/world/japan.jpg",
    flag: "🇯🇵",
    restaurants: "240 Restaurants",
    color: "#EF4444",
  },
  {
    id: 4,
    name: "Mexico",
    food: "Tacos • Burritos",
    image: "/images/world/mexico.jpg",
    flag: "🇲🇽",
    restaurants: "180 Restaurants",
    color: "#22C55E",
  },
  {
    id: 5,
    name: "China",
    food: "Noodles • Dumplings",
    image: "/images/world/china.jpg",
    flag: "🇨🇳",
    restaurants: "450 Restaurants",
    color: "#DC2626",
  },
  {
    id: 6,
    name: "USA",
    food: "Burger • Steak",
    image: "/images/world/usa.jpg",
    flag: "🇺🇸",
    restaurants: "510 Restaurants",
    color: "#2563EB",
  }
];

export default function WorldCuisine(){

return(

<section className="worldCuisine">

<div className="worldHeader">

<span>

🌍 Explore World Cuisine

</span>

<h2>

Taste Every Corner

of the World

</h2>

<p>

Explore authentic dishes from famous countries.

</p>

</div>

<div className="countryGrid">

{

countries.map(country=>

<CountryCard

key={country.id}

country={country}

/>

)

}

</div>

</section>

);

}