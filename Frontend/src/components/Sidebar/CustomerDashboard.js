import React from "react";
import "./CustomerDashboard.css";

import {
    FaHome,
    FaClipboardList,
    FaHeart,
    FaWallet,
    FaMapMarkerAlt,
    FaUser,
    FaBell,
    FaCog,
    FaQuestionCircle,
    FaSignOutAlt,
    FaSearch,
    FaShoppingBag,
    FaCheckCircle,
    FaMoneyBillWave,
    FaStar
} from "react-icons/fa";

const dashboardStats = [
    {
        title: "Total Orders",
        value: "24",
        subtitle: "Lifetime Orders",
        icon: <FaShoppingBag />
    },
    {
        title: "Completed",
        value: "20",
        subtitle: "Delivered Orders",
        icon: <FaCheckCircle />
    },
    {
        title: "Total Spent",
        value: "₹4,560",
        subtitle: "Overall Spending",
        icon: <FaMoneyBillWave />
    },
    {
        title: "Reward Points",
        value: "320",
        subtitle: "Available Rewards",
        icon: <FaStar />
    }
];

const CustomerDashboard = () => {

    return (

        <div className="customer-dashboard">

            {/* ==========================
                    SIDEBAR
            ========================== */}

            <aside className="customer-sidebar">

                <div className="logo">

                    <h2>

                        Food<span>Express</span>

                    </h2>

                </div>

                <ul>

                    <li className="active">
                        <FaHome />
                        Dashboard
                    </li>

                    <li>
                        <FaClipboardList />
                        My Orders
                    </li>

                    <li>
                        <FaHeart />
                        Favorites
                    </li>

                    <li>
                        <FaWallet />
                        Wallet
                    </li>

                    <li>
                        <FaMapMarkerAlt />
                        Addresses
                    </li>

                    <li>
                        <FaUser />
                        Profile
                    </li>

                    <li>
                        <FaBell />
                        Notifications
                    </li>

                    <li>
                        <FaCog />
                        Settings
                    </li>

                    <li>
                        <FaQuestionCircle />
                        Help
                    </li>

                    <li>
                        <FaSignOutAlt />
                        Logout
                    </li>

                </ul>

            </aside>

            {/* ==========================
                    MAIN
            ========================== */}

            <main className="customer-main">

                {/* ======================
                    NAVBAR
                ====================== */}

                <div className="customer-navbar">

                    <div className="search-box">

                        <FaSearch />

                        <input
                            type="text"
                            placeholder="Search restaurants, food..."
                        />

                    </div>

                    <div className="navbar-right">

                        <button className="notification-btn">

                            <FaBell />

                        </button>

                        <div className="customer-profile">

                            <img
                                src="https://i.pravatar.cc/100?img=13"
                                alt="customer"
                            />

                            <div>

                                <h4>Rahul Kumar</h4>

                                <p>Premium Member</p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ======================
                    WELCOME
                ====================== */}

                <section className="welcome-section">

                    <div>

                        <h1>

                            Welcome Back, Rahul 👋

                        </h1>

                        <p>

                            Discover delicious meals and exclusive offers
                            made just for you.

                        </p>

                    </div>

                </section>

                {/* ======================
                    STATS
                ====================== */}

                <section className="stats-grid">

                    {

                        dashboardStats.map((item,index)=>(

                            <div
                                className="stats-card"
                                key={index}
                            >

                                <div className="stats-icon">

                                    {item.icon}

                                </div>

                                <div>

                                    <h3>

                                        {item.value}

                                    </h3>

                                    <h4>

                                        {item.title}

                                    </h4>

                                    <p>

                                        {item.subtitle}

                                    </p>

                                </div>

                            </div>

                        ))

                    }

                </section>

            </main>

        </div>

    );

};

{/* ==========================================
        PROMOTIONAL BANNER
========================================== */}

<section className="promo-banner">

<div className="promo-content">

    <span className="offer-badge">

        🔥 Limited Time Offer

    </span>

    <h2>

        Get <span>20% OFF</span> on your next order

    </h2>

    <p>

        Use Coupon Code

        <strong> FOOD20 </strong>

        and enjoy delicious meals at discounted prices.

    </p>

    <button>

        Order Now

    </button>

</div>

<div className="promo-image">

    🍔🍕🥤

</div>

</section>

{/* ==========================================
    RECENT ORDERS + WALLET
========================================== */}

<section className="dashboard-row">

<div className="recent-orders">

    <div className="section-header">

        <h2>

            Recent Orders

        </h2>

        <button>

            View All

        </button>

    </div>

    <table>

        <thead>

            <tr>

                <th>Food</th>

                <th>Restaurant</th>

                <th>Price</th>

                <th>Status</th>

            </tr>

        </thead>

        <tbody>

            <tr>

                <td>Chicken Burger</td>

                <td>Burger Hub</td>

                <td>₹299</td>

                <td>

                    <span className="delivered">

                        Delivered

                    </span>

                </td>

            </tr>

            <tr>

                <td>Veg Pizza</td>

                <td>Pizza Palace</td>

                <td>₹499</td>

                <td>

                    <span className="preparing">

                        Preparing

                    </span>

                </td>

            </tr>

            <tr>

                <td>Biryani</td>

                <td>Biryani House</td>

                <td>₹349</td>

                <td>

                    <span className="ontheway">

                        On The Way

                    </span>

                </td>

            </tr>

        </tbody>

    </table>

