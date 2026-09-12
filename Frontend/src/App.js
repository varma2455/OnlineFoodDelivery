import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import DashboardLayout from "./components/DashboardLayout/DashboardLayout";
import PublicLayout from "./components/PublicLayout/PublicLayout";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home/Home";
import Menu from "./pages/Menu/Menu";
import FoodDetails from "./pages/FoodDetails/FoodDetails";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Profile from "./pages/Profile/Profile";
import Orders from "./pages/Orders/Orders";
import Dashboard from "./pages/Dashboard/Dashboard";
import Offers from "./pages/Offers/Offers";
import Rewards from "./pages/Rewards/Rewards";
import Support from "./pages/Support/Support";
import Settings from "./pages/Settings/Settings";
import Membership from "./pages/Membership/Membership";
import FoodCustomizationPage from "./pages/FoodCustomization/FoodCustomizationPage";

// Admin Pages
import AdminDashboard from "./pages/Admin/Dashboard";
import FoodManagement from "./pages/Admin/FoodManagement";
import OrderManagement from "./pages/Admin/OrderManagement";
import UserManagement from "./pages/Admin/UserManagement";

// Restaurant & Delivery
import RestaurantDashboard from "./pages/Restaurant/Dashboard";
import DeliveryDashboard from "./pages/Delivery/Dashboard";

// Category Pages
import CategoryPage from "./pages/CategoryPage/CategoryPage";

// Interactive Browse & Category Explorers
import BrowseFood from "./pages/BrowseFood/BrowseFood";
import PizzaPage from "./pages/PizzaPage/PizzaPage";
import PizzaOrder from "./pages/PizzaOrder/PizzaOrder";
import BurgerPage from "./pages/BurgerPage/BurgerPage";
import BurgerOrder from "./pages/BurgerOrder/BurgerOrder";
import BiryaniPage from "./pages/BiryaniPage/BiryaniPage";
import BiryaniOrder from "./pages/BiryaniOrder/BiryaniOrder";
import FastFoodPage from "./pages/FastFoodPage/FastFoodPage";
import FastFoodOrder from "./pages/FastFoodOrder/FastFoodOrder";
import DrinksPage from "./pages/DrinksPage/DrinksPage";
import DrinksOrder from "./pages/DrinksOrder/DrinksOrder";
import DessertsPage from "./pages/DessertsPage/DessertsPage";
import DessertsOrder from "./pages/DessertsOrder/DessertsOrder";
import NoodlesPage from "./pages/NoodlesPage/NoodlesPage";
import NoodlesOrder from "./pages/NoodlesOrder/NoodlesOrder";
import SaladsPage from "./pages/SaladsPage/SaladsPage";
import SaladsOrder from "./pages/SaladsOrder/SaladsOrder";

function App() {
    return (
        <Routes>
            {/* Customer Dashboard Routes with 247px Sidebar + Main Area (Navbar + Main Content) */}
            <Route element={<DashboardLayout />}>
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute role="customer">
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="/browse-food" element={<BrowseFood />} />
                <Route path="/cart" element={<Cart />} />
                <Route
                    path="/my-orders"
                    element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/my-orders/:orderId"
                    element={
                        <ProtectedRoute>
                            <Orders />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route path="/offers" element={<Offers />} />
                <Route
                    path="/rewards"
                    element={
                        <ProtectedRoute>
                            <Rewards />
                        </ProtectedRoute>
                    }
                />
                <Route path="/support" element={<Support />} />
                <Route path="/support/tickets/:ticketId" element={<Support />} />
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />
                <Route path="/membership" element={<Membership />} />
            </Route>

            {/* Admin Routes with Protected Access */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute role="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute role="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/foods"
                element={
                    <ProtectedRoute role="admin">
                        <FoodManagement />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/orders"
                element={
                    <ProtectedRoute role="admin">
                        <OrderManagement />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute role="admin">
                        <UserManagement />
                    </ProtectedRoute>
                }
            />

            {/* Restaurant & Delivery Dashboards */}
            <Route
                path="/restaurant"
                element={
                    <ProtectedRoute role="restaurant">
                        <RestaurantDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/delivery"
                element={
                    <ProtectedRoute role="delivery">
                        <DeliveryDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Order Route Aliases */}
            <Route path="/orders" element={<Navigate to="/my-orders" replace />} />
            <Route path="/orders/:orderId" element={<Navigate to="/my-orders" replace />} />

            {/* Subcategory Exploration Pages */}
            <Route path="/order-pizza" element={<PizzaPage />} />
            <Route path="/order-pizza/:id" element={<PizzaOrder />} />
            <Route path="/order-burger" element={<BurgerPage />} />
            <Route path="/order-burger/:id" element={<BurgerOrder />} />
            <Route path="/order-biryani" element={<BiryaniPage />} />
            <Route path="/order-biryani/:id" element={<BiryaniOrder />} />
            <Route path="/order-fastfood" element={<FastFoodPage />} />
            <Route path="/order-fastfood/:id" element={<FastFoodOrder />} />
            <Route path="/order-drink" element={<DrinksPage />} />
            <Route path="/order-drink/:id" element={<DrinksOrder />} />
            <Route path="/order-dessert" element={<DessertsPage />} />
            <Route path="/order-dessert/:id" element={<DessertsOrder />} />
            <Route path="/order-noodles" element={<NoodlesPage />} />
            <Route path="/order-noodles/:id" element={<NoodlesOrder />} />
            <Route path="/order-salads" element={<SaladsPage />} />
            <Route path="/order-salads/:id" element={<SaladsOrder />} />

            {/* Dynamic Food Customization Flow */}
            <Route path="/food/:foodId/customize" element={<FoodCustomizationPage />} />
            <Route path="/food/:id/customize" element={<FoodCustomizationPage />} />

            {/* Public & Customer Routes with Standard Navbar + Footer */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/food/:id" element={<FoodDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Dynamic Category Page */}
                <Route path="/category/:categoryName" element={<CategoryPage />} />

                {/* Legacy Category Routes */}
                <Route path="/pizza" element={<CategoryPage />} />
                <Route path="/burger" element={<CategoryPage />} />
                <Route path="/biryani" element={<CategoryPage />} />
                <Route path="/drinks" element={<CategoryPage />} />
                <Route path="/desserts" element={<CategoryPage />} />
                <Route path="/fastfood" element={<CategoryPage />} />
                <Route path="/salads" element={<CategoryPage />} />
                <Route path="/noodles" element={<CategoryPage />} />

                {/* Fallback Route */}
                <Route path="*" element={<Home />} />
            </Route>
        </Routes>
    );
}

export default App;