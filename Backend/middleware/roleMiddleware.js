import Restaurant from "../models/Restaurant.js";
import DeliveryPartner from "../models/DeliveryPartner.js";

/**
 * Role-Based Access Control Middleware
 * Requires that the authenticated user has one of the specified roles.
 * User role is strictly retrieved from the database.
 */
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        if (req.user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked by an administrator."
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(" or ")}. Your role: ${req.user.role}`
            });
        }

        next();
    };
};

export const requireAdmin = requireRole("admin");

/**
 * Restaurant Owner Verification Middleware
 * Sourced strictly from authenticated MongoDB user -> Restaurant.ownerId.
 * Never trusts req.body.restaurantId or URL params for ownership.
 */
export const requireRestaurantOwner = (options = { requireApproved: true }) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required."
                });
            }

            if (req.user.isBlocked) {
                return res.status(403).json({
                    success: false,
                    message: "Your account has been blocked by an administrator."
                });
            }

            // Admins can bypass for administrative viewing, otherwise strictly restaurant role
            if (req.user.role !== "restaurant" && req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Restaurant Partner account required."
                });
            }

            const restaurant = await Restaurant.findOne({ ownerId: req.user._id });

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    requiresRegistration: true,
                    message: "Restaurant account not found. Please register your restaurant first."
                });
            }

            // Enforce approval status for operations that require an active store
            if (options.requireApproved && req.user.role !== "admin") {
                if (restaurant.status === "pending") {
                    return res.status(403).json({
                        success: false,
                        status: "pending",
                        message: "Restaurant application is still under review."
                    });
                }
                if (restaurant.status === "rejected") {
                    return res.status(403).json({
                        success: false,
                        status: "rejected",
                        rejectionReason: restaurant.rejectionReason,
                        message: "Your restaurant application requires changes."
                    });
                }
                if (restaurant.status === "suspended") {
                    return res.status(403).json({
                        success: false,
                        status: "suspended",
                        suspensionReason: restaurant.suspensionReason,
                        message: "Your restaurant has been suspended."
                    });
                }
                if (restaurant.status === "closed") {
                    return res.status(403).json({
                        success: false,
                        status: "closed",
                        message: "Your restaurant is currently closed."
                    });
                }
            }

            // Attach authoritative restaurant document
            req.restaurant = restaurant;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Delivery Partner Verification Middleware
 * Sourced strictly from authenticated MongoDB user -> DeliveryPartner.userId.
 * Never trusts req.body.deliveryPartnerId, query, or params.
 */
export const requireDeliveryPartner = (options = { requireApproved: true }) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required."
                });
            }

            if (req.user.isBlocked) {
                return res.status(403).json({
                    success: false,
                    message: "Your account has been blocked by an administrator."
                });
            }

            // Admins can bypass for administrative viewing, otherwise strictly delivery role
            if (req.user.role !== "delivery" && req.user.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Delivery Partner account required."
                });
            }

            const deliveryPartner = await DeliveryPartner.findOne({ userId: req.user._id });

            if (!deliveryPartner) {
                return res.status(404).json({
                    success: false,
                    requiresActivation: true,
                    message: "Delivery partner profile not found. Please activate your delivery account first."
                });
            }

            if (options.requireApproved && req.user.role !== "admin") {
                if (deliveryPartner.status === "suspended") {
                    return res.status(403).json({
                        success: false,
                        status: "suspended",
                        message: "Your delivery partner account has been suspended."
                    });
                }
                if (deliveryPartner.status === "inactive") {
                    return res.status(403).json({
                        success: false,
                        status: "inactive",
                        message: "Your delivery partner account is currently inactive."
                    });
                }
            }

            // Attach authoritative delivery partner document
            req.deliveryPartner = deliveryPartner;
            next();
        } catch (error) {
            next(error);
        }
    };
};

export const authorize = requireRole;
export default requireRole;