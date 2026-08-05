import "./BrowseFilters.css";

const filters = [

"All",
"Veg",
"Non Veg",
"Fast Delivery",
"Rating 4+",
"Under ₹300",
"Offers",
"Nearby"

];

export default function BrowseFilters(){

return(

<section className="browseFilters">

{

filters.map((item,index)=>(

<button

key={index}

className={index===0 ? "activeFilter" : ""}

>

{item}

</button>

))

}

</section>

);

}