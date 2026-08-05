import "./Newsletter.css";

import {
FaPaperPlane,
FaGift,
FaBell,
FaCheckCircle
} from "react-icons/fa";

export default function Newsletter(){

return(

<section className="newsletter">

<div className="newsletterLeft">

<span>

🎁 EXCLUSIVE OFFERS

</span>

<h1>

Never Miss

Amazing Deals

</h1>

<p>

Subscribe to FoodExpress and receive

exclusive discounts, cashback,

birthday gifts, and early access

to premium offers.

</p>

<div className="newsletterFeatures">

<div>

<FaGift/>

Special Coupons

</div>

<div>

<FaBell/>

Instant Notifications

</div>

<div>

<FaCheckCircle/>

VIP Membership Offers

</div>

</div>

</div>

<div className="newsletterRight">

<div className="subscribeCard">

<h2>

Join 1,20,000+

Food Lovers

</h2>

<p>

Subscribe to our newsletter.

</p>

<div className="inputBox">

<input

type="email"

placeholder="Enter your email"

/>

<button>

<FaPaperPlane/>

Subscribe

</button>

</div>

<div className="stats">

<div>

<h3>

1.2L+

</h3>

<p>

Subscribers

</p>

</div>

<div>

<h3>

350+

</h3>

<p>

Daily Offers

</p>

</div>

<div>

<h3>

4.9★

</h3>

<p>

Rating

</p>

</div>

</div>

</div>

</div>

</section>

);

}