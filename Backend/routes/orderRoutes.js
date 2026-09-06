import express from "express";

import {
    placeOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    getOrderStatistics
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/*
===========================================
User Routes
===========================================
*/

// Place Order
router.post("/", protect, placeOrder);

// Get My Orders
router.get("/my-orders", protect, getMyOrders);

// Get Order Details
router.get("/:id", protect, getOrderById);

// Cancel Order
router.put("/:id/cancel", protect, cancelOrder);

/*
===========================================
Admin Routes
===========================================
*/

// Get All Orders
router.get(
    "/admin/all",
    protect,
    isAdmin,
    getAllOrders
);

// Update Order Status
router.put(
    "/admin/:id/status",
    protect,
    isAdmin,
    updateOrderStatus
);

// Order Statistics
router.get(
    "/admin/statistics",
    protect,
    isAdmin,
    getOrderStatistics
);

export default router;