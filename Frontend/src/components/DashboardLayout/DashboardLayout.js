import React from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../DashboardSidebar/DashboardSidebar";
import Navbar from "../Navbar/Navbar";
import "./DashboardLayout.css";

/**
 * DashboardLayout Component
 * Two-column application shell:
 * - Left column: 247px fixed/sticky orange DashboardSidebar
 * - Right column: Main Area (compact Navbar at top + Main Content below)
 */
const DashboardLayout = ({ children }) => {
    return (
        <div className="app-layout">
            <DashboardSidebar />

            <div className="main-area">
                <Navbar isDashboardLayout={true} />
                <main className="main-content-shell">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
