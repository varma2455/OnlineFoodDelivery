import express from "express";
import Order from "../models/Order.js";
import Food from "../models/Food.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect, authorize("restaurant", "admin"));

// Get restaurant orders
router.get("/orders", async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate("user", "fullName phone address")
            .populate("items.food")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: orders.length,
            orders
        });
    } catch (error) {
        next(error);
    }
});

// Update order preparation status
router.put("/orders/:id/status", async (req, res, next) => {
    try {
        const { orderStatus } = req.body;
        const validStatuses = ["Confirmed", "Preparing", "Out for Delivery", "Cancelled"];

        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(", ")}`
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${orderStatus}.`,
            order
        });
    } catch (error) {
        next(error);
    }
});

// Get foods for restaurant
router.get("/foods", async (req, res, next) => {
    try {
        const foods = await Food.find().sort({ name: 1 });
        return res.status(200).json({
            success: true,
            foods
        });
    } catch (error) {
        next(error);
    }
});

// Toggle food availability
router.put("/foods/:id/availability", async (req, res, next) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ success: false, message: "Food not found." });
        }
        food.isAvailable = !food.isAvailable;
        await food.save();

        return res.status(200).json({
            success: true,
            message: `Food is now ${food.isAvailable ? "Available" : "Out of Stock"}.`,
            food
        });
    } catch (error) {
        next(error);
    }
});

export default router;
