import React, { useEffect, useState } from "react";
import axios from "axios";

import "./Dashboard.css";

import DashboardSidebar from "../../components/DashboardSidebar/DashboardSidebar";
import DashboardNavbar from "../../components/DashboardNavbar/DashboardNavbar";
import DashboardStatsCards from "../../components/DashboardStatsCards/DashboardStatsCards";
import DashboardHeroBanner from "../../components/DashboardHeroBanner/DashboardHeroBanner";
import DashboardPopularFoods from "../../components/DashboardPopularFoods/DashboardPopularFoods";
import DashboardWalletCard from "../../components/DashboardWalletCard/DashboardWalletCard";
import DashboardRecentOrders from "../../components/DashboardRecentOrders/DashboardRecentOrders";
import DashboardBestOffers from "../../components/DashboardBestOffers/DashboardBestOffers";
import DashboardFooterFeatures from "../../components/DashboardFooterFeatures/DashboardFooterFeatures";

const Dashboard = () => {



    const [dashboardData, setDashboardData] = useState({
        user: {},
        stats: {},
        wallet: {},
        recentOrders: [],
        offers: [],
        foods: [],
        features: []
    });
    
    const [loading, setLoading] = useState(true);


    

    return (

        <div className="dashboard">

            {/* Sidebar */}

            <DashboardSidebar />

            {/* Main Content */}

            <div className="dashboard-content">

                {/* Top Navbar */}

                <DashboardNavbar />

                {/* Dashboard Grid */}

                <div className="dashboard-wrapper">

                    {/* Left Section */}

                    <div className="left-section">
                    <br></br>
                        <DashboardStatsCards />
                        <br></br>
                        <DashboardHeroBanner />
                        <br></br>
                        <DashboardPopularFoods />
                        <br></br>
                        <DashboardFooterFeatures />
                    </div>

                    <div className="right-section">
                        <DashboardWalletCard />
                        <DashboardRecentOrders />
                        <DashboardBestOffers />
                    </div>

                </div>

            </div>

        </div>

    );

};

export default Dashboard;