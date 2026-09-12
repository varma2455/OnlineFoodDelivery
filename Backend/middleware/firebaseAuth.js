import { adminAuth } from "../config/firebaseAdmin.js";
import jwt from "jsonwebtoken";

const firebaseAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing"
            });
        }

        const token = authHeader.split(" ")[1];

        // 1. If adminAuth is available, verify with Firebase Admin
        if (adminAuth) {
            try {
                const decoded = await adminAuth.verifyIdToken(token);
                req.firebaseUser = decoded;
                return next();
            } catch (err) {
                console.warn("Firebase Admin token verify error:", err.message);
            }
        }

        // 2. If token is standard JWT
        try {
            const jwtDecoded = jwt.verify(token, process.env.JWT_SECRET || "foodexpress_secret_jwt_key_2025");
            req.jwtUser = jwtDecoded;
            req.firebaseUser = {
                uid: jwtDecoded.id || jwtDecoded.uid,
                email: jwtDecoded.email,
                email_verified: true
            };
            return next();
        } catch (jwtErr) {
            // Not a local JWT, check if it's a Firebase ID token
        }

        // 3. Fallback: decode JWT payload if Firebase Admin is not configured
        const parts = token.split(".");
        if (parts.length === 3) {
            try {
                const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
                if (payload.user_id || payload.sub) {
                    req.firebaseUser = {
                        uid: payload.user_id || payload.sub,
                        email: payload.email,
                        email_verified: Boolean(payload.email_verified)
                    };
                    return next();
                }
            } catch (decodeErr) {
                // fall through
            }
        }

        return res.status(401).json({
            success: false,
            message: "Invalid Authentication Token"
        });
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Authentication error: " + err.message
        });
    }
};

export default firebaseAuth;