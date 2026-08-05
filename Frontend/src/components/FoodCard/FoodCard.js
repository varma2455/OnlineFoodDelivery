import "./FoodCard.css";

import {FaStar} from "react-icons/fa";

export default function FoodCard({food}){

return(

<div className="foodCard">

<img

src={food.image}

alt=""

/>

<div className="foodInfo">

<h3>

{food.name}

</h3>

<p>

⭐ {food.rating}

</p>

<div className="foodBottom">

<h2>

₹{food.price}

</h2>

<button>

Add

</button>

</div>

</div>

</div>

);

}