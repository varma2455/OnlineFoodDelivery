import express from "express";
import {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    changePassword,
    logoutUser,
    toggleFavorite,
    getSavedAddresses,
    addSavedAddress,
    updateSavedAddress,
    setDefaultSavedAddress,
    deleteSavedAddress
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import firebaseAuth from "../middleware/firebaseAuth.js";

const router = express.Router();

// Optional firebase auth: inspects Bearer token if present
const optionalAuthHeader = (req, res, next) => {
    if (req.headers.authorization) {
        return firebaseAuth(req, res, next);
    }
    next();
};

// Register & Login (support both Firebase ID token in header and email/password in body)
router.post("/register", optionalAuthHeader, registerUser);
router.post("/login", optionalAuthHeader, loginUser);
router.post("/logout", protect, logoutUser);

// Profile
router.get("/profile", protect, getProfile);
router.get("/me", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Favorites / Wishlist
router.post("/favorites/toggle", protect, toggleFavorite);

// Saved Addresses
router.get("/addresses", protect, getSavedAddresses);
router.post("/addresses", protect, addSavedAddress);
router.put("/addresses/:addressId", protect, updateSavedAddress);
router.put("/addresses/:addressId/default", protect, setDefaultSavedAddress);
router.delete("/addresses/:addressId", protect, deleteSavedAddress);

export default router;
