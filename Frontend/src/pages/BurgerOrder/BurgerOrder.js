import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    FaStar,
    FaClock,
    FaMotorcycle,
    FaMinus,
    FaPlus,
    FaShoppingCart,
    FaCheckCircle
} from "react-icons/fa";

import "./BurgerOrder.css";

export default function BurgerOrder() {

    const location = useLocation();
    const navigate = useNavigate();

    const burger = location.state?.burger;

    const [size, setSize] = useState("Medium");
    const [bun, setBun] = useState("Classic Bun");
    const [extras, setExtras] = useState([]);
    const [quantity, setQuantity] = useState(1);


    /* =====================================
       IF BURGER DATA IS MISSING
    ===================================== */

    if (!burger) {

        return (
            <div className="burgerOrderError">

                <div className="burgerErrorIcon">
                    🍔
                </div>

                <h2>Burger Not Found</h2>

                <p>
                    Please select a burger from the burger menu.
                </p>

                <button
                    onClick={() => navigate("/burger")}
                >
                    Back to Burgers
                </button>

            </div>
        );
    }


    /* =====================================
       BURGER DATA
    ===================================== */

    const burgerName =
        burger.name || "Chicken Cheese Burger";

    const restaurant =
        burger.restaurant || "Burger King";

    const description =
        burger.description ||
        "Freshly prepared burger made with delicious ingredients, fresh vegetables and premium cheese.";

    const image =
        burger.image ||
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80";

    const basePrice =
        Number(burger.price) || 299;

    const rating =
        burger.rating || "4.8";

    const reviews =
        burger.reviews || "2.4k+";


    /* =====================================
       SIZE PRICES
    ===================================== */

    const sizePrices = {
        Small: basePrice - 50,
        Medium: basePrice,
        Large: basePrice + 100
    };


    /* =====================================
       BUN PRICES
    ===================================== */

    const bunPrices = {
        "Classic Bun": 0,
        "Cheese Bun": 60,
        "Sesame Bun": 30,
        "Brioche Bun": 50
    };


    /* =====================================
       EXTRA PRICES
    ===================================== */

    const extraPrices = {
        "Extra Cheese": 40,
        Jalapeno: 30,
        "Extra Patty": 80,
        Bacon: 60,
        Lettuce: 30,
        Fries: 70
    };


    /* =====================================
       EXTRA TOGGLE
    ===================================== */

    const toggleExtra = (item) => {

        if (extras.includes(item)) {

            setExtras(
                extras.filter(
                    (extra) => extra !== item
                )
            );

        } else {

            setExtras([
                ...extras,
                item
            ]);

        }
    };


    /* =====================================
       PRICE CALCULATION
    ===================================== */

    const extrasTotal = extras.reduce(
        (total, item) =>
            total + extraPrices[item],
        0
    );

    const singlePrice =
        sizePrices[size] +
        bunPrices[bun] +
        extrasTotal;

    const totalPrice =
        singlePrice * quantity;


    /* =====================================
       ADD TO CART
    ===================================== */

    const handleAddToCart = () => {

        const cartItem = {

            ...burger,

            quantity: quantity,

            selectedSize: size,

            selectedBun: bun,

            extras: extras,

            finalPrice: singlePrice

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

        <div className="burgerOrderPage">

            <div className="burgerOrderContainer">


                {/* =================================
                    LEFT SIDE
                ================================= */}

                <div className="burgerOrderLeft">


                    {/* IMAGE CARD */}

                    <div className="burgerImageCard">

                        <img
                            src={image}
                            alt={burgerName}
                        />

                    </div>


                    {/* RATING */}

                    <div className="burgerRatingCard">

                        <FaStar />

                        <strong>
                            {rating}
                        </strong>

                        <span>
                            {reviews} ratings
                        </span>

                    </div>


                    {/* DELIVERY */}

                    <div className="burgerDeliveryCard">


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


                {/* =================================
                    RIGHT SIDE
                ================================= */}

                <div className="burgerOrderRight">


                    {/* RESTAURANT */}

                    <div className="burgerRestaurant">

                        {restaurant}

                        <span>
                            <FaCheckCircle />
                        </span>

                    </div>


                    {/* NAME */}

                    <h1>
                        {burgerName}
                    </h1>


                    {/* DESCRIPTION */}

                    <p className="burgerDescription">

                        {description}

                    </p>


                    {/* PRICE */}

                    <div className="burgerMainPrice">

                        ₹{basePrice}

                    </div>


                    {/* =================================
                        SIZE
                    ================================= */}

                    <div className="burgerSection">

                        <div className="burgerSectionTitle">

                            <h3>
                                Choose Size
                            </h3>

                            <span>
                                Required
                            </span>

                        </div>


                        <div className="burgerSizeGrid">

                            {Object.entries(
                                sizePrices
                            ).map(
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


                    {/* =================================
                        BUN
                    ================================= */}

                    <div className="burgerSection">

                        <div className="burgerSectionTitle">

                            <h3>
                                Choose Your Bun
                            </h3>

                            <span>
                                Required
                            </span>

                        </div>


                        <div className="burgerBunGrid">

                            {Object.entries(
                                bunPrices
                            ).map(
                                ([name, price]) => (

                                    <button
                                        key={name}
                                        className={
                                            bun === name
                                                ? "bunOption selected"
                                                : "bunOption"
                                        }
                                        onClick={() =>
                                            setBun(name)
                                        }
                                    >

                                        <span className="radio">

                                            {bun === name
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


                    {/* =================================
                        EXTRA ADDONS
                    ================================= */}

                    <div className="burgerSection">

                        <div className="burgerSectionTitle">

                            <h3>
                                Extra Add-ons
                            </h3>

                            <span>
                                Optional
                            </span>

                        </div>


                        <div className="burgerExtrasGrid">

                            {Object.entries(
                                extraPrices
                            ).map(
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


                    {/* =================================
                        QUANTITY
                    ================================= */}

                    <div className="burgerQuantityRow">

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


                    {/* =================================
                        BOTTOM
                    ================================= */}

                    <div className="burgerBottom">

                        <div>

                            <span>
                                Total Price
                            </span>

                            <strong>
                                ₹{totalPrice}
                            </strong>

                        </div>


                        <button
                            className="burgerAddButton"
                            onClick={handleAddToCart}
                        >

                            <FaShoppingCart />

                            Add to Cart

                        </button>

                    </div>


                </div>

            </div>

        </div>

    );
}