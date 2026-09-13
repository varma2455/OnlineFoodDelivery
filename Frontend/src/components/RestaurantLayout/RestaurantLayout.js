import React, { useState, useEffect, useCallback, useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";
import { restaurantAPI } from "../../services/api";
import RestaurantNavbar from "./RestaurantNavbar";
import RestaurantSidebar from "./RestaurantSidebar";
import Loader from "../Loader/Loader";
import "./RestaurantLayout.css";

const RestaurantLayout = () => {
    const { token, user } = useContext(StoreContext);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState(null);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const toggleMobileSidebar = () => setMobileSidebarOpen((prev) => !prev);
    const closeMobileSidebar = () => setMobileSidebarOpen(false);

    const fetchRestaurant = useCallback(async () => {
        try {
            setLoading(true);
            const res = await restaurantAPI.getMyRestaurant();
            const data = res.data;

            if (!data.hasRestaurant || !data.restaurant) {
                setRedirectPath("/restaurant/register");
                return;
            }

            const currentRest = data.restaurant;
            setRestaurant(currentRest);

            // If not approved, redirect to application-status
            if (currentRest.status !== "approved" && user?.role !== "admin") {
                setRedirectPath("/restaurant/application-status");
                return;
            }
        } catch (err) {
            console.error("Restaurant layout authentication check error:", err);
            // Fallback safe redirect if not found
            if (err.message?.includes("not found")) {
                setRedirectPath("/restaurant/register");
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (token) {
            fetchRestaurant();
        } else {
            setRedirectPath("/restaurant/login");
            setLoading(false);
        }
    }, [token, fetchRestaurant]);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader />
            </div>
        );
    }

    if (redirectPath) {
        return <Navigate to={redirectPath} replace />;
    }

    return (
        <div className="app-layout rest-app-layout">
            <RestaurantSidebar
                mobileOpen={mobileSidebarOpen}
                closeMobileSidebar={closeMobileSidebar}
            />

            <div className="main-area rest-main-area">
                <RestaurantNavbar
                    restaurant={restaurant}
                    toggleMobileSidebar={toggleMobileSidebar}
                />

                <main className="main-content-shell rest-content-area">
                    <Outlet context={{ restaurant, refreshRestaurant: fetchRestaurant }} />
                </main>
            </div>
        </div>
    );
};

export default RestaurantLayout;
