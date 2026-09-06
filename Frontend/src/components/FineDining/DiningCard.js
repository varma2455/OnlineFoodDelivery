import "./FineDining.css";

import {
FaStar,
FaUsers,
FaCalendarAlt
} from "react-icons/fa";

export default function DiningCard({item}){

return(

<div className="diningCard">

<div className="imageArea">

<img
src={item.image}
alt=""
/>

<span>

{item.badge}

</span>

</div>

<div className="diningContent">

<h2>

{item.title}

</h2>

<div className="meta">

<span>

<FaUsers/>

{item.guests}

</span>

<span>

<FaStar/>

{item.rating}

</span>

</div>

<h3>

{item.price}

</h3>

<button>

<FaCalendarAlt/>

Reserve Table

</button>

</div>

</div>

);

}