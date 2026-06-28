import { useEffect, useState } from "react";
import axios from "axios";

import "./OrderManagement.css";

const OrderManagement = () => {

    const [orders, setOrders] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        fetchOrders();

    }, []);

    const fetchOrders = async () => {

        try{

            const token = localStorage.getItem("token");

            const { data } = await axios.get(

                "http://localhost:5000/api/admin/orders",

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

    const filteredOrders = orders.filter((order)=>

        order.user?.name
            ?.toLowerCase()
            .includes(search.toLowerCase())

    );

    if(loading){

        return <h2>Loading Orders...</h2>;

    }

    return(

        <div className="order-management-page">

            <div className="order-header">

                <h1>

                    Order Management

                </h1>

                <p>

                    Manage all customer orders.

                </p>

            </div>

            <div className="order-toolbar">

                <input

                    type="text"

                    placeholder="Search customer..."

                    value={search}

                    onChange={(e)=>

                        setSearch(e.target.value)

                    }

                />

            </div>

            <div className="orders-table">
                                <table>

                    <thead>

                        <tr>

                            <th>Customer</th>

                            <th>Amount</th>

                            <th>Status</th>

                            <th>Date</th>

                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        {

                            filteredOrders.map((order) => (

                                <tr key={order._id}>

                                    <td>

                                        {

                                            order.user?.name ||

                                            "Unknown User"

                                        }

                                    </td>

                                    <td>

                                        ₹{order.totalAmount}

                                    </td>

                                    <td>

                                        <select
                                            defaultValue={order.status}
                                        >

                                            <option>

                                                Pending

                                            </option>

                                            <option>

                                                Preparing

                                            </option>

                                            <option>

                                                Out for Delivery

                                            </option>

                                            <option>

                                                Delivered

                                            </option>

                                            <option>

                                                Cancelled

                                            </option>

                                        </select>

                                    </td>

                                    <td>

                                        {

                                            new Date(
                                                order.createdAt
                                            ).toLocaleDateString()

                                        }

                                    </td>

                                    <td>

                                        <button
                                            className="delete-btn"
                                        >

                                            Delete

                                        </button>

                                    </td>

                                </tr>

                            ))

                        }

                    </tbody>

                </table>
            </div>

        </div>
        

    );

};

export default OrderManagement;