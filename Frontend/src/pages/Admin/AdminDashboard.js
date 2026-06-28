import { useEffect, useState } from "react";
import axios from "axios";

import "./AdminDashboard.css";

const AdminDashboard = () => {

    const [stats, setStats] = useState({

        users: 0,

        foods: 0,

        orders: 0,

        revenue: 0

    });

    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {

        fetchDashboard();

    }, []);

    const fetchDashboard = async () => {

        try{

            const token = localStorage.getItem("token");

            const { data } = await axios.get(

                "http://localhost:5000/api/admin/dashboard",

                {

                    headers:{

                        Authorization:`Bearer ${token}`

                    }

                }

            );

            setStats(data.stats);

            setRecentOrders(data.recentOrders);

        }

        catch(error){

            console.log(error);

        }

    };

    return(

        <div className="admin-page">

            <div className="admin-header">

                <h1>

                    Admin Dashboard

                </h1>

                <p>

                    Manage your online food delivery platform.

                </p>

            </div>

            <div className="stats-grid">

                <div className="stat-card">

                    <h2>

                        👥 Users

                    </h2>

                    <h1>

                        {stats.users}

                    </h1>

                </div>

                <div className="stat-card">

                    <h2>

                        🍔 Foods

                    </h2>

                    <h1>

                        {stats.foods}

                    </h1>

                </div>

                <div className="stat-card">

                    <h2>

                        📦 Orders

                    </h2>

                    <h1>

                        {stats.orders}

                    </h1>

                </div>

                <div className="stat-card">

                    <h2>

                        💰 Revenue

                    </h2>

                    <h1>

                        ₹{stats.revenue}

                    </h1>

                </div>

            </div>

            <div className="recent-orders">

                <h2>

                    Recent Orders

                </h2>

                <div className="orders-table">
                                        {

                        recentOrders.length === 0 ? (

                            <p>

                                No recent orders available.

                            </p>

                        ) : (

                            <table>

                                <thead>

                                    <tr>

                                        <th>

                                            Customer

                                        </th>

                                        <th>

                                            Amount

                                        </th>

                                        <th>

                                            Status

                                        </th>

                                        <th>

                                            Date

                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {

                                        recentOrders.map((order) => (

                                            <tr
                                                key={order._id}
                                            >

                                                <td>

                                                    {

                                                        order.user?.name ||

                                                        "Unknown User"

                                                    }

                                                </td>

                                                <td>

                                                    ₹{

                                                        order.totalAmount

                                                    }

                                                </td>

                                                <td>

                                                    <span
                                                        className={`status ${order.status?.toLowerCase()}`}
                                                    >

                                                        {

                                                            order.status

                                                        }

                                                    </span>

                                                </td>

                                                <td>

                                                    {

                                                        new Date(
                                                            order.createdAt
                                                        ).toLocaleDateString()

                                                    }

                                                </td>

                                            </tr>

                                        ))

                                    }

                                </tbody>

                            </table>

                        )

                    }

                </div>

            </div>

            <div className="dashboard-actions">

                <button>

                    🍔 Manage Foods

                </button>

                <button>

                    📦 Manage Orders

                </button>

                <button>

                    👥 Manage Users

                </button>

            </div>
        </div>
        

    );

};

export default AdminDashboard;