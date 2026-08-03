import "./PizzaConfigurator.css";

export default function PriceSummary({selected}){

const total=selected.reduce((a,b)=>a+b.price,299);

const calories=selected.reduce((a,b)=>a+b.calories,450);

return(

<div className="priceSummary">

<h2>

Order Summary

</h2>

<div>

Base Pizza

<span>

₹299

</span>

</div>

{
selected.map(item=>

<div key={item.id}>

{item.name}

<span>

₹{item.price}

</span>

</div>

)
}

<hr/>

<div className="grand">

Total

<span>

₹{total}

</span>

</div>

<div className="grand">

Calories

<span>

{calories} kcal

</span>

</div>

<button>

Add To Cart

</button>

</div>

);

}