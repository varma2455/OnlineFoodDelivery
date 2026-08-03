import "./CouponCenter.css";
import { FaCopy } from "react-icons/fa";

export default function CouponCard({coupon}){

return(

<div
className="couponCard"
style={{
"--accent":coupon.color
}}
>

<div className="couponTop">

<div className="couponIcon">

{coupon.icon}

</div>

<span>

{coupon.discount}

</span>

</div>

<h3>

{coupon.code}

</h3>

<p>

{coupon.condition}

</p>

<button>

<FaCopy/>

Copy Code

</button>

</div>

);

}