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

    const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    rewardPoints: 0,
    availableOffers: 0
    });


    const cards = [

        {
            id:1,
            title:"My Orders",
            value:stats.totalOrders,
            change:"Total Orders",
            color:"#6C63FF",
            icon:<FaShoppingBag/>
        },
    
        {
            id:2,
            title:"Active Orders",
            value:stats.activeOrders,
            change:"Preparing",
            color:"#00C896",
            icon:<FaMotorcycle/>
        },
    
        {
            id:3,
            title:"Reward Points",
            value:stats.rewardPoints,
            change:"Keep Ordering",
            color:"#FF9800",
            icon:<FaGift/>
        },
    
        {
            id:4,
            title:"Available Offers",
            value:stats.availableOffers,
            change:"View All Offers",
            color:"#3D7EFF",
            icon:<FaTags/>
        }
    
    ];

    useEffect(() => {

        const fetchStats = async () => {
    
            try {
    
                const token = localStorage.getItem("token");
    
                const { data } = await axios.get(
                    "https://onlinefooddelivery-9g60.onrender.com/api/dashboard/stats",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
    
                if (data.success) {
                    setStats(data.stats);
                }
    
            } catch (err) {
                console.error(err);
            }
    
        };
    
        fetchStats();
    
    }, []);

    return (

        <div className="stats-grid">

            {
                cards.map((item) => (

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