import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import "./Cart.css";

const Cart = () => {

    const [cartItems, setCartItems] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchCart();

    }, []);

    const fetchCart = async () => {

        try {

            const { data } = await axios.get(
                "http://localhost:5000/api/cart"
            );

            setCartItems(data.cart || []);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    const increaseQuantity = (id) => {

        setCartItems(

            cartItems.map(item =>

                item._id === id
                    ? {
                        ...item,
                        quantity: item.quantity + 1
                    }
                    : item

            )

        );

    };

    const decreaseQuantity = (id) => {

        setCartItems(

            cartItems.map(item =>

                item._id === id

                    ? {

                        ...item,

                        quantity:

                            item.quantity > 1
                                ? item.quantity - 1
                                : 1

                    }

                    : item

            )

        );

    };

    const removeItem = (id) => {

        setCartItems(

            cartItems.filter(
                item => item._id !== id
            )

        );

    };

    const subtotal = cartItems.reduce(

        (total, item) =>

            total + (item.price * item.quantity),

        0

    );

    const deliveryCharge = subtotal > 500 ? 0 : 50;

    const total = subtotal + deliveryCharge;

    if (loading) {

        return <h2>Loading Cart...</h2>;

    }

    return (

        <div className="cart-page">

            <div className="cart-header">

                <h1>

                    Shopping Cart

                </h1>

                <p>

                    Review your selected food items.

                </p>

            </div>

            {
                cartItems.length === 0 ? (

                    <div className="empty-cart">

                        <h2>

                            Your Cart Is Empty

                        </h2>

                        <p>

                            Add delicious food to continue shopping.

                        </p>

                        <Link
                            to="/menu"
                            className="shop-btn"
                        >

                            Browse Menu

                        </Link>

                    </div>

                ) : (

                    <div className="cart-container">
                                                <div className="cart-items">

{

    cartItems.map((item) => (

        <div
            key={item._id}
            className="cart-item"
        >

            <img
                src={
                    item.image
                        ? `http://localhost:5000/uploads/${item.image}`
                        : "https://via.placeholder.com/150"
                }
                alt={item.name}
            />

            <div className="cart-details">

                <h3>

                    {item.name}

                </h3>

                <p>

                    ₹{item.price}

                </p>

                <div className="quantity-box">

                    <button
                        onClick={() =>
                            decreaseQuantity(item._id)
                        }
                    >

                        -

                    </button>

                    <span>

                        {item.quantity}

                    </span>

                    <button
                        onClick={() =>
                            increaseQuantity(item._id)
                        }
                    >

                        +

                    </button>

                </div>

            </div>

            <div className="cart-price">

                <h3>

                    ₹{item.price * item.quantity}

                </h3>

                <button
                    className="remove-btn"
                    onClick={() =>
                        removeItem(item._id)
                    }
                >

                    Remove

                </button>

            </div>

        </div>

    ))

}

</div>

<div className="cart-summary">

<h2>

    Order Summary

</h2>

<div className="summary-row">

    <span>

        Subtotal

    </span>

    <span>

        ₹{subtotal}

    </span>

</div>

<div className="summary-row">

    <span>

        Delivery Charge

    </span>

    <span>

        {

            deliveryCharge === 0

                ? "FREE"

                : `₹${deliveryCharge}`

        }

    </span>

</div>

<div className="summary-row total">

    <span>

        Total

    </span>

    <span>

        ₹{total}

    </span>

</div>
<div className="coupon-box">

<input
    type="text"
    placeholder="Enter Coupon Code"
/>

<button>

    Apply

</button>

</div>

<Link
to="/checkout"
className="checkout-btn"
>

Proceed To Checkout

</Link>

</div>

</div>

)

}

</div>

);

};

export default Cart;
                    