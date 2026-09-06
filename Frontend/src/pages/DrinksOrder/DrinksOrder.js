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

import "./DrinksOrder.css";


/* =====================================================
   DEFAULT DRINK
===================================================== */

const defaultDrink = {

    id: 1,

    name: "Fresh Mango Juice",

    restaurant: "Juice Junction",

    rating: "4.8",

    reviews: "2.8k",

    price: 129,

    oldPrice: 159,

    time: "15 min",

    category: "Fresh Juices",

    image:
        "https://images.unsplash.com/photo-1546173159-315724a31696?w=1200",

    description:
        "Freshly prepared mango juice made from ripe, juicy mangoes."

};


/* =====================================================
   COMPONENT
===================================================== */

export default function DrinksOrder() {

    const navigate = useNavigate();

    const location = useLocation();


    /* =================================================
       SELECTED DRINK
    ================================================= */

    const selectedDrink =
        location.state?.drink;


    const item =
        selectedDrink || defaultDrink;


    /* =================================================
       STATES
    ================================================= */

    const [size, setSize] =
        useState("Regular");


    const [iceLevel, setIceLevel] =
        useState("Normal Ice");


    const [sugarLevel, setSugarLevel] =
        useState("Regular");


    const [milkOption, setMilkOption] =
        useState("Regular Milk");


    const [extras, setExtras] =
        useState([]);


    const [quantity, setQuantity] =
        useState(1);


    const [liked, setLiked] =
        useState(false);


    /* =================================================
       SIZE OPTIONS
    ================================================= */

    const sizes = [

        {
            name: "Regular",
            price: 0
        },

        {
            name: "Large",
            price: 40
        },

        {
            name: "Extra Large",
            price: 70
        }

    ];


    /* =================================================
       ICE OPTIONS
    ================================================= */

    const iceOptions = [

        {
            name: "No Ice",
            description: "No ice",
            price: 0
        },

        {
            name: "Less Ice",
            description: "Light ice",
            price: 0
        },

        {
            name: "Normal Ice",
            description: "Regular ice",
            price: 0
        },

        {
            name: "Extra Ice",
            description: "Extra chilled",
            price: 0
        }

    ];


    /* =================================================
       SUGAR OPTIONS
    ================================================= */

    const sugarOptions = [

        {
            name: "No Sugar",
            description: "No added sugar"
        },

        {
            name: "Less Sugar",
            description: "Light sweetness"
        },

        {
            name: "Regular",
            description: "Normal sweetness"
        },

        {
            name: "Extra Sugar",
            description: "Extra sweet"
        }

    ];


    /* =================================================
       MILK OPTIONS
    ================================================= */

    const milkOptions = [

        {
            name: "Regular Milk",
            price: 0
        },

        {
            name: "Low Fat Milk",
            price: 15
        },

        {
            name: "Extra Creamy",
            price: 25
        }

    ];


    /* =================================================
       EXTRA OPTIONS
    ================================================= */

    const extraOptions = [

        {
            name: "Ice Cream",
            price: 40
        },

        {
            name: "Whipped Cream",
            price: 30
        },

        {
            name: "Chocolate",
            price: 25
        },

        {
            name: "Dry Fruits",
            price: 40
        },

        {
            name: "Chia Seeds",
            price: 25
        },

        {
            name: "Extra Fruit",
            price: 35
        }

    ];


    /* =================================================
       TOGGLE EXTRA
    ================================================= */

    const toggleExtra = (selectedExtra) => {

        setExtras((previous) => {

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
       PRICE
    ================================================= */

    const sizePrice =
        sizes.find(
            option =>
                option.name === size
        )?.price || 0;


    const milkPrice =
        milkOptions.find(
            option =>
                option.name === milkOption
        )?.price || 0;


    const extrasPrice =
        extras.reduce(
            (total, option) =>
                total + option.price,
            0
        );


    /*
       Some drinks such as water,
       soft drinks and lemonade don't
       need milk customization.

       We keep the option available
       but its price is only applied
       when the user selects a milk
       option other than Regular.
    */

    const singlePrice =
        item.price +
        sizePrice +
        milkPrice +
        extrasPrice;


    const totalPrice =
        singlePrice * quantity;


    /* =================================================
       ADD TO CART
    ================================================= */

    const handleAddToCart = () => {

        const customizedDrink = {

            ...item,

            size,

            iceLevel,

            sugarLevel,

            milkOption,

            extras,

            quantity,

            singlePrice,

            totalPrice

        };


        console.log(
            "Drink Added To Cart:",
            customizedDrink
        );


        navigate(
            "/cart",
            {
                state: {
                    drink:
                        customizedDrink
                }
            }
        );

    };


    /* =================================================
       PAGE
    ================================================= */

    return (

        <div className="drinksOrderPageLayout">


            {/* =========================================
                SIDEBAR
            ========================================= */}

            <DashboardSidebar />



            {/* =========================================
                MAIN
            ========================================= */}

            <div className="drinksOrderPage">


                {/* =====================================
                    HEADER
                ===================================== */}

                <header className="drinksOrderHeader">


                    <button
                        className="drinksOrderBack"
                        onClick={() =>
                            navigate(-1)
                        }
                    >

                        <FaArrowLeft />

                    </button>


                    <div>

                        <h2>
                            Order Drink
                        </h2>

                        <p>
                            Customize your drink
                        </p>

                    </div>


                    <button
                        className={
                            liked
                                ? "drinksOrderHeart active"
                                : "drinksOrderHeart"
                        }
                        onClick={() =>
                            setLiked(!liked)
                        }
                    >

                        <FaHeart />

                    </button>


                </header>



                {/* =====================================
                    CONTAINER
                ===================================== */}

                <main className="drinksOrderContainer">


                    {/* =================================
                        LEFT
                    ================================= */}

                    <section className="drinksOrderLeft">


                        <div className="drinksOrderImageCard">


                            <img
                                src={item.image}
                                alt={item.name}
                            />


                            <span className="drinksOrderBadge">

                                {item.category}

                            </span>


                        </div>



                        {/* DELIVERY INFO */}

                        <div className="drinksOrderDelivery">


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

                        <div className="drinksOrderDescription">


                            <h3>
                                About this drink
                            </h3>


                            <p>
                                {item.description}
                            </p>


                        </div>


                    </section>



                    {/* =================================
                        RIGHT
                    ================================= */}

                    <section className="drinksOrderRight">


                        {/* RESTAURANT */}

                        <div className="drinksOrderRestaurant">


                            <span>
                                {item.restaurant}
                            </span>


                            <h1>
                                {item.name}
                            </h1>


                            <div className="drinksOrderRating">

                                <FaStar />

                                {item.rating}

                                <span>
                                    • {item.reviews} reviews
                                </span>

                            </div>


                        </div>



                        {/* =================================
                            SIZE
                        ================================= */}

                        <div className="drinksOrderSection">


                            <div className="drinksOrderSectionTitle">

                                <h3>
                                    Choose Size
                                </h3>

                                <span>
                                    Required
                                </span>

                            </div>



                            <div className="drinksOptionGrid">


                                {sizes.map(option => (


                                    <button
                                        key={option.name}
                                        className={
                                            size ===
                                            option.name
                                                ? "drinksOption active"
                                                : "drinksOption"
                                        }
                                        onClick={() =>
                                            setSize(
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


                                        {size ===
                                            option.name && (

                                            <FaCheckCircle />

                                        )}


                                    </button>


                                ))}


                            </div>


                        </div>



                        {/* =================================
                            ICE
                        ================================= */}

                        <div className="drinksOrderSection">


                            <div className="drinksOrderSectionTitle">

                                <h3>
                                    Ice Level
                                </h3>

                                <span>
                                    Required
                                </span>

                            </div>



                            <div className="drinksOptionGrid">


                                {iceOptions.map(option => (


                                    <button
                                        key={option.name}
                                        className={
                                            iceLevel ===
                                            option.name
                                                ? "drinksOption active"
                                                : "drinksOption"
                                        }
                                        onClick={() =>
                                            setIceLevel(
                                                option.name
                                            )
                                        }
                                    >


                                        <div>

                                            <strong>
                                                {option.name}
                                            </strong>

                                            <small>
                                                {option.description}
                                            </small>

                                        </div>


                                        {iceLevel ===
                                            option.name && (

                                            <FaCheckCircle />

                                        )}


                                    </button>


                                ))}


                            </div>


                        </div>



                        {/* =================================
                            SUGAR
                        ================================= */}

                        <div className="drinksOrderSection">


                            <div className="drinksOrderSectionTitle">

                                <h3>
                                    Sugar Level
                                </h3>

                                <span>
                                    Required
                                </span>

                            </div>



                            <div className="drinksOptionGrid">


                                {sugarOptions.map(option => (


                                    <button
                                        key={option.name}
                                        className={
                                            sugarLevel ===
                                            option.name
                                                ? "drinksOption active"
                                                : "drinksOption"
                                        }
                                        onClick={() =>
                                            setSugarLevel(
                                                option.name
                                            )
                                        }
                                    >


                                        <div>

                                            <strong>
                                                {option.name}
                                            </strong>

                                            <small>
                                                {option.description}
                                            </small>

                                        </div>


                                        {sugarLevel ===
                                            option.name && (

                                            <FaCheckCircle />

                                        )}


                                    </button>


                                ))}


                            </div>


                        </div>



                        {/* =================================
                            MILK
                        ================================= */}

                        <div className="drinksOrderSection">


                            <div className="drinksOrderSectionTitle">

                                <h3>
                                    Milk Option
                                </h3>

                                <span>
                                    Optional
                                </span>

                            </div>



                            <div className="drinksOptionGrid">


                                {milkOptions.map(option => (


                                    <button
                                        key={option.name}
                                        className={
                                            milkOption ===
                                            option.name
                                                ? "drinksOption active"
                                                : "drinksOption"
                                        }
                                        onClick={() =>
                                            setMilkOption(
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


                                        {milkOption ===
                                            option.name && (

                                            <FaCheckCircle />

                                        )}


                                    </button>


                                ))}


                            </div>


                        </div>



                        {/* =================================
                            EXTRAS
                        ================================= */}

                        <div className="drinksOrderSection">


                            <div className="drinksOrderSectionTitle">

                                <h3>
                                    Extra Add-ons
                                </h3>

                                <span>
                                    Optional
                                </span>

                            </div>



                            <div className="drinksExtraGrid">


                                {extraOptions.map(option => {


                                    const selected =
                                        extras.some(
                                            extra =>
                                                extra.name ===
                                                option.name
                                        );


                                    return (


                                        <button
                                            key={option.name}
                                            className={
                                                selected
                                                    ? "drinksExtra active"
                                                    : "drinksExtra"
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



                        {/* =================================
                            SPECIAL REQUEST
                        ================================= */}

                        <div className="drinksOrderSection">


                            <div className="drinksOrderSectionTitle">

                                <h3>
                                    Special Request
                                </h3>

                                <span>
                                    Optional
                                </span>

                            </div>


                            <textarea
                                className="drinksSpecialRequest"
                                placeholder="Add any special instructions..."
                            />


                        </div>



                        {/* =================================
                            QUANTITY
                        ================================= */}

                        <div className="drinksOrderQuantity">


                            <div>

                                <h3>
                                    Quantity
                                </h3>

                                <p>
                                    Select quantity
                                </p>

                            </div>


                            <div className="drinksQuantityControl">


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



                        {/* =================================
                            TOTAL
                        ================================= */}

                        <div className="drinksOrderBottom">


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
                                className="drinksAddCart"
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