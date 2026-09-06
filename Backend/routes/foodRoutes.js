import express from "express";

import {
    addFood,
    getAllFoods,
    getFoodById,
    updateFood,
    deleteFood,
    searchFoods,
    getFoodsByCategory,
    getFeaturedFoods,
    getLatestFoods,
    getPopularFoods,
    getRelatedFoods
} from "../controllers/foodController.js";

import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/*
===========================================
Public Routes
===========================================
*/

// Get All Foods
router.get("/", getAllFoods);

// Search Foods
router.get("/search", searchFoods);

// Featured Foods
router.get("/featured", getFeaturedFoods);

// Latest Foods
router.get("/latest", getLatestFoods);

// Popular Foods
router.get("/popular", getPopularFoods);

// Foods By Category
router.get("/category/:category", getFoodsByCategory);

// Related Foods
router.get("/:id/related", getRelatedFoods);

// Food Details
router.get("/:id", getFoodById);

/*
===========================================
Admin Routes
===========================================
*/

// Add Food
router.post(
    "/",
    protect,
    isAdmin,
    upload.single("image"),
    addFood
);

// Update Food
router.put(
    "/:id",
    protect,
    isAdmin,
    upload.single("image"),
    updateFood
);

// Delete Food
router.delete(
    "/:id",
    protect,
    isAdmin,
    deleteFood
);

export default router;