import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import "./AdminNav.css";
import {
    FaShieldAlt,
    FaChartBar,
    FaHamburger,
    FaClipboardList,
    FaUsers,
    FaSignOutAlt,
    FaStore
} from "react-icons/fa";

const AdminNav = () => {
    const { user, logout } = useContext(StoreContext);
    const navigate = useNavigate();

    return (
        <header className="admin-nav-bar">
            <div className="admin-nav-container">
                <div className="admin-brand">
                    <Link to="/admin/dashboard" className="admin-logo">
                        <FaShieldAlt className="shield-icon" />
                        <span>FoodExpress <small>ADMIN</small></span>
                    </Link>
                </div>

                <nav className="admin-links">
                    <NavLink
                        to="/admin/dashboard"
                        end
                        className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}
                    >
                        <FaChartBar /> Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/foods"
                        className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}
                    >
                        <FaHamburger /> Foods
                    </NavLink>
                    <NavLink
                        to="/admin/orders"
                        className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}
                    >
                        <FaClipboardList /> Orders
                    </NavLink>
                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) => (isActive ? "admin-link active" : "admin-link")}
                    >
                        <FaUsers /> Users & Firebase
                    </NavLink>
                </nav>

                <div className="admin-right-actions">
                    <Link to="/" className="btn-customer-portal">
                        <FaStore /> Customer Store
                    </Link>
                    <button
                        className="btn-admin-logout"
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                    >
                        <FaSignOutAlt />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AdminNav;
