import User from "../models/User.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Food from "../models/Food.js";

/*
=====================================================
Dashboard Navbar
GET /api/dashboard/navbar
=====================================================
*/
export const getNavbar = async (req, res, next) => {

    try {

        // Logged-in User
        const user = await User.findById(req.user._id);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        // Cart Count
        const cartItems = await Cart.countDocuments({
            user: req.user._id
        });

        // Notification Count
        const notificationCount =
            user.notificationCount || 0;

        // Membership
        const membership =
            user.membership || "Basic";

        // Location
        const location =
            user.city || user.address;

            return res.status(200).json({
                success: true,
                name: user.fullName,
                profileImage: user.profileImage,
                membership: user.membership,
                location: user.city || user.address,
                notifications: user.notificationCount || 0,
                cartItems
            });

    }

    catch (error) {

        next(error);

    }

};

/*
=====================================================
Dashboard Statistics
GET /api/dashboard/stats
=====================================================
*/
export const getDashboardStats = async (req, res, next) => {

    try {

        const totalOrders =
            await Order.countDocuments({
                user: req.user._id
            });

        const activeOrders =
            await Order.countDocuments({
                user: req.user._id,
                orderStatus: {
                    $nin: ["Delivered", "Cancelled"]
                }
            });

        const user =
            await User.findById(req.user._id);

            const availableOffers = user.coupons?.length || 0;

        return res.status(200).json({

            success: true,

            stats: {

                totalOrders,

                activeOrders,

                rewardPoints:
                    user.rewardPoints,

                availableOffers

            }

        });

    }

    catch (error) {

        next(error);

    }

};

/*
=====================================================
Wallet
GET /api/dashboard/wallet
=====================================================
*/
export const getWallet = async (req, res, next) => {

    try {

        const user =
            await User.findById(req.user._id);

        return res.status(200).json({

            success: true,

            wallet: {

                balance: user.wallet,

                rewardPoints:
                    user.rewardPoints

            }

        });

    }

    catch (error) {

        next(error);

    }

};

/*
=====================================================
Recent Orders
GET /api/dashboard/orders
=====================================================
*/
export const getRecentOrders = async (req, res, next) => {

    try {

        const orders =
            await Order.find({

                user: req.user._id

            })

            .sort({
                createdAt: -1
            })

            .limit(5);

        return res.status(200).json({

            success: true,

            total: orders.length,

            orders

        });

    }

    catch (error) {

        next(error);

    }

};

/*
=====================================================
Popular Foods
GET /api/dashboard/popular-foods
=====================================================
*/
export const getPopularFoods = async (req, res, next) => {

    try {

        const foods =
            await Food.find({

                isAvailable: true

            })

            .sort({

                rating: -1

            })

            .limit(8);

        return res.status(200).json({

            success: true,

            foods

        });

    }

    catch (error) {

        next(error);

    }

};

/*
=====================================================
Offers
GET /api/dashboard/offers
=====================================================
*/
export const getOffers = async (req, res, next) => {

    try {

        const user =
            await User.findById(req.user._id);

        return res.status(200).json({

            success: true,

            offers: user.coupons

        });

    }

    catch (error) {

        next(error);

    }

};