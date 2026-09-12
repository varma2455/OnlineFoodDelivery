import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect, authorize("delivery", "admin"));

// Get delivery orders
router.get("/orders", async (req, res, next) => {
    try {
        const orders = await Order.find({
            orderStatus: { $in: ["Preparing", "Out for Delivery", "Delivered"] }
        })
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

// Update delivery status
router.put("/orders/:id/status", async (req, res, next) => {
    try {
        const { orderStatus } = req.body;
        const validStatuses = ["Out for Delivery", "Delivered"];

        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(", ")}`
            });
        }

        const updateData = { orderStatus };
        if (orderStatus === "Delivered") {
            updateData.paymentStatus = "Paid";
            updateData.deliveredAt = new Date();
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: `Delivery status updated to ${orderStatus}.`,
            order
        });
    } catch (error) {
        next(error);
    }
});

export default router;
