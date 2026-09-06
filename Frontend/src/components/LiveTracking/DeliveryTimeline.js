import "./LiveTracking.css";

export default function DeliveryTimeline(){

return(

<div className="timeline">

<div className="step active">

<div className="circle"></div>

<div>

<h4>

Order Confirmed

</h4>

<p>

Restaurant accepted your order

</p>

</div>

</div>

<div className="step active">

<div className="circle"></div>

<div>

<h4>

Preparing Food

</h4>

<p>

Your meal is being cooked

</p>

</div>

</div>

<div className="step active">

<div className="circle"></div>

<div>

<h4>

Picked Up

</h4>

<p>

Delivery partner picked up the order

</p>

</div>

</div>

<div className="step">

<div className="circle"></div>

<div>

<h4>

Delivered

</h4>

<p>

Enjoy your meal ❤️

</p>

</div>

</div>

</div>

);

}