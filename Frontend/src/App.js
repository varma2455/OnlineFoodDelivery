import React from "react";
import { Routes, Route } from "react-router-dom";

import { auth } from "./firebase";

console.log(auth);

// Components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import FoodManagement from "./pages/Admin/Foods/FoodManagement";

// Pages
import Home from "./pages/Home/Home";
import Menu from "./pages/Menu/Menu";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Profile from "./pages/Profile/Profile";
import Orders from "./pages/Orders/Orders";


import CustomerDashboard from "./components/Customer/Sidebar/CustomerDashboard";



// Admin
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/Admin/Dashboard";
import RestaurantDashboard from "./pages/Restaurant/Dashboard";
import DeliveryDashboard from "./pages/Delivery/Dashboard";

function App() {

    return (

        <>

            <Navbar />

            <Routes>


                {/* <Route path="/customer" element={<CustomerDashboard />}/> */}
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />

                
                <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/foods" element={<FoodManagement />} />
                {/* <Route path="/admin/orders" element={<OrderManagement />} />
                <Route path="/admin/users" element={<UserManagement />} /> */}

                <Route path="/customer" element={ <ProtectedRoute role="admin"> <CustomerDashboard/> </ProtectedRoute>}/>
                <Route path="/restaurant" element={<ProtectedRoute role="restaurant"> <RestaurantDashboard/> </ProtectedRoute>}/>
                <Route path="/delivery" element={<ProtectedRoute role="delivery"> <DeliveryDashboard/> </ProtectedRoute>}/>


                <Route path="/foods" element={<FoodManagement/>}/>
                

            </Routes>

            <Footer />

        </>

    );

}

export default App;