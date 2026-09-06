import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Food from "../models/Food.js";

/**
 * ===========================================
 * Place Order
 * POST /api/orders
 * ===========================================
 */

export const placeOrder = async (req, res, next) => {
    try {

        const {
            deliveryAddress,
            paymentMethod
        } = req.body;

        // Get user's cart
        const cartItems = await Cart.find({
            user: req.user._id
        }).populate("food");

        if (cartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            });
        }

        let items = [];
        let totalAmount = 0;

        // Build order items
        for (const cart of cartItems) {

            if (!cart.food) continue;

            items.push({
                food: cart.food._id,
                name: cart.food.name,
                image: cart.food.image,
                price: cart.price,
                quantity: cart.quantity,
                subtotal: cart.subtotal
            });

            totalAmount += cart.subtotal;

            // Reduce stock
            if (cart.food.stock >= cart.quantity) {
                cart.food.stock -= cart.quantity;
                await cart.food.save();
            }
        }

        const deliveryCharge = totalAmount > 500 ? 0 : 40;

        const discount =
            totalAmount >= 1000
                ? Math.floor(totalAmount * 0.10)
                : 0;

        const finalAmount =
            totalAmount +
            deliveryCharge -
            discount;

        const order = await Order.create({

            user: req.user._id,

            items,

            deliveryAddress,

            paymentMethod:
                paymentMethod ||
                "Cash on Delivery",

            totalAmount,

            deliveryCharge,

            discount,

            finalAmount

        });

        // Clear cart
        await Cart.deleteMany({
            user: req.user._id
        });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully.",
            order
        });

    } catch (error) {
        next(error);
    }
};

/**
 * ===========================================
 * Get Logged-in User Orders
 * GET /api/orders/my-orders
 * ===========================================
 */

export const getMyOrders = async (req, res, next) => {
    try {

        const orders = await Order.find({
            user: req.user._id
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            totalOrders: orders.length,
            orders
        });

    } catch (error) {
        next(error);
    }
};

/**
 * ===========================================
 * Get Order By ID
 * GET /api/orders/:id
 * ===========================================
 */

export const getOrderById = async (req, res, next) => {
    try {

        const order = await Order.findById(req.params.id)
            .populate("user", "fullName email phone");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        // Only owner or admin can view
        if (
            order.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied."
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        next(error);
    }
};

/**
 * ===========================================
 * Cancel Order
 * PUT /api/orders/:id/cancel
 * ===========================================
 */

export const cancelOrder = async (req, res, next) => {
    try {

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        if (
            order.user.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized."
            });
        }

        if (
            order.orderStatus === "Delivered" ||
            order.orderStatus === "Cancelled"
        ) {
            return res.status(400).json({
                success: false,
                message: `Order already ${order.orderStatus}.`
            });
        }

        order.orderStatus = "Cancelled";

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully.",
            order
        });

    } catch (error) {
        next(error);
    }
};

/**
 * ===========================================
 * Admin - Get All Orders
 * GET /api/orders
 * ===========================================
 */

export const getAllOrders = async (req, res, next) => {
    try {

        const orders = await Order.find()
            .populate("user", "fullName email phone")
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            totalOrders: orders.length,
            orders
        });

    } catch (error) {
        next(error);
    }
};

/**
 * ===========================================
 * Admin - Update Order Status
 * PUT /api/orders/:id/status
 * ===========================================
 */

export const updateOrderStatus = async (req, res, next) => {
    try {

        const { orderStatus } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        order.orderStatus = orderStatus;

        if (orderStatus === "Delivered") {
            order.paymentStatus = "Paid";
            order.deliveredAt = new Date();
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully.",
            order
        });

    } catch (error) {
        next(error);
    }
};

/**
 * ===========================================
 * Admin - Order Statistics
 * GET /api/orders/statistics
 * ===========================================
 */

export const getOrderStatistics = async (req, res, next) => {
    try {

        const totalOrders = await Order.countDocuments();

        const deliveredOrders = await Order.countDocuments({
            orderStatus: "Delivered"
        });

        const pendingOrders = await Order.countDocuments({
            orderStatus: {
                $nin: ["Delivered", "Cancelled"]
            }
        });

        const cancelledOrders = await Order.countDocuments({
            orderStatus: "Cancelled"
        });

        const revenueData = await Order.aggregate([
            {
                $match: {
                    paymentStatus: "Paid"
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$finalAmount"
                    }
                }
            }
        ]);

        const totalRevenue =
            revenueData.length > 0
                ? revenueData[0].totalRevenue
                : 0;

        return res.status(200).json({
            success: true,
            statistics: {
                totalOrders,
                deliveredOrders,
                pendingOrders,
                cancelledOrders,
                totalRevenue
            }
        });

    } catch (error) {
        next(error);
    }
};