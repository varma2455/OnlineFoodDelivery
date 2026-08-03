import "./FlashSale.css";
import {
 FaShoppingCart,
 FaHeart
} from "react-icons/fa";

export default function FlashCard({item}){

return(

<div className="flashCard">

<span className="discount">

{item.discount}

</span>

<button className="heartBtn">

<FaHeart/>

</button>

<img
src={item.image}
alt={item.name}
/>

<h3>

{item.name}

</h3>

<div className="prices">

<h2>

₹{item.price}

</h2>

<del>

₹{item.oldPrice}

</del>

</div>

<button className="buyBtn">

<FaShoppingCart/>

Buy Now

</button>

</div>

);

}