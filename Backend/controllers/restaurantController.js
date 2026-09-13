import Restaurant from "../models/Restaurant.js";
import User from "../models/User.js";
import Food from "../models/Food.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import { verifyFirebaseToken } from "../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";

/**
 * Generate JWT Token helper
 */
const generateToken = (userId, role = "restaurant") => {
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_SECRET || "foodexpress_secret_jwt_key_2025",
        { expiresIn: "7d" }
    );
};

/**
 * Register Restaurant & Owner Account
 * POST /api/restaurant/register
 */
export const registerRestaurant = async (req, res, next) => {
    try {
        let authUser = req.user;
        const {
            // Owner credentials if not yet authenticated
            idToken,
            fullName,
            email,
            password,
            phone: ownerPhone,

            // Restaurant details
            restaurantName,
            description,
            restaurantEmail,
            restaurantPhone,
            address,
            cuisineTypes,
            restaurantType,
            openingTime,
            closingTime,
            deliveryAvailable,
            minimumOrderAmount,
            deliveryFee,
            initialMenuItems
        } = req.body;

        // 1. Authenticate or resolve User account
        if (!authUser) {
            let fbUser = null;
            if (idToken) {
                fbUser = await verifyFirebaseToken(idToken);
            }

            const targetEmail = (fbUser?.email || email || restaurantEmail || "").toLowerCase().trim();
            const targetUid = fbUser?.uid;

            if (!targetEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Owner email is required."
                });
            }

            // Find existing user or create
            const userQuery = targetUid
                ? { $or: [{ firebaseUid: targetUid }, { email: targetEmail }] }
                : { email: targetEmail };

            authUser = await User.findOne(userQuery);

            if (!authUser) {
                authUser = await User.create({
                    firebaseUid: targetUid || undefined,
                    fullName: (fullName || fbUser?.name || restaurantName || "Restaurant Partner").trim(),
                    email: targetEmail,
                    password: password || undefined,
                    phone: ownerPhone || restaurantPhone || "",
                    role: "restaurant",
                    isVerified: Boolean(fbUser?.email_verified)
                });
            } else {
                // Elevate user role to restaurant
                authUser.role = "restaurant";
                if (targetUid && !authUser.firebaseUid) {
                    authUser.firebaseUid = targetUid;
                }
                await authUser.save();
            }
        } else {
            // Ensure authenticated user role is restaurant
            if (authUser.role !== "restaurant" && authUser.role !== "admin") {
                authUser.role = "restaurant";
                await authUser.save();
            }
        }

        // 2. Check if a restaurant is already registered for this owner
        let existingRestaurant = await Restaurant.findOne({ ownerId: authUser._id });

        if (existingRestaurant) {
            // If already pending or approved, prevent duplicate registration
            if (existingRestaurant.status === "approved") {
                return res.status(400).json({
                    success: false,
                    message: "You already have an approved restaurant on FoodExpress.",
                    restaurant: existingRestaurant
                });
            }

            // If rejected or pending, allow updating the existing application
            existingRestaurant.name = (restaurantName || existingRestaurant.name).trim();
            if (description !== undefined) existingRestaurant.description = description.trim();
            if (restaurantEmail) existingRestaurant.email = restaurantEmail.toLowerCase().trim();
            if (restaurantPhone) existingRestaurant.phone = restaurantPhone.trim();
            if (address) {
                existingRestaurant.address = {
                    street: address.street || existingRestaurant.address.street || "",
                    city: address.city || existingRestaurant.address.city || "Hyderabad",
                    state: address.state || existingRestaurant.address.state || "",
                    pincode: address.pincode || existingRestaurant.address.pincode || ""
                };
            }
            if (cuisineTypes) {
                existingRestaurant.cuisineTypes = Array.isArray(cuisineTypes) ? cuisineTypes : [cuisineTypes];
            }
            if (restaurantType) existingRestaurant.restaurantType = restaurantType;
            if (openingTime) existingRestaurant.openingTime = openingTime;
            if (closingTime) existingRestaurant.closingTime = closingTime;
            if (deliveryAvailable !== undefined) existingRestaurant.deliveryAvailable = Boolean(deliveryAvailable);
            if (minimumOrderAmount !== undefined) existingRestaurant.minimumOrderAmount = Number(minimumOrderAmount);
            if (deliveryFee !== undefined) existingRestaurant.deliveryFee = Number(deliveryFee);

            existingRestaurant.status = "pending";
            existingRestaurant.isActive = false;
            existingRestaurant.rejectionReason = "";

            await existingRestaurant.save();

            const token = generateToken(authUser._id, "restaurant");

            return res.status(200).json({
                success: true,
                message: "Restaurant application updated and resubmitted for admin approval.",
                restaurant: existingRestaurant,
                token,
                user: {
                    _id: authUser._id,
                    fullName: authUser.fullName,
                    email: authUser.email,
                    role: authUser.role
                }
            });
        }

        // 3. Validate required restaurant information
        if (!restaurantName || !restaurantPhone || !restaurantEmail) {
            return res.status(400).json({
                success: false,
                message: "Please provide restaurant name, contact phone, and email."
            });
        }

        const city = address?.city?.trim() || "Hyderabad";
        const pincode = address?.pincode?.trim() || "500001";

        // 4. Create new Restaurant in "pending" status
        const restaurant = await Restaurant.create({
            ownerId: authUser._id,
            name: restaurantName.trim(),
            description: (description || "").trim(),
            email: restaurantEmail.toLowerCase().trim(),
            phone: restaurantPhone.trim(),
            address: {
                street: address?.street?.trim() || "",
                city,
                state: address?.state?.trim() || "",
                pincode
            },
            cuisineTypes: Array.isArray(cuisineTypes) && cuisineTypes.length > 0 ? cuisineTypes : ["Indian"],
            restaurantType: ["Veg", "Non-Veg", "Both"].includes(restaurantType) ? restaurantType : "Both",
            openingTime: openingTime || "09:00 AM",
            closingTime: closingTime || "11:00 PM",
            deliveryAvailable: deliveryAvailable !== undefined ? Boolean(deliveryAvailable) : true,
            minimumOrderAmount: minimumOrderAmount ? Number(minimumOrderAmount) : 100,
            deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : 40,
            status: "pending",
            isActive: false,
            rating: 5.0,
            totalReviews: 0
        });

        // 5. Seed initial menu items if provided during onboarding
        if (Array.isArray(initialMenuItems) && initialMenuItems.length > 0) {
            for (const item of initialMenuItems) {
                if (item.name && item.price) {
                    await Food.create({
                        name: item.name.trim(),
                        description: (item.description || `${item.name} freshly prepared by ${restaurant.name}`).trim(),
                        category: item.category || "Fast Food",
                        price: Number(item.price),
                        discountPrice: item.discountPrice ? Number(item.discountPrice) : 0,
                        image: item.image || "margherita.jpg",
                        isVeg: item.isVeg !== undefined ? Boolean(item.isVeg) : true,
                        preparationTime: item.preparationTime ? Number(item.preparationTime) : 25,
                        stock: item.stock !== undefined ? Number(item.stock) : 50,
                        isAvailable: true,
                        restaurantId: restaurant._id,
                        restaurant: restaurant.name,
                        area: city,
                        areas: [city]
                    });
                }
            }
        }

        const token = generateToken(authUser._id, "restaurant");

        return res.status(201).json({
            success: true,
            message: "🎉 Restaurant application submitted successfully! It is now under admin review.",
            restaurant,
            token,
            user: {
                _id: authUser._id,
                fullName: authUser.fullName,
                email: authUser.email,
                role: authUser.role
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Current Owner's Restaurant & Application Status
 * GET /api/restaurant/me
 */
export const getMyRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

        if (!restaurant) {
            return res.status(200).json({
                success: true,
                hasRestaurant: false,
                requiresRegistration: true,
                message: "No restaurant found for this account."
            });
        }

        return res.status(200).json({
            success: true,
            hasRestaurant: true,
            restaurant,
            owner: {
                _id: req.user._id,
                fullName: req.user.fullName,
                email: req.user.email,
                phone: req.user.phone
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Restaurant Profile
 * PUT /api/restaurant/me
 */
export const updateMyRestaurant = async (req, res, next) => {
    try {
        const restaurant = req.restaurant;

        const {
            name,
            description,
            logo,
            coverImage,
            phone,
            email,
            address,
            cuisineTypes,
            restaurantType,
            openingTime,
            closingTime,
            deliveryAvailable,
            minimumOrderAmount,
            deliveryFee
        } = req.body;

        if (name) restaurant.name = name.trim();
        if (description !== undefined) restaurant.description = description.trim();
        if (logo) restaurant.logo = logo;
        if (coverImage) restaurant.coverImage = coverImage;
        if (phone) restaurant.phone = phone.trim();
        if (email) restaurant.email = email.toLowerCase().trim();

        if (address && typeof address === "object") {
            restaurant.address = {
                street: address.street !== undefined ? address.street : restaurant.address.street,
                city: address.city !== undefined ? address.city.trim() : restaurant.address.city,
                state: address.state !== undefined ? address.state.trim() : restaurant.address.state,
                pincode: address.pincode !== undefined ? address.pincode.trim() : restaurant.address.pincode
            };
        }

        if (cuisineTypes) {
            restaurant.cuisineTypes = Array.isArray(cuisineTypes) ? cuisineTypes : [cuisineTypes];
        }
        if (restaurantType) restaurant.restaurantType = restaurantType;
        if (openingTime) restaurant.openingTime = openingTime;
        if (closingTime) restaurant.closingTime = closingTime;
        if (deliveryAvailable !== undefined) restaurant.deliveryAvailable = Boolean(deliveryAvailable);
        if (minimumOrderAmount !== undefined) restaurant.minimumOrderAmount = Number(minimumOrderAmount);
        if (deliveryFee !== undefined) restaurant.deliveryFee = Number(deliveryFee);

        // If restaurant was rejected, editing and saving resubmits for review
        if (restaurant.status === "rejected") {
            restaurant.status = "pending";
            restaurant.rejectionReason = "";
        }

        await restaurant.save();

        // Synchronize restaurant name on existing foods
        if (name) {
            await Food.updateMany(
                { restaurantId: restaurant._id },
                { restaurant: restaurant.name }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Restaurant profile updated successfully.",
            restaurant
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Restaurant Dashboard Statistics
 * GET /api/restaurant/dashboard
 */
export const getRestaurantDashboard = async (req, res, next) => {
    try {
        const restaurantId = req.restaurant._id;

        // Fetch all orders that contain at least one item from this restaurant
        const orders = await Order.find({ "items.restaurantId": restaurantId })
            .populate("user", "fullName phone email")
            .sort({ createdAt: -1 });

        // Today start boundary
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        let todayOrdersCount = 0;
        let todayRevenue = 0;
        let pendingCount = 0;
        let preparingCount = 0;
        let readyCount = 0;
        let deliveredCount = 0;

        // Tally food sales map
        const foodSalesMap = {};

        orders.forEach((order) => {
            const isToday = new Date(order.createdAt) >= todayStart;

            // Calculate revenue strictly for this restaurant's items
            const restaurantItems = order.items.filter(
                (item) => item.restaurantId && item.restaurantId.toString() === restaurantId.toString()
            );
            const itemRevenue = restaurantItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);

            if (isToday) {
                todayOrdersCount++;
                if (order.paymentStatus === "Paid" || order.orderStatus === "Delivered") {
                    todayRevenue += itemRevenue;
                }
            }

            if (order.orderStatus === "Placed") pendingCount++;
            else if (order.orderStatus === "Confirmed" || order.orderStatus === "Preparing") preparingCount++;
            else if (order.orderStatus === "Out for Delivery") readyCount++;
            else if (order.orderStatus === "Delivered") deliveredCount++;

            // Accumulate food sales
            restaurantItems.forEach((it) => {
                const key = it.foodId ? it.foodId.toString() : it.name;
                if (!foodSalesMap[key]) {
                    foodSalesMap[key] = {
                        name: it.name,
                        image: it.image,
                        orders: 0,
                        revenue: 0
                    };
                }
                foodSalesMap[key].orders += it.quantity || 1;
                foodSalesMap[key].revenue += (it.subtotal || ((it.price || 0) * (it.quantity || 1)));
            });
        });

        // 7 Days Performance Breakdown
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const days7 = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0, 0, 0, 0);
            const nextD = new Date(d);
            nextD.setDate(d.getDate() + 1);

            const dayOrders = orders.filter((o) => {
                const od = new Date(o.createdAt);
                return od >= d && od < nextD;
            });

            const dayRevenue = dayOrders.reduce((sum, o) => {
                const rItems = o.items.filter(
                    (it) => it.restaurantId && it.restaurantId.toString() === restaurantId.toString()
                );
                return sum + rItems.reduce((isum, it) => isum + (it.subtotal || 0), 0);
            }, 0);

            return {
                day: dayNames[d.getDay()],
                date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                orders: dayOrders.length,
                revenue: dayRevenue
            };
        });

        // 30 Days Breakdown (4 Weeks)
        const days30 = [
            { label: "Week 1", orders: 0, revenue: 0 },
            { label: "Week 2", orders: 0, revenue: 0 },
            { label: "Week 3", orders: 0, revenue: 0 },
            { label: "Week 4", orders: 0, revenue: 0 }
        ];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        orders.forEach((o) => {
            const oDate = new Date(o.createdAt);
            if (oDate >= thirtyDaysAgo) {
                const diffDays = Math.floor((new Date() - oDate) / (1000 * 60 * 60 * 24));
                const weekIdx = Math.min(3, Math.floor(diffDays / 7));
                const rItems = o.items.filter(
                    (it) => it.restaurantId && it.restaurantId.toString() === restaurantId.toString()
                );
                const rRev = rItems.reduce((s, it) => s + (it.subtotal || 0), 0);
                // Inverse index so Week 1 is oldest and Week 4 is most recent
                const targetIdx = 3 - weekIdx;
                days30[targetIdx].orders += 1;
                days30[targetIdx].revenue += rRev;
            }
        });

        // Fetch foods & low stock items
        const [foods, lowStockFoods] = await Promise.all([
            Food.find({ restaurantId }).sort({ totalReviews: -1, rating: -1 }).limit(8),
            Food.find({ restaurantId, stock: { $lte: 5 } }).sort({ stock: 1 }).limit(10)
        ]);

        // Attach sales data to top foods
        const topFoodsWithStats = foods.map((f) => {
            const fObj = f.toObject();
            const fKey = f._id.toString();
            const sales = foodSalesMap[fKey] || foodSalesMap[f.name];
            return {
                ...fObj,
                ordersCount: sales?.orders || f.totalReviews || 0,
                totalRevenue: sales?.revenue || ((sales?.orders || f.totalReviews || 0) * f.price)
            };
        }).sort((a, b) => (b.ordersCount || 0) - (a.ordersCount || 0)).slice(0, 5);

        // Clean isolated recent orders (last 6)
        const recentOrders = orders.slice(0, 6).map((order) => {
            const restaurantItems = order.items.filter(
                (item) => item.restaurantId && item.restaurantId.toString() === restaurantId.toString()
            );
            const restaurantTotal = restaurantItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);

            return {
                _id: order._id,
                orderNumber: `#FE${order._id.toString().slice(-4).toUpperCase()}`,
                customerName: order.user?.fullName || order.deliveryAddress?.fullName || "Customer",
                customerPhone: order.user?.phone || order.deliveryAddress?.phone || "",
                items: restaurantItems,
                restaurantTotal,
                totalAmount: restaurantTotal,
                orderStatus: order.orderStatus,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt
            };
        });

        return res.status(200).json({
            success: true,
            restaurant: {
                _id: req.restaurant._id,
                name: req.restaurant.name,
                description: req.restaurant.description || "",
                status: req.restaurant.status,
                isActive: req.restaurant.isActive,
                isOpen: req.restaurant.isOpen !== false,
                rating: req.restaurant.rating || 4.5,
                totalReviews: req.restaurant.totalReviews || 0,
                cuisineTypes: req.restaurant.cuisineTypes || ["Indian", "Fast Food"],
                address: req.restaurant.address || {},
                openingTime: req.restaurant.openingTime || "10:00 AM",
                closingTime: req.restaurant.closingTime || "11:00 PM",
                deliveryAvailable: req.restaurant.deliveryAvailable !== false,
                phone: req.restaurant.phone || "",
                email: req.restaurant.email || ""
            },
            stats: {
                todayOrders: todayOrdersCount,
                todayRevenue,
                pendingOrders: pendingCount,
                preparingOrders: preparingCount,
                readyOrders: readyCount,
                deliveredOrders: deliveredCount,
                averageRating: req.restaurant.rating || 4.5,
                totalOrders: orders.length,
                totalMenuFoods: await Food.countDocuments({ restaurantId }),
                ordersGrowth: "+12%",
                revenueGrowth: "+8%"
            },
            performance: {
                today: { orders: todayOrdersCount, revenue: todayRevenue },
                days7,
                days30
            },
            recentOrders,
            topFoods: topFoodsWithStats,
            lowStockFoods
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Orders for Restaurant (Strict Order Isolation)
 * GET /api/restaurant/orders
 */
export const getRestaurantOrders = async (req, res, next) => {
    try {
        const restaurantId = req.restaurant._id;
        const { status } = req.query;

        const query = {
            "items.restaurantId": restaurantId
        };

        if (status && status !== "All") {
            query.orderStatus = status;
        }

        const orders = await Order.find(query)
            .populate("user", "fullName phone email")
            .sort({ createdAt: -1 });

        // Filter each order so it contains ONLY this restaurant's items
        const isolatedOrders = orders.map((order) => {
            const myItems = order.items.filter(
                (item) => item.restaurantId && item.restaurantId.toString() === restaurantId.toString()
            );
            const restaurantSubtotal = myItems.reduce((acc, item) => acc + (item.subtotal || 0), 0);

            return {
                _id: order._id,
                orderNumber: `#FD-${order._id.toString().slice(-6).toUpperCase()}`,
                user: {
                    fullName: order.user?.fullName || order.deliveryAddress?.fullName || "Customer",
                    phone: order.user?.phone || order.deliveryAddress?.phone || "",
                    email: order.user?.email || ""
                },
                items: myItems,
                restaurantSubtotal,
                totalAmount: restaurantSubtotal,
                deliveryAddress: order.deliveryAddress,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                orderStatus: order.orderStatus,
                createdAt: order.createdAt
            };
        }).filter((order) => order.items.length > 0);

        return res.status(200).json({
            success: true,
            totalOrders: isolatedOrders.length,
            orders: isolatedOrders
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Restaurant Order Status
 * PUT /api/restaurant/orders/:id/status or /:action
 */
export const updateRestaurantOrderStatus = async (req, res, next) => {
    try {
        const restaurantId = req.restaurant._id;
        const { id } = req.params;
        const { orderStatus, action } = req.body;

        const order = await Order.findOne({
            _id: id,
            "items.restaurantId": restaurantId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or does not belong to your restaurant."
            });
        }

        // Determine target status
        let targetStatus = orderStatus;
        if (action === "accept") targetStatus = "Confirmed";
        else if (action === "reject") targetStatus = "Cancelled";
        else if (action === "preparing") targetStatus = "Preparing";
        else if (action === "ready") targetStatus = "Out for Delivery";

        const validTransitions = ["Confirmed", "Preparing", "Out for Delivery", "Cancelled"];

        if (!targetStatus || !validTransitions.includes(targetStatus)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validTransitions.join(", ")}`
            });
        }

        order.orderStatus = targetStatus;
        await order.save();

        return res.status(200).json({
            success: true,
            message: `Order status updated to "${targetStatus}".`,
            orderStatus: order.orderStatus
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Restaurant Menu
 * GET /api/restaurant/menu
 */
export const getRestaurantMenu = async (req, res, next) => {
    try {
        const restaurantId = req.restaurant._id;
        const foods = await Food.find({ restaurantId }).sort({ category: 1, name: 1 });

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
 * Add Food to Restaurant Menu
 * POST /api/restaurant/menu
 */
export const addRestaurantFood = async (req, res, next) => {
    try {
        const restaurant = req.restaurant;
        const {
            name,
            description,
            category,
            price,
            discountPrice,
            image,
            isVeg,
            preparationTime,
            stock
        } = req.body;

        if (!name || !description || !category || !price) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields (name, description, category, price)."
            });
        }

        const food = await Food.create({
            name: name.trim(),
            description: description.trim(),
            category: category.trim(),
            price: Number(price),
            discountPrice: discountPrice ? Number(discountPrice) : 0,
            image: req.file ? req.file.filename : (image || "margherita.jpg"),
            isVeg: isVeg === "false" || isVeg === false ? false : true,
            preparationTime: preparationTime ? Number(preparationTime) : 20,
            stock: stock !== undefined ? Number(stock) : 50,
            isAvailable: true,
            restaurantId: restaurant._id,
            restaurant: restaurant.name,
            area: restaurant.address.city || "Hyderabad",
            areas: [restaurant.address.city || "Hyderabad"]
        });

        return res.status(201).json({
            success: true,
            message: `"${food.name}" added to menu successfully!`,
            food
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Restaurant Food
 * PUT /api/restaurant/menu/:id
 */
export const updateRestaurantFood = async (req, res, next) => {
    try {
        const restaurantId = req.restaurant._id;
        const { id } = req.params;

        const food = await Food.findOne({ _id: id, restaurantId });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found or does not belong to your restaurant."
            });
        }

        const {
            name,
            description,
            category,
            price,
            discountPrice,
            image,
            isVeg,
            preparationTime,
            stock,
            isAvailable
        } = req.body;

        if (name) food.name = name.trim();
        if (description) food.description = description.trim();
        if (category) food.category = category.trim();
        if (price !== undefined) food.price = Number(price);
        if (discountPrice !== undefined) food.discountPrice = Number(discountPrice);
        if (preparationTime !== undefined) food.preparationTime = Number(preparationTime);
        if (stock !== undefined) food.stock = Number(stock);
        if (isVeg !== undefined) food.isVeg = isVeg === "true" || isVeg === true;
        if (isAvailable !== undefined) food.isAvailable = isAvailable === "true" || isAvailable === true;

        if (req.file) {
            food.image = req.file.filename;
        } else if (image) {
            food.image = image;
        }

        await food.save();

        return res.status(200).json({
            success: true,
            message: `"${food.name}" updated successfully.`,
            food
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete Restaurant Food
 * DELETE /api/restaurant/menu/:id
 */
export const deleteRestaurantFood = async (req, res, next) => {
    try {
        const restaurantId = req.restaurant._id;
        const { id } = req.params;

        const food = await Food.findOneAndDelete({ _id: id, restaurantId });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found or does not belong to your restaurant."
            });
        }

        return res.status(200).json({
            success: true,
            message: `"${food.name}" deleted from your menu.`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Food Stock & Availability
 * PUT /api/restaurant/menu/:id/stock
 */
export const updateFoodStock = async (req, res, next) => {
    try {
        const restaurantId = req.restaurant._id;
        const { id } = req.params;
        const { stock, isAvailable } = req.body;

        const food = await Food.findOne({ _id: id, restaurantId });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found or does not belong to your restaurant."
            });
        }

        if (stock !== undefined) {
            food.stock = Math.max(0, Number(stock));
            // Auto mark out of stock if 0
            if (food.stock === 0) {
                food.isAvailable = false;
            } else if (isAvailable !== undefined) {
                food.isAvailable = Boolean(isAvailable);
            }
        } else if (isAvailable !== undefined) {
            food.isAvailable = Boolean(isAvailable);
        } else {
            food.isAvailable = !food.isAvailable;
        }

        await food.save();

        return res.status(200).json({
            success: true,
            message: `Stock updated for "${food.name}". (Stock: ${food.stock}, Available: ${food.isAvailable})`,
            food
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Restaurant Analytics (Real Aggregation)
 * GET /api/restaurant/analytics
 */
export const getRestaurantAnalytics = async (req, res, next) => {
    try {
        const restaurantId = req.restaurant._id;

        const orders = await Order.find({ "items.restaurantId": restaurantId }).sort({ createdAt: -1 });

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - 7));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let todaySales = 0;
        let weeklySales = 0;
        let monthlySales = 0;
        let totalCompleted = 0;
        let totalCancelled = 0;

        // Last 7 days breakdown for bar chart
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weeklyBreakdown = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                day: dayNames[d.getDay()],
                date: d.toISOString().split("T")[0],
                sales: 0,
                orders: 0
            };
        });

        orders.forEach((o) => {
            const oDate = new Date(o.createdAt);
            const myItems = o.items.filter(
                (item) => item.restaurantId && item.restaurantId.toString() === restaurantId.toString()
            );
            const revenue = myItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);

            if (o.orderStatus === "Delivered") {
                totalCompleted++;
            } else if (o.orderStatus === "Cancelled") {
                totalCancelled++;
            }

            if (oDate >= startOfToday) {
                todaySales += revenue;
            }
            if (oDate >= startOfWeek) {
                weeklySales += revenue;
            }
            if (oDate >= startOfMonth) {
                monthlySales += revenue;
            }

            // Populate weekly breakdown
            const dateStr = oDate.toISOString().split("T")[0];
            const foundDay = weeklyBreakdown.find((b) => b.date === dateStr);
            if (foundDay) {
                foundDay.sales += revenue;
                foundDay.orders += 1;
            }
        });

        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? Math.round(weeklySales / Math.max(1, totalOrders)) : 0;

        const topFoods = await Food.find({ restaurantId }).sort({ totalReviews: -1, rating: -1 }).limit(5);
        const lowStockFoods = await Food.find({ restaurantId, stock: { $lte: 5 } }).sort({ stock: 1 }).limit(5);

        return res.status(200).json({
            success: true,
            analytics: {
                todaySales,
                weeklySales,
                monthlySales,
                totalOrders,
                completedOrders: totalCompleted,
                cancelledOrders: totalCancelled,
                averageOrderValue: avgOrderValue,
                weeklyBreakdown,
                topFoods,
                lowStockFoods
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Restaurant Food Reviews
 * GET /api/restaurant/reviews
 */
export const getRestaurantReviews = async (req, res, next) => {
    try {
        const restaurantId = req.restaurant._id;
        const foods = await Food.find({ restaurantId }).select("_id name image");
        const foodIds = foods.map((f) => f._id);

        const reviews = await Review.find({ food: { $in: foodIds } })
            .populate("food", "name image")
            .sort({ createdAt: -1 })
            .limit(50);

        // Sanitize reviews so customer private details are protected
        const sanitizedReviews = reviews.map((r) => ({
            _id: r._id,
            rating: r.rating,
            comment: r.comment,
            userName: r.userName ? r.userName.split(" ")[0] + " " + (r.userName.split(" ")[1] ? r.userName.split(" ")[1][0] + "." : "") : "Customer",
            foodName: r.food?.name || "Dish",
            foodImage: r.food?.image || "margherita.jpg",
            createdAt: r.createdAt
        }));

        return res.status(200).json({
            success: true,
            totalReviews: sanitizedReviews.length,
            averageRating: req.restaurant.rating,
            reviews: sanitizedReviews
        });
    } catch (error) {
        next(error);
    }
};
