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

import "./SaladsOrder.css";

import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";


export default function SaladsOrder(){

    const location = useLocation();
    const navigate = useNavigate();

    const salad = location.state?.salad;

    const [size,setSize] = useState("Medium");
    const [dressing,setDressing] = useState("Classic");
    const [extras,setExtras] = useState([]);
    const [quantity,setQuantity] = useState(1);


    if(!salad){

        return(
            <div className="saladsOrderError">

                <div>
                    🥗
                </div>

                <h2>
                    Salad Not Found
                </h2>

                <p>
                    Please select a salad from the salads menu.
                </p>

                <button
                    onClick={() =>
                        navigate("/order-salads")
                    }
                >
                    Back to Salads
                </button>

            </div>
        );

    }


    const saladName =
        salad.name || "Fresh Garden Salad";

    const restaurant =
        salad.restaurant || "Fresh Bowl";

    const description =
        salad.description ||
        "Freshly prepared healthy salad with premium ingredients.";

    const image =
        salad.image ||
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000";

    const basePrice =
        Number(salad.price) || 199;

    const rating =
        salad.rating || "4.8";


    const sizePrices = {
        Small:-30,
        Medium:0,
        Large:70
    };


    const dressingPrices = {
        Classic:0,
        "Caesar":30,
        "Honey Mustard":25,
        "Italian":20
    };


    const extraPrices = {
        "Extra Paneer":50,
        "Grilled Chicken":80,
        "Avocado":60,
        "Extra Corn":25,
        "Extra Cheese":35,
        "Seeds Mix":30
    };


    const toggleExtra = (item) => {

        setExtras(prev =>
            prev.includes(item)
                ? prev.filter(extra => extra !== item)
                : [...prev,item]
        );

    };


    const extrasTotal =
        extras.reduce(
            (total,item) =>
                total + extraPrices[item],
            0
        );


    const singlePrice =
        basePrice +
        sizePrices[size] +
        dressingPrices[dressing] +
        extrasTotal;


    const totalPrice =
        singlePrice * quantity;


    const handleAddToCart = () => {

        const cartItem = {

            ...salad,

            quantity,

            selectedSize:size,

            selectedDressing:dressing,

            extras,

            finalPrice:singlePrice,

            foodType:"Salad"

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


    return(

        <div className="saladsOrderPageLayout">

            <DashboardSidebar />

            <div className="saladsOrderPage">


                <header className="saladsOrderHeader">

                    <button
                        className="saladsOrderBack"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft />
                    </button>

                    <div>

                        <h2>
                            Order Salad
                        </h2>

                        <p>
                            Customize your healthy meal
                        </p>

                    </div>

                    <button
                        className="saladsOrderFavorite"
                    >
                        <FaHeart />
                    </button>

                </header>


                <main className="saladsOrderContainer">


                    <section className="saladsOrderLeft">

                        <div className="saladsOrderImageCard">

                            <img
                                src={image}
                                alt={saladName}
                            />

                        </div>


                        <div className="saladsOrderRating">

                            <FaStar />

                            <strong>
                                {rating}
                            </strong>

                            <span>
                                Excellent
                            </span>

                        </div>


                        <div className="saladsOrderDelivery">

                            <div>

                                <FaMotorcycle />

                                <section>
                                    <strong>
                                        15–25 min
                                    </strong>

                                    <span>
                                        Fast delivery
                                    </span>
                                </section>

                            </div>


                            <div>

                                <FaCheckCircle />

                                <section>
                                    <strong>
                                        Fresh
                                    </strong>

                                    <span>
                                        Prepared fresh
                                    </span>
                                </section>

                            </div>

                        </div>

                    </section>


                    <section className="saladsOrderRight">

                        <span className="saladsOrderRestaurant">
                            {restaurant}
                        </span>

                        <h1>
                            {saladName}
                        </h1>

                        <p className="saladsOrderDescription">
                            {description}
                        </p>


                        {/* SIZE */}

                        <div className="saladsOption">

                            <h3>
                                Choose Size
                            </h3>

                            <div className="saladsOptions">

                                {Object.keys(sizePrices).map(item => (

                                    <button
                                        key={item}
                                        className={
                                            size === item
                                                ? "selected"
                                                : ""
                                        }
                                        onClick={() =>
                                            setSize(item)
                                        }
                                    >

                                        <span>
                                            {item}
                                        </span>

                                        <small>
                                            {sizePrices[item] === 0
                                                ? "Included"
                                                : sizePrices[item] > 0
                                                    ? `+₹${sizePrices[item]}`
                                                    : `-₹${Math.abs(sizePrices[item])}`
                                            }
                                        </small>

                                    </button>

                                ))}

                            </div>

                        </div>


                        {/* DRESSING */}

                        <div className="saladsOption">

                            <h3>
                                Choose Dressing
                            </h3>

                            <div className="saladsOptions">

                                {Object.keys(dressingPrices).map(item => (

                                    <button
                                        key={item}
                                        className={
                                            dressing === item
                                                ? "selected"
                                                : ""
                                        }
                                        onClick={() =>
                                            setDressing(item)
                                        }
                                    >

                                        <span>
                                            {item}
                                        </span>

                                        <small>
                                            {dressingPrices[item] === 0
                                                ? "Included"
                                                : `+₹${dressingPrices[item]}`
                                            }
                                        </small>

                                    </button>

                                ))}

                            </div>

                        </div>


                        {/* EXTRAS */}

                        <div className="saladsOption">

                            <h3>
                                Add Extras
                            </h3>

                            <div className="saladsExtraGrid">

                                {Object.keys(extraPrices).map(item => (

                                    <button
                                        key={item}
                                        className={
                                            extras.includes(item)
                                                ? "selected"
                                                : ""
                                        }
                                        onClick={() =>
                                            toggleExtra(item)
                                        }
                                    >

                                        <span>
                                            {item}
                                        </span>

                                        <small>
                                            +₹{extraPrices[item]}
                                        </small>

                                    </button>

                                ))}

                            </div>

                        </div>


                        {/* QUANTITY */}

                        <div className="saladsQuantityRow">

                            <strong>
                                Quantity
                            </strong>

                            <div>

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


                        {/* TOTAL */}

                        <div className="saladsTotal">

                            <div>

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ₹{totalPrice}
                                </strong>

                            </div>


                            <button
                                onClick={handleAddToCart}
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