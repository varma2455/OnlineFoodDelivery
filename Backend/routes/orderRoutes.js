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
import {
    assignDeliveryPartnerToOrder,
    autoAssignDeliveryPartner
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

// User routes - Direct Order Placement & History
router.post("/", protect, placeOrder);
router.get("/my-orders", protect, getMyOrders);

// Flexible GET /: if admin/staff returns all orders, if customer returns their orders
router.get("/", protect, (req, res, next) => {
    if (["admin", "restaurant", "delivery"].includes(req.user.role)) {
        return getAllOrders(req, res, next);
    }
    return getMyOrders(req, res, next);
});

// Admin & Staff Routes
router.get("/admin/all", protect, authorize("admin", "restaurant", "delivery"), getAllOrders);
router.get("/admin/statistics", protect, isAdmin, getOrderStatistics);
router.put("/admin/:id/status", protect, authorize("admin", "restaurant", "delivery"), updateOrderStatus);
router.put("/:id/status", protect, authorize("admin", "restaurant", "delivery"), updateOrderStatus);
router.put("/admin/:id/assign-delivery", protect, isAdmin, assignDeliveryPartnerToOrder);
router.put("/:id/assign-delivery", protect, isAdmin, assignDeliveryPartnerToOrder);
router.post("/admin/:id/auto-assign", protect, isAdmin, autoAssignDeliveryPartner);
router.post("/:id/auto-assign", protect, isAdmin, autoAssignDeliveryPartner);

// Order details & Cancel
router.get("/:id", protect, getOrderById);
router.put("/:id/cancel", protect, cancelOrder);

export default router;
