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

        console.log("Logged-in User:", req.user);

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const cartItems = await Cart.countDocuments({
            user: req.user._id
        });

        console.log("Response Data:", {
            name: user.fullName,
            profileImage: user.profileImage,
            membership: user.membership,
            location: user.city || user.address,
            notifications: user.notificationCount,
            cartItems
        });

        const planName = user.membership?.plan || (typeof user.membership === "string" ? user.membership : "free");
        const membershipDisplay = planName && planName !== "free" && planName !== "Basic"
            ? `${planName.charAt(0).toUpperCase() + planName.slice(1)} Member`
            : "Free Member";

        return res.status(200).json({
            success: true,
            name: user.fullName,
            profileImage: user.profileImage,
            membership: membershipDisplay,
            membershipData: user.membership,
            city: user.city,
            address: user.address,
            notifications: user.notificationCount || 0,
            cartItems
        });

    } catch (error) {
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
        const userId = req.user?._id || req.user?.id;
        const user = userId ? await User.findById(userId) : null;
        const userOffers = user?.coupons || [];

        const defaultOffers = [
            {
                id: "def-1",
                code: "FIRST30",
                discount: 30,
                title: "30% OFF",
                subtitle: "New FoodExpress Customer Special",
                minOrder: "₹199",
                maxDiscount: "₹150",
                color: "#ff5200"
            },
            {
                id: "def-2",
                code: "WELCOME40",
                discount: 40,
                title: "40% OFF",
                subtitle: "Welcome Feast Special",
                minOrder: "₹299",
                maxDiscount: "₹200",
                color: "#e63946"
            },
            {
                id: "def-3",
                code: "FOOD20",
                discount: 20,
                title: "20% OFF",
                subtitle: "Daily Foodie Craving Deal",
                minOrder: "₹149",
                maxDiscount: "₹100",
                color: "#0f8a65"
            },
            {
                id: "def-4",
                code: "FREEDEL",
                discount: 100,
                title: "FREE DELIVERY",
                subtitle: "On All Orders Above ₹199",
                minOrder: "₹199",
                maxDiscount: "₹40",
                color: "#2563eb"
            }
        ];

        return res.status(200).json({
            success: true,
            offers: userOffers.length > 0 ? userOffers : defaultOffers
        });
    } catch (error) {
        next(error);
    }
};

/*
=====================================================
Active Order Tracking
GET /api/dashboard/active-order
=====================================================
*/
export const getActiveOrder = async (req, res, next) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const orderDoc = userId ? await Order.findOne({
            user: userId,
            orderStatus: { $in: ["Placed", "Confirmed", "Preparing", "Out for Delivery"] }
        })
            .populate("items.food")
            .populate("deliveryPartner", "name phone profilePhoto rating vehicleType vehicleNumber availabilityStatus status")
            .sort({ createdAt: -1 }) : null;

        if (!orderDoc) {
            return res.status(200).json({
                success: true,
                activeOrder: null
            });
        }

        const order = orderDoc.toObject ? orderDoc.toObject() : { ...orderDoc };
        order.delivery = {
            status: order.deliveryStatus || "Available",
            deliveryPartner: order.deliveryPartner || null
        };

        return res.status(200).json({
            success: true,
            activeOrder: order
        });
    } catch (error) {
        next(error);
    }
};

/*
=====================================================
Personalized Food Recommendations
GET /api/dashboard/recommendations
=====================================================
*/
export const getRecommendations = async (req, res, next) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const pastOrders = userId ? await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(3) : [];
        const lastDishName = pastOrders[0]?.items?.[0]?.name;

        const recommended = await Food.find({
            isAvailable: true,
            $or: [
                { featured: true },
                { rating: { $gte: 4.6 } }
            ]
        }).limit(6);

        return res.status(200).json({
            success: true,
            recommended,
            contextReason: lastDishName ? `Because you ordered ${lastDishName}` : "Trending & Highly Rated"
        });
    } catch (error) {
        next(error);
    }
};

/*
=====================================================
Top Restaurants Near Customer
GET /api/dashboard/restaurants
=====================================================
*/
export const getTopRestaurants = async (req, res, next) => {
    try {
        const restaurants = await Food.aggregate([
            { $match: { isAvailable: true } },
            {
                $group: {
                    _id: "$restaurant",
                    avgRating: { $avg: "$rating" },
                    foodCount: { $sum: 1 },
                    sampleImage: { $first: "$image" },
                    cuisine: { $first: "$category" }
                }
            },
            { $sort: { avgRating: -1 } },
            { $limit: 6 }
        ]);

        return res.status(200).json({
            success: true,
            restaurants: restaurants.map((r) => ({
                id: r._id,
                name: r._id || "FoodExpress Cloud Kitchen",
                rating: (r.avgRating || 4.8).toFixed(1),
                deliveryTime: "25-30 min",
                distance: "2.4 km",
                offer: "20% OFF up to ₹100",
                priceForTwo: "₹350 for two",
                image: r.sampleImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600",
                cuisine: r.cuisine || "Multi-Cuisine"
            }))
        });
    } catch (error) {
        next(error);
    }
};