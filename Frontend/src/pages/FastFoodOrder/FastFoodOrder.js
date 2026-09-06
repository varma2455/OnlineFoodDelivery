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

import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";

import "./FastFoodOrder.css";


/* =====================================================
   DEFAULT FAST FOOD
===================================================== */

const defaultFood = {

    id: 1,

    name: "Chicken Fried Rice",

    restaurant: "Chinese Wok",

    rating: "4.8",

    reviews: "3.2k",

    price: 229,

    oldPrice: 279,

    time: "25 min",

    category: "Fried Rice",

    image:
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=1200",

    description:
        "Fragrant basmati rice tossed with tender chicken, fresh vegetables, spring onions and aromatic Chinese sauces."

};


/* =====================================================
   COMPONENT
===================================================== */

export default function FastFoodOrder() {

    const navigate = useNavigate();

    const location = useLocation();


    /* =================================================
       SELECTED FOOD FROM FAST FOOD PAGE
    ================================================= */

    const selectedFood =
        location.state?.fastFood;


    const item =
        selectedFood || defaultFood;


    /* =================================================
       STATES
    ================================================= */

    const [portion, setPortion] =
        useState("Regular");


    const [spiceLevel, setSpiceLevel] =
        useState("Medium");


    const [extra, setExtra] =
        useState([]);


    const [quantity, setQuantity] =
        useState(1);


    const [liked, setLiked] =
        useState(false);


    /* =================================================
       PORTION OPTIONS
    ================================================= */

    const portions = [

        {
            name: "Regular",
            price: 0
        },

        {
            name: "Large",
            price: 50
        },

        {
            name: "Family",
            price: 100
        }

    ];


    /* =================================================
       SPICE OPTIONS
    ================================================= */

    const spiceLevels = [

        {
            name: "Mild",
            price: 0
        },

        {
            name: "Medium",
            price: 0
        },

        {
            name: "Spicy",
            price: 0
        }

    ];


    /* =================================================
       EXTRA OPTIONS
    ================================================= */

    const extras = [

        {
            name: "Extra Chicken",
            price: 60
        },

        {
            name: "Extra Egg",
            price: 30
        },

        {
            name: "Extra Vegetables",
            price: 25
        },

        {
            name: "Extra Sauce",
            price: 20
        },

        {
            name: "Spring Onion",
            price: 15
        },

        {
            name: "Raita",
            price: 30
        }

    ];


    /* =================================================
       TOGGLE EXTRA
    ================================================= */

    const toggleExtra = (selectedExtra) => {

        setExtra((previous) => {

            const exists =
                previous.some(
                    option =>
                        option.name ===
                        selectedExtra.name
                );


            if (exists) {

                return previous.filter(
                    option =>
                        option.name !==
                        selectedExtra.name
                );

            }


            return [
                ...previous,
                selectedExtra
            ];

        });

    };


    /* =================================================
       PRICE CALCULATION
    ================================================= */

    const portionPrice =
        portions.find(
            option =>
                option.name === portion
        )?.price || 0;


    const extraPrice =
        extra.reduce(
            (total, option) =>
                total + option.price,
            0
        );


    const singlePrice =
        item.price +
        portionPrice +
        extraPrice;


    const totalPrice =
        singlePrice * quantity;


    /* =================================================
       ADD TO CART
    ================================================= */

    const handleAddToCart = () => {

        const customizedFood = {

            ...item,

            portion,

            spiceLevel,

            extras: extra,

            quantity,

            singlePrice,

            totalPrice

        };


        console.log(
            "Fast Food Added To Cart:",
            customizedFood
        );


        navigate(
            "/cart",
            {
                state: {
                    fastFood:
                        customizedFood
                }
            }
        );

    };


    /* =================================================
       PAGE
    ================================================= */

    return (

        <div className="fastFoodOrderPageLayout">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <DashboardSidebar />



            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <div className="fastFoodOrderPage">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="fastFoodOrderHeader">


                    <button
                        className="fastFoodOrderBack"
                        onClick={() =>
                            navigate(-1)
                        }
                    >

                        <FaArrowLeft />

                    </button>


                    <div>

                        <h2>
                            Order Fast Food
                        </h2>

                        <p>
                            Customize your meal
                        </p>

                    </div>


                    <button
                        className={
                            liked
                                ? "fastFoodOrderHeart active"
                                : "fastFoodOrderHeart"
                        }
                        onClick={() =>
                            setLiked(!liked)
                        }
                    >

                        <FaHeart />

                    </button>


                </header>



                {/* =================================================
                    ORDER CONTAINER
                ================================================= */}

                <main className="fastFoodOrderContainer">


                    {/* =================================================
                        LEFT SIDE
                    ================================================= */}

                    <section className="fastFoodOrderLeft">


                        {/* FOOD IMAGE */}

                        <div className="fastFoodOrderImageCard">


                            <img
                                src={item.image}
                                alt={item.name}
                            />


                            <span className="fastFoodOrderBadge">

                                {item.category}

                            </span>


                        </div>



                        {/* DELIVERY INFORMATION */}

                        <div className="fastFoodOrderDelivery">


                            <div>

                                <FaStar />

                                <strong>
                                    {item.rating}
                                </strong>

                                <span>
                                    ({item.reviews})
                                </span>

                            </div>


                            <div>

                                <FaClock />

                                <span>
                                    {item.time}
                                </span>

                            </div>


                            <div>

                                <FaMotorcycle />

                                <span>
                                    Fast Delivery
                                </span>

                            </div>


                        </div>



                        {/* DESCRIPTION */}

                        <div className="fastFoodOrderDescription">


                            <h3>
                                About this item
                            </h3>


                            <p>
                                {item.description}
                            </p>


                        </div>


                    </section>



                    {/* =================================================
                        RIGHT SIDE
                    ================================================= */}

                    <section className="fastFoodOrderRight">


                        {/* RESTAURANT */}

                        <div className="fastFoodOrderRestaurant">


                            <span>
                                {item.restaurant}
                            </span>


                            <h1>
                                {item.name}
                            </h1>


                            <div className="fastFoodOrderRating">

                                <FaStar />

                                {item.rating}

                                <span>
                                    • {item.reviews} reviews
                                </span>

                            </div>


                        </div>



                        {/* =================================================
                            PORTION
                        ================================================= */}

                        <div className="fastFoodOrderSection">


                            <div className="fastFoodOrderSectionTitle">

                                <h3>
                                    Choose Portion
                                </h3>

                                <span>
                                    Required
                                </span>

                            </div>



                            <div className="fastFoodOptionGrid">


                                {portions.map(option => (


                                    <button
                                        key={option.name}
                                        className={
                                            portion ===
                                            option.name
                                                ? "fastFoodOption active"
                                                : "fastFoodOption"
                                        }
                                        onClick={() =>
                                            setPortion(
                                                option.name
                                            )
                                        }
                                    >


                                        <div>

                                            <strong>
                                                {option.name}
                                            </strong>


                                            <small>

                                                {option.price === 0
                                                    ? "Included"
                                                    : `+ ₹${option.price}`}

                                            </small>

                                        </div>


                                        {portion ===
                                            option.name && (

                                            <FaCheckCircle />

                                        )}


                                    </button>


                                ))}


                            </div>


                        </div>



                        {/* =================================================
                            SPICE LEVEL
                        ================================================= */}

                        <div className="fastFoodOrderSection">


                            <div className="fastFoodOrderSectionTitle">

                                <h3>
                                    Spice Level
                                </h3>

                                <span>
                                    Required
                                </span>

                            </div>



                            <div className="fastFoodOptionGrid">


                                {spiceLevels.map(option => (


                                    <button
                                        key={option.name}
                                        className={
                                            spiceLevel ===
                                            option.name
                                                ? "fastFoodOption active"
                                                : "fastFoodOption"
                                        }
                                        onClick={() =>
                                            setSpiceLevel(
                                                option.name
                                            )
                                        }
                                    >


                                        <div>

                                            <strong>
                                                {option.name}
                                            </strong>


                                            <small>

                                                {option.name ===
                                                    "Mild"
                                                    ? "Less spicy"
                                                    : option.name ===
                                                      "Medium"
                                                    ? "Balanced"
                                                    : "Extra spicy"}

                                            </small>

                                        </div>


                                        {spiceLevel ===
                                            option.name && (

                                            <FaCheckCircle />

                                        )}


                                    </button>


                                ))}


                            </div>


                        </div>



                        {/* =================================================
                            EXTRAS
                        ================================================= */}

                        <div className="fastFoodOrderSection">


                            <div className="fastFoodOrderSectionTitle">

                                <h3>
                                    Extra Add-ons
                                </h3>

                                <span>
                                    Optional
                                </span>

                            </div>



                            <div className="fastFoodExtraGrid">


                                {extras.map(option => {


                                    const selected =
                                        extra.some(
                                            item =>
                                                item.name ===
                                                option.name
                                        );


                                    return (


                                        <button
                                            key={option.name}
                                            className={
                                                selected
                                                    ? "fastFoodExtra active"
                                                    : "fastFoodExtra"
                                            }
                                            onClick={() =>
                                                toggleExtra(
                                                    option
                                                )
                                            }
                                        >


                                            <div>

                                                <strong>
                                                    {option.name}
                                                </strong>


                                                <small>
                                                    + ₹{option.price}
                                                </small>

                                            </div>


                                            {selected && (

                                                <FaCheckCircle />

                                            )}


                                        </button>


                                    );

                                })}


                            </div>


                        </div>



                        {/* =================================================
                            SPECIAL REQUEST
                        ================================================= */}

                        <div className="fastFoodOrderSection">


                            <div className="fastFoodOrderSectionTitle">

                                <h3>
                                    Special Request
                                </h3>

                                <span>
                                    Optional
                                </span>

                            </div>


                            <textarea
                                className="fastFoodSpecialRequest"
                                placeholder="Add cooking instructions..."
                            />


                        </div>



                        {/* =================================================
                            QUANTITY
                        ================================================= */}

                        <div className="fastFoodOrderQuantity">


                            <div>

                                <h3>
                                    Quantity
                                </h3>

                                <p>
                                    Select quantity
                                </p>

                            </div>


                            <div className="fastFoodQuantityControl">


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


                                <strong>
                                    {quantity}
                                </strong>


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



                        {/* =================================================
                            TOTAL + CART
                        ================================================= */}

                        <div className="fastFoodOrderBottom">


                            <div>

                                <small>
                                    Total Price
                                </small>


                                <strong>
                                    ₹{totalPrice}
                                </strong>


                                <span>
                                    ₹{singlePrice} × {quantity}
                                </span>

                            </div>



                            <button
                                className="fastFoodAddCart"
                                onClick={
                                    handleAddToCart
                                }
                            >

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