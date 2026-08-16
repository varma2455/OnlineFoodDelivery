import React, { useState } from "react";
import {
    useNavigate,
    useParams,
    useLocation
} from "react-router-dom";


import "./PizzaOrder.css";

import {
    FaArrowLeft,
    FaStar,
    FaMinus,
    FaPlus,
    FaShoppingCart,
    FaHeart,
    FaClock,
    FaMotorcycle
} from "react-icons/fa";

// import pizzaImage from "../../assets/images/pizza.png";


import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";


const pizzaData = [

    {
        id: 1,
        name: "Farmhouse Pizza",
        restaurant: "Pizza Hut",
        price: 299,
        rating: "4.8",
        reviews: "2.4k",
        image:
            "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=900",
        description:
            "A delicious combination of fresh vegetables, mozzarella cheese, capsicum, mushrooms and olives on our signature pizza base."
    },

    {
        id: 2,
        name: "Margherita Pizza",
        restaurant: "Domino's Pizza",
        price: 199,
        rating: "4.7",
        reviews: "2.1k",
        image:
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900",
        description:
            "Classic Margherita pizza made with rich tomato sauce, mozzarella cheese and fresh basil."
    },

    {
        id: 3,
        name: "Peppy Paneer",
        restaurant: "La Pino'z Pizza",
        price: 349,
        rating: "4.9",
        reviews: "3.2k",
        image:
            "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=900",
        description:
            "Soft paneer, fresh vegetables and delicious spices topped with mozzarella cheese."
    },

    {
        id: 4,
        name: "Chicken Tikka Pizza",
        restaurant: "Pizza Hut",
        price: 399,
        rating: "4.6",
        reviews: "1.7k",
        image:
            "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?w=900",
        description:
            "Juicy chicken tikka combined with mozzarella cheese and delicious pizza sauce."
    },

    {
        id: 5,
        name: "Cheese Burst Pizza",
        restaurant: "Domino's Pizza",
        price: 449,
        rating: "4.8",
        reviews: "2.8k",
        image:
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900",
        description:
            "A cheesy delight loaded with creamy cheese and a delicious cheese burst crust."
    },

    {
        id: 6,
        name: "Veggie Delight",
        restaurant: "Oven Story",
        price: 249,
        rating: "4.7",
        reviews: "1.2k",
        image:
            "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=900",
        description:
            "Fresh vegetables, cheese and delicious herbs combined on a crispy pizza base."
    },

    {
        id: 7,
        name: "Pepperoni Pizza",
        restaurant: "Domino's Pizza",
        price: 399,
        rating: "4.8",
        reviews: "2.5k",
        image:
            "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=900",
        description:
            "Classic pepperoni pizza topped with rich tomato sauce and melted mozzarella cheese."
    },

    {
        id: 8,
        name: "Mexican Green Wave",
        restaurant: "La Pino'z Pizza",
        price: 299,
        rating: "4.6",
        reviews: "980",
        image:
            "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=900",
        description:
            "A spicy Mexican-inspired pizza loaded with crunchy vegetables and delicious cheese."
    },

    {
        id: 9,
        name: "Chicken Dominator",
        restaurant: "Domino's Pizza",
        price: 449,
        rating: "4.9",
        reviews: "3.6k",
        image:
            "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?w=900",
        description:
            "A loaded chicken pizza packed with tender chicken pieces, cheese and rich pizza sauce."
    },

    {
        id: 10,
        name: "Cheese Lovers",
        restaurant: "Pizza Hut",
        price: 369,
        rating: "4.7",
        reviews: "1.9k",
        image:
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900",
        description:
            "A perfect pizza for cheese lovers with extra mozzarella and a rich creamy cheese topping."
    },

    {
        id: 11,
        name: "Paneer Tikka Pizza",
        restaurant: "Oven Story",
        price: 329,
        rating: "4.8",
        reviews: "2.2k",
        image:
            "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=900",
        description:
            "Spicy paneer tikka, fresh vegetables and mozzarella cheese on a delicious pizza base."
    },

    {
        id: 12,
        name: "Chicken Pepper Pizza",
        restaurant: "La Pino'z Pizza",
        price: 419,
        rating: "4.7",
        reviews: "1.7k",
        image:
            "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?w=900",
        description:
            "Tender chicken, pepper and mozzarella cheese combined with a flavorful pizza sauce."
    }

];


