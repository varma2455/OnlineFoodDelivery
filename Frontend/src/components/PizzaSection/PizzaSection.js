import React from "react";
import "./PizzaSection.css";
import pizzaData from "./pizzaData";

import {
FaStar,
FaClock,
FaHeart,
FaShoppingCart
} from "react-icons/fa";

const PizzaSection=()=>{

return(

<section className="pizza-section">

<div className="pizza-header">

<h2>🍕 Popular Pizzas</h2>

<p>
Freshly baked pizzas from your favourite restaurants
</p>

</div>

<div className="pizza-grid">

{pizzaData.map((pizza)=>(

<div className="pizza-card" key={pizza.id}>

<div className="pizza-image">

<img
src={pizza.image}
alt={pizza.name}
/>

<button className="wishlist">

<FaHeart/>

</button>

</div>

<div className="pizza-content">

<h3>{pizza.name}</h3>

<p className="restaurant">

🏪 {pizza.restaurant}

</p>

<div className="pizza-info">

<span>

<FaStar className="star"/>

{pizza.rating}

</span>

<span>

<FaClock/>

{pizza.delivery}

</span>

</div>

<div className="bottom">

<h2>

₹{pizza.price}

</h2>

<button>

<FaShoppingCart/>

Add

</button>

</div>

</div>

</div>

))}

</div>

</section>

)

}

export default Pizza;