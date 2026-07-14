import React from "react";
import "./Dashboard.css";


import {
    FaPizzaSlice,
    FaUtensils,
    FaStar,
    FaArrowUp,
    FaArrowDown
} from "react-icons/fa";


import {
    FaUsers,
    FaStore,
    FaMotorcycle,
    FaHamburger,
    FaShoppingBag,
    FaMoneyBillWave,
    FaClipboardList,
    FaChartLine,
    FaBell,
    FaSearch,
    FaPlus,
    FaGift,
    FaFileAlt,
    FaCog
} from "react-icons/fa";


const recentOrders = [
    {
        id: "#FD1001",
        customer: "Rahul Sharma",
        restaurant: "Burger Hub",
        amount: "$28",
        status: "Completed"
    },
    {
        id: "#FD1002",
        customer: "Anjali",
        restaurant: "Pizza Palace",
        amount: "$18",
        status: "Preparing"
    },
    {
        id: "#FD1003",
        customer: "Varun",
        restaurant: "Biryani House",
        amount: "$42",
        status: "Delivered"
    },
    {
        id: "#FD1004",
        customer: "Priya",
        restaurant: "Chinese Express",
        amount: "$23",
        status: "Pending"
    }
];

const topRestaurants = [
    {
        name: "Burger Hub",
        rating: "4.9",
        revenue: "$25,400"
    },
    {
        name: "Pizza Palace",
        rating: "4.8",
        revenue: "$22,900"
    },
    {
        name: "Biryani House",
        rating: "4.7",
        revenue: "$18,300"
    }
];

const popularFoods = [
    "Chicken Burger",
    "Paneer Pizza",
    "Chicken Biryani",
    "French Fries",
    "Cold Coffee"
];


const stats = [
    {
        title: "Total Customers",
        value: "12,450",
        icon: <FaUsers />,
        change: "+12%"
    },
    {
        title: "Restaurants",
        value: "235",
        icon: <FaStore />,
        change: "+8%"
    },
    {
        title: "Delivery Partners",
        value: "412",
        icon: <FaMotorcycle />,
        change: "+6%"
    },
    {
        title: "Foods",
        value: "1856",
        icon: <FaHamburger />,
        change: "+15%"
    },
    {
        title: "Orders",
        value: "7,891",
        icon: <FaShoppingBag />,
        change: "+18%"
    },
    {
        title: "Revenue",
        value: "$98,540",
        icon: <FaMoneyBillWave />,
        change: "+23%"
    },
    {
        title: "Pending Orders",
        value: "142",
        icon: <FaClipboardList />,
        change: "-5%"
    },
    {
        title: "Growth",
        value: "87%",
        icon: <FaChartLine />,
        change: "+10%"
    }
];


