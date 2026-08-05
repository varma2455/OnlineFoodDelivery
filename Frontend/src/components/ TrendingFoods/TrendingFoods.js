import "./TrendingFoods.css";
import TrendingFoodCard from "../TrendingFoodCard/TrendingFoodCard";

const trending = [

{
name:"Cheese Burst Pizza",
price:349,
rating:"4.9",
offer:"20% OFF",
image:"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900"
},

{
name:"Chicken Burger",
price:199,
rating:"4.8",
offer:"10% OFF",
image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900"
},

{
name:"Paneer Biryani",
price:299,
rating:"4.7",
offer:"30% OFF",
image:"https://images.unsplash.com/photo-1701579231347-3f84a3e1d99d?w=900"
}

];

export default function TrendingFoods(){

return(

<section className="trendingFoods">

<div className="sectionTitle">

<h2>🔥 Trending Foods</h2>

<a href="/">View All</a>

</div>

<div className="trendingGrid">

{

trending.map((item,index)=>(

<TrendingFoodCard

key={index}

food={item}

/>

))

}

</div>

</section>

);

}