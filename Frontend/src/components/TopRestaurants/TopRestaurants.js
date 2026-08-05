import "./TopRestaurants.css";

import RestaurantCard from "../RestaurantCard/RestaurantCard";

const restaurants=[

{

name:"Domino's Pizza",

cuisine:"Pizza • Italian",

rating:"4.8",

time:"25 min",

offer:"50% OFF",

image:"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900"

},

{

name:"Burger King",

cuisine:"Burger • Fast Food",

rating:"4.6",

time:"20 min",

offer:"40% OFF",

image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900"

},

{

name:"Paradise",

cuisine:"Biryani",

rating:"4.9",

time:"35 min",

offer:"30% OFF",

image:"https://images.unsplash.com/photo-1701579231347-3f84a3e1d99d?w=900"

}

];

export default function TopRestaurants(){

return(

<section className="topRestaurants">

<div className="titleRow">

<h2>

🏆 Top Restaurants

</h2>

<a href="/restaurants">

View All

</a>

</div>

<div className="restaurantGrid">

{

restaurants.map((item,index)=>(

<RestaurantCard

key={index}

restaurant={item}

/>

))

}

</div>

</section>

);

}