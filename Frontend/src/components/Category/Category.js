import "./Category.css";

const categories = [
    {
        id: 1,
        name: "Pizza",
        icon: "🍕"
    },
    {
        id: 2,
        name: "Burger",
        icon: "🍔"
    },
    {
        id: 3,
        name: "Biryani",
        icon: "🍗"
    },
    {
        id: 4,
        name: "Drinks",
        icon: "🥤"
    },
    {
        id: 5,
        name: "Desserts",
        icon: "🍰"
    },
    {
        id: 6,
        name: "Fast Food",
        icon: "🌮"
    },
    {
        id: 7,
        name: "Salads",
        icon: "🥗"
    },
    {
        id: 8,
        name: "Noodles",
        icon: "🍜"
    }
];

const Category = ({ selectedCategory, onSelectCategory }) => {

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
                        onClick={() =>
                            onSelectCategory(category.name)
                        }
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