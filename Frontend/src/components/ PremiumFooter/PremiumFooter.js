import "./PremiumFooter.css";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaGooglePlay,
  FaApple,
  FaCcVisa,
  FaCcMastercard,
  FaPaypal,
  FaArrowUp
} from "react-icons/fa";

export default function PremiumFooter(){

const scrollTop=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};

return(

<footer className="premiumFooter">

<div className="wave"></div>

<div className="footerTop">

<div className="brand">

<h1>

🍔 FoodExpress

</h1>

<p>

Delivering happiness,

one delicious meal

at a time.

</p>

<div className="socialIcons">

<FaFacebookF/>

<FaInstagram/>

<FaTwitter/>

<FaLinkedinIn/>

<FaYoutube/>

</div>

</div>

<div>

<h3>

Company

</h3>

<ul>

<li>About</li>

<li>Careers</li>

<li>Blog</li>

<li>Investors</li>

<li>Press</li>

</ul>

</div>

<div>

<h3>

Support

</h3>

<ul>

<li>Help Center</li>

<li>Track Order</li>

<li>Refund</li>

<li>FAQs</li>

<li>Contact</li>

</ul>

</div>

<div>

<h3>

Legal

</h3>

<ul>

<li>Privacy</li>

<li>Terms</li>

<li>Cookies</li>

<li>Security</li>

</ul>

</div>

<div>

<h3>

Download App

</h3>

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

<hr/>

<div className="footerBottom">

<div className="payments">

<FaCcVisa/>

<FaCcMastercard/>

<FaPaypal/>

<span>

UPI

</span>

</div>

<p>

© 2026 FoodExpress.

All Rights Reserved.

</p>

<button

onClick={scrollTop}

className="topBtn"

>

<FaArrowUp/>

</button>

</div>

</footer>

);

}