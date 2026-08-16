import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    FaStar,
    FaArrowLeft,
    FaHeart,
    FaClock,
    FaMotorcycle,
    FaMinus,
    FaPlus,
    FaShoppingCart,
    FaCheckCircle
} from "react-icons/fa";

import "./DessertsOrder.css";

import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";


export default function DessertsOrder() {

    const location = useLocation();
    const navigate = useNavigate();

    const dessert = location.state?.dessert;


    /* =====================================
       IF DESSERT DATA IS MISSING
    ===================================== */

    if (!dessert) {

        return (

            <div className="dessertOrderError">

                <div className="dessertErrorIcon">
                    🍰
                </div>

                <h2>
                    Dessert Not Found
                </h2>

                <p>
                    Please select a dessert from the dessert menu.
                </p>

                <button
                    onClick={() => navigate("/desserts")}
                >
                    Back to Desserts
                </button>

            </div>

        );

    }


    /* =====================================
       DESSERT DATA
    ===================================== */

    const dessertName =
        dessert.name || "Chocolate Cake";


    const restaurant =
        dessert.restaurant || "Cake World";


    const description =
        dessert.description ||
        "Delicious dessert prepared with premium ingredients and served fresh.";


    const image =
        dessert.image ||
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000";


    const basePrice =
        Number(dessert.price) || 199;


    const rating =
        dessert.rating || "4.8";


    const reviews =
        dessert.reviews || "2.4k+";


    /* =====================================
       SIZE PRICES
    ===================================== */

    const sizePrices = {

        Small: basePrice - 40,

        Medium: basePrice,

        Large: basePrice + 80

    };


    /* =====================================
       TOPPING PRICES
    ===================================== */

    const toppingPrices = {

        "Chocolate Sauce": 30,

        "Caramel Sauce": 30,

        "Whipped Cream": 40,

        "Strawberry": 50

    };


    /* =====================================
       EXTRA PRICES
    ===================================== */

    const extraPrices = {

        "Ice Cream Scoop": 60,

        "Chocolate Chips": 40,

        "Nuts": 40,

        "Oreo Crumbs": 40

    };


    /* =====================================
       STATE
    ===================================== */

    const [size, setSize] =
        useState("Medium");


    const [topping, setTopping] =
        useState("Chocolate Sauce");


    const [extras, setExtras] =
        useState([]);


    const [quantity, setQuantity] =
        useState(1);


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
        toppingPrices[topping] +
        extrasTotal;


    const totalPrice =
        singlePrice * quantity;


    /* =====================================
       ADD TO CART
    ===================================== */

    const handleAddToCart = () => {

        const cartItem = {

            ...dessert,

            quantity: quantity,

            selectedSize: size,

            selectedTopping: topping,

            extras: extras,

            finalPrice: singlePrice,

            totalPrice: totalPrice

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

        <div className="dessertOrderPageLayout">


            {/* =====================================
                SIDEBAR
            ===================================== */}

            <DashboardSidebar />


            <div className="dessertOrderPage">


                {/* =========================
                    HEADER
                ========================= */}

                <header className="dessertHeader">

                    <button
                        className="dessertBackButton"
                        onClick={() => navigate(-1)}
                    >

                        <FaArrowLeft />

                    </button>


                    <div className="dessertHeaderTitle">

                        <h2>
                            Order Dessert
                        </h2>

                        <p>
                            Customize your perfect Dessert
                        </p>

                    </div>


                    <button className="dessertFavoriteButton">

                        <FaHeart />

                    </button>

                </header>



                <div className="dessertOrderContainer">


                    {/* =================================
                        LEFT SIDE
                    ================================= */}

                    <div className="dessertOrderLeft">


                        {/* IMAGE */}

                        <div className="dessertImageCard">

                            <img
                                src={image}
                                alt={dessertName}
                            />

                        </div>


                        {/* RATING */}

                        <div className="dessertRatingCard">

                            <FaStar />

                            <strong>
                                {rating}
                            </strong>

                            <span>
                                {reviews} ratings
                            </span>

                        </div>


                        {/* DELIVERY */}

                        <div className="dessertDeliveryCard">


                            <div className="dessertDeliveryItem">

                                <FaClock />

                                <div>

                                    <strong>
                                        15–25 mins
                                    </strong>

                                    <span>
                                        Estimated delivery
                                    </span>

                                </div>

                            </div>


                            <div className="dessertDeliveryItem">

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

                    <div className="dessertOrderRight">


                        {/* RESTAURANT */}

                        <div className="dessertRestaurant">

                            {restaurant}

                            <span>
                                <FaCheckCircle />
                            </span>

                        </div>


                        {/* NAME */}

                        <h1>
                            {dessertName}
                        </h1>


                        {/* DESCRIPTION */}

                        <p className="dessertDescription">

                            {description}

                        </p>


                        {/* PRICE */}

                        <div className="dessertMainPrice">

                            ₹{basePrice}

                        </div>



                        {/* =================================
                            SIZE
                        ================================= */}

                        <div className="dessertSection">

                            <div className="dessertSectionTitle">

                                <h3>
                                    Choose Size
                                </h3>

                                <span>
                                    Required
                                </span>

                            </div>


                            <div className="dessertSizeGrid">

                                {Object.entries(
                                    sizePrices
                                ).map(
                                    ([name, price]) => (

                                        <button
                                            key={name}
                                            className={
                                                size === name
                                                    ? "dessertSizeOption selected"
                                                    : "dessertSizeOption"
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
                            TOPPING
                        ================================= */}

                        <div className="dessertSection">

                            <div className="dessertSectionTitle">

                                <h3>
                                    Choose Your Topping
                                </h3>

                                <span>
                                    Required
                                </span>

                            </div>


                            <div className="dessertToppingGrid">

                                {Object.entries(
                                    toppingPrices
                                ).map(
                                    ([name, price]) => (

                                        <button
                                            key={name}
                                            className={
                                                topping === name
                                                    ? "dessertToppingOption selected"
                                                    : "dessertToppingOption"
                                            }
                                            onClick={() =>
                                                setTopping(name)
                                            }
                                        >

                                            <span className="dessertRadio">

                                                {topping === name
                                                    ? "●"
                                                    : "○"}

                                            </span>


                                            <span>
                                                {name}
                                            </span>


                                            <small>
                                                +₹{price}
                                            </small>

                                        </button>

                                    )
                                )}

                            </div>

                        </div>



                        {/* =================================
                            EXTRA ADDONS
                        ================================= */}

                        <div className="dessertSection">

                            <div className="dessertSectionTitle">

                                <h3>
                                    Extra Add-ons
                                </h3>

                                <span>
                                    Optional
                                </span>

                            </div>


                            <div className="dessertExtrasGrid">

                                {Object.entries(
                                    extraPrices
                                ).map(
                                    ([name, price]) => (

                                        <button
                                            key={name}
                                            className={
                                                extras.includes(name)
                                                    ? "dessertExtraOption selected"
                                                    : "dessertExtraOption"
                                            }
                                            onClick={() =>
                                                toggleExtra(name)
                                            }
                                        >

                                            <span className="dessertExtraPlus">
                                                +
                                            </span>


                                            <span className="dessertExtraText">

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

                        <div className="dessertQuantityRow">

                            <h3>
                                Quantity
                            </h3>


                            <div className="dessertQuantityBox">

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

                        <div className="dessertBottom">

                            <div>

                                <span>
                                    Total Price
                                </span>

                                <strong>
                                    ₹{totalPrice}
                                </strong>

                            </div>


                            <button
                                className="dessertAddButton"
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