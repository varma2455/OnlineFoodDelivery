import "./FeaturedShowcase.css";

import {
FaShoppingBag,
FaHeart
} from "react-icons/fa";

export default function FoodFeatureCard({item}){

return(

<div
className="featureCard"
style={{
"--accent":item.color
}}
>

<div className="circle"></div>

<button className="fav">

<FaHeart/>

</button>

<img
src={item.image}
alt=""
/>

<h2>

{item.title}

</h2>

<h3>

₹{item.price}

</h3>

<button className="buy">

<FaShoppingBag/>

Order

</button>

</div>

);

}