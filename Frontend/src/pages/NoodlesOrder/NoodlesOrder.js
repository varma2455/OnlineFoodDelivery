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


import "./NoodlesOrder.css";

import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";


export default function NoodlesOrder() {

    const location = useLocation();
    const navigate = useNavigate();

    const noodles = location.state?.noodles;


    const [size, setSize] = useState("Medium");

    const [noodlesType, setNoodlesType] =
        useState("Vegetable");

    const [extras, setExtras] = useState([]);

    const [quantity, setQuantity] = useState(1);


    /* =====================================
       IF NOODLES DATA IS MISSING
    ===================================== */

    if (!noodles) {

        return (

            <div className="noodlesOrderError">

                <div className="noodlesErrorIcon">
                    🍜
                </div>


                <h2>
                    Noodles Not Found
                </h2>


                <p>
                    Please select noodles from the noodles menu.
                </p>


                <button
                    onClick={() =>
                        navigate("/noodles")
                    }
                >
                    Back to Noodles
                </button>

            </div>

        );

    }


    /* =====================================
       NOODLES DATA
    ===================================== */

    const noodlesName =
        noodles.name || "Chicken Hakka Noodles";


    const restaurant =
        noodles.restaurant || "Chinese Wok";


    const description =
        noodles.description ||
        "Freshly prepared noodles made with delicious ingredients, fresh vegetables and premium sauces.";


    const image =
        noodles.image ||
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80";


    const basePrice =
        Number(noodles.price) || 199;


    const rating =
        noodles.rating || "4.8";


    const reviews =
        noodles.reviews || "2.4k+";


    /* =====================================
       SIZE PRICES
    ===================================== */

    const sizePrices = {

        Small: basePrice - 50,

        Medium: basePrice,

        Large: basePrice + 100

    };


    /* =====================================
       NOODLES TYPE PRICES
    ===================================== */

    const noodlesTypePrices = {

        "Vegetable": 0,

        "Egg Noodles": 30,

        "Chicken": 60,

        "Paneer": 50

    };


    /* =====================================
       EXTRA PRICES
    ===================================== */

    const extraPrices = {

        "Extra Noodles": 50,

        "Extra Vegetables": 30,

        "Chilli Sauce": 20,

        "Spring Onion": 20,

        "Extra Chicken": 80,

        "Fried Egg": 40

    };


    /* =====================================
       EXTRA TOGGLE
    ===================================== */

    const toggleExtra = (item) => {

        if (extras.includes(item)) {

            setExtras(
                extras.filter(
                    (extra) =>
                        extra !== item
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

        noodlesTypePrices[noodlesType] +

        extrasTotal;


    const totalPrice =
        singlePrice * quantity;


    /* =====================================
       ADD TO CART
    ===================================== */

    const handleAddToCart = () => {

        const cartItem = {

            ...noodles,

            quantity: quantity,

            selectedSize: size,

            selectedNoodlesType:
                noodlesType,

            extras: extras,

            finalPrice: singlePrice

        };


        const existingCart =

            JSON.parse(
                localStorage.getItem("cart")
            ) || [];


        existingCart.push(
            cartItem
        );


        localStorage.setItem(

            "cart",

            JSON.stringify(
                existingCart
            )

        );


        navigate("/cart");

    };


    return (

        <div className="noodlesOrderPageLayout">


            <DashboardSidebar />


            <div className="noodlesOrderPage">


                {/* =========================
                    HEADER
                ========================= */}


                <header className="pizzaHeader">


                    <button
                        className="backButton"
                        onClick={() =>
                            navigate(-1)
                        }
                    >

                        <FaArrowLeft />

                    </button>


                    <div className="pizzaHeaderTitle">


                        <h2>
                            Order Noodles
                        </h2>


                        <p>
                            Customize your perfect Noodles
                        </p>


                    </div>


                    <button
                        className="favoriteButton"
                    >

                        <FaHeart />

                    </button>


                </header>



                <div className="noodlesOrderContainer">


                    {/* =================================
                        LEFT SIDE
                    ================================= */}


                    <div className="noodlesOrderLeft">


                        {/* IMAGE CARD */}

                        <div className="noodlesImageCard">


                            <img
                                src={image}
                                alt={noodlesName}
                            />


                        </div>



                        {/* RATING */}

                        <div className="noodlesRatingCard">


                            <FaStar />


                            <strong>
                                {rating}
                            </strong>


                            <span>
                                {reviews} ratings
                            </span>


                        </div>



                        {/* DELIVERY */}

                        <div className="noodlesDeliveryCard">


                            <div className="deliveryItem">


                                <FaClock />


                                <div>


                                    <strong>
                                        20–30 mins
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


                    <div className="noodlesOrderRight">


                        {/* RESTAURANT */}


                        <div className="noodlesRestaurant">


                            {restaurant}


                            <span>

                                <FaCheckCircle />

                            </span>


                        </div>



                        {/* NAME */}


                        <h1>

                            {noodlesName}

                        </h1>



                        {/* DESCRIPTION */}


                        <p className="noodlesDescription">

                            {description}

                        </p>



                        {/* PRICE */}


                        <div className="noodlesMainPrice">

                            ₹{basePrice}

                        </div>



                        {/* =================================
                            SIZE
                        ================================= */}


                        <div className="noodlesSection">


                            <div className="noodlesSectionTitle">


                                <h3>
                                    Choose Size
                                </h3>


                                <span>
                                    Required
                                </span>


                            </div>



                            <div className="noodlesSizeGrid">


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
                            NOODLES TYPE
                        ================================= */}


                        <div className="noodlesSection">


                            <div className="noodlesSectionTitle">


                                <h3>
                                    Choose Your Noodles
                                </h3>


                                <span>
                                    Required
                                </span>


                            </div>



                            <div className="noodlesTypeGrid">


                                {Object.entries(
                                    noodlesTypePrices
                                ).map(
                                    ([name, price]) => (


                                        <button
                                            key={name}
                                            className={
                                                noodlesType === name
                                                    ? "noodlesTypeOption selected"
                                                    : "noodlesTypeOption"
                                            }
                                            onClick={() =>
                                                setNoodlesType(
                                                    name
                                                )
                                            }
                                        >


                                            <span className="radio">


                                                {noodlesType === name
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


                        <div className="noodlesSection">


                            <div className="noodlesSectionTitle">


                                <h3>
                                    Extra Add-ons
                                </h3>


                                <span>
                                    Optional
                                </span>


                            </div>



                            <div className="noodlesExtrasGrid">


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


                        <div className="noodlesQuantityRow">


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


                        <div className="noodlesBottom">


                            <div>


                                <span>
                                    Total Price
                                </span>


                                <strong>
                                    ₹{totalPrice}
                                </strong>


                            </div>



                            <button
                                className="noodlesAddButton"
                                onClick={
                                    handleAddToCart
                                }
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