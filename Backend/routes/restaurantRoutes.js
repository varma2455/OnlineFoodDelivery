import express from "express";
import {
    registerRestaurant,
    getMyRestaurant,
    updateMyRestaurant,
    getRestaurantDashboard,
    getRestaurantOrders,
    updateRestaurantOrderStatus,
    getRestaurantMenu,
    addRestaurantFood,
    updateRestaurantFood,
    deleteRestaurantFood,
    updateFoodStock,
    getRestaurantAnalytics,
    getRestaurantReviews
} from "../controllers/restaurantController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { requireRestaurantOwner } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ==========================================
// Public / Semi-Public Registration Route
// ==========================================
// Can be called with Firebase token or optional auth
router.post("/register", optionalAuth, registerRestaurant);

// ==========================================
// Profile & Status Routes (Any Status Allowed)
// ==========================================
router.get("/me", protect, getMyRestaurant);
router.put("/me", protect, requireRestaurantOwner({ requireApproved: false }), updateMyRestaurant);

// ==========================================
// Dashboard & Analytics (Approved Only)
// ==========================================
router.get("/dashboard", protect, requireRestaurantOwner({ requireApproved: true }), getRestaurantDashboard);
router.get("/analytics", protect, requireRestaurantOwner({ requireApproved: true }), getRestaurantAnalytics);
router.get("/reviews", protect, requireRestaurantOwner({ requireApproved: true }), getRestaurantReviews);

// ==========================================
// Orders Management (Approved Only)
// ==========================================
router.get("/orders", protect, requireRestaurantOwner({ requireApproved: true }), getRestaurantOrders);
router.put("/orders/:id/status", protect, requireRestaurantOwner({ requireApproved: true }), updateRestaurantOrderStatus);

// Direct action shortcuts for order workflow
router.put("/orders/:id/accept", protect, requireRestaurantOwner({ requireApproved: true }), (req, res, next) => {
    req.body.action = "accept";
    updateRestaurantOrderStatus(req, res, next);
});
router.put("/orders/:id/reject", protect, requireRestaurantOwner({ requireApproved: true }), (req, res, next) => {
    req.body.action = "reject";
    updateRestaurantOrderStatus(req, res, next);
});
router.put("/orders/:id/preparing", protect, requireRestaurantOwner({ requireApproved: true }), (req, res, next) => {
    req.body.action = "preparing";
    updateRestaurantOrderStatus(req, res, next);
});
router.put("/orders/:id/ready", protect, requireRestaurantOwner({ requireApproved: true }), (req, res, next) => {
    req.body.action = "ready";
    updateRestaurantOrderStatus(req, res, next);
});

// ==========================================
// Menu & Stock Management (Approved Only)
// ==========================================
router.get("/menu", protect, requireRestaurantOwner({ requireApproved: true }), getRestaurantMenu);
router.get("/foods", protect, requireRestaurantOwner({ requireApproved: true }), getRestaurantMenu); // Alias
router.post("/menu", protect, requireRestaurantOwner({ requireApproved: true }), upload.single("image"), addRestaurantFood);
router.put("/menu/:id", protect, requireRestaurantOwner({ requireApproved: true }), upload.single("image"), updateRestaurantFood);
router.delete("/menu/:id", protect, requireRestaurantOwner({ requireApproved: true }), deleteRestaurantFood);
router.put("/menu/:id/stock", protect, requireRestaurantOwner({ requireApproved: true }), updateFoodStock);
router.put("/foods/:id/availability", protect, requireRestaurantOwner({ requireApproved: true }), updateFoodStock); // Alias

export default router;
