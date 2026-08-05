import "./TrendingFoodCard.css";
import {FaStar} from "react-icons/fa";

export default function TrendingFoodCard({food}){

return(

<div className="trendCard">

<div className="offer">

{food.offer}

</div>

<img

src={food.image}

alt=""

/>

<div className="trendInfo">

<h3>

{food.name}

</h3>

<p>

<FaStar/>

 {food.rating}

</p>

<div className="trendBottom">

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