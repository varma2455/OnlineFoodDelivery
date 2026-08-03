import "./PizzaConfigurator.css";
import { useState } from "react";
import ToppingSelector from "./ToppingSelector";
import PriceSummary from "./PriceSummary";

const toppings = [
  {
    id:1,
    name:"Cheese",
    image:"/images/toppings/cheese.png",
    price:40,
    calories:80
  },
  {
    id:2,
    name:"Pepperoni",
    image:"/images/toppings/pepperoni.png",
    price:70,
    calories:110
  },
  {
    id:3,
    name:"Mushroom",
    image:"/images/toppings/mushroom.png",
    price:35,
    calories:25
  },
  {
    id:4,
    name:"Olives",
    image:"/images/toppings/olive.png",
    price:30,
    calories:15
  },
  {
    id:5,
    name:"Corn",
    image:"/images/toppings/corn.png",
    price:25,
    calories:20
  },
  {
    id:6,
    name:"Paneer",
    image:"/images/toppings/paneer.png",
    price:60,
    calories:90
  }
];

export default function PizzaConfigurator(){

const [selected,setSelected]=useState([]);

const toggle=(item)=>{

if(selected.find(x=>x.id===item.id))
setSelected(selected.filter(x=>x.id!==item.id));

else
setSelected([...selected,item]);

};

return(

<section className="pizzaConfigurator">

<div className="pizzaHeader">

<span>

🍕 Build Your Pizza

</span>

<h1>

Create Your Dream Pizza

</h1>

<p>

Customize every topping and watch the pizza update live.

</p>

</div>

<div className="pizzaLayout">

<div className="pizzaPreview">

<div className="pizzaCircle">

<img
src="/images/pizza-base.png"
alt=""
className="pizzaBase"
/>

{
selected.map(item=>

<img
key={item.id}
src={item.image}
alt=""
className="pizzaTopping"
/>

)
}

</div>

</div>

<div className="pizzaOptions">

{
toppings.map(item=>

<ToppingSelector
key={item.id}
item={item}
selected={selected}
toggle={toggle}
/>

)
}

</div>

<PriceSummary selected={selected}/>

</div>

</section>

);

}