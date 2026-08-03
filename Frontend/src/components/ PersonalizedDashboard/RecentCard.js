import "./PersonalizedDashboard.css";

import {
FaShoppingCart,
FaHeart,
FaStar
} from "react-icons/fa";

export default function RecentCard({item}){

return(

<div className="recentCard">

<div className="imageBox">

<img

src={item.image}

alt=""

/>

<span>

{item.badge}

</span>

</div>

<div className="cardContent">

<h3>

{item.title}

</h3>

<div className="rating">

<FaStar/>

4.9

</div>

<p>

{item.time}

</p>

<div className="bottom">

<h2>

₹{item.price}

</h2>

<div>

<button>

<FaHeart/>

</button>

<button>

<FaShoppingCart/>

</button>

</div>

</div>

</div>

</div>

);

}