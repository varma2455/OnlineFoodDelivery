import React from "react";
import "./DashboardStatsCards.css";

import {
  FaShoppingBag,
  FaRupeeSign,
  FaUsers,
  FaStar
} from "react-icons/fa";

const DashboardStatsCards = () => {

    const stats = [

        {
            id:1,
            title:"Total Orders",
            value:"1,248",
            growth:"+12%",
            icon:<FaShoppingBag />,
            color:"#6C63FF"
        },

        {
            id:2,
            title:"Total Revenue",
            value:"₹2,48,950",
            growth:"+18%",
            icon:<FaRupeeSign />,
            color:"#00C896"
        },

        {
            id:3,
            title:"Active Customers",
            value:"842",
            growth:"+8%",
            icon:<FaUsers />,
            color:"#FF8A00"
        },

        {
            id:4,
            title:"Customer Rating",
            value:"4.9",
            growth:"+0.3",
            icon:<FaStar />,
            color:"#FFB703"
        }

    ];

    return (

        <div className="dashboard-stats">

            {

                stats.map((item)=>(

                    <div
                        className="stats-card"
                        key={item.id}
                    >

                        <div className="stats-top">

                            <div
                                className="stats-icon"
                                style={{background:item.color}}
                            >
                                {item.icon}
                            </div>

                            <span className="stats-growth">

                                {item.growth}

                            </span>

                        </div>

                        <div className="stats-body">

                            <h2>{item.value}</h2>

                            <p>{item.title}</p>

                        </div>

                        <div className="stats-progress">

                            <div
                                className="progress-bar"
                                style={{
                                    width:"80%",
                                    background:item.color
                                }}
                            />

                        </div>

                    </div>

                ))

            }

        </div>

    );

};

export default DashboardStatsCards;