import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import authorize, { requireDeliveryPartner } from "../middleware/roleMiddleware.js";
import { verifyDeliveryOtp } from "../controllers/deliveryPartnerController.js";

const router = express.Router();

router.use(protect);

// Get delivery orders (accessible to delivery and admin)
router.get("/orders", authorize("delivery", "admin"), async (req, res, next) => {
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
router.put("/orders/:id/status", authorize("delivery", "admin"), async (req, res, next) => {
    try {
        const orderStatus = req.body.orderStatus || req.body.status || req.body.deliveryStatus;

        // Prevent bypass: "Delivered" status MUST NOT be set without successful OTP verification
        if (orderStatus === "Delivered" || (orderStatus && orderStatus.toLowerCase() === "delivered")) {
            return res.status(400).json({
                success: false,
                message: "Delivery OTP verification required. Please verify customer OTP before marking as delivered."
            });
        }

        const validStatuses = ["Out for Delivery", "Going to Restaurant", "Arrived at Restaurant", "Order Picked Up", "Going to Customer", "Arrived at Customer"];

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
            message: `Delivery status updated to ${orderStatus}.`,
            order
        });
    } catch (error) {
        next(error);
    }
});

// Verify Delivery OTP Handover endpoint (Section 10 & 33)
router.post("/orders/:id/verify-otp", requireDeliveryPartner({ requireApproved: true }), verifyDeliveryOtp);

export default router;
