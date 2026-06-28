import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {

    return (

        <nav className="navbar">

            <div className="navbar-container">

                <div className="logo">

                    <Link to="/">
                        🍔 FoodExpress
                    </Link>

                </div>

                <ul className="nav-links">

                    <li>
                        <NavLink to="/">
                            Home
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/menu">
                            Menu
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/cart">
                            Cart
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/orders">
                            Orders
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to="/profile">
                            Profile
                        </NavLink>
                    </li>

                </ul>

                <div className="nav-buttons">

                    <Link
                        to="/login"
                        className="login-btn"
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="register-btn"
                    >
                        Register
                    </Link>

                </div>

            </div>

        </nav>

    );

};

export default Navbar;