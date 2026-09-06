import React, { useState } from "react";
import "./Navbar.css";

import { Link } from "react-router-dom";

import {
    FaSearch,
    FaBell,
    FaShoppingCart,
    FaBars,
    FaTimes,
    FaUserCircle,
    FaChevronDown
} from "react-icons/fa";

const Navbar = () => {

    const [menuOpen, setMenuOpen] = useState(false);

    const [profileOpen, setProfileOpen] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));

    return (

        <header className="navbar">

            {/* Left */}

            <div className="navbar-left">

                <button

                    className="menu-btn"

                    onClick={() => setMenuOpen(!menuOpen)}

                >

                    {

                        menuOpen

                        ?

                        <FaTimes/>

                        :

                        <FaBars/>

                    }

                </button>

                <div className="navbar-logo">

                    🍔

                    <h2>

                        Food

                        <span>

                            Express

                        </span>

                    </h2>

                </div>

            </div>

            {/* Center */}

            <div className="navbar-center">

                <div className="search-box">

                    <FaSearch className="search-icon"/>

                    <input

                        type="text"

                        placeholder="Search Food, Restaurants..."

                    />

                </div>

            </div>

            {/* Right */}

            <div className="navbar-right">

                <button className="icon-btn">

                    <FaBell/>

                    <span className="badge">

                        3

                    </span>

                </button>

                <button className="icon-btn">

                    <FaShoppingCart/>

                    <span className="badge">

                        2

                    </span>

                </button>

                <div

                    className="profile-box"

                    onClick={() =>

                        setProfileOpen(

                            !profileOpen

                        )

                    }

                >

                    <div className="avatar">

                        {

                            user?.fullName

                            ?

                            user.fullName

                                .charAt(0)

                                .toUpperCase()

                            :

                            "U"

                        }

                    </div>

                    <div className="profile-info">

                        <span>

                            Welcome

                        </span>

                        <h4>

                            {

                                user?.fullName ||

                                "Customer"

                            }

                        </h4>

                    </div>

                    <FaChevronDown/>

                </div>

                {

                    profileOpen &&

                    <div className="profile-dropdown">

                        <Link to="/profile">

                            👤 Profile

                        </Link>

                        <Link to="/customer/orders">

                            📦 Orders

                        </Link>

                        <Link to="/settings">

                            ⚙ Settings

                        </Link>

                        <button>

                            🚪 Logout

                        </button>

                    </div>

                }

            </div>

        </header>

    );

};

export default Navbar;