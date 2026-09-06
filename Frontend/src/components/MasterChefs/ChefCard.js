import "./MasterChefs.css";

import {
FaInstagram,
FaFacebook,
FaTwitter,
FaStar
} from "react-icons/fa";

export default function ChefCard({chef}){

return(

<div
className="chefCard"
style={{
"--accent":chef.color
}}
>

<div className="chefImage">

<img
src={chef.image}
alt={chef.name}
/>

<div className="chefSocial">

<FaFacebook/>

<FaInstagram/>

<FaTwitter/>

</div>

</div>

<div className="chefInfo">

<h2>

{chef.name}

</h2>

<h4>

{chef.specialty}

</h4>

<div className="chefStats">

<div>

<h3>

{chef.experience}

</h3>

<p>

Experience

</p>

</div>

<div>

<h3>

{chef.dishes}

</h3>

<p>

Recipes

</p>

</div>

<div>

<h3>

<FaStar/>

{chef.rating}

</h3>

<p>

Rating

</p>

</div>

</div>

<button>

View Profile

</button>

</div>

</div>

);

}