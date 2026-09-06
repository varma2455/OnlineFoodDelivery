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
==================================================
                    CART ROUTES
==================================================
All cart routes require the user to be authenticated.
The logged-in user is identified through the JWT token.
*/


/*
==================================================
ADD ITEM TO CART

POST /api/cart/add

Used by:
- Pizza
- Burger
- Biryani
- Noodles
- Salads
- Fast Food
- Drinks
- Desserts

Stores:
- User
- Food
- Food type
- Customization
- Quantity
- Price
- Subtotal
==================================================
*/

router.post(
    "/add",
    protect,
    addToCart
);


/*
==================================================
GET USER CART

GET /api/cart

Returns all cart items belonging to the
currently logged-in user.
==================================================
*/

router.get(
    "/",
    protect,
    getCart
);


/*
==================================================
GET CART SUMMARY

GET /api/cart/summary

Returns:
- Total items
- Total price
- Other cart summary information
==================================================
*/

router.get(
    "/summary",
    protect,
    getCartSummary
);


/*
==================================================
UPDATE CART ITEM

PUT /api/cart/:id

Used to update the quantity of a particular
cart item.

Example:

PUT /api/cart/67abc123
==================================================
*/

router.put(
    "/:id",
    protect,
    updateCartItem
);


/*
==================================================
REMOVE CART ITEM

DELETE /api/cart/:id

Removes one cart item belonging to the
logged-in user.
==================================================
*/

router.delete(
    "/:id",
    protect,
    removeCartItem
);


/*
==================================================
CLEAR CART

DELETE /api/cart/clear/all

Removes all cart items belonging to the
currently logged-in user.
==================================================
*/

router.delete(
    "/clear/all",
    protect,
    clearCart
);


export default router;