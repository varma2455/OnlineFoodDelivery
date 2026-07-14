import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

import User from "../models/User.js";

/**
 * ===========================================
 * Generate JWT Token
 * ===========================================
 */

const generateToken = (userId) => {
    return jwt.sign(
        {
            id: userId,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

/**
 * ===========================================
 * Register New User
 * POST /api/auth/register
 * ===========================================
 */

export const registerUser = async (req, res, next) => {

    try {

        console.log("Firebase User:", req.firebaseUser);
        console.log("Body:", req.body);

        const firebaseUid = req.firebaseUser.uid;
        const email = req.firebaseUser.email;

        const {
            fullName,
            phone,
            address
        } = req.body;
        

        // Firebase UID comes from the verified token
        

        // ==========================
        // Validation
        // ==========================

        if (
            !firebaseUid ||
            !fullName ||
            !email ||
            !phone ||
            !address
        ) {

            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });

        }

        if (!validator.isEmail(email)) {

            return res.status(400).json({
                success: false,
                message: "Invalid email address."
            });

        }

        // ==========================
        // Check Existing User
        // ==========================

        const existingUser = await User.findOne({
            firebaseUid
        });

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "User already exists."
            });

        }

        // ==========================
        // Create MongoDB User
        // ==========================

        const user = await User.create({

            firebaseUid,

            fullName,

            email,

            phone,

            address,

            role: "customer",

            isVerified: req.firebaseUser.email_verified

        });

        const token = generateToken(user._id);

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user
        });

    }

    catch (error) {

        next(error);

    }

};/**
* ===========================================
* Login User
* POST /api/auth/login
* ===========================================
*/

export const loginUser = async (req, res, next) => {

    try {

        // Firebase middleware already verified the token
        const firebaseUid = req.firebaseUser.uid;

        // Find user in MongoDB
        const user = await User.findOne({
            firebaseUid
        });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        // Check account status
        if (user.isBlocked) {

            return res.status(403).json({
                success: false,
                message: "Your account has been blocked."
            });
        
        }
        
        user.isVerified = req.firebaseUser.email_verified;
        
        await user.save();
        
        const token = generateToken(user._id);
        
        return res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user
        });

    }

    catch (error) {

        next(error);

    }

};
/**
 * ===========================================
 * Get Logged-in User Profile
 * GET /api/auth/profile
 * ===========================================
 */

export const getProfile = async (req, res, next) => {

    try {

        const firebaseUid = req.firebaseUser.uid;

        const user = await User.findOne({
            firebaseUid
        });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        res.status(200).json({

            success: true,

            user

        });

    }

    catch (error) {

        next(error);

    }

};
/**
 * ===========================================
 * Update User Profile
 * PUT /api/auth/profile
 * ===========================================
 */

export const updateProfile = async (req, res, next) => {

    try {

        const firebaseUid = req.firebaseUser.uid;

        const {
            fullName,
            phone,
            address,
            profileImage
        } = req.body;

        // Find user using Firebase UID
        const user = await User.findOne({
            firebaseUid
        });

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        // =============================
        // Update Fields
        // =============================

        if (fullName) {

            if (fullName.trim().length < 3) {

                return res.status(400).json({
                    success: false,
                    message: "Full name must contain at least 3 characters."
                });

            }

            user.fullName = fullName.trim();

        }

        if (phone) {

            user.phone = phone.trim();

        }

        if (address) {

            user.address = address.trim();

        }

        if (profileImage) {

            user.profileImage = profileImage;

        }

        await user.save();

        return res.status(200).json({

            success: true,

            message: "Profile updated successfully.",

            user: {

                id: user._id,

                firebaseUid: user.firebaseUid,

                fullName: user.fullName,

                email: user.email,

                phone: user.phone,

                address: user.address,

                role: user.role,

                profileImage: user.profileImage

            }

        });

    }

    catch (error) {

        next(error);

    }

};
/**
 * ===========================================
 * Change Password
 * PUT /api/auth/change-password
 * ===========================================
 */

export const changePassword = async (req, res) => {

    return res.status(400).json({

        success: false,

        message: "Password changes are managed by Firebase Authentication."

    });

};

/**
 * ===========================================
 * Logout User
 * POST /api/auth/logout
 * ===========================================
 */

export const logoutUser = async (req, res, next) => {
    try {

        res.clearCookie("token");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return res.status(200).json({
            success: true,
            message: "Logged out successfully."
        });

    } catch (error) {
        next(error);
    }
};