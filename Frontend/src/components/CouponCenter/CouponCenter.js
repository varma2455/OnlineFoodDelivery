import "./CouponCenter.css";
import CouponCard from "./CouponCard";
import {
  FaTicketAlt,
  FaPercentage,
  FaCoins,
  FaGift
} from "react-icons/fa";

const coupons = [
  {
    id:1,
    code:"SAVE100",
    discount:"₹100 OFF",
    condition:"Orders above ₹499",
    color:"#6C63FF",
    icon:<FaPercentage/>
  },
  {
    id:2,
    code:"FREEDEL",
    discount:"Free Delivery",
    condition:"No minimum order",
    color:"#10B981",
    icon:<FaGift/>
  },
  {
    id:3,
    code:"CASHBACK50",
    discount:"₹50 Cashback",
    condition:"Pay using UPI",
    color:"#F97316",
    icon:<FaCoins/>
  }
];

export default function CouponCenter(){

return(

<section className="couponCenter">

<div className="couponHeader">

<div>

<span>

🎁 Special Coupons

</span>

<h2>

Offers Made For You

</h2>

<p>

Apply coupons and save more on every order.

</p>

</div>

<button>

View All

</button>

</div>

<div className="couponGrid">

{
coupons.map(coupon=>

<CouponCard

key={coupon.id}

coupon={coupon}

/>

)
}

</div>

</section>

);

}