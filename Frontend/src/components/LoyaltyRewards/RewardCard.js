import "./LoyaltyRewards.css";

export default function RewardCard({item}){

return(

<div
className="rewardCard"
style={{
"--accent":item.color
}}
>

<div className="rewardIcon">

{item.icon}

</div>

<div>

<h4>

{item.title}

</h4>

<h2>

{item.value}

</h2>

</div>

</div>

);

}