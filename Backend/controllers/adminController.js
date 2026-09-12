import User from "../models/User.js";
import Food from "../models/Food.js";
import Order from "../models/Order.js";
import {
    listFirebaseUsers,
    updateFirebaseUser,
    setCustomClaims,
    deleteFirebaseUser,
    adminAuth
} from "../config/firebaseAdmin.js";

/**
 * Admin Dashboard Stats & Recent Orders
 * GET /api/admin/dashboard
 */
export const getAdminDashboard = async (req, res, next) => {
    try {
        const [usersCount, foodsCount, ordersCount, revenueData, recentOrders] = await Promise.all([
            User.countDocuments(),
            Food.countDocuments(),
            Order.countDocuments(),
            Order.aggregate([
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
            ]),
            Order.find()
                .populate("user", "fullName email phone")
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        const revenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        // Pending & completed counts
        const pendingOrders = await Order.countDocuments({
            orderStatus: { $nin: ["Delivered", "Cancelled"] }
        });
        const completedOrders = await Order.countDocuments({
            orderStatus: "Delivered"
        });

        return res.status(200).json({
            success: true,
            stats: {
                users: usersCount,
                foods: foodsCount,
                orders: ordersCount,
                revenue,
                pendingOrders,
                completedOrders
            },
            recentOrders: recentOrders.map(o => ({
                _id: o._id,
                user: {
                    name: o.user?.fullName || "Guest User",
                    email: o.user?.email || "",
                    phone: o.user?.phone || ""
                },
                totalAmount: o.finalAmount || o.totalAmount,
                status: o.orderStatus,
                orderStatus: o.orderStatus,
                createdAt: o.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get All Foods for Admin
 * GET /api/admin/foods
 */
export const getAdminFoods = async (req, res, next) => {
    try {
        const foods = await Food.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            totalFoods: foods.length,
            foods
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get All Orders for Admin
 * GET /api/admin/orders
 */
export const getAdminOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate("user", "fullName email phone")
            .populate("items.food")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            totalOrders: orders.length,
            orders: orders.map(o => ({
                _id: o._id,
                user: {
                    _id: o.user?._id,
                    name: o.user?.fullName || "Guest User",
                    email: o.user?.email || "",
                    phone: o.user?.phone || ""
                },
                totalAmount: o.finalAmount || o.totalAmount,
                status: o.orderStatus,
                orderStatus: o.orderStatus,
                items: o.items,
                deliveryAddress: o.deliveryAddress,
                paymentMethod: o.paymentMethod,
                paymentStatus: o.paymentStatus,
                createdAt: o.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Order Status (Admin)
 * PUT /api/admin/orders/:id/status
 */
export const updateAdminOrderStatus = async (req, res, next) => {
    try {
        const { orderStatus, status } = req.body;
        const newStatus = orderStatus || status;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        order.orderStatus = newStatus;
        if (newStatus === "Delivered") {
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
 * Delete Order (Admin)
 * DELETE /api/admin/orders/:id
 */
export const deleteAdminOrder = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        return res.status(200).json({
            success: true,
            message: "Order deleted successfully."
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get All Users for Admin
 * GET /api/admin/users
 */
export const getAdminUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            totalUsers: users.length,
            users: users.map(u => ({
                _id: u._id,
                name: u.fullName,
                fullName: u.fullName,
                email: u.email,
                phone: u.phone,
                role: u.role,
                firebaseUid: u.firebaseUid,
                isBlocked: u.isBlocked,
                isVerified: u.isVerified,
                createdAt: u.createdAt
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle User Block Status (Synchronized with Firebase Admin)
 * PUT /api/admin/users/:id/block
 */
export const toggleBlockUser = async (req, res, next) => {
    try {
        // Prevent admin from blocking themselves
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot block your own admin account."
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        // Synchronize account availability with Firebase Auth
        if (user.firebaseUid) {
            await updateFirebaseUser(user.firebaseUid, { disabled: user.isBlocked });
        }

        console.log(`[ADMIN AUDIT] Admin ${req.user.email} ${user.isBlocked ? "BLOCKED" : "UNBLOCKED"} user: ${user.email} (UID: ${user.firebaseUid || "N/A"})`);

        return res.status(200).json({
            success: true,
            message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully.`,
            user: {
                _id: user._id,
                name: user.fullName,
                email: user.email,
                isBlocked: user.isBlocked,
                firebaseUid: user.firebaseUid
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Change User Role (Admin Only, Synchronized with Firebase Claims)
 * PUT /api/admin/users/:id/role
 */
export const changeUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const validRoles = ["customer", "restaurant", "delivery", "admin"];

        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Must be one of: ${validRoles.join(", ")}`
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const previousRole = user.role;
        user.role = role;
        await user.save();

        // Synchronize custom claims with Firebase Auth
        if (user.firebaseUid) {
            await setCustomClaims(user.firebaseUid, { role });
        }

        console.log(`[ADMIN AUDIT] Admin ${req.user.email} changed role of user ${user.email} from ${previousRole} to ${role}`);

        return res.status(200).json({
            success: true,
            message: `User role updated from ${previousRole} to ${role}.`,
            user: {
                _id: user._id,
                name: user.fullName,
                email: user.email,
                role: user.role,
                firebaseUid: user.firebaseUid
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete User (Admin Only, Synchronized with Firebase Auth)
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res, next) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own admin account."
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Delete from Firebase Auth
        if (user.firebaseUid) {
            await deleteFirebaseUser(user.firebaseUid);
        }

        console.log(`[ADMIN AUDIT] Admin ${req.user.email} deleted user: ${user.email}`);

        return res.status(200).json({
            success: true,
            message: "User account deleted successfully."
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Firebase Authentication Users List (Admin Only)
 * GET /api/admin/firebase/users
 */
export const getFirebaseUsers = async (req, res, next) => {
    try {
        const rawFirebaseUsers = await listFirebaseUsers(100);
        const mongoUsers = await User.find().select("-password");

        const users = mongoUsers.map((mu) => {
            const fb = rawFirebaseUsers.find(
                (f) => f.uid === mu.firebaseUid || (mu.email && f.email === mu.email.toLowerCase())
            );

            return {
                _id: mu._id,
                fullName: mu.fullName,
                email: mu.email,
                phone: mu.phone,
                role: mu.role,
                isBlocked: mu.isBlocked,
                isVerified: mu.isVerified || Boolean(fb?.emailVerified),
                firebaseUid: mu.firebaseUid || fb?.uid || null,
                firebaseDisabled: fb ? fb.disabled : mu.isBlocked,
                customClaims: fb?.customClaims || { role: mu.role },
                createdAt: mu.createdAt,
                lastSignIn: fb?.metadata?.lastSignInTime || null,
                isSyncedWithFirebase: Boolean(fb)
            };
        });

        return res.status(200).json({
            success: true,
            isLiveFirebase: Boolean(adminAuth),
            totalUsers: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};
