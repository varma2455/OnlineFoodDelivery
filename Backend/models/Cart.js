import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        // Logged-in user
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },

        // Food document from MongoDB
        food: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Food",
            required: [true, "Food item is required"],
        },

        // Food category
        foodType: {
            type: String,
            required: true,
            enum: [
                "Pizza",
                "Burger",
                "Biryani",
                "Noodles",
                "Salad",
                "Fast Food",
                "Drink",
                "Dessert",
            ],
        },

        // Customized options
        customization: {
            // Common
            size: {
                type: String,
                default: null,
            },

            quantity: {
                type: Number,
                default: 1,
                min: 1,
            },

            // Pizza
            crust: {
                type: String,
                default: null,
            },

            toppings: {
                type: [String],
                default: [],
            },

            // Burger
            bun: {
                type: String,
                default: null,
            },

            // Biryani
            rice: {
                type: String,
                default: null,
            },

            spice: {
                type: String,
                default: null,
            },

            // Noodles
            noodlesType: {
                type: String,
                default: null,
            },

            // Salad
            dressing: {
                type: String,
                default: null,
            },

            // Drinks
            iceLevel: {
                type: String,
                default: null,
            },

            sugarLevel: {
                type: String,
                default: null,
            },

            milkOption: {
                type: String,
                default: null,
            },

            // Fast Food
            portion: {
                type: String,
                default: null,
            },

            // Dessert
            topping: {
                type: String,
                default: null,
            },

            // Common extras
            extras: {
                type: [String],
                default: [],
            },
        },

        // Price of one customized item
        price: {
            type: Number,
            required: true,
            min: 0,
        },

        // price × quantity
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;