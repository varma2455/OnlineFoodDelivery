import "./BrowseSidebar.css";

import {

FaHome,
FaUtensils,
FaShoppingCart,
FaClipboardList,
FaHeart,
FaWallet,
FaPercent,
FaGift,
FaCog

} from "react-icons/fa";

import { NavLink } from "react-router-dom";

export default function BrowseSidebar(){

return(

<aside className="browseSidebar">

<div className="logo">

🍽️ Foodie

</div>

<nav>

<NavLink to="/dashboard">

<FaHome/>

Dashboard

</NavLink>

<NavLink to="/browse-food">

<FaUtensils/>

Browse Food

</NavLink>

<NavLink to="/orders">

<FaClipboardList/>

Orders

</NavLink>

<NavLink to="/cart">

<FaShoppingCart/>

Cart

</NavLink>

<NavLink to="/wishlist">

<FaHeart/>

Wishlist

</NavLink>

<NavLink to="/wallet">

<FaWallet/>

Wallet

</NavLink>

<NavLink to="/offers">

<FaPercent/>

Offers

</NavLink>

<NavLink to="/rewards">

<FaGift/>

Rewards

</NavLink>

<NavLink to="/settings">

<FaCog/>

Settings

</NavLink>

</nav>

</aside>

);

}