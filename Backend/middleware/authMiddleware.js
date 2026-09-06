import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect routes
 * Verifies JWT and attaches user to request
 */
export const protect = async (req, res, next) => {
    try {
        let token = null;

        // Authorization Header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // Cookie Token (optional)
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found."
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked."
            });
        }

        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
            error: error.message
        });
    }
};

/**
 * Optional authentication
 * Continues even if the user is not logged in.
 */
export const optionalAuth = async (req, res, next) => {
    try {
        let token = null;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (user) {
            req.user = user;
        }

        next();
    } catch (error) {
        next();
    }
};