import "./MobileApp.css";

import {
    FaGooglePlay,
    FaApple,
    FaStar
} from "react-icons/fa";

export default function MobileApp(){

return(

<section className="mobileApp">

<div className="mobileLeft">

<span>

📱 Download Our App

</span>

<h1>

Food Delivered

Faster Than Ever

</h1>

<p>

Download the FoodExpress App and enjoy

exclusive offers, live tracking,

cashback rewards and one-click ordering.

</p>

<div className="stats">

<div>

<h2>1M+</h2>

<p>Downloads</p>

</div>

<div>

<h2>4.9★</h2>

<p>App Rating</p>

</div>

<div>

<h2>500K+</h2>

<p>Daily Orders</p>

</div>

</div>

<div className="storeButtons">

<button>

<FaGooglePlay/>

Google Play

</button>

<button>

<FaApple/>

App Store

</button>

</div>

</div>

<div className="mobileRight">

<img

src="/images/mobile-app.png"

alt="App"

/>

<div className="notification">

🍔

Your Burger

is arriving...

</div>

<div className="ratingCard">

<FaStar/>

4.9 Rating

</div>

</div>

</section>

);

}