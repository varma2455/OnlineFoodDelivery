import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    FaStar,
    FaClock,
    FaMotorcycle,
    FaMinus,
    FaPlus,
    FaShoppingCart,
    FaArrowLeft,
    FaHeart,
    FaCheckCircle
} from "react-icons/fa";

import "./BiryaniOrder.css";


import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";


export default function BiryaniOrder() {

    const location = useLocation();
    const navigate = useNavigate();

    const biryani = location.state?.biryani;

    const [size, setSize] = useState("Medium");
    const [rice, setRice] = useState("Long Grain");
    const [spice, setSpice] = useState("Medium");
    const [extras, setExtras] = useState([]);
    const [quantity, setQuantity] = useState(1);

    if (!biryani) {
        return (
            <div className="biryaniOrderError">

                <div className="biryaniErrorIcon">
                    🍛
                </div>

                <h2>Biryani Not Found</h2>

                <p>
                    Please select a biryani from the biryani menu.
                </p>

                <button
                    onClick={() => navigate("/biryani")}
                >
                    Back to Biryani
                </button>

            </div>
        );
    }

    const biryaniName =
        biryani.name || "Hyderabadi Chicken Biryani";

    const restaurant =
        biryani.restaurant || "Paradise";

    const description =
        biryani.description ||
        "Authentic Hyderabadi biryani prepared with aromatic basmati rice, tender chicken and traditional spices.";

    const image =
        biryani.image ||
        "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=1000&q=80";

    const basePrice =
        Number(biryani.price) || 299;

    const rating =
        biryani.rating || "4.8";

    const reviews =
        biryani.reviews || "2.4k+";


    /* SIZE */

    const sizePrices = {
        Small: basePrice - 50,
        Medium: basePrice,
        Large: basePrice + 100
    };


    /* RICE */

    const ricePrices = {
        "Regular Rice": 0,
        "Long Grain": 30,
        "Extra Basmati": 50,
        "Seeraga Samba": 40
    };


    /* SPICE */

    const spicePrices = {
        Mild: 0,
        Medium: 0,
        Spicy: 10
    };


    /* EXTRAS */

    const extraPrices = {
        "Raita": 20,
        "Mirchi Ka Salan": 25,
        "Extra Chicken": 100,
        "Boiled Egg": 30,
        "Extra Gravy": 20,
        "Fried Onion": 25
    };


    const toggleExtra = (item) => {

        if (extras.includes(item)) {

            setExtras(
                extras.filter(
                    extra => extra !== item
                )
            );

        } else {

            setExtras([
                ...extras,
                item
            ]);

        }
    };


    const extrasTotal = extras.reduce(
        (total, item) =>
            total + extraPrices[item],
        0
    );


    const singlePrice =
        sizePrices[size] +
        ricePrices[rice] +
        spicePrices[spice] +
        extrasTotal;


    const totalPrice =
        singlePrice * quantity;


    const handleAddToCart = () => {

        const cartItem = {

            ...biryani,

            quantity,

            selectedSize: size,

            selectedRice: rice,

            selectedSpice: spice,

            extras,

            finalPrice: singlePrice,

            category: "Biryani"

        };


        const existingCart =
            JSON.parse(
                localStorage.getItem("cart")
            ) || [];


        existingCart.push(cartItem);


        localStorage.setItem(
            "cart",
            JSON.stringify(existingCart)
        );


        navigate("/cart");
    };


    return (

        <div className="biryaniOrderPageLayout">

            <DashboardSidebar />

        <div className="biryaniOrderPage">


            {/* =========================
                                        HEADER
                                    ========================= */}
                        
                                    <header className="pizzaHeader">
                        
                                        <button className="backButton" onClick={() => navigate(-1)}>
                                            <FaArrowLeft />
                                        </button>
                        
                        
                                        <div className="pizzaHeaderTitle">
                        
                                            <h2>
                                                Order Burger
                                            </h2>
                        
                                            <p>
                                                Customize your perfect Burger
                                            </p>
                        
                                        </div>
                        
                        
                                        <button className="favoriteButton">
                        
                                            <FaHeart />
                        
                                        </button>
                        
                                    </header>
                        

            <div className="biryaniOrderContainer">


                {/* LEFT SIDE */}

                <div className="biryaniOrderLeft">

                    <div className="biryaniImageCard">

                        <img
                            src={image}
                            alt={biryaniName}
                        />

                    </div>


                    <div className="biryaniRatingCard">

                        <FaStar />

                        <strong>
                            {rating}
                        </strong>

                        <span>
                            {reviews} ratings
                        </span>

                    </div>


                    <div className="biryaniDeliveryCard">

                        <div className="deliveryItem">

                            <FaClock />

                            <div>

                                <strong>
                                    25–35 mins
                                </strong>

                                <span>
                                    Estimated delivery
                                </span>

                            </div>

                        </div>


                        <div className="deliveryItem">

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

                </div>


                {/* RIGHT SIDE */}

                <div className="biryaniOrderRight">


                    <div className="biryaniRestaurant">

                        {restaurant}

                        <span>
                            <FaCheckCircle />
                        </span>

                    </div>


                    <h1>
                        {biryaniName}
                    </h1>


                    <p className="biryaniDescription">
                        {description}
                    </p>


                    <div className="biryaniMainPrice">
                        ₹{basePrice}
                    </div>


                    {/* SIZE */}

                    <div className="biryaniSection">

                        <div className="biryaniSectionTitle">

                            <h3>
                                Choose Size
                            </h3>

                            <span>
                                Required
                            </span>

                        </div>


                        <div className="biryaniSizeGrid">

                            {Object.entries(sizePrices).map(
                                ([name, price]) => (

                                    <button
                                        key={name}
                                        className={
                                            size === name
                                                ? "sizeOption selected"
                                                : "sizeOption"
                                        }
                                        onClick={() =>
                                            setSize(name)
                                        }
                                    >

                                        <strong>
                                            {name}
                                        </strong>

                                        <small>
                                            ₹{price}
                                        </small>

                                    </button>

                                )
                            )}

                        </div>

                    </div>


                    {/* RICE */}

                    <div className="biryaniSection">

                        <div className="biryaniSectionTitle">

                            <h3>
                                Choose Rice Type
                            </h3>

                            <span>
                                Required
                            </span>

                        </div>


                        <div className="biryaniOptionGrid">

                            {Object.entries(ricePrices).map(
                                ([name, price]) => (

                                    <button
                                        key={name}
                                        className={
                                            rice === name
                                                ? "biryaniOption selected"
                                                : "biryaniOption"
                                        }
                                        onClick={() =>
                                            setRice(name)
                                        }
                                    >

                                        <span className="radio">
                                            {rice === name
                                                ? "●"
                                                : "○"}
                                        </span>

                                        <span>
                                            {name}
                                        </span>

                                        {price > 0 && (
                                            <small>
                                                +₹{price}
                                            </small>
                                        )}

                                    </button>

                                )
                            )}

                        </div>

                    </div>


                    {/* SPICE */}

                    <div className="biryaniSection">

                        <div className="biryaniSectionTitle">

                            <h3>
                                Choose Spice Level
                            </h3>

                            <span>
                                Required
                            </span>

                        </div>


                        <div className="biryaniSpiceGrid">

                            {Object.entries(spicePrices).map(
                                ([name, price]) => (

                                    <button
                                        key={name}
                                        className={
                                            spice === name
                                                ? "spiceOption selected"
                                                : "spiceOption"
                                        }
                                        onClick={() =>
                                            setSpice(name)
                                        }
                                    >

                                        <span className="radio">
                                            {spice === name
                                                ? "●"
                                                : "○"}
                                        </span>

                                        {name}

                                        {price > 0 && (
                                            <small>
                                                +₹{price}
                                            </small>
                                        )}

                                    </button>

                                )
                            )}

                        </div>

                    </div>


                    {/* EXTRAS */}

                    <div className="biryaniSection">

                        <div className="biryaniSectionTitle">

                            <h3>
                                Extra Add-ons
                            </h3>

                            <span>
                                Optional
                            </span>

                        </div>


                        <div className="biryaniExtrasGrid">

                            {Object.entries(extraPrices).map(
                                ([name, price]) => (

                                    <button
                                        key={name}
                                        className={
                                            extras.includes(name)
                                                ? "extraOption selected"
                                                : "extraOption"
                                        }
                                        onClick={() =>
                                            toggleExtra(name)
                                        }
                                    >

                                        <span className="extraPlus">
                                            +
                                        </span>

                                        <span className="extraText">

                                            <strong>
                                                {name}
                                            </strong>

                                            <small>
                                                +₹{price}
                                            </small>

                                        </span>

                                    </button>

                                )
                            )}

                        </div>

                    </div>


                    {/* QUANTITY */}

                    <div className="biryaniQuantityRow">

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


                    {/* BOTTOM */}

                    <div className="biryaniBottom">

                        <div>

                            <span>
                                Total Price
                            </span>

                            <strong>
                                ₹{totalPrice}
                            </strong>

                        </div>


                        <button
                            className="biryaniAddButton"
                            onClick={handleAddToCart}
                        >

                            <FaShoppingCart />

                            Add to Cart

                        </button>

                    </div>

                </div>

            </div>

        </div>

        </div>
    );
}