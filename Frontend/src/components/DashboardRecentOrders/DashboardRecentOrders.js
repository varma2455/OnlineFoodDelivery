import React from "react";
import "./DashboardRecentOrders.css";

import {
    FaCheckCircle,
    FaClock,
    FaMotorcycle,
    FaEye
} from "react-icons/fa";

const orders = [

    {
        id:"#ORD1025",
        customer:"Rahul Sharma",
        food:"Chicken Burger",
        amount:"₹299",
        status:"Delivered",
        image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300"
    },

    {
        id:"#ORD1026",
        customer:"Priya Reddy",
        food:"Veg Pizza",
        amount:"₹399",
        status:"Preparing",
        image:"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300"
    },

    {
        id:"#ORD1027",
        customer:"Kiran Kumar",
        food:"Chicken Biryani",
        amount:"₹249",
        status:"On The Way",
        image:"https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=300"
    },

    {
        id:"#ORD1028",
        customer:"Anjali",
        food:"White Pasta",
        amount:"₹329",
        status:"Delivered",
        image:"https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300"
    }

];

const DashboardRecentOrders = () => {

    const getStatusIcon = (status) => {

        switch(status){

            case "Delivered":
                return <FaCheckCircle/>;

            case "Preparing":
                return <FaClock/>;

            default:
                return <FaMotorcycle/>;

        }

    };

    const getStatusClass = (status) => {

        switch(status){

            case "Delivered":
                return "delivered";

            case "Preparing":
                return "preparing";

            default:
                return "ontheway";

        }

    };

    return (

        <div className="recent-orders">

            <div className="orders-header">

                <div>

                    <h2>
                        Recent Orders
                    </h2>

                    <p>
                        Latest customer orders
                    </p>

                </div>

                <button>

                    View All

                </button>

            </div>

            <div className="orders-list">

                {

                    orders.map((order)=>(

                        <div
                            className="order-card"
                            key={order.id}
                        >

                            <img
                                src={order.image}
                                alt={order.food}
                            />

                            <div className="order-details">

                                <h3>

                                    {order.food}

                                </h3>

                                <p>

                                    {order.customer}

                                </p>

                                <small>

                                    {order.id}

                                </small>

                            </div>

                            <div className="order-right">

                                <h4>

                                    {order.amount}

                                </h4>

                                <span
                                    className={`status ${getStatusClass(order.status)}`}
                                >

                                    {getStatusIcon(order.status)}

                                    {order.status}

                                </span>

                                <button>

                                    <FaEye/>

                                </button>

                            </div>

                        </div>

                    ))

                }

            </div>

        </div>

    );

};

export default DashboardRecentOrders;