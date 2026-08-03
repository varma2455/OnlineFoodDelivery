import "./FloatingCart.css";

import {
  FaShoppingCart,
  FaArrowRight,
  FaMotorcycle,
  FaTag,
  FaTimes
} from "react-icons/fa";

export default function FloatingCart(){

return(

<div className="floatingCart">

<div className="cartHeader">

<div className="cartIcon">

<FaShoppingCart/>

</div>

<div>

<h3>

Your Cart

</h3>

<p>

3 Delicious Items

</p>

</div>

<button className="closeBtn">

<FaTimes/>

</button>

</div>

<div className="cartItems">

<div className="cartItem">

<img
src="/images/pizza.jpg"
alt=""
/>

<div>

<h4>

Cheese Pizza

</h4>

<p>

₹299 × 1

</p>

</div>

<span>

₹299

</span>

</div>

<div className="cartItem">

<img
src="/images/burger.jpg"
alt=""
/>

<div>

<h4>

Chicken Burger

</h4>

<p>

₹199 × 2

</p>

</div>

<span>

₹398

</span>

</div>

</div>

<div className="coupon">

<FaTag/>

Coupon Applied

<span>

SAVE50

</span>

</div>

<div className="deliveryInfo">

<FaMotorcycle/>

Delivery in

<b>

18 Minutes

</b>

</div>

<div className="totalRow">

<h3>

Total

</h3>

<h2>

₹697

</h2>

</div>

<button className="checkoutBtn">

Checkout

<FaArrowRight/>

</button>

</div>

);

}