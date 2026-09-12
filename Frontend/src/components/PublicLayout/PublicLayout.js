import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

const PublicLayout = ({ children }) => {
    return (
        <>
            <Navbar />
            <main className="public-content-shell">
                {children || <Outlet />}
            </main>
            <Footer />
        </>
    );
};

export default PublicLayout;
