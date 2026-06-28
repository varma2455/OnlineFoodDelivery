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
            expiresIn: process.env.JWT_EXPIRE,
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

        const {
            fullName,
            email,
            password,
            phone,
            address,
        } = req.body;

        // ==========================
        // Validation
        // ==========================

        if (
            !fullName ||
            !email ||
            !password ||
            !phone ||
            !address
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields.",
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters.",
            });
        }

        // ==========================
        // Existing User
        // ==========================

        const existingUser = await User.findOne({
            email: email.toLowerCase(),
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered.",
            });
        }

        // ==========================
        // Hash Password
        // ==========================

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            password,
            salt
        );

        // ==========================
        // Create User
        // ==========================

        const user = await User.create({
            fullName,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone,
            address,
        });

        // ==========================
        // Generate JWT
        // ==========================

        const token = generateToken(user._id);

        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                profileImage: user.profileImage,
            },
        });

    } catch (error) {
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

       const { email, password } = req.body;

       // ==========================
       // Validation
       // ==========================

       if (!email || !password) {
           return res.status(400).json({
               success: false,
               message: "Email and password are required.",
           });
       }

       if (!validator.isEmail(email)) {
           return res.status(400).json({
               success: false,
               message: "Invalid email address.",
           });
       }

       // ==========================
       // Find User
       // ==========================

       const user = await User.findOne({
           email: email.toLowerCase(),
       }).select("+password");

       if (!user) {
           return res.status(401).json({
               success: false,
               message: "Invalid email or password.",
           });
       }

       // ==========================
       // Check Account Status
       // ==========================

       if (user.isBlocked) {
           return res.status(403).json({
               success: false,
               message: "Your account has been blocked. Contact the administrator.",
           });
       }

       // ==========================
       // Verify Password
       // ==========================

       const isPasswordCorrect = await bcrypt.compare(
           password,
           user.password
       );

       if (!isPasswordCorrect) {
           return res.status(401).json({
               success: false,
               message: "Invalid email or password.",
           });
       }

       // ==========================
       // Generate JWT
       // ==========================

       const token = generateToken(user._id);

       // ==========================
       // Remove Password
       // ==========================

       user.password = undefined;

       return res.status(200).json({
           success: true,
           message: "Login successful.",
           token,
           user,
       });

   } catch (error) {
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

        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
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

        const {
            fullName,
            phone,
            address,
            profileImage
        } = req.body;

        const user = await User.findById(req.user._id);

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
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        next(error);
    }
};
/**
 * ===========================================
 * Change Password
 * PUT /api/auth/change-password
 * ===========================================
 */

export const changePassword = async (req, res, next) => {
    try {

        const {
            currentPassword,
            newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required."
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters."
            });
        }

        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect."
            });
        }

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(
            newPassword,
            salt
        );

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully."
        });

    } catch (error) {
        next(error);
    }
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

        return res.status(200).json({
            success: true,
            message: "Logged out successfully."
        });

    } catch (error) {
        next(error);
    }
};