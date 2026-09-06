import "./LiveTracking.css";

import {
    FaMotorcycle,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaComments,
    FaLocationArrow
} from "react-icons/fa";

import DeliveryTimeline from "./DeliveryTimeline";

export default function LiveTracking(){

return(

<section className="liveTracking">

<div className="trackingHeader">

<div>

<span className="trackingBadge">

🚴 Live Tracking

</span>

<h2>

Track Your Order

in Real Time

</h2>

<p>

Watch your food travel from the restaurant to your doorstep.

</p>

</div>

<div className="etaCard">

<h3>

Estimated Arrival

</h3>

<h1>

18 min

</h1>

</div>

</div>

<div className="trackingContainer">

<div className="mapCard">

<img

src="/images/map.png"

alt="Map"

/>

<div className="deliveryBoy">

<FaMotorcycle/>

</div>

<div className="destination">

<FaLocationArrow/>

</div>

</div>

<div className="deliveryDetails">

<DeliveryTimeline/>

<div className="driverCard">

<img
src="/images/driver.jpg"
alt=""
/>

<div>

<h3>

Rahul Sharma

</h3>

<p>

Delivery Partner

</p>

</div>

<div className="driverButtons">

<button>

<FaPhoneAlt/>

</button>

<button>

<FaComments/>

</button>

</div>

</div>

</div>

</div>

</section>

);

}