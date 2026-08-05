import "./CategoryCard.css";

export default function CategoryCard({item}){

return(

<div
className="categoryCard"
style={{
background:item.color
}}
>

<div className="emoji">

{item.icon}

</div>

<h4>

{item.name}

</h4>

</div>

);

}