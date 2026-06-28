import express from "express";

import {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    changePassword,
    logoutUser
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
===========================================
Authentication Routes
===========================================
*/

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logout
router.post("/logout", protect, logoutUser);

// Get Logged-in User Profile
router.get("/profile", protect, getProfile);

// Update Profile
router.put("/profile", protect, updateProfile);

// Change Password
router.put("/change-password", protect, changePassword);

export default router;