</div>

{/* ==========================
        WALLET
========================== */}

<div className="wallet-card">

    <h2>

        Wallet Balance

    </h2>

    <h1>

        ₹1,250

    </h1>

    <p>

        Available Balance

    </p>

    <button>

        Add Money

    </button>

</div>

</section>

{/* ==========================================
    SAVED ADDRESS
========================================== */}

<section className="address-card">

<div>

    <h2>

        Delivery Address

    </h2>

    <p>

        📍 H.No 21-15-6,

        MG Road,

        Vijayawada,

        Andhra Pradesh,

        India - 520001

    </p>

</div>

<button>

    Change Address

</button>

</section>

{/* ==========================================
    FEATURED RESTAURANTS
========================================== */}

<section className="featured-restaurants">

<div className="section-header">

    <h2>

        Recommended Restaurants

    </h2>

    <button>

        View All

    </button>

</div>

<div className="restaurant-grid">

    <div className="restaurant-card">

        <div className="restaurant-image">

            🍔

        </div>

        <h3>

            Burger Hub

        </h3>

        <p>

            Burgers • Fast Food

        </p>

        <span>

            ⭐ 4.9

        </span>

    </div>

    <div className="restaurant-card">

        <div className="restaurant-image">

            🍕

        </div>

        <h3>

            Pizza Palace

        </h3>

        <p>

            Pizza • Italian

        </p>

        <span>

            ⭐ 4.8

        </span>

    </div>

    <div className="restaurant-card">

        <div className="restaurant-image">

            🍗

        </div>

        <h3>

            Biryani House

        </h3>

        <p>

            Indian • Biryani

        </p>

        <span>

            ⭐ 4.7

        </span>

    </div>

</div>

</section>

{/* ==========================================
        ORDER AGAIN
========================================== */}

<section className="order-again">

<div className="section-header">

    <h2>

        Order Again

    </h2>

    <button>

        View All

    </button>

</div>

<div className="food-grid">

    <div className="food-card">

        <div className="food-image">

            🍔

        </div>

        <h3>

            Chicken Burger

        </h3>

        <p>

            Burger Hub

        </p>

        <h4>

            ₹299

        </h4>

        <button>

            Order Now

        </button>

    </div>

    <div className="food-card">

        <div className="food-image">

            🍕

        </div>

        <h3>

            Veg Pizza

        </h3>

        <p>

            Pizza Palace

        </p>

        <h4>

            ₹499

        </h4>

        <button>

            Order Now

        </button>

    </div>

    <div className="food-card">

        <div className="food-image">

            🍗

        </div>

        <h3>

            Chicken Biryani

        </h3>

        <p>

            Biryani House

        </p>

        <h4>

            ₹349

        </h4>

        <button>

            Order Now

        </button>

    </div>

    <div className="food-card">

        <div className="food-image">

            🥤

        </div>

        <h3>

            Cold Coffee

        </h3>

        <p>

            Cafe Express

        </p>

        <h4>

            ₹199

        </h4>

        <button>

            Order Now

        </button>

    </div>

</div>

</section>

{/* ==========================================
    OFFERS
========================================== */}

<section className="offers-section">

<div className="section-header">

    <h2>

        Offers For You

    </h2>

</div>

<div className="offer-grid">

    <div className="offer-card">

        <h2>

            50% OFF

        </h2>

        <p>

            On First Order

        </p>

    </div>

    <div className="offer-card">

        <h2>

            FREE DELIVERY

        </h2>

        <p>

            Orders Above ₹499

        </p>

    </div>

    <div className="offer-card">

        <h2>

            BUY 1 GET 1

        </h2>

        <p>

            Selected Restaurants

        </p>

    </div>

</div>

</section>

{/* ==========================================
    DASHBOARD BOTTOM
========================================== */}

<section className="bottom-section">

<div className="notifications-card">

    <h2>

        Notifications

    </h2>

    <ul>

        <li>

            🍕 Your Pizza has been delivered.

        </li>

        <li>

            🎁 New coupon FOOD20 is available.

        </li>

        <li>

            ⭐ You earned 25 reward points.

        </li>

        <li>

            🚚 Your wallet cashback is credited.

        </li>

    </ul>

</div>

<div className="reward-card">

    <h2>

        Loyalty Rewards

    </h2>

    <h1>

        320 Points

    </h1>

    <p>

        Earn 180 more points to unlock

        <strong> Gold Membership</strong>

    </p>

    <button>

        Redeem Rewards

    </button>

</div>

</section>

{/* ==========================================
    FOOTER
========================================== */}

<footer className="customer-footer">

<div>

    <h3>

        Food<span>Express</span>

    </h3>

    <p>

        Delicious Food Delivered Fast.

    </p>

</div>

<div>

    <p>

        © 2026 FoodExpress. All Rights Reserved.

    </p>

</div>

</footer>

export default CustomerDashboard;