import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DashboardStatsCards.css";

import {
    FaShoppingBag,
    FaMotorcycle,
    FaGift,
    FaTags
} from "react-icons/fa";

const DashboardStatsCards = () => {

    const [stats, setStats] = useState([]);

    useEffect(() => {

        const fetchStats = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "https://onlinefooddelivery-9g60.onrender.com/api/dashboard/stats",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = response.data.stats;

                setStats([

                    {
                        id: 1,
                        title: "My Orders",
                        value: data.totalOrders || 0,
                        change: "Total Orders",
                        color: "#6C63FF",
                        icon: <FaShoppingBag />
                    },

                    {
                        id: 2,
                        title: "Active Orders",
                        value: data.activeOrders || 0,
                        change: "Preparing",
                        color: "#00C896",
                        icon: <FaMotorcycle />
                    },

                    {
                        id: 3,
                        title: "Reward Points",
                        value: data.rewardPoints || 0,
                        change: "Keep Ordering",
                        color: "#FF9800",
                        icon: <FaGift />
                    },

                    {
                        id: 4,
                        title: "Available Offers",
                        value: data.availableOffers || 0,
                        change: "View All Offers",
                        color: "#3D7EFF",
                        icon: <FaTags />
                    }

                ]);

            } catch (error) {

                console.error("Stats Error:", error.response?.data || error.message);

                // Fallback Data
                setStats([

                    {
                        id: 1,
                        title: "My Orders",
                        value: "18",
                        change: "+3 this month",
                        color: "#6C63FF",
                        icon: <FaShoppingBag />
                    },

                    {
                        id: 2,
                        title: "Active Orders",
                        value: "1",
                        change: "Preparing",
                        color: "#00C896",
                        icon: <FaMotorcycle />
                    },

                    {
                        id: 3,
                        title: "Reward Points",
                        value: "1,250",
                        change: "+150 this month",
                        color: "#FF9800",
                        icon: <FaGift />
                    },

                    {
                        id: 4,
                        title: "Available Offers",
                        value: "6",
                        change: "View all offers",
                        color: "#3D7EFF",
                        icon: <FaTags />
                    }

                ]);

            }

        };

        fetchStats();

    }, []);

    return (

        <div className="stats-grid">

            {
                stats.map((item) => (

                    <div className="stat-card" key={item.id}>
                        <div className="stat-icon" style={{ background: item.color }}>
                            {item.icon}
                        </div>

                        <div className="stat-content">

                            <h4>{item.title}</h4>

                            <h2>{item.value}</h2>

                            <p>{item.change}</p>

                        </div>

                    </div>

                ))
            }

        </div>

    );

};

export default DashboardStatsCards;