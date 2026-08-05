import "./LoyaltyRewards.css";
import RewardCard from "./RewardCard";
import {
  FaCrown,
  FaWallet,
  FaGift,
  FaCoins,
  FaArrowUp
} from "react-icons/fa";

const rewards = [
  {
    id:1,
    title:"Wallet Balance",
    icon:<FaWallet />,
    value:"₹2,450",
    color:"#6366F1"
  },
  {
    id:2,
    title:"Reward Points",
    icon:<FaCoins />,
    value:"12,580",
    color:"#F59E0B"
  },
  {
    id:3,
    title:"Coupons",
    icon:<FaGift />,
    value:"14 Active",
    color:"#10B981"
  },
  {
    id:4,
    title:"Membership",
    icon:<FaCrown />,
    value:"Gold",
    color:"#EC4899"
  }
];

export default function LoyaltyRewards(){

return(

<section className="loyaltyRewards">

<div className="rewardHeader">

<div>

<span>

🏆 Loyalty Program

</span>

<h2>

Your Rewards Dashboard

</h2>

<p>

Earn points on every order and unlock exclusive benefits.

</p>

</div>

<button>

Upgrade

<FaArrowUp/>

</button>

</div>

<div className="membershipCard">

<div className="goldCard">

<div>

<h4>

FOODEXPRESS GOLD

</h4>

<h2>

Member

</h2>

<p>

Free Delivery • Priority Support • Premium Offers

</p>

</div>

<FaCrown className="goldIcon"/>

</div>

</div>

<div className="rewardGrid">

{

rewards.map(item=>

<RewardCard
key={item.id}
item={item}
/>

)

}

</div>

<div className="progressSection">

<div className="progressTop">

<h3>

Progress to Platinum

</h3>

<span>

78%

</span>

</div>

<div className="progressBar">

<div className="progressFill"></div>

</div>

<p>

Only 2,500 more points to become Platinum.

</p>

</div>

</section>

);

}