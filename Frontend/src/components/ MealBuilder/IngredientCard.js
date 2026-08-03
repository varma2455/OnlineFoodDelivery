import "./MealBuilder.css";

import { FaPlus } from "react-icons/fa";

export default function IngredientCard({item,onAdd}){

return(

<div className="ingredientCard">

<img
src={item.image}
alt=""
/>

<h3>

{item.name}

</h3>

<p>

₹{item.price}

</p>

<span>

{item.calories} kcal

</span>

<button

onClick={onAdd}

>

<FaPlus/>

Add

</button>

</div>

);

}