import "./RestaurantCard.css";

import {

FaStar,
FaMotorcycle,
FaClock

} from "react-icons/fa";

export default function RestaurantCard({restaurant}){

return(

<div className="restaurantCard">

<img

src={restaurant.image}

alt=""

/>

<div className="restaurantInfo">

<h3>

{restaurant.name}

</h3>

<p>

{restaurant.cuisine}

</p>

<div className="restaurantMeta">

<span>

<FaStar/>

{restaurant.rating}

</span>

<span>

<FaClock/>

{restaurant.time}

</span>

</div>

<div className="restaurantBottom">

<h4>

{restaurant.offer}

</h4>

<button>

View

</button>

</div>

</div>

</div>

);

}