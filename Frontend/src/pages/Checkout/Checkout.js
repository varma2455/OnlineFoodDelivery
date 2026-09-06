import { useState } from "react";
import { Link } from "react-router-dom";

import "./Checkout.css";

const Checkout = () => {

    const [formData, setFormData] = useState({

        fullName: "",

        email: "",

        phone: "",

        address: "",

        city: "",

        state: "",

        pincode: "",

        paymentMethod: "Cash On Delivery"

    });

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });

    };

    const placeOrder = (e) => {

        e.preventDefault();

        alert("🎉 Order Placed Successfully!");

    };

    return (

        <div className="checkout-page">

            <div className="checkout-header">

                <h1>

                    Checkout

                </h1>

                <p>

                    Complete your delivery details to place the order.

                </p>

            </div>

            <div className="checkout-container">

                <form
                    className="checkout-form"
                    onSubmit={placeOrder}
                >

                    <h2>

                        Delivery Information

                    </h2>

                    <div className="input-group">

                        <label>

                            Full Name

                        </label>

                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="input-group">

                        <label>

                            Email Address

                        </label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="input-group">

                        <label>

                            Mobile Number

                        </label>

                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />

                    </div>
                                        <div className="input-group">

                        <label>

                            Delivery Address

                        </label>

                        <textarea
                            name="address"
                            rows="4"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        ></textarea>

                    </div>

                    <div className="input-row">

                        <div className="input-group">

                            <label>

                                City

                            </label>

                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />

                        </div>

                        <div className="input-group">

                            <label>

                                State

                            </label>

                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                            />

                        </div>

                    </div>

                    <div className="input-group">

                        <label>

                            PIN Code

                        </label>

                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            required
                        />

                    </div>

                    <div className="input-group">

                        <label>

                            Payment Method

                        </label>

                        <select
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                        >

                            <option>

                                Cash On Delivery

                            </option>

                            <option>

                                UPI

                            </option>

                            <option>

                                Credit Card

                            </option>

                            <option>

                                Debit Card

                            </option>

                            <option>

                                Net Banking

                            </option>

                        </select>

                    </div>

                </form>

                <div className="checkout-summary">

                    <h2>

                        Order Summary

                    </h2>

                    <div className="summary-row">

                        <span>

                            Items Total

                        </span>

                        <span>

                            ₹799

                        </span>

                    </div>

                    <div className="summary-row">

                        <span>

                            Delivery Charge

                        </span>

                        <span>

                            FREE

                        </span>

                    </div>

                    <div className="summary-row total">

                        <span>

                            Grand Total

                        </span>

                        <span>

                            ₹799

                        </span>

                    </div>
                                        <div className="coupon-box">

                        <input
                            type="text"
                            placeholder="Enter Coupon Code"
                        />

                        <button
                            type="button"
                        >

                            Apply

                        </button>

                    </div>

                    <button
                        type="submit"
                        form="checkoutForm"
                        className="place-order-btn"
                    >

                        Place Order

                    </button>

                    <Link
                        to="/cart"
                        className="back-cart-btn"
                    >

                        ← Back To Cart

                    </Link>

                </div>

            </div>

        </div>

    );

};

export default Checkout;