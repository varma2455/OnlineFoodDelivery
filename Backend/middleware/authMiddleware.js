import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyFirebaseToken } from "../config/firebaseAdmin.js";

/**
 * Protect routes (requireAuth)
 * Supports both Firebase ID Tokens and standard application JWTs.
 * The user's role is strictly sourced from MongoDB.
 */
export const protect = async (req, res, next) => {
    try {
        let token = null;

        // Extract token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Authentication token required."
            });
        }

        let authenticatedUser = null;
        let firebaseUid = null;

        // 1. Check if token is a Firebase ID token
        const fbResult = await verifyFirebaseToken(token);
        if (fbResult && fbResult.uid) {
            firebaseUid = fbResult.uid;
            const email = (fbResult.email || "").toLowerCase();

            // Look up user in MongoDB
            authenticatedUser = await User.findOne({
                $or: [
                    { firebaseUid },
                    ...(email ? [{ email }] : [])
                ]
            }).select("-password");

            // If user logged in through Firebase but has no MongoDB record, provision with customer role
            if (!authenticatedUser && email) {
                authenticatedUser = await User.create({
                    firebaseUid,
                    fullName: fbResult.name || email.split("@")[0],
                    email,
                    role: "customer", // NEVER trust frontend role! Default is always customer
                    isVerified: Boolean(fbResult.email_verified),
                    wallet: 100,
                    rewardPoints: 50
                });
            } else if (authenticatedUser && !authenticatedUser.firebaseUid) {
                // Link firebaseUid if not set
                authenticatedUser.firebaseUid = firebaseUid;
                await authenticatedUser.save();
            }
        }

        // 2. If not authenticated via Firebase, verify as application JWT
        if (!authenticatedUser) {
            try {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET || "foodexpress_secret_jwt_key_2025"
                );
                authenticatedUser = await User.findById(decoded.id).select("-password");
            } catch (jwtErr) {
                // Token is neither a valid Firebase ID token nor a valid application JWT
            }
        }

        if (!authenticatedUser) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token."
            });
        }

        // 3. Security Check: Reject if user account is blocked by administrator
        if (authenticatedUser.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked by an administrator."
            });
        }

        // 4. Attach authenticated user from MongoDB (authoritative role source)
        req.user = authenticatedUser;
        req.firebaseUid = authenticatedUser.firebaseUid || firebaseUid;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication verification failed.",
            error: error.message
        });
    }
};

/**
 * Reusable alias
 */
export const requireAuth = protect;

/**
 * Optional authentication
 * Continues even if the user is not logged in.
 */
export const optionalAuth = async (req, res, next) => {
    try {
        let token = null;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return next();
        }

        // Try Firebase
        const fbResult = await verifyFirebaseToken(token);
        if (fbResult && fbResult.uid) {
            const user = await User.findOne({
                $or: [
                    { firebaseUid: fbResult.uid },
                    ...(fbResult.email ? [{ email: fbResult.email.toLowerCase() }] : [])
                ]
            }).select("-password");
            if (user && !user.isBlocked) {
                req.user = user;
                req.firebaseUid = user.firebaseUid;
                return next();
            }
        }

        // Try JWT
        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "foodexpress_secret_jwt_key_2025"
            );
            const user = await User.findById(decoded.id).select("-password");
            if (user && !user.isBlocked) {
                req.user = user;
            }
        } catch (jwtErr) {
            // ignore
        }

        next();
    } catch (error) {
        next();
    }
};