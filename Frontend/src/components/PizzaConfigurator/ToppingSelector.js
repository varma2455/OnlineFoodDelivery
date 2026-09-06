import "./PizzaConfigurator.css";

export default function ToppingSelector({

item,

selected,

toggle

}){

const active=selected.find(x=>x.id===item.id);

return(

<div
className={`toppingCard ${active?"active":""}`}
onClick={()=>toggle(item)}
>

<img
src={item.image}
alt=""
/>

<div>

<h3>

{item.name}

</h3>

<p>

₹{item.price}

</p>

</div>

</div>

);

}