import "./MealBuilder.css";
import IngredientCard from "./IngredientCard";
import { useState } from "react";

const ingredients = [
  {
    id:1,
    name:"Chicken",
    image:"/images/builder/chicken.png",
    price:120,
    calories:220
  },
  {
    id:2,
    name:"Cheese",
    image:"/images/builder/cheese.png",
    price:40,
    calories:80
  },
  {
    id:3,
    name:"Mushroom",
    image:"/images/builder/mushroom.png",
    price:50,
    calories:30
  },
  {
    id:4,
    name:"Paneer",
    image:"/images/builder/paneer.png",
    price:90,
    calories:150
  },
  {
    id:5,
    name:"Olives",
    image:"/images/builder/olive.png",
    price:30,
    calories:15
  },
  {
    id:6,
    name:"Sweet Corn",
    image:"/images/builder/corn.png",
    price:25,
    calories:40
  }
];

export default function MealBuilder(){

const [selected,setSelected]=useState([]);

const totalPrice=selected.reduce((a,b)=>a+b.price,0);

const totalCalories=selected.reduce((a,b)=>a+b.calories,0);

const addIngredient=(item)=>{

if(selected.find(x=>x.id===item.id)) return;

setSelected([...selected,item]);

};

return(

<section className="mealBuilder">

<div className="builderHeader">

<span>

🥗 Meal Builder

</span>

<h1>

Create Your

Perfect Meal

</h1>

<p>

Choose your favourite ingredients.

</p>

</div>

<div className="builderContainer">

<div className="ingredientGrid">

{

ingredients.map(item=>

<IngredientCard

key={item.id}

item={item}

onAdd={()=>addIngredient(item)}

/>

)

}

</div>

<div className="summaryCard">

<h2>

Your Meal

</h2>

{

selected.map(food=>

<div
key={food.id}
className="selectedItem"
>

<span>

{food.name}

</span>

<span>

₹{food.price}

</span>

</div>

)

}

<hr/>

<div className="summary">

<h3>

Total Price

</h3>

<h2>

₹{totalPrice}

</h2>

</div>

<div className="summary">

<h3>

Calories

</h3>

<h2>

{totalCalories}

kcal

</h2>

</div>

<button>

Add Meal To Cart

</button>

</div>

</div>

</section>

);

}