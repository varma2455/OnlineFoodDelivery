import React, { useState } from "react";
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


export default function PizzaOrder() {

    const [size, setSize] = useState("Medium");

    const [crust, setCrust] = useState("Classic Hand Tossed");

    const [quantity, setQuantity] = useState(1);

    const [selectedToppings, setSelectedToppings] = useState([]);


    const basePrices = {
        Small: 199,
        Medium: 299,
        Large: 399
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

        <div className="pizzaPage">


            {/* =========================
                HEADER
            ========================= */}

            <header className="pizzaHeader">

                <button className="backButton">

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

                    <img src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900" alt="Pizza" className="pizzaMainImage"/>

                        <div className="pizzaRating">

                            <FaStar />

                            <span>
                                4.8
                            </span>

                            <span>
                                2.4k+ ratings
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
                            La Pino'z Pizza
                        </span>

                        <span className="verified">
                            ✓
                        </span>

                    </div>


                    <h1>
                        Farmhouse Pizza
                    </h1>


                    <p className="pizzaDescription">

                        A delicious combination of fresh
                        vegetables, mozzarella cheese,
                        capsicum, mushrooms and olives
                        on our signature pizza base.

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

    );

}