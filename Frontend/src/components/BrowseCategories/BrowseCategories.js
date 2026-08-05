import "./BrowseCategories.css";

import CategoryCard from "/home/kali2455/Desktop/OnlineFoodDelivery/Frontend/src/components/BrowseCategories/CategoryCard.js";

const categories = [

{
name:"Pizza",
icon:"🍕",
color:"#FFE5E5"
},

{
name:"Burger",
icon:"🍔",
color:"#FFF4D9"
},

{
name:"Biryani",
icon:"🍛",
color:"#FFE8C7"
},

{
name:"Fast Food",
icon:"🍟",
color:"#FFF2D6"
},

{
name:"Drinks",
icon:"🥤",
color:"#E5F7FF"
},

{
name:"Desserts",
icon:"🍰",
color:"#FFE8F3"
},

{
name:"Salads",
icon:"🥗",
color:"#E8FFE5"
},

{
name:"Noodles",
icon:"🍜",
color:"#FFF1DA"
}

];

export default function BrowseCategories(){

return(

<section className="browseCategories">

<h2>Browse Categories</h2>

<div className="categoryRow">

{

categories.map((item,index)=>(

<CategoryCard

key={index}

item={item}

/>

))

}

</div>

</section>

);

}