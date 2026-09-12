import Cart from "../models/Cart.js";
import Food from "../models/Food.js";
import Offer from "../models/Offer.js";
import mongoose from "mongoose";
import { validateAndCalculateCustomization } from "../utils/customizationConfig.js";

/**
 * Helper to deeply compare two customization objects
 */
const areCustomizationsEqual = (c1 = {}, c2 = {}) => {
    if (!c1 && !c2) return true;
    if (!c1 || !c2) return false;

    const scalarFields = [
        "size", "crust", "bun", "rice", "spice",
        "noodlesType", "dressing", "iceLevel",
        "sugarLevel", "milkOption", "portion", "topping"
    ];

    for (const f of scalarFields) {
        const v1 = c1[f] || null;
        const v2 = c2[f] || null;
        if (v1 !== v2) return false;
    }

    const arrayFields = ["toppings", "extras"];
    for (const f of arrayFields) {
        const arr1 = Array.isArray(c1[f]) ? [...c1[f]].sort() : [];
        const arr2 = Array.isArray(c2[f]) ? [...c2[f]].sort() : [];
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
    }

    return true;
};

/**
 * Add Item to Cart
 * POST /api/cart/add
 */
export const addToCart = async (req, res, next) => {
    try {
        const {
            foodId,
            foodType,
            customization = {},
            quantity = 1,
            price: customPrice
        } = req.body;

        if (!foodId) {
            return res.status(400).json({
                success: false,
                message: "Food ID is required."
            });
        }

        // Find food by ObjectId or name
        let food = null;
        if (mongoose.Types.ObjectId.isValid(foodId)) {
            food = await Food.findById(foodId);
        }
        if (!food && req.body.foodName) {
            food = await Food.findOne({ name: req.body.foodName });
        }
        if (!food && typeof foodId === "string") {
            food = await Food.findOne({ name: foodId });
        }

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        const qty = Math.max(1, Number(quantity) || 1);

        // Validate customization & calculate authoritative price
        const valResult = validateAndCalculateCustomization(food, customization);
        if (!valResult.isValid) {
            return res.status(400).json({
                success: false,
                message: valResult.message || "Invalid customization selection."
            });
        }

        const unitPrice = valResult.unitPrice;
        const sanitizedCustomization = valResult.sanitizedCustomization;
        sanitizedCustomization.quantity = qty;
        const subtotal = unitPrice * qty;

        // Check if an identical customized item already exists in user's cart
        const existingItems = await Cart.find({
            user: req.user._id,
            food: food._id
        });

        // ONLY match if customizations are strictly identical
        const matchedItem = existingItems.find(item => areCustomizationsEqual(item.customization, sanitizedCustomization));

        let cart;
        if (matchedItem) {
            matchedItem.quantity = (matchedItem.quantity || 1) + qty;
            matchedItem.price = unitPrice;
            matchedItem.subtotal = matchedItem.price * matchedItem.quantity;
            matchedItem.customization = sanitizedCustomization;
            cart = await matchedItem.save();
        } else {
            cart = await Cart.create({
                user: req.user._id,
                food: food._id,
                foodType: foodType || food.category,
                customization: sanitizedCustomization,
                quantity: qty,
                price: unitPrice,
                subtotal
            });
        }

        return res.status(201).json({
            success: true,
            message: "Item added to cart successfully.",
            cart
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get User Cart
 * GET /api/cart
 */
export const getCart = async (req, res, next) => {
    try {
        const cartItems = await Cart.find({
            user: req.user._id
        }).populate("food");

        // Filter out null foods if any were deleted
        const validItems = cartItems.filter(item => item.food !== null);

        let totalAmount = 0;
        let totalQuantity = 0;

        validItems.forEach(item => {
            totalAmount += item.subtotal;
            totalQuantity += item.quantity;
        });

        return res.status(200).json({
            success: true,
            totalItems: validItems.length,
            totalQuantity,
            totalAmount,
            cart: validItems,
            cartItems: validItems,
            items: validItems
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update Cart Item Quantity
 * PUT /api/cart/:id
 */
export const updateCartItem = async (req, res, next) => {
    try {
        const { quantity } = req.body;

        if (quantity === undefined || Number(quantity) < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1."
            });
        }

        let cartItem = null;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            cartItem = await Cart.findOne({
                _id: req.params.id,
                user: req.user._id
            }).populate("food");

            if (!cartItem) {
                cartItem = await Cart.findOne({
                    food: req.params.id,
                    user: req.user._id
                }).populate("food");
            }
        }

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found."
            });
        }

        cartItem.quantity = Number(quantity);
        cartItem.subtotal = cartItem.price * cartItem.quantity;
        await cartItem.save();

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully.",
            cartItem
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove Cart Item
 * DELETE /api/cart/:id
 */
export const removeCartItem = async (req, res, next) => {
    try {
        let cartItem = null;
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            cartItem = await Cart.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            });

            if (!cartItem) {
                cartItem = await Cart.findOneAndDelete({
                    food: req.params.id,
                    user: req.user._id
                });
            }
        }

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Item removed from cart."
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Clear User Cart
 * DELETE /api/cart/clear/all and /api/cart/clear
 */
export const clearCart = async (req, res, next) => {
    try {
        await Cart.deleteMany({
            user: req.user._id
        });

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully."
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get Cart Summary
 * GET /api/cart/summary
 */
export const getCartSummary = async (req, res, next) => {
    try {
        const cartItems = await Cart.find({
            user: req.user._id
        }).populate("food");

        const validItems = cartItems.filter(item => item.food !== null);

        let subtotal = 0;
        let totalQuantity = 0;

        validItems.forEach(item => {
            subtotal += item.subtotal;
            totalQuantity += item.quantity;
        });

        const couponCode = (req.query.coupon || "").toUpperCase().trim();
        let discount = 0;
        let couponApplied = false;

        if (couponCode) {
            const dbOffer = await Offer.findOne({
                code: couponCode,
                isActive: true,
                expiryDate: { $gt: new Date() }
            });

            if (dbOffer && subtotal >= (dbOffer.minimumOrderValue || 0)) {
                if (dbOffer.discountType === "percentage") {
                    const raw = Math.round(subtotal * (dbOffer.discountValue / 100));
                    discount = dbOffer.maximumDiscount > 0 ? Math.min(raw, dbOffer.maximumDiscount) : raw;
                } else if (dbOffer.discountType === "flat") {
                    discount = Math.min(dbOffer.discountValue, subtotal);
                } else if (dbOffer.discountType === "free_delivery") {
                    discount = 40;
                } else {
                    discount = dbOffer.discountValue;
                }
                couponApplied = true;
            } else if (couponCode === "FIRST30") {
                discount = Math.min(Math.round(subtotal * 0.30), 200);
                couponApplied = true;
            } else if (couponCode === "FOOD20") {
                discount = Math.min(Math.round(subtotal * 0.20), 150);
                couponApplied = true;
            } else if (couponCode === "FREEDEL") {
                discount = 40;
                couponApplied = true;
            }
        } else if (subtotal >= 1000) {
            discount = Math.floor(subtotal * 0.10);
        }

        const deliveryCharge = subtotal > 500 || subtotal === 0 ? 0 : 40;
        const total = Math.max(0, subtotal + deliveryCharge - discount);

        return res.status(200).json({
            success: true,
            summary: {
                items: validItems.length,
                totalQuantity,
                subtotal,
                deliveryCharge,
                discount,
                couponCode: couponApplied ? couponCode : "",
                couponApplied,
                total
            },
            cartItems: validItems
        });
    } catch (error) {
        next(error);
    }
};
