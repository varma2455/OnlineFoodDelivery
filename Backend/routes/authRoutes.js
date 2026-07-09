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
import firebaseAuth from "../middleware/firebaseAuth.js";


const router = express.Router();

/*
===========================================
Authentication Routes
===========================================
*/

// Register
router.post("/register", firebaseAuth, registerUser);

// Login
router.post("/login", firebaseAuth, loginUser);

// Logout
router.post("/logout", firebaseAuth, logoutUser);

// Get Logged-in User Profile
router.get("/profile", firebaseAuth, (req, res) => {

    console.log(req.firebaseUser);

    res.json({
        success: true,
        firebaseUser: req.firebaseUser
    });

});

// Update Profile
router.put("/profile", firebaseAuth, updateProfile);

// Change Password
router.put("/change-password", firebaseAuth, changePassword);

export default router;