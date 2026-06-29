import { useEffect, useState } from "react";
import axios from "axios";

import "./Orders.css";

const Orders = () => {

    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchOrders();

    }, []);

    const fetchOrders = async () => {

        try{

            const token = localStorage.getItem("token");

            const { data } = await axios.get(

                "https://onlinefooddelivery-9g60.onrender.com/api/orders",

                {

                    headers:{

                        Authorization:`Bearer ${token}`

                    }

                }

            );

            setOrders(data.orders || []);

        }

        catch(error){

            console.log(error);

        }

        finally{

            setLoading(false);

        }

    };

    if(loading){

        return <h2>Loading Orders...</h2>;

    }

    return(

        <div className="orders-page">

            <div className="orders-header">

                <h1>

                    My Orders

                </h1>

                <p>

                    Track your previous and current orders.

                </p>

            </div>

            {

                orders.length === 0 ? (

                    <div className="empty-orders">

                        <h2>

                            No Orders Found

                        </h2>

                        <p>

                            Your order history will appear here.

                        </p>

                    </div>

                ) : (

                    <div className="orders-list">
                                                {

                            orders.map((order) => (

                                <div
                                    key={order._id}
                                    className="order-card"
                                >

                                    <div className="order-top">

                                        <div>

                                            <h3>

                                                Order #
                                                {order._id.slice(-6)}

                                            </h3>

                                            <p>

                                                Date :{" "}

                                                {
                                                    new Date(
                                                        order.createdAt
                                                    ).toLocaleDateString()
                                                }

                                            </p>

                                        </div>

                                        <div
                                            className={`status ${order.status?.toLowerCase()}`}
                                        >

                                            {order.status}

                                        </div>

                                    </div>

                                    <div className="order-items">

                                        {

                                            order.items?.map((item, index) => (

                                                <div
                                                    key={index}
                                                    className="order-item"
                                                >

                                                    <span>

                                                        {item.name}

                                                    </span>

                                                    <span>

                                                        x{item.quantity}

                                                    </span>

                                                </div>

                                            ))

                                        }

                                    </div>

                                    <div className="order-bottom">

                                        <h3>

                                            Total : ₹{order.totalAmount}

                                        </h3>

                                        <button
                                            className="view-btn"
                                        >

                                            View Details

                                        </button>

                                    </div>

                                    <div className="orders-actions">

                                        <button
                                            className="reorder-btn"
                                        >

                                            🔄 Reorder

                                        </button>

                                        <button
                                            className="rate-btn"
                                        >

                                            ⭐ Rate Order

                                        </button>

                                    </div>

                                </div>

                            ))

                        }

                    </div>
                            )

            }

        </div>

    );

};

export default Orders;