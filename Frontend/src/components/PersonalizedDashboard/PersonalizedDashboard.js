import "./PersonalizedDashboard.css";
import RecentCard from "./RecentCard";
import {
    FaHistory,
    FaRedoAlt,
    FaHeart,
    FaFire
} from "react-icons/fa";

const recentFoods=[
{
id:1,
title:"Chicken Pizza",
image:"/images/pizza.jpg",
price:299,
time:"Ordered Yesterday",
badge:"Order Again"
},
{
id:2,
title:"Burger Combo",
image:"/images/burger.jpg",
price:199,
time:"Viewed Today",
badge:"Recently Viewed"
},
{
id:3,
title:"Hyderabadi Biryani",
image:"/images/biryani.jpg",
price:349,
time:"Favourite",
badge:"Favourite"
},
{
id:4,
title:"Noodles",
image:"/images/noodles.jpg",
price:179,
time:"Trending",
badge:"Trending"
}
];

export default function PersonalizedDashboard(){

return(

<section className="personalized">

<div className="personalHeader">

<div>

<span>

🧠 Personalized For You

</span>

<h2>

Welcome Back,

Yeswanth 👋

</h2>

<p>

Based on your activity, here are your favourite dishes.

</p>

</div>

</div>

<div className="quickActions">

<div>

<FaRedoAlt/>

Order Again

</div>

<div>

<FaHistory/>

Recently Viewed

</div>

<div>

<FaHeart/>

Favorites

</div>

<div>

<FaFire/>

Trending

</div>

</div>

<div className="recentGrid">

{

recentFoods.map(item=>

<RecentCard

key={item.id}

item={item}

/>

)

}

</div>

</section>

);

}