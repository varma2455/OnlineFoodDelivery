import "./WorldCuisine.css";
import { FaArrowRight } from "react-icons/fa";

export default function CountryCard({country}){

return(

<div
className="countryCard"
style={{
"--accent":country.color
}}
>

<img

src={country.image}

alt={country.name}

/>

<div className="countryContent">

<h2>

{country.flag}

{country.name}

</h2>

<p>

{country.food}

</p>

<span>

{country.restaurants}

</span>

<button>

Explore

<FaArrowRight/>

</button>

</div>

</div>

);

}