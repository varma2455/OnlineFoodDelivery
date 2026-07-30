import "./Category.css";
import { useNavigate } from "react-router-dom";


const categories = [
    {
        id:1,
        name:"Pizza",
        icon:"🍕",
        path:"/pizza"
    },
    {
        id:2,
        name:"Burger",
        icon:"🍔",
        path:"/burger"
    },
    {
        id:3,
        name:"Biryani",
        icon:"🍗",
        path:"/biryani"
    },
    {
        id:4,
        name:"Drinks",
        icon:"🥤",
        path:"/drinks"
    },
    {
        id:5,
        name:"Desserts",
        icon:"🍰",
        path:"/desserts"
    },
    {
        id:6,
        name:"Fast Food",
        icon:"🌮",
        path:"/fastfood"
    },
    {
        id:7,
        name:"Salads",
        icon:"🥗",
        path:"/salads"
    },
    {
        id:8,
        name:"Noodles",
        icon:"🍜",
        path:"/noodles"
    }
];

const Category = ({ selectedCategory, onSelectCategory }) => {

    const navigate = useNavigate();

    return (

        <section className="category-section">

            <div className="category-header">

                <h2>Browse By Category</h2>

                <p>
                    Choose your favourite food category
                </p>

            </div>

            <div className="category-grid">

                {categories.map((category) => (

                    <div
                        key={category.id}
                        className={`category-card ${
                            selectedCategory === category.name
                                ? "active"
                                : ""
                        }`}
                        onClick={() => navigate(category.path)}
                    >

                        <div className="category-icon">

                            {category.icon}

                        </div>

                        <h3>

                            {category.name}

                        </h3>

                    </div>

                ))}

            </div>

        </section>

    );

};

export default Category;