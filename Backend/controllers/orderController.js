import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Food from "../models/Food.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Offer from "../models/Offer.js";
import RewardTransaction from "../models/RewardTransaction.js";
import RewardVoucher from "../models/RewardVoucher.js";
import DeliveryPartner from "../models/DeliveryPartner.js";

/**
 * Place Order
 * POST /api/orders
 */
export const placeOrder = async (req, res, next) => {
    try {
        const {
            deliveryAddress,
            paymentMethod,
            couponCode
        } = req.body;

        if (!deliveryAddress || !deliveryAddress.fullName || !deliveryAddress.phone || !deliveryAddress.addressLine1 || !deliveryAddress.city) {
            return res.status(400).json({
                success: false,
                message: "Please provide complete delivery details (name, phone, address, city)."
            });
        }

        // Get user's cart from DB
        const cartItems = await Cart.find({
            user: req.user._id
        }).populate("food");

        const validCart = cartItems.filter(item => item.food !== null);

        let items = [];
        let totalAmount = 0;

        if (validCart.length > 0) {
            // Build order items from MongoDB Cart
            for (const cart of validCart) {
                const itemQty = Math.max(1, Number(cart.quantity) || Number(cart.customization?.quantity) || 1);
                const itemPrice = Number(cart.price) || (cart.food ? cart.food.price : 0);
                const itemSubtotal = cart.subtotal || (itemPrice * itemQty);

                items.push({
                    food: cart.food._id,
                    restaurantId: cart.food.restaurantId || null,
                    name: cart.food.name,
                    image: cart.food.image || "margherita.jpg",
                    price: itemPrice,
                    quantity: itemQty,
                    subtotal: itemSubtotal,
                    foodType: cart.foodType || cart.food.category || "Food",
                    customization: cart.customization || {}
                });

                totalAmount += itemSubtotal;

                // Reduce stock safely
                if (cart.food.stock >= itemQty) {
                    cart.food.stock -= itemQty;
                    await cart.food.save();
                }
            }
        } else if (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
            // Build order items from request body fallback
            for (const rawItem of req.body.items) {
                const foodDoc = await Food.findById(rawItem.food || rawItem._id);
                const unitPrice = Number(rawItem.price) || (foodDoc ? foodDoc.price : 0);
                const quantity = Math.max(1, Number(rawItem.quantity) || 1);
                const itemSubtotal = unitPrice * quantity;

                items.push({
                    food: foodDoc ? foodDoc._id : rawItem.food,
                    restaurantId: foodDoc ? foodDoc.restaurantId : (rawItem.restaurantId || null),
                    name: rawItem.name || (foodDoc ? foodDoc.name : "Food Item"),
                    image: rawItem.image || (foodDoc ? foodDoc.image : "margherita.jpg"),
                    price: unitPrice,
                    quantity,
                    subtotal: itemSubtotal,
                    foodType: rawItem.foodType || rawItem.category || (foodDoc ? foodDoc.category : "Food"),
                    customization: rawItem.customization || {}
                });

                totalAmount += itemSubtotal;

                if (foodDoc && foodDoc.stock >= quantity) {
                    foodDoc.stock -= quantity;
                    await foodDoc.save();
                }
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty. Please add delicious food before checkout."
            });
        }

        // Retrieve User to check Membership Benefits and Wallet
        const userDoc = await User.findById(req.user._id);
        const memberObj = userDoc?.membership || {};
        const memberPlan = (typeof memberObj === "string" ? memberObj : (memberObj.plan || "free")).toLowerCase();
        const isMemberActive = memberObj.status === "active" && (!memberObj.expiryDate || new Date(memberObj.expiryDate) > new Date());

        let memberDiscountPercent = 0;
        let memberDeliveryBenefit = false;

        if (isMemberActive) {
            if (memberPlan === "platinum") {
                memberDiscountPercent = 15;
                memberDeliveryBenefit = true;
            } else if (memberPlan === "gold") {
                memberDiscountPercent = 10;
                memberDeliveryBenefit = true;
            } else if (memberPlan === "silver") {
                memberDiscountPercent = 5;
                // 2 free deliveries every month
                const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                const freeDeliveryOrdersThisMonth = await Order.countDocuments({
                    user: req.user._id,
                    createdAt: { $gte: startOfMonth },
                    memberDeliveryBenefit: true
                });
                if (freeDeliveryOrdersThisMonth < 2) {
                    memberDeliveryBenefit = true;
                }
            }
        }

        const standardDeliveryCharge = totalAmount > 500 ? 0 : 40;
        const deliveryCharge = memberDeliveryBenefit ? 0 : standardDeliveryCharge;

        // Apply discount: database Offer or fallback
        let discount = 0;
        let appliedDbOffer = null;
        const coupon = (couponCode || "").toUpperCase().trim();

        if (coupon) {
            const dbOffer = await Offer.findOne({
                code: coupon,
                isActive: true,
                expiryDate: { $gt: new Date() }
            });

            if (dbOffer && totalAmount >= (dbOffer.minimumOrderValue || 0)) {
                appliedDbOffer = dbOffer;
                if (dbOffer.discountType === "percentage") {
                    const raw = Math.round(totalAmount * (dbOffer.discountValue / 100));
                    discount = dbOffer.maximumDiscount > 0 ? Math.min(raw, dbOffer.maximumDiscount) : raw;
                } else if (dbOffer.discountType === "flat") {
                    discount = Math.min(dbOffer.discountValue, totalAmount);
                } else if (dbOffer.discountType === "free_delivery") {
                    discount = standardDeliveryCharge;
                } else {
                    discount = dbOffer.discountValue;
                }
            } else if (coupon === "FIRST30") {
                discount = Math.min(Math.round(totalAmount * 0.30), 200);
            } else if (coupon === "FOOD20") {
                discount = Math.min(Math.round(totalAmount * 0.20), 150);
            } else if (coupon === "FREEDEL") {
                discount = standardDeliveryCharge;
            }
        } else if (totalAmount >= 1000) {
            discount = Math.floor(totalAmount * 0.10);
        }

        const memberDiscount = memberDiscountPercent > 0 ? Math.round((totalAmount * memberDiscountPercent) / 100) : 0;
        const totalDiscount = discount + memberDiscount;

        const tax = Math.round(totalAmount * 0.05); // 5% GST standard
        const finalAmount = Math.max(0, totalAmount + deliveryCharge + tax - totalDiscount);

        // Normalize address structure
        const formattedAddress = {
            fullName: deliveryAddress.fullName.trim(),
            phone: deliveryAddress.phone.trim(),
            addressLine1: deliveryAddress.addressLine1 || deliveryAddress.address || "",
            addressLine2: deliveryAddress.addressLine2 || "",
            city: deliveryAddress.city.trim(),
            state: deliveryAddress.state ? deliveryAddress.state.trim() : "State",
            postalCode: deliveryAddress.postalCode || deliveryAddress.pincode || "500001",
            country: deliveryAddress.country || "India"
        };

        const payment = paymentMethod || "Cash on Delivery";

        // Validate and Deduct Wallet if user pays with FoodExpress Wallet
        if (payment === "Wallet") {
            if (!userDoc) {
                return res.status(404).json({
                    success: false,
                    message: "User account not found."
                });
            }

            const currentBalance = Number(userDoc.wallet) || 0;
            if (currentBalance < finalAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient FoodExpress Wallet balance (₹${currentBalance}). Order total is ₹${finalAmount}. Please add money to your wallet or choose another payment method.`
                });
            }

            userDoc.wallet = currentBalance - finalAmount;
            await userDoc.save();
        }

        const paymentStatus = payment === "Cash on Delivery" ? "Pending" : "Paid";

        const order = await Order.create({
            user: req.user._id,
            items,
            deliveryAddress: formattedAddress,
            paymentMethod: payment,
            paymentStatus,
            orderStatus: "Placed",
            totalAmount,
            deliveryCharge,
            tax,
            discount: totalDiscount,
            memberDiscount,
            memberPlan: isMemberActive ? memberPlan : "",
            memberDeliveryBenefit,
            finalAmount,
            estimatedDeliveryTime: 30
        });

        // Record Transaction if Wallet was used
        if (payment === "Wallet") {
            try {
                const refreshedUser = await User.findById(req.user._id);
                await Transaction.create({
                    user: req.user._id,
                    type: "debit",
                    category: "order_payment",
                    amount: finalAmount,
                    balanceAfter: refreshedUser ? (refreshedUser.wallet || 0) : 0,
                    paymentMethod: "Wallet",
                    description: `Food Order #${order._id.toString().slice(-6).toUpperCase()}`,
                    order: order._id,
                    status: "Success"
                });
            } catch (tErr) {
                console.warn("Could not record wallet order transaction:", tErr.message);
            }
        }

        // Clear user's cart
        await Cart.deleteMany({
            user: req.user._id
        });

        // Award reward points (10% standard, 20% for Gold/2X multiplier, 30% for Platinum)
        try {
            const isMemberPlatinum = isMemberActive && memberPlan === "platinum";
            const isMemberGold = isMemberActive && memberPlan === "gold";
            const is2XMultiplier = (couponCode || "").toUpperCase().trim() === "REWARD2X" || appliedDbOffer?.discountType === "reward_multiplier" || isMemberGold;
            const multiplier = isMemberPlatinum ? 0.3 : (is2XMultiplier ? 0.2 : 0.1);
            const earnedPoints = Math.max(5, Math.floor(finalAmount * multiplier));

            const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                {
                    $inc: { rewardPoints: earnedPoints },
                    $push: {
                        recentOrders: {
                            $each: [order._id],
                            $position: 0,
                            $slice: 10
                        }
                    }
                },
                { new: true }
            );

            // Record Reward Transaction
            await RewardTransaction.create({
                user: req.user._id,
                type: is2XMultiplier ? "bonus" : "earned",
                points: earnedPoints,
                balanceAfter: updatedUser?.rewardPoints || 0,
                title: `Order #${order._id.toString().slice(-6).toUpperCase()}`,
                description: `${is2XMultiplier ? "20% (2X Bonus)" : "10%"} reward points earned on order of ₹${finalAmount}`,
                order: order._id,
                orderIdText: order._id.toString().slice(-6).toUpperCase()
            });

            // If a reward voucher was used, mark it as Used
            if (couponCode && couponCode.toUpperCase().startsWith("REW-")) {
                await RewardVoucher.findOneAndUpdate(
                    { code: couponCode.toUpperCase().trim(), user: req.user._id, status: "Available" },
                    { status: "Used", usedAt: new Date(), usedInOrder: order._id }
                );
            }
        } catch (uErr) {
            console.warn("Could not update user rewards/history:", uErr.message);
        }

        // Record offer redemption in Offer model
        if (appliedDbOffer) {
            try {
                await Offer.findByIdAndUpdate(appliedDbOffer._id, {
                    $inc: { usedCount: 1 },
                    $push: {
                        usedBy: {
                            user: req.user._id,
                            orderId: order._id,
                            usedAt: new Date()
                        }
                    }
                });
            } catch (offErr) {
                console.warn("Could not record offer usage:", offErr.message);
            }
        }

        return res.status(201).json({
            success: true,
            message: "🎉 Order placed successfully!",
            order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Logged-in User Orders
 * GET /api/orders/my-orders or GET /api/orders
 */
export const getMyOrders = async (req, res, next) => {
    try {
        const rawOrders = await Order.find({
            user: req.user._id
        })
            .populate("items.food")
            .populate("deliveryPartner", "name phone profilePhoto rating vehicleType vehicleNumber availabilityStatus status")
            .sort({ createdAt: -1 });

        const orders = rawOrders.map(o => {
            const obj = o.toObject ? o.toObject() : { ...o };
            obj.delivery = {
                status: obj.deliveryStatus || "Available",
                deliveryPartner: obj.deliveryPartner || null
            };
            return obj;
        });

        return res.status(200).json({
            success: true,
            totalOrders: orders.length,
            orders,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Order By ID
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
    try {
        const orderDoc = await Order.findById(req.params.id)
            .populate("user", "fullName email phone")
            .populate("items.food")
            .populate("deliveryPartner", "name phone profilePhoto rating vehicleType vehicleNumber availabilityStatus status");

        if (!orderDoc) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        // Customer can view their own, admin/restaurant/delivery can view all
        const isOwner = orderDoc.user && orderDoc.user._id.toString() === req.user._id.toString();
        const isStaff = ["admin", "restaurant", "delivery"].includes(req.user.role);

        if (!isOwner && !isStaff) {
            return res.status(403).json({
                success: false,
                message: "Access denied."
            });
        }

        const order = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };
        order.delivery = {
            status: order.deliveryStatus || "Available",
            deliveryPartner: order.deliveryPartner || null
        };

        return res.status(200).json({
            success: true,
            order,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel Order
 * PUT /api/orders/:id/cancel
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

        const isOwner = order.user.toString() === req.user._id.toString();
        const isAdminUser = req.user.role === "admin";

        if (!isOwner && !isAdminUser) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to cancel this order."
            });
        }

        if (order.orderStatus === "Delivered" || order.orderStatus === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: `Order is already ${order.orderStatus}.`
            });
        }

        order.orderStatus = "Cancelled";
        await order.save();

        // Restore stock
        for (const item of order.items) {
            try {
                await Food.findByIdAndUpdate(item.food, {
                    $inc: { stock: item.quantity }
                });
            } catch (e) {}
        }

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
 * Admin / Staff - Get All Orders
 * GET /api/orders/admin/all
 */
export const getAllOrders = async (req, res, next) => {
    try {
        const statusFilter = req.query.status;
        const query = {};
        if (statusFilter && statusFilter !== "All") {
            query.orderStatus = statusFilter;
        }

        const rawOrders = await Order.find(query)
            .populate("user", "fullName email phone")
            .populate("items.food")
            .populate("deliveryPartner", "name phone profilePhoto rating vehicleType vehicleNumber availabilityStatus status")
            .sort({ createdAt: -1 });

        const orders = rawOrders.map(o => {
            const obj = o.toObject ? o.toObject() : { ...o };
            obj.delivery = {
                status: obj.deliveryStatus || "Available",
                deliveryPartner: obj.deliveryPartner || null
            };
            return obj;
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
 * Update Order Status
 * PUT /api/orders/:id/status or /api/orders/admin/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderStatus, status } = req.body;
        const newStatus = orderStatus || status;

        const validStatuses = [
            "Placed",
            "Confirmed",
            "Preparing",
            "Out for Delivery",
            "Delivered",
            "Cancelled"
        ];

        if (!newStatus || !validStatuses.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid order status. Must be one of: ${validStatuses.join(", ")}`
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        order.orderStatus = newStatus;

        if (newStatus === "Delivered") {
            order.paymentStatus = "Paid";
            order.deliveredAt = new Date();
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: `Order status updated to ${newStatus}.`,
            order
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Order Statistics
 * GET /api/orders/admin/statistics
 */
export const getOrderStatistics = async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();
        const deliveredOrders = await Order.countDocuments({ orderStatus: "Delivered" });
        const pendingOrders = await Order.countDocuments({
            orderStatus: { $nin: ["Delivered", "Cancelled"] }
        });
        const cancelledOrders = await Order.countDocuments({ orderStatus: "Cancelled" });

        const revenueData = await Order.aggregate([
            {
                $match: {
                    $or: [
                        { paymentStatus: "Paid" },
                        { orderStatus: "Delivered" }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$finalAmount" }
                }
            }
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

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
