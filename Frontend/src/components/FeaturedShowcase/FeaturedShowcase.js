import "./FeaturedShowcase.css";
import FoodFeatureCard from "./FoodFeatureCard";

const featured = [
  {
    id:1,
    title:"Cheese Burst Pizza",
    image:"/images/pizza.png",
    price:399,
    color:"#FF6B35"
  },
  {
    id:2,
    title:"Chicken Burger",
    image:"/images/burger.png",
    price:249,
    color:"#FFC107"
  },
  {
    id:3,
    title:"Hyderabadi Biryani",
    image:"/images/biryani.png",
    price:349,
    color:"#8B5CF6"
  }
];

export default function FeaturedShowcase(){

return(

<section className="featuredShowcase">

<div className="featuredTitle">

<span>

⭐ Featured Collection

</span>

<h1>

Most Loved Dishes

</h1>

<p>

Premium dishes selected by our chefs.

</p>

</div>

<div className="featuredCards">

{featured.map(item=>(

<FoodFeatureCard
key={item.id}
item={item}
/>

))}

</div>

</section>

);

}