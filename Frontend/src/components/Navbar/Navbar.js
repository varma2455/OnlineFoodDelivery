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

                <div className="auth-buttons">

                    <Link to="/login">

                        <button className="auth-btn active"> Login </button>
                    </Link>

                    <Link to="/register">

                       <button className="auth-btn"> Register </button>
 
                    </Link>

                </div>

            </div>

        </nav>

    );

};

export default Navbar;