const Dashboard = () => {

    return (

        <div className="dashboard">

            {/* =======================
                TOP NAVBAR
            ======================== */}

            <header className="top-navbar">

                <div className="navbar-left">

                    <h1>

                        Food<span>Express</span>

                    </h1>

                </div>

                <div className="navbar-center">

                    <div className="search-box">

                        <FaSearch />

                        <input
                            type="text"
                            placeholder="Search..."
                        />

                    </div>

                </div>

                <div className="navbar-right">

                    <button className="icon-btn">

                        <FaBell />

                    </button>

                    <div className="admin-profile">

                        <img
                            src="https://i.pravatar.cc/100"
                            alt="admin"
                        />

                        <div>

                            <h4>Admin</h4>

                            <p>Super Admin</p>

                        </div>

                    </div>

                </div>

            </header>

            {/* =======================
                WELCOME SECTION
            ======================== */}

            <section className="welcome-card">

                <div>

                    <h2>

                        Welcome Back 👋

                    </h2>

                    <p>

                        Here's what is happening in your FoodExpress platform today.

                    </p>

                </div>

                <button>

                    View Reports

                </button>

            </section>

            {/* =======================
                STATS CARDS
            ======================== */}

            <section className="stats-grid">

                {

                    stats.map((item, index) => (

                        <div
                            className="stat-card"
                            key={index}
                        >

                            <div className="card-top">

                                <div className="card-icon">

                                    {item.icon}

                                </div>

                                <span>

                                    {item.change}

                                </span>

                            </div>

                            <h3>

                                {item.value}

                            </h3>

                            <p>

                                {item.title}

                            </p>

                        </div>

                    ))

                }

            </section>

            {/* =======================
                QUICK ACTIONS
            ======================== */}

            <section className="quick-actions">

                <h2>

                    Quick Actions

                </h2>

                <div className="action-grid">

                    <button>

                        <FaPlus />

                        Add Food

                    </button>

                    <button>

                        <FaStore />

                        Add Restaurant

                    </button>

                    <button>

                        <FaGift />

                        Create Coupon

                    </button>

                    <button>

                        <FaFileAlt />

                        Reports

                    </button>

                    <button>

                        <FaCog />

                        Settings

                    </button>

                </div>

            </section>


            {/* =========================
    ANALYTICS
========================= */}

<section className="analytics-section">

    <div className="chart-card">

        <div className="card-header">

            <h2>Revenue Overview</h2>

            <span className="growth positive">

                <FaArrowUp />

                18%

            </span>

        </div>

        <div className="chart-placeholder">

            📈 Revenue Chart

        </div>

    </div>

    <div className="chart-card">

        <div className="card-header">

            <h2>Orders Overview</h2>

            <span className="growth positive">

                <FaArrowUp />

                12%

            </span>

        </div>

        <div className="chart-placeholder">

            📊 Orders Chart

        </div>

    </div>

</section>

{/* =========================
    POPULAR FOODS
========================= */}

<section className="dashboard-row">

    <div className="food-card">

        <h2>

            Popular Foods

        </h2>

        {

            popularFoods.map((food,index)=>(

                <div
                    className="food-item"
                    key={index}
                >

                    <FaPizzaSlice />

                    <span>

                        {food}

                    </span>

                </div>

            ))

        }

    </div>

    <div className="restaurant-card">

        <h2>

            Top Restaurants

        </h2>

        {

            topRestaurants.map((item,index)=>(

                <div
                    className="restaurant-item"
                    key={index}
                >

                    <div>

                        <FaUtensils />

                        <strong>

                            {item.name}

                        </strong>

                    </div>

                    <div>

                        ⭐ {item.rating}

                    </div>

                    <div>

                        {item.revenue}

                    </div>

                </div>

            ))

        }

    </div>

</section>

{/* =========================
    RECENT ORDERS
========================= */}

<section className="orders-section">

    <div className="table-card">

        <h2>

            Recent Orders

        </h2>

        <table>

            <thead>

                <tr>

                    <th>Order ID</th>

                    <th>Customer</th>

                    <th>Restaurant</th>

                    <th>Amount</th>

                    <th>Status</th>

                </tr>

            </thead>

            <tbody>

                {

                    recentOrders.map((order,index)=>(

                        <tr key={index}>

                            <td>

                                {order.id}

                            </td>

                            <td>

                                {order.customer}

                            </td>

                            <td>

                                {order.restaurant}

                            </td>

                            <td>

                                {order.amount}

                            </td>

                            <td>

                                <span
                                    className={`status ${order.status.toLowerCase()}`}
                                >

                                    {order.status}

                                </span>

                            </td>

                        </tr>

                    ))

                }

            </tbody>

        </table>

    </div>

</section>

{/* =========================
    REVENUE SUMMARY
========================= */}

<section className="summary-grid">

    <div className="summary-card">

        <h3>

            Today's Revenue

        </h3>

        <h1>

            $12,450

        </h1>

        <span className="positive">

            +15%

        </span>

    </div>

    <div className="summary-card">

        <h3>

            Monthly Revenue

        </h3>

        <h1>

            $2,45,890

        </h1>

        <span className="positive">

            +23%

        </span>

    </div>

    <div className="summary-card">

        <h3>

            Refunds

        </h3>

        <h1>

            $1,240

        </h1>

        <span className="negative">

            <FaArrowDown />

            -3%

        </span>

    </div>

</section>

{/* =========================
    LOWER DASHBOARD
========================= */}

<section className="lower-dashboard">

    {/* ======================
        LATEST CUSTOMERS
    ======================= */}

    <div className="latest-customers">

        <h2>Latest Customers</h2>

        <div className="customer-list">

            <div className="customer-item">
                <img src="https://i.pravatar.cc/100?img=1" alt="" />
                <div>
                    <h4>Rahul Sharma</h4>
                    <p>rahul@gmail.com</p>
                </div>
                <span className="online">Online</span>
            </div>

            <div className="customer-item">
                <img src="https://i.pravatar.cc/100?img=5" alt="" />
                <div>
                    <h4>Anjali</h4>
                    <p>anjali@gmail.com</p>
                </div>
                <span className="offline">Offline</span>
            </div>

            <div className="customer-item">
                <img src="https://i.pravatar.cc/100?img=8" alt="" />
                <div>
                    <h4>Varun Kumar</h4>
                    <p>varun@gmail.com</p>
                </div>
                <span className="online">Online</span>
            </div>

        </div>

    </div>

    {/* ======================
        ACTIVITY TIMELINE
    ======================= */}

    <div className="activity-card">

        <h2>Recent Activity</h2>

        <div className="activity">

            <div className="timeline-dot"></div>

            <div>

                <h4>New Restaurant Joined</h4>

                <p>Pizza Palace registered successfully.</p>

                <small>10 minutes ago</small>

            </div>

        </div>

        <div className="activity">

            <div className="timeline-dot"></div>

            <div>

                <h4>New Order Received</h4>

                <p>Order #FD1052 placed.</p>

                <small>18 minutes ago</small>

            </div>

        </div>

        <div className="activity">

            <div className="timeline-dot"></div>

            <div>

                <h4>Delivery Completed</h4>

                <p>Delivery Partner Ravi completed Order #FD1034.</p>

                <small>30 minutes ago</small>

            </div>

        </div>

    </div>

</section>

{/* =========================
    NOTIFICATIONS
========================= */}

<section className="notification-section">

    <div className="notification-card">

        <h2>Notifications</h2>

        <ul>

            <li>🍔 15 new food items added today.</li>

            <li>📦 42 new orders pending approval.</li>

            <li>🛵 5 delivery partners are currently active.</li>

            <li>🎟 Coupon FEST50 expires tomorrow.</li>

            <li>⭐ Burger Hub reached 5-Star Rating.</li>

        </ul>

    </div>

    <div className="system-card">

        <h2>System Health</h2>

        <div className="health-item">

            <span>Firebase</span>

            <span className="healthy">Healthy</span>

        </div>

        <div className="health-item">

            <span>MongoDB</span>

            <span className="healthy">Connected</span>

        </div>

        <div className="health-item">

            <span>Render API</span>

            <span className="healthy">Running</span>

        </div>

        <div className="health-item">

            <span>Storage</span>

            <span>74%</span>

        </div>

        <div className="health-item">

            <span>CPU Usage</span>

            <span>38%</span>

        </div>

    </div>

</section>

{/* =========================
    QUICK INFO
========================= */}

<section className="quick-info">

    <div className="info-card">

        <h3>Total Sales Today</h3>

        <h1>$12,450</h1>

        <p>Compared to yesterday +15%</p>

    </div>

    <div className="info-card">

        <h3>Active Restaurants</h3>

        <h1>214</h1>

        <p>97% are accepting orders</p>

    </div>

    <div className="info-card">

        <h3>Delivery Success</h3>

        <h1>98.5%</h1>

        <p>Excellent customer satisfaction</p>

    </div>

</section>

{/* =========================
    FOOTER
========================= */}

<footer className="dashboard-footer">

    <h3>

        Food<span>Express</span> Admin Dashboard

    </h3>

    <p>

        © 2026 FoodExpress. All Rights Reserved.

    </p>

</footer>

        </div>

        

    );

};

export default Dashboard;