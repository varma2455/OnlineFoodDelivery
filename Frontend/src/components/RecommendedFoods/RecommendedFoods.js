import "./RecommendedFoods.css";

import FoodCard from "../FoodCard/FoodCard";

const foods=[

{

name:"Cheese Pizza",

price:299,

rating:"4.9",

image:"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900"

},

{

name:"Chicken Burger",

price:199,

rating:"4.8",

image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900"

},

{

name:"Hyderabadi Biryani",

price:349,

rating:"4.9",

image:"https://images.unsplash.com/photo-1701579231347-3f84a3e1d99d?w=900"

},

{

name:"French Fries",

price:149,

rating:"4.7",

image:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=900"

}

];

export default function RecommendedFoods(){

return(

<section className="recommendedFoods">

<h2>

🔥 Recommended For You

</h2>

<div className="foodGrid">

{

foods.map((food,index)=>(

<FoodCard

key={index}

food={food}

/>

))

}

</div>

</section>

);

}