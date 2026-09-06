import "./BrowseHeader.css";

import {

FaSearch,
FaMapMarkerAlt,
FaBell

} from "react-icons/fa";

export default function BrowseHeader(){

return(

<header className="browseHeader">

<div className="location">

<FaMapMarkerAlt/>

<span>Bhimavaram</span>

</div>

<div className="searchBox">

<FaSearch/>

<input

placeholder="Search Pizza, Burger, Biryani..."

 />

</div>

<div className="headerRight">

<FaBell/>

<img

src="https://i.pravatar.cc/150?img=8"

alt="profile"

/>

</div>

</header>

);

}