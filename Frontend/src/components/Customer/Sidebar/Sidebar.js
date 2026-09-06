import React, { useState } from "react";
import "./Sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
    FaHome,
    FaClipboardList,
    FaShoppingCart,
    FaHeart,
    FaMapMarkerAlt,
    FaWallet,
    FaTags,
    FaBell,
    FaUser,
    FaCog,
    FaQuestionCircle,
    FaSignOutAlt,
    FaBars,
    FaHamburger
} from "react-icons/fa";

import { signOut } from "firebase/auth";
import { auth } from "../../../firebase";

const Sidebar = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = async () => {

        const confirmLogout = window.confirm(
            "Are you sure you want to logout?"
        );

        if (!confirmLogout) return;

        try {

            await signOut(auth);

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            navigate("/login");

        } catch (error) {

            console.log(error);

            alert("Logout failed");

        }

    };

    const menuItems = [

        {
            title: "Dashboard",
            icon: <FaHome />,
            path: "/customer"
        },

        {
            title: "My Orders",
            icon: <FaClipboardList />,
            path: "/customer/orders"
        },

        {
            title: "Cart",
            icon: <FaShoppingCart />,
            path: "/cart",
            badge: 3
        },

        {
            title: "Wishlist",
            icon: <FaHeart />,
            path: "/wishlist",
            badge: 8
        },

        {
            title: "Addresses",
            icon: <FaMapMarkerAlt />,
            path: "/addresses"
        },

        {
            title: "Wallet",
            icon: <FaWallet />,
            path: "/wallet"
        },

        {
            title: "Offers",
            icon: <FaTags />,
            path: "/offers"
        },

        {
            title: "Notifications",
            icon: <FaBell />,
            path: "/notifications",
            badge: 5
        },

        {
            title: "Profile",
            icon: <FaUser />,
            path: "/profile"
        },

        {
            title: "Settings",
            icon: <FaCog />,
            path: "/settings"
        },

        {
            title: "Help",
            icon: <FaQuestionCircle />,
            path: "/help"
        }

    ];

    return (

        <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>

            <div className="sidebar-header">

                <div className="logo">

                    <FaHamburger className="logo-icon" />

                    {

                        !collapsed &&

                        <h2>

                            Food<span>Express</span>

                        </h2>

                    }

                </div>

                <button

                    className="collapse-btn"

                    onClick={() => setCollapsed(!collapsed)}

                >

                    <FaBars />

                </button>

            </div>

            <div className="sidebar-user">

                <div className="avatar">

                    {

                        user?.fullName

                            ?

                            user.fullName.charAt(0).toUpperCase()

                            :

                            "U"

                    }

                </div>

                {

                    !collapsed &&

                    <div className="user-details">

                        <h4>

                            {

                                user?.fullName ||

                                "Customer"

                            }

                        </h4>

                        <p>

                            {

                                user?.email

                            }

                        </p>

                    </div>

                }

            </div>

            <ul className="sidebar-menu">

                {

                    menuItems.map((item, index) => (

                        <li

                            key={index}

                            className={

                                location.pathname === item.path

                                    ?

                                    "active"

                                    :

                                    ""

                            }

                        >

                            <Link to={item.path}>

                                <span className="icon">

                                    {

                                        item.icon

                                    }

                                </span>

                                {

                                    !collapsed &&

                                    <span>

                                        {

                                            item.title

                                        }

                                    </span>

                                }

                                {

                                    item.badge && !collapsed &&

                                    <span className="badge">

                                        {

                                            item.badge

                                        }

                                    </span>

                                }

                            </Link>

                        </li>

                    ))

                }

            </ul>

            <div className="sidebar-offer">

                {

                    !collapsed &&

                    <>

                        <h2>

                            50% OFF

                        </h2>

                        <p>

                            On your first order

                        </p>

                        <button>

                            Order Now

                        </button>

                    </>

                }

            </div>

            <button

                className="logout-btn"

                onClick={handleLogout}

            >

                <FaSignOutAlt />

                {

                    !collapsed &&

                    <span>

                        Logout

                    </span>

                }

            </button>

        </aside>

    );

};

export default Sidebar;