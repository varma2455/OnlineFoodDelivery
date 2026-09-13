import express from "express";
import {
    getAdminDashboard,
    getAdminFoods,
    getAdminOrders,
    updateAdminOrderStatus,
    deleteAdminOrder,
    getAdminUsers,
    toggleBlockUser,
    changeUserRole,
    deleteUser,
    getFirebaseUsers,
    getAdminRestaurants,
    getAdminRestaurantById,
    approveRestaurant,
    rejectRestaurant,
    suspendRestaurant,
    activateRestaurant
} from "../controllers/adminController.js";
import { addFood, updateFood, deleteFood } from "../controllers/foodController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, isAdmin);

// Dashboard & Stats
router.get(["/dashboard", "/stats"], getAdminDashboard);

// Restaurants Management
router.get("/restaurants", getAdminRestaurants);
router.get("/restaurants/:id", getAdminRestaurantById);
router.put("/restaurants/:id/approve", approveRestaurant);
router.put("/restaurants/:id/reject", rejectRestaurant);
router.put("/restaurants/:id/suspend", suspendRestaurant);
router.put("/restaurants/:id/activate", activateRestaurant);

// Foods
router.get("/foods", getAdminFoods);
router.post("/foods", upload.single("image"), addFood);
router.put("/foods/:id", upload.single("image"), updateFood);
router.delete("/foods/:id", deleteFood);

// Orders
router.get("/orders", getAdminOrders);
router.put("/orders/:id/status", updateAdminOrderStatus);
router.delete("/orders/:id", deleteAdminOrder);

// Users (MongoDB & Roles)
router.get("/users", getAdminUsers);
router.put("/users/:id/block", toggleBlockUser);
router.put("/users/:id/unblock", toggleBlockUser);
router.put("/users/:id/role", changeUserRole);
router.delete("/users/:id", deleteUser);

// Firebase Management (Admin Only)
router.get("/firebase/users", getFirebaseUsers);

export default router;
