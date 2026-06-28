import express from "express";

import {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    getCartSummary
} from "../controllers/cartController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
===========================================
Cart Routes
(All routes require authentication)
===========================================
*/

// Add Item to Cart
router.post("/add", protect, addToCart);

// Get User Cart
router.get("/", protect, getCart);

// Cart Summary
router.get("/summary", protect, getCartSummary);

// Update Cart Item Quantity
router.put("/:id", protect, updateCartItem);

// Remove Item From Cart
router.delete("/:id", protect, removeCartItem);

// Clear Cart
router.delete("/clear/all", protect, clearCart);

export default router;