import "./BrowseCategories.css";

import CategoryCard from "./CategoryCard";

const categories = [

    {
        name:"Pizza",
        icon:"🍕",
        color:"#FFE5E5",
        link:"/order-pizza"
    },

    {
        name:"Burger",
        icon:"🍔",
        color:"#FFF4D9",
        link:"/order-burger"
    },

    {
        name:"Biryani",
        icon:"🍛",
        color:"#FFE8C7",
        link:"/category/biryani"
    },

    {
        name:"Fast Food",
        icon:"🍟",
        color:"#FFF2D6",
        link:"/category/fast-food"
    },

    {
        name:"Drinks",
        icon:"🥤",
        color:"#E5F7FF",
        link:"/category/drinks"
    },

    {
        name:"Desserts",
        icon:"🍰",
        color:"#FFE8F3",
        link:"/category/desserts"
    },

    {
        name:"Salads",
        icon:"🥗",
        color:"#E8FFE5",
        link:"/category/salads"
    },

    {
        name:"Noodles",
        icon:"🍜",
        color:"#FFF1DA",
        link:"/category/noodles"
    }

];


export default function BrowseCategories(){

    return(

        <section className="browseCategories">

            <h2>
                Browse Categories
            </h2>

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