export default function PizzaOrder() {

    const { id } = useParams();

    const navigate = useNavigate();

    const location = useLocation();

    const selectedPizza =
        location.state?.pizza ||
        pizzaData.find(
            pizza => pizza.id === Number(id)
        ) ||
        pizzaData[0];

    const [size, setSize] = useState("Medium");



    const [crust, setCrust] = useState("Classic Hand Tossed");

    const [quantity, setQuantity] = useState(1);

    const [selectedToppings, setSelectedToppings] = useState([]);


    const basePrices = {
    Small: Math.max(99, selectedPizza.price - 100),
    Medium: selectedPizza.price,
    Large: selectedPizza.price + 100
};


    const crustPrices = {
        "Classic Hand Tossed": 0,
        "Cheese Burst": 60,
        "Thin Crust": 30,
        "Farmhouse Crust": 50
    };


    const toppings = [
        {
            name: "Extra Cheese",
            price: 40
        },
        {
            name: "Jalapeno",
            price: 30
        },
        {
            name: "Mushroom",
            price: 40
        },
        {
            name: "Olives",
            price: 35
        },
        {
            name: "Capsicum",
            price: 30
        },
        {
            name: "Paneer",
            price: 50
        }
    ];


    const toggleTopping = (topping) => {

        setSelectedToppings((prev) => {

            const exists = prev.find(
                item => item.name === topping.name
            );

            if (exists) {

                return prev.filter(
                    item => item.name !== topping.name
                );

            }

            return [...prev, topping];

        });

    };


    const toppingTotal = selectedToppings.reduce(
        (total, item) => total + item.price,
        0
    );


    const price =
        basePrices[size] +
        crustPrices[crust] +
        toppingTotal;


    const totalPrice = price * quantity;


    return (

        <div className="pizzaOrderPageLayout">

            <DashboardSidebar />

        <div className="pizzaPage">


            {/* =========================
                HEADER
            ========================= */}

            <header className="pizzaHeader">

                <button className="backButton" onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                </button>


                <div className="pizzaHeaderTitle">

                    <h2>
                        Order Pizza
                    </h2>

                    <p>
                        Customize your perfect pizza
                    </p>

                </div>


                <button className="favoriteButton">

                    <FaHeart />

                </button>

            </header>



            {/* =========================
                MAIN CONTENT
            ========================= */}

            <main className="pizzaContainer">


                {/* =========================
                    LEFT IMAGE
                ========================= */}

                <section className="pizzaImageSection">

                    <div className="pizzaImageCard">

                    <img src={selectedPizza.image} alt={selectedPizza.name} className="pizzaMainImage"/>

                        <div className="pizzaRating">

                            <FaStar />

                            <span>
                                {selectedPizza.rating}
                            </span>

                            <span>
                                {selectedPizza.reviews}+ ratings
                            </span>

                        </div>

                    </div>


                    <div className="deliveryInfo">

                        <div>

                            <FaClock />

                            <div>

                                <strong>
                                    30-40 mins
                                </strong>

                                <span>
                                    Estimated delivery
                                </span>

                            </div>

                        </div>


                        <div>

                            <FaMotorcycle />

                            <div>

                                <strong>
                                    Free Delivery
                                </strong>

                                <span>
                                    On orders above ₹299
                                </span>

                            </div>

                        </div>

                    </div>

                </section>



                {/* =========================
                    RIGHT DETAILS
                ========================= */}

                <section className="pizzaDetails">


                    <div className="restaurantName">

                        <span>
                            {selectedPizza.restaurant}
                        </span>

                        <span className="verified">
                            ✓
                        </span>

                    </div>


                    <h1>
                        {selectedPizza.name}
                    </h1>


                    <p className="pizzaDescription">

                    {selectedPizza.description ||
    `Freshly prepared ${selectedPizza.name} from ${selectedPizza.restaurant}, made with delicious ingredients and premium cheese.`
}

                    </p>


                    <div className="pizzaPrice">

                        ₹{basePrices[size]}

                    </div>



                    {/* =========================
                        SIZE
                    ========================= */}

                    <div className="optionSection">

                        <div className="optionTitle">

                            <h3>
                                Choose Size
                            </h3>

                            <span>
                                Required
                            </span>

                        </div>


                        <div className="sizeOptions">

                            {Object.keys(basePrices).map(
                                item => (

                                    <button
                                        key={item}
                                        className={
                                            size === item
                                                ? "sizeOption active"
                                                : "sizeOption"
                                        }
                                        onClick={() =>
                                            setSize(item)
                                        }
                                    >

                                        <strong>
                                            {item}
                                        </strong>

                                        <span>
                                            ₹{basePrices[item]}
                                        </span>

                                    </button>

                                )
                            )}

                        </div>

                    </div>



                    {/* =========================
                        CRUST
                    ========================= */}

                    <div className="optionSection">

                        <div className="optionTitle">

                            <h3>
                                Choose Your Crust
                            </h3>

                            <span>
                                Required
                            </span>

                        </div>


                        <div className="crustOptions">

                            {Object.keys(crustPrices).map(
                                item => (

                                    <label
                                        key={item}
                                        className="crustOption"
                                    >

                                        <input
                                            type="radio"
                                            name="crust"
                                            checked={
                                                crust === item
                                            }
                                            onChange={() =>
                                                setCrust(item)
                                            }
                                        />

                                        <span>
                                            {item}
                                        </span>


                                        {crustPrices[item] > 0 && (

                                            <small>
                                                +₹
                                                {crustPrices[item]}
                                            </small>

                                        )}

                                    </label>

                                )
                            )}

                        </div>

                    </div>



                    {/* =========================
                        TOPPINGS
                    ========================= */}

                    <div className="optionSection">

                        <div className="optionTitle">

                            <h3>
                                Extra Toppings
                            </h3>

                            <span>
                                Optional
                            </span>

                        </div>


                        <div className="toppingGrid">

                            {toppings.map(topping => {

                                const selected =
                                    selectedToppings.some(
                                        item =>
                                            item.name ===
                                            topping.name
                                    );


                                return (

                                    <button
                                        key={topping.name}
                                        className={
                                            selected
                                                ? "topping active"
                                                : "topping"
                                        }
                                        onClick={() =>
                                            toggleTopping(topping)
                                        }
                                    >

                                        <span>

                                            {selected
                                                ? "✓"
                                                : "+"}

                                        </span>

                                        <div>

                                            <strong>
                                                {topping.name}
                                            </strong>

                                            <small>
                                                +₹
                                                {topping.price}
                                            </small>

                                        </div>

                                    </button>

                                );

                            })}

                        </div>

                    </div>



                    {/* =========================
                        QUANTITY
                    ========================= */}

                    <div className="quantitySection">

                        <h3>
                            Quantity
                        </h3>


                        <div className="quantityBox">

                            <button
                                onClick={() =>
                                    setQuantity(
                                        Math.max(
                                            1,
                                            quantity - 1
                                        )
                                    )
                                }
                            >

                                <FaMinus />

                            </button>


                            <span>
                                {quantity}
                            </span>


                            <button
                                onClick={() =>
                                    setQuantity(
                                        quantity + 1
                                    )
                                }
                            >

                                <FaPlus />

                            </button>

                        </div>

                    </div>



                    {/* =========================
                        ADD TO CART
                    ========================= */}

                    <div className="orderBottom">

                        <div className="finalPrice">

                            <span>
                                Total Price
                            </span>

                            <strong>
                                ₹{totalPrice}
                            </strong>

                        </div>


                        <button className="addPizzaButton">

                            <FaShoppingCart />

                            Add to Cart

                        </button>

                    </div>


                </section>

            </main>

        </div>

        </div>

    );

}