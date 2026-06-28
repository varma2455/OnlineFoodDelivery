import Cart from "../models/Cart.js";
import Food from "../models/Food.js";

/**
 * ===========================================
 * Add Item to Cart
 * POST /api/cart/add
 * ===========================================
 */

export const addToCart = async (req, res, next) => {
    try {

        const { foodId, quantity } = req.body;

        if (!foodId) {
            return res.status(400).json({
                success: false,
                message: "Food ID is required."
            });
        }

        const food = await Food.findById(foodId);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found."
            });
        }

        const qty = Number(quantity) || 1;

        // Check if item already exists
        const existingItem = await Cart.findOne({
            user: req.user._id,
            food: foodId
        });

        if (existingItem) {

            existingItem.quantity += qty;
            existingItem.subtotal =
                existingItem.quantity * existingItem.price;

            await existingItem.save();

            return res.status(200).json({
                success: true,
                message: "Cart updated successfully.",
                cart: existingItem
            });
        }

        // Create new cart item
        const cart = await Cart.create({
            user: req.user._id,
            food: food._id,
            quantity: qty,
            price: food.price,
            subtotal: qty * food.price
        });

        return res.status(201).json({
            success: true,
            message: "Item added to cart.",
            cart
        });

    } catch (error) {
        next(error);
    }
};

/**
 * ===========================================
 * Get User Cart
 * GET /api/cart
 * ===========================================
 */

export const getCart = async (req, res, next) => {
    try {

        const cartItems = await Cart.find({
            user: req.user._id
        }).populate("food");

        let totalAmount = 0;

        cartItems.forEach(item => {
            totalAmount += item.subtotal;
        });

        return res.status(200).json({
            success: true,
            totalItems: cartItems.length,
            totalAmount,
            cartItems
        });

    } catch (error) {
        next(error);
    }
};

/**
 * ===========================================
 * Update Cart Item Quantity
 * PUT /api/cart/:id
 * ===========================================
 */

export const updateCartItem = async (req, res, next) => {
    try {

        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1."
            });
        }

        const cartItem = await Cart.findOne({
            _id: req.params.id,
            user: req.user._id
        });

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
 * ===========================================
 * Remove Cart Item
 * DELETE /api/cart/:id
 * ===========================================
 */

export const removeCartItem = async (req, res, next) => {
    try {

        const cartItem = await Cart.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found."
            });
        }

        await Cart.findByIdAndDelete(cartItem._id);

        return res.status(200).json({
            success: true,
            message: "Item removed from cart."
        });

    } catch (error) {
        next(error);
    }
};

/**
 * ===========================================
 * Clear User Cart
 * DELETE /api/cart/clear
 * ===========================================
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
 * ===========================================
 * Cart Summary
 * GET /api/cart/summary
 * ===========================================
 */

export const getCartSummary = async (req, res, next) => {
    try {

        const cartItems = await Cart.find({
            user: req.user._id
        }).populate("food");

        let subtotal = 0;

        cartItems.forEach(item => {
            subtotal += item.subtotal;
        });

        const deliveryCharge = subtotal > 500 ? 0 : 40;

        const discount = subtotal >= 1000
            ? Math.floor(subtotal * 0.10)
            : 0;

        const total = subtotal + deliveryCharge - discount;

        return res.status(200).json({
            success: true,
            summary: {
                items: cartItems.length,
                subtotal,
                deliveryCharge,
                discount,
                total
            },
            cartItems
        });

    } catch (error) {
        next(error);
    